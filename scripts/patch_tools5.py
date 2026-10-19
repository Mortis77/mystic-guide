#!/usr/bin/env python3
"""renderTools 追加：万年历 + 罗盘 + 立极尺。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 万年历 */
    const T5 = window.MG_TOOLS5;
    const cal = el('div', 'tool');
    const now2 = new Date();
    cal.innerHTML = `
      <h3>万年历</h3>
      <div class="t-sub">公历、农历、节气对照</div>
      <div class="row2">
        <select id="calY">${Array.from({ length: 21 }, (_, i) => now2.getFullYear() - 10 + i).map((y) => `<option ${y === now2.getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}</select>
        <select id="calM">${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => `<option ${m === now2.getMonth() + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select>
      </div>
      <div id="calOut"></div>
    `;
    v.appendChild(cal);
    const drawCal = () => {
      const y = +cal.querySelector('#calY').value;
      const m = +cal.querySelector('#calM').value;
      const g = T5.monthGrid(y, m);
      const head = ['日', '一', '二', '三', '四', '五', '六'].map((d) => `<div style="text-align:center;font-size:10px;color:var(--text-dim);padding:4px 0">${d}</div>`).join('');
      const body = g.cells.map((c) => {
        if (!c) return '<div></div>';
        const jq = c.jieqi ? `<div style="font-size:9px;color:var(--gold-soft)">${c.jieqi}</div>` : '';
        return `<div style="text-align:center;padding:3px 0;border-radius:6px;${c.weekend ? 'background:rgba(201,162,39,.06)' : ''}">
          <div style="font-size:13px;color:${c.weekend ? 'var(--gold-soft)' : 'var(--text)'}">${c.d}</div>
          <div style="font-size:9px;color:var(--text-dim)">${c.lunarDay}</div>${jq}</div>`;
      }).join('');
      cal.querySelector('#calOut').innerHTML =
        `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:10px">${head}${body}</div>`;
    };
    cal.querySelector('#calY').addEventListener('change', drawCal);
    cal.querySelector('#calM').addEventListener('change', drawCal);
    drawCal();

    /* 罗盘 */
    const cmp = el('div', 'tool');
    cmp.innerHTML = `
      <h3>罗盘</h3>
      <div class="t-sub">手机朝向与二十四山（需要方向传感器）</div>
      <button class="btn" id="cmpGo">开启罗盘</button>
      <div id="cmpOut"></div>
    `;
    v.appendChild(cmp);
    cmp.querySelector('#cmpGo').addEventListener('click', () => {
      const out = cmp.querySelector('#cmpOut');
      out.innerHTML = '<div class="muted" style="margin-top:10px">正在读方向…</div>';
      T5.watchCompass((r) => {
        const deg = r.heading.toFixed(1);
        out.innerHTML = `
          <div style="position:relative;width:190px;height:190px;margin:16px auto">
            <svg viewBox="0 0 200 200" style="width:100%;height:100%;transform:rotate(${-r.heading}deg)">
              <circle cx="100" cy="100" r="92" fill="none" stroke="#3a3348" stroke-width="1.5"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#3a3348" stroke-width="1"/>
              ${Array.from({ length: 24 }, (_, i) => {
                const a = ((i * 15 - 7.5) * Math.PI) / 180;
                const x1 = 100 + Math.sin(a) * 70, y1 = 100 - Math.cos(a) * 70;
                const x2 = 100 + Math.sin(a) * 88, y2 = 100 - Math.cos(a) * 88;
                return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a3348" stroke-width="1"/>`;
              }).join('')}
              <polygon points="100,22 106,100 100,88 94,100" fill="#c9a227"/>
              <polygon points="100,178 106,100 100,112 94,100" fill="#5a5170"/>
            </svg>
          </div>
          <div style="text-align:center">
            <div style="font-size:26px;color:var(--gold-soft)">${r.shan} 山</div>
            <div class="muted">${r.dir} · ${r.bagua}卦 · ${deg}°</div>
          </div>
        `;
      }, (msg) => {
        out.innerHTML = `<div class="muted" style="margin-top:10px">${escapeHTML(msg)}</div>`;
      });
    });

    /* 立极尺 */
    const lj = el('div', 'tool');
    lj.innerHTML = `
      <h3>立极尺</h3>
      <div class="t-sub">量两处朝向的夹角，判坐向</div>
      <button class="btn ghost" id="ljA">记第一点</button>
      <button class="btn ghost" id="ljB" style="margin-top:8px">记第二点</button>
      <div id="ljOut" class="muted" style="margin-top:10px">还没有读数。站在立极点，分别朝向两处各按一次。</div>
    `;
    v.appendChild(lj);
    let a = null, b = null;
    const drawLJ = () => {
      const out = lj.querySelector('#ljOut');
      if (a == null) return;
      if (b == null) { out.innerHTML = `第一点：${a.toFixed(1)}°（${T5.shanOf(a)} 山）`; return; }
      let diff = Math.abs(a - b);
      if (diff > 180) diff = 360 - diff;
      out.innerHTML = `
        <div class="kv"><span class="k">第一点</span><span>${a.toFixed(1)}° · ${T5.shanOf(a)} 山</span></div>
        <div class="kv"><span class="k">第二点</span><span>${b.toFixed(1)}° · ${T5.shanOf(b)} 山</span></div>
        <div class="kv"><span class="k">夹角</span><span style="color:var(--gold-soft)">${diff.toFixed(1)}°</span></div>`;
    };
    T5.watchCompass((r) => { lj.dataset.cur = r.heading; }, () => {});
    lj.querySelector('#ljA').addEventListener('click', () => { a = parseFloat(lj.dataset.cur); drawLJ(); });
    lj.querySelector('#ljB').addEventListener('click', () => { b = parseFloat(lj.dataset.cur); drawLJ(); });
'''

needle = "  }\n\n  /* ---------------- 视图：我的 ---------------- */"
if needle not in s:
    print("FAIL anchor")
    sys.exit(1)
s = s.replace(needle, addition + needle, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
