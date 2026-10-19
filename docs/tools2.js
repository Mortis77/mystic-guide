/* 扩展工具：行星时 / 七日择日 */
(() => {
  'use strict';

  // 迦勒底顺序（由慢到快）
  const CHALDEAN = ['土星', '木星', '火星', '太阳', '金星', '水星', '月亮'];
  // 星期几的第 1 小时归谁：周日太阳、周一月亮、周二火星、周三四星、周四木星、周五金星、周六土星
  const DAY_RULER = { 0: '太阳', 1: '月亮', 2: '火星', 3: '水星', 4: '木星', 5: '金星', 6: '土星' };
  const PLANET_SYMBOL = { 土星: '♄', 木星: '♃', 火星: '♂', 太阳: '☉', 金星: '♀', 水星: '☿', 月亮: '☾' };
  const PLANET_USE = {
    土星: '约束、守成、了结旧事',
    木星: '扩张、求财、结交、学业',
    火星: '决断、冲突、动手',
    太阳: '名声、上位、见人',
    金星: '和好、审美、情事',
    水星: '沟通、书写、交易',
    月亮: '变化、出行、家事',
  };

  const RAD = Math.PI / 180;

  /** 太阳赤纬（近似） */
  function declination(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const n = Math.floor((date - start) / 86400000);
    return 23.44 * Math.sin((360 / 365) * (n - 81) * RAD);
  }

  /** 日出日落（当地时间，按经度粗算；lat/lon 为度数） */
  function sunTimes(date, lat, lon) {
    const d = declination(date);
    const cosH = -Math.tan(lat * RAD) * Math.tan(d * RAD);
    if (cosH > 1) return null;   // 极夜
    if (cosH < -1) return null;  // 极昼
    const H = Math.acos(cosH) / RAD; // 度
    const solarNoon = 12 - lon / 15 + 8; // 以东八区为基准近似
    const sunrise = solarNoon - H / 15;
    const sunset = solarNoon + H / 15;
    return { sunrise, sunset };
  }

  function fmtHour(h) {
    if (h == null || isNaN(h)) return '—';
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
  }

  /** 计算某天的 24 个行星时 */
  function planetaryHours(date, lat, lon) {
    const st = sunTimes(date, lat, lon);
    if (!st) return null;
    const dow = date.getDay();
    const ruler = DAY_RULER[dow];
    const startIdx = CHALDEAN.indexOf(ruler);
    const dayLen = (st.sunset - st.sunrise) / 12;
    const nightLen = (24 - (st.sunset - st.sunrise)) / 12;

    const hours = [];
    for (let i = 0; i < 12; i++) {
      const from = st.sunrise + i * dayLen;
      hours.push({
        idx: i + 1,
        day: true,
        from, to: from + dayLen,
        planet: CHALDEAN[(startIdx + i) % 7],
      });
    }
    for (let i = 0; i < 12; i++) {
      let from = st.sunset + i * nightLen;
      if (from >= 24) from -= 24;
      hours.push({
        idx: i + 13,
        day: false,
        from, to: from + nightLen > 24 ? from + nightLen - 24 : from + nightLen,
        planet: CHALDEAN[(startIdx + 12 + i) % 7],
      });
    }
    return { ruler, sunrise: st.sunrise, sunset: st.sunset, hours };
  }

  /** 未来 n 天宜忌概览 */
  function upcoming(n) {
    const out = [];
    const today = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      try {
        const solar = Solar.fromDate(d);
        const lunar = solar.getLunar();
        out.push({
          date: `${d.getMonth() + 1}月${d.getDate()}日`,
          week: '日一二三四五六'[d.getDay()],
          lunarText: lunar.toString(),
          gz: `${lunar.getDayInGanZhi()}日`,
          yi: (lunar.getDayYi && lunar.getDayYi()) || [],
          ji: (lunar.getDayJi && lunar.getDayJi()) || [],
        });
      } catch (e) {
        /* 跳过 */
      }
    }
    return out;
  }

  window.MG_TOOLS2 = { planetaryHours, sunTimes, upcoming, CHALDEAN, PLANET_SYMBOL, PLANET_USE, DAY_RULER, fmtHour };
})();
