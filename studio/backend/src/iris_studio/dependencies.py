"""HTTP 请求到唯一主机对象的依赖。"""

from typing import TYPE_CHECKING

from fastapi import Request

if TYPE_CHECKING:
    from .resources import StudioHost


def get_host(request: Request) -> "StudioHost":
    """读取 app lifespan 拥有的主机。"""
    return request.app.state.host
