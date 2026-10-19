#!/usr/bin/env python3
"""把 StudyMate 工作区的课件导出成 Mystic Guide 的内容包。

输入：<workspace>/.learning/subjects/<slug>/  内含 subject.yaml / curriculum.yaml / lessons/
输出：<out>/manifest.json 与 <out>/<slug>.json

block 类型：
  h2 / h3 / p / ul / ol / table / code / svg / figure / note / quiz
  h2..code/figure 的 text 字段直接是 HTML 片段，App 端 innerHTML 渲染。
"""
import json
import os
import re
import sys
from pathlib import Path

import yaml

INLINE_RULES = [
    (re.compile(r"\*\*(.+?)\*\*"), r"<strong>\1</strong>"),
    (re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)"), r"<em>\1</em>"),
    (re.compile(r"`([^`]+)`"), r"<code>\1</code>"),
]


def inline(text):
    out = text
    for pat, rep in INLINE_RULES:
        out = pat.sub(rep, out)
    return out


def split_frontmatter(text):
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            fm = yaml.safe_load(text[3:end]) or {}
            return fm, text[end + 4 :]
    return {}, text


def parse_table(lines):
    rows = []
    for ln in lines:
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
            continue
        rows.append(cells)
    if not rows:
        return ""
    head, body = rows[0], rows[1:]
    html = ["<table><thead><tr>"]
    html += [f"<th>{inline(c)}</th>" for c in head]
    html.append("</tr></thead><tbody>")
    for r in body:
        html.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
    html.append("</tbody></table>")
    return "".join(html)


