/* 万年历 / 电子罗盘 / 立极尺 */
(() => {
  'use strict';

  // 二十四山（每 15°一座，从正北顺时针）
  const SHAN24 = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
    '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
  const SHAN_START = 352.5; // 子山从 352.5° 开始

  const BAGUA8 = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾']; // 每 45°，从正北顺时针

  function shanOf(deg) {
    const d = ((deg - SHAN_START) % 360 + 360) % 360;
    return SHAN24[Math.floor(d / 15) % 24];
  }

  function baguaOf(deg) {
    const d = ((deg + 22.5) % 360 + 360) % 360;
    return BAGUA8[Math.floor(d / 45) % 8];
  }

  function dirName(deg) {
    const names = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return names[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
  }

  /** 某月日历：每天带农历日与节气 */
  function monthGrid(year, month) {
    const first = new Date(year, month - 1, 1);
    const days = new Date(year, month, 0).getDate();
    const startWeek = first.getDay();
    const cells = [];
    for (let i = 0; i < startWeek; i++) cells.push(null);
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month - 1, d);
      let lunarDay = '';
      let jieqi = '';
      try {
        const lunar = Solar.fromDate(date).getLunar();
        lunarDay = lunar.getDayInChinese();
        jieqi = lunar.getJieQi ? lunar.getJieQi() : '';
        if (lunar.getDay() === 1) lunarDay = lunar.getMonthInChinese() + '月';
      } catch (e) { /* skip */ }
      cells.push({ d, lunarDay, jieqi, weekend: date.getDay() === 0 || date.getDay() === 6 });
    }
    return { cells, year, month, days };
  }

  /** 罗盘：监听设备方向 */
  function watchCompass(onUpdate, onError) {
    const handler = (e) => {
      let heading = null;
      if (typeof e.webkitCompassHeading === 'number') heading = e.webkitCompassHeading;
      else if (typeof e.alpha === 'number') heading = (360 - e.alpha) % 360;
      if (heading == null) return;
      onUpdate({
        heading,
        shan: shanOf(heading),
        bagua: baguaOf(heading),
        dir: dirName(heading),
      });
    };
    const start = () => window.addEventListener('deviceorientationabsolute', handler, true) ||
      window.addEventListener('deviceorientation', handler, true);

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') start();
          else onError('没有拿到罗盘权限');
        })
        .catch(() => onError('这台设备不给方向数据'));
    } else if ('DeviceOrientationEvent' in window) {
      start();
    } else {
      onError('这台设备没有方向传感器');
    }
    return () => window.removeEventListener('deviceorientationabsolute', handler, true) ||
      window.removeEventListener('deviceorientation', handler, true);
  }

  window.MG_TOOLS5 = { SHAN24, shanOf, baguaOf, dirName, monthGrid, watchCompass };
})();
