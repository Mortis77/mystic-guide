#!/usr/bin/env python3
"""按 kind 重新分科，并从导出的内容恢复 curriculum 结构。

交感巫术（sympathetic-magic）：kind=概念
日常小术法（daily-craft）：kind=实操 + craft-baseline
"""
import json
import shutil
import sys
from pathlib import Path

import yaml

ROOT = Path("C:/Users/Mors/StudyMate/.learning/subjects")
SRC = ROOT / "sympathetic-magic"
DST = ROOT / "daily-craft"
EXPORT = Path("C:/dsh-test/mystic-guide/docs/content/sympathetic-magic.json")

CRAFT_EXTRA = {"craft-baseline"}


def main():
    data = json.loads(EXPORT.read_text(encoding="utf-8"))
    units = data["units"]

    theory, craft = [], []
    for u in units:
        node = {
            "id": u["id"],
            "title": u["title"],
            "kind": u["kind"],
            "objective": u.get("goal", ""),
            "problem": u.get("goal", ""),
            "prerequisites": [],
            "concepts": [],
            "resources": [],
            "practice": "",
            "pitfalls": [],
            "realworld": "",
            "status": "已掌握" if u["id"] in ("golden-nemi-priest",) else "未开始",
            "mastery": 0.9 if u["id"] == "golden-nemi-priest" else 0,
        }
        if u["kind"] == "实操" or u["id"] in CRAFT_EXTRA:
            craft.append(node)
        else:
            theory.append(node)

    # 交感巫术
    cur_a = {"nodes": theory, "edges": []}
    (SRC / "curriculum.yaml").write_text(yaml.safe_dump(cur_a, allow_unicode=True, sort_keys=False), encoding="utf-8")

    # 日常小术法
    if DST.exists():
        shutil.rmtree(DST)
    for d in ("lessons", "reference", "assets", "learning-records", "sessions", "assessments"):
        (DST / d).mkdir(parents=True)
    for f in ("style.css", "quiz.js", "lesson-toc.js"):
        p = SRC / "assets" / f
        if p.exists():
            shutil.copy2(p, DST / "assets" / f)

    cur_b = {"nodes": craft, "edges": []}
    (DST / "curriculum.yaml").write_text(yaml.safe_dump(cur_b, allow_unicode=True, sort_keys=False), encoding="utf-8")

    # 搬课件
    moved = 0
    for u in craft:
        for pat in (f"*-{u['id']}.md", f"*-{u['id']}.quiz.json"):
            for p in (SRC / "lessons").glob(pat):
                shutil.move(str(p), str(DST / "lessons" / p.name))
                moved += 1
    print(f"交感巫术 {len(theory)} 节 / 日常小术法 {len(craft)} 节 / 搬动 {moved} 个文件")
    for n in theory:
        print("  理论:", n["id"])
    for n in craft:
        print("  实操:", n["id"])


if __name__ == "__main__":
    main()
