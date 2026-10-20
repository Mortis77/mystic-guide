/* 各工具的具体界面（填充 MG_APP.TOOL_VIEWS） */
(() => {
  'use strict';
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function ready() {
    const A = window.MG_APP;
    if (!A) { setTimeout(ready, 30); return; }
    Object.assign(A.TOOL_VIEWS, VIEWS);
  }

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const VIEWS = {
    bazi(v) {
      const T = window.MG_TOOLS;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">填出生时间，按节气排四柱</div>
        <div class="row2"><input id="bzD" type="date" value="${todayStr()}"><input id="bzT" type="time" value="12:00"></div>
        <button class="btn" id="bzGo">排盘</button><div id="bzOut"></div>`;
      v.appendChild(box);
      box.querySelector('#bzGo').addEventListener('click', () => {
        const [y, m, d] = box.querySelector('#bzD').value.split('-').map(Number);
        const [hh, mm] = (box.querySelector('#bzT').value || '12:00').split(':').map(Number);
        const out = box.querySelector('#bzOut');
        try {
          const r = T.bazi(y, m, d, hh, mm);
          out.innerHTML = `<div class="pillars">${r.pillars.map((p) =>
            `<div class="pillar"><div class="p-label">${p.label}</div><div class="p-gz">${p.gz}</div><div class="p-wx">${p.wuxing}</div></div>`).join('')}</div>
            <div style="margin-top:14px">
              <div class="kv"><span class="k">纳音</span><span>${r.nayin.join(' · ')}</span></div>
              <div class="kv"><span class="k">十神</span><span>${r.shishen.join(' · ')}</span></div>
              <div class="kv"><span class="k">五行</span><span>${Object.entries(r.counts).map(([k, n]) => k + n).join(' ')}</span></div>
              <div class="kv"><span class="k">生肖</span><span>${r.shengxiao}</span></div>
              <div class="kv"><span class="k">农历</span><span>${r.lunarText}</span></div>
              ${r.missing.length ? `<div class="kv"><span class="k">缺</span><span>${r.missing.join('、')}</span></div>` : ''}
            </div>`;
        } catch (e) { out.innerHTML = `<div class="muted">${esc(e.message)}</div>`; }
      });
    },
    moon(v) {
      const T = window.MG_TOOLS;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">月龄与相位</div><input id="moD" type="date" value="${todayStr()}"><div id="moOut"></div>`;
      v.appendChild(box);
      const draw = () => {
        const [y, m, d] = box.querySelector('#moD').value.split('-').map(Number);
        const r = T.moonPhase(new Date(y, m - 1, d, 12));
        box.querySelector('#moOut').innerHTML = `<div class="moon"><div class="m-disc"></div><div>
          <div class="m-name">${r.phase.name}</div>
          <div class="muted">月龄 ${r.age.toFixed(1)} 天 · 亮面 ${r.illum}%</div>
          <div class="muted">${r.phase.note}</div></div></div>`;
      };
      box.querySelector('#moD').addEventListener('change', draw);
      draw();
    },
    huangli(v) {
      const T = window.MG_TOOLS;
      const r = T.dayGanZhi(new Date());
      const box = el('div', 'tool');
      box.innerHTML = `<div class="kv"><span class="k">公历</span><span>${r.solar.toYmd()}</span></div>
        <div class="kv"><span class="k">农历</span><span>${r.lunarText}</span></div>
        <div class="kv"><span class="k">干支</span><span>${r.year}年 ${r.month}月 ${r.day}日</span></div>
        ${r.jieqi ? `<div class="kv"><span class="k">节气</span><span>${r.jieqi}</span></div>` : ''}
        <div class="yiji">
          <div class="y-yi"><div class="y-title">宜</div><div class="y-body">${(r.yi || []).slice(0, 12).join(' ') || '—'}</div></div>
          <div class="y-ji"><div class="y-title">忌</div><div class="y-body">${(r.ji || []).slice(0, 12).join(' ') || '—'}</div></div>
        </div>`;
      v.appendChild(box);
    },
    hours(v) {
      const T2 = window.MG_TOOLS2;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">当天廿四段吉时</div><input id="phD" type="date" value="${todayStr()}"><div id="phOut"></div>`;
      v.appendChild(box);
      const draw = () => {
        const [y, m, d] = box.querySelector('#phD').value.split('-').map(Number);
        const r = T2.planetaryHours(new Date(y, m - 1, d), 31.23, 121.47);
        const out = box.querySelector('#phOut');
        if (!r) { out.innerHTML = '<div class="muted">算不出日出日落。</div>'; return; }
        out.innerHTML = `<div class="kv"><span class="k">当值</span><span>${T2.PLANET_SYMBOL[r.ruler]} ${r.ruler}日</span></div>
          <div class="kv"><span class="k">日出/日落</span><span>${T2.fmtHour(r.sunrise)} / ${T2.fmtHour(r.sunset)}</span></div>
          ${r.hours.map((h) => `<div class="kv"><span class="k">${h.day ? '日' : '夜'}${h.idx > 12 ? h.idx - 12 : h.idx} · ${T2.fmtHour(h.from)}–${T2.fmtHour(h.to)}</span><span>${T2.PLANET_SYMBOL[h.planet]} ${h.planet}</span></div>`).join('')}`;
      };
      box.querySelector('#phD').addEventListener('change', draw);
      draw();
    },
    week(v) {
      const T2 = window.MG_TOOLS2;
      const box = el('div', 'tool');
      box.innerHTML = T2.upcoming(7).map((d) => `<div class="kv" style="align-items:flex-start">
        <span class="k">${d.date}<br><span class="muted">周${d.week} ${d.gz}</span></span>
        <span style="text-align:right">宜 ${(d.yi || []).slice(0, 5).join(' ') || '—'}<br>
        <span class="muted">忌 ${(d.ji || []).slice(0, 5).join(' ') || '—'}</span></span></div>`).join('');
      v.appendChild(box);
    },
    pick(v) {
      const T3 = window.MG_TOOLS3;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">选要做的事，给七天内对应时辰</div>
        <select id="pkI">${Object.keys(T3.INTENT).map((k) => `<option>${k}</option>`).join('')}</select>
        <div id="pkOut"></div>`;
      v.appendChild(box);
      const draw = () => {
        const r = T3.findWindows(box.querySelector('#pkI').value, 7, 31.23, 121.47);
        box.querySelector('#pkOut').innerHTML = r.windows.length
          ? r.windows.map((w) => `<div class="kv" style="align-items:flex-start">
              <span class="k">${w.date}<br><span class="muted">周${w.week}${w.isPlanetDay ? ' · ' + r.planet + '日' : ''}</span></span>
              <span style="text-align:right">${w.slots.map((x) => x.label + ' ' + x.time).join('<br>')}</span></div>`).join('')
          : '<div class="muted">这一周没有合适时辰。</div>';
      };
      box.querySelector('#pkI').addEventListener('change', draw);
      draw();
    },
    corr(v) {
      const T3 = window.MG_TOOLS3;
      const box = el('div', 'tool');
      box.innerHTML = Object.entries(T3.CORR).map(([n, c]) => `
        <div style="padding:10px 0;border-bottom:1px solid var(--line)">
          <div style="color:var(--gold-soft);margin-bottom:4px">${T3.SYM[n]} ${n}<span class="muted" style="margin-left:8px">${c.day}</span></div>
          <div class="muted" style="line-height:1.8">${c.metal} · ${c.color}<br>${c.plant}<br>${c.stone}<br>${c.use}</div>
        </div>`).join('');
      v.appendChild(box);
    },
    meihua(v) {
      const HG = window.MG_HEX;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">报两个数起卦</div>
        <div class="row2"><input id="mhA" type="number" value="1" min="1"><input id="mhB" type="number" value="1" min="1"></div>
        <button class="btn" id="mhGo">起卦</button><div id="mhOut"></div>`;
      v.appendChild(box);
      box.querySelector('#mhGo').addEventListener('click', async () => {
        await HG.load();
        const a = parseInt(box.querySelector('#mhA').value || '1', 10);
        const b = parseInt(box.querySelector('#mhB').value || '1', 10);
        const r = HG.meihua(a, b, new Date().getHours());
        box.querySelector('#mhOut').innerHTML = `<div class="muted" style="margin-top:10px">动爻：第 ${r.moving + 1} 爻</div>`
          + window.MG_APP.hexCard('本卦', r.primary, r.moving) + window.MG_APP.hexCard('变卦', r.changed);
      });
    },
    liuyao(v) {
      const HG = window.MG_HEX;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">三枚钱摇六次</div><button class="btn" id="lyGo">摇一卦</button><div id="lyOut"></div>`;
      v.appendChild(box);
      box.querySelector('#lyGo').addEventListener('click', async () => {
        await HG.load();
        const lines = Array.from({ length: 6 }, () => HG.tossLine());
        const r = HG.liuyao(lines);
        const nm = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' };
        box.querySelector('#lyOut').innerHTML =
          r.lines.map((x, i) => `<div class="kv"><span class="k">${['初', '二', '三', '四', '五', '上'][i]}爻</span><span>${nm[x]}${x === 6 || x === 9 ? ' ●动' : ''}</span></div>`).join('')
          + window.MG_APP.hexCard('本卦', r.primary, r.moving.length === 1 ? r.moving[0] : undefined)
          + (r.changed ? window.MG_APP.hexCard('变卦', r.changed) : '');
      });
    },
    calendar(v) {
      const T5 = window.MG_TOOLS5;
      const now = new Date();
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">公历农历对照</div>
        <div class="row2">
          <select id="cY">${Array.from({ length: 21 }, (_, i) => now.getFullYear() - 10 + i).map((y) => `<option ${y === now.getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}</select>
          <select id="cM">${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => `<option ${m === now.getMonth() + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select>
        </div><div id="cOut"></div>`;
      v.appendChild(box);
      const draw = () => {
        const g = T5.monthGrid(+box.querySelector('#cY').value, +box.querySelector('#cM').value);
        const head = ['日', '一', '二', '三', '四', '五', '六'].map((d) => `<div style="text-align:center;font-size:10px;color:var(--text-dim);padding:4px 0">${d}</div>`).join('');
        const body = g.cells.map((c) => {
          if (!c) return '<div></div>';
          const jq = c.jieqi ? `<div style="font-size:9px;color:var(--gold-soft)">${c.jieqi}</div>` : '';
          return `<div style="text-align:center;padding:3px 0"><div style="font-size:13px">${c.d}</div>
            <div style="font-size:9px;color:var(--text-dim)">${c.lunarDay}</div>${jq}</div>`;
        }).join('');
        box.querySelector('#cOut').innerHTML = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:10px">${head}${body}</div>`;
      };
      box.querySelector('#cY').addEventListener('change', draw);
      box.querySelector('#cM').addEventListener('change', draw);
      draw();
    },
    compass(v) {
      const T5 = window.MG_TOOLS5;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">手机朝向与二十四山</div><button class="btn" id="cpGo">开启</button><div id="cpOut"></div>`;
      v.appendChild(box);
      box.querySelector('#cpGo').addEventListener('click', () => {
        const out = box.querySelector('#cpOut');
        out.innerHTML = '<div class="muted">正在读方向…</div>';
        T5.watchCompass((r) => {
          out.innerHTML = `<div style="text-align:center;padding:20px 0">
            <div style="font-size:30px;color:var(--gold-soft)">${r.shan} 山</div>
            <div class="muted">${r.dir} · ${r.bagua}卦 · ${r.heading.toFixed(1)}°</div></div>`;
        }, (m) => { out.innerHTML = `<div class="muted">${esc(m)}</div>`; });
      });
    },
    ruling(v) {
      const T5 = window.MG_TOOLS5;
      const box = el('div', 'tool');
      box.innerHTML = `<div class="t-sub">记两个朝向，算夹角</div>
        <button class="btn ghost" id="rA">记第一点</button>
        <button class="btn ghost" id="rB" style="margin-top:8px">记第二点</button>
        <div id="rOut" class="muted" style="margin-top:10px">站在立极点，分别朝向两处各按一次。</div>`;
      v.appendChild(box);
      let a = null, b = null;
      T5.watchCompass((r) => { box.dataset.cur = r.heading; }, () => {});
      const draw = () => {
        const out = box.querySelector('#rOut');
        if (a == null) return;
        if (b == null) { out.innerHTML = `第一点：${a.toFixed(1)}°（${T5.shanOf(a)} 山）`; return; }
        let d = Math.abs(a - b);
        if (d > 180) d = 360 - d;
        out.innerHTML = `<div class="kv"><span class="k">第一点</span><span>${a.toFixed(1)}° · ${T5.shanOf(a)} 山</span></div>
          <div class="kv"><span class="k">第二点</span><span>${b.toFixed(1)}° · ${T5.shanOf(b)} 山</span></div>
          <div class="kv"><span class="k">夹角</span><span style="color:var(--gold-soft)">${d.toFixed(1)}°</span></div>`;
      };
      box.querySelector('#rA').addEventListener('click', () => { a = parseFloat(box.dataset.cur); draw(); });
      box.querySelector('#rB').addEventListener('click', () => { b = parseFloat(box.dataset.cur); draw(); });
    },
  };

  ready();
})();
