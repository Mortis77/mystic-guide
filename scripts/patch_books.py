#!/usr/bin/env python3
"""renderBooks 追加：本地上传、我的书、公开投稿。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 我的书：本地上传 */
    const L = window.MG_LOCAL;
    const mine = el('div', 'tool');
    mine.style.marginTop = '26px';
    mine.innerHTML = `
      <h3>我的书</h3>
      <div class="t-sub">自己上传的 PDF 只存在这台设备上，不上传就不会发给任何人</div>
      <input id="lbFile" type="file" accept="application/pdf" multiple style="display:none">
      <button class="btn" id="lbPick">选择 PDF 上传</button>
      <div id="lbList"></div>
    `;
    v.appendChild(mine);

    const renderMine = async () => {
      const recs = (await L.list()).sort((a, b) => b.addedAt - a.addedAt);
      const box = mine.querySelector('#lbList');
      if (!recs.length) { box.innerHTML = '<div class="muted" style="margin-top:12px">还没有自己上传的书。</div>'; return; }
      box.innerHTML = '';
      recs.forEach((rec) => {
        const row = el('div', 'book');
        row.innerHTML = `
          <div class="b-main">
            <div class="b-title">${escapeHTML(rec.title)}</div>
            <div class="b-meta">${(rec.size / 1048576).toFixed(1)} MB${rec.public ? ' · 已投稿' : ''}</div>
          </div>
        `;
        const openBtn = el('button', 'b-btn', '打开');
        openBtn.addEventListener('click', () => window.open(L.urlOf(rec), '_blank'));
        const pubBtn = el('button', 'b-btn', rec.public ? '再投稿' : '公开');
        pubBtn.addEventListener('click', () => {
          window.open(L.submitUrl(rec), '_blank');
        });
        const delBtn = el('button', 'b-btn', '删');
        delBtn.addEventListener('click', async () => {
          if (!confirm(`删掉《${rec.title}》？`)) return;
          await L.del(rec.id);
          renderMine();
        });
        row.appendChild(openBtn);
        row.appendChild(pubBtn);
        row.appendChild(delBtn);
        box.appendChild(row);
      });
    };

    mine.querySelector('#lbPick').addEventListener('click', () => mine.querySelector('#lbFile').click());
    mine.querySelector('#lbFile').addEventListener('change', async (ev) => {
      const files = [...ev.target.files];
      if (!files.length) return;
      for (const f of files) {
        if (!/pdf$/i.test(f.name)) continue;
        await L.addFile(f, {});
      }
      ev.target.value = '';
      renderMine();
    });
    renderMine();
'''

needle = "      v.appendChild(card);\n    });\n  }\n\n  /* ---------------- 视图：工具 ---------------- */"
if needle not in s:
    print("FAIL anchor")
    sys.exit(1)
s = s.replace(needle, "      v.appendChild(card);\n    });\n" + addition + "  }\n\n  /* ---------------- 视图：工具 ---------------- */", 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
