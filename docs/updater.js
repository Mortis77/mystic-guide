/* 版本检查与更新（参考 MAA：查 GitHub Releases → 比对 → 下载 → 安装） */
(() => {
  'use strict';

  const REPO = 'Mortis77/mystic-guide';
  const API_LIST = `https://api.github.com/repos/${REPO}/releases?per_page=20`;
  // 本地版本：构建时由 scripts/stamp_version.py 写入 version.js；缺省按 0.0.0 处理
  const LOCAL = (window.MG_VERSION && window.MG_VERSION.version) || '0.0.0';

  const parse = (v) =>
    String(v || '')
      .replace(/^v/i, '')
      .split(/[.+-]/)
      .map((x) => parseInt(x, 10) || 0);

  function cmp(a, b) {
    const pa = parse(a), pb = parse(b);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return 0;
  }

  async function check() {
    const res = await fetch(API_LIST, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('拿不到版本信息（' + res.status + '）');
    const list = await res.json();
    // 只认 tag 形如 v1.2.3 的正式版，且必须带 apk
    const rel = list.find(
      (r) => /^v\d+(\.\d+)*$/i.test(r.tag_name || '') && (r.assets || []).some((a) => /\.apk$/i.test(a.name))
    );
    if (!rel) throw new Error('还没发布过带 APK 的版本');
    const latest = (rel.tag_name || '').replace(/^v/i, '');
    const apk = (rel.assets || []).find((a) => /\.apk$/i.test(a.name));
    return {
      local: LOCAL,
      latest,
      hasUpdate: cmp(latest, LOCAL) > 0,
      name: rel.name || rel.tag_name,
      notes: rel.body || '',
      publishedAt: rel.published_at,
      apkUrl: apk.browser_download_url,
      apkSize: (apk.size / 1048576).toFixed(1),
      pageUrl: rel.html_url,
    };
  }

  const canInstall = () => !!(window.AndroidApp && typeof window.AndroidApp.installApk === 'function');

  async function install(url) {
    if (canInstall()) {
      window.AndroidApp.installApk(url);
      return 'installing';
    }
    window.open(url, '_blank');
    return 'downloaded';
  }

  window.MG_UPDATE = { check, install, canInstall, localVersion: LOCAL, cmp };
})();
