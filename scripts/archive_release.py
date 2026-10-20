#!/usr/bin/env python3
"""把某个版本的 APK 与源码快照归档到 E:\\神秘指南。

用法：
  python archive_release.py <apk路径> <版本号> [说明]
  python archive_release.py --snapshot-only <版本号>
"""
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

ARCHIVE = Path("E:/神秘指南")
APK_DIR = ARCHIVE / "apk"
SRC_DIR = ARCHIVE / "source"
MANIFEST = ARCHIVE / "versions.json"

SKIP_DIRS = {".git", ".gradle", "build", "node_modules", ".data", "apkout", "apknew", ".toolchain"}


def ensure_dirs():
    for d in (ARCHIVE, APK_DIR, SRC_DIR):
        d.mkdir(parents=True, exist_ok=True)


def load_manifest():
    if MANIFEST.exists():
        try:
            return json.loads(MANIFEST.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"project": "神秘指南", "versions": []}


def save_manifest(m):
    MANIFEST.write_text(json.dumps(m, ensure_ascii=False, indent=1), encoding="utf-8")


def snapshot(version, root=Path("C:/dsh-test/mystic-guide")):
    dst = SRC_DIR / f"v{version}"
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True)

    def ignore(dirpath, names):
        return [n for n in names if n in SKIP_DIRS]

    shutil.copytree(root, dst / "mystic-guide", ignore=ignore, dirs_exist_ok=True)
    return dst


def main():
    ensure_dirs()
    args = sys.argv[1:]

    if args and args[0] == "--snapshot-only":
        version = args[1]
        dst = snapshot(version)
        print(f"snapshot -> {dst}")
        return

    if len(args) < 2:
        print(__doc__)
        sys.exit(2)

    apk_path = Path(args[0])
    version = args[1].lstrip("v")
    note = args[2] if len(args) > 2 else ""

    if not apk_path.exists():
        print(f"APK 不存在：{apk_path}")
        sys.exit(1)

    dst_apk = APK_DIR / f"神秘指南-v{version}.apk"
    shutil.copy2(apk_path, dst_apk)

    src = snapshot(version)

    m = load_manifest()
    m["versions"] = [v for v in m["versions"] if v["version"] != version]
    m["versions"].append({
        "version": version,
        "archived_at": datetime.now().isoformat(timespec="seconds"),
        "apk": dst_apk.name,
        "apk_mb": round(dst_apk.stat().st_size / 1048576, 2),
        "source": f"source/v{version}",
        "note": note,
    })
    m["versions"].sort(key=lambda v: [int(x) if x.isdigit() else 0 for x in v["version"].split(".")])
    save_manifest(m)

    print(f"archived v{version}")
    print(f"  apk    -> {dst_apk}")
    print(f"  source -> {src}")


if __name__ == "__main__":
    main()
