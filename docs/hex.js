/* 梅花易数 / 六爻 —— 依赖 content/hexagrams.json */
(() => {
  'use strict';

  let H = null; // hexagrams.json

  async function load() {
    if (H) return H;
    const res = await fetch('content/hexagrams.json', { cache: 'force-cache' });
    H = await res.json();
    return H;
  }

  const TRI_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

  /** 由三爻（下→上，1=阳）反查八卦名 */
  function trigramName(bits) {
    const key = bits.join('');
    for (const [name, arr] of Object.entries(H.trigrams)) {
      if (arr.join('') === key) return name;
    }
    return '?';
  }

  /** 六爻（下→上）-> 卦 */
  function hexagramOf(bits) {
    const low = bits.slice(0, 3);
    const up = bits.slice(3, 6);
    const lowName = trigramName(low);
    const upName = trigramName(up);
    const simple = H.table[`${upName}|${lowName}`];
    const info = H.names[simple] || {};
    return {
      bits,
      up: upName,
      low: lowName,
      name: simple,
      full: info.full || `${upName}${lowName}`,
      line: info.line || '',
      yao: info.yao || [],
    };
  }

  /** 梅花易数：数字起卦（上卦/下卦/动爻） */
  function meihua(n1, n2, extra) {
    const a = ((n1 - 1) % 8 + 8) % 8;
    const b = ((n2 - 1) % 8 + 8) % 8;
    const moving = (((n1 + n2 + (extra || 0)) - 1) % 6 + 6) % 6; // 0..5，0 = 初爻
    const up = TRI_ORDER[a];
    const low = TRI_ORDER[b];
    const bits = [...H.trigrams[low], ...H.trigrams[up]];
    const primary = hexagramOf(bits);
    // 变卦：动爻取反
    const changed = bits.map((v, i) => (i === moving ? 1 - v : v));
    return { moving, primary, changed: hexagramOf(changed) };
  }

  /** 六爻：掷三枚钱六次（6 老阴 / 7 少阳 / 8 少阴 / 9 老阳） */
  function tossLine() {
    let sum = 0;
    for (let i = 0; i < 3; i++) sum += Math.random() < 0.5 ? 2 : 3; // 背=2 面=3
    return sum; // 6,7,8,9
  }

  function liuyao(lines) {
    // lines: 6 个数，从初爻到上爻
    const bits = lines.map((v) => (v === 7 || v === 9 ? 1 : 0));
    const moving = lines.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((i) => i >= 0);
    const changedBits = bits.map((b, i) => (moving.includes(i) ? 1 - b : b));
    return {
      lines,
      moving,
      primary: hexagramOf(bits),
      changed: moving.length ? hexagramOf(changedBits) : null,
    };
  }

  window.MG_HEX = { load, hexagramOf, meihua, tossLine, liuyao, trigramName };
})();
