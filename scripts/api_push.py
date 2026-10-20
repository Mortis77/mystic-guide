#!/usr/bin/env python3
"""用 GitHub Git Data API 提交本地改动（绕开 git 传输被掐）。

只提交候选文件里内容与远程不同的那些。
"""
import base64
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = "Mortis77/mystic-guide"
TOKEN = sys.argv[1]
MSG = sys.argv[2]
ROOT = Path(sys.argv[3]) if len(sys.argv) > 3 else Path.cwd()

# 扫描整个工作区，按下面的规则排除
SKIP_DIRS = {".git", ".toolchain", ".data", "node_modules", "build", ".gradle", "__pycache__",
             "app/build", "assets/www"}
SKIP_EXT = {".apk", ".zip", ".gz", ".exe", ".dll", ".so", ".bin"}


def collect_targets(root):
    """返回要提交的相对路径列表（对应 git 跟踪的内容）。"""
    out = []
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(root).as_posix()
        parts = rel.split("/")
        if any(s in parts for s in SKIP_DIRS if s != "assets/www"):
            continue
        if rel.startswith("android/app/src/main/assets/www/"):
            continue          # 构建时生成，不入库
        if rel in ("android/local.properties",):
            continue
        if p.suffix.lower() in SKIP_EXT:
            continue
        out.append(rel)
    return out


def remote_blobs(commit_sha, root):
    """读取远程树上每个文件的 sha，用于跳过没变的。"""
    api_tree = api(f"/git/trees/{commit_sha}?recursive=1")
    return {e["path"]: e["sha"] for e in api_tree.get("tree", []) if e["type"] == "blob"}


def api(path, method="GET", data=None):
    url = f"https://api.github.com/repos/{REPO}{path}" if path.startswith("/") else path
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"token {TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    if data:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode() or "{}")


def main():
    ref = api("/git/ref/heads/main")
    parent = ref["object"]["sha"]
    commit = api(f"/git/commits/{parent}")
    base_tree = commit["tree"]["sha"]

    tree_entries, changed = [], []
    import hashlib
    remote = remote_blobs(parent, ROOT)
    for rel in collect_targets(ROOT):
        p = ROOT / rel
        if not p.exists():
            continue
        content = p.read_bytes()
        # git blob sha = sha1("blob <len>\0" + content)
        local_sha = hashlib.sha1(b"blob %d\0" % len(content) + content).hexdigest()
        if remote.get(rel) == local_sha:
            continue
        blob = api("/git/blobs", method="POST", data=json.dumps({
            "content": base64.b64encode(content).decode(),
            "encoding": "base64",
        }).encode())
        tree_entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        changed.append(rel)
        if len(changed) % 25 == 0:
            print(f"  ... {len(changed)} 个已上传")

    if not tree_entries:
        print("nothing to commit")
        return

    tree = api("/git/trees", method="POST", data=json.dumps({
        "base_tree": base_tree,
        "tree": tree_entries,
    }).encode())
    nc = api("/git/commits", method="POST", data=json.dumps({
        "message": MSG,
        "tree": tree["sha"],
        "parents": [parent],
    }).encode())
    api("/git/refs/heads/main", method="PATCH", data=json.dumps({"sha": nc["sha"]}).encode())
    print(f"committed {nc['sha'][:8]} with {len(changed)} files")
    for c in changed:
        print("  +", c)


if __name__ == "__main__":
    main()
