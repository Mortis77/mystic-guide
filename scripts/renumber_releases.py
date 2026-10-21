#!/usr/bin/env python3
"""把归档里的 1.x 版本重编成测试期 0.x 编号。

映射：1.0.0→0.1.0 … 1.6.0→0.7.0（0.8.0 已是当前版，不重建）
versionCode 保持原值，保证历史顺序不变。
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

ARCHIVE = Path("E:/魔女手札")
SRC_ROOT = ARCHIVE / "source"
APK_DIR = ARCHIVE / "apk"
PROJ = Path("C:/dsh-test/mystic-guide")
JAVA = r"C:\dsh-test\mystic-guide\.toolchain\jdk\jdk-17.0.2"
GRADLE = r"C:\dsh-test\mystic-guide\.toolchain\gradle\gradle-8.7\bin\gradle.bat"
SDK = r"C:\dsh-test\mystic-guide\.toolchain\sdk"

MAP = {
    "1.0.0": "0.1.0",
    "1.1.0": "0.2.0",
    "1.2.0": "0.3.0",
    "1.3.0": "0.4.0",
    "1.4.0": "0.5.0",
    "1.5.0": "0.6.0",
    "1.6.0": "0.7.0",
}
CODE = {"0.1.0": 10000, "0.2.0": 10100, "0.3.0": 10200, "0.4.0": 10300,
        "0.5.0": 10400, "0.6.0": 10500, "0.7.0": 10600}


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for old, new in MAP.items():
        if only and only not in (old, new):
            continue
        src = SRC_ROOT / f"v{old}" / "mystic-guide"
        if not src.exists():
            print(f"[{old}] 快照不存在，跳过")
            continue
        work = Path(f"C:/dsh-test/_rebuild_{new}")
        if work.exists():
            shutil.rmtree(work)
        shutil.copytree(src, work, ignore=shutil.ignore_patterns(".git", "build", ".gradle", ".toolchain"))

        # 改显示版本
        (work / "docs" / "version.js").write_text(
            f'window.MG_VERSION = {{ version: "{new}", builtAt: "2026-10-21" }};\n', encoding="utf-8")

        # gradle 里的 versionCode / versionName
        gp = work / "android" / "app" / "build.gradle.kts"
        g = gp.read_text(encoding="utf-8")
        g = re.sub(r"versionCode = \d+", f"versionCode = {CODE[new]}", g)
        g = re.sub(r'versionName = "[^"]*"', f'versionName = "{new}"', g)
        gp.write_text(g, encoding="utf-8")

        # assets + local.properties
        www = work / "android" / "app" / "src" / "main" / "assets" / "www"
        if www.exists():
            shutil.rmtree(www)
        shutil.copytree(work / "docs", www)
        (work / "android" / "local.properties").write_text(f"sdk.dir={SDK.replace(chr(92), chr(92)*2)}\n", encoding="utf-8")

        # 编译
        import os
        env = os.environ.copy()
        env["JAVA_HOME"] = JAVA
        env["PATH"] = JAVA + r"\bin;" + env.get("PATH", "")
        r = subprocess.run(["cmd", "/c", GRADLE, "assembleDebug", "--no-daemon"],
                           cwd=str(work / "android"), env=env, capture_output=True, text=True, errors="ignore")
        apk = work / "android" / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
        if apk.exists():
            dst = APK_DIR / f"魔女手札-v{new}.apk"
            shutil.copy2(apk, dst)
            print(f"[{old} -> {new}] ok  {dst.stat().st_size//1024}KB  code={CODE[new]}")
        else:
            print(f"[{old} -> {new}] 编译失败")
            print((r.stdout or "")[-800:])
            print((r.stderr or "")[-800:])


if __name__ == "__main__":
    main()
