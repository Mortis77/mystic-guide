#!/usr/bin/env python3
"""从 Gutenberg 批量下载书目并转成 App 可读的 HTML。

用法：
  python fetch_bulk.py <buckets.json> <输出目录> [每类上限] [总上限]
"""
import html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_text(gid):
    for url in (
        f"https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt",
        f"https://www.gutenberg.org/files/{gid}/{gid}-0.txt",
        f"https://www.gutenberg.org/files/{gid}/{gid}.txt",
    ):
        try:
            raw = get(url)
            if len(raw) > 3000:
                return raw.decode("utf-8", "ignore")
        except Exception:
            continue
    return None


def clean(text):
    m = re.search(r"\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*", text, re.S | re.I)
    if m:
        text = text[m.end():]
    m = re.search(r"\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK", text, re.S | re.I)
    if m:
        text = text[: m.start()]
    return text.strip()


def to_html(title, author, category, body):
    paras = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
    out = []
    for p in paras:
        one = " ".join(p.split())
        if not one:
            continue
        if len(one) < 70 and one.isupper():
            out.append(f"<h2>{html.escape(one.title())}</h2>")
        else:
            out.append(f"<p>{html.escape(one)}</p>")
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body{{background:#15121c;color:#ece7f5;font:16px/1.75 -apple-system,"Segoe UI",serif;margin:0 auto;padding:20px 18px 60px;max-width:720px}}
h1{{font-size:19px;color:#e0c060;margin:0 0 4px;line-height:1.4}}
.meta{{color:#9a92ad;font-size:12px;margin-bottom:24px;border-bottom:1px solid #332c45;padding-bottom:12px}}
h2{{font-size:16px;color:#c9a227;margin:28px 0 8px}}
p{{margin:0 0 14px;text-align:justify}}
</style></head><body>
<h1>{html.escape(title)}</h1>
<div class="meta">{html.escape(author)} · {html.escape(category)} · 公有领域（Project Gutenberg）</div>
{''.join(out)}
</body></html>"""


def slugify(tid, title):
    s = re.sub(r"[^a-z0-9]+", "-", (title or "").lower())[:40].strip("-")
    return f"g{tid}-{s}" if s else f"g{tid}"


def main():
    buckets = json.load(open(sys.argv[1], encoding="utf-8"))
    outdir = Path(sys.argv[2])
    per_cat = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    total_cap = int(sys.argv[4]) if len(sys.argv) > 4 else 120
    outdir.mkdir(parents=True, exist_ok=True)

    manifest = []
    done = 0
    for cat, items in buckets.items():
        if done >= total_cap:
            break
        got = 0
        for it in items:
            if got >= per_cat or done >= total_cap:
                break
            tid = it["id"]
            slug = slugify(tid, it["title"])
            dst = outdir / f"{slug}.html"
            if dst.exists():
                manifest.append({"id": slug, "title": it["title"], "category": cat, "gid": tid,
                                 "file": dst.name, "kb": round(dst.stat().st_size / 1024, 1)})
                got += 1; done += 1
                continue
            text = fetch_text(tid)
            if not text:
                continue
            body = clean(text)
            if len(body) < 5000:
                continue
            dst.write_text(to_html(it["title"], it.get("authors", ""), cat, body), encoding="utf-8")
            kb = round(dst.stat().st_size / 1024, 1)
            manifest.append({"id": slug, "title": it["title"], "category": cat, "gid": tid,
                             "file": dst.name, "kb": kb})
            got += 1; done += 1
            print(f"[{done}/{total_cap}] {cat} {kb}KB {it['title'][:50]}")
            time.sleep(0.5)

    idx = outdir / "bulk-index.json"
    old = json.loads(idx.read_text(encoding="utf-8")) if idx.exists() else []
    by_id = {r["id"]: r for r in old}
    for r in manifest:
        by_id[r["id"]] = r
    idx.write_text(json.dumps(list(by_id.values()), ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"本次 {len(manifest)} 本，累计 {len(by_id)} 本")


if __name__ == "__main__":
    main()
