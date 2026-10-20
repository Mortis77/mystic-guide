#!/usr/bin/env python3
"""把「我的」页改成零基础友好：主推文件导出导入，云同步折叠进进阶；并加首次引导。"""
import re
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

# ---------- 1. 替换整个同步区块 ----------
me = s.find("function renderMe()")
start = s.find("    const S = window.MG_SYNC;", me)
end = s.find("    const up = el('div', 'card');", start)
if start == -1 or end == -1:
    print("FAIL: sync block not found")
    sys.exit(1)

new_sync = '''    const S = window.MG_SYNC;
    const cfg = S.cfg();

    /* 换设备：文件导出导入（主推，零门槛） */
    const move = el('div', 'card');
    move.innerHTML = `
      <div class="row-link"><span>换手机时保住进度</span><span class="k2">推荐</span></div>
      <div class="muted" style="margin-top:8px;line-height:1.9">
        老的手机上点「导出」会存一个小文件，把它发到新手机（微信、QQ、U 盘都行），
        在新手机上点「导入」，学习记录就接上了。不需要注册任何账号。
      </div>
      <div class="switch-row" style="margin-top:12px">
        <button id="mvExp">导出</button><button id="mvImp">导入</button>
      </div>
      <div id="mvOut" class="muted" style="margin-top:10px"></div>`;
    v.appendChild(move);
    move.querySelector('#mvExp').addEventListener('click', () => {
      S.exportFile(state);
      move.querySelector('#mvOut').textContent = '已导出，去手机的「下载」文件夹里找那个 .json 文件';
    });
    move.querySelector('#mvImp').addEventListener('click', async () => {
      try {
        const remote = await S.importFile();
        state = Object.assign(state, S.merge(state, remote));
        save();
        move.querySelector('#mvOut').textContent = '已导入，进度合并好了';
        render();
      } catch (e) {
        move.querySelector('#mvOut').textContent = '这个文件读不了，换一个试试';
      }
    });

    /* 自动云同步（折叠，给愿意折腾的人） */
    const adv = el('div', 'card');
    adv.innerHTML = `
      <div class="row-link" id="advToggle"><span>自动云同步（进阶）</span><span class="k2">需 GitHub 账号 ›</span></div>
      <div id="advBody" style="display:none"></div>`;
    v.appendChild(adv);
    adv.querySelector('#advToggle').addEventListener('click', () => {
      const b = adv.querySelector('#advBody');
      b.style.display = b.style.display === 'none' ? 'block' : 'none';
    });
    adv.querySelector('#advBody').innerHTML = `
      <div class="muted" style="line-height:1.9;margin-top:10px">
        做得成的话，每学完一节会自动把进度存到网上，几台设备之间不用手传文件。<br><br>
        <b>需要准备：</b><br>
        ① 一个 GitHub 账号（github.com，免费注册）；<br>
        ② 一串叫「访问令牌」的密码。取法：登录后点右上角头像 → Settings →
        左侧拉到最底 Developer settings → Personal access tokens → Tokens (classic) →
        Generate new token → 勾选 <b>gist</b> 那一项 → 生成 → 复制那一串（只显示一次）。<br>
        ③ 把令牌粘到下面，点「建立」。它会给出一串编号，记下来——另一台设备填同一个编号就能同步。
      </div>
      <input id="syT" placeholder="粘贴访问令牌" value="${esc(cfg.token || '')}" style="margin-top:10px">
      <input id="syG" placeholder="编号（第一台留空）" value="${esc(cfg.gist || '')}" style="margin-top:8px">
      <div class="switch-row" style="margin-top:10px">
        <button id="syNew">建立</button><button id="syUp">上传</button><button id="syDown">拉取</button>
      </div>
      <div id="syOut" class="muted" style="margin-top:10px"></div>`;
    const out = (m) => (adv.querySelector('#syOut').textContent = m);
    const args = () => ({
      token: adv.querySelector('#syT').value.trim(),
      gist: adv.querySelector('#syG').value.trim(),
    });
    adv.querySelector('#syNew').addEventListener('click', async () => {
      const a = args();
      if (!a.token) { out('先把访问令牌粘进来'); return; }
      out('正在建立…');
      try {
        const id = await S.createGist(a.token, state);
        adv.querySelector('#syG').value = id;
        S.saveCfg({ token: a.token, gist: id });
        out('建好了。编号：' + id + '（记下来）');
      } catch (e) { out('没成功：' + e.message); }
    });
    adv.querySelector('#syUp').addEventListener('click', async () => {
      const a = args();
      if (!a.token || !a.gist) { out('令牌和编号都要填'); return; }
      S.saveCfg(a); out('上传中…');
      try { await S.push(a.token, a.gist, state); out('已上传'); } catch (e) { out('没成功：' + e.message); }
    });
    adv.querySelector('#syDown').addEventListener('click', async () => {
      const a = args();
      if (!a.token || !a.gist) { out('令牌和编号都要填'); return; }
      S.saveCfg(a); out('拉取中…');
      try {
        const remote = await S.pull(a.token, a.gist);
        state = Object.assign(state, S.merge(state, remote)); save(); out('已合并'); render();
      } catch (e) { out('没成功：' + e.message); }
    });

'''
s = s[:start] + new_sync + s[end:]

