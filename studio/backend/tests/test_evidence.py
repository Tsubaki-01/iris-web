"""实际 typed fact 和标准模型 span 的记录契约。"""

from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from iris.harness.streaming import LineagedLiveFact
from iris.lifecycle.history import RunLineage
from iris.message import ModelResponseStarted, ModelStreamScope
from iris.observability.facts import SourceAdopted
from iris.runtime import RuntimeStreamEvent
from iris.runtime.diagnostics import ContextPreparation, ContextStage
from iris.utils.sources import SourceDocument
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from iris_studio.evidence import EvidenceRecorder


@pytest.fixture
def recorder(tmp_path):
    return EvidenceRecorder(SimpleNamespace(path=tmp_path / "host.sqlite3"))


def test_fact_is_saved_before_notification_and_lineage_is_forwarded(recorder):
    preparation = ContextPreparation(
        "p",
        "config",
        "s",
        "r",
        "a",
        2,
        "ready",
        1000,
        900,
        stages=(ContextStage(0, "selection", "applied"),),
    )
    received = []

    class Broker:
        def publish(self, fact):
            assert (
                recorder.get("preparation", "p", binding_id="b")["stages"][0]["kind"] == "selection"
            )
            received.append(fact)

    lineage = RunLineage(
        root_run_id="root",
        parent_run_id="root",
        parent_tool_call_id="tool",
        root_session_id="root-session",
        child_run_id="r",
        child_session_id="s",
        agent_selector="child",
    )
    wrapped = LineagedLiveFact(preparation, lineage)
    recorder.publisher(Broker(), "b").publish(wrapped)
    assert received == [wrapped]
    assert received[0] is wrapped


def test_model_stream_links_use_exact_run_activation_and_step(recorder):
    publisher = recorder.publisher(SimpleNamespace(publish=lambda fact: None), "b")
    publisher.publish(ContextPreparation("p2", "c", "s", "r", "a", 2, "ready", 1000, 900))
    publisher.publish(ContextPreparation("p3", "c", "s", "r", "a", 3, "ready", 1000, 900))
    event = ModelResponseStarted(
        scope=ModelStreamScope(model_stream_id="stream", provider="test", model="m", attempt=1),
        sequence=1,
        occurred_at=datetime.now(UTC),
        response_id="response",
    )
    publisher.publish(RuntimeStreamEvent("model.event", "r", "s", "a", 2, model_event=event))
    assert recorder.get("model_stream", "stream", binding_id="b")["preparation_id"] == "p2"


def test_source_documents_are_the_original_snapshot(recorder, tmp_path):
    path = tmp_path / "prompt.md"
    path.write_text("later", encoding="utf-8")
    fact = SourceAdopted(
        "ad",
        "runtime",
        "prompt",
        "model",
        datetime.now(UTC),
        (SourceDocument("prompt", str(path), "original"),),
        run_id="r",
    )
    recorder.publisher(SimpleNamespace(publish=lambda fact: None), "b").publish(fact)
    assert recorder.get("source", "ad", binding_id="b")["documents"][0]["text"] == "original"


def test_standard_exporter_preserves_missing_usage_and_truncation(recorder):
    provider = TracerProvider(shutdown_on_exit=False)
    provider.add_span_processor(SimpleSpanProcessor(recorder.span_exporter()))
    with provider.get_tracer("iris").start_as_current_span(
        "chat test",
        attributes={
            "gen_ai.operation.name": "chat",
            "gen_ai.request.model": "test",
            "iris.run.id": "r",
            "iris.lifecycle.source_id": "source",
            "iris.model.outcome": "completed",
            "iris.content.truncated_fields": ["gen_ai.input.messages"],
            "iris.content.gen_ai.input.messages.preview": "[{truncated",
            "gen_ai.output.messages": '[{"role":"assistant","parts":[]}]',
        },
    ):
        pass
    records, _ = recorder.query("model_call", run_id="r")
    record = records[0]
    assert record["summary"]["input_tokens"] is None
    assert record["input"]["status"] == "not_collected"
    assert record["input"]["reason"] == "truncated"
    assert record["output"]["data"][0]["role"] == "assistant"
    assert record["previews"]["gen_ai.input.messages"] == "[{truncated"
    provider.shutdown()


