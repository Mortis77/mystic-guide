/* 魔女手札 2.0 */
(() => {
  'use strict';
  const LS_KEY = 'mystic-guide-v1';
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const empty = () => ({ streak: 0, lastDay: '', days: {}, done: {}, packs: {}, theme: 'dark', current: '' });
  let state = load();
  let manifest = null, booksData = null;
  let route = { name: 'today' };

  function load() { try { return Object.assign(empty(), JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (e) { return empty(); } }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

  function touchStreak() {
    const t = todayKey();
    if (state.lastDay === t) return;
    const gap = state.lastDay ? dayDiff(state.lastDay, t) : 999;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastDay = t; save();
  }
  const streakAlive = () => (!state.lastDay ? state.streak : (dayDiff(state.lastDay, todayKey()) <= 1 ? state.streak : 0));

  function markDone(sid, uid) {
    if (state.done[`${sid}/${uid}`]) return false;
    state.done[`${sid}/${uid}`] = Date.now();
    const t = todayKey();
    state.days[t] = (state.days[t] || 0) + 1;
    touchStreak(); save(); autoSync();
    return true;
  }
  const isDone = (sid, uid) => !!state.done[`${sid}/${uid}`];

  let syncing = false;
  async function autoSync() {
    const S = window.MG_SYNC;
    if (!S || syncing) return;
    const c = S.cfg();
    if (!c.token || !c.gist) return;
    syncing = true;
    try { await S.push(c.token, c.gist, state); } catch (e) {} finally { syncing = false; }
  }

  async function getJSON(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }

  async function boot() {
    try { manifest = await getJSON('content/manifest.json'); } catch (e) { manifest = { subjects: [] }; }
    const live = (manifest.subjects || []).filter((s) => s.status !== '暂停');
    if (!state.current && live.length) state.current = live[0].id;
    for (const s of live) {
      if (!state.packs[s.id]) { try { state.packs[s.id] = await getJSON('content/' + s.file); } catch (e) {} }
    }
    save();
  }

  const subs = () => (manifest && manifest.subjects) || [];
  const liveSubs = () => subs().filter((s) => s.status !== '暂停');
  const packOf = (id) => state.packs[id] || null;
  const unitsOf = (id) => (packOf(id) ? packOf(id).units : []);
  const current = () => subs().find((s) => s.id === state.current) || liveSubs()[0] || null;
  const nextUnit = (sid) => unitsOf(sid).find((u) => !isDone(sid, u.id)) || null;
  const doneCount = (sid) => unitsOf(sid).filter((u) => isDone(sid, u.id)).length;

  function toast(msg, ms = 2000) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), ms); }
  function progressBar(show) { const b = $('#dlBar'); b.hidden = !show; if (show) $('#dlFill').style.width = '0%'; }
  function setProgress(p) { $('#dlFill').style.width = Math.min(100, p) + '%'; }
  function applyTheme() { document.documentElement.setAttribute('data-theme', state.theme || 'dark'); }
  function setNav(title) {
    const bar = $('#topbar');
    if (title) { bar.hidden = false; $('#navTitle').textContent = title; } else bar.hidden = true;
  }

  /* 今天 */
  function renderToday() {
    setNav('');
    const v = $('#view'); v.innerHTML = '';
    const s = current();
    if (!s) { v.appendChild(el('div', 'empty', '还没有课程内容。')); return; }
    const u = nextUnit(s.id);
    const hero = el('div', 'hero');
    if (u) {
      hero.innerHTML = `<div class="subject-name">${esc(s.name)}</div><h2>${esc(u.title)}</h2>
        <p>${esc((u.goal || '').slice(0, 46))}${u.goal && u.goal.length > 46 ? '…' : ''}</p>
        <button class="btn" id="go">开始</button>`;
      hero.querySelector('#go').addEventListener('click', () => go({ name: 'lesson', sid: s.id, uid: u.id }));
    } else {
      hero.innerHTML = `<div class="subject-name">${esc(s.name)}</div><h2>这一门学完了</h2><p>去课程页换一门继续。</p>
        <button class="btn ghost" id="go">选别的课</button>`;
      hero.querySelector('#go').addEventListener('click', () => go({ name: 'courses' }));
    }
    v.appendChild(hero);

    const t = todayKey();
    const row = el('div', 'stat-row');
    row.innerHTML = `<div class="stat"><div class="n">${state.days[t] || 0}</div><div class="k">今天已学</div></div>
      <div class="stat"><div class="n">${streakAlive()}</div><div class="k">连续天数</div></div>
      <div class="stat"><div class="n">${Object.keys(state.done).length}</div><div class="k">累计</div></div>`;
    v.appendChild(row);

    v.appendChild(el('div', 'section-title', '正在学'));
    const total = s.total_units || unitsOf(s.id).length;
    const done = doneCount(s.id);
    const card = el('div', 'card clickable');
    card.innerHTML = `<div class="card-top"><div class="desc"><h3>${esc(s.name)}</h3><div class="muted">${done} / ${total} 节</div></div></div>
      <div class="bar"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>
      <div class="card-foot"><span>看全部课时</span><span>›</span></div>`;
    card.addEventListener('click', () => go({ name: 'course', sid: s.id }));
    v.appendChild(card);

    v.appendChild(el('div', 'section-title', '其他课程'));
    liveSubs().filter((x) => x.id !== s.id).forEach((x) => {
      const tot = x.total_units || 0, dn = doneCount(x.id);
      const c = el('div', 'card clickable');
      c.innerHTML = `<div class="card-top"><div class="desc"><h3>${esc(x.name)}</h3><div class="muted">${dn} / ${tot} 节</div></div></div>`;
      c.addEventListener('click', () => go({ name: 'course', sid: x.id }));
      v.appendChild(c);
    });
  }

  /* 课程列表 */
  function renderCourses() {
    setNav('');
    const v = $('#view'); v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '全部课程'));
    const list = subs();
    if (!list.length) { v.appendChild(el('div', 'empty', '还没有课程内容。')); return; }
    list.forEach((s) => {
      const total = s.total_units || 0, done = doneCount(s.id);
      const card = el('div', 'card clickable');
      card.innerHTML = `<div class="card-top"><div class="desc"><h3>${esc(s.name)}</h3>
        <div class="muted">${done} / ${total} 节${s.status === '暂停' ? ' · 暂停' : ''}</div></div></div>
        <div class="bar"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>`;
      card.addEventListener('click', () => go({ name: 'course', sid: s.id }));
      v.appendChild(card);
    });
  }

  /* 单元列表 */
  function renderCourse(sid) {
    const s = subs().find((x) => x.id === sid);
    if (!s) { go({ name: 'courses' }); return; }
    setNav(s.name);
    const v = $('#view'); v.innerHTML = '';
    const units = unitsOf(sid);
    if (!units.length) { v.appendChild(el('div', 'empty', '这一门还没内容。')); return; }
    const card = el('div', 'card');
    units.forEach((u, i) => {
      const row = el('div', 'unit' + (isDone(sid, u.id) ? ' done' : ''));
      row.innerHTML = `<div class="idx">${i + 1}</div><div class="u-main"><div class="u-title">${esc(u.title)}</div>
        <div class="u-kind">${esc(u.kind || '')}</div></div>${isDone(sid, u.id) ? '<div class="tick">✓</div>' : ''}`;
      row.addEventListener('click', () => go({ name: 'lesson', sid, uid: u.id }));
      card.appendChild(row);
    });
    v.appendChild(card);
    const pick = el('button', 'btn ghost', state.current === sid ? '当前就是这一门' : '设为当前课程');
    pick.style.marginTop = '16px';
    pick.disabled = state.current === sid;
    pick.addEventListener('click', () => { state.current = sid; save(); toast('已切换'); go({ name: 'today' }); });
    v.appendChild(pick);
  }

  /* 课时 */
  function renderLesson(sid, uid) {
    const s = subs().find((x) => x.id === sid);
    setNav(s ? s.name : '');
    const v = $('#view'); v.innerHTML = '';
    const pack = packOf(sid);
    const unit = pack && pack.units.find((u) => u.id === uid);
    if (!unit) { v.appendChild(el('div', 'empty', '找不到这一节。')); return; }

    const head = el('div', 'lesson-head');
    head.innerHTML = `<h2>${esc(unit.title)}</h2>${unit.goal ? `<p class="goal">${esc(unit.goal)}</p>` : ''}`;
    v.appendChild(head);

    const body = el('div', 'blocks');
    const quizTotal = unit.blocks.reduce((n, b) => n + (b.type === 'quiz' ? (b.questions || []).length : 0), 0);
    let answered = 0;

    unit.blocks.forEach((b) => {
      switch (b.type) {
        case 'h2': body.appendChild(el('h2', null, b.html)); break;
        case 'h3': body.appendChild(el('h3', null, b.html)); break;
        case 'p': body.appendChild(el('p', null, b.html)); break;
        case 'ul': case 'ol': case 'table': case 'code': body.appendChild(el('div', null, b.html)); break;
        case 'svg': body.insertAdjacentHTML('beforeend', b.svg || ''); break;
        case 'figure': break;
        case 'note': {
          const co = el('div', 'callout ' + (b.tone || 'note'));
          const title = b.title ? `<div class="co-title">${esc(b.title)}</div>` : '';
          const steps = b.steps && b.steps.length ? '<ol>' + b.steps.map((x) => `<li>${x}</li>`).join('') + '</ol>' : '';
          co.innerHTML = title + (b.html || '') + steps;
          body.appendChild(co); break;
        }
        case 'quiz':
          (b.questions || []).forEach((q, i) => {
            const node = renderQuiz(q, i);
            node.addEventListener('answered', () => { answered++; if (answered >= quizTotal) showFinish(v, sid, uid); });
            body.appendChild(node);
          });
          break;
      }
    });
    v.appendChild(body);

    if (!quizTotal) {
      const btn = el('button', 'btn', '学完了');
      btn.style.marginTop = '24px';
      btn.addEventListener('click', () => showFinish(v, sid, uid));
      v.appendChild(btn);
    }
  }

  function renderQuiz(q, index) {
    const box = el('div', 'quiz');
    box.innerHTML = `<div class="q-index">第 ${index + 1} 题</div><div class="q-text">${esc(q.q)}</div>`;
    const opts = el('div');
    (q.opts || []).forEach((text, i) => {
      const b = el('button', 'opt', esc(text));
      b.addEventListener('click', () => {
        if (box.dataset.done) return;
        box.dataset.done = '1';
        [...opts.children].forEach((c, j) => { c.disabled = true; if (j === q.ans) c.classList.add('correct'); else if (j === i) c.classList.add('wrong'); });
        if (q.why) box.appendChild(el('div', 'why', '▸ ' + esc(q.why)));
        box.dispatchEvent(new CustomEvent('answered'));
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    return box;
  }

  function showFinish(v, sid, uid) {
    if ($('#finishBox')) return;
    markDone(sid, uid);
    const units = unitsOf(sid);
    const idx = units.findIndex((u) => u.id === uid);
    const next = units[idx + 1];
    const box = el('div', 'finish');
    box.id = 'finishBox';
    box.innerHTML = `<div class="big">◆</div><p class="muted">这一节完了 · 连续 ${streakAlive()} 天</p>`;
    const btns = el('div', 'btns');
    if (next) {
      const b = el('button', 'btn', '下一节');
      b.addEventListener('click', () => go({ name: 'lesson', sid, uid: next.id }));
      btns.appendChild(b);
    }
    const back = el('button', 'btn ghost', '回课程');
    back.addEventListener('click', () => go({ name: 'course', sid }));
    btns.appendChild(back);
    box.appendChild(btns);
    v.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* 书库 */
  async function renderBooks() {
    setNav('');
    const v = $('#view'); v.innerHTML = '';
    if (!booksData) { try { booksData = await getJSON('content/bulk-books.json'); } catch (e) { booksData = null; } }
    if (!booksData) { v.appendChild(el('div', 'empty', '书单读不出来。')); return; }

    const upBtn = el('button', 'btn ghost', '上传自己的书');
    upBtn.style.marginBottom = '14px';
    v.appendChild(upBtn);
    upBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'application/pdf'; inp.multiple = true;
      inp.onchange = async () => {
        const L = window.MG_LOCAL;
    const recs = (await L.list()).sort((a, b) => b.addedAt - a.addedAt);
    if (recs.length) {
      const h = el('div', 'cat-head');
      h.innerHTML = `<h3>我上传的</h3><span>${recs.length} 本</span>`;
      v.appendChild(h);
      const card = el('div', 'card');
      recs.forEach((rec) => {
        const row = el('div', 'book');
        row.innerHTML = `<div class="b-main"><div class="b-title">${esc(rec.title)}</div><div class="b-meta">${(rec.size / 1048576).toFixed(1)} MB</div></div>`;
        const open = el('button', 'b-btn', '打开');
        open.addEventListener('click', () => window.open(L.urlOf(rec), '_blank'));
        const del = el('button', 'b-btn', '删');
        del.addEventListener('click', async () => { if (!confirm(`删掉《${rec.title}》？`)) return; await L.del(rec.id); renderBooks(); });
        row.appendChild(open); row.appendChild(del);
        card.appendChild(row);
      });
      v.appendChild(card);
    }

    /* 内置书库：按分类列出 */
    const all = Array.isArray(booksData) ? booksData : (booksData.books || []);
    const byCat = {};
    all.forEach((b) => { (byCat[b.category] = byCat[b.category] || []).push(b); });
    const cats = Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length);

    const sum = el('div', 'muted', `${all.length} 本 · 内置 ${all.filter((b) => b.builtin).length} 本可离线读`);
    sum.style.cssText = 'margin:14px 0 6px;font-size:13px';
    v.appendChild(sum);

    cats.forEach((cat) => {
      const head = el('div', 'cat-head');
      const n = byCat[cat].length;
      head.innerHTML = `<h3>${esc(cat)}</h3><span>${n}</span>`;
      v.appendChild(head);
      const card = el('div', 'card');
      byCat[cat].slice(0, 400).forEach((b) => {
        const row = el('div', 'book');
        const kb = b.kb < 1024 ? Math.round(b.kb) + ' KB' : (b.kb / 1024).toFixed(1) + ' MB';
        row.innerHTML = `<div class="b-main"><div class="b-title">${esc(b.title.split('\n')[0])}</div>
          <div class="b-meta">${esc((b.author || '').slice(0, 30))}${b.author ? ' · ' : ''}${kb}</div></div>`;
        if (b.builtin) {
          const open = el('button', 'b-btn', '阅读');
          open.addEventListener('click', () => window.open('books/' + b.file, '_blank'));
          row.appendChild(open);
        } else {
          const open = el('button', 'b-btn ghost', '在线读');
          open.addEventListener('click', () => window.open('books-remote/' + b.file, '_blank'));
          row.appendChild(open);
        }
        card.appendChild(row);
      });
      v.appendChild(card);
    });
  };
      inp.click();
    });

    const L = window.MG_LOCAL;
    const recs = (await L.list()).sort((a, b) => b.addedAt - a.addedAt);
    if (recs.length) {
      const h = el('div', 'cat-head');
      h.innerHTML = `<h3>我上传的</h3><span>${recs.length} 本</span>`;
      v.appendChild(h);
      const card = el('div', 'card');
      recs.forEach((rec) => {
        const row = el('div', 'book');
        row.innerHTML = `<div class="b-main"><div class="b-title">${esc(rec.title)}</div><div class="b-meta">${(rec.size / 1048576).toFixed(1)} MB</div></div>`;
        const open = el('button', 'b-btn', '打开');
        open.addEventListener('click', () => window.open(L.urlOf(rec), '_blank'));
        const del = el('button', 'b-btn', '删');
        del.addEventListener('click', async () => { if (!confirm(`删掉《${rec.title}》？`)) return; await L.del(rec.id); renderBooks(); });
        row.appendChild(open); row.appendChild(del);
        card.appendChild(row);
      });
      v.appendChild(card);
    }

    (booksData.categories || []).forEach((cat) => {
      const h = el('div', 'cat-head');
      h.innerHTML = `<h3>${esc(cat.name)}</h3><span>${cat.count} 本</span>`;
      v.appendChild(h);
      const card = el('div', 'card');
      cat.books.forEach((b) => {
        const isHtml = b.kind === 'html';
        const row = el('div', 'book');
        row.innerHTML = `<div class="b-main"><div class="b-title">${esc(b.title)}</div>
          <div class="b-meta">${b.size_mb} MB${isHtml ? ' · 内置' : ''}</div></div>`;
        const btn = el('button', 'b-btn', isHtml ? '阅读' : '下载');
        btn.addEventListener('click', async () => {
          if (isHtml) { window.open(b.file, '_blank'); return; }
          if (!b.url) { toast('这本书还没上架'); return; }
          btn.disabled = true; btn.textContent = '0%';
          try { await downloadWithProgress(b.url, btn); } catch (e) { toast('下载失败：' + e.message); btn.disabled = false; btn.textContent = '下载'; progressBar(false); }
        });
        row.appendChild(btn);
        card.appendChild(row);
      });
      v.appendChild(card);
    });
  }

  async function downloadWithProgress(url, btn) {
    progressBar(true);
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const total = Number(res.headers.get('content-length') || 0);
    const reader = res.body.getReader();
    const chunks = []; let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); got += value.length;
      const pct = total ? (got / total) * 100 : 0;
      if (total) { setProgress(pct); btn.textContent = Math.round(pct) + '%'; }
      else btn.textContent = (got / 1048576).toFixed(1) + 'MB';
    }
    const blob = new Blob(chunks, { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = url.split('/').pop();
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    progressBar(false);
    btn.textContent = '已下载';
    toast('已保存');
  }

  /* 工具 */
  const TOOLS = [
    ['bazi', '八字排盘'], ['ziwei', '紫微斗数'], ['aigua', 'AI 解卦'], ['moon', '月相'], ['huangli', '黄历'], ['hours', '行星时'],
    ['week', '七日择日'], ['pick', '择时助手'], ['corr', '行星对应'], ['meihua', '梅花易数'],
    ['liuyao', '六爻'], ['calendar', '万年历'], ['compass', '罗盘'], ['ruling', '立极尺'],
  ];

  function renderTools() {
    setNav('');
    const v = $('#view'); v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '工具'));
    const card = el('div', 'card');
    TOOLS.forEach(([id, name]) => {
      const row = el('div', 'tool-item');
      row.innerHTML = `<span>${esc(name)}</span><span class="chev">›</span>`;
      row.addEventListener('click', () => go({ name: 'tool', tid: id }));
      card.appendChild(row);
    });
    v.appendChild(card);
  }

  function renderTool(tid) {
    const t = TOOLS.find((x) => x[0] === tid);
    setNav(t ? t[1] : '工具');
    const v = $('#view'); v.innerHTML = '';
    const fn = TOOL_VIEWS[tid];
    if (!fn) { v.appendChild(el('div', 'empty', '还没做。')); return; }
    fn(v);
  }

  function hexCard(label, hex, moving) {
    const lines = hex.bits.map((b, i) => {
      const mark = moving !== undefined && moving === i ? ' ●' : '';
      return `<div style="font-family:monospace;font-size:15px;letter-spacing:3px">${b ? '▬▬▬▬▬' : '▬▬ ▬▬'}${mark}</div>`;
    }).reverse().join('');
    const yao = moving !== undefined && hex.yao[moving] ? `<div class="muted" style="margin-top:6px">动爻：${esc(hex.yao[moving])}</div>` : '';
    return `<div style="margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:12px">
      <div class="muted">${label}</div><div style="font-size:17px;color:var(--gold-soft);margin:4px 0 8px">${esc(hex.full)}</div>
      ${lines}<div class="muted" style="margin-top:8px">${esc((hex.line || '').slice(0, 60))}</div>${yao}</div>`;
  }

  const TOOL_VIEWS = {};

  /* 我的 */
  function renderMe() {
    setNav('');
    const v = $('#view'); v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '设置'));

    const card = el('div', 'card');
    card.innerHTML = `<div class="row-link"><span>主题</span><span class="k2">${state.theme === 'light' ? '亮色' : '暗色'}</span></div>
      <div class="switch-row"><button id="thD" class="${state.theme !== 'light' ? 'on' : ''}">暗色</button>
      <button id="thL" class="${state.theme === 'light' ? 'on' : ''}">亮色</button></div>`;
    v.appendChild(card);
    card.querySelector('#thD').addEventListener('click', () => { state.theme = 'dark'; save(); applyTheme(); renderMe(); });
    card.querySelector('#thL').addEventListener('click', () => { state.theme = 'light'; save(); applyTheme(); renderMe(); });

    const S = window.MG_SYNC;
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

    const up = el('div', 'card');
    up.innerHTML = `<div class="row-link"><span>有新版本了吗</span><span class="k2">现在是 v${esc(window.MG_UPDATE.localVersion)}</span></div>
      <button class="btn ghost" id="upBtn" style="margin-top:10px">看看有没有新版</button><div id="upOut" class="muted" style="margin-top:10px"></div>`;
    v.appendChild(up);
    up.querySelector('#upBtn').addEventListener('click', async () => {
      const o = up.querySelector('#upOut');
      o.textContent = '正在看…';
      try {
        const r = await window.MG_UPDATE.check();
        if (!r.hasUpdate) { o.textContent = '已经是最新的了'; return; }
        o.innerHTML = `有新版本（${r.apkSize} MB），点下面按钮直接装`;
        const b = el('button', 'btn', '下载并安装');
        b.style.marginTop = '10px';
        b.addEventListener('click', async () => { b.disabled = true; b.textContent = '正在下载，别关这个页面…'; await window.MG_UPDATE.install(r.apkUrl); b.textContent = '已开始'; });
        o.appendChild(document.createElement('br')); o.appendChild(b);
      } catch (e) { o.textContent = e.message; }
    });

    const reset = el('div', 'card');
    reset.innerHTML = `<div class="row-link"><span>清除学习记录</span><span class="k2">不删书</span></div>`;
    const rb = el('button', 'btn ghost', '清除');
    rb.style.marginTop = '10px';
    rb.addEventListener('click', () => {
      if (!confirm('确定清除所有学习进度？')) return;
      const packs = state.packs, theme = state.theme, cur = state.current;
      state = Object.assign(empty(), { packs, theme, current: cur });
      save(); toast('已清除'); render();
    });
    reset.appendChild(rb);
    v.appendChild(reset);
  }

  /* 路由 */
  function go(r) {
    route = r;
    const tabs = { today: 1, courses: 1, books: 1, tools: 1, me: 1 };
    if (tabs[r.name]) {
      $('#tabbar').hidden = false;
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === r.name));
      if (r.name === 'today') renderToday();
      else if (r.name === 'courses') renderCourses();
      else if (r.name === 'books') renderBooks();
      else if (r.name === 'tools') renderTools();
      else renderMe();
    } else {
      $('#tabbar').hidden = true;
      if (r.name === 'course') renderCourse(r.sid);
      else if (r.name === 'lesson') renderLesson(r.sid, r.uid);
      else if (r.name === 'tool') renderTool(r.tid);
    }
    window.scrollTo(0, 0);
  }
  function render() { go({ name: 'today' }); }


  /* ---------- 首次引导 ---------- */
  function showGuide() {
    const pages = [
      {
        icon: '◆',
        title: '魔女手札',
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

  async function main() {
    applyTheme();
    $('#backBtn').addEventListener('click', () => go({ name: 'today' }));
    document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => go({ name: t.dataset.tab })));
    await boot();
    go({ name: 'today' });
    if (!state.guided) showGuide();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  window.MG_APP = { TOOL_VIEWS, go, render, toast, hexCard, esc };
  document.addEventListener('DOMContentLoaded', main);
})();