# ---------- 2. 更新区块文案 ----------
s = s.replace(
    "<div class=\"row-link\"><span>版本</span><span class=\"k2\">v${esc(window.MG_UPDATE.localVersion)}</span></div>\n      <button class=\"btn ghost\" id=\"upBtn\" style=\"margin-top:10px\">检查更新</button>",
    "<div class=\"row-link\"><span>有新版本了吗</span><span class=\"k2\">现在是 v${esc(window.MG_UPDATE.localVersion)}</span></div>\n      <button class=\"btn ghost\" id=\"upBtn\" style=\"margin-top:10px\">看看有没有新版</button>"
)
s = s.replace("o.textContent = '正在查…';", "o.textContent = '正在看…';")
s = s.replace("if (!r.hasUpdate) { o.textContent = '已是最新（v' + r.latest + '）'; return; }",
              "if (!r.hasUpdate) { o.textContent = '已经是最新的了'; return; }")
s = s.replace("o.innerHTML = `发现 v${r.latest}（${r.apkSize} MB）`;",
              "o.innerHTML = `有新版本（${r.apkSize} MB），点下面按钮直接装`;")
s = s.replace("const b = el('button', 'btn', '下载并安装');", "const b = el('button', 'btn', '下载并安装');")
s = s.replace("b.textContent = '下载中…';", "b.textContent = '正在下载，别关这个页面…';")

# ---------- 3. 首次引导 ----------
guide = '''
  /* ---------- 首次引导 ---------- */
  function showGuide() {
    const pages = [
      {
        icon: '◆',
        title: '神秘指南',
        body: '这里放的是成体系的微课：每天两三分钟，一节讲清一件事。<br><br>不用先学什么，打开就能从第一节开始。',
      },
      {
        icon: '▤',
        title: '怎么学',
        body: '底部「今天」是当前这一门课的下一节，点「开始」就行。<br><br>学完一节会自动记进度，连续天数从这天开始算。',
      },
      {
        icon: '▥',
        title: '书和工具',
        body: '「书库」里有六十六本书，点「下载」或「阅读」都能看。<br><br>「工具」里是排盘、月相、黄历这些随手要用的东西。',
      },
    ];
    let i = 0;
    const mask = el('div');
    mask.style.cssText = 'position:fixed;inset:0;z-index:99;background:var(--bg);display:flex;flex-direction:column;justify-content:center;padding:36px 28px;max-width:680px;margin:0 auto;';
    const draw = () => {
      const p = pages[i];
      mask.innerHTML = `
        <div style="text-align:center;font-size:44px;color:var(--gold-soft);margin-bottom:24px">${p.icon}</div>
        <h2 style="text-align:center;font-size:22px;margin:0 0 18px">${p.title}</h2>
        <div style="color:var(--text-dim);font-size:15px;line-height:1.9;text-align:center">${p.body}</div>
        <div style="margin-top:auto;padding-top:36px">
          <div style="display:flex;gap:6px;justify-content:center;margin-bottom:18px">
            ${pages.map((_, j) => `<span style="width:6px;height:6px;border-radius:50%;background:${j === i ? 'var(--gold)' : 'var(--line)'}"></span>`).join('')}
          </div>
          <button class="btn" id="gNext">${i === pages.length - 1 ? '开始用' : '下一步'}</button>
        </div>`;
      mask.querySelector('#gNext').addEventListener('click', () => {
        if (i === pages.length - 1) {
          state.guided = true;
          save();
          mask.remove();
          go({ name: 'today' });
        } else {
          i++;
          draw();
        }
      });
    };
    draw();
    document.body.appendChild(mask);
  }

'''
s = s.replace("  async function main() {", guide + "  async function main() {")
s = s.replace("    await boot();\n    go({ name: 'today' });",
              "    await boot();\n    go({ name: 'today' });\n    if (!state.guided) showGuide();")

p.write_text(s, encoding="utf-8")
print("patched", len(s), "bytes")
