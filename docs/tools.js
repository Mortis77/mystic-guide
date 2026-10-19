/* 实用工具：八字排盘 / 月相 / 黄历。依赖 vendor/lunar.js（全局 Lunar, Solar） */
(() => {
  'use strict';

  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  const ZHI_WUXING = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };

  const SYNODIC = 29.530588853;
  const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

  const PHASES = [
    { at: 0, name: '新月', note: '看不见，适合起意' },
    { at: 3.7, name: '蛾眉月', note: '刚起头，力气小' },
    { at: 7.4, name: '上弦月', note: '推进最快的时候' },
    { at: 11.1, name: '盈凸月', note: '接近满，收尾前' },
    { at: 14.8, name: '满月', note: '最亮，也最容易过头' },
    { at: 18.4, name: '亏凸月', note: '开始退' },
    { at: 22.1, name: '下弦月', note: '拆解、清理' },
    { at: 25.8, name: '残月', note: '收尾，别开新事' },
  ];

  function moonAge(date) {
    const d = date.getTime() / 86400000;
    let age = (d - REF_NEW_MOON) % SYNODIC;
    if (age < 0) age += SYNODIC;
    return age;
  }

  function moonPhase(date) {
    const age = moonAge(date);
    let idx = 0;
    for (let i = 0; i < PHASES.length; i++) if (age >= PHASES[i].at) idx = i;
    const next = PHASES[(idx + 1) % PHASES.length];
    const pct = Math.round((age / SYNODIC) * 100);
    return { age, phase: PHASES[idx], next, pct, illum: Math.round((1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2 * 100) };
  }

  function dayGanZhi(date) {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    return {
      solar,
      lunar,
      year: lunar.getYearInGanZhiExact ? lunar.getYearInGanZhiExact() : lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhiExact ? lunar.getMonthInGanZhiExact() : lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      time: lunar.getTimeInGanZhi(),
      shengxiao: lunar.getYearShengXiao(),
      lunarText: lunar.toString(),
      yi: (lunar.getDayYi && lunar.getDayYi()) || [],
      ji: (lunar.getDayJi && lunar.getDayJi()) || [],
      jieqi: lunar.getJieQi ? lunar.getJieQi() : '',
      chong: lunar.getDayChongDesc ? lunar.getDayChongDesc() : '',
      sha: lunar.getDaySha ? lunar.getDaySha() : '',
    };
  }

  function wuxingOf(gz) {
    if (!gz) return '';
    const g = GAN_WUXING[gz[0]] || '';
    const z = ZHI_WUXING[gz[1]] || '';
    return g === z ? g : g + z;
  }

  function bazi(y, m, d, h, mi) {
    const solar = Solar.fromYmdHms(y, m, d, h, mi, 0);
    const lunar = solar.getLunar();
    const ec = lunar.getEightChar();
    const pillars = [
      { label: '年柱', gz: ec.getYear(), wuxing: wuxingOf(ec.getYear()) },
      { label: '月柱', gz: ec.getMonth(), wuxing: wuxingOf(ec.getMonth()) },
      { label: '日柱', gz: ec.getDay(), wuxing: wuxingOf(ec.getDay()) },
      { label: '时柱', gz: ec.getTime(), wuxing: wuxingOf(ec.getTime()) },
    ];
    const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    pillars.forEach((p) => {
      const w = GAN_WUXING[p.gz[0]]; if (w) counts[w]++;
      const zw = ZHI_WUXING[p.gz[1]]; if (zw) counts[zw]++;
    });
    const nayin = [ec.getYearNaYin(), ec.getMonthNaYin(), ec.getDayNaYin(), ec.getTimeNaYin()];
    const shishen = [ec.getYearShiShenGan(), ec.getMonthShiShenGan(), '日主', ec.getTimeShiShenGan()];
    const missing = Object.keys(counts).filter((k) => counts[k] === 0);
    return {
      pillars, nayin, shishen, counts, missing,
      lunarText: lunar.toString(),
      shengxiao: lunar.getYearShengXiao(),
      jieqi: lunar.getJieQi ? lunar.getJieQi() : '',
    };
  }

  window.MG_TOOLS = { moonAge, moonPhase, dayGanZhi, bazi, GAN, ZHI };
})();
