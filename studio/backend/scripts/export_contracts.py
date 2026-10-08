"""从真实 HTTP 路由与显式 SSE 类型导出前端唯一 schema。"""

from __future__ import annotations

import json
from functools import reduce
from operator import or_
from pathlib import Path
from typing import Literal

from iris.streaming import LiveEnvelope, ReplayGap, SubscriptionTerminal
from pydantic import TypeAdapter, create_model

from iris_studio.app import create_app
from iris_studio.contracts import SSE_PAYLOADS, StreamReady
from iris_studio.media_models import SpeechError, SpeechFinish, SpeechTranscript, UiPart


def export() -> None:
    """写入协议产物，不创建 host 或 provider。"""
    target = Path(__file__).resolve().parents[2] / "contracts"
    target.mkdir(parents=True, exist_ok=True)
    openapi = create_app().openapi()
    part = TypeAdapter(UiPart).json_schema(ref_template="#/components/schemas/{model}")
    part.pop("$defs", None)
    openapi["components"]["schemas"]["UiPart"] = part
    for model in (SpeechFinish, SpeechTranscript, SpeechError):
        openapi["components"]["schemas"][model.__name__] = model.model_json_schema(
            ref_template="#/components/schemas/{model}"
        )
    (target / "openapi.json").write_text(
        json.dumps(openapi, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    variants = []
    for kind, payload in SSE_PAYLOADS.items():
        if kind == "stream.ready":
            continue
        name = "".join(word.capitalize() for word in kind.replace("_", ".").split(".")) + "Envelope"
        variants.append(
            create_model(
                name, __base__=LiveEnvelope, kind=(Literal[kind], kind), payload=(payload, ...)
            )
        )
    adapter = TypeAdapter(reduce(or_, variants + [ReplayGap, SubscriptionTerminal, StreamReady]))
    schema = adapter.json_schema()
    schema["title"] = "StudioSse"
    (target / "sse.schema.json").write_text(
        json.dumps(schema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Exported HTTP and SSE schemas to {target}")


if __name__ == "__main__":
    export()
