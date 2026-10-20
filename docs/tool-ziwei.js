/* 紫微斗数（用 iztro 库，浏览器 UMD） */
(() => {
  'use strict';
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  function ready() {
    const A = window.MG_APP;
    if (!A || !A.TOOL_VIEWS) { setTimeout(ready, 30); return; }
    A.TOOL_VIEWS.ziwei = (v) => {
      const box = el('div', 'tool');
      box.innerHTML = `
        <div class="t-sub">填出生时间与性别，排紫微斗数十二宫</div>
        <div class="row2"><input id="zwD" type="date" value="${today()}">
          <select id="zwH">${Array.from({ length: 12 }, (_, i) => `<option value="${i}" ${i === 6 ? 'selected' : ''}>${['早子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][i]}时</option>`).join('')}</select></div>
        <div class="row2" style="margin-top:8px">
          <select id="zwG"><option value="男">男</option><option value="女">女</option></select>
          <button class="btn" id="zwGo" style="margin-top:0">排盘</button>
        </div>
        <div id="zwOut"></div>`;
      v.appendChild(box);
      box.querySelector('#zwGo').addEventListener('click', () => {
        const out = box.querySelector('#zwOut');
        const iz = window.iztro;
        if (!iz) { out.innerHTML = '<div class="muted">排盘库没加载起来。</div>'; return; }
        const d = box.querySelector('#zwD').value;
        const h = +box.querySelector('#zwH').value;
        const g = box.querySelector('#zwG').value;
        try {
          const a = iz.astro.bySolar(d, h, g);
          const palaceRows = (a.palaces || []).map((p) => {
            const majors = (p.majorStars || []).map((s) => s.name).join(' ');
            const minors = (p.minorStars || []).slice(0, 4).map((s) => s.name).join(' ');
            return `<div class="kv" style="align-items:flex-start">
              <span class="k" style="min-width:62px">${esc(p.name)}<br><span style="opacity:.65">${esc(p.heavenlyStem)}${esc(p.earthlyBranch)}</span></span>
              <span style="text-align:right;font-size:12px">${esc(majors) || '<span style="opacity:.5">—</span>'}<br><span style="opacity:.65">${esc(minors)}</span></span>
            </div>`;
          }).join('');
          out.innerHTML = `
            <div class="kv"><span class="k">阳历</span><span>${esc(a.solarDate)}</span></div>
            <div class="kv"><span class="k">农历</span><span>${esc(a.lunarDate)}</span></div>
            <div class="kv"><span class="k">四柱</span><span>${(a.chineseDate || '')}</span></div>
            <div class="kv"><span class="k">五行局</span><span>${esc(a.fiveElementsClass)}</span></div>
            <div class="kv"><span class="k">命主 / 身主</span><span>${esc(a.soul)} / ${esc(a.body)}</span></div>
            <div style="margin-top:12px">${palaceRows}</div>`;
        } catch (e) {
          out.innerHTML = `<div class="muted">排不出来：${esc(e.message)}</div>`;
        }
      });
    };
  }
  ready();
})();
