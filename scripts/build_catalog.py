#!/usr/bin/env python3
"""生成完整书单：本地 PDF（走 Release 下载）+ 内置 HTML（Gutenberg 译本，随包分发）。

用法：python build_catalog.py <pdf根目录> <html目录> <输出json>
"""
import hashlib
import json
import re
import sys
from pathlib import Path

PDF_RULES = [
    ("所罗门与仪式魔法", ["所罗门", "洪诺留", "七天", "黑母鸡", "摩西", "阿格里帕", "神秘哲学", "贤者之书", "Picatrix", "浮士德", "魔法师", "威卡", "仪式"]),
    ("卡巴拉与秘传", ["卡巴拉", "光辉之书", "秘法", "生命之树"]),
    ("神话与人类学", ["金枝", "神话", "弗雷泽", "鬼文化", "民俗"]),
    ("中国方术", ["中国方术", "易经", "梅花", "奇门", "六壬", "风水", "八字", "紫微"]),
    ("辞典与工具书", ["辞典", "词典", "百科", "指南"]),
]


def classify_pdf(name):
    for label, keys in PDF_RULES:
        if any(k in name for k in keys):
            return label
    return "其他"


def clean_pdf_title(filename):
    t = Path(filename).stem
    t = re.sub(r"\(Z-?[Ll]ibrary\)", "", t)
    t = re.sub(r"\(z-library[^)]*\)", "", t)
    t = re.sub(r"\s*[-_]\s*\d+$", "", t)
    return re.sub(r"\s+", " ", t).strip(" ._-")


def main():
    pdf_root = Path(sys.argv[1])
    html_dir = Path(sys.argv[2])
    out = Path(sys.argv[3])

    # 已上传的 Release 映射
    base = "https://github.com/Mortis77/mystic-guide/releases/download/books-v1/"
    url_map = {}
    for fn in ("upload-result.json", "upload-big-result.json"):
        p = Path(fn)
        if not p.exists():
            continue
        try:
            for rec in json.loads(p.read_text(encoding="utf-8")).get("ok", []):
                if isinstance(rec, dict):
                    url_map[Path(rec["title"]).stem.strip()] = base + rec["asset"]
        except Exception:
            pass

    cats = {}

    # 1) 本地 PDF
    for path in sorted(pdf_root.rglob("*.pdf")):
        title = clean_pdf_title(path.name)
        cat = classify_pdf(path.name)
        url = url_map.get(title) or next((u for k, u in url_map.items() if k and (k in title or title in k)), "")
        cats.setdefault(cat, []).append({
            "id": hashlib.md5(str(path).encode()).hexdigest()[:10],
            "title": title,
            "kind": "pdf",
            "size_mb": round(path.stat().st_size / 1048576, 1),
            "url": url,
        })

    # 2) 内置 HTML（随包）
    idx = html_dir / "gutenberg-index.json"
    if idx.exists():
        for rec in json.loads(idx.read_text(encoding="utf-8")):
            CATFIX = {"所罗门系": "所罗门与仪式魔法", "卡巴拉": "卡巴拉与秘传"}
            cats.setdefault(CATFIX.get(rec["category"], rec["category"]), []).append({
                "id": rec["id"],
                "title": rec["title"],
                "kind": "html",
                "size_mb": round(rec["kb"] / 1024, 2),
                "file": f"books/{rec['file']}",
                "source": "Project Gutenberg",
            })

    order = ["所罗门与仪式魔法", "卡巴拉", "赫尔墨斯主义", "炼金术", "占星", "塔罗与占卜",
             "猎巫与魔鬼学", "秘密社团", "卡巴拉与秘传", "神话与人类学", "中国方术",
             "象征与器物", "辞典与工具书", "其他"]
    categories = []
    for name in order:
        if name in cats:
            books = sorted(cats.pop(name), key=lambda b: b["title"])
            categories.append({"name": name, "count": len(books), "books": books})
    for name, books in cats.items():
        categories.append({"name": name, "count": len(books), "books": sorted(books, key=lambda b: b["title"])})

    total = sum(c["count"] for c in categories)
    payload = {
        "total": total,
        "total_mb": round(sum(b["size_mb"] for c in categories for b in c["books"]), 1),
        "categories": categories,
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{total} 本, {payload['total_mb']} MB -> {out}")
    for c in categories:
        html_n = sum(1 for b in c["books"] if b["kind"] == "html")
        print(f"  {c['name']}: {c['count']} (内置 {html_n})")


if __name__ == "__main__":
    main()
