/* 神秘指南 —— 单页应用核心 */
(() => {
  'use strict';

  const LS_KEY = 'mystic-guide-v1';
  const DEFAULT_REMOTE = ''; // 例：https://raw.githubusercontent.com/<user>/<repo>/main/content/

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------------- 状态 ---------------- */
  const emptyState = () => ({
    streak: 0,
    lastDay: '',
    days: {},            // { '2026-10-19': 3 } 当天完成的单元数
    done: {},            // { 'subjectId/unitId': timestamp }
    packs: {},           // { subjectId: packData }
    seenManifest: null,
    remote: DEFAULT_REMOTE,
  });

  let state = loadState();
  let manifest = null;
  let route = { name: 'today' };

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return emptyState();
      return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) {
      return emptyState();
    }
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const dayDiff = (a, b) => {
    const pa = new Date(a + 'T00:00:00');
    const pb = new Date(b + 'T00:00:00');
    return Math.round((pb - pa) / 86400000);
  };

  function touchStreak() {
    const t = todayKey();
    if (state.lastDay === t) return;
    const gap = state.lastDay ? dayDiff(state.lastDay, t) : 999;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastDay = t;
    saveState();
  }
  function streakAlive() {
    const t = todayKey();
    if (!state.lastDay) return state.streak;
    const gap = dayDiff(state.lastDay, t);
    return gap <= 1 ? state.streak : 0;
  }

  function markDone(subjectId, unitId) {
    state.done[`${subjectId}/${unitId}`] = Date.now();
    const t = todayKey();
    state.days[t] = (state.days[t] || 0) + 1;
    touchStreak();
    saveState();
  }
  const isDone = (subjectId, unitId) => !!state.done[`${subjectId}/${unitId}`];

  /* ---------------- 内容 ---------------- */
  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function bootContent() {
    // 1) 内置内容（随 App 打包）
    try {
      manifest = await fetchJSON('content/manifest.json');
    } catch (e) {
      manifest = { subjects: [] };
    }
    // 2) 已下载的包
    for (const id of Object.keys(state.packs)) { /* 已缓存 */ }
    // 3) 自动加载继续学科目的包
    const active = (manifest.subjects || []).find((s) => s.status === '进行中') || (manifest.subjects || [])[0];
    if (active && !state.packs[active.id]) {
      try { state.packs[active.id] = await fetchJSON('content/' + active.file); } catch (e) {}
    }
    saveState();
  }

  async function downloadPack(subj) {
    toast('正在下载…');
    const base = (state.remote || '').replace(/\/?$/, '/');
    const url = base ? base + subj.file : 'content/' + subj.file;
    try {
      const data = await fetchJSON(url);
      state.packs[subj.id] = data;
      state.seenManifest = Date.now();
      saveState();
      toast(`${subj.name}已下载`);
      render();
    } catch (e) {
      toast('下载失败：' + e.message);
    }
  }

  async function refreshRemote() {
    const base = (state.remote || '').replace(/\/?$/, '/');
    if (!base) { toast('先在设置里填内容源地址'); return; }
    try {
      manifest = await fetchJSON(base + 'manifest.json');
      toast('内容清单已更新');
      render();
    } catch (e) {
      toast('拉取失败：' + e.message);
    }
  }

  const packOf = (id) => state.packs[id] || null;
  const subjectList = () => (manifest && manifest.subjects) || [];

  function unitList(subj) {
    const pack = packOf(subj.id);
    return pack ? pack.units : [];
  }
  function nextUnit(subj) {
    const units = unitList(subj);
    return units.find((u) => !isDone(subj.id, u.id)) || null;
  }
  function doneCount(subj) {
    return unitList(subj).filter((u) => isDone(subj.id, u.id)).length;
  }

  /* ---------------- UI 小件 ---------------- */
  function toast(msg, ms = 2000) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => (t.hidden = true), ms);
  }

  function openSheet(html, onMount) {
    const s = $('#sheet');
    s.innerHTML = html;
    s.hidden = false;
    $('#sheetBackdrop').hidden = false;
    if (onMount) onMount(s);
  }
  function closeSheet() {
    $('#sheet').hidden = true;
    $('#sheetBackdrop').hidden = true;
  }

  /* ---------------- 视图：今天 ---------------- */
  function renderToday() {
    const v = $('#view');
    v.innerHTML = '';

    const subs = subjectList();
    if (!subs.length) {
      v.appendChild(el('div', 'empty', '还没有装内容。<br>去「书库」看看，或者先在设置里填内容源。'));
      return;
    }

    // 优先进行中的科目
    const active = subs.find((s) => s.status === '进行中') || subs[0];
    const unit = nextUnit(active);

    const hero = el('div', 'hero');
    if (unit) {
      const goal = unit.goal ? unit.goal.slice(0, 46) : '';
      hero.innerHTML = `
        <h2>${escapeHTML(active.name)}</h2>
        <p>${escapeHTML(unit.title)}</p>
        ${goal ? `<div class="meta"><span>${escapeHTML(goal)}…</span></div>` : ''}
        <button class="btn" id="startBtn">开始今天的一课</button>
      `;
      hero.querySelector('#startBtn').addEventListener('click', () => {
        go({ name: 'lesson', subjectId: active.id, unitId: unit.id });
      });
    } else {
      hero.innerHTML = `
        <h2>${escapeHTML(active.name)}</h2>
        <p>这一门已经全部学完了。</p>
        <button class="btn ghost" id="libBtn">去书库换一门</button>
      `;
      hero.querySelector('#libBtn').addEventListener('click', () => go({ name: 'courses' }));
    }
    v.appendChild(hero);

    // 今日统计
    const t = todayKey();
    const todayDone = state.days[t] || 0;
    const stats = el('div', 'section-title', '今天');
    v.appendChild(stats);
    const card = el('div', 'subject');
    card.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>已完成 ${todayDone} 个单元</h3>
          <div class="muted">每天两三分钟就够，别贪多。</div>
        </div>
        <span class="tag">连续 ${streakAlive()} 天</span>
      </div>
    `;
    v.appendChild(card);

    // 各科进度
    v.appendChild(el('div', 'section-title', '进度'));
    subs.forEach((s) => {
      const total = s.total_units || 0;
      const done = doneCount(s);
      const pct = total ? Math.round((done / total) * 100) : 0;
      const box = el('div', 'subject');
      box.innerHTML = `
        <div class="subject-top">
          <div class="sub">
            <h3>${escapeHTML(s.name)}</h3>
            <div class="muted">${done} / ${total} 单元</div>
          </div>
          <span class="tag ${s.status === '进行中' ? 'live' : ''}">${s.status || ''}</span>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
      `;
      v.appendChild(box);
    });
  }

  /* ---------------- 视图：书库 ---------------- */
  function renderCourses() {
    const v = $('#view');
    v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '课程'));

    subjectList().forEach((s) => {
      const pack = packOf(s.id);
      const total = s.total_units || 0;
      const done = pack ? doneCount(s) : 0;
      const box = el('div', 'subject');
      box.innerHTML = `
        <div class="subject-top">
          <div class="sub">
            <h3>${escapeHTML(s.name)}</h3>
            <div class="muted">${escapeHTML((s.goal || '').slice(0, 44))}…</div>
          </div>
        </div>
        <div class="bar"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>
        <div class="subject-foot">
          <span class="count">${done ? `已学 ${done} 节` : `${total} 节`}</span>
          <button class="btn ghost" data-id="${s.id}">${pack ? '更新' : '下载'}</button>
        </div>
      `;
      box.querySelector('button').addEventListener('click', () => downloadPack(s));
      v.appendChild(box);
    });

    const refresh = el('button', 'btn ghost', '刷新内容清单');
    refresh.style.marginTop = '14px';
    refresh.addEventListener('click', refreshRemote);
    v.appendChild(refresh);
  }

  /* ---------------- 视图：书库 ---------------- */
  async function renderBooks() {
    const v = $('#view');
    v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '书库'));
    let data = null;
    try {
      data = await fetchJSON('content/books.json');
    } catch (e) {
      v.appendChild(el('div', 'empty', '书单还没加载出来。'));
      return;
    }
    const base = state.bookSource || '';
    v.appendChild(el('div', 'muted', `共 ${data.total} 本 · ${data.total_mb} MB`));
    (data.categories || []).forEach((cat) => {
      const head = el('div', 'cat-head');
      head.innerHTML = `<h3>${escapeHTML(cat.name)}</h3><span>${cat.count} 本</span>`;
      v.appendChild(head);
      const card = el('div', 'subject');
      cat.books.forEach((b) => {
        const row = el('div', 'book');
        const url = b.url || (base ? base + encodeURIComponent(b.file) : '');
        row.innerHTML = `
          <div class="b-main">
            <div class="b-title">${escapeHTML(b.title)}</div>
            <div class="b-meta">${b.size_mb} MB</div>
          </div>
          ${url ? `<a class="b-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener">获取</a>` : `<span class="b-meta">待上架</span>`}
        `;
        card.appendChild(row);
      });
      v.appendChild(card);
    });

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
  }

  /* ---------------- 视图：工具 ---------------- */
  function renderTools() {
    const v = $('#view');
    v.innerHTML = '';
    const T = window.MG_TOOLS;
    v.appendChild(el('div', 'section-title', '工具'));

    /* 八字排盘 */
    const bz = el('div', 'tool');
    const now = new Date();
    bz.innerHTML = `
      <h3>八字排盘</h3>
      <div class="t-sub">填出生时间，按节气排四柱</div>
      <div class="row2">
        <input id="bzDate" type="date" value="${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}">
        <input id="bzTime" type="time" value="12:00">
      </div>
      <button class="btn" id="bzGo">排盘</button>
      <div id="bzOut"></div>
    `;
    v.appendChild(bz);
    bz.querySelector('#bzGo').addEventListener('click', () => {
      const d = bz.querySelector('#bzDate').value;
      const t = bz.querySelector('#bzTime').value || '12:00';
      if (!d) return;
      const [y, m, dd] = d.split('-').map(Number);
      const [hh, mm] = t.split(':').map(Number);
      try {
        const r = T.bazi(y, m, dd, hh, mm);
        const out = bz.querySelector('#bzOut');
        out.innerHTML = `
          <div class="pillars">
            ${r.pillars.map((p) => `<div class="pillar"><div class="p-label">${p.label}</div><div class="p-gz">${p.gz}</div><div class="p-wx">${p.wuxing}</div></div>`).join('')}
          </div>
          <div style="margin-top:14px">
            <div class="kv"><span class="k">纳音</span><span>${r.nayin.join(' · ')}</span></div>
            <div class="kv"><span class="k">十神</span><span>${r.shishen.join(' · ')}</span></div>
            <div class="kv"><span class="k">五行</span><span>${Object.entries(r.counts).map(([k, n]) => k + n).join(' ')}</span></div>
            <div class="kv"><span class="k">生肖</span><span>${r.shengxiao}</span></div>
            <div class="kv"><span class="k">农历</span><span>${r.lunarText}</span></div>
            ${r.missing.length ? `<div class="kv"><span class="k">缺</span><span>${r.missing.join('、')}</span></div>` : ''}
          </div>
        `;
      } catch (e) {
        bz.querySelector('#bzOut').innerHTML = `<div class="muted" style="margin-top:12px">排不出来：${escapeHTML(e.message)}</div>`;
      }
    });

    /* 月相 */
    const mo = el('div', 'tool');
    mo.innerHTML = `
      <h3>月相</h3>
      <div class="t-sub">当天月龄与相位，换日期可查过去将来</div>
      <input id="moDate" type="date" value="${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}">
      <div id="moOut"></div>
    `;
    v.appendChild(mo);
    const drawMoon = () => {
      const val = mo.querySelector('#moDate').value;
      if (!val) return;
      const [y, m, dd] = val.split('-').map(Number);
      const r = T.moonPhase(new Date(y, m - 1, dd, 12, 0));
      mo.querySelector('#moOut').innerHTML = `
        <div class="moon">
          <div class="m-disc"></div>
          <div>
            <div class="m-name">${r.phase.name}</div>
            <div class="muted">月龄 ${r.age.toFixed(1)} 天 · 亮面约 ${r.illum}%</div>
            <div class="muted">${r.phase.note}</div>
          </div>
        </div>
      `;
    };
    mo.querySelector('#moDate').addEventListener('change', drawMoon);
    drawMoon();

    /* 黄历 */
    const hl = el('div', 'tool');
    hl.innerHTML = `
      <h3>今天</h3>
      <div class="t-sub">农历、干支、宜忌</div>
      <div id="hlOut"></div>
    `;
    v.appendChild(hl);
    try {
      const r = T.dayGanZhi(new Date());
      hl.querySelector('#hlOut').innerHTML = `
        <div class="kv"><span class="k">公历</span><span>${r.solar.toYmd()}</span></div>
        <div class="kv"><span class="k">农历</span><span>${r.lunarText}</span></div>
        <div class="kv"><span class="k">干支</span><span>${r.year}年 ${r.month}月 ${r.day}日 ${r.time}时</span></div>
        ${r.jieqi ? `<div class="kv"><span class="k">节气</span><span>${r.jieqi}</span></div>` : ''}
        ${r.chong ? `<div class="kv"><span class="k">冲煞</span><span>${r.chong}${r.sha ? ' · 煞' + r.sha : ''}</span></div>` : ''}
        <div class="yiji">
          <div class="y-yi"><div class="y-title">宜</div><div class="y-body">${(r.yi || []).slice(0, 12).join(' ') || '—'}</div></div>
          <div class="y-ji"><div class="y-title">忌</div><div class="y-body">${(r.ji || []).slice(0, 12).join(' ') || '—'}</div></div>
        </div>
      `;
    } catch (e) {
      hl.querySelector('#hlOut').innerHTML = `<div class="muted">读不出来：${escapeHTML(e.message)}</div>`;
    }

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
  }

  /* ---------------- 视图：我的 ---------------- */
  function renderMe() {
    const v = $('#view');
    v.innerHTML = '';


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

    const totalDone = Object.keys(state.done).length;
    const totalDays = Object.keys(state.days).length;

    v.appendChild(el('div', 'section-title', '统计'));
    const card = el('div', 'subject');
    card.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>连续 ${streakAlive()} 天</h3>
          <div class="muted">累计完成 ${totalDone} 个单元 · 学习 ${totalDays} 天</div>
        </div>
      </div>
    `;
    v.appendChild(card);

    v.appendChild(el('div', 'section-title', '设置'));
    const set = el('div', 'subject');
    set.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>内容源</h3>
          <div class="muted">留空则只用随 App 打包的内容</div>
        </div>
      </div>
      <input id="remoteInput" placeholder="https://raw.githubusercontent.com/…/content/" value="${escapeAttr(state.remote || '')}">
      <div class="subject-foot" style="margin-top:12px">
        <span class="count">填好点右边保存</span>
        <button class="btn ghost" id="saveRemote">保存</button>
      </div>
    `;
    v.appendChild(set);
    set.querySelector('#saveRemote').addEventListener('click', () => {
      state.remote = set.querySelector('#remoteInput').value.trim();
      saveState();
      toast('已保存');
    });

    const danger = el('div', 'subject');
    danger.innerHTML = `
      <div class="subject-top">
        <div class="sub">
          <h3>清除学习记录</h3>
          <div class="muted">进度与连续天数会归零，已下载的内容保留</div>
        </div>
      </div>
      <button class="btn ghost" id="resetBtn" style="margin-top:10px">清除进度</button>
    `;
    v.appendChild(danger);
    danger.querySelector('#resetBtn').addEventListener('click', () => {
      if (!confirm('确定清除所有学习进度？')) return;
      const packs = state.packs, remote = state.remote;
      state = emptyState();
      state.packs = packs;
      state.remote = remote;
      saveState();
      toast('已清除');
      render();
    });

    v.appendChild(el('div', 'section-title', '关于'));
    const about = el('div', 'subject');
    about.innerHTML = `
      <div class="sub">
        <h3>神秘指南</h3>
        <div class="muted">
          每天两三分钟，一课一个点。<br>
          内容开源在 GitHub，可在书库里按科目下载。<br>
          <span class="muted">v1.0 · 内容生成于 ${manifest && manifest.manifest_at ? manifest.manifest_at : '—'}</span>
        </div>
      </div>
    `;
    v.appendChild(about);
  }

  /* ---------------- 视图：单元 ---------------- */
  function renderLesson(subjectId, unitId) {
    const v = $('#view');
    v.innerHTML = '';
    const subj = subjectList().find((s) => s.id === subjectId);
    const pack = packOf(subjectId);
    if (!subj || !pack) {
      v.appendChild(el('div', 'empty', '这门课还没下载。回书库下载一下。'));
      return;
    }
    const unit = pack.units.find((u) => u.id === unitId);
    if (!unit) { v.appendChild(el('div', 'empty', '找不到这个单元。')); return; }

    const head = el('div', 'lesson-head');
    head.innerHTML = `
      <span class="kind">${escapeHTML(unit.kind || '概念')}</span>
      <h2>${escapeHTML(unit.title)}</h2>
      ${unit.goal ? `<p class="goal">${escapeHTML(unit.goal)}</p>` : ''}
    `;
    v.appendChild(head);

    const body = el('div', 'blocks');
    const quizTotal = unit.blocks.reduce(
      (n, b) => n + (b.type === 'quiz' ? (b.questions || []).length : 0),
      0
    );
    let quizAnswered = 0;

    unit.blocks.forEach((b) => {
      switch (b.type) {
        case 'h2': body.appendChild(el('h2', null, b.html)); break;
        case 'h3': body.appendChild(el('h3', null, b.html)); break;
        case 'p': body.appendChild(el('p', null, b.html)); break;
        case 'ul':
        case 'ol':
        case 'table':
        case 'code': body.appendChild(el('div', null, b.html)); break;
        case 'svg': body.insertAdjacentHTML('beforeend', b.svg); break;
        case 'figure': break; // 图片按需后续支持
        case 'note': {
          const co = el('div', 'callout ' + (b.tone || 'note'));
          const title = b.title ? `<div class="co-title">${escapeHTML(b.title)}</div>` : '';
          const steps = (b.steps && b.steps.length)
            ? '<ol>' + b.steps.map((s) => `<li>${s}</li>`).join('') + '</ol>'
            : '';
          co.innerHTML = title + (b.html || '') + steps;
          body.appendChild(co);
          break;
        }
        case 'quiz': {
          (b.questions || []).forEach((q, i) => {
            const node = renderQuiz(q, i);
            node.addEventListener('answered', () => {
              quizAnswered++;
              if (quizAnswered === quizTotal) finishUnit(subjectId, unitId, body);
            });
            body.appendChild(node);
          });
          break;
        }
      }
    });
    v.appendChild(body);

    if (!quizTotal) {
      const btn = el('button', 'btn', '学完了');
      btn.style.marginTop = '24px';
      btn.addEventListener('click', () => finishUnit(subjectId, unitId, body));
      v.appendChild(btn);
    }

    $('#backBtn').hidden = false;
    $('#tabbar').hidden = true;
  }

  function renderQuiz(q, index) {
    const box = el('div', 'quiz');
    box.innerHTML = `
      <div class="q-index">第 ${index + 1} 题</div>
      <div class="q-text">${escapeHTML(q.q)}</div>
    `;
    const opts = el('div', 'opts');
    (q.opts || []).forEach((text, i) => {
      const b = el('button', 'opt', escapeHTML(text));
      b.addEventListener('click', () => {
        if (box.dataset.done) return;
        box.dataset.done = '1';
        [...opts.children].forEach((c, j) => {
          c.disabled = true;
          if (j === q.ans) c.classList.add('correct');
          else if (j === i) c.classList.add('wrong');
        });
        if (q.why) {
          const w = el('div', 'why', '▸ ' + escapeHTML(q.why));
          box.appendChild(w);
        }
        box.dispatchEvent(new CustomEvent('answered'));
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    return box;
  }

  function finishUnit(subjectId, unitId, body) {
    if (isDone(subjectId, unitId)) {
      toast('这个单元之前就完成过');
      return;
    }
    markDone(subjectId, unitId);
    const f = el('div', 'finish');
    f.innerHTML = `
      <div class="big">◆</div>
      <p>这一课完了。连续 ${streakAlive()} 天。</p>
    `;
    const again = el('button', 'btn', '回首页');
    again.addEventListener('click', () => go({ name: 'today' }));
    f.appendChild(again);
    body.appendChild(f);
    f.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- 路由 ---------------- */
  function go(r) {
    route = r;
    if (r.name === 'lesson') {
      renderLesson(r.subjectId, r.unitId);
    } else {
      $('#backBtn').hidden = true;
      $('#tabbar').hidden = false;
      document.querySelectorAll('.tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.tab === r.name);
      });
      if (r.name === 'courses') renderCourses();
      else if (r.name === 'books') renderBooks();
      else if (r.name === 'tools') renderTools();
      else if (r.name === 'me') renderMe();
      else renderToday();
    }
    window.scrollTo(0, 0);
  }

  function render() {
    go(route.name === 'lesson' ? { name: 'today' } : route);
  }

  /* ---------------- 转义 ---------------- */
  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(s) { return escapeHTML(s); }

  /* ---------------- 启动 ---------------- */
  async function boot() {
    $('#streakNum').textContent = String(streakAlive());
    $('#backBtn').addEventListener('click', () => go({ name: 'today' }));
    document.querySelectorAll('.tab').forEach((t) =>
      t.addEventListener('click', () => go({ name: t.dataset.tab }))
    );
    $('#settingsBtn').addEventListener('click', () => go({ name: 'me' }));
    $('#sheetBackdrop').addEventListener('click', closeSheet);

    await bootContent();
    $('#streakNum').textContent = String(streakAlive());
    go({ name: 'today' });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
