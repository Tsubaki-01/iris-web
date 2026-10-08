"""Studio 进程内资源、实例与会话控制的唯一 owner。"""

from __future__ import annotations

import asyncio
import json
import os
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

from fastapi.encoders import jsonable_encoder
from iris.agents import AgentConfig, load_agent_config
from iris.config import get_config, init_config, is_config_initialized
from iris.exceptions import IrisError
from iris.harness import (
    AgentRunner,
    EffectiveConfiguration,
    LivePublisher,
    MaintenanceCoordinator,
    MemoryMaintenanceBinding,
    ProjectEvolutionBinding,
    SessionManager,
    build_project_evolution_binding,
)
from iris.lifecycle import LifecycleStore
from iris.memory import build_memory_service_from_config
from iris.memory.config import resolve_memory_path
from iris.observability.service import Observability
from iris.prompts import PromptSource
from iris.providers import CompletionProvider, create_provider_client
from iris.store import InMemoryLifecycleStore, SQLiteStore
from iris.streaming import LiveStreamBroker
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from .contracts import (
    ApiError,
    GenerationView,
    HostError,
    OperationAccepted,
    OperationView,
    ProfileView,
    RecoverySource,
    ResourceRef,
    SessionRef,
    SessionView,
    StorageBindingView,
)
from .metadata import MetadataStore


def identifier(prefix: str) -> str:
    """生成主机资料的唯一身份。"""
    return f"{prefix}_{uuid4().hex}"


@dataclass(frozen=True, slots=True)
class StorageBinding:
    """唯一存储实例与同 scope broker。"""

    store_binding_id: str
    backend: Literal["memory", "sqlite"]
    resolved_path: str | None
    source_id: str
    store: LifecycleStore
    broker: LiveStreamBroker
    publisher: LivePublisher

    def view(self) -> StorageBindingView:
        """投影不包含进程对象的存储身份。"""
        return StorageBindingView(
            store_binding_id=self.store_binding_id,
            backend=self.backend,
            resolved_path=self.resolved_path,
            source_id=self.source_id,
        )


@dataclass(slots=True)
class ResourceOwner:
    """共享学习服务及其借用者。"""

    ref: ResourceRef
    memory: MemoryMaintenanceBinding | None = None
    evolution: ProjectEvolutionBinding | None = None
    policy: dict[str, Any] = field(default_factory=dict)
    borrowers: set[str] = field(default_factory=set)


@dataclass(slots=True)
class Generation:
    """一次已采用配置，旧会话始终保留此绑定。"""

    generation_id: str
    profile_id: str
    config_revision_id: str
    requested_config_revision_id: str | None
    config: AgentConfig
    config_path: Path
    binding: StorageBinding
    runner: AgentRunner
    configuration: EffectiveConfiguration
    state: Literal["ready", "retiring", "retired"] = "ready"
    resource_refs: list[ResourceRef] = field(default_factory=list)
    recovery_source: RecoverySource | None = None
    admission: asyncio.Lock = field(default_factory=asyncio.Lock)

    def view(self) -> GenerationView:
        """返回真实采用版本与实际注入存储。"""
        return GenerationView(
            generation_id=self.generation_id,
            profile_id=self.profile_id,
            config_revision_id=self.config_revision_id,
            requested_config_revision_id=self.requested_config_revision_id,
            store_binding_id=self.binding.store_binding_id,
            source_id=self.binding.source_id,
            configuration_snapshot_id=self.configuration.configuration_snapshot_id,
            constructed_at=self.configuration.constructed_at,
            state=self.state,
            resource_refs=self.resource_refs,
            recovery_source=self.recovery_source,
        )


@dataclass(frozen=True, slots=True)
class SessionOwner:
    """同一个存储/会话只有一个 exact manager。"""

    generation: Generation
    manager: SessionManager