@pytest.mark.asyncio
async def test_iris_provider_wrapper_exports_actual_request_and_response(recorder):
    from iris.message import LLMRequest, LLMResponse, Msg, TextBlock
    from iris.observability import AgentObservabilityConfig
    from iris.observability.provider import observe_provider
    from iris.observability.service import Observability

    class Provider:
        def estimate_input_tokens(self, request):
            return 1

        async def complete(self, request):
            assert request.messages[0].content == "actual user input"
            return LLMResponse(
                provider="deterministic",
                model="actual",
                content=[TextBlock(text="actual output")],
                input_tokens=7,
            )

    provider = TracerProvider(shutdown_on_exit=False)
    provider.add_span_processor(SimpleSpanProcessor(recorder.span_exporter()))
    observation = Observability(
        AgentObservabilityConfig(enabled=True, capture_content=True), provider
    )
    recorder.register_binding("b", "source")
    wrapped = observe_provider(Provider(), observation)
    with observation.bind(
        {"iris.run.id": "r", "iris.lifecycle.source_id": "source", "iris.step.index": 2}
    ):
        await wrapped.complete(
            LLMRequest(model="requested", messages=[Msg.user("actual user input")])
        )
    result = recorder.export_run("b", "r")["model_call"][0]
    assert result["summary"]["source"]["store_binding_id"] == "b"
    assert result["summary"]["request_model"] == "requested"
    assert result["summary"]["response_model"] == "actual"
    assert result["summary"]["input_tokens"] == 7
    assert result["summary"]["output_tokens"] is None
    assert result["output"]["data"][0]["parts"][0]["content"] == "actual output"
    provider.shutdown()


def test_sqlite_evidence_is_readable_after_reopen(recorder):
    recorder.publisher(SimpleNamespace(publish=lambda fact: None), "b").publish(
        ContextPreparation("persisted", "c", "s", "r", "a", 1, "ready", 100, 90)
    )
    reopened = EvidenceRecorder(SimpleNamespace(path=recorder.path.with_name("host.sqlite3")))
    assert reopened.get("preparation", "persisted", binding_id="b")["preparation_id"] == "persisted"


@pytest.mark.asyncio
@pytest.mark.parametrize("capture_content", [False, True])
async def test_real_runner_records_applied_configuration_and_model_evidence(
    recorder, tmp_path, capture_content
):
    from iris.config import init_config, is_config_initialized
    from iris.harness import AgentRunner, AgentRunRequest
    from iris.message import LLMResponse, ModelResponseCompleted, TextBlock
    from iris.observability import AgentObservabilityConfig
    from iris.observability.service import Observability

    if not is_config_initialized():
        init_config()

    class Provider:
        def estimate_input_tokens(self, request):
            return 10

        async def complete(self, request):
            return LLMResponse(provider="deterministic", content=[TextBlock(text="done")])

        async def stream(self, request):
            response = await self.complete(request)
            scope = ModelStreamScope(
                model_stream_id="actual-stream", provider="deterministic", model="actual", attempt=1
            )
            yield ModelResponseStarted(
                scope=scope, sequence=1, occurred_at=datetime.now(UTC), response_id="response"
            )
            yield ModelResponseCompleted(
                scope=scope,
                sequence=2,
                occurred_at=datetime.now(UTC),
                response=response,
                semantic_output_emitted=False,
            )

    config_path = tmp_path / "agent.yaml"
    tracer = TracerProvider(shutdown_on_exit=False)
    tracer.add_span_processor(SimpleSpanProcessor(recorder.span_exporter()))
    observation = Observability(
        AgentObservabilityConfig(enabled=True, capture_content=capture_content), tracer
    )
    config_path.write_text(
        f"name: evidence\nmodel: fake/model\nsystem: original\nobservability:\n  enabled: true\n  capture_content: {str(capture_content).lower()}\n",
        encoding="utf-8",
    )
    runner = AgentRunner.from_config_path(
        config_path,
        provider=Provider(),
        observability=observation,
        live_publisher=recorder.publisher(SimpleNamespace(publish=lambda fact: None), "b"),
    )
    recorder.register_configuration(runner.describe_configuration())
    config_path.write_text("changed after construction", encoding="utf-8")
    await runner.start(AgentRunRequest(input="hello", run_id="recorded-run", session_id="s"))
    records = recorder.export_run("b", "recorded-run")
    assert recorder.write_error is None
    assert (
        records["configuration_adoption"][0]["configuration"]["agent_config"]["system"]
        == "original"
    )
    assert records["preparation"][0]["stages"]
    model = records["model_call"][0]
    assert model["summary"]["source"]["run_id"] == "recorded-run"
    assert model["input"]["status"] == ("available" if capture_content else "disabled")
    assert model["summary"]["preparation_id"] == records["preparation"][0]["preparation_id"]
    await runner.aclose()
    tracer.shutdown()
