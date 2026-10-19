#!/usr/bin/env python3
"""给 renderTools 追加：行星时 + 七日择日 两张卡片。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 行星时 */
    const ph = el('div', 'tool');
    const T2 = window.MG_TOOLS2;
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    ph.innerHTML = `
      <h3>行星时</h3>
      <div class="t-sub">当天的吉时，按迦勒底次序轮转（白天夜晚各十二段）</div>
      <input id="phDate" type="date" value="${iso(now)}">
      <div id="phOut"></div>
    `;
    v.appendChild(ph);
    const drawPH = () => {
      const val = ph.querySelector('#phDate').value;
      if (!val) return;
      const [y, m, dd] = val.split('-').map(Number);
      const d = new Date(y, m - 1, dd);
      const r = T2.planetaryHours(d, 31.23, 121.47); // 默认上海，后面可在设置里改
      const out = ph.querySelector('#phOut');
      if (!r) { out.innerHTML = '<div class="muted" style="margin-top:10px">这天算不出日出日落。</div>'; return; }
      const rows = r.hours.map((h) => `
        <div class="kv" style="font-size:12px">
          <span class="k">${h.day ? '日' : '夜'}${h.idx > 12 ? h.idx - 12 : h.idx} · ${T2.fmtHour(h.from)}–${T2.fmtHour(h.to)}</span>
          <span>${T2.PLANET_SYMBOL[h.planet]} ${h.planet}</span>
        </div>`).join('');
      out.innerHTML = `
        <div class="kv"><span class="k">当值</span><span>${T2.PLANET_SYMBOL[r.ruler]} ${r.ruler}日</span></div>
        <div class="kv"><span class="k">日出 / 日落</span><span>${T2.fmtHour(r.sunrise)} / ${T2.fmtHour(r.sunset)}</span></div>
        ${rows}
      `;
    };
    ph.querySelector('#phDate').addEventListener('change', drawPH);
    drawPH();

    /* 七日择日 */
    const wk = el('div', 'tool');
    wk.innerHTML = `
      <h3>七日择日</h3>
      <div class="t-sub">未来一周每天的干支与宜忌，挑日子用</div>
      <div id="wkOut"></div>
    `;
    v.appendChild(wk);
    try {
      const days = T2.upcoming(7);
      wk.querySelector('#wkOut').innerHTML = days.map((d) => `
        <div class="kv" style="align-items:flex-start;font-size:12px">
          <span class="k" style="min-width:78px">${d.date}<br><span style="opacity:.6">周${d.week} ${d.gz}</span></span>
          <span style="text-align:right">宜 ${(d.yi || []).slice(0, 5).join(' ') || '—'}<br><span style="opacity:.6">忌 ${(d.ji || []).slice(0, 5).join(' ') || '—'}</span></span>
        </div>`).join('');
    } catch (e) {
      wk.querySelector('#wkOut').innerHTML = '<div class="muted">读不出来。</div>';
    }
'''

needle = "  }\n\n  /* ---------------- 视图：我的 ---------------- */"
if needle not in s:
    print("FAIL: anchor not found")
    sys.exit(1)
s = s.replace(needle, addition + needle, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s), "bytes")
