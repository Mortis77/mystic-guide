#!/usr/bin/env python3
"""追加：择时助手 + 行星对应速查。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 择时助手 */
    const T3 = window.MG_TOOLS3;
    const pick = el('div', 'tool');
    pick.innerHTML = `
      <h3>择时助手</h3>
      <div class="t-sub">挑要做的事，给出未来七天的对应时辰</div>
      <select id="pkIntent">
        ${Object.keys(T3.INTENT).map((k) => `<option>${k}</option>`).join('')}
      </select>
      <div id="pkOut"></div>
    `;
    v.appendChild(pick);
    const drawPick = () => {
      const intent = pick.querySelector('#pkIntent').value;
      const out = pick.querySelector('#pkOut');
      try {
        const r = T3.findWindows(intent, 7, 31.23, 121.47);
        out.innerHTML = r.windows.length
          ? r.windows.map((w) => `
            <div class="kv" style="align-items:flex-start;font-size:12px">
              <span class="k" style="min-width:76px">${w.date}<br><span style="opacity:.6">周${w.week}${w.isPlanetDay ? ' · ' + r.planet + '日' : ''}</span></span>
              <span style="text-align:right">${w.slots.map((x) => x.label + ' ' + x.time).join('<br>')}${w.moon ? '<br><span style="opacity:.6">' + w.moon.name + ' ' + w.moon.illum + '%</span>' : ''}</span>
            </div>`).join('')
          : '<div class="muted" style="margin-top:10px">这一周没有合适的时辰。</div>';
      } catch (e) {
        out.innerHTML = '<div class="muted">算不出来。</div>';
      }
    };
    pick.querySelector('#pkIntent').addEventListener('change', drawPick);
    drawPick();

    /* 行星对应 */
    const corr = el('div', 'tool');
    corr.innerHTML = '<h3>行星对应</h3><div class="t-sub">金属、颜色、当值日、草木与用途</div>';
    const body = el('div');
    Object.entries(T3.CORR).forEach(([name, c]) => {
      const row = el('div');
      row.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--line)';
      row.innerHTML = `
        <div style="font-size:14px;color:var(--gold-soft);margin-bottom:4px">${T3.SYM[name]} ${name}<span style="font-size:11px;color:var(--text-dim);margin-left:8px">${c.day}</span></div>
        <div style="font-size:11px;color:var(--text-dim);line-height:1.8">
          ${c.metal} · ${c.color}<br>${c.plant}<br>${c.stone}<br><span style="opacity:.75">${c.use}</span>
        </div>`;
      body.appendChild(row);
    });
    corr.appendChild(body);
    v.appendChild(corr);
'''

needle = "  }\n\n  /* ---------------- 视图：我的 ---------------- */"
if needle not in s:
    print("FAIL anchor")
    sys.exit(1)
s = s.replace(needle, addition + needle, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
