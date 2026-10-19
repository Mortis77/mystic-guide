#!/usr/bin/env python3
"""renderTools 追加：梅花易数 + 六爻起卦。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

addition = '''
    /* 梅花易数 */
    const HG = window.MG_HEX;
    const mh = el('div', 'tool');
    mh.innerHTML = `
      <h3>梅花易数</h3>
      <div class="t-sub">报两个数起卦，数数之和定时辰</div>
      <div class="row2">
        <input id="mhA" type="number" placeholder="上卦数" value="1" min="1">
        <input id="mhB" type="number" placeholder="下卦数" value="1" min="1">
      </div>
      <button class="btn" id="mhGo">起卦</button>
      <div id="mhOut"></div>
    `;
    v.appendChild(mh);
    const renderHex = (box, hex, label, moving) => {
      const lines = hex.bits.map((b, i) => {
        const mark = moving !== undefined && moving === i ? ' ●' : '';
        return `<div style="font-family:monospace;font-size:15px;letter-spacing:3px">${b ? '▬▬▬▬▬' : '▬▬ ▬▬'}${mark}</div>`;
      }).reverse().join('');
      const yaoText = moving !== undefined && hex.yao[moving] ? `<div class="muted" style="margin-top:8px">动爻：${escapeHTML(hex.yao[moving])}</div>` : '';
      return `
        <div style="margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:12px">
          <div class="muted">${label}</div>
          <div style="font-size:17px;color:var(--gold-soft);margin:4px 0 8px">${escapeHTML(hex.full)}</div>
          ${lines}
          <div style="font-size:12px;line-height:1.7;margin-top:8px;opacity:.85">${escapeHTML((hex.line || '').slice(0, 70))}</div>
          ${yaoText}
        </div>`;
    };
    mh.querySelector('#mhGo').addEventListener('click', async () => {
      await HG.load();
      const a = parseInt(mh.querySelector('#mhA').value || '1', 10);
      const b = parseInt(mh.querySelector('#mhB').value || '1', 10);
      const r = HG.meihua(a, b, new Date().getHours());
      mh.querySelector('#mhOut').innerHTML =
        `<div class="muted" style="margin-top:10px">动爻：第 ${r.moving + 1} 爻</div>` +
        renderHex(mh, r.primary, '本卦', r.moving) +
        renderHex(mh, r.changed, '变卦');
    });

    /* 六爻 */
    const ly = el('div', 'tool');
    ly.innerHTML = `
      <h3>六爻</h3>
      <div class="t-sub">三枚钱摇六次，从初爻到上爻</div>
      <button class="btn" id="lyGo">摇一卦</button>
      <div id="lyOut"></div>
    `;
    v.appendChild(ly);
    ly.querySelector('#lyGo').addEventListener('click', async () => {
      await HG.load();
      const lines = [];
      for (let i = 0; i < 6; i++) lines.push(HG.tossLine());
      const r = HG.liuyao(lines);
      const names = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' };
      const list = r.lines.map((v, i) => `<div class="kv" style="font-size:12px"><span class="k">${['初','二','三','四','五','上'][i]}爻</span><span>${names[v]}${v === 6 || v === 9 ? ' ●动' : ''}</span></div>`).join('');
      ly.querySelector('#lyOut').innerHTML =
        list +
        renderHex(ly, r.primary, '本卦', r.moving.length === 1 ? r.moving[0] : undefined) +
        (r.changed ? renderHex(ly, r.changed, '变卦') : '');
    });
'''

needle = "  }\n\n  /* ---------------- 视图：我的 ---------------- */"
if needle not in s:
    print("FAIL anchor")
    sys.exit(1)
s = s.replace(needle, addition + needle, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