def parse_lesson(text, quiz_bank):
    """Markdown → blocks。自定义块以 ::: 起止。"""
    fm, body = split_frontmatter(text)
    lines = body.split("\n")
    blocks = []
    i = 0
    n = len(lines)

    def flush_para(buf):
        if not buf:
            return
        joined = " ".join(x.strip() for x in buf).strip()
        if joined:
            blocks.append({"type": "p", "html": inline(joined)})

    para = []
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith(":::"):
            flush_para(para)
            para = []
            header = stripped[3:].strip()
            # 收集到收尾的 :::
            block_lines = []
            i += 1
            while i < n and lines[i].strip() != ":::":
                block_lines.append(lines[i])
                i += 1
            i += 1
            kind = header.split()[0] if header else ""
            rest = header[len(kind) :].strip()

            if kind in ("svg",):
                raw = "\n".join(l for l in block_lines if l.strip().startswith("<"))
                alt = ""
                for l in block_lines:
                    if l.strip().startswith("alt:"):
                        alt = l.split(":", 1)[1].strip()
                blocks.append({"type": "svg", "svg": raw, "alt": alt})
            elif kind == "figure":
                blocks.append({"type": "figure", "src": rest.split()[0] if rest else ""})
            elif kind == "quiz":
                anchor = ""
                if "锚点：" in rest:
                    anchor = rest.split("锚点：", 1)[1].strip()
                else:
                    anchor = rest
                qs = quiz_bank.get(anchor, [])
                blocks.append({"type": "quiz", "anchor": anchor, "questions": qs})
            elif kind in ("tip", "warn", "note", "practice"):
                content_lines = [l for l in block_lines if l.strip()]
                html = "".join(
                    f"<p>{inline(l.strip())}</p>" if not l.strip().startswith(("-", "1.")) else ""
                    for l in content_lines
                )
                steps = [l.strip()[2:].strip() for l in content_lines if l.strip().startswith("- ")]
                blocks.append(
                    {
                        "type": "note",
                        "tone": kind,
                        "title": rest,
                        "html": html,
                        "steps": [inline(s) for s in steps],
                    }
                )
            else:
                blocks.append({"type": "note", "tone": "note", "title": header, "html": "", "steps": []})
            continue

        if stripped.startswith("## "):
            flush_para(para)
            para = []
            blocks.append({"type": "h2", "html": inline(stripped[3:].strip())})
            i += 1
            continue
        if stripped.startswith("### "):
            flush_para(para)
            para = []
            blocks.append({"type": "h3", "html": inline(stripped[4:].strip())})
            i += 1
            continue
        if stripped.startswith("|"):
            flush_para(para)
            para = []
            tbl = []
            while i < n and lines[i].strip().startswith("|"):
                tbl.append(lines[i])
                i += 1
            blocks.append({"type": "table", "html": parse_table(tbl)})
            continue
        if stripped.startswith("- "):
            flush_para(para)
            para = []
            items = []
            while i < n and lines[i].strip().startswith("- "):
                items.append(inline(lines[i].strip()[2:].strip()))
                i += 1
            blocks.append({"type": "ul", "html": "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"})
            continue
        if re.match(r"^\d+\.\s", stripped):
            flush_para(para)
            para = []
            items = []
            while i < n and re.match(r"^\d+\.\s", lines[i].strip()):
                items.append(inline(re.sub(r"^\d+\.\s+", "", lines[i].strip())))
                i += 1
            blocks.append({"type": "ol", "html": "<ol>" + "".join(f"<li>{x}</li>" for x in items) + "</ol>"})
            continue
        if stripped.startswith("```"):
            flush_para(para)
            para = []
            lang = stripped[3:].strip()
            i += 1
            code = []
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            esc = (
                "\n".join(code)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            blocks.append({"type": "code", "lang": lang, "html": f"<pre><code>{esc}</code></pre>"})
            continue

        if stripped == "":
            flush_para(para)
            para = []
            i += 1
            continue

        para.append(line)
        i += 1

    flush_para(para)
    return fm, blocks


def build_subject(subject_dir):
    slug = subject_dir.name
    subj_yaml = yaml.safe_load((subject_dir / "subject.yaml").read_text(encoding="utf-8"))
    cur_path = subject_dir / "curriculum.yaml"
    if not cur_path.exists():
        return None
    cur = yaml.safe_load(cur_path.read_text(encoding="utf-8"))
    nodes = cur.get("nodes", [])

    units = []
    for seq, node in enumerate(nodes, 1):
        uid = node["id"]
        md = subject_dir / "lessons" / f"{seq:04d}-{uid}.md"
        if not md.exists():
            # 位次可能因为重排而与文件名对不上，按 id 兜底找
            cands = list((subject_dir / "lessons").glob(f"*-{uid}.md"))
            md = cands[0] if cands else None
        if md is None:
            continue
        quiz_path = md.with_suffix(".quiz.json")
        quiz_bank = json.loads(quiz_path.read_text(encoding="utf-8")) if quiz_path.exists() else {}
        fm, blocks = parse_lesson(md.read_text(encoding="utf-8"), quiz_bank)
        units.append(
            {
                "id": uid,
                "seq": seq,
                "title": fm.get("title") or node.get("title", uid),
                "kind": node.get("kind", "概念"),
                "goal": fm.get("goal", ""),
                "blocks": blocks,
            }
        )

    if not units:
        return None
    return {
        "id": slug,
        "name": subj_yaml.get("name", slug),
        "goal": subj_yaml.get("goal", ""),
        "status": subj_yaml.get("status", "进行中"),
        "total_units": len(nodes),
        "units": units,
    }


def main():
    workspace = Path(sys.argv[1])
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    subjects_dir = workspace / ".learning" / "subjects"
    manifest = {"generated_from": str(subjects_dir), "subjects": []}
    order = ["sympathetic-magic", "occult-foundations", "sigil-talisman-magic", "ritual-practice", "wand-craft"]
    dirs = sorted(subjects_dir.iterdir(), key=lambda p: (order.index(p.name) if p.name in order else 99, p.name))
    for sd in dirs:
        if not sd.is_dir():
            continue
        subj = build_subject(sd)
        if not subj:
            continue
        (out / f"{subj['id']}.json").write_text(
            json.dumps(subj, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        manifest["subjects"].append(
            {
                "id": subj["id"],
                "name": subj["name"],
                "goal": subj["goal"][:80],
                "status": subj["status"],
                "ready_units": len(subj["units"]),
                "total_units": subj["total_units"],
                "file": f"{subj['id']}.json",
                "size_kb": round((out / f"{subj['id']}.json").stat().st_size / 1024, 1),
            }
        )
        print(f"{subj['id']}: {len(subj['units'])}/{subj['total_units']} units")
    (out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print("manifest:", len(manifest["subjects"]), "subjects")


if __name__ == "__main__":
    main()
