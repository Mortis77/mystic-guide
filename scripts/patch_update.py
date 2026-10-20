#!/usr/bin/env python3
"""设置页增加「检查更新」区块。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 检查更新 */
    const U = window.MG_UPDATE;
    const up = el('div', 'subject');
    up.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>版本</h3>
          <div class="muted">当前 v${escapeHTML(U.localVersion)}</div>
        </div>
        <button class="btn ghost" id="upBtn">检查更新</button>
      </div>
      <div id="upOut"></div>
    `;
    v.appendChild(up);
    up.querySelector('#upBtn').addEventListener('click', async () => {
      const out = up.querySelector('#upOut');
      out.innerHTML = '<div class="muted" style="margin-top:10px">正在查…</div>';
      try {
        const r = await U.check();
        if (!r.hasUpdate) {
          out.innerHTML = `<div class="muted" style="margin-top:10px">已经是最新版（v${escapeHTML(r.latest)}）。</div>`;
          return;
        }
        out.innerHTML = `
          <div class="muted" style="margin-top:12px;line-height:1.8">
            发现新版本 <span style="color:var(--gold-soft)">v${escapeHTML(r.latest)}</span>
            ${r.apkSize ? ' · ' + r.apkSize + ' MB' : ''}
            ${r.notes ? '<br><span style="opacity:.8">' + escapeHTML(r.notes.slice(0, 160)) + '</span>' : ''}
          </div>
          <button class="btn" id="upGo" style="margin-top:10px">${U.canInstall() ? '下载并安装' : '下载 APK'}</button>
          <div class="muted" style="margin-top:8px;font-size:11px">${U.canInstall() ? '会直接调用系统安装器' : '浏览器里只能下载，下载完点开那个文件安装'}</div>
        `;
        const go = out.querySelector('#upGo');
        if (go) {
          go.addEventListener('click', async () => {
            go.disabled = true;
            go.textContent = '正在下载…';
            try {
              const how = await U.install(r.apkUrl);
              go.textContent = how === 'installing' ? '已交给系统安装' : '已开始下载';
            } catch (e) {
              go.textContent = '失败了，重试';
              go.disabled = false;
            }
          });
        }
      } catch (e) {
        out.innerHTML = `<div class="muted" style="margin-top:10px">${escapeHTML(e.message)}</div>`;
      }
    });
'''

needle = "  /* ---------------- 视图：我的 ---------------- */"
if needle not in s:
    print("FAIL anchor")
    sys.exit(1)
# 插到 renderMe 开头（在「统计」之后较靠前的位置也行，这里放到函数体最前面）
s = s.replace("  function renderMe() {\n    const v = $('#view');\n    v.innerHTML = '';\n",
              "  function renderMe() {\n    const v = $('#view');\n    v.innerHTML = '';\n" + addition, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
