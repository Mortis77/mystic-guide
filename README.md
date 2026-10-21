# 魔女手札 · Witch’s Notebook

每天两三分钟的神秘学微课。内容来自自己的学习档案，按单元拆成微课，像多邻国那样一次刷一节。

- **形态**：PWA + 安卓壳（WebView）。浏览器里「添加到主屏幕」就是全屏 App；安卓壳推 GitHub 后由 Actions 自动编 APK。
- **内容**：全部课程放在本仓库 `docs/content/`，App 内可按科目下载。
- **节奏**：一个单元两三分钟，含 1–2 道题；完成即计一天连续。

## 目录

```
app/                 PWA 本体（就是这个目录被当作站点根）
  index.html
  style.css
  app.js
  sw.js              离线缓存
  manifest.webmanifest
  icons/             应用图标
  content/           课程内容包（由脚本生成）
scripts/
  export_content.py  从 StudyMate 工作区导出内容包
android/             安卓壳（WebView）
.github/workflows/   CI：自动构建 APK
```

## 内容从哪来

内容由 `scripts/export_content.py` 从 StudyMate 学习工作区导出：

```bash
python scripts/export_content.py "C:/Users/Mors/StudyMate" "docs/content"
```

它读取每个科目的 `subject.yaml`、`curriculum.yaml`、`lessons/*.md` 与同名 `.quiz.json`，
把 Markdown（含 `::: quiz` / `::: svg` / `::: tip` 等自定义块）翻译成 App 能渲染的 JSON。

新增或修改课件后，重跑一次脚本、提交 `docs/content/`，App 里「书库 → 从内容源刷新清单」就能拿到新版本。

## 装到手机

### 方式一：PWA（立刻可用）

1. 把 `docs/` 目录部署到任意静态托管（GitHub Pages 就够）。
2. 安卓 Chrome 打开那个地址 → 菜单 → **添加到主屏幕**。
3. 图标会出现在桌面，点开是全屏、可离线。

### 方式二：APK

1. 推送到 GitHub 后，Actions 会跑 `.github/workflows/android.yml`。
2. 在仓库 **Releases** 或 Actions 产物里下载 `app-debug.apk`。
3. 手机允许「安装未知来源」后安装。

## 已装内容

内容会随课程推进增长：每完成一个单元的课件，重跑导出脚本就会多一节。
当前进度见 `docs/content/manifest.json` 的 `ready_units / total_units`。

## 许可

课程文字来自个人学习档案，随仓库一并开源，仅供学习与个人研究使用。

## 版本号规则

本项目按语义化版本（SemVer）走：`MAJOR.MINOR.PATCH`

- **MAJOR**：不兼容的改动——改了本地存储格式、旧数据读不出来、接口变了
- **MINOR**：新增功能——接一个新工具、开一个新板块
- **PATCH**：修 bug、改文案、调样式

**课程内容更新不升版本。** 内容在 `docs/content/` 里，App 启动时动态加载；加课、补题库、改课件都只改内容，不该让用户重装 APK。要发内容更新就重跑导出脚本、提交，不必动版本号。

当前版本见 `docs/version.js`。发版流程：

```bash
python scripts/stamp_version.py 1.6.0     # 只在这三种情况改版本号
# 内容更新则跳过这一步，直接导出
python scripts/export_content.py "C:/Users/Mors/StudyMate" "docs/content"
python scripts/archive_release.py <apk> 1.6.0 "这次改了什么"
```
## 测试期版本策略（0.x）

当前处于测试期，显示版本用 `0.x.y`；`1.0.0` 留给正式版。

安卓只认 `versionCode`，不认显示版本号，所以两者分开：

- 显示版本（`versionName`）：0.x，给人看
- 装机序号（`versionCode`）：独立递增，确保新版能覆盖旧版安装

```bash
python scripts/stamp_version.py 0.9.0    # versionCode 自动 +1
```

已发出过的 1.x 版本号保留（历史不改），从 0.8.0 起回到测试期序列。
