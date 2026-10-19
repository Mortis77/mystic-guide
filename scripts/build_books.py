#!/usr/bin/env python3
"""扫描本地书籍目录，生成 App 用的书单 books.json。

用法：python build_books.py <书籍根目录> <输出 json>
"""
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# 分类规则：命中关键词归入对应类，按顺序匹配
RULES = [
    ("所罗门与仪式魔法", ["所罗门", "洪诺留", "七天", "黑母鸡", "摩西", "阿格里帕", "神秘哲学", "贤者之书", "Picatrix", "浮士德", "魔法师", "威卡", "仪式"]),
    ("卡巴拉与秘传", ["卡巴拉", "光辉之书", "秘法", "生命之树"]),
    ("神话与人类学", ["金枝", "神话", "弗雷泽", "鬼文化", "民俗"]),
    ("中国方术", ["中国方术", "易经", "梅花", "奇门", "六壬", "风水", "八字", "紫微"]),
    ("辞典与工具书", ["辞典", "词典", "百科", "指南"]),
]


def classify(name):
    for label, keys in RULES:
        if any(k in name for k in keys):
            return label
    return "其他"


def clean_title(filename):
    t = Path(filename).stem
    t = re.sub(r"\(Z-?[Ll]ibrary\)", "", t)
    t = re.sub(r"\(z-library[^)]*\)", "", t)
    t = re.sub(r"\s*[-_]\s*\d+$", "", t)
    t = re.sub(r"\s+", " ", t).strip(" ._-")
    return t


def main():
    root = Path(sys.argv[1])
    out = Path(sys.argv[2])
    books = []
    for path in sorted(root.rglob("*.pdf")):
        size = path.stat().st_size
        books.append({
            "id": hashlib.md5(str(path).encode()).hexdigest()[:10],
            "title": clean_title(path.name),
            "category": classify(path.name),
            "size_mb": round(size / 1048576, 1),
            "file": path.name,
        })
    books.sort(key=lambda b: (b["category"], b["title"]))
    cats = {}
    for b in books:
        cats.setdefault(b["category"], []).append(b)
    payload = {
        "total": len(books),
        "total_mb": round(sum(b["size_mb"] for b in books), 1),
        "categories": [
            {"name": k, "count": len(v), "books": v} for k, v in cats.items()
        ],
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(books)} books, {payload['total_mb']} MB -> {out}")
    for c in payload["categories"]:
        print(f"  {c['name']}: {c['count']}")


if __name__ == "__main__":
    main()
