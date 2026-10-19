#!/usr/bin/env python3
"""给 docs/app.js 打补丁：新增课程/书库/工具三视图，去掉无意义标识。"""
import re
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

# 1) renderLibrary -> renderCourses，去掉 status 标签与 ready/total 文案
new_courses = '''  function renderCourses() {
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
'''

s = re.sub(r"  function renderLibrary\(\) \{.*?\n  \}\n\n", new_courses + "\n", s, count=1, flags=re.S)

# 2) 新视图：书库 + 工具，插在「视图：我的」之前
insert = '''  /* ---------------- 视图：书库 ---------------- */
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
  }

'''
marker = "  /* ---------------- 视图：我的 ---------------- */"
if marker in s:
    s = s.replace(marker, insert + marker, 1)

# 3) 路由
s = s.replace("      if (r.name === 'library') renderLibrary();", "      if (r.name === 'courses') renderCourses();\n      else if (r.name === 'books') renderBooks();\n      else if (r.name === 'tools') renderTools();")
s = s.replace("go({ name: 'library' })", "go({ name: 'courses' })")
s = s.replace("go({ name: 'library' });", "go({ name: 'courses' });")

p.write_text(s, encoding="utf-8")
print("patched", p, len(s), "bytes")
print("renderCourses:", "renderCourses" in s, "| renderBooks:", "renderBooks" in s, "| renderTools:", "renderTools" in s)
