#!/usr/bin/env python3
"""把版本号写进 docs/version.js 与 android/app/build.gradle.kts。

测试期（0.x）规则：
  - versionName 用 0.x.y，给人看
  - versionCode 独立递增（安卓只认它，确保能覆盖安装；不能用 0.x 推导，
    否则 1.0.0→0.8.0 会被当成降级而装不上）

用法：
  python stamp_version.py 0.8.0            # 只改 versionName，versionCode 自动 +1
  python stamp_version.py 0.8.0 --code 112 # 显式指定 versionCode
"""
import re
import sys
from datetime import date
from pathlib import Path

root = Path(__file__).resolve().parent.parent
gp = root / "android" / "app" / "build.gradle.kts"

version = sys.argv[1].lstrip("v") if len(sys.argv) > 1 else "0.8.0"

s = gp.read_text(encoding="utf-8")
m = re.search(r"versionCode = (\d+)", s)
current_code = int(m.group(1)) if m else 0

if "--code" in sys.argv:
    code = int(sys.argv[sys.argv.index("--code") + 1])
else:
    code = current_code + 1

(root / "docs" / "version.js").write_text(
    f'window.MG_VERSION = {{ version: "{version}", builtAt: "{date.today().isoformat()}" }};\n',
    encoding="utf-8",
)

s = re.sub(r"versionCode = \d+", f"versionCode = {code}", s)
s = re.sub(r'versionName = "[^"]*"', f'versionName = "{version}"', s)
gp.write_text(s, encoding="utf-8")

print(f"versionName={version}  versionCode={code}（上一个 {current_code}）")
