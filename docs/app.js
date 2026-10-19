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
      hero.querySelector('#libBtn').addEventListener('click', () => go({ name: 'library' }));
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
  function renderLibrary() {
    const v = $('#view');
    v.innerHTML = '';
    v.appendChild(el('div', 'section-title', '全部科目'));

    subjectList().forEach((s) => {
      const pack = packOf(s.id);
      const ready = pack ? pack.units.length : 0;
      const box = el('div', 'subject');
      const prog = pack ? doneCount(s) : 0;
      box.innerHTML = `
        <div class="subject-top">
          <div class="sub">
            <h3>${escapeHTML(s.name)}</h3>
            <div class="muted">${escapeHTML((s.goal || '').slice(0, 42))}…</div>
          </div>
          <span class="tag ${s.status === '进行中' ? 'live' : ''}">${s.status || ''}</span>
        </div>
        <div class="bar"><i style="width:${s.total_units ? Math.round((prog / s.total_units) * 100) : 0}%"></i></div>
        <div class="subject-foot">
          <span class="count">已装 ${ready} / 计划 ${s.total_units} 单元 · ${s.size_kb || '?'} KB</span>
          <button class="btn ghost" data-id="${s.id}">${pack ? '重新下载' : '下载'}</button>
        </div>
      `;
      box.querySelector('button').addEventListener('click', () => downloadPack(s));
      v.appendChild(box);
    });

    const refresh = el('button', 'btn ghost', '从内容源刷新清单');
    refresh.style.marginTop = '14px';
    refresh.addEventListener('click', refreshRemote);
    v.appendChild(refresh);
  }

  /* ---------------- 视图：我的 ---------------- */
  function renderMe() {
    const v = $('#view');
    v.innerHTML = '';

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
      if (r.name === 'library') renderLibrary();
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
