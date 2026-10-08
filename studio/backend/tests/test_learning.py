"""长期能力路由直接委托当前公开 SDK。"""

import asyncio
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from iris.evolution import PublicationHistoryEntry, PublicationSummary
from iris.memory import MemoryHistoryCursor
from iris.memory.history import MemoryHistoryPage

from iris_studio.learning import (
    evolution_publication,
    maintenance_view,
    memory_episodes,
    request_memory_cycle,
)


def test_memory_pagination_passes_typed_cursor_to_sdk():
    cursor = MemoryHistoryCursor("2026-01-01", "old")
    service = SimpleNamespace(alist_episodes=AsyncMock(return_value=MemoryHistoryPage((), cursor)))
    host = SimpleNamespace(
        resources={
            "res": SimpleNamespace(memory=SimpleNamespace(service=service, namespace="exact"))
        }
    )
    page = asyncio.run(
        memory_episodes("res", host, after='{"created_at":"2026-01-01","id":"old"}', limit=7)
    )
    service.alist_episodes.assert_awaited_once_with("exact", after=cursor, limit=7)
    assert page.next_cursor == '{"created_at":"2026-01-01","id":"old"}'


def test_expired_evolution_detail_is_returned_not_404():
    entry = PublicationHistoryEntry(
        summary=PublicationSummary(
            publication_id="p",
            revision_id=None,
            created_at=datetime.now(UTC),
            stage="experience",
            origin="experience",
            description="old",
            targets=(),
            status="updated",
            publication_state="confirmed",
            reason="",
            published_at=None,
            settled=True,
            detail_status="expired",
        ),
        detail=None,
    )
    service = SimpleNamespace(aget_publication=AsyncMock(return_value=entry))
    host = SimpleNamespace(
        resources={"res": SimpleNamespace(evolution=SimpleNamespace(service=service))}
    )
    assert asyncio.run(evolution_publication("res", "p", host)) is entry


def test_maintenance_uses_coordinator_snapshot_and_request_owner():
    resource = SimpleNamespace(
        resource_ref="memory:exact",
        pending_new_runs=9,
        min_pending_runs=10,
        state="waiting_for_materials",
        next_eligible_at=None,
    )
    binding = object()
    coordinator = SimpleNamespace(
        snapshot=lambda: SimpleNamespace(
            coordinator_id="c", revision=2, foreground_count=0, resources=(resource,)
        ),
        request_memory_cycle=AsyncMock(return_value="cycle"),
    )
    operations = []

    def operation(kind, awaitable, request_id=None):
        operations.append((kind, request_id))
        return asyncio.create_task(awaitable)

    host = SimpleNamespace(
        resources={
            "res": SimpleNamespace(ref=SimpleNamespace(resource_ref="memory:exact"), memory=binding)
        },
        coordinator=coordinator,
        operation=operation,
    )
    view = maintenance_view("res", host)
    assert view["resource"] is resource
    from iris_studio.learning import RequestBody

    async def execute():
        task = await request_memory_cycle("res", RequestBody(request_id="request"), host)
        return await task

    assert asyncio.run(execute()) == "cycle"
    assert operations == [("maintenance", "request")]
    coordinator.request_memory_cycle.assert_awaited_once_with(binding)


@pytest.mark.asyncio
async def test_todo_uses_registered_workspace_and_detects_external_edit(tmp_path):
    from iris_studio.contracts import HostError
    from iris_studio.learning import TodoEditBody, todo_document, todo_edit
    from iris_studio.metadata import MetadataStore

    metadata = MetadataStore(tmp_path / "host.sqlite3")
    metadata.put("sessions", "b/s", {"workspace_root": str(tmp_path), "todo_enabled": True})
    lock = asyncio.Lock()
    host = SimpleNamespace(
        owners={},
        metadata=metadata,
        binding=lambda value: None,
        session_lock=lambda binding, session: lock,
    )
    empty = await todo_document("b", "s", host)
    assert empty.data.text is None
    written = await todo_edit("b", "s", TodoEditBody(base_text=None, text="- [ ] 完成测试\n"), host)
    assert written.snapshot.items[0].content == "完成测试"
    written.snapshot.path.write_text("- [x] 外部完成\n", encoding="utf-8")
    with pytest.raises(HostError) as error:
        await todo_edit("b", "s", TodoEditBody(base_text=written.text, text="- [ ] 覆盖\n"), host)
    assert error.value.error.code == "DOCUMENT_CONFLICT"
    assert "外部完成" in written.snapshot.path.read_text(encoding="utf-8")
    metadata.close()


