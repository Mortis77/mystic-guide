#!/usr/bin/env python3
"""从 Project Gutenberg 下载公有领域书籍，转成 App 可读的 HTML。

用法：python fetch_gutenberg.py <输出目录> [清单json]
"""
import html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"

# id, 短名, 中文标题, 分类
BOOKS = [
    (72679, "goetia-en", "所罗门的小钥匙（Goetia，英译）", "所罗门系"),
    (14209, "kybalion", "凯巴莱恩（赫尔墨斯主义七原则）", "赫尔墨斯主义"),
    (69243, "kabbalah-doctrines", "卡巴拉：教义、发展与文献", "卡巴拉"),
    (27755, "alchemy-symbolism", "炼金术与秘术的隐秘象征", "炼金术"),
    (43240, "alchemy-ancient-modern", "炼金术：古今对照", "炼金术"),
    (68687, "alchemystical-philosophers", "炼金哲人列传", "炼金术"),
    (43548, "tarot-key", "塔罗图解（占卜之幔）", "塔罗与占卜"),
    (70850, "ptolemy-tetrabiblos", "托勒密《四书》（占星经典）", "占星"),
    (46963, "astrology-horoscope", "占星：如何制作与解读自己的星盘", "占星"),
    (42889, "influence-of-stars", "星辰的影响", "占星"),
    (25929, "daemonologie", "恶魔学（詹姆斯一世）", "猎巫与魔鬼学"),
    (28513, "wonders-invisible-world", "不可见世界的奇事", "猎巫与魔鬼学"),
    (17845, "salem-witchcraft", "塞勒姆巫术案", "猎巫与魔鬼学"),
    (38763, "witch-warlock-magician", "女巫、术士与魔法师", "猎巫与魔鬼学"),
    (29855, "rosicrucian-mysteries", "玫瑰十字会秘义", "秘密社团"),
    (35350, "rosie-cross", "玫瑰十字的奥秘", "秘密社团"),
    (19447, "morals-and-dogma", "道德与教条（苏格兰礼共济会）", "秘密社团"),
    (11937, "freemasonry-symbolism", "共济会的象征体系", "秘密社团"),
    (24518, "popular-delusions", "大众妄念史（含炼金、占星、巫术）", "神话与人类学"),
    (57980, "magic-of-jewels", "宝石的魔法与科学", "象征与器物"),
]


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_text(gid):
    for url in (
        f"https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt",
        f"https://www.gutenberg.org/files/{gid}/{gid}-0.txt",
    ):
        try:
            raw = get(url)
            if len(raw) > 5000:
                return raw.decode("utf-8", "ignore")
        except Exception:
            continue
    return None


def strip_gutenberg(text):
    # 去掉 Gutenberg 头尾声明
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
        if len(one) < 60 and one.isupper():
            out.append(f"<h2>{html.escape(one.title())}</h2>")
        else:
            out.append(f"<p>{html.escape(one)}</p>")
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body{{background:#15121c;color:#ece7f5;font:16px/1.75 -apple-system,"Segoe UI",serif;margin:0;padding:20px 18px 60px;max-width:720px;margin:0 auto}}
h1{{font-size:20px;color:#e0c060;margin:0 0 4px}}
.meta{{color:#9a92ad;font-size:12px;margin-bottom:24px;border-bottom:1px solid #332c45;padding-bottom:12px}}
h2{{font-size:16px;color:#c9a227;margin:28px 0 8px}}
p{{margin:0 0 14px;text-align:justify}}
</style></head><body>
<h1>{html.escape(title)}</h1>
<div class="meta">{html.escape(author)} · {html.escape(category)} · 公有领域（Project Gutenberg）</div>
{''.join(out)}
</body></html>"""


def main():
    outdir = Path(sys.argv[1])
    outdir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for gid, slug, title, category in BOOKS:
        dst = outdir / f"{slug}.html"
        if dst.exists():
            print(f"skip {slug}")
            manifest.append({"id": slug, "title": title, "category": category, "gid": gid, "file": dst.name, "kb": round(dst.stat().st_size / 1024, 1)})
            continue
        text = fetch_text(gid)
        if not text:
            print(f"FAIL {slug} (#{gid})")
            continue
        body = strip_gutenberg(text)
        author = ""
        m = re.search(r"^\s*(?:by|Author:)\s*(.+)$", text[:3000], re.M)
        if m:
            author = m.group(1).strip()[:60]
        dst.write_text(to_html(title, author, category, body), encoding="utf-8")
        kb = round(dst.stat().st_size / 1024, 1)
        print(f"ok {slug} {kb}KB")
        manifest.append({"id": slug, "title": title, "category": category, "gid": gid, "file": dst.name, "kb": kb})
        time.sleep(1)
    (outdir / "gutenberg-index.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"done {len(manifest)}/{len(BOOKS)}")


if __name__ == "__main__":
    main()
