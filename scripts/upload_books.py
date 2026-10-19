#!/usr/bin/env python3
"""把本地 PDF 上传到 GitHub Release。

用法：
  python upload_books.py <token> <release_id> <pdf根目录> [最大MB] [输出清单json]

只传小于等于「最大MB」的文件；已存在同名 asset 会跳过。
"""
import glob
import json
import os
import sys
import time
import urllib.parse
import urllib.request

REPO = "Mortis77/mystic-guide"


def api(url, token, method="GET", data=None, content_type=None):
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"token {token}")
    req.add_header("Accept", "application/vnd.github+json")
    if content_type:
        req.add_header("Content-Type", content_type)
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.loads(r.read().decode("utf-8") or "{}")


def main():
    token, rid, root = sys.argv[1], sys.argv[2], sys.argv[3]
    limit_mb = float(sys.argv[4]) if len(sys.argv) > 4 else 30
    out_json = sys.argv[5] if len(sys.argv) > 5 else ""

    files = glob.glob(os.path.join(root, "**", "*.pdf"), recursive=True)
    files.sort(key=os.path.getsize)
    todo = [f for f in files if os.path.getsize(f) / 1048576 <= limit_mb]

    # 已有 asset
    existing = set()
    rel = api(f"https://api.github.com/repos/{REPO}/releases/{rid}", token)
    for a in rel.get("assets", []):
        existing.add(a["name"])

    print(f"total {len(files)} pdf, uploading {len(todo)} (<= {limit_mb}MB), already {len(existing)}")

    ok, fail = [], []
    for i, f in enumerate(todo, 1):
        name = os.path.basename(f)
        if name in existing:
            print(f"[{i}/{len(todo)}] skip {name}")
            ok.append(name)
            continue
        size = os.path.getsize(f) / 1048576
        t0 = time.time()
        url = (
            f"https://uploads.github.com/repos/{REPO}/releases/{rid}/assets"
            f"?name={urllib.parse.quote(name)}"
        )
        try:
            with open(f, "rb") as fh:
                data = fh.read()
            res = api(url, token, method="POST", data=data, content_type="application/pdf")
            dt = time.time() - t0
            print(f"[{i}/{len(todo)}] ok {size:6.1f}MB {dt:5.1f}s {name[:40]}")
            ok.append(name)
        except Exception as exc:  # noqa: BLE001
            print(f"[{i}/{len(todo)}] FAIL {name[:40]}: {str(exc)[:80]}")
            fail.append({"name": name, "error": str(exc)[:200]})

    if out_json:
        json.dump({"ok": ok, "fail": fail}, open(out_json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"done: ok={len(ok)} fail={len(fail)}")


if __name__ == "__main__":
    main()
