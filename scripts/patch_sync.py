#!/usr/bin/env python3
"""设置页增加「跨设备同步」区块。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 跨设备同步 */
    const S = window.MG_SYNC;
    const sc = S.cfg();
    const sync = el('div', 'subject');
    sync.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>跨设备同步</h3>
          <div class="muted">走你自己的 GitHub Gist，不经过任何服务器</div>
        </div>
      </div>
      <input id="syToken" placeholder="GitHub token（只需 gist 权限）" value="${escapeAttr(sc.token || '')}" style="width:100%;margin-top:10px;padding:10px;background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--text);font-family:inherit;font-size:13px">
      <input id="syGist" placeholder="Gist ID（第一次留空，点建立会自动生成）" value="${escapeAttr(sc.gist || '')}" style="width:100%;margin-top:8px;padding:10px;background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--text);font-family:inherit;font-size:13px">
      <div class="row2" style="margin-top:10px;display:flex;gap:8px">
        <button class="btn ghost" id="syNew" style="flex:1">建立</button>
        <button class="btn ghost" id="syUp" style="flex:1">上传</button>
        <button class="btn ghost" id="syDown" style="flex:1">拉取</button>
      </div>
      <div class="row2" style="margin-top:8px;display:flex;gap:8px">
        <button class="btn ghost" id="syExp" style="flex:1">导出文件</button>
        <button class="btn ghost" id="syImp" style="flex:1">导入文件</button>
      </div>
      <div id="syOut" class="muted" style="margin-top:10px;font-size:11px"></div>
    `;
    v.appendChild(sync);

    const syOut = (msg) => { sync.querySelector('#syOut').textContent = msg; };
    const syArgs = () => ({
      token: sync.querySelector('#syToken').value.trim(),
      gist: sync.querySelector('#syGist').value.trim(),
    });
    const sySave = () => {
      const a = syArgs();
      S.saveCfg({ token: a.token, gist: a.gist });
    };

    sync.querySelector('#syNew').addEventListener('click', async () => {
      const a = syArgs();
      if (!a.token) { syOut('先填 token'); return; }
      syOut('正在建立…');
      try {
        const id = await S.createGist(a.token, state);
        sync.querySelector('#syGist').value = id;
        sySave();
        syOut('已建立，ID：' + id);
      } catch (e) { syOut(e.message); }
    });

    sync.querySelector('#syUp').addEventListener('click', async () => {
      const a = syArgs();
      if (!a.token || !a.gist) { syOut('token 和 Gist ID 都要有'); return; }
      syOut('正在上传…');
      try {
        sySave();
        await S.push(a.token, a.gist, state);
        syOut('上传完成');
      } catch (e) { syOut(e.message); }
    });

    sync.querySelector('#syDown').addEventListener('click', async () => {
      const a = syArgs();
      if (!a.token || !a.gist) { syOut('token 和 Gist ID 都要有'); return; }
      syOut('正在拉取…');
      try {
        sySave();
        const remote = await S.pull(a.token, a.gist);
        const merged = S.merge(state, remote);
        state = Object.assign(state, merged);
        saveState();
        syOut('已合并：完成 ' + Object.keys(state.done || {}).length + ' 节');
        render();
      } catch (e) { syOut(e.message); }
    });

    sync.querySelector('#syExp').addEventListener('click', () => {
      S.exportFile(state);
      syOut('已导出');
    });

    sync.querySelector('#syImp').addEventListener('click', async () => {
      try {
        const remote = await S.importFile();
        const merged = S.merge(state, remote);
        state = Object.assign(state, merged);
        saveState();
        syOut('已导入并合并');
        render();
      } catch (e) { syOut('导入失败：' + e.message); }
    });
'''

s = s.replace("    /* 检查更新 */", addition + "\n    /* 检查更新 */", 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
