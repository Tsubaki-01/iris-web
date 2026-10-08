"""仅保存主机资料；Run 与消息始终读取 Iris LifecycleStore。"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


class MetadataStore:
    """主机自有 SQLite 文档表。"""

    def __init__(self, path: Path) -> None:
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(path)
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS documents (namespace TEXT, key TEXT, payload TEXT NOT NULL, PRIMARY KEY(namespace,key))"
        )
        self.connection.commit()

    def put(self, namespace: str, key: str, payload: dict[str, Any]) -> None:
        """替换一条主机资料。"""
        self.connection.execute(
            "INSERT INTO documents VALUES (?,?,?) ON CONFLICT(namespace,key) DO UPDATE SET payload=excluded.payload",
            (namespace, key, json.dumps(payload, ensure_ascii=False)),
        )
        self.connection.commit()

    def get(self, namespace: str, key: str) -> dict[str, Any] | None:
        """读取指定主机资料。"""
        row = self.connection.execute(
            "SELECT payload FROM documents WHERE namespace=? AND key=?", (namespace, key)
        ).fetchone()
        return None if row is None else json.loads(row[0])

    def list(self, namespace: str) -> list[dict[str, Any]]:
        """列出规模较小的配置与索引资料。"""
        return [
            json.loads(row[0])
            for row in self.connection.execute(
                "SELECT payload FROM documents WHERE namespace=? ORDER BY rowid", (namespace,)
            )
        ]

    def delete(self, namespace: str, key: str) -> None:
        """撤销本次失败装配新增的主机索引，不删除领域数据文件。"""
        self.connection.execute(
            "DELETE FROM documents WHERE namespace=? AND key=?", (namespace, key)
        )
        self.connection.commit()

    def close(self) -> None:
        """关闭主机拥有的连接。"""
        self.connection.close()
