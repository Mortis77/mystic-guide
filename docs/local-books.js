/* 本地书库：用户自行上传、存 IndexedDB、可选公开投稿 */
(() => {
  'use strict';

  const DB_NAME = 'mystic-guide-books';
  const STORE = 'files';
  let dbPromise = null;

  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function tx(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      const out = fn(store);
      t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
      t.onerror = () => reject(t.error);
    });
  }

  const list = () => tx('readonly', (s) => s.getAll());
  const put = (rec) => tx('readwrite', (s) => s.put(rec));
  const del = (id) => tx('readwrite', (s) => s.delete(id));

  async function addFile(file, meta) {
    const id = 'u' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const buf = await file.arrayBuffer();
    await put({
      id,
      title: (meta && meta.title) || file.name.replace(/\.pdf$/i, ''),
      size: file.size,
      mime: file.type || 'application/pdf',
      blob: new Blob([buf], { type: 'application/pdf' }),
      addedAt: Date.now(),
      public: !!(meta && meta.public),
    });
    return id;
  }

  function urlOf(rec) {
    return URL.createObjectURL(rec.blob);
  }

  /** 生成公开投稿的 GitHub issue 链接（无后端，走仓库投稿） */
  function submitUrl(rec) {
    const repo = 'Mortis77/mystic-guide';
    const title = encodeURIComponent(`[投稿] ${rec.title}`);
    const body = encodeURIComponent(
      [
        '**书名**：' + rec.title,
        '**大小**：' + (rec.size / 1048576).toFixed(1) + ' MB',
        '',
        '请把 PDF 拖到这里一起提交（GitHub issue 支持拖文件上传）。',
        '',
        '提交即表示同意把它放进公共书库，供其他用户下载。',
      ].join('\n')
    );
    return `https://github.com/${repo}/issues/new?template=book-submission.md&title=${title}&body=${body}`;
  }

  window.MG_LOCAL = { list, addFile, del, urlOf, submitUrl };
})();
