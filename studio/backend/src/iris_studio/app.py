"""FastAPI lifespan 拥有唯一 Studio host 与生产静态页面。"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from iris.exceptions import (
    HITLConflictError,
    HITLResponseMismatchError,
    IrisCommandCleanupError,
    IrisConfigError,
    IrisError,
    IrisGoalConflictError,
    IrisGoalNotFoundError,
    IrisGoalStateError,
    IrisRunConflictError,
    IrisRunNotFoundError,
    IrisRunRecoveryError,
    IrisRunStateError,
    IrisValidationError,
)
from starlette.exceptions import HTTPException

from .contracts import ApiError, HostError
from .resources import StudioHost

logger = logging.getLogger(__name__)


def create_app(
    *, data_dir: Path | None = None, host: StudioHost | None = None, static_dir: Path | None = None
) -> FastAPI:
    """构造单 worker 应用；测试可注入受控 provider 的同一 host。"""

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        instance = host or StudioHost(data_dir or Path.cwd() / ".iris-studio")
        app.state.host = instance
        await instance.start()
        try:
            yield
        finally:
            await instance.close()

    app = FastAPI(title="Iris Studio", version="0.1.0", lifespan=lifespan)
    if host is not None:
        app.state.host = host

    @app.exception_handler(HostError)
    async def host_error(request: Request, exc: HostError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status, content={"error": exc.error.model_dump(mode="json")}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        status = 400 if any(item["type"] == "json_invalid" for item in errors) else 422
        error = ApiError(
            code="INVALID_REQUEST",
            message="请求内容无法解析",
            field_errors=[
                {"path": ".".join(str(part) for part in item["loc"]), "message": item["msg"]}
                for item in errors
            ],
        )
        return JSONResponse(status_code=status, content={"error": error.model_dump(mode="json")})

    @app.exception_handler(IrisError)
    async def iris_error(request: Request, exc: IrisError) -> JSONResponse:
        status = 500
        if isinstance(exc, (IrisRunNotFoundError, IrisGoalNotFoundError)):
            status = 404
        elif isinstance(exc, (IrisConfigError, IrisValidationError, HITLResponseMismatchError)):
            status = 422
        elif isinstance(
            exc,
            (
                IrisRunConflictError,
                IrisRunStateError,
                IrisRunRecoveryError,
                IrisGoalConflictError,
                IrisGoalStateError,
                HITLConflictError,
            ),
        ):
            status = 409
        elif isinstance(exc, IrisCommandCleanupError):
            status = 503
        error = ApiError(code=exc.runtime_code, message=exc.message, details=exc.context)
        return JSONResponse(status_code=status, content={"error": error.model_dump(mode="json")})

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": ApiError(code="HTTP_ERROR", message=str(exc.detail)).model_dump(
                    mode="json"
                )
            },
        )

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Studio 请求失败", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": ApiError(
                    code="INTERNAL_ERROR", message="操作失败，请查看后端日志"
                ).model_dump(mode="json")
            },
        )

    from . import configuration, evidence, files, learning, sessions, streaming

    for module in (configuration, sessions, streaming, files, learning, evidence):
        app.include_router(module.router)
    from . import exports

    app.include_router(exports.router)
    built = static_dir or Path(__file__).resolve().parents[3] / "frontend" / "dist"
    if built.is_dir():
        app.mount("/assets", StaticFiles(directory=built / "assets"), name="assets")

        @app.get("/{path:path}", include_in_schema=False)
        async def index(path: str) -> FileResponse:
            if path.startswith("api/"):
                raise HTTPException(status_code=404, detail="API 不存在")
            return FileResponse(built / "index.html")

    return app


app = create_app()