class StudioHost:
    """单进程事件循环中的配置、存储与任务登记。"""

    def __init__(
        self,
        data_dir: Path,
        *,
        provider_factory: Callable[[AgentConfig], CompletionProvider] | None = None,
    ) -> None:
        self.data_dir = data_dir.resolve()
        self.metadata = MetadataStore(self.data_dir / "metadata.sqlite3")
        from .evidence import EvidenceRecorder

        self.evidence = EvidenceRecorder(self.metadata)
        self.backend_epoch = identifier("backend")
        self.bindings: dict[str, StorageBinding] = {}
        self.generations: dict[str, Generation] = {}
        self.owners: dict[tuple[str, str], SessionOwner] = {}
        self.resources: dict[str, ResourceOwner] = {}
        self.resource_broker = LiveStreamBroker(
            replay_capacity_per_scope=256, subscription_capacity=128
        )
        self.resource_publisher = self.evidence.publisher(self.resource_broker, None)
        self.coordinator: MaintenanceCoordinator | None = None
        self.coordinator_borrowers: set[str] = set()
        self.operations: dict[str, OperationView] = {}
        self.tasks: set[asyncio.Task[Any]] = set()
        self.operation_tasks: dict[asyncio.Task[Any], OperationView] = {}
        self._binding_paths: dict[str, str] = {}
        self._resource_keys: dict[tuple[str, ...], str] = {}
        self._registry = asyncio.Lock()
        self._session_locks: dict[tuple[str, str], asyncio.Lock] = {}
        self._closing = False
        self.provider_factory = provider_factory
        self.tracer_provider = TracerProvider(shutdown_on_exit=False)
        self.tracer_provider.add_span_processor(SimpleSpanProcessor(self.evidence.span_exporter()))

    async def start(self) -> None:
        """仅重开已登记 SQLite，历史浏览不装配模型。"""
        if not is_config_initialized():
            init_config()
        for item in self.metadata.list("bindings"):
            if item["backend"] == "sqlite":
                self._register_store(
                    SQLiteStore(Path(item["resolved_path"])),
                    item["store_binding_id"],
                    "sqlite",
                    item["resolved_path"],
                )

    def binding(self, binding_id: str) -> StorageBinding:
        """查找确切存储；内存库不跨重启恢复。"""
        try:
            return self.bindings[binding_id]
        except KeyError as exc:
            raise HostError(404, "STORE_NOT_FOUND", "存储绑定不存在") from exc

    def generation(self, generation_id: str) -> Generation:
        """只返回当前进程内实际构造的实例。"""
        try:
            return self.generations[generation_id]
        except KeyError as exc:
            raise HostError(404, "GENERATION_NOT_FOUND", "实例不存在或已随后端重启释放") from exc

    def owner(self, binding_id: str, session_id: str) -> SessionOwner:
        """读取已附着的 manager，不隐式恢复。"""
        self.binding(binding_id)
        try:
            return self.owners[(binding_id, session_id)]
        except KeyError as exc:
            raise HostError(409, "SESSION_NOT_ATTACHED", "会话尚未接管，请明确继续或恢复") from exc

    def guard_admission(self, generation: Generation) -> None:
        """在准入锁内阻止退役实例接受新工作。"""
        self.guard_open()
        if generation.state != "ready":
            raise HostError(409, "GENERATION_RETIRING", "实例正在退役或已退役")

    def guard_open(self) -> None:
        """关闭开始后停止新的主机准入。"""
        if self._closing:
            raise HostError(503, "HOST_SHUTTING_DOWN", "后端正在关闭")

    def session_lock(self, binding_id: str, session_id: str) -> asyncio.Lock:
        """串行化 attach/restore/input 的身份登记与准入。"""
        return self._session_locks.setdefault((binding_id, session_id), asyncio.Lock())

    def remember_session(
        self, binding_id: str, session_id: str, forked_from_run_id: str | None
    ) -> dict[str, Any]:
        """导航摘要仅补主机标题和固定分支来源，不复制消息或运行状态。"""
        key = f"{binding_id}/{session_id}"
        saved = self.metadata.get("sessions", key)
        if saved is None:
            saved = {
                "store_binding_id": binding_id,
                "session_id": session_id,
                "title": session_id,
                "forked_from_run_id": forked_from_run_id,
            }
            self.metadata.put("sessions", key, saved)
        return saved

    def session_view(self, binding_id: str, session_id: str) -> SessionView:
        """正常导航只读取窄 header；未知深链一次读取公开历史取得固定来源。"""
        binding = self.binding(binding_id)
        saved = self.metadata.get("sessions", f"{binding_id}/{session_id}")
        header = binding.store.load_session_header(session_id)
        if saved is None:
            snapshot = binding.store.load_session(session_id)
            if (
                header.revision == 0
                and header.message_count == 0
                and snapshot.forked_from_run_id is None
            ):
                raise HostError(404, "SESSION_NOT_FOUND", "会话不存在")
            saved = self.remember_session(binding_id, session_id, snapshot.forked_from_run_id)
        durable = (
            header.revision > 0
            or header.message_count > 0
            or saved.get("forked_from_run_id") is not None
        )
        owner = self.owners.get((binding_id, session_id))
        return SessionView(
            ref=SessionRef(
                store_binding_id=binding_id, source_id=binding.source_id, session_id=session_id
            ),
            title=saved["title"],
            generation_id=owner.generation.generation_id if owner else None,
            has_durable_state=durable,
            forked_from_run_id=saved.get("forked_from_run_id"),
        )

    def register_session(
        self,
        generation: Generation,
        session_id: str,
        title: str,
        *,
        forked_from_run_id: str | None = None,
    ) -> SessionOwner:
        """由已持有准入锁的调用者登记一个 manager。"""
        binding = generation.binding
        owner = SessionOwner(
            generation,
            SessionManager(
                generation.runner,
                session_id,
                submission_publisher=binding.publisher,
                observation_mode="broker_only",
            ),
        )
        self.owners[(binding.store_binding_id, session_id)] = owner
        self.metadata.put(
            "sessions",
            f"{binding.store_binding_id}/{session_id}",
            {
                "store_binding_id": binding.store_binding_id,
                "session_id": session_id,
                "title": title,
                "profile_id": generation.profile_id,
                "forked_from_run_id": forked_from_run_id,
                "workspace_root": str(generation.configuration.workspace_root),
                "todo_enabled": generation.config.todo.enabled,
                "goal_enabled": generation.config.goal.enabled,
            },
        )
        return owner

    def operation(
        self,
        kind: Literal["apply", "retire", "maintenance", "export", "import"],
        awaitable: Awaitable[Any],
        request_id: str | None = None,
    ) -> OperationAccepted:
        """强引用后台操作，浏览器断开不会取消工作。"""
        operation_id = identifier("operation")
        view = OperationView(operation_id=operation_id, backend_epoch=self.backend_epoch, kind=kind)
        self.operations[operation_id] = view

        async def execute() -> None:
            try:
                view.result = jsonable_encoder(await awaitable)
                view.state = "succeeded"
            except HostError as exc:
                view.error = exc.error
                view.state = "failed"
            except IrisError as exc:
                view.error = ApiError(
                    code=exc.runtime_code, message=exc.message, details=exc.context
                )
                view.state = "failed"
            except Exception as exc:  # noqa: BLE001 - 后台操作边界必须记录失败
                view.error = ApiError(code="OPERATION_FAILED", message=str(exc))
                view.state = "failed"

        task = asyncio.create_task(execute())
        self.operation_tasks[task] = view
        task.add_done_callback(self.operation_tasks.pop)
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        return OperationAccepted(
            request_id=request_id or identifier("request"),
            operation_id=operation_id,
            backend_epoch=self.backend_epoch,
            location=f"/api/operations/{operation_id}",
        )

    def _register_store(
        self,
        store: LifecycleStore,
        binding_id: str,
        backend: Literal["memory", "sqlite"],
        path: str | None,
    ) -> StorageBinding:
        broker = LiveStreamBroker(replay_capacity_per_scope=256, subscription_capacity=128)
        binding = StorageBinding(
            binding_id,
            backend,
            path,
            store.source_id,
            store,
            broker,
            self.evidence.publisher(broker, binding_id),
        )
        self.bindings[binding_id] = binding
        self.evidence.register_binding(binding_id, store.source_id)
        if path is not None:
            self._binding_paths[os.path.normcase(str(Path(path).resolve()))] = binding_id
        self.metadata.put("bindings", binding_id, binding.view().model_dump())
        return binding

    def _select_store(self, config: AgentConfig, config_path: Path) -> StorageBinding:
        if config.session.backend == "none":
            return self._register_store(
                InMemoryLifecycleStore(), identifier("store"), "memory", None
            )
        path = (config_path.parent / (config.session.path or ".iris/session.db")).resolve()
        key = os.path.normcase(str(path))
        existing = self._binding_paths.get(key)
        if existing is not None:
            return self.bindings[existing]
        return self._register_store(SQLiteStore(path), identifier("store"), "sqlite", str(path))

    def _discard_new_bindings(self, existing_ids: set[str]) -> None:
        """失败装配仅撤销此次新增且尚无实例采用的 store/broker owner。"""
        for binding_id in self.bindings.keys() - existing_ids:
            binding = self.bindings.pop(binding_id)
            binding.broker.close()
            self.metadata.delete("bindings", binding_id)
            if binding.resolved_path is not None:
                self._binding_paths.pop(os.path.normcase(binding.resolved_path), None)

    async def apply(self, profile_id: str, requested_revision: str) -> GenerationView:
        """原 loader 只读取一次，采用快照决定实际 revision。"""
        self.guard_open()
        raw = self.metadata.get("profiles", profile_id)
        if raw is None:
            raise HostError(404, "PROFILE_NOT_FOUND", "配置入口不存在")
        profile = ProfileView.model_validate(raw)
        path = Path(profile.config_path)
        config = load_agent_config(path)
        async with self._registry:
            self.guard_open()
            existing_ids = set(self.bindings)
            try:
                generation = await self._construct(config, path, profile_id, requested_revision)
            except BaseException:
                self._discard_new_bindings(existing_ids)
                raise
        profile.latest_generation_id = generation.generation_id
        self.metadata.put("profiles", profile_id, profile.model_dump())
        return generation.view()

    async def recover_generation(self, selected: Generation, binding: StorageBinding) -> Generation:
        """保持被选实例不变，独立构造显式覆盖存储的实例。"""
        if selected.binding is binding:
            if selected.state == "retired":
                raise HostError(409, "GENERATION_RETIRING", "已退役实例不能恢复")
            return selected
        self.guard_admission(selected)
        async with self._registry:
            return await self._construct(
                selected.config,
                selected.config_path,
                selected.profile_id,
                selected.config_revision_id,
                binding=binding,
                recovery_source=RecoverySource(
                    selected_generation_id=selected.generation_id,
                    selected_store_binding_id=selected.binding.store_binding_id,
                ),
            )

    def _resource_conflict(self, resource: ResourceOwner, policy: dict[str, Any]) -> None:
        if resource.borrowers and resource.policy != policy:
            raise HostError(
                409,
                "SHARED_RESOURCE_IN_USE",
                "共享学习资源仍由其它实例使用",
                {
                    "conflict_scope": "resource",
                    "coordinator_id": self.coordinator.snapshot().coordinator_id
                    if self.coordinator
                    else None,
                    "resource_refs": [resource.ref.model_dump()],
                    "occupying_generation_ids": sorted(resource.borrowers),
                },
            )

    async def _construct(
        self,
        config: AgentConfig,
        path: Path,
        profile_id: str,
        requested: str,
        *,
        binding: StorageBinding | None = None,
        recovery_source: RecoverySource | None = None,
    ) -> Generation:
        workspace = (path.parent / config.permissions.workspace).resolve()
        coordinated = (
            config.memory.enabled and config.memory.generation.enabled
        ) or config.evolution.enabled
        if (
            coordinated
            and self.coordinator is not None
            and (
                self.coordinator.idle_seconds != config.maintenance.idle_seconds
                or self.coordinator.min_pending_runs != config.maintenance.min_pending_runs
            )
        ):
            raise HostError(
                409,
                "SHARED_RESOURCE_IN_USE",
                "共享协调器的参数仍被实例采用",
                {
                    "conflict_scope": "coordinator",
                    "coordinator_id": self.coordinator.snapshot().coordinator_id,
                    "resource_refs": [],
                    "occupying_generation_ids": sorted(self.coordinator_borrowers),
                },
            )
        resources: list[ResourceOwner] = []
        memory_path = (
            resolve_memory_path(config.memory.path, workspace) if config.memory.enabled else None
        )
        memory_key = ("memory", os.path.normcase(str(memory_path)), config.memory.write_namespace)
        evolution_key = ("evolution", os.path.normcase(str(workspace)))
        memory_policy = {
            "generation": config.memory.generation.model_dump(mode="json"),
            "overview": config.memory.overview.model_dump(mode="json"),
            "root": config.memory.root,
            "prompts": config.prompts.model_dump(mode="json"),
        }
        evolution_policy = {
            "evolution": config.evolution.model_dump(mode="json"),
            "prompts": config.prompts.model_dump(mode="json"),
            "config_path": str(path) if config.evolution.config_targets else None,
        }
        memory_owner = (
            self.resources.get(self._resource_keys.get(memory_key, ""))
            if config.memory.enabled
            else None
        )
        evolution_owner = (
            self.resources.get(self._resource_keys.get(evolution_key, ""))
            if config.evolution.enabled
            else None
        )
        for resource, policy in (
            (memory_owner, memory_policy),
            (evolution_owner, evolution_policy),
        ):
            if resource is not None:
                self._resource_conflict(resource, policy)
        actual_binding = binding or self._select_store(config, path)
        observability = Observability.from_config(
            config.observability, get_config().observability, tracer_provider=self.tracer_provider
        )
        provider = (
            self.provider_factory(config)
            if self.provider_factory
            else create_provider_client(
                config.to_model_route(),
                api_style=config.model.api_style,
                base_url=config.model.base_url,
                timeout=config.model.timeout,
            )
        )
        prompts = PromptSource.initialize(workspace, config.prompts.root)
        memory_service = (
            memory_owner.memory.service
            if memory_owner is not None and memory_owner.memory is not None
            else build_memory_service_from_config(
                config.memory,
                workspace,
                prompt_source=prompts,
                overview_provider=provider,
                overview_model=config.model.name,
                observability=observability,
            )
        )
        memory = (
            MemoryMaintenanceBinding(
                service=memory_service,
                database_path=memory_path,
                namespace=config.memory.write_namespace,
            )
            if memory_service is not None and memory_path is not None
            else None
        )
        evolution = (
            evolution_owner.evolution
            if evolution_owner is not None
            else build_project_evolution_binding(
                config,
                workspace_root=workspace,
                prompt_source=prompts,
                provider=provider,
                config_path=path,
                observability=observability,
            )
        )
        runner = AgentRunner.from_config(
            config,
            config_path=path,
            provider=provider,
            memory_service=memory_service,
            prompt_source=prompts,
            store=actual_binding.store,
            live_publisher=actual_binding.publisher,
            observability=observability,
        )
        created_coordinator = False
        try:
            if coordinated:
                if self.coordinator is None:
                    self.coordinator = MaintenanceCoordinator(
                        idle_seconds=config.maintenance.idle_seconds,
                        min_pending_runs=config.maintenance.min_pending_runs,
                        observability=observability,
                        live_publisher=self.resource_publisher,
                    )
                    created_coordinator = True
                runner.bind_maintenance(
                    self.coordinator,
                    memory=memory if config.memory.generation.enabled else None,
                    evolution=evolution,
                )
            await runner.aprepare()
        except BaseException:
            await runner.aclose()
            if self.coordinator is not None:
                if memory is not None and config.memory.generation.enabled and memory_owner is None:
                    await self.coordinator.unbind_memory(memory)
                if evolution is not None and evolution_owner is None:
                    await self.coordinator.unbind_evolution(evolution)
                if created_coordinator:
                    await self.coordinator.aclose()
                    self.coordinator = None
            raise
        generation_id = identifier("generation")
        if memory is not None:
            if memory_owner is None:
                actual_ref = "memory:" + json.dumps(
                    (os.path.normcase(str(memory.database_path.resolve())), memory.namespace),
                    ensure_ascii=False,
                )
                memory_owner = ResourceOwner(
                    ResourceRef(
                        resource_id=identifier("resource"),
                        resource_ref=actual_ref,
                        kind="memory",
                        display_name=memory.namespace,
                    ),
                    memory=memory,
                    policy=memory_policy,
                )
                self.resources[memory_owner.ref.resource_id] = memory_owner
                self._resource_keys[memory_key] = memory_owner.ref.resource_id
            resources.append(memory_owner)
        if evolution is not None:
            if evolution_owner is None:
                assert self.coordinator is not None
                resource_ref = next(
                    item.resource_ref
                    for item in self.coordinator.snapshot().resources
                    if item.resource_ref == f"evolution:{os.path.normcase(str(workspace))}"
                )
                evolution_owner = ResourceOwner(
                    ResourceRef(
                        resource_id=identifier("resource"),
                        resource_ref=resource_ref,
                        kind="evolution",
                        display_name=workspace.name,
                    ),
                    evolution=evolution,
                    policy=evolution_policy,
                )
                self.resources[evolution_owner.ref.resource_id] = evolution_owner
                self._resource_keys[evolution_key] = evolution_owner.ref.resource_id
            resources.append(evolution_owner)
        if coordinated:
            self.coordinator_borrowers.add(generation_id)
        for resource in resources:
            resource.borrowers.add(generation_id)
            self.evidence.register_resource(resource.ref)
        configuration = runner.describe_configuration()
        self.evidence.register_configuration(configuration)
        generation = Generation(
            generation_id,
            profile_id,
            identifier("revision"),
            requested,
            config,
            path,
            actual_binding,
            runner,
            configuration,
            resource_refs=[resource.ref for resource in resources],
            recovery_source=recovery_source,
        )
        self.generations[generation_id] = generation
        self.metadata.put("generations", generation_id, jsonable_encoder(generation.view()))
        self.metadata.put(
            "configuration_snapshots",
            configuration.configuration_snapshot_id,
            jsonable_encoder(configuration),
        )
        return generation

    async def retire(self, generation: Generation) -> GenerationView:
        """动态等待全部合法恢复的会话，最后收口与恢复登记共用准入锁。"""
        async with generation.admission:
            if generation.state == "retired":
                return generation.view()
            generation.state = "retiring"
            for owner in tuple(self.owners.values()):
                if (
                    owner.generation is generation
                    and generation.config.goal.enabled
                    and (await owner.manager.goal.get()).armed
                ):
                    await owner.manager.goal.pause(reason="实例退役")
        while True:
            async with generation.admission:
                if generation.state == "retired":
                    return generation.view()
                owners = [owner for owner in self.owners.values() if owner.generation is generation]
                blockers = []
                for owner in owners:
                    control = owner.manager.snapshot()
                    lane = generation.binding.store.load_session_lane(control.session_id)
                    if (
                        lane is not None
                        or control.pending
                        or control.driver_state not in {"idle", "closed"}
                    ):
                        blockers.append(
                            {
                                "session_id": control.session_id,
                                "run_id": lane,
                                "driver_state": control.driver_state,
                            }
                        )
                operation = self.operation_tasks.get(asyncio.current_task())
                if operation is not None:
                    operation.blockers = blockers
                if not blockers:
                    async with self._registry:
                        for owner in owners:
                            await owner.manager.close()
                            self.owners.pop(
                                (
                                    generation.binding.store_binding_id,
                                    owner.manager.snapshot().session_id,
                                ),
                                None,
                            )
                        await generation.runner.aclose()
                        for ref in generation.resource_refs:
                            resource = self.resources[ref.resource_id]
                            resource.borrowers.discard(generation.generation_id)
                            if not resource.borrowers:
                                if (
                                    resource.memory is not None
                                    and generation.config.memory.generation.enabled
                                    and self.coordinator is not None
                                ):
                                    await self.coordinator.unbind_memory(resource.memory)
                                if resource.evolution is not None and self.coordinator is not None:
                                    await self.coordinator.unbind_evolution(resource.evolution)
                                self.resources.pop(ref.resource_id)
                                self._resource_keys = {
                                    key: value
                                    for key, value in self._resource_keys.items()
                                    if value != ref.resource_id
                                }
                        self.coordinator_borrowers.discard(generation.generation_id)
                        if self.coordinator is not None and not self.coordinator_borrowers:
                            await self.coordinator.aclose()
                            self.coordinator = None
                        generation.state = "retired"
                        self.metadata.put(
                            "generations",
                            generation.generation_id,
                            jsonable_encoder(generation.view()),
                        )
                    return generation.view()
            await asyncio.sleep(0.1)

    async def close(self) -> None:
        """按协调器、manager、runner、观测、存储顺序排空资源。"""
        self._closing = True
        if self.coordinator is not None:
            await self.coordinator.aclose()
        for owner in tuple(self.owners.values()):
            await owner.manager.close(cancel_run=True, reason="后端关闭")
        if self.tasks:
            await asyncio.gather(*tuple(self.tasks), return_exceptions=True)
        for generation in self.generations.values():
            await generation.runner.aclose()
        self.tracer_provider.force_flush()
        self.tracer_provider.shutdown()
        await self.evidence.close()
        self.resource_broker.close()
        for binding in self.bindings.values():
            binding.broker.close()
        self.metadata.close()
