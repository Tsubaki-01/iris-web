"""只读展示包的唯一外部格式。"""

from datetime import datetime
from typing import Any, Literal

from iris.lifecycle import RunEvent, RunResult, RunSnapshot
from pydantic import BaseModel, Field

from .media_models import UiMessage, UiToolCall


class SelectedRun(BaseModel):
    """用户明确选择的存储与运行。"""

    store_binding_id: str
    run_id: str


class SelectedPublication(BaseModel):
    """用户选择的当前可读发布记录。"""

    resource_id: str
    publication_id: str


class SelectedArtifact(SelectedRun):
    """用户选择随包复制的工具产物。"""

    tool_call_id: str


class ExportInput(BaseModel):
    """只导出选定的真实记录。"""

    request_id: str | None = None
    title: str = Field(min_length=1)
    runs: list[SelectedRun] = Field(min_length=1)
    include_children: bool = True
    publications: list[SelectedPublication] = Field(default_factory=list)
    artifact_selection: list[SelectedArtifact] = Field(default_factory=list)


class ExportAsset(BaseModel):
    """包内资源以主机生成的身份定位，不接受外部路径。"""

    asset_id: str = Field(pattern=r"^[0-9a-f]{32}$")
    name: str
    mime_type: str
    size_bytes: int = Field(ge=0)


class ExportedRun(BaseModel):
    """捕获水位以内的真实运行与观察资料。"""

    store_binding_id: str
    source_id: str
    run: RunSnapshot
    result: RunResult | None
    session_id: str
    messages: list[UiMessage]
    tools: list[UiToolCall]
    events: list[RunEvent]
    lineage: dict[str, Any] | None
    message_start: int
    message_end: int
    event_watermark: int
    evidence: dict[str, Any]


class ShowcaseRecord(BaseModel):
    """可导入和离线读取的版本一展示包。"""

    schema_version: Literal[1] = 1
    title: str
    captured_at: datetime
    runs: list[ExportedRun]
    publications: list[dict[str, Any]] = Field(default_factory=list)
    assets: list[ExportAsset] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)


class ShowcaseView(BaseModel):
    """主机保存的只读展示记录入口。"""

    showcase_id: str
    title: str
    created_at: datetime
    source: Literal["exported", "imported"]
    read_only: Literal[True] = True
    run_refs: list[SelectedRun]
    manifest_url: str
    record_url: str
    download_url: str
    view_url: str
