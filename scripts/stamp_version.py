#!/usr/bin/env python3
"""把版本号写进 docs/version.js 与 android/app/build.gradle.kts。"""
import re
import sys
from datetime import date
from pathlib import Path

version = sys.argv[1].lstrip("v") if len(sys.argv) > 1 else "1.0.0"
root = Path(__file__).resolve().parent.parent

# 1) version.js
js = f'window.MG_VERSION = {{ version: "{version}", builtAt: "{date.today().isoformat()}" }};\n'
(root / "docs" / "version.js").write_text(js, encoding="utf-8")

# 2) build.gradle.kts：versionName + versionCode（用 major*10000+minor*100+patch）
parts = [int(x) for x in re.split(r"[.+]", version) if x.isdigit()][:3]
while len(parts) < 3:
    parts.append(0)
code = parts[0] * 10000 + parts[1] * 100 + parts[2]

gp = root / "android" / "app" / "build.gradle.kts"
s = gp.read_text(encoding="utf-8")
s = re.sub(r'versionCode = \d+', f"versionCode = {code}", s)
s = re.sub(r'versionName = "[^"]*"', f'versionName = "{version}"', s)
gp.write_text(s, encoding="utf-8")

print(f"version={version} code={code}")
