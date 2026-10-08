"""启动本地 Studio，凭据继续由 Iris 进程配置读取。"""

import argparse
from pathlib import Path

import uvicorn
from iris.config import init_config

from .app import create_app


def main() -> None:
    """提供开发和构建后工作台共用的单进程入口。"""
    parser = argparse.ArgumentParser(description="Iris Studio 本地工作台")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="监听端口，默认 8000")
    parser.add_argument("--data-dir", type=Path, default=Path(".iris-studio"), help="工作台资料目录")
    parser.add_argument("--env-file", help="交给 Iris 加载的 dotenv 文件")
    args = parser.parse_args()
    init_config(env_file=args.env_file)
    uvicorn.run(create_app(data_dir=args.data_dir), host=args.host, port=args.port, workers=1)


if __name__ == "__main__":
    main()
