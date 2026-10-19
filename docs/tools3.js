/* 择时助手 + 行星对应 */
(() => {
  'use strict';

  // 七行星对应（金属/颜色/节日/植物，依 Agrippa 卷一 ch.24–29 的常见口径）
  const CORR = {
    太阳: { metal: '金', color: '金黄、橙', day: '周日', plant: '月桂、向日葵、乳香', stone: '红宝石、金刚石', use: '名声、上位、见贵人' },
    月亮: { metal: '银', color: '银白、浅蓝', day: '周一', plant: '月桂、茉莉、睡莲', stone: '月光石、珍珠', use: '变化、出行、家事、梦' },
    火星: { metal: '铁', color: '红', day: '周二', plant: '苦艾、荨麻、胡椒', stone: '红玉髓、赤铁矿', use: '决断、冲突、动手、驱赶' },
    水星: { metal: '水银', color: '橙黄、杂色', day: '周三', plant: '茴香、薰衣草、核桃', stone: '玛瑙、黄水晶', use: '沟通、书写、交易、考试' },
    木星: { metal: '锡', color: '紫、蓝', day: '周四', plant: '雪松、丁香、肉豆蔻', stone: '青金石、蓝宝石', use: '求财、扩张、结交、学业' },
    金星: { metal: '铜', color: '绿、粉', day: '周五', plant: '玫瑰、马鞭草、桃', stone: '祖母绿、孔雀石', use: '和好、审美、情事' },
    土星: { metal: '铅', color: '黑、深灰', day: '周六', plant: '柏树、没药、黑麦', stone: '黑碧玺、煤精', use: '约束、守成、了结旧事' },
  };

  const SYM = { 土星: '♄', 木星: '♃', 火星: '♂', 太阳: '☉', 金星: '♀', 水星: '☿', 月亮: '☾' };

  // 做事 -> 主星
  const INTENT = {
    求财: '木星',
    学业: '木星',
    名声: '太阳',
    见人: '太阳',
    和好: '金星',
    情事: '金星',
    沟通: '水星',
    交易: '水星',
    决断: '火星',
    驱赶: '火星',
    了结: '土星',
    守成: '土星',
    出行: '月亮',
    家事: '月亮',
  };

  /** 未来 n 天里，某主星的可用时段（行星日 + 该日相位） */
  function findWindows(intent, n, lat, lon) {
    const planet = INTENT[intent] || '木星';
    const T2 = window.MG_TOOLS2;
    const T = window.MG_TOOLS;
    const out = [];
    const today = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      let ph;
      try {
        ph = T2.planetaryHours(d, lat, lon);
      } catch (e) {
        continue;
      }
      if (!ph) continue;
      const slots = ph.hours.filter((h) => h.planet === planet);
      if (!slots.length) continue;
      let moon = null;
      try { moon = T.moonPhase(d); } catch (e) {}
      out.push({
        date: `${d.getMonth() + 1}月${d.getDate()}日`,
        week: '日一二三四五六'[d.getDay()],
        isPlanetDay: ph.ruler === planet,
        slots: slots.map((h) => ({ label: `${h.day ? '日' : '夜'}${h.idx > 12 ? h.idx - 12 : h.idx}`, time: `${T2.fmtHour(h.from)}–${T2.fmtHour(h.to)}` })),
        moon: moon ? { name: moon.phase.name, illum: moon.illum } : null,
      });
    }
    return { planet, windows: out };
  }

  window.MG_TOOLS3 = { CORR, SYM, INTENT, findWindows };
})();
