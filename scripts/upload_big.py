#!/usr/bin/env python3
"""上传大体积 PDF（>30MB），asset 名用 big-NNN.pdf，避免与已传的小文件冲突。"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

REPO = "Mortis77/mystic-guide"
RID = 417479285
TOKEN = sys.argv[1]
LIST = sys.argv[2]


def api(url, method="GET", data=None, ctype=None):
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"token {TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    if ctype:
        req.add_header("Content-Type", ctype)
    with urllib.request.urlopen(req, timeout=1800) as r:
        return json.loads(r.read().decode("utf-8") or "{}")


def main():
    files = [l.strip() for l in open(LIST, encoding="utf-8") if l.strip()]
    rel = api(f"https://api.github.com/repos/{REPO}/releases/{RID}")
    existing = {a["name"] for a in rel.get("assets", [])}
    ok, fail = [], []
    for i, f in enumerate(files, 1):
        name = f"big-{i:03d}.pdf"
        title = os.path.basename(f)
        size = os.path.getsize(f) / 1048576
        if name in existing:
            print(f"[{i}/{len(files)}] skip {name}")
            ok.append({"asset": name, "title": title})
            continue
        t0 = time.time()
        try:
            with open(f, "rb") as fh:
                data = fh.read()
            url = (
                f"https://uploads.github.com/repos/{REPO}/releases/{RID}/assets"
                f"?name={name}"
            )
            api(url, method="POST", data=data, ctype="application/pdf")
            print(f"[{i}/{len(files)}] ok {size:6.1f}MB {time.time()-t0:6.1f}s {title[:34]}")
            ok.append({"asset": name, "title": title})
        except Exception as exc:  # noqa: BLE001
            print(f"[{i}/{len(files)}] FAIL {title[:34]}: {str(exc)[:80]}")
            fail.append({"asset": name, "title": title, "error": str(exc)[:200]})
    json.dump({"ok": ok, "fail": fail}, open("upload-big-result.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"done ok={len(ok)} fail={len(fail)}")


if __name__ == "__main__":
    main()