def test_real_memory_pagination_and_historical_publication_http(tmp_path):
    from iris.memory import (
        FileMemoryMirror,
        MemoryItemPatch,
        MemoryService,
        MemoryWriteInput,
        SQLiteMemoryStore,
    )

    from iris_studio.learning import router

    service = MemoryService(
        SQLiteMemoryStore(tmp_path / "memory.db"), mirror=FileMemoryMirror(tmp_path / "mirror")
    )
    item = service.remember(MemoryWriteInput(text="original", reason="test"))
    publication = service.list_publications("project").items[0]
    service.update(item.id, "project", MemoryItemPatch(text="later"), reason="edit")
    host = SimpleNamespace(
        resources={
            "res": SimpleNamespace(memory=SimpleNamespace(service=service, namespace="project"))
        }
    )
    app = FastAPI()
    app.state.host = host
    app.include_router(router)
    with TestClient(app) as client:
        first = client.get("/api/resources/res/memory/publications", params={"limit": 1})
        assert first.status_code == 200
        after = first.json()["next_cursor"]
        second = client.get(
            "/api/resources/res/memory/publications", params={"limit": 1, "after": after}
        )
        assert second.status_code == 200
        assert second.json()["items"][0]["item_revision"] == 2
        old = client.get(
            f"/api/resources/res/memory/publications/{publication.publication_id}"
        ).json()
        assert "original" in "".join(document["text"] for document in old["documents"])
        assert "later" not in "".join(document["text"] for document in old["documents"])


def test_readonly_memory_resource_cannot_start_maintenance():
    from iris_studio.contracts import HostError

    host = SimpleNamespace(
        resources={"res": SimpleNamespace(ref=SimpleNamespace(resource_ref="memory:exact"))},
        coordinator=None,
    )
    with pytest.raises(HostError) as error:
        maintenance_view("res", host)
    assert error.value.error.code == "CAPABILITY_DISABLED"


@pytest.mark.asyncio
async def test_historical_goal_with_only_navigation_metadata_reads_durable_state(
    tmp_path: Path,
) -> None:
    from iris.goal.service import GoalService
    from iris.store import SQLiteStore

    from iris_studio.learning import goal_view
    from iris_studio.metadata import MetadataStore

    store = SQLiteStore(tmp_path / "lifecycle.sqlite3")
    goal = GoalService(store).create("s", "保留真实持久目标")
    metadata = MetadataStore(tmp_path / "host.sqlite3")
    metadata.put(
        "sessions",
        "b/s",
        {"store_binding_id": "b", "session_id": "s", "title": "历史", "forked_from_run_id": None},
    )
    host = SimpleNamespace(
        owners={}, metadata=metadata, binding=lambda value: SimpleNamespace(store=store)
    )
    result = await goal_view("b", "s", host)
    assert result.status == "available"
    assert result.data.goal == goal
    assert result.data.armed is False
    assert store.get_current_goal("s") == goal
    metadata.close()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "known", [{}, {"todo_enabled": True}, {"workspace_root": "unused"}, {"todo_enabled": False}]
)
async def test_historical_todo_distinguishes_unknown_configuration_from_disabled(
    tmp_path: Path, known: dict[str, object]
) -> None:
    from iris_studio.learning import todo_view
    from iris_studio.metadata import MetadataStore

    metadata = MetadataStore(tmp_path / "host.sqlite3")
    metadata.put(
        "sessions",
        "b/s",
        {
            "store_binding_id": "b",
            "session_id": "s",
            "title": "历史",
            "forked_from_run_id": None,
            **known,
        },
    )
    host = SimpleNamespace(owners={}, metadata=metadata, binding=lambda value: None)
    result = await todo_view("b", "s", host)
    assert result.status == ("disabled" if known.get("todo_enabled") is False else "not_collected")
    assert result.data is None
    metadata.close()
