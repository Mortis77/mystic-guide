/* AI 解卦：起卦用现成库，解读调 DeepSeek API */
(() => {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KEY = () => localStorage.getItem('mg-ai-key') || '';

  function ready() {
    const A = window.MG_APP;
    if (!A || !A.TOOL_VIEWS) { setTimeout(ready, 30); return; }
    A.TOOL_VIEWS.aigua = (v) => {
      const box = el('div', 'tool');
      box.innerHTML = `
        <div class="t-sub">问一件事，起一卦，让 AI 照着卦辞说</div>
        <textarea id="agQ" rows="3" placeholder="想问什么？（具体一点，比如「这个月要不要换工作」）"
          style="width:100%;box-sizing:border-box;margin-top:8px"></textarea>
        <div class="row2" style="margin-top:8px">
          <button class="btn" id="agGo" style="margin-top:0">起卦并解读</button>
          <button class="btn ghost" id="agKey" style="margin-top:0">设置 API</button>
        </div>
        <div id="agOut"></div>`;
      v.appendChild(box);

      const out = box.querySelector('#agOut');

      box.querySelector('#agKey').addEventListener('click', () => {
        const k = prompt('粘贴 DeepSeek API Key（sk- 开头）。只存在这台手机上，不会上传。', KEY());
        if (k != null) { localStorage.setItem('mg-ai-key', k.trim()); toast(k.trim() ? '已保存' : '已清空'); }
      });

      box.querySelector('#agGo').addEventListener('click', async () => {
        const q = box.querySelector('#agQ').value.trim();
        if (!q) { toast('先写想问什么'); return; }
        out.innerHTML = '<div class="muted" style="margin-top:12px">起卦中…</div>';
        try {
          const hex = window.MG_HEX;
          await hex.load();
          const gua = hex.liuyao ? hex.liuyao() : null;
          if (!gua) { out.innerHTML = '<div class="muted">起卦失败</div>'; return; }
          const card = A.hexCard ? A.hexCard(gua) : `<div>${esc(gua.name || '')}</div>`;
          out.innerHTML = `<div style="margin-top:14px">${card}</div>`;

          const key = KEY();
          if (!key) {
            out.insertAdjacentHTML('beforeend',
              '<div class="muted" style="margin-top:12px">没有 API Key，只显示卦象。点「设置 API」填一个就能出解读。</div>');
            return;
          }
          const box2 = el('div', 'card', '<div class="muted">解读中…</div>');
          out.appendChild(box2);
          const promptText = [
            '你是一位讲传统易学的老师。有人问：「' + q + '」',
            '起得卦：' + (gua.name || '') + (gua.changeName ? '，变卦 ' + gua.changeName : ''),
            '本卦卦辞与爻辞如下（供参考）：' + JSON.stringify(gua.text || gua.meaning || '').slice(0, 1200),
            '请：① 先用两三句说这一卦的核心意思；② 结合所问之事给具体建议；③ 指出这一卦最需要注意的一处风险。',
            '要求：说人话，不要堆术语；不确定的地方直说不确定，不要编；总长控制在 400 字以内。',
          ].join('\n');

          const r = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [{ role: 'user', content: promptText }],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });
          if (!r.ok) {
            box2.innerHTML = `<div class="muted">接口返回 ${r.status}，检查 Key 或余额。</div>`;
            return;
          }
          const d = await r.json();
          const txt = d.choices && d.choices[0] && d.choices[0].message.content;
          box2.innerHTML = txt
            ? `<div style="line-height:1.9;white-space:pre-wrap">${esc(txt)}</div>`
            : '<div class="muted">没拿到内容。</div>';
        } catch (e) {
          out.innerHTML = `<div class="muted">出错了：${esc(e.message)}</div>`;
        }
      });
    };
  }
  ready();
})();
