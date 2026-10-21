/* 跨设备同步：GitHub Gist（可选）+ 本地导出导入 */
(() => {
  'use strict';

  const API = 'https://api.github.com/gists';
  const FILE = 'mystic-guide-progress.json';

  const cfg = () => {
    try {
      return JSON.parse(localStorage.getItem('mg-sync') || '{}');
    } catch (e) {
      return {};
    }
  };
  const saveCfg = (c) => localStorage.setItem('mg-sync', JSON.stringify(c));

  function headers(token) {
    const h = { Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
    if (token) h.Authorization = `token ${token}`;
    return h;
  }

  /** 创建新 Gist，返回 id */
  async function createGist(token, payload) {
    const res = await fetch(API, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        description: '魔女手札 学习进度',
        public: false,
        files: { [FILE]: { content: JSON.stringify(payload, null, 1) } },
      }),
    });
    if (!res.ok) throw new Error('创建失败（' + res.status + '）');
    const data = await res.json();
    return data.id;
  }

  async function push(token, gistId, payload) {
    const res = await fetch(`${API}/${gistId}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ files: { [FILE]: { content: JSON.stringify(payload, null, 1) } } }),
    });
    if (!res.ok) throw new Error('上传失败（' + res.status + '）');
    return true;
  }

  async function pull(token, gistId) {
    const res = await fetch(`${API}/${gistId}`, { headers: headers(token) });
    if (!res.ok) throw new Error('拉取失败（' + res.status + '）');
    const data = await res.json();
    const f = data.files && data.files[FILE];
    if (!f) throw new Error('这个 Gist 里没有进度文件');
    const text = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
    return JSON.parse(text);
  }

  /** 合并两份进度：取并集，新的完成时间优先 */
  function merge(local, remote) {
    const out = JSON.parse(JSON.stringify(local || {}));
    out.done = out.done || {};
    out.days = out.days || {};
    if (remote && remote.done) {
      for (const [k, ts] of Object.entries(remote.done)) {
        if (!out.done[k] || ts > out.done[k]) out.done[k] = ts;
      }
    }
    if (remote && remote.days) {
      for (const [k, n] of Object.entries(remote.days)) {
        out.days[k] = Math.max(out.days[k] || 0, n);
      }
    }
    out.streak = Math.max(out.streak || 0, (remote && remote.streak) || 0);
    if (remote && remote.lastDay && (!out.lastDay || remote.lastDay > out.lastDay)) {
      out.lastDay = remote.lastDay;
    }
    return out;
  }

  /** 导出为文件 */
  function exportFile(state) {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `魔女手札-进度-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /** 从文件导入 */
  function importFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async () => {
        try {
          const text = await input.files[0].text();
          resolve(JSON.parse(text));
        } catch (e) {
          reject(e);
        }
      };
      input.click();
    });
  }

  window.MG_SYNC = {
    cfg,
    saveCfg,
    createGist,
    push,
    pull,
    merge,
    exportFile,
    importFile,
    FILE,
  };
})();
