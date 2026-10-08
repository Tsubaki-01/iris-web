"""媒体和消息的 HTTP 投影；领域记录仍由 Iris 拥有。"""

from datetime import datetime
from typing import Annotated, Any, Literal

from iris.lifecycle import ToolCallPhase
from iris.message import Role
from iris.tools import ToolErrorInfo
from pydantic import BaseModel, Field


class MediaView(BaseModel):
    """已登记图片的原图与模型副本地址。"""

    media_id: str
    name: str | None
    mime_type: str
    width: int
    height: int
    original_url: str
    model_url: str


class ImageInput(BaseModel):
    """输入只引用本会话已登记的图片。"""

    type: Literal["image"] = "image"
    media_id: str


class UiTextPart(BaseModel):
    """文字内容块。"""

    type: Literal["text"] = "text"
    text: str


class UiImagePart(BaseModel):
    """可读取原图和模型副本的图片块。"""

    type: Literal["image"] = "image"
    name: str | None
    media: MediaView


UiDataPart = Annotated[UiTextPart | UiImagePart, Field(discriminator="type")]


class UiToolUsePart(BaseModel):
    """模型的真实工具请求。"""

    type: Literal["tool_use"] = "tool_use"
    id: str
    name: str
    input: dict[str, Any]


class UiToolResultPart(BaseModel):
    """持久消息中的工具回执。"""

    type: Literal["tool_result"] = "tool_result"
    tool_use_id: str
    name: str
    content: list[UiDataPart]
    is_error: bool
    metadata: dict[str, Any]


UiPart = Annotated[
    UiTextPart | UiImagePart | UiToolUsePart | UiToolResultPart,
    Field(discriminator="type"),
]


class UiMessage(BaseModel):
    """保留绝对位置和角色的持久消息。"""

    ordinal: int
    role: Role
    sender: str
    timestamp: float
    parts: list[UiPart]
    metadata: dict[str, Any]


class ArtifactView(BaseModel):
    """发布副本的读取地址，不将任意路径变成文件服务。"""

    mime_type: str
    size_bytes: int
    preview: str
    download_url: str
    preview_url: str | None
    text_url: str | None


class UiToolResult(BaseModel):
    """完整工具结果，只替换媒体和产物的传输投影。"""

    tool_use_id: str
    tool_name: str
    content: list[UiDataPart]
    is_error: bool
    error: ToolErrorInfo | None
    data: dict[str, Any]
    artifact: ArtifactView | None
    stats: dict[str, Any]
    metadata: dict[str, Any]
    hook_feedback: tuple[str, ...]


class UiToolCall(BaseModel):
    """完整工具调用记录的前端读面。"""

    run_id: str
    step_index: int
    ordinal: int
    tool_call_id: str
    tool_name: str
    arguments: dict[str, Any]
    fingerprint: str
    interaction_id: str | None
    phase: ToolCallPhase
    claim_activation_id: str | None
    result: UiToolResult | None
    version: int
    created_at: datetime
    updated_at: datetime
    claimed_at: datetime | None
    committed_at: datetime | None


class TextSlice(BaseModel):
    """有界读取真实工具正文。"""

    text: str
    next_offset: int | None
    has_more: bool


class FileChange(BaseModel):
    """某次 edit_file 的真实变化。"""

    file_path: str
    patch: str


class SpeechFinish(BaseModel):
    """浏览器结束录音，等待服务返回最终转录。"""

    type: Literal["finish"]


class SpeechTranscript(BaseModel):
    """语音事件是当前全文快照，不是增量文字。"""

    type: Literal["transcript"] = "transcript"
    text: str
    is_final: bool


class SpeechError(BaseModel):
    """语音输入失败，已有聊天与草稿不受影响。"""

    type: Literal["error"] = "error"
    message: str
