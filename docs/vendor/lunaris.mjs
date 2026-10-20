//#region src/core/constants.ts
const UNITS = {
	ms: "millisecond",
	s: "second",
	m: "minute",
	h: "hour",
	d: "day",
	w: "week",
	M: "month",
	q: "quarter",
	y: "year",
	lh: "lunarhour",
	ld: "lunarday",
	lM: "lunarmonth",
	ly: "lunaryear"
};
const LUNAR_UNITS_SET = /* @__PURE__ */ new Set([
	"lunarhour",
	"lunarday",
	"lunarmonth",
	"lunaryear"
]);
const INVALID_DATE_STRING = "Invalid Date";
const FORMAT_DEFAULT = "YYYY-MM-DDTHH:mm:ssZ";
const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
const REGEX_FORMAT = /\[([^\]]+)]|cZ|t|T|lYn|lMn|lDn|lHn|lY|lM|lL|lD|lH|cYsn|cYs|cYbn|cYb|cYn|cY|cMsn|cMs|cMbn|cMb|cMn|cM|cDsn|cDs|cDbn|cDb|cDn|cD|cHsn|cHs|cHbn|cHb|cHn|cH|dRr|dR|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
//#endregion
//#region src/core/date-utils.ts
/** 处理日期单位缩写为全名小写 */
const prettyUnit = (unit) => {
	if (!unit) return "";
	unit = unit.trim();
	return UNITS[unit] || unit.toLowerCase().replace(/s$/, "");
};
/** 转为日期对象 */
const parseDate = (date, isUTC = false) => {
	if (typeof date === "undefined") return /* @__PURE__ */ new Date();
	if (date === null) return /* @__PURE__ */ new Date(NaN);
	if (typeof date === "object" && !(date instanceof Date) && typeof date.toDate !== "undefined") return date.toDate();
	if (date instanceof Date) return new Date(date.valueOf());
	if (typeof date === "string" && !/Z$/i.test(date)) {
		const d = date.match(REGEX_PARSE);
		if (d) {
			const m = d[2] - 1 || 0;
			const ms = (d[7] || "0").substring(0, 3);
			if (isUTC) return new Date(Date.UTC(Number(d[1]), m, Number(d[3] || 1), Number(d[4] || 0), Number(d[5] || 0), Number(d[6] || 0), Number(ms)));
			return new Date(Number(d[1]), m, Number(d[3] || 1), Number(d[4] || 0), Number(d[5] || 0), Number(d[6] || 0), Number(ms));
		}
	}
	return new Date(date);
};
const getDateData = (date, dataKey, isUTC = false) => {
	return isUTC ? date[`getUTC${dataKey}`]() : date[`get${dataKey}`]();
};
/** 以 23 点换日，取得换日后的 date 对象 */
const getDateOfStartOf23H = (date, isUTC = false, isAddHours = false) => {
	const year = getDateData(date, "FullYear", isUTC);
	const month = getDateData(date, "Month", isUTC);
	const hours = getDateData(date, "Hours", isUTC);
	const day = getDateData(date, "Date", isUTC);
	const hoursStr = isAddHours ? hours === 23 ? " 00:00" : ` ${String(hours).padStart(2, "0")}:00` : "";
	return parseDate(`${year}/${month + 1}/${day + (hours === 23 ? 1 : 0)}${hoursStr}`, isUTC);
};
/** utc 偏移字符串 (+08:00) */
const padZoneStr = (instance) => {
	const negMinutes = -instance.utcOffset();
	const minutes = Math.abs(negMinutes);
	const hourOffset = Math.floor(minutes / 60);
	const minuteOffset = minutes % 60;
	return `${negMinutes <= 0 ? "+" : "-"}${String(hourOffset).padStart(2, "0")}:${String(minuteOffset).padStart(2, "0")}`;
};
/** 与 moment.js 保持一致的时区偏移计算（按 15 分钟取整） */
const computeUtcOffset = (date) => {
	return -Math.round(date.getTimezoneOffset() / 15) * 15;
};
function isNumber(value) {
	return !isNaN(Number(value));
}
//#endregion
//#region src/locale/zh.ts
/** 基准语言包：繁体中文 */
const locale$2 = {
	name: "zh",
	leap: "閏",
	lunarYearUnit: "年",
	lunarHourUnit: "時",
	bigMonth: "大",
	smallMonth: "小",
	weekdays: [
		"星期日",
		"星期一",
		"星期二",
		"星期三",
		"星期四",
		"星期五",
		"星期六"
	],
	weekdaysShort: [
		"週日",
		"週一",
		"週二",
		"週三",
		"週四",
		"週五",
		"週六"
	],
	weekdaysMin: [
		"日",
		"一",
		"二",
		"三",
		"四",
		"五",
		"六"
	],
	months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
	monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
	lunarMonths: "正月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
	lunarMonthsAlias: "正月_二月_三月_四月_五月_六月_七月_八月_九月_十月_冬月_腊月".split("_"),
	lunarDays: "初一_初二_初三_初四_初五_初六_初七_初八_初九_初十_十一_十二_十三_十四_十五_十六_十七_十八_十九_二十_廿一_廿二_廿三_廿四_廿五_廿六_廿七_廿八_廿九_三十".split("_"),
	numerals: "〇一二三四五六七八九十".split(""),
	constellationName: "白羊座_金牛座_雙子座_巨蟹座_狮子座_處女座_天秤座_天蝎座_射手座_摩羯座_水瓶座_雙魚座".split("_"),
	solarTerm: "小寒_大寒_立春_雨水_驚蟄_春分_清明_穀雨_立夏_小滿_芒種_夏至_小暑_大暑_立秋_處暑_白露_秋分_寒露_霜降_立冬_小雪_大雪_冬至".split("_"),
	seasonName: "春夏秋冬".split(""),
	stems: [
		"甲",
		"乙",
		"丙",
		"丁",
		"戊",
		"己",
		"庚",
		"辛",
		"壬",
		"癸"
	],
	branches: [
		"子",
		"丑",
		"寅",
		"卯",
		"辰",
		"巳",
		"午",
		"未",
		"申",
		"酉",
		"戌",
		"亥"
	],
	stemBranchSeparator: "",
	chineseZodiac: [
		"鼠",
		"牛",
		"虎",
		"兔",
		"龍",
		"蛇",
		"馬",
		"羊",
		"猴",
		"雞",
		"狗",
		"豬"
	],
	fiveElements: [
		"木",
		"火",
		"土",
		"金",
		"水"
	],
	eightTrigram: "坤震坎兌艮離巽乾".split(""),
	moonPhase: {
		朔: "朔",
		望: "望",
		弦: "弦",
		晦: "晦"
	},
	moonPhaseDetail: [
		"朔",
		"既朔",
		"蛾眉新",
		"蛾眉新",
		"蛾眉",
		"夕",
		"上弦",
		"上弦",
		"九夜",
		"宵",
		"宵",
		"宵",
		"漸盈凸",
		"小望",
		"望",
		"既望",
		"立待",
		"居待",
		"寢待",
		"更待",
		"漸虧凸",
		"下弦",
		"下弦",
		"有明",
		"有明",
		"蛾眉殘",
		"蛾眉殘",
		"殘",
		"曉",
		"晦"
	],
	directions: [
		"",
		"北",
		"西南",
		"東",
		"東南",
		"中",
		"西北",
		"西",
		"東北",
		"南"
	],
	formats: {
		LT: "HH:mm",
		LTS: "HH:mm:ss",
		L: "YYYY/MM/DD",
		LL: "YYYY年M月D日",
		LLL: "YYYY年M月D日Ah點mm分",
		LLLL: "YYYY年M月D日ddddAh點mm分",
		l: "YYYY/M/D",
		ll: "YYYY年M月D日",
		lll: "YYYY年M月D日 HH:mm",
		llll: "YYYY年M月D日dddd HH:mm"
	},
	meridiem: (hour, minute) => {
		const hm = hour * 100 + minute;
		if (hm < 600) return "凌晨";
		else if (hm < 900) return "早上";
		else if (hm < 1100) return "上午";
		else if (hm < 1300) return "中午";
		else if (hm < 1800) return "下午";
		return "晚上";
	},
	takeSound: [
		"海中金",
		"爐中火",
		"大林木",
		"路旁土",
		"劍鋒金",
		"山頭火",
		"澗下水",
		"城頭土",
		"白臘金",
		"楊柳木",
		"井泉水",
		"屋上土",
		"霹靂火",
		"松柏木",
		"長流水",
		"砂中金",
		"山下火",
		"平地木",
		"壁上土",
		"金箔金",
		"覆燈火",
		"天河水",
		"大驛土",
		"釵釧金",
		"桑柘木",
		"大溪水",
		"砂中土",
		"天上火",
		"石榴木",
		"大海水"
	],
	stemFetalGodPlace: [
		"門",
		"碓磨",
		"廚灶",
		"倉庫",
		"房床"
	],
	branchFetalGodPlace: [
		"碓",
		"廁",
		"爐",
		"門",
		"雞棲",
		"床"
	],
	fetalGodDirection: [
		"中",
		"東",
		"東南",
		"南",
		"西南",
		"西",
		"西北",
		"北",
		"東北"
	],
	fetalGodDayDesc: [
		"占門碓外東南",
		"碓磨廁外東南",
		"廚灶爐外正南",
		"倉庫門外正南",
		"房床棲外正南",
		"占門床外正南",
		"占碓磨外正南",
		"廚灶廁外西南",
		"倉庫爐外西南",
		"房床門外西南",
		"門雞棲外西南",
		"碓磨床外西南",
		"廚灶碓外西南",
		"倉庫廁外正西",
		"房床爐外正西",
		"占大門外正西",
		"碓磨棲外正西",
		"廚灶床外正西",
		"倉庫碓外西北",
		"房床廁外西北",
		"占門爐外西北",
		"門碓磨外西北",
		"廚灶棲外西北",
		"倉庫床外西北",
		"房床碓外正北",
		"占門廁外正北",
		"碓磨爐外正北",
		"廚灶門外正北",
		"倉庫棲外正北",
		"占房床房内北",
		"占門碓房内北",
		"碓磨廁房内北",
		"廚灶爐房内北",
		"門倉庫房内北",
		"房床棲房內中",
		"占門床房內中",
		"占碓磨房内南",
		"廚灶廁房内南",
		"倉庫爐房内南",
		"房床門房内西",
		"門雞棲房内東",
		"碓磨床房内東",
		"廚灶碓房内東",
		"倉庫廁房内東",
		"房床爐房内中",
		"占大門外東北",
		"碓磨棲外東北",
		"廚灶床外東北",
		"倉庫碓外東北",
		"房床廁外東北",
		"占門爐外東北",
		"門碓磨外正東",
		"廚灶棲外正東",
		"倉庫床外正東",
		"房床碓外正東",
		"占門廁外正東",
		"碓磨爐外東南",
		"廚灶門外東南",
		"倉庫棲外東南",
		"占房床外東南"
	],
	fetalGodInsideDesc: "内",
	fetalGodOutsideDesc: "外",
	lifeStage12: [
		"長生",
		"沐浴",
		"冠帶",
		"臨官",
		"帝旺",
		"衰",
		"病",
		"死",
		"墓",
		"絕",
		"胎",
		"養"
	],
	pengZu: {
		stem: [
			"甲不開倉財物耗散",
			"乙不栽植千株不長",
			"丙不修灶必見災殃",
			"丁不剃頭頭必生瘡",
			"戊不受田田主不祥",
			"己不破券二比並亡",
			"庚不經絡織機虛張",
			"辛不合醬主人不嘗",
			"壬不泱水更難提防",
			"癸不詞訟理弱敵強"
		],
		branch: [
			"子不問卜自惹禍殃",
			"丑不冠帶主不還鄉",
			"寅不祭祀神鬼不嘗",
			"卯不穿井水泉不香",
			"辰不哭泣必主重喪",
			"巳不遠行財物伏藏",
			"午不苫蓋屋主更張",
			"未不服藥毒氣入腸",
			"申不安床鬼祟入房",
			"酉不會客醉坐顛狂",
			"戌不吃犬作怪上床",
			"亥不嫁娶不利新郎"
		]
	},
	nineYun: {
		yuan: [
			"上元",
			"中元",
			"下元"
		],
		yun: [
			"一運",
			"二運",
			"三運",
			"四運",
			"五運",
			"六運",
			"七運",
			"八運",
			"九運"
		]
	},
	natalChart: {
		gender: ["坤造", "乾造"],
		tenGodShort: {
			正官: "官",
			七殺: "殺",
			正財: "財",
			偏財: "才",
			食神: "食",
			傷官: "傷",
			比肩: "比",
			劫財: "劫",
			正印: "印",
			梟神: "梟"
		}
	}
};
//#endregion
//#region src/core/config.ts
/** 全局配置（模块内可变单例） */
const _GlobalConfig = {
	isUTC: false,
	offset: 0,
	changeAgeTerm: 2,
	ziHourSplit: true,
	locales: { zh: locale$2 },
	lang: "zh"
};
/** 更新全局配置 */
function setGlobalConfig(config) {
	Object.assign(_GlobalConfig, config);
	return _GlobalConfig;
}
//#endregion
//#region src/core/data/lunar-data.ts
/** 农历数据支持范围（对应公历 1901-02-19 ~ 2101-01-28） */
const FIRST_YEAR = 1901;
const LAST_YEAR = 2100;
/**
* 农历每年月大小及闰月数据
* bit 0-11: 正月~十二月是否大月; bit 12: 闰月是否大月; bit 13+: 闰月月份(0=无闰月)
*/
const LUNAR_MONTH_DATAS = [
	1874,
	3749,
	43818,
	1611,
	2715,
	39590,
	1386,
	2905,
	19370,
	1874,
	52645,
	2853,
	2635,
	47691,
	685,
	1387,
	17845,
	3497,
	65170,
	3730,
	3365,
	44333,
	2646,
	694,
	39637,
	1748,
	3753,
	20298,
	3730,
	50854,
	1323,
	2647,
	47446,
	2906,
	1748,
	30561,
	1865,
	64275,
	2707,
	1323,
	54555,
	2733,
	1386,
	40357,
	2980,
	2889,
	19787,
	2709,
	60077,
	1334,
	2733,
	47818,
	1458,
	3493,
	32418,
	3402,
	66965,
	2711,
	1366,
	50549,
	2773,
	1746,
	34645,
	3749,
	1610,
	26191,
	2715,
	60122,
	1386,
	2921,
	43954,
	2898,
	2853,
	35627,
	2635,
	68267,
	685,
	1389,
	54697,
	3497,
	3474,
	36501,
	3365,
	85581,
	2646,
	694,
	49909,
	1749,
	3753,
	44882,
	3730,
	3366,
	25902,
	2647,
	68310,
	858,
	1749,
	43881,
	1865,
	1683,
	35483,
	1323,
	2651,
	19118,
	1386,
	60885,
	2980,
	2889,
	44371,
	2709,
	1325,
	34141,
	2741,
	76714,
	1490,
	3493,
	56970,
	3402,
	3221,
	35486,
	1366,
	2741,
	19162,
	1746,
	51045,
	1829,
	1611,
	42583,
	3243,
	1370,
	25966,
	2921,
	94034,
	2898,
	2853,
	56587,
	2635,
	1195,
	41659,
	1453,
	2922,
	19882,
	3474,
	61093,
	3365,
	2645,
	47693,
	1206,
	1461,
	30418,
	3785,
	69522,
	3730,
	3366,
	54550,
	2647,
	1238,
	37733,
	1877,
	1865,
	26443,
	1683,
	60075,
	1323,
	2651,
	43706,
	1386,
	2917,
	35754,
	2890,
	69013,
	2709,
	1325,
	50541,
	2741,
	1450,
	34261,
	3493,
	3402,
	28237,
	3222,
	60622,
	1366,
	2741,
	47826,
	1746,
	3749,
	34602,
	1675,
	67223,
	1195,
	1371,
	54614,
	2922,
	1874,
	35733,
	2885,
	2699,
	19023,
	1195
];
/** 每年春节（正月初一）日期，百位为月，余为日: 219 = 2月19日 */
const LUNAR_NEW_YEAR_DATE = [
	219,
	208,
	129,
	216,
	204,
	125,
	213,
	202,
	122,
	210,
	130,
	218,
	206,
	126,
	214,
	203,
	123,
	211,
	201,
	220,
	208,
	128,
	216,
	205,
	124,
	213,
	202,
	123,
	210,
	130,
	217,
	206,
	126,
	214,
	204,
	124,
	211,
	131,
	219,
	208,
	127,
	215,
	205,
	125,
	213,
	202,
	122,
	210,
	129,
	217,
	206,
	127,
	214,
	203,
	124,
	212,
	131,
	218,
	208,
	128,
	215,
	205,
	125,
	213,
	202,
	121,
	209,
	130,
	217,
	206,
	127,
	215,
	203,
	123,
	211,
	131,
	218,
	207,
	128,
	216,
	205,
	125,
	213,
	202,
	220,
	209,
	129,
	217,
	206,
	127,
	215,
	204,
	123,
	210,
	131,
	219,
	207,
	128,
	216,
	205,
	124,
	212,
	201,
	122,
	209,
	129,
	218,
	207,
	126,
	214,
	203,
	123,
	210,
	131,
	219,
	208,
	128,
	216,
	205,
	125,
	212,
	201,
	122,
	210,
	129,
	217,
	206,
	126,
	213,
	203,
	123,
	211,
	131,
	219,
	208,
	128,
	215,
	204,
	124,
	212,
	201,
	122,
	210,
	130,
	217,
	206,
	126,
	214,
	202,
	123,
	211,
	201,
	219,
	208,
	128,
	215,
	204,
	124,
	212,
	202,
	121,
	209,
	129,
	217,
	205,
	126,
	214,
	203,
	123,
	211,
	131,
	219,
	207,
	127,
	215,
	205,
	124,
	212,
	202,
	122,
	209,
	129,
	217,
	206,
	126,
	214,
	203,
	124,
	210,
	130,
	218,
	207,
	127,
	215,
	205,
	125,
	212,
	201,
	121,
	209,
	129
];
//#endregion
//#region src/core/lunar-utils.ts
/** 取得春节（正月初一）在该年哪天 */
const getLunarNewYearDay = (year) => {
	const lnyd = LUNAR_NEW_YEAR_DATE[year - FIRST_YEAR];
	if (lnyd === void 0) throw new Error("Invalid lunar year: out of range");
	return parseDate(`${year}/${Math.floor(lnyd / 100)}/${lnyd % 100}`);
};
/** 取出当年闰月 [闰月月份, 是否大月] */
const getYearLeapMonth = (year) => {
	const monthData = LUNAR_MONTH_DATAS[year - FIRST_YEAR];
	return [monthData >> 13, (monthData >> 12 & 1) === 1];
};
/** 规范化农历入参（支持中文年月日时辰） */
const prettyLunarData = (lunarData, lang) => {
	const locale = _GlobalConfig.locales[lang ?? _GlobalConfig.lang] ?? _GlobalConfig.locales[_GlobalConfig.lang];
	if (typeof lunarData.year === "string") {
		let yearString = "";
		for (let i = 0; i < lunarData.year.length; i++) {
			let n = -1;
			if (lunarData.year[i] === "零" || lunarData.year[i] === "〇") n = 0;
			else n = locale.numerals.indexOf(lunarData.year[i]);
			yearString += n >= 0 ? n : "";
		}
		lunarData.year = Number(yearString);
	}
	if (typeof lunarData.month === "string") {
		let month = lunarData.month;
		if (month.startsWith(locale.leap)) {
			lunarData.isLeapMonth = true;
			month = lunarData.month.slice(locale.leap.length);
		}
		let newMonth = locale.lunarMonths.indexOf(month);
		if (newMonth === -1) newMonth = locale.lunarMonthsAlias.indexOf(month);
		lunarData.month = lunarData.isLeapMonth ? newMonth + 100 + 1 : newMonth + 1;
	}
	if (typeof lunarData.day === "string") lunarData.day = locale.lunarDays.indexOf(lunarData.day) + 1;
	if (typeof lunarData.hour === "string") lunarData.hour = locale.branches.indexOf(lunarData.hour);
};
/** 从农历数据反查公历日期 */
const parseFromLunar = (lunarData, lang) => {
	prettyLunarData(lunarData, lang);
	const today = /* @__PURE__ */ new Date();
	const year = lunarData.year ? Number(lunarData.year) : today.getFullYear();
	let month = Number(lunarData.month);
	const day = Number(lunarData.day);
	const hour = lunarData.hour ? Number(lunarData.hour) : 0;
	let isLeapMonth = lunarData.isLeapMonth ?? false;
	if (month > 100) {
		month -= 100;
		isLeapMonth = true;
	}
	if (!Number.isInteger(hour) || hour < 0 || hour > 11) throw new Error("Invalid lunar hour: expect 0-11");
	if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("Invalid lunar month");
	if (!Number.isInteger(day) || day < 1 || day > 30) throw new Error("Invalid lunar day");
	if (year === 1900) {
		if (isLeapMonth) throw new Error("Invalid lunar leap month: no this leap month");
		if (month === 11 && day >= 11 && day <= 29) return new Date(FIRST_YEAR, 0, 1 + (day - 11), hour * 2);
		if (month === 12) return new Date(FIRST_YEAR, 0, 20 + (day - 1), hour * 2);
		throw new Error("Invalid lunar date: out of range");
	}
	if (year < 1901 || year > 2100) throw new Error("Invalid lunar year: out of range");
	const nyd = getLunarNewYearDay(year);
	const [leapMonth, leapMonthIsBig] = getYearLeapMonth(year);
	if (isLeapMonth && leapMonth !== month) throw new Error("Invalid lunar leap month: no this leap month");
	const monthData = LUNAR_MONTH_DATAS[year - FIRST_YEAR];
	const monthIsBig = isLeapMonth ? leapMonthIsBig : monthData >> month - 1 & 1;
	if (day > (monthIsBig ? 30 : 29)) throw new Error("Invalid lunar day: exceeds month length");
	let daySum = 0;
	for (let i = 0; i < month; i++) {
		const isBig = monthData >> i & 1;
		daySum += isBig ? 30 : 29;
		if (i === month - 1 && !isLeapMonth) break;
		if (i === leapMonth - 1) daySum += leapMonthIsBig ? 30 : 29;
	}
	daySum -= (monthIsBig ? 30 : 29) - day + 1;
	return new Date(nyd.getFullYear(), nyd.getMonth(), nyd.getDate() + daySum, hour * 2);
};
/** 取得月相 */
function phaseOfTheMoon(lunar, locale) {
	const lunarDay = lunar.day;
	if (lunarDay === 1) return locale.moonPhase.朔;
	if ([
		7,
		8,
		22,
		23
	].includes(lunarDay)) return locale.moonPhase.弦;
	if (lunarDay === 15) return locale.moonPhase.望;
	if (lunar.isLastDayOfMonth) return locale.moonPhase.晦;
	return "";
}
/** 取得精细月相名（逐日三十值，如"既望""蛾眉"；粗粒度四值见 phaseOfTheMoon） */
function moonPhaseName(lunarDay, locale) {
	return locale.moonPhaseDetail[lunarDay - 1];
}
//#endregion
//#region src/core/data/calendar-data.ts
/**
--- 地支藏干表 ---
寅藏戊土及丙甲，卯中同居甲和乙，辰藏乙木癸水戊，
巳宫戊土同庚丙。午中丙火并己丁，未宫再居丁乙己，
申中戊土壬庚逢，酉宫同见庚辛隆。戍藏辛金和丁戊，
亥宫戊甲壬同户，子宫壬癸在其中，丑中癸辛己土同。
*/
const HIDDEN_STEMS = [
	[9],
	[
		5,
		9,
		7
	],
	[
		0,
		2,
		4
	],
	[1],
	[
		4,
		1,
		9
	],
	[
		2,
		6,
		4
	],
	[3, 5],
	[
		5,
		3,
		1
	],
	[
		6,
		8,
		4
	],
	[7],
	[
		4,
		7,
		3
	],
	[8, 0]
];
const MONTH_PILLAR_EPOCH = [
	2018,
	12,
	7
];
const DAY_PILLAR_EPOCH = [
	2022,
	3,
	12
];
//#endregion
//#region src/core/stem-branch-math.ts
/**
* 天干納甲，通过天干取得八卦索引
* 乾纳甲壬，坤纳乙癸，震纳庚，巽纳辛，坎纳戊，离纳己，艮纳丙，兑纳丁
*/
const getTrigramValueByStem = (stemValue) => {
	return [
		7,
		0,
		4,
		3,
		2,
		5,
		1,
		5,
		7,
		0
	][stemValue];
};
/**
* 通过节气取得月的天干地支组合索引 [0, 59]
* @param date 当前日期
* @param termValue 节气索引值
* @param termDate 节气精确时刻（分钟级；若仅有日期精度会导致节气当日整日误判为已换月）
*/
const computeMonthValueByTerm = (date, termValue, termDate, isUTC = false) => {
	const month = getDateData(date, "Month", isUTC);
	const termMonth = termValue / 2 >> 0;
	const dateInstant = Date.UTC(getDateData(date, "FullYear", isUTC), month, getDateData(date, "Date", isUTC), getDateData(date, "Hours", isUTC), getDateData(date, "Minutes", isUTC), getDateData(date, "Seconds", isUTC));
	const termInstant = Date.UTC(termDate.getFullYear(), termDate.getMonth(), termDate.getDate(), termDate.getHours(), termDate.getMinutes(), termDate.getSeconds());
	const monthOffset = termMonth < month || month === 0 && termMonth === 11 || dateInstant < termInstant ? -1 : 0;
	return (((getDateData(date, "FullYear", isUTC) - MONTH_PILLAR_EPOCH[0]) * 12 + getDateData(date, "Month", isUTC) - MONTH_PILLAR_EPOCH[1] + 1) % 60 + monthOffset + 60) % 60;
};
/** 通过天干和地支索引值，计算六十甲子组合索引 */
const computeStemBranchValue = (stemValue, branchValue) => {
	if ((stemValue + branchValue) % 2 !== 0) throw new Error("Invalid StemBranch value");
	return stemValue % 10 + (6 - (branchValue >> 1) + (stemValue >> 1)) % 6 * 10;
};
/**
* 五鼠遁计算天干
* 甲己还加甲，乙庚丙作初。丙辛从戊起，丁壬庚子居。戊癸起壬子，周而复始求。
* @param fromStemValue 起始天干（计算时柱天干则此处应为日柱天干）
* @param branchValue 目标地支
*/
function computeRatStem(fromStemValue, branchValue = 0) {
	return (fromStemValue % 5 * 2 + branchValue) % 10;
}
/** 计算地支的三会五行 */
const computeMeetingElementValue = (branchValue) => {
	return [
		0,
		1,
		3,
		4
	][Math.floor((branchValue - 2 + 12) % 12 / 3)];
};
/**
* 计算地支的三合五行
* 按 branchValue % 4 分四组: 申子辰合水、巳酉丑合金、寅午戌合火、亥卯未合木
*/
const computeTriadElementValue = (branchValue) => {
	return [
		4,
		3,
		1,
		0
	][branchValue % 4];
};
/** 计算地支的六合五行 */
const computeGroup6ElementValue = (branchValue) => {
	const e5v = [
		2,
		0,
		1,
		3,
		4,
		2
	];
	branchValue = branchValue === 0 ? 12 : branchValue;
	if (branchValue < 7) return e5v[branchValue - 1];
	return e5v[12 - branchValue];
};
//#endregion
//#region src/core/locale-utils.ts
/** 取得译文（点分路径） */
function getTranslation(locale, key) {
	const keySplit = key.split(".");
	let curr = locale;
	let res = key;
	const resAsCurr = (c) => {
		if (typeof c === "string" || typeof c === "number" || typeof c === "function") {
			res = c;
			return true;
		}
		return false;
	};
	for (;;) {
		if (resAsCurr(curr)) break;
		if (keySplit.length === 0) break;
		const currKey = keySplit.shift();
		if (Array.isArray(curr)) {
			const idx = Number(currKey);
			if (isNaN(idx) || idx >= curr.length) return "";
			curr = curr[idx];
			res = curr;
		} else if (Object.prototype.hasOwnProperty.call(curr, currKey)) curr = curr[currKey];
		else return keySplit[keySplit.length - 1] || currKey;
	}
	return res;
}
const classTypeDict = {
	stem: [10, "stems"],
	branch: [12, "branches"],
	trigram: [8, "eightTrigram"],
	fiveElement: [5, "fiveElements"]
};
/** 处理天干、地支、八卦、五行等构造入参 */
const parseCommonCreateClassValue = (value, type, lang, gConfig) => {
	if (typeof value === "number") value = value % classTypeDict[type][0];
	else {
		const idx = gConfig.locales[lang][classTypeDict[type][1]].indexOf(value);
		if (idx === -1) throw new Error(`Invalid ${type} value`);
		value = idx;
	}
	return value;
};
/** 把两个列表分别作为 key 与 value 合并成字典 */
function twoList2Dict(keyList, valueList) {
	const res = {};
	for (let i = 0; i < keyList.length; i++) res[keyList[i]] = valueList[i];
	return res;
}
/** 定义语言包（原样返回，仅提供类型收窄） */
const defineLocale = (localeData) => localeData;
//#endregion
//#region src/core/date-diff.ts
/** 计算两日期的时间差 */
function dateDiff(date1, date2, unit, float) {
	const d1 = parseDate(date1);
	const d2 = parseDate(date2);
	const diffValue = d2.valueOf() - d1.valueOf();
	const u = unit ? prettyUnit(unit) : "millisecond";
	let res = diffValue;
	if (UNITS.s === u) res = diffValue / 1e3;
	else if (UNITS.m === u) res = diffValue / (1e3 * 60);
	else if (UNITS.h === u) res = diffValue / (1e3 * 60 * 60);
	else if (UNITS.d === u) res = diffValue / (1e3 * 60 * 60 * 24);
	else if (UNITS.w === u) res = diffValue / (1e3 * 60 * 60 * 24 * 7);
	else if (UNITS.M === u) res = monthDiff(d1, d2);
	else if (UNITS.y === u) res = monthDiff(d1, d2) / 12;
	else if (UNITS.q === u) res = monthDiff(d1, d2) / 3;
	return float ? res : parseInt(String(res)) + 0;
}
/** 月差 */
const monthDiff = (date1, date2) => {
	const d1 = parseDate(date1);
	const d2 = parseDate(date2);
	const yearDiff = d2.getFullYear() - d1.getFullYear();
	const mDiff = d2.getMonth() - d1.getMonth();
	const diffValue = yearDiff * 12 + mDiff;
	const anchor = new Date(d1).setMonth(d1.getMonth() + diffValue);
	const c = anchor.valueOf() > d2.valueOf();
	const anchor2 = new Date(d1).setMonth(d1.getMonth() + diffValue + (c ? -1 : 1));
	return diffValue + (d2.valueOf() - anchor.valueOf()) / (c ? anchor - anchor2 : anchor2 - anchor) || 0;
};
/** 计算农历的时间差 */
const lunarDateDiff = (from, to, unit, float) => {
	const [lunar1, lunar2] = [from.lunar, to.lunar];
	const [year1, year2] = [lunar1.year, lunar2.year];
	let diff = to.valueOf() - from.valueOf();
	const u = prettyUnit(unit);
	if (u === UNITS.ly) {
		const yDiff = year2 - year1;
		return float ? yDiff - 1 + getYearDecimals(from, true) + getYearDecimals(to, false) : yDiff;
	} else if (u === UNITS.lM) return lunarMonthDiff(from, to, float);
	else if (u === UNITS.ld) diff = diff / (1e3 * 60 * 60 * 24);
	else diff = diff / (1e3 * 60 * 60 * 2);
	return float ? diff : Math.ceil(diff) + 0;
};
/** 计算农历的月差 */
const lunarMonthDiff = (from, to, float) => {
	if (from.valueOf() > to.valueOf()) return -lunarMonthDiff(to, from);
	const [lunar1, lunar2] = [from.lunar, to.lunar];
	const [year1, year2] = [lunar1.year, lunar2.year];
	const [month1, month2] = [lunar1.month, lunar2.month];
	let currYear = year1;
	let cnt = 0;
	while (currYear <= year2) {
		let [start, end] = [1, 12];
		if (currYear === year1) start = month1;
		if (currYear === year2) end = month2;
		cnt += countLunarMonthInYear(currYear, start, end);
		currYear++;
	}
	if (!float) return cnt - 1;
	cnt += getMonthDecimals(from, true) + getMonthDecimals(to, false) - 2;
	return cnt;
};
/** 计算该年从 start 月至 end 月共多少个月（含闰月，闰月以月+100 表示） */
const countLunarMonthInYear = (year, start, end) => {
	const leapMonth = LUNAR_MONTH_DATAS[year - FIRST_YEAR] >> 13;
	const pos = (m) => {
		const isLeap = m > 100;
		if (isLeap) m -= 100;
		return m + (leapMonth > 0 && (m > leapMonth || isLeap && m === leapMonth) ? 1 : 0);
	};
	return pos(end || 12) - pos(start || 1) + 1;
};
/** 农历月差的小数部分 */
const getMonthDecimals = (lunaris, isAfterPath = false) => {
	const monthDayLen = lunaris.lunar.isBigMonth ? 30 : 29;
	const day = lunaris.lunar.day;
	return isAfterPath ? 1 - day / monthDayLen : day / monthDayLen;
};
/** 农历年差的小数部分 */
const getYearDecimals = (lunaris, isAfterPath = false) => {
	const leapMonth = lunaris.lunar.leapMonth;
	const yearMonthLen = leapMonth > 0 ? 13 : 12;
	let isLeapMonth = false;
	let month = lunaris.lunar.month;
	if (month > 100) {
		month -= 100;
		isLeapMonth = true;
	}
	if (leapMonth > 0 && (month > leapMonth || month === leapMonth && isLeapMonth)) month++;
	const md = getMonthDecimals(lunaris, isAfterPath);
	return isAfterPath ? 1 - (month - md) / yearMonthLen : (month + md - 1) / yearMonthLen;
};
//#endregion
//#region src/core/date-add.ts
/** 日期加法 */
function dateAdd(date, value, unit) {
	const d = parseDate(date);
	const year = d.getFullYear();
	const month = d.getMonth() + 1;
	const u = unit ? prettyUnit(unit) : "millisecond";
	let diff = value;
	if (u === UNITS.d || u === UNITS.ld) diff = value * 24 * 60 * 60 * 1e3;
	else if (u === UNITS.w) diff = value * 7 * 24 * 60 * 60 * 1e3;
	else if (u === UNITS.h) diff = value * 60 * 60 * 1e3;
	else if (u === UNITS.m) diff = value * 60 * 1e3;
	else if (u === UNITS.s) diff = value * 1e3;
	else if (u === UNITS.M) return new Date(d.setMonth(month - 1 + value));
	else if (u === UNITS.y) return new Date(d.setFullYear(year + value));
	return new Date(d.valueOf() + diff);
}
//#endregion
//#region src/core/format.ts
/** 格式化日期字符串（令牌见文档） */
const format = (formatStr, lunaris) => {
	if (lunaris.toUTCString() === "Invalid Date") return INVALID_DATE_STRING;
	const str = formatStr || "YYYY-MM-DDTHH:mm:ssZ";
	const y = lunaris.year;
	const M = lunaris.month;
	const D = lunaris.day;
	const w = lunaris.dayOfWeek;
	const H = lunaris.hour;
	const m = lunaris.minute;
	const s = lunaris.second;
	const zoneStr = padZoneStr(lunaris);
	const getLunar = () => lunaris.lunar;
	const getFourPillars = () => lunaris.fourPillars;
	const locale = _GlobalConfig.locales[lunaris._config.lang];
	const { weekdays, months, meridiem } = locale;
	const getShort = (arr, index, full, length) => arr && arr[index] || (full ? full[index].slice(0, length) : "");
	const h = H % 12 || 12;
	const meridiemFunc = meridiem || ((hour, _minute, isLowercase) => {
		const mer = hour < 12 ? "AM" : "PM";
		return isLowercase ? mer.toLowerCase() : mer;
	});
	const matches = {
		YY: String(y).slice(-2),
		YYYY: String(y),
		M: String(M),
		MM: String(M).padStart(2, "0"),
		MMM: getShort(locale.monthsShort, M - 1, months, 3),
		MMMM: getShort(months, M - 1),
		D: String(D),
		DD: String(D).padStart(2, "0"),
		d: String(w),
		dd: getShort(locale.weekdaysMin, w, weekdays, 2),
		ddd: getShort(locale.weekdaysShort, w, weekdays, 3),
		dddd: weekdays[w],
		H: String(H),
		HH: String(H).padStart(2, "0"),
		h: String(h),
		hh: String(h).padStart(2, "0"),
		a: meridiemFunc(H, m, true),
		A: meridiemFunc(H, m, false),
		m: String(m),
		mm: String(m).padStart(2, "0"),
		s: String(s),
		ss: String(s).padStart(2, "0"),
		SSS: String(lunaris.millis).padStart(3, "0"),
		Z: zoneStr,
		cZ: () => locale.chineseZodiac[getFourPillars().year.branch.value],
		t: lunaris.solarTerm ? String(lunaris.solarTerm.value + 1) : "",
		T: lunaris.solarTerm ? lunaris.solarTerm.toString() : "",
		lY: () => getLunar().getYearName(),
		lM: () => getLunar().getMonthName(),
		lD: () => getLunar().getDayName(),
		lH: () => getLunar().getHourName(),
		lL: () => getLunar().isBigMonth ? locale.bigMonth : locale.smallMonth,
		lYn: () => String(getLunar().year),
		lMn: () => String(getLunar().month),
		lDn: () => String(getLunar().day),
		lHn: () => String(getLunar().hour + 1),
		cY: () => getFourPillars().year.toString(),
		cYs: () => getFourPillars().year.stem.toString(),
		cYb: () => getFourPillars().year.branch.toString(),
		cM: () => getFourPillars().month.toString(),
		cMs: () => getFourPillars().month.stem.toString(),
		cMb: () => getFourPillars().month.branch.toString(),
		cD: () => getFourPillars().day.toString(),
		cDs: () => getFourPillars().day.stem.toString(),
		cDb: () => getFourPillars().day.branch.toString(),
		cH: () => getFourPillars().hour.toString(),
		cHs: () => getFourPillars().hour.stem.toString(),
		cHb: () => getFourPillars().hour.branch.toString(),
		cYn: () => getFourPillars().year.value,
		cYsn: () => getFourPillars().year.stem.value,
		cYbn: () => getFourPillars().year.branch.value,
		cMn: () => getFourPillars().month.value,
		cMsn: () => getFourPillars().month.stem.value,
		cMbn: () => getFourPillars().month.branch.value,
		cDn: () => getFourPillars().day.value,
		cDsn: () => getFourPillars().day.stem.value,
		cDbn: () => getFourPillars().day.branch.value,
		cHn: () => getFourPillars().hour.value,
		cHsn: () => getFourPillars().hour.stem.value,
		cHbn: () => getFourPillars().hour.branch.value,
		dR: () => {
			return String(Math.ceil(D / 7));
		},
		dRr: () => {
			const nextMonth1 = new lunaris.constructor(`${y}-${M + 1}-1 ${H}:${m}:${s}`, lunaris._config);
			const diff = Math.abs(nextMonth1.diff(lunaris, "day"));
			return String(Math.ceil(diff / 7));
		}
	};
	return str.replace(REGEX_FORMAT, (match, $1) => {
		if ($1) return $1;
		if (match === "ZZ") return zoneStr.replace(":", "");
		const target = matches[match];
		return typeof target === "function" ? String(target()) : target;
	});
};
//#endregion
//#region src/core/lunar.ts
/**
* @param year 春节所在的公历年
* @param dateDiff 当日与当年春节相差天数
* @returns [月, 日]（闰月以月+100 表示）
*/
function getLunarMonthDate(year, dateDiff, yearLeapMonth) {
	const monthData = LUNAR_MONTH_DATAS[year - FIRST_YEAR];
	const [leapMonth, leapMonthIsBig] = yearLeapMonth;
	let month = 1;
	dateDiff += 1;
	let isLeap = false;
	while (dateDiff > 29) {
		const mLength = monthData >> month - 1 & 1 ? 30 : 29;
		dateDiff = dateDiff - mLength;
		if (month === leapMonth && dateDiff > 0) {
			const leapMonthDateLong = leapMonthIsBig ? 30 : 29;
			if (dateDiff > leapMonthDateLong) dateDiff = dateDiff - leapMonthDateLong;
			else {
				isLeap = true;
				break;
			}
		}
		month++;
	}
	if (isLeap) month += 100;
	if (dateDiff === 0) {
		dateDiff = 30;
		month--;
	}
	return [month, dateDiff];
}
/** 两日相差天数 */
function getDateDiff(date1, date2) {
	return Math.round((date2.valueOf() - date1.valueOf()) / 864e5);
}
var Lunar = class Lunar {
	_date;
	year;
	month;
	day;
	hour;
	leapMonth;
	leapMonthIsBig;
	_config = {
		lang: _GlobalConfig.lang,
		isUTC: false
	};
	static fromLunar(param, config) {
		const date = parseFromLunar(param, config?.lang);
		return new Lunar(date, config);
	}
	constructor(dateObj, config) {
		if (config) this._config = Object.assign({}, this._config, config);
		const _date = parseDate(dateObj);
		this._date = _date;
		const isUTC = this._config.isUTC;
		const hours = getDateData(_date, "Hours", isUTC);
		const date = getDateOfStartOf23H(_date, isUTC);
		let year = getDateData(date, "FullYear", isUTC);
		const month = getDateData(date, "Month", isUTC);
		const d = getDateData(date, "Date", isUTC);
		if (year < 1901 || year > 2101) throw new Error("Invalid lunar year: out of range");
		if (year === 1901 && (month < 1 || month === 1 && d < 19)) {
			this.year = year - 1;
			if (month === 1 || month < 1 && d >= 20) {
				this.month = 12;
				this.day = month === 1 ? 13 + d - 1 : d - 20 + 1;
			} else {
				this.month = 11;
				this.day = 11 + d - 1;
			}
			this.leapMonth = 8;
			this.leapMonthIsBig = false;
		} else {
			let dateDiff = getDateDiff(getLunarNewYearDay(year), date);
			if (dateDiff < 0) {
				year = year - 1;
				dateDiff = getDateDiff(getLunarNewYearDay(year), date);
			}
			if (year > 2100) throw new Error("Invalid lunar year: out of range");
			this.year = year;
			const [leapMonth, leapMonthIsBig] = getYearLeapMonth(year);
			this.leapMonth = leapMonth;
			this.leapMonthIsBig = leapMonthIsBig;
			[this.month, this.day] = getLunarMonthDate(year, dateDiff, [leapMonth, leapMonthIsBig]);
		}
		this.hour = (hours + 1) % 24 >> 1;
	}
	get isLeapMonth() {
		return this.month > 100;
	}
	get isBigMonth() {
		if (this.year === 1900 && this.month === 11) return false;
		if (this.year === 1900 && this.month === 12) return true;
		const monthData = LUNAR_MONTH_DATAS[this.year - FIRST_YEAR];
		if (this.isLeapMonth) return (monthData >> 12 & 1) === 1;
		else return (monthData >> this.month - 1 & 1) === 1;
	}
	get isLastDayOfMonth() {
		if (this.isBigMonth && this.day === 30) return true;
		if (!this.isBigMonth && this.day === 29) return true;
		return false;
	}
	/** 当年正月初一的日期 */
	get lunarNewYearDay() {
		return getLunarNewYearDay(this.year);
	}
	/** 取得本农历年的最后一天 */
	get lastDayOfYear() {
		const nextNewYearDay = getLunarNewYearDay(this.year + 1);
		return new Date(nextNewYearDay.getFullYear(), nextNewYearDay.getMonth(), nextNewYearDay.getDate() - 1);
	}
	/** 取得月相 */
	get phaseOfTheMoon() {
		return phaseOfTheMoon(this, _GlobalConfig.locales[this._config.lang]);
	}
	/** 取得精细月相名（逐日三十值，如"既望""蛾眉"；粗粒度四值见 phaseOfTheMoon） */
	get moonPhaseName() {
		return moonPhaseName(this.day, _GlobalConfig.locales[this._config.lang]);
	}
	toDate() {
		return new Date(this._date.valueOf());
	}
	getYearName() {
		let res = "";
		let year = this.year;
		const numerals = _GlobalConfig.locales[this._config.lang].numerals;
		while (year) {
			res = numerals[year % 10] + res;
			year = Math.floor(year / 10);
		}
		return res;
	}
	getMonthName() {
		const lunarMonthNames = _GlobalConfig.locales[this._config.lang].lunarMonths;
		const leapStr = _GlobalConfig.locales[this._config.lang].leap;
		return (this.isLeapMonth ? leapStr : "") + lunarMonthNames[this.month % 100 - 1];
	}
	getDayName() {
		return _GlobalConfig.locales[this._config.lang].lunarDays[this.day - 1];
	}
	getHourName() {
		return _GlobalConfig.locales[this._config.lang].branches[this.hour];
	}
	toString() {
		const locale = _GlobalConfig.locales[this._config.lang];
		return `${this.getYearName()}${locale.lunarYearUnit}${this.getMonthName()}${this.getDayName()}${this.getHourName()}${locale.lunarHourUnit}`;
	}
	valueOf() {
		return this._date.valueOf();
	}
	static getLunarNewYearDay(year) {
		return getLunarNewYearDay(year);
	}
};
//#endregion
//#region src/core/solar-term/astro.ts
/**
* 寿星天文历定气算法（移植自 lunar-typescript ShouXingUtil，仅保留节气相关部分）
* 原算法作者: 许剑伟 (寿星万年历)
*
* 所有时间量以"天"为单位、以 J2000.0 (JD 2451545.0) 为原点。
* termAccurate2 的返回值已含 +8h(1/3 天) 偏移，即北京时间。
*/
/** J2000.0 儒略日 */
const J2000 = 2451545;
const ONE_THIRD = 1 / 3;
const SECOND_PER_DAY = 86400;
const SECOND_PER_RAD = 648e3 / Math.PI;
const NUT_B = [
	2.1824,
	-33.75705,
	36e-6,
	-1720,
	920,
	3.5069,
	1256.66393,
	11e-6,
	-132,
	57,
	1.3375,
	16799.4182,
	-51e-6,
	-23,
	10,
	4.3649,
	-67.5141,
	72e-6,
	21,
	-9,
	.04,
	-628.302,
	0,
	-14,
	0,
	2.36,
	8328.691,
	0,
	7,
	0,
	3.46,
	1884.966,
	0,
	-5,
	2,
	5.44,
	16833.175,
	0,
	-4,
	2,
	3.69,
	25128.11,
	0,
	-3,
	0,
	3.55,
	628.362,
	0,
	2,
	0
];
const DT_AT = [
	-4e3,
	108371.7,
	-13036.8,
	392,
	0,
	-500,
	17201,
	-627.82,
	16.17,
	-.3413,
	-150,
	12200.6,
	-346.41,
	5.403,
	-.1593,
	150,
	9113.8,
	-328.13,
	-1.647,
	.0377,
	500,
	5707.5,
	-391.41,
	.915,
	.3145,
	900,
	2203.4,
	-283.45,
	13.034,
	-.1778,
	1300,
	490.1,
	-57.35,
	2.085,
	-.0072,
	1600,
	120,
	-9.81,
	-1.532,
	.1403,
	1700,
	10.2,
	-.91,
	.51,
	-.037,
	1800,
	13.4,
	-.72,
	.202,
	-.0193,
	1830,
	7.8,
	-1.81,
	.416,
	-.0247,
	1860,
	8.3,
	-.13,
	-.406,
	.0292,
	1880,
	-5.4,
	.32,
	-.183,
	.0173,
	1900,
	-2.3,
	2.06,
	.169,
	-.0135,
	1920,
	21.2,
	1.69,
	-.304,
	.0167,
	1940,
	24.2,
	1.22,
	-.064,
	.0031,
	1960,
	33.2,
	.51,
	.231,
	-.0109,
	1980,
	51,
	1.29,
	-.026,
	.0032,
	2e3,
	63.87,
	.1,
	0,
	0,
	2005,
	64.7,
	.21,
	0,
	0,
	2012,
	66.8,
	.22,
	0,
	0,
	2016,
	68.1024,
	.5456,
	-.0542,
	-.001172,
	2020,
	69.3612,
	.0422,
	-.0502,
	.006216,
	2024,
	69.1752,
	-.0335,
	-.0048,
	811e-6,
	2028,
	69.0206,
	-.0275,
	.0055,
	-14e-6,
	2032,
	68.9981,
	.0163,
	.0054,
	6e-6,
	2036,
	69.1498,
	.0599,
	.0053,
	26e-6,
	2040,
	69.4751,
	.1035,
	.0051,
	46e-6,
	2044,
	69.9737,
	.1469,
	.005,
	66e-6,
	2048,
	70.6451,
	.1903,
	.0049,
	85e-6,
	2050,
	71.0457
];
const XL0 = [
	1e10,
	20,
	578,
	920,
	1100,
	1124,
	1136,
	1148,
	1217,
	1226,
	1229,
	1229,
	1229,
	1229,
	1937,
	2363,
	2618,
	2633,
	2660,
	2666,
	17534704567,
	0,
	0,
	334165646,
	4.669256804,
	6283.075849991,
	3489428,
	4.6261024,
	12566.1517,
	349706,
	2.744118,
	5753.384885,
	341757,
	2.828866,
	3.523118,
	313590,
	3.62767,
	77713.771468,
	267622,
	4.418084,
	7860.419392,
	234269,
	6.135162,
	3930.209696,
	132429,
	.742464,
	11506.76977,
	127317,
	2.037097,
	529.690965,
	119917,
	1.109629,
	1577.343542,
	99025,
	5.23268,
	5884.92685,
	90186,
	2.04505,
	26.29832,
	85722,
	3.50849,
	398.149,
	77979,
	1.17883,
	5223.69392,
	75314,
	2.53339,
	5507.55324,
	50526,
	4.58293,
	18849.22755,
	49238,
	4.20507,
	775.52261,
	35666,
	2.91954,
	.06731,
	31709,
	5.84902,
	11790.62909,
	28413,
	1.89869,
	796.29801,
	27104,
	.31489,
	10977.0788,
	24281,
	.34481,
	5486.77784,
	20616,
	4.80647,
	2544.31442,
	20539,
	1.86948,
	5573.1428,
	20226,
	2.45768,
	6069.77675,
	15552,
	.83306,
	213.2991,
	13221,
	3.41118,
	2942.46342,
	12618,
	1.08303,
	20.7754,
	11513,
	.64545,
	.98032,
	10285,
	.636,
	4694.00295,
	10190,
	.97569,
	15720.83878,
	10172,
	4.2668,
	7.11355,
	9921,
	6.2099,
	2146.1654,
	9761,
	.681,
	155.4204,
	8580,
	5.9832,
	161000.6857,
	8513,
	1.2987,
	6275.9623,
	8471,
	3.6708,
	71430.6956,
	7964,
	1.8079,
	17260.1547,
	7876,
	3.037,
	12036.4607,
	7465,
	1.7551,
	5088.6288,
	7387,
	3.5032,
	3154.6871,
	7355,
	4.6793,
	801.8209,
	6963,
	.833,
	9437.7629,
	6245,
	3.9776,
	8827.3903,
	6115,
	1.8184,
	7084.8968,
	5696,
	2.7843,
	6286.599,
	5612,
	4.3869,
	14143.4952,
	5558,
	3.4701,
	6279.5527,
	5199,
	.1891,
	12139.5535,
	5161,
	1.3328,
	1748.0164,
	5115,
	.2831,
	5856.4777,
	4900,
	.4874,
	1194.447,
	4104,
	5.3682,
	8429.2413,
	4094,
	2.3985,
	19651.0485,
	3920,
	6.1683,
	10447.3878,
	3677,
	6.0413,
	10213.2855,
	3660,
	2.5696,
	1059.3819,
	3595,
	1.7088,
	2352.8662,
	3557,
	1.776,
	6812.7668,
	3329,
	.5931,
	17789.8456,
	3041,
	.4429,
	83996.8473,
	3005,
	2.7398,
	1349.8674,
	2535,
	3.1647,
	4690.4798,
	2474,
	.2148,
	3.5904,
	2366,
	.4847,
	8031.0923,
	2357,
	2.0653,
	3340.6124,
	2282,
	5.222,
	4705.7323,
	2189,
	5.5559,
	553.5694,
	2142,
	1.4256,
	16730.4637,
	2109,
	4.1483,
	951.7184,
	2030,
	.3713,
	283.8593,
	1992,
	5.2221,
	12168.0027,
	1986,
	5.7747,
	6309.3742,
	1912,
	3.8222,
	23581.2582,
	1889,
	5.3863,
	149854.4001,
	1790,
	2.2149,
	13367.9726,
	1748,
	4.5605,
	135.0651,
	1622,
	5.9884,
	11769.8537,
	1508,
	4.1957,
	6256.7775,
	1442,
	4.1932,
	242.7286,
	1435,
	3.7236,
	38.0277,
	1397,
	4.4014,
	6681.2249,
	1362,
	1.8893,
	7632.9433,
	1250,
	1.1305,
	5.5229,
	1205,
	2.6223,
	955.5997,
	1200,
	1.0035,
	632.7837,
	1129,
	.1774,
	4164.312,
	1083,
	.3273,
	103.0928,
	1052,
	.9387,
	11926.2544,
	1050,
	5.3591,
	1592.596,
	1033,
	6.1998,
	6438.4962,
	1001,
	6.0291,
	5746.2713,
	980,
	.999,
	11371.705,
	980,
	5.244,
	27511.468,
	938,
	2.624,
	5760.498,
	923,
	.483,
	522.577,
	922,
	4.571,
	4292.331,
	905,
	5.337,
	6386.169,
	862,
	4.165,
	7058.598,
	841,
	3.299,
	7234.794,
	836,
	4.539,
	25132.303,
	813,
	6.112,
	4732.031,
	812,
	6.271,
	426.598,
	801,
	5.821,
	28.449,
	787,
	.996,
	5643.179,
	776,
	2.957,
	23013.54,
	769,
	3.121,
	7238.676,
	758,
	3.974,
	11499.656,
	735,
	4.386,
	316.392,
	731,
	.607,
	11513.883,
	719,
	3.998,
	74.782,
	706,
	.323,
	263.084,
	676,
	5.911,
	90955.552,
	663,
	3.665,
	17298.182,
	653,
	5.791,
	18073.705,
	630,
	4.717,
	6836.645,
	615,
	1.458,
	233141.314,
	612,
	1.075,
	19804.827,
	596,
	3.321,
	6283.009,
	596,
	2.876,
	6283.143,
	555,
	2.452,
	12352.853,
	541,
	5.392,
	419.485,
	531,
	.382,
	31441.678,
	519,
	4.065,
	6208.294,
	513,
	2.361,
	10973.556,
	494,
	5.737,
	9917.697,
	450,
	3.272,
	11015.106,
	449,
	3.653,
	206.186,
	447,
	2.064,
	7079.374,
	435,
	4.423,
	5216.58,
	421,
	1.906,
	245.832,
	413,
	.921,
	3738.761,
	402,
	.84,
	20.355,
	387,
	1.826,
	11856.219,
	379,
	2.344,
	3.881,
	374,
	2.954,
	3128.389,
	370,
	5.031,
	536.805,
	365,
	1.018,
	16200.773,
	365,
	1.083,
	88860.057,
	352,
	5.978,
	3894.182,
	352,
	2.056,
	244287.6,
	351,
	3.713,
	6290.189,
	340,
	1.106,
	14712.317,
	339,
	.978,
	8635.942,
	339,
	3.202,
	5120.601,
	333,
	.837,
	6496.375,
	325,
	3.479,
	6133.513,
	316,
	5.089,
	21228.392,
	316,
	1.328,
	10873.986,
	309,
	3.646,
	10.637,
	303,
	1.802,
	35371.887,
	296,
	3.397,
	9225.539,
	288,
	6.026,
	154717.61,
	281,
	2.585,
	14314.168,
	262,
	3.856,
	266.607,
	262,
	2.579,
	22483.849,
	257,
	1.561,
	23543.231,
	255,
	3.949,
	1990.745,
	251,
	3.744,
	10575.407,
	240,
	1.161,
	10984.192,
	238,
	.106,
	7.046,
	236,
	4.272,
	6040.347,
	234,
	3.577,
	10969.965,
	211,
	3.714,
	65147.62,
	210,
	.754,
	13521.751,
	207,
	4.228,
	5650.292,
	202,
	.814,
	170.673,
	201,
	4.629,
	6037.244,
	200,
	.381,
	6172.87,
	199,
	3.933,
	6206.81,
	199,
	5.197,
	6262.3,
	197,
	1.046,
	18209.33,
	195,
	1.07,
	5230.807,
	195,
	4.869,
	36.028,
	194,
	4.313,
	6244.943,
	192,
	1.229,
	709.933,
	192,
	5.595,
	6282.096,
	192,
	.602,
	6284.056,
	189,
	3.744,
	23.878,
	188,
	1.904,
	15.252,
	188,
	.867,
	22003.915,
	182,
	3.681,
	15110.466,
	181,
	.491,
	1.484,
	179,
	3.222,
	39302.097,
	179,
	1.259,
	12559.038,
	62833196674749,
	0,
	0,
	20605886,
	2.67823456,
	6283.07584999,
	430343,
	2.635127,
	12566.1517,
	42526,
	1.59047,
	3.52312,
	11926,
	5.79557,
	26.29832,
	10898,
	2.96618,
	1577.34354,
	9348,
	2.5921,
	18849.2275,
	7212,
	1.1385,
	529.691,
	6777,
	1.8747,
	398.149,
	6733,
	4.4092,
	5507.5532,
	5903,
	2.888,
	5223.6939,
	5598,
	2.1747,
	155.4204,
	4541,
	.398,
	796.298,
	3637,
	.4662,
	775.5226,
	2896,
	2.6471,
	7.1135,
	2084,
	5.3414,
	.9803,
	1910,
	1.8463,
	5486.7778,
	1851,
	4.9686,
	213.2991,
	1729,
	2.9912,
	6275.9623,
	1623,
	.0322,
	2544.3144,
	1583,
	1.4305,
	2146.1654,
	1462,
	1.2053,
	10977.0788,
	1246,
	2.8343,
	1748.0164,
	1188,
	3.258,
	5088.6288,
	1181,
	5.2738,
	1194.447,
	1151,
	2.075,
	4694.003,
	1064,
	.7661,
	553.5694,
	997,
	1.303,
	6286.599,
	972,
	4.239,
	1349.867,
	945,
	2.7,
	242.729,
	858,
	5.645,
	951.718,
	758,
	5.301,
	2352.866,
	639,
	2.65,
	9437.763,
	610,
	4.666,
	4690.48,
	583,
	1.766,
	1059.382,
	531,
	.909,
	3154.687,
	522,
	5.661,
	71430.696,
	520,
	1.854,
	801.821,
	504,
	1.425,
	6438.496,
	433,
	.241,
	6812.767,
	426,
	.774,
	10447.388,
	413,
	5.24,
	7084.897,
	374,
	2.001,
	8031.092,
	356,
	2.429,
	14143.495,
	350,
	4.8,
	6279.553,
	337,
	.888,
	12036.461,
	337,
	3.862,
	1592.596,
	325,
	3.4,
	7632.943,
	322,
	.616,
	8429.241,
	318,
	3.188,
	4705.732,
	297,
	6.07,
	4292.331,
	295,
	1.431,
	5746.271,
	290,
	2.325,
	20.355,
	275,
	.935,
	5760.498,
	270,
	4.804,
	7234.794,
	253,
	6.223,
	6836.645,
	228,
	5.003,
	17789.846,
	225,
	5.672,
	11499.656,
	215,
	5.202,
	11513.883,
	208,
	3.955,
	10213.286,
	208,
	2.268,
	522.577,
	206,
	2.224,
	5856.478,
	206,
	2.55,
	25132.303,
	203,
	.91,
	6256.778,
	189,
	.532,
	3340.612,
	188,
	4.735,
	83996.847,
	179,
	1.474,
	4164.312,
	178,
	3.025,
	5.523,
	177,
	3.026,
	5753.385,
	159,
	4.637,
	3.286,
	157,
	6.124,
	5216.58,
	155,
	3.077,
	6681.225,
	154,
	4.2,
	13367.973,
	143,
	1.191,
	3894.182,
	138,
	3.093,
	135.065,
	136,
	4.245,
	426.598,
	134,
	5.765,
	6040.347,
	128,
	3.085,
	5643.179,
	127,
	2.092,
	6290.189,
	125,
	3.077,
	11926.254,
	125,
	3.445,
	536.805,
	114,
	3.244,
	12168.003,
	112,
	2.318,
	16730.464,
	111,
	3.901,
	11506.77,
	111,
	5.32,
	23.878,
	105,
	3.75,
	7860.419,
	103,
	2.447,
	1990.745,
	96,
	.82,
	3.88,
	96,
	4.08,
	6127.66,
	91,
	5.42,
	206.19,
	91,
	.42,
	7079.37,
	88,
	5.17,
	11790.63,
	81,
	.34,
	9917.7,
	80,
	3.89,
	10973.56,
	78,
	2.4,
	1589.07,
	78,
	2.58,
	11371.7,
	77,
	3.98,
	955.6,
	77,
	3.36,
	36.03,
	76,
	1.3,
	103.09,
	75,
	5.18,
	10969.97,
	75,
	4.96,
	6496.37,
	73,
	5.21,
	38.03,
	72,
	2.65,
	6309.37,
	70,
	5.61,
	3738.76,
	69,
	2.6,
	3496.03,
	69,
	.39,
	15.25,
	69,
	2.78,
	20.78,
	65,
	1.13,
	7058.6,
	64,
	4.28,
	28.45,
	61,
	5.63,
	10984.19,
	60,
	.73,
	419.48,
	60,
	5.28,
	10575.41,
	58,
	5.55,
	17298.18,
	58,
	3.19,
	4732.03,
	5291887,
	0,
	0,
	871984,
	1.072097,
	6283.07585,
	30913,
	.86729,
	12566.1517,
	2734,
	.053,
	3.5231,
	1633,
	5.1883,
	26.2983,
	1575,
	3.6846,
	155.4204,
	954,
	.757,
	18849.228,
	894,
	2.057,
	77713.771,
	695,
	.827,
	775.523,
	506,
	4.663,
	1577.344,
	406,
	1.031,
	7.114,
	381,
	3.441,
	5573.143,
	346,
	5.141,
	796.298,
	317,
	6.053,
	5507.553,
	302,
	1.192,
	242.729,
	289,
	6.117,
	529.691,
	271,
	.306,
	398.149,
	254,
	2.28,
	553.569,
	237,
	4.381,
	5223.694,
	208,
	3.754,
	.98,
	168,
	.902,
	951.718,
	153,
	5.759,
	1349.867,
	145,
	4.364,
	1748.016,
	134,
	3.721,
	1194.447,
	125,
	2.948,
	6438.496,
	122,
	2.973,
	2146.165,
	110,
	1.271,
	161000.686,
	104,
	.604,
	3154.687,
	100,
	5.986,
	6286.599,
	92,
	4.8,
	5088.63,
	89,
	5.23,
	7084.9,
	83,
	3.31,
	213.3,
	76,
	3.42,
	5486.78,
	71,
	6.19,
	4690.48,
	68,
	3.43,
	4694,
	65,
	1.6,
	2544.31,
	64,
	1.98,
	801.82,
	61,
	2.48,
	10977.08,
	50,
	1.44,
	6836.65,
	49,
	2.34,
	1592.6,
	46,
	1.31,
	4292.33,
	46,
	3.81,
	149854.4,
	43,
	.04,
	7234.79,
	40,
	4.94,
	7632.94,
	39,
	1.57,
	71430.7,
	38,
	3.17,
	6309.37,
	35,
	.99,
	6040.35,
	35,
	.67,
	1059.38,
	31,
	3.18,
	2352.87,
	31,
	3.55,
	8031.09,
	30,
	1.92,
	10447.39,
	30,
	2.52,
	6127.66,
	28,
	4.42,
	9437.76,
	28,
	2.71,
	3894.18,
	27,
	.67,
	25132.3,
	26,
	5.27,
	6812.77,
	25,
	.55,
	6279.55,
	23,
	1.38,
	4705.73,
	22,
	.64,
	6256.78,
	20,
	6.07,
	640.88,
	28923,
	5.84384,
	6283.07585,
	3496,
	0,
	0,
	1682,
	5.4877,
	12566.1517,
	296,
	5.196,
	155.42,
	129,
	4.722,
	3.523,
	71,
	5.3,
	18849.23,
	64,
	5.97,
	242.73,
	40,
	3.79,
	553.57,
	11408,
	3.14159,
	0,
	772,
	4.134,
	6283.076,
	77,
	3.84,
	12566.15,
	42,
	.42,
	155.42,
	88,
	3.14,
	0,
	17,
	2.77,
	6283.08,
	5,
	2.01,
	155.42,
	3,
	2.21,
	12566.15,
	27962,
	3.1987,
	84334.66158,
	10164,
	5.42249,
	5507.55324,
	8045,
	3.8801,
	5223.6939,
	4381,
	3.7044,
	2352.8662,
	3193,
	4.0003,
	1577.3435,
	2272,
	3.9847,
	1047.7473,
	1814,
	4.9837,
	6283.0758,
	1639,
	3.5646,
	5856.4777,
	1444,
	3.7028,
	9437.7629,
	1430,
	3.4112,
	10213.2855,
	1125,
	4.8282,
	14143.4952,
	1090,
	2.0857,
	6812.7668,
	1037,
	4.0566,
	71092.8814,
	971,
	3.473,
	4694.003,
	915,
	1.142,
	6620.89,
	878,
	4.44,
	5753.385,
	837,
	4.993,
	7084.897,
	770,
	5.554,
	167621.576,
	719,
	3.602,
	529.691,
	692,
	4.326,
	6275.962,
	558,
	4.41,
	7860.419,
	529,
	2.484,
	4705.732,
	521,
	6.25,
	18073.705,
	903,
	3.897,
	5507.553,
	618,
	1.73,
	5223.694,
	380,
	5.244,
	2352.866,
	166,
	1.627,
	84334.662,
	10001398880,
	0,
	0,
	167069963,
	3.098463508,
	6283.075849991,
	1395602,
	3.0552461,
	12566.1517,
	308372,
	5.198467,
	77713.771468,
	162846,
	1.173877,
	5753.384885,
	157557,
	2.846852,
	7860.419392,
	92480,
	5.45292,
	11506.76977,
	54244,
	4.56409,
	3930.2097,
	47211,
	3.661,
	5884.92685,
	34598,
	.96369,
	5507.55324,
	32878,
	5.89984,
	5223.69392,
	30678,
	.29867,
	5573.1428,
	24319,
	4.2735,
	11790.62909,
	21183,
	5.84715,
	1577.34354,
	18575,
	5.02194,
	10977.0788,
	17484,
	3.01194,
	18849.22755,
	10984,
	5.05511,
	5486.77784,
	9832,
	.8868,
	6069.7768,
	8650,
	5.6896,
	15720.8388,
	8583,
	1.2708,
	161000.6857,
	6490,
	.2725,
	17260.1547,
	6292,
	.9218,
	529.691,
	5706,
	2.0137,
	83996.8473,
	5574,
	5.2416,
	71430.6956,
	4938,
	3.245,
	2544.3144,
	4696,
	2.5781,
	775.5226,
	4466,
	5.5372,
	9437.7629,
	4252,
	6.0111,
	6275.9623,
	3897,
	5.3607,
	4694.003,
	3825,
	2.3926,
	8827.3903,
	3749,
	.8295,
	19651.0485,
	3696,
	4.9011,
	12139.5535,
	3566,
	1.6747,
	12036.4607,
	3454,
	1.8427,
	2942.4634,
	3319,
	.2437,
	7084.8968,
	3192,
	.1837,
	5088.6288,
	3185,
	1.7778,
	398.149,
	2846,
	1.2134,
	6286.599,
	2779,
	1.8993,
	6279.5527,
	2628,
	4.589,
	10447.3878,
	2460,
	3.7866,
	8429.2413,
	2393,
	4.996,
	5856.4777,
	2359,
	.2687,
	796.298,
	2329,
	2.8078,
	14143.4952,
	2210,
	1.95,
	3154.6871,
	2035,
	4.6527,
	2146.1654,
	1951,
	5.3823,
	2352.8662,
	1883,
	.6731,
	149854.4001,
	1833,
	2.2535,
	23581.2582,
	1796,
	.1987,
	6812.7668,
	1731,
	6.152,
	16730.4637,
	1717,
	4.4332,
	10213.2855,
	1619,
	5.2316,
	17789.8456,
	1381,
	5.1896,
	8031.0923,
	1364,
	3.6852,
	4705.7323,
	1314,
	.6529,
	13367.9726,
	1041,
	4.3329,
	11769.8537,
	1017,
	1.5939,
	4690.4798,
	998,
	4.201,
	6309.374,
	966,
	3.676,
	27511.468,
	874,
	6.064,
	1748.016,
	779,
	3.674,
	12168.003,
	771,
	.312,
	7632.943,
	756,
	2.626,
	6256.778,
	746,
	5.648,
	11926.254,
	693,
	2.924,
	6681.225,
	680,
	1.423,
	23013.54,
	674,
	.563,
	3340.612,
	663,
	5.661,
	11371.705,
	659,
	3.136,
	801.821,
	648,
	2.65,
	19804.827,
	615,
	3.029,
	233141.314,
	612,
	5.134,
	1194.447,
	563,
	4.341,
	90955.552,
	552,
	2.091,
	17298.182,
	534,
	5.1,
	31441.678,
	531,
	2.407,
	11499.656,
	523,
	4.624,
	6438.496,
	513,
	5.324,
	11513.883,
	477,
	.256,
	11856.219,
	461,
	1.722,
	7234.794,
	458,
	3.766,
	6386.169,
	458,
	4.466,
	5746.271,
	423,
	1.055,
	5760.498,
	422,
	1.557,
	7238.676,
	415,
	2.599,
	7058.598,
	401,
	3.03,
	1059.382,
	397,
	1.201,
	1349.867,
	379,
	4.907,
	4164.312,
	360,
	5.707,
	5643.179,
	352,
	3.626,
	244287.6,
	348,
	.761,
	10973.556,
	342,
	3.001,
	4292.331,
	336,
	4.546,
	4732.031,
	334,
	3.138,
	6836.645,
	324,
	4.164,
	9917.697,
	316,
	1.691,
	11015.106,
	307,
	.238,
	35371.887,
	298,
	1.306,
	6283.143,
	298,
	1.75,
	6283.009,
	293,
	5.738,
	16200.773,
	286,
	5.928,
	14712.317,
	281,
	3.515,
	21228.392,
	280,
	5.663,
	8635.942,
	277,
	.513,
	26.298,
	268,
	4.207,
	18073.705,
	266,
	.9,
	12352.853,
	260,
	2.962,
	25132.303,
	255,
	2.477,
	6208.294,
	242,
	2.8,
	709.933,
	231,
	1.054,
	22483.849,
	229,
	1.07,
	14314.168,
	216,
	1.314,
	154717.61,
	215,
	6.038,
	10873.986,
	200,
	.561,
	7079.374,
	198,
	2.614,
	951.718,
	197,
	4.369,
	167283.762,
	186,
	2.861,
	5216.58,
	183,
	1.66,
	39302.097,
	183,
	5.912,
	3738.761,
	175,
	2.145,
	6290.189,
	173,
	2.168,
	10575.407,
	171,
	3.702,
	1592.596,
	171,
	1.343,
	3128.389,
	164,
	5.55,
	6496.375,
	164,
	5.856,
	10984.192,
	161,
	1.998,
	10969.965,
	161,
	1.909,
	6133.513,
	157,
	4.955,
	25158.602,
	154,
	6.216,
	23543.231,
	153,
	5.357,
	13521.751,
	150,
	5.77,
	18209.33,
	150,
	5.439,
	155.42,
	139,
	1.778,
	9225.539,
	139,
	1.626,
	5120.601,
	128,
	2.46,
	13916.019,
	123,
	.717,
	143571.324,
	122,
	2.654,
	88860.057,
	121,
	4.414,
	3894.182,
	121,
	1.192,
	3.523,
	120,
	4.03,
	553.569,
	119,
	1.513,
	17654.781,
	117,
	3.117,
	14945.316,
	113,
	2.698,
	6040.347,
	110,
	3.085,
	43232.307,
	109,
	.998,
	955.6,
	108,
	2.939,
	17256.632,
	107,
	5.285,
	65147.62,
	103,
	.139,
	11712.955,
	103,
	5.85,
	213.299,
	102,
	3.046,
	6037.244,
	101,
	2.842,
	8662.24,
	100,
	3.626,
	6262.3,
	98,
	2.36,
	6206.81,
	98,
	5.11,
	6172.87,
	98,
	2,
	15110.47,
	97,
	2.67,
	5650.29,
	97,
	2.75,
	6244.94,
	96,
	4.02,
	6282.1,
	96,
	5.31,
	6284.06,
	92,
	.1,
	29088.81,
	85,
	3.26,
	20426.57,
	84,
	2.6,
	28766.92,
	81,
	3.58,
	10177.26,
	80,
	5.81,
	5230.81,
	78,
	2.53,
	16496.36,
	77,
	4.06,
	6127.66,
	73,
	.04,
	5481.25,
	72,
	5.96,
	12559.04,
	72,
	5.92,
	4136.91,
	71,
	5.49,
	22003.91,
	70,
	3.41,
	7.11,
	69,
	.62,
	11403.68,
	69,
	3.9,
	1589.07,
	69,
	1.96,
	12416.59,
	69,
	4.51,
	426.6,
	67,
	1.61,
	11087.29,
	66,
	4.5,
	47162.52,
	66,
	5.08,
	283.86,
	66,
	4.32,
	16858.48,
	65,
	1.04,
	6062.66,
	64,
	1.59,
	18319.54,
	63,
	5.7,
	45892.73,
	63,
	4.6,
	66567.49,
	63,
	3.82,
	13517.87,
	62,
	2.62,
	11190.38,
	61,
	1.54,
	33019.02,
	60,
	5.58,
	10344.3,
	60,
	5.38,
	316428.23,
	60,
	5.78,
	632.78,
	59,
	6.12,
	9623.69,
	57,
	.16,
	17267.27,
	57,
	3.86,
	6076.89,
	57,
	1.98,
	7668.64,
	56,
	4.78,
	20199.09,
	55,
	4.56,
	18875.53,
	55,
	3.51,
	17253.04,
	54,
	3.07,
	226858.24,
	54,
	4.83,
	18422.63,
	53,
	5.02,
	12132.44,
	52,
	3.63,
	5333.9,
	52,
	.97,
	155427.54,
	51,
	3.36,
	20597.24,
	50,
	.99,
	11609.86,
	50,
	2.21,
	1990.75,
	48,
	1.62,
	12146.67,
	48,
	1.17,
	12569.67,
	47,
	4.62,
	5436.99,
	47,
	1.81,
	12562.63,
	47,
	.59,
	21954.16,
	47,
	.76,
	7342.46,
	46,
	.27,
	4590.91,
	46,
	3.77,
	156137.48,
	45,
	5.66,
	10454.5,
	44,
	5.84,
	3496.03,
	43,
	.24,
	17996.03,
	41,
	5.93,
	51092.73,
	41,
	4.21,
	12592.45,
	40,
	5.14,
	1551.05,
	40,
	5.28,
	15671.08,
	39,
	3.69,
	18052.93,
	39,
	4.94,
	24356.78,
	38,
	2.72,
	11933.37,
	38,
	5.23,
	7477.52,
	38,
	4.99,
	9779.11,
	37,
	3.7,
	9388.01,
	37,
	4.44,
	4535.06,
	36,
	2.16,
	28237.23,
	36,
	2.54,
	242.73,
	36,
	.22,
	5429.88,
	35,
	6.15,
	19800.95,
	35,
	2.92,
	36949.23,
	34,
	5.63,
	2379.16,
	34,
	5.73,
	16460.33,
	34,
	5.11,
	5849.36,
	33,
	6.19,
	6268.85,
	10301861,
	1.1074897,
	6283.07584999,
	172124,
	1.064423,
	12566.1517,
	70222,
	3.14159,
	0,
	3235,
	1.0217,
	18849.2275,
	3080,
	2.8435,
	5507.5532,
	2497,
	1.3191,
	5223.6939,
	1849,
	1.4243,
	1577.3435,
	1008,
	5.9138,
	10977.0788,
	865,
	1.42,
	6275.962,
	863,
	.271,
	5486.778,
	507,
	1.686,
	5088.629,
	499,
	6.014,
	6286.599,
	467,
	5.987,
	529.691,
	440,
	.518,
	4694.003,
	410,
	1.084,
	9437.763,
	387,
	4.75,
	2544.314,
	375,
	5.071,
	796.298,
	352,
	.023,
	83996.847,
	344,
	.949,
	71430.696,
	341,
	5.412,
	775.523,
	322,
	6.156,
	2146.165,
	286,
	5.484,
	10447.388,
	284,
	3.42,
	2352.866,
	255,
	6.132,
	6438.496,
	252,
	.243,
	398.149,
	243,
	3.092,
	4690.48,
	225,
	3.689,
	7084.897,
	220,
	4.952,
	6812.767,
	219,
	.42,
	8031.092,
	209,
	1.282,
	1748.016,
	193,
	5.314,
	8429.241,
	185,
	1.82,
	7632.943,
	175,
	3.229,
	6279.553,
	173,
	1.537,
	4705.732,
	158,
	4.097,
	11499.656,
	158,
	5.539,
	3154.687,
	150,
	3.633,
	11513.883,
	148,
	3.222,
	7234.794,
	147,
	3.653,
	1194.447,
	144,
	.817,
	14143.495,
	135,
	6.151,
	5746.271,
	134,
	4.644,
	6836.645,
	128,
	2.693,
	1349.867,
	123,
	5.65,
	5760.498,
	118,
	2.577,
	13367.973,
	113,
	3.357,
	17789.846,
	110,
	4.497,
	4292.331,
	108,
	5.828,
	12036.461,
	102,
	5.621,
	6256.778,
	99,
	1.14,
	1059.38,
	98,
	.66,
	5856.48,
	93,
	2.32,
	10213.29,
	92,
	.77,
	16730.46,
	88,
	1.5,
	11926.25,
	86,
	1.42,
	5753.38,
	85,
	.66,
	155.42,
	81,
	1.64,
	6681.22,
	80,
	4.11,
	951.72,
	66,
	4.55,
	5216.58,
	65,
	.98,
	25132.3,
	64,
	4.19,
	6040.35,
	64,
	.52,
	6290.19,
	63,
	1.51,
	5643.18,
	59,
	6.18,
	4164.31,
	57,
	2.3,
	10973.56,
	55,
	2.32,
	11506.77,
	55,
	2.2,
	1592.6,
	55,
	5.27,
	3340.61,
	54,
	5.54,
	553.57,
	53,
	5.04,
	9917.7,
	53,
	.92,
	11371.7,
	52,
	3.98,
	17298.18,
	52,
	3.6,
	10969.97,
	49,
	5.91,
	3894.18,
	49,
	2.51,
	6127.66,
	48,
	1.67,
	12168,
	46,
	.31,
	801.82,
	42,
	3.7,
	10575.41,
	42,
	4.05,
	10984.19,
	40,
	2.17,
	7860.42,
	40,
	4.17,
	26.3,
	38,
	5.82,
	7058.6,
	37,
	3.39,
	6496.37,
	36,
	1.08,
	6309.37,
	36,
	5.34,
	7079.37,
	34,
	3.62,
	11790.63,
	32,
	.32,
	16200.77,
	31,
	4.24,
	3738.76,
	29,
	4.55,
	11856.22,
	29,
	1.26,
	8635.94,
	27,
	3.45,
	5884.93,
	26,
	5.08,
	10177.26,
	26,
	5.38,
	21228.39,
	24,
	2.26,
	11712.96,
	24,
	1.05,
	242.73,
	24,
	5.59,
	6069.78,
	23,
	3.63,
	6284.06,
	23,
	1.64,
	4732.03,
	22,
	3.46,
	213.3,
	21,
	1.05,
	3496.03,
	21,
	3.92,
	13916.02,
	21,
	4.01,
	5230.81,
	20,
	5.16,
	12352.85,
	20,
	.69,
	1990.75,
	19,
	2.73,
	6062.66,
	19,
	5.01,
	11015.11,
	18,
	6.04,
	6283.01,
	18,
	2.85,
	7238.68,
	18,
	5.6,
	6283.14,
	18,
	5.16,
	17253.04,
	18,
	2.54,
	14314.17,
	17,
	1.58,
	7.11,
	17,
	.98,
	3930.21,
	17,
	4.75,
	17267.27,
	16,
	2.19,
	6076.89,
	16,
	2.19,
	18073.7,
	16,
	6.12,
	3.52,
	16,
	4.61,
	9623.69,
	16,
	3.4,
	16496.36,
	15,
	.19,
	9779.11,
	15,
	5.3,
	13517.87,
	15,
	4.26,
	3128.39,
	15,
	.81,
	709.93,
	14,
	.5,
	25158.6,
	14,
	4.38,
	4136.91,
	13,
	.98,
	65147.62,
	13,
	3.31,
	154717.61,
	13,
	2.11,
	1589.07,
	13,
	1.92,
	22483.85,
	12,
	6.03,
	9225.54,
	12,
	1.53,
	12559.04,
	12,
	5.82,
	6282.1,
	12,
	5.61,
	5642.2,
	12,
	2.38,
	167283.76,
	12,
	.39,
	12132.44,
	12,
	3.98,
	4686.89,
	12,
	5.81,
	12569.67,
	12,
	.56,
	5849.36,
	11,
	.45,
	6172.87,
	11,
	5.8,
	16858.48,
	11,
	6.22,
	12146.67,
	11,
	2.27,
	5429.88,
	435939,
	5.784551,
	6283.07585,
	12363,
	5.57935,
	12566.1517,
	1234,
	3.1416,
	0,
	879,
	3.628,
	77713.771,
	569,
	1.87,
	5573.143,
	330,
	5.47,
	18849.228,
	147,
	4.48,
	5507.553,
	110,
	2.842,
	161000.686,
	101,
	2.815,
	5223.694,
	85,
	3.11,
	1577.34,
	65,
	5.47,
	775.52,
	61,
	1.38,
	6438.5,
	50,
	4.42,
	6286.6,
	47,
	3.66,
	7084.9,
	46,
	5.39,
	149854.4,
	42,
	.9,
	10977.08,
	40,
	3.2,
	5088.63,
	35,
	1.81,
	5486.78,
	32,
	5.35,
	3154.69,
	30,
	3.52,
	796.3,
	29,
	4.62,
	4690.48,
	28,
	1.84,
	4694,
	27,
	3.14,
	71430.7,
	27,
	6.17,
	6836.65,
	26,
	1.42,
	2146.17,
	25,
	2.81,
	1748.02,
	24,
	2.18,
	155.42,
	23,
	4.76,
	7234.79,
	21,
	3.38,
	7632.94,
	21,
	.22,
	4705.73,
	20,
	4.22,
	1349.87,
	20,
	2.01,
	1194.45,
	20,
	4.58,
	529.69,
	19,
	1.59,
	6309.37,
	18,
	5.7,
	6040.35,
	18,
	6.03,
	4292.33,
	17,
	2.9,
	9437.76,
	17,
	2,
	8031.09,
	17,
	5.78,
	83996.85,
	16,
	.05,
	2544.31,
	15,
	.95,
	6127.66,
	14,
	.36,
	10447.39,
	14,
	1.48,
	2352.87,
	13,
	.77,
	553.57,
	13,
	5.48,
	951.72,
	13,
	5.27,
	6279.55,
	13,
	3.76,
	6812.77,
	11,
	5.41,
	6256.78,
	10,
	.68,
	1592.6,
	10,
	4.95,
	398.15,
	10,
	1.15,
	3894.18,
	10,
	5.2,
	244287.6,
	10,
	1.94,
	11856.22,
	9,
	5.39,
	25132.3,
	8,
	6.18,
	1059.38,
	8,
	.69,
	8429.24,
	8,
	5.85,
	242.73,
	7,
	5.26,
	14143.5,
	7,
	.52,
	801.82,
	6,
	2.24,
	8635.94,
	6,
	4,
	13367.97,
	6,
	2.77,
	90955.55,
	6,
	5.17,
	7058.6,
	5,
	1.46,
	233141.31,
	5,
	4.13,
	7860.42,
	5,
	3.91,
	26.3,
	5,
	3.89,
	12036.46,
	5,
	5.58,
	6290.19,
	5,
	5.54,
	1990.75,
	5,
	.83,
	11506.77,
	5,
	6.22,
	6681.22,
	4,
	5.26,
	10575.41,
	4,
	1.91,
	7477.52,
	4,
	.43,
	10213.29,
	4,
	1.09,
	709.93,
	4,
	5.09,
	11015.11,
	4,
	4.22,
	88860.06,
	4,
	3.57,
	7079.37,
	4,
	1.98,
	6284.06,
	4,
	3.93,
	10973.56,
	4,
	6.18,
	9917.7,
	4,
	.36,
	10177.26,
	4,
	2.75,
	3738.76,
	4,
	3.33,
	5643.18,
	4,
	5.36,
	25158.6,
	14459,
	4.27319,
	6283.07585,
	673,
	3.917,
	12566.152,
	77,
	0,
	0,
	25,
	3.73,
	18849.23,
	4,
	2.8,
	6286.6,
	386,
	2.564,
	6283.076,
	31,
	2.27,
	12566.15,
	5,
	3.44,
	5573.14,
	2,
	2.05,
	18849.23,
	1,
	2.06,
	77713.77,
	1,
	4.41,
	161000.69,
	1,
	3.82,
	149854.4,
	1,
	4.08,
	6127.66,
	1,
	5.26,
	6438.5,
	9,
	1.22,
	6283.08,
	1,
	.66,
	12566.15
];
const TERM_MEAN_TABLE = [
	1640650.479938,
	15.218425,
	1642476.703182,
	15.21874996,
	1683430.515601,
	15.218750011,
	1752157.640664,
	15.218749978,
	1807675.003759,
	15.218620279,
	1883627.765182,
	15.218612292,
	1907369.1281,
	15.218449176,
	1936603.140413,
	15.218425,
	1939145.52418,
	15.218466998,
	1947180.7983,
	15.218524844,
	1964362.041824,
	15.218533526,
	1987372.340971,
	15.218513908,
	1999653.819126,
	15.218530782,
	2007445.469786,
	15.218535181,
	2021324.917146,
	15.218526248,
	2047257.232342,
	15.218519654,
	2070282.898213,
	15.218425,
	2073204.87285,
	15.218515221,
	2080144.500926,
	15.218530782,
	2086703.688963,
	15.218523776,
	2110033.182763,
	15.218425,
	2111190.300888,
	15.218425,
	2113731.271005,
	15.218515671,
	2120670.840263,
	15.218425,
	2123973.309063,
	15.218425,
	2125068.997336,
	15.218477932,
	2136026.312633,
	15.218472436,
	2156099.495538,
	15.218425,
	2159021.324663,
	15.218425,
	2162308.575254,
	15.218461742,
	2178485.706538,
	15.218425,
	2178759.662849,
	15.218445786,
	2185334.0208,
	15.218425,
	2187525.481425,
	15.218425,
	2188621.191481,
	15.218437494,
	2322147.76
];
function decode(s) {
	const o = "0000000000";
	const o2 = "00000000000000000000";
	s = s.replace(/J/g, "00");
	s = s.replace(/I/g, "000");
	s = s.replace(/H/g, "0000");
	s = s.replace(/G/g, "00000");
	s = s.replace(/t/g, "02");
	s = s.replace(/s/g, "002");
	s = s.replace(/r/g, "0002");
	s = s.replace(/q/g, "00002");
	s = s.replace(/p/g, "000002");
	s = s.replace(/o/g, "0000002");
	s = s.replace(/n/g, "00000002");
	s = s.replace(/m/g, "000000002");
	s = s.replace(/l/g, "0000000002");
	s = s.replace(/k/g, "01");
	s = s.replace(/j/g, "0101");
	s = s.replace(/i/g, "001");
	s = s.replace(/h/g, "001001");
	s = s.replace(/g/g, "0001");
	s = s.replace(/f/g, "00001");
	s = s.replace(/e/g, "000001");
	s = s.replace(/d/g, "0000001");
	s = s.replace(/c/g, "00000001");
	s = s.replace(/b/g, "000000001");
	s = s.replace(/a/g, "0000000001");
	s = s.replace(/A/g, "000000000000000000000000000000000000000000000000000000000000");
	s = s.replace(/B/g, "00000000000000000000000000000000000000000000000000");
	s = s.replace(/C/g, "0000000000000000000000000000000000000000");
	s = s.replace(/D/g, "000000000000000000000000000000");
	s = s.replace(/E/g, o2);
	s = s.replace(/F/g, o);
	return s;
}
const TERM_FIX_FLAGS = decode("FrcFs22AFsckF2tsDtFqEtF1posFdFgiFseFtmelpsEfhkF2anmelpFlF1ikrotcnEqEq2FfqmcDsrFor22FgFrcgDscFs22FgEeFtE2sfFs22sCoEsaF2tsD1FpeE2eFsssEciFsFnmelpFcFhkF2tcnEqEpFgkrotcnEqrEtFermcDsrE222FgBmcmr22DaEfnaF222sD1FpeForeF2tssEfiFpEoeFssD1iFstEqFppDgFstcnEqEpFg11FscnEqrAoAF2ClAEsDmDtCtBaDlAFbAEpAAAAAD2FgBiBqoBbnBaBoAAAAAAAEgDqAdBqAFrBaBoACdAAf1AACgAAAeBbCamDgEifAE2AABa1C1BgFdiAAACoCeE1ADiEifDaAEqAAFe1AcFbcAAAAAF1iFaAAACpACmFmAAAAAAAACrDaAAADG0");
/** 黄经章动修正 */
function nutationLon2(t) {
	let a = -1.742 * t;
	const t2 = t * t;
	let dl = 0;
	for (let i = 0, j = NUT_B.length; i < j; i += 5) {
		dl += (NUT_B[i + 3] + a) * Math.sin(NUT_B[i] + NUT_B[i + 1] * t + NUT_B[i + 2] * t2);
		a = 0;
	}
	return dl / 100 / SECOND_PER_RAD;
}
/** 地球黄经级数（取 n 组周期项） */
function eLon(t, n) {
	t /= 10;
	let v = 0;
	let tn = 1;
	const pn = 1;
	const m0 = XL0[2] - XL0[pn];
	for (let i = 0; i < 6; i++, tn *= t) {
		const n1 = Math.floor(XL0[pn + i]);
		const n2 = Math.floor(XL0[2 + i]);
		const n0 = n2 - n1;
		let m;
		if (n < 0) m = n2;
		else {
			m = Math.floor(3 * n * n0 / m0 + .5) + n1;
			if (i !== 0) m += 3;
		}
		let c = 0;
		for (let j = n1; j < m; j += 3) c += XL0[j] * Math.cos(XL0[j + 1] + t * XL0[j + 2]);
		v += c * tn;
	}
	v /= XL0[0];
	const t2 = t * t;
	v += (-.0728 - 2.7702 * t - 1.1019 * t2 - .0996 * t2 * t) / SECOND_PER_RAD;
	return v;
}
/** 太阳光行差 */
function gxcSunLon(t) {
	const t2 = t * t;
	const v = -.043126 + 628.301955 * t - 2732e-9 * t2;
	return -20.49552 * (1 + (.016708634 - 42037e-9 * t - 1.267e-7 * t2) * Math.cos(v)) / SECOND_PER_RAD;
}
/** 地球速度 */
function ev(t) {
	const f = 628.307585 * t;
	return 628.332 + 21 * Math.sin(1.527 + f) + .44 * Math.sin(1.48 + f * 2) + .129 * Math.sin(5.82 + f) * t + 55e-5 * Math.sin(4.21 + f) * t * t;
}
/** 太阳视黄经 */
function saLon(t, n) {
	return eLon(t, n) + nutationLon2(t) + gxcSunLon(t) + Math.PI;
}
function dtExt(y, jsd) {
	const dy = (y - 1820) / 100;
	return -20 + jsd * dy * dy;
}
/** ΔT 计算（秒） */
function dtCalc(y) {
	const size = DT_AT.length;
	const y0 = DT_AT[size - 2];
	const t0 = DT_AT[size - 1];
	if (y >= y0) {
		const jsd = 31;
		if (y > y0 + 100) return dtExt(y, jsd);
		return dtExt(y, jsd) - (dtExt(y0, jsd) - t0) * (y0 + 100 - y) / 100;
	}
	let i = 0;
	for (; i < size; i += 5) if (y < DT_AT[i + 5]) break;
	const t1 = (y - DT_AT[i]) / (DT_AT[i + 5] - DT_AT[i]) * 10;
	const t2 = t1 * t1;
	const t3 = t2 * t1;
	return DT_AT[i + 1] + DT_AT[i + 2] * t1 + DT_AT[i + 3] * t2 + DT_AT[i + 4] * t3;
}
/** ΔT（天） */
function dtT(t) {
	return dtCalc(t / 365.2425 + 2e3) / SECOND_PER_DAY;
}
/** 已知太阳视黄经反解时间（高精度） */
function saLonT(w) {
	let v = 628.3319653318;
	let t = (w - 1.75347 - Math.PI) / v;
	v = ev(t);
	t += (w - saLon(t, 10)) / v;
	v = ev(t);
	t += (w - saLon(t, -1)) / v;
	return t;
}
/** 已知太阳视黄经反解时间（低精度），误差约 3 分钟内 */
function saLonT2(w) {
	const v = 628.3319653318;
	let t = (w - 1.75347 - Math.PI) / v;
	t -= (5297e-9 * t * t + .0334166 * Math.cos(4.669257 + 628.307585 * t) + 2061e-7 * Math.cos(2.67823 + 628.307585 * t) * t) / v;
	t += (w - eLon(t, 8) - Math.PI + (20.5 + 17.2 * Math.sin(2.1824 - 33.75705 * t)) / SECOND_PER_RAD) / v;
	return t;
}
/** 定气（高精度，用于修正表范围外） */
function termHigh(w) {
	let t = saLonT2(w) * 36525;
	t = t - dtT(t) + ONE_THIRD;
	const v = (t + .5) % 1 * SECOND_PER_DAY;
	if (v < 1200 || v > SECOND_PER_DAY - 1200) t = saLonT(w) * 36525 - dtT(t) + ONE_THIRD;
	return t;
}
/** 定气（低精度，用于配合修正表） */
function termLow(w) {
	const v = 628.3319653318;
	let t = (w - 4.895062166) / v;
	t -= (53 * t * t + 334116 * Math.cos(4.67 + 628.307585 * t) + 2061 * Math.cos(2.678 + 628.3076 * t) * t) / v / 1e7;
	const n = 48950621.66 + 6283319653.318 * t + 53 * t * t + 334166 * Math.cos(4.669257 + 628.307585 * t) + 3489 * Math.cos(4.6261 + 1256.61517 * t) + 2060.6 * Math.cos(2.67823 + 628.307585 * t) * t - 994 - 834 * Math.sin(2.1824 - 33.75705 * t);
	t -= (n / 1e7 - w) / 628.332 + (32 * (t + 1.8) * (t + 1.8) - 20) / SECOND_PER_DAY / 36525;
	return t * 36525 + ONE_THIRD;
}
/**
* 定气（日精度，粗算）。jd 为相对 J2000 的天数，返回节气日（相对 J2000 的整数天，北京时间）
*/
function calcTerm(jd) {
	const size = TERM_MEAN_TABLE.length;
	let d = 0;
	const pc = 7;
	jd += J2000;
	const f1 = TERM_MEAN_TABLE[0] - pc;
	const f2 = TERM_MEAN_TABLE[size - 1] - pc;
	if (jd < f1 || jd >= 2436935) d = Math.floor(termHigh(Math.floor((jd + pc - 2451259) / 365.2422 * 24) * Math.PI / 12) + .5);
	else if (jd >= f1 && jd < f2) {
		let i = 0;
		for (; i < size; i += 2) if (jd + pc < TERM_MEAN_TABLE[i + 2]) break;
		d = TERM_MEAN_TABLE[i] + TERM_MEAN_TABLE[i + 1] * Math.floor((jd + pc - TERM_MEAN_TABLE[i]) / TERM_MEAN_TABLE[i + 1]);
		d = Math.floor(d + .5);
		d -= J2000;
	} else {
		d = Math.floor(termLow(Math.floor((jd + pc - 2451259) / 365.2422 * 24) * Math.PI / 12) + .5);
		const from = Math.floor((jd - f2) / 365.2422 * 24);
		const n = TERM_FIX_FLAGS.substring(from, from + 1);
		if (n === "1") d += 1;
		else if (n === "2") d -= 1;
	}
	return d;
}
/** 精确定气。w 为节气太阳视黄经（弧度），返回相对 J2000 的天数（北京时间） */
function termAccurate(w) {
	const t = saLonT(w) * 36525;
	return t - dtT(t) + ONE_THIRD;
}
/** 精确定气。jd 为粗算节气日（相对 J2000），返回精确时刻（相对 J2000 的天数，北京时间） */
function termAccurate2(jd) {
	const d = Math.PI / 12;
	const w = Math.floor((jd + 293) / 365.2422 * 24) * d;
	const a = termAccurate(w);
	if (a - jd > 5) return termAccurate(w - d);
	if (a - jd < -5) return termAccurate(w + d);
	return a;
}
/** 儒略日 → 公历 [year, month, day, hour, minute, second]（历法无关的标准转换） */
function julianDayToDate(julianDay) {
	let d = Math.floor(julianDay + .5);
	let f = julianDay + .5 - d;
	if (d >= 2299161) {
		const c = Math.floor((d - 1867216.25) / 36524.25);
		d += 1 + c - Math.floor(c / 4);
	}
	d += 1524;
	let year = Math.floor((d - 122.1) / 365.25);
	d -= Math.floor(365.25 * year);
	let month = Math.floor(d / 30.601);
	d -= Math.floor(30.601 * month);
	let day = d;
	if (month > 13) {
		month -= 13;
		year -= 4715;
	} else {
		month -= 1;
		year -= 4716;
	}
	f *= 24;
	let hour = Math.floor(f);
	f -= hour;
	f *= 60;
	let minute = Math.floor(f);
	f -= minute;
	f *= 60;
	let second = Math.round(f);
	if (second > 59) {
		second -= 60;
		minute++;
	}
	if (minute > 59) {
		minute -= 60;
		hour++;
	}
	if (hour > 23) {
		hour -= 24;
		day += 1;
	}
	return [
		year,
		month,
		day,
		hour,
		minute,
		second
	];
}
//#endregion
//#region src/core/solar-term/solar-term.ts
/**
* 天文引擎与传统历表的日级修正
* 天文精确时刻在午夜前后数分钟内时，历表（源于不同 ΔT 模型）与之相差一日，
* 以下 6 处以传统历书（lunaris 历表）为准。key: `${year}:${termValue}` → 日
*/
const DAY_PATCH = {
	"1912:21": 23,
	"1913:17": 24,
	"1917:22": 7,
	"1927:16": 8,
	"1928:11": 21,
	"1979:1": 21
};
/** 逐年精确节气时刻缓存 */
const termDatesCache = /* @__PURE__ */ new Map();
/** 逐年节气"日"列表缓存（含 DAY_PATCH 修正） */
const termDaysCache = /* @__PURE__ */ new Map();
/**
* 计算公历年 year 内 24 个节气的精确时刻（北京时间语义下的本地 Date）
* 序: 小寒=0 ... 冬至=23
*/
function computeYearTermDates(year) {
	if (termDatesCache.has(year)) return termDatesCache.get(year);
	const jdAnchor = Math.floor((year - 2e3) * 365.2422 + 180);
	const w = Math.floor((jdAnchor - 355 + 183) / 365.2422) * 365.2422 + 355 - 365.2422;
	const res = [];
	for (let i = 0; i < 24; i++) {
		const [y, m, d, h, mi, s] = julianDayToDate(termAccurate2(calcTerm(w + 15.2184 * (i + 1))) + J2000);
		res.push(new Date(y, m - 1, d, h, mi, s));
	}
	termDatesCache.set(year, res);
	return res;
}
var SolarTerm = class SolarTerm {
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	constructor(value, config) {
		if (config) this._config = Object.assign({}, this._config, config);
		if (value instanceof SolarTerm) return value;
		if (typeof value === "number") this.value = value % 24;
		else {
			const termIndex = _GlobalConfig.locales[this._config.lang].solarTerm.indexOf(value);
			if (termIndex === -1) throw new Error("Invalid term value");
			this.value = termIndex;
		}
	}
	get name() {
		return String(_GlobalConfig.locales[this._config.lang].solarTerm[this.value]);
	}
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		return [..._GlobalConfig.locales[lang].solarTerm];
	}
	/**
	* 取得指定节气的精确时刻（分钟级，北京时间语义）
	* @param year 公历年
	* @param term 节气（索引/名称/实例），小寒=0 ... 冬至=23
	*/
	static dateOf(year, term, config) {
		const termValue = SolarTerm.prettyTermValue(term, config?.lang);
		return computeYearTermDates(year)[termValue];
	}
	static prettyTermValue(term, lang) {
		if (term instanceof SolarTerm) return term.value;
		if (typeof term === "string") {
			const l = lang || _GlobalConfig.lang;
			const idx = _GlobalConfig.locales[l].solarTerm.indexOf(term);
			if (idx === -1) throw new Error("Invalid term value");
			return idx;
		}
		return term % 24;
	}
	/** 取得当年的节气日期列表 [d, d, d, ...]（24 项，日精度，与传统历书一致） */
	static getYearTermDayList(year) {
		if (termDaysCache.has(year)) return termDaysCache.get(year);
		const res = computeYearTermDates(year).map((d, i) => DAY_PATCH[`${year}:${i}`] ?? d.getDate());
		termDaysCache.set(year, res);
		return res;
	}
	/** 取得某年某月的两个节气日 [节, 气]（日精度，供农历月/闰月计算使用，与传统历书一致） */
	static getMonthTerms(year, month) {
		const list = SolarTerm.getYearTermDayList(year);
		return [list[(month - 1) * 2], list[(month - 1) * 2 + 1]];
	}
	/** 取得某年某月的两个节气精确时刻 [节, 气]（分钟级，供四柱月柱等需要精确换月时刻的场景使用） */
	static getMonthTermDates(year, month) {
		const dates = computeYearTermDates(year);
		return [dates[(month - 1) * 2], dates[(month - 1) * 2 + 1]];
	}
	/** 查出指定节气的日期 [year, month, day]（日精度） */
	static findDate(year, termValue, config) {
		const value = SolarTerm.prettyTermValue(termValue, config?.lang);
		const month = value >> 1;
		const day = SolarTerm.getYearTermDayList(year)[value];
		return [
			year,
			month + 1,
			day
		];
	}
	static findNode(date, config) {
		const cfg = Object.assign({
			lang: _GlobalConfig.lang,
			returnValue: false,
			nodeFlag: 0,
			isUTC: false
		}, config);
		const { returnValue, nodeFlag, isUTC } = cfg;
		if (nodeFlag > 2) throw new Error("Invalid nodeFlag");
		const newSolarTermConfig = { lang: cfg.lang };
		let year = getDateData(date, "FullYear", isUTC);
		let month = getDateData(date, "Month", isUTC);
		let termValue = (month * 2 + 24) % 24;
		const instantOf = (d, isUTC0 = false) => isUTC0 ? Date.UTC(getDateData(d, "FullYear", true), getDateData(d, "Month", true), getDateData(d, "Date", true), getDateData(d, "Hours", true), getDateData(d, "Minutes", true), getDateData(d, "Seconds", true)) : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
		const dateInstant = instantOf(date, isUTC);
		let [termDate1, termDate2] = SolarTerm.getMonthTermDates(year, month + 1);
		let usePreMonth = false;
		let beforeTerm2 = false;
		if (dateInstant < instantOf(termDate1)) usePreMonth = true;
		else if (dateInstant < instantOf(termDate2)) {
			beforeTerm2 = true;
			if (nodeFlag === 1) usePreMonth = true;
		}
		let returnTerm2 = false;
		if (usePreMonth) {
			if (month - 1 < 0) {
				year--;
				month = 11;
			} else month--;
			termValue = (month * 2 + 24) % 24;
			[termDate1, termDate2] = SolarTerm.getMonthTermDates(year, month + 1);
			if (nodeFlag > 0) returnTerm2 = true;
		} else if (nodeFlag === 1 || nodeFlag === 2 && !beforeTerm2) returnTerm2 = true;
		const termDate = returnTerm2 ? termDate2 : termDate1;
		termValue = returnTerm2 ? (termValue + 1) % 24 : termValue;
		if (returnValue) return [termValue, termDate];
		return [new SolarTerm(termValue, newSolarTermConfig), termDate];
	}
	/**
	* 取得 date 之前（含当刻）最近的"节"的精确时刻
	* 节为偶数索引节气（小寒、立春、驚蟄...），用于八字起运
	*/
	static prevNode(date) {
		const t = date.valueOf();
		const year = date.getFullYear();
		const dates = computeYearTermDates(year);
		for (let i = 22; i >= 0; i -= 2) if (dates[i].valueOf() <= t) return [new SolarTerm(i), dates[i]];
		const prev = computeYearTermDates(year - 1);
		return [new SolarTerm(22), prev[22]];
	}
	/** 取得 date 之后最近的"节"的精确时刻 */
	static nextNode(date) {
		const t = date.valueOf();
		const year = date.getFullYear();
		const dates = computeYearTermDates(year);
		for (let i = 0; i <= 22; i += 2) if (dates[i].valueOf() > t) return [new SolarTerm(i), dates[i]];
		const next = computeYearTermDates(year + 1);
		return [new SolarTerm(0), next[0]];
	}
	valueOf() {
		return this.value;
	}
	toString() {
		return this.name;
	}
};
//#endregion
//#region src/core/five-element.ts
/** 五行 */
var FiveElement = class FiveElement {
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		return [..._GlobalConfig.locales[lang].fiveElements];
	}
	static instances = /* @__PURE__ */ new Map();
	static create(value, config) {
		if (value instanceof FiveElement) return value;
		const lang = config?.lang || _GlobalConfig.lang;
		value = parseCommonCreateClassValue(value, "fiveElement", lang, _GlobalConfig);
		const instMapKey = `${value}:${lang}`;
		if (FiveElement.instances.has(instMapKey)) return FiveElement.instances.get(instMapKey);
		const inst = new FiveElement(value, config);
		FiveElement.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(value, config) {
		if (value instanceof FiveElement) return value;
		if (config) this._config = Object.assign({}, this._config, config);
		this.value = parseCommonCreateClassValue(value, "fiveElement", this._config.lang, _GlobalConfig);
	}
	get name() {
		return _GlobalConfig.locales[this._config.lang].fiveElements[this.value];
	}
	/** 相生 */
	generating() {
		return FiveElement.create((this.value + 1) % 5, this._config);
	}
	/** 相克 */
	overcoming() {
		return FiveElement.create((this.value + 2) % 5, this._config);
	}
	/** 相洩 */
	weakening() {
		return FiveElement.create((this.value + 4) % 5, this._config);
	}
	/** 相侮 */
	counteracting() {
		return FiveElement.create((this.value + 3) % 5, this._config);
	}
	toString() {
		return this.name;
	}
	valueOf() {
		return this.value;
	}
};
//#endregion
//#region src/core/trigram.ts
/** 八卦（顺序: 坤震坎兌艮離巽乾） */
var Trigram = class Trigram {
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		return [..._GlobalConfig.locales[lang].eightTrigram];
	}
	static instances = /* @__PURE__ */ new Map();
	static create(value, config) {
		const lang = config?.lang || _GlobalConfig.lang;
		value = parseCommonCreateClassValue(value, "trigram", lang, _GlobalConfig);
		const instMapKey = `${value}:${lang}`;
		if (Trigram.instances.has(instMapKey)) return Trigram.instances.get(instMapKey);
		const inst = new Trigram(value, config);
		Trigram.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(value, config) {
		if (config) this._config = Object.assign({}, this._config, config);
		this.value = value % 8;
	}
	get name() {
		return _GlobalConfig.locales[this._config.lang].eightTrigram[this.value];
	}
	toString() {
		return this.name;
	}
	valueOf() {
		return this.value;
	}
};
//#endregion
//#region src/core/cache.ts
/** 带实例级缓存的基类 */
var CacheClass = class {
	cache = /* @__PURE__ */ new Map();
	/** 惰性求值并缓存（替代 legacy 的 @cache 装饰器） */
	_cached(key, fn) {
		if (this.cache.has(key)) return this.cache.get(key);
		const res = fn();
		this.cache.set(key, res);
		return res;
	}
};
/** 模块级缓存工具 */
function cacheAndReturn(key, getDataFn, cache) {
	if (cache.has(key)) return cache.get(key);
	const res = getDataFn();
	cache.set(key, res);
	return res;
}
//#endregion
//#region src/core/stem-branch.ts
/** 纳音五行（五行顺序: 木火土金水） */
const TAKE_SOUND_ELEMENTS = [
	3,
	1,
	0,
	2,
	3,
	1,
	4,
	2,
	3,
	0,
	4,
	2,
	1,
	0,
	4,
	3,
	1,
	0,
	2,
	3,
	1,
	4,
	2,
	3,
	0,
	4,
	2,
	1,
	0,
	4
];
/** 地支 */
var Branch = class Branch extends CacheClass {
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		return [..._GlobalConfig.locales[lang].branches];
	}
	static instances = /* @__PURE__ */ new Map();
	static create(value, config) {
		if (value instanceof Branch) return value;
		const lang = config?.lang || _GlobalConfig.lang;
		value = parseCommonCreateClassValue(value, "branch", lang, _GlobalConfig);
		const instMapKey = `${value}:${lang}`;
		if (Branch.instances.has(instMapKey)) return Branch.instances.get(instMapKey);
		const inst = new Branch(value, config);
		Branch.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(value, config) {
		super();
		if (value instanceof Branch) return value;
		if (config) this._config = Object.assign({}, this._config, config);
		this.value = parseCommonCreateClassValue(value, "branch", this._config.lang, _GlobalConfig);
	}
	get name() {
		return _GlobalConfig.locales[this._config.lang].branches[this.value];
	}
	/** 藏干 */
	get hiddenStems() {
		return this._cached("branch:hiddenStems", () => {
			return HIDDEN_STEMS[this.value].map((v) => new Stem(v, this._config));
		});
	}
	get element() {
		return this._cached("branch:element", () => {
			const i = Math.floor((this.value + 10) / 3) % 4;
			if ((this.value + 10) % 3 === 2) return FiveElement.create(2, this._config);
			else return FiveElement.create(i < 2 ? i : i + 1, this._config);
		});
	}
	/** 三会 */
	get meeting() {
		return this._cached("branch:meeting", () => {
			const result = [
				[
					2,
					3,
					4
				],
				[
					5,
					6,
					7
				],
				[
					8,
					9,
					10
				],
				[
					11,
					0,
					1
				]
			].find((item) => item.includes(this.value)).filter((item) => item !== this.value);
			return [Branch.create(result[0], this._config), Branch.create(result[1], this._config)];
		});
	}
	/** 三会五行 */
	get meetingElement() {
		return FiveElement.create(computeMeetingElementValue(this.value), this._config);
	}
	/** 三合 */
	get triad() {
		return [Branch.create((this.value + 4) % 12, this._config), Branch.create((this.value + 8) % 12, this._config)];
	}
	/** 三合五行 */
	get triadElement() {
		return FiveElement.create(computeTriadElementValue(this.value), this._config);
	}
	/** 六合 */
	get group6() {
		return Branch.create((13 - this.value) % 12, this._config);
	}
	/** 六合五行 */
	get group6Element() {
		return FiveElement.create(computeGroup6ElementValue(this.value), this._config);
	}
	/** 相刑 */
	get punishing() {
		return Branch.create([
			3,
			10,
			5,
			0,
			4,
			8,
			6,
			1,
			2,
			9,
			7,
			11
		][this.value], this._config);
	}
	/** 被刑 */
	get punishBy() {
		return Branch.create([
			3,
			7,
			8,
			0,
			4,
			2,
			6,
			10,
			5,
			9,
			1,
			11
		][this.value], this._config);
	}
	/** 相冲 */
	get conflict() {
		return Branch.create((this.value + 6) % 12, this._config);
	}
	/** 相破 */
	get destroying() {
		return Branch.create([
			9,
			4,
			11,
			6,
			1,
			8,
			3,
			10,
			5,
			0,
			7,
			2
		][this.value], this._config);
	}
	/** 相害 */
	get harming() {
		const value = this.value > 7 ? 19 - this.value : 7 - this.value;
		return Branch.create(value, this._config);
	}
	/** 生肖 */
	get zodiac() {
		return _GlobalConfig.locales[this._config.lang].chineseZodiac[this.value];
	}
	toString() {
		return this.name;
	}
	valueOf() {
		return this.value;
	}
};
/** 天干 */
var Stem = class Stem extends CacheClass {
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		return [..._GlobalConfig.locales[lang].stems];
	}
	static instances = /* @__PURE__ */ new Map();
	static create(value, config) {
		if (value instanceof Stem) return value;
		const lang = config?.lang || _GlobalConfig.lang;
		value = parseCommonCreateClassValue(value, "stem", lang, _GlobalConfig);
		const instMapKey = `${value}:${lang}`;
		if (Stem.instances.has(instMapKey)) return Stem.instances.get(instMapKey);
		const inst = new Stem(value, config);
		Stem.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(value, config) {
		super();
		if (value instanceof Stem) return value;
		if (config) this._config = Object.assign({}, this._config, config);
		this.value = parseCommonCreateClassValue(value, "stem", this._config.lang, _GlobalConfig);
	}
	get name() {
		return _GlobalConfig.locales[this._config.lang].stems[this.value];
	}
	/** 该天干可组合的地支 */
	get branches() {
		return this._cached("stem:branches", () => {
			return _GlobalConfig.locales[this._config.lang].branches.filter((_, index) => index % 2 === this.value % 2).map((branch) => Branch.create(branch, this._config));
		});
	}
	get element() {
		return this._cached("stem:element", () => FiveElement.create(Math.floor(this.value / 2), this._config));
	}
	get trigram() {
		return Trigram.create(getTrigramValueByStem(this.value), this._config);
	}
	/** 相冲（对照 CHONG_GAN 表: CHONG_GAN[i] = TG[(i+4)%10]） */
	get conflict() {
		return Stem.create((this.value + 4) % 10, this._config);
	}
	toString() {
		return this.name;
	}
	valueOf() {
		return this.value;
	}
};
/** 天干地支组合（六十甲子） */
var StemBranch = class StemBranch {
	stem;
	branch;
	value = -1;
	_config = { lang: _GlobalConfig.lang };
	static getNames(lang) {
		lang = lang || _GlobalConfig.lang;
		const locale = _GlobalConfig.locales[lang];
		return new Array(60).fill("").map((_, index) => {
			const stemValue = index % 10;
			const branchValue = index % 12;
			return locale.stems[stemValue] + (locale?.stemBranchSeparator ?? "") + locale.branches[branchValue];
		});
	}
	/** 由完整六十甲子名称（如 '甲子'，或 en 语言包 'Jia-Zi'）解析出 StemBranch，非法名称抛错 */
	static fromName(name, config) {
		const lang = config?.lang || _GlobalConfig.lang;
		const idx = StemBranch.getNames(lang).indexOf(name);
		if (idx === -1) throw new Error(`Invalid StemBranch name: ${name}`);
		return StemBranch.create(idx, config);
	}
	static instances = /* @__PURE__ */ new Map();
	static create(value, config) {
		if (value instanceof StemBranch) return value;
		const instMapKey = `${value}:${config?.lang || _GlobalConfig.lang}`;
		if (StemBranch.instances.has(instMapKey)) return StemBranch.instances.get(instMapKey);
		const inst = new StemBranch(value, void 0, config);
		StemBranch.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(stemOrValue, branch, config) {
		if (config) this._config = Object.assign({}, this._config, config);
		if (typeof branch === "number" || typeof branch === "string" || branch instanceof Branch) {
			this.stem = Stem.create(stemOrValue, this._config);
			this.branch = Branch.create(branch, this._config);
			const stemValue = this.stem.valueOf();
			const branchValue = this.branch.valueOf();
			this.value = computeStemBranchValue(stemValue, branchValue);
		} else if (typeof stemOrValue === "number") {
			this.value = stemOrValue % 60;
			this.stem = Stem.create(this.value % 10, this._config);
			this.branch = Branch.create(this.value % 12, this._config);
		} else throw new Error("Invalid StemBranch value");
	}
	/** 旬空（空亡） */
	get voidBranches() {
		const bV = (5 - Math.floor(this.value / 10)) * 2;
		return [Branch.create(bV, this._config), Branch.create(bV + 1, this._config)];
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return StemBranch.create(Math.floor(this.value / 10) * 10, this._config);
	}
	/** 日冲干支（日柱相冲: 天干相冲 + 地支相冲，两者位移皆为偶数，奇偶校验必过） */
	get clash() {
		return new StemBranch(this.stem.conflict, this.branch.conflict, this._config);
	}
	/** 纳音 */
	get takeSound() {
		return _GlobalConfig.locales[this._config.lang].takeSound[(this.value >> 1) % 30];
	}
	/** 纳音五行 */
	get takeSoundElement() {
		return FiveElement.create(TAKE_SOUND_ELEMENTS[(this.value >> 1) % 30], this._config);
	}
	get name() {
		const locale = _GlobalConfig.locales[this._config.lang];
		return `${this.stem}${locale?.stemBranchSeparator ?? ""}${this.branch}`;
	}
	toString() {
		return this.name;
	}
	valueOf() {
		return this.value;
	}
};
//#endregion
//#region src/core/four-pillars.ts
/** 四柱（年月日时天干地支） */
var FourPillars = class FourPillars {
	value = -1;
	_list;
	_config = {
		changeAgeTerm: _GlobalConfig.changeAgeTerm,
		isUTC: false,
		lang: _GlobalConfig.lang,
		offset: 0,
		ziHourSplit: _GlobalConfig.ziHourSplit
	};
	constructor(dateOrSbList, config) {
		if (config) this._config = Object.assign({}, this._config, config);
		if (dateOrSbList instanceof Date) {
			const date = dateOrSbList;
			const y = FourPillars.computeYearPillar(date, this._config);
			const m = FourPillars.computeMonthPillar(date, this._config);
			const d = FourPillars.computeDayPillar(date, this._config);
			dateOrSbList = [
				y,
				m,
				d,
				FourPillars.computeHourPillar(date, d, this._config)
			];
		}
		this._list = dateOrSbList;
		this.value = FourPillars.computeValue(dateOrSbList);
	}
	getConfig() {
		return Object.assign({}, this._config);
	}
	get list() {
		return this._list;
	}
	get year() {
		return this._list[0];
	}
	get month() {
		return this._list[1];
	}
	get day() {
		return this._list[2];
	}
	get hour() {
		return this._list[3];
	}
	/** 日主（日柱天干） */
	get dayMaster() {
		return this._list[2].stem;
	}
	static computeValue(sbList) {
		let res = 0;
		for (let i = 0; i < 4; i++) res += sbList[i].valueOf() * Math.pow(10, 2 * (3 - i));
		return res;
	}
	/**
	* 计算年柱对应的调整后年份（按 changeAgeTerm 指定节气换岁；为 null 时按正月初一换岁）
	* 供年柱本身与三元九运等"按岁而非按公历年"取值的能力共用同一套换岁边界
	*/
	static computeYearPillarYear(date, config) {
		let changeAgeTerm = config && config.changeAgeTerm !== void 0 ? config.changeAgeTerm : _GlobalConfig.changeAgeTerm;
		const isUTC = config?.isUTC ?? false;
		let year = typeof date !== "number" ? getDateData(date, "FullYear", isUTC) : date;
		if (changeAgeTerm !== null && changeAgeTerm !== void 0 && typeof date !== "number") {
			changeAgeTerm = changeAgeTerm % 24;
			const isPreYear = changeAgeTerm < 0;
			changeAgeTerm = changeAgeTerm >= 0 ? changeAgeTerm : 24 + changeAgeTerm;
			let yearStart = getDateData(date, "FullYear", isUTC);
			if (isPreYear) yearStart--;
			const yearEnd = yearStart + 1;
			const startDate = SolarTerm.dateOf(yearStart, changeAgeTerm);
			const endDate = SolarTerm.dateOf(yearEnd, changeAgeTerm);
			if (date.valueOf() < startDate.valueOf()) year--;
			else if (date.valueOf() >= endDate.valueOf()) year++;
		} else if (changeAgeTerm === null && typeof date !== "number") {
			const theNewYearDate = Lunar.getLunarNewYearDay(year);
			if (date.valueOf() < theNewYearDate.valueOf() - 3600 * 1e3) year--;
		}
		return year;
	}
	/** 取年柱天干地支 */
	static computeYearPillar(date, config) {
		const year = FourPillars.computeYearPillarYear(date, config);
		return new StemBranch((year - 4) % 10, (year - 4) % 12, config);
	}
	/** 取月柱天干地支 */
	static computeMonthPillar(date, config) {
		const lang = config && config.lang !== void 0 ? config.lang : _GlobalConfig.lang;
		let changeAgeTerm = config && config.changeAgeTerm !== void 0 ? config.changeAgeTerm : _GlobalConfig.changeAgeTerm;
		changeAgeTerm = changeAgeTerm || 0;
		const isUTC = config?.isUTC ?? false;
		const findNodeConfig = {
			isUTC,
			lang,
			returnValue: true,
			nodeFlag: (changeAgeTerm + 24) % 2
		};
		const [termValue, termDate] = SolarTerm.findNode(date, findNodeConfig);
		return new StemBranch(computeMonthValueByTerm(date, termValue, termDate, isUTC), void 0, { lang });
	}
	/** 取日柱天干地支 */
	static computeDayPillar(date, config) {
		const isUTC = config?.isUTC || false;
		const offset = config?.offset || 0;
		const ziHourSplit = config?.ziHourSplit ?? _GlobalConfig.ziHourSplit;
		let daydiff;
		if (isUTC) {
			const dateValue = date.valueOf() - offset * 60 * 1e3;
			const sb0 = ziHourSplit ? parseDate(`${DAY_PILLAR_EPOCH[0]}-${DAY_PILLAR_EPOCH[1]}-${DAY_PILLAR_EPOCH[2] - 1} 23:00:00`) : parseDate(`${DAY_PILLAR_EPOCH[0]}-${DAY_PILLAR_EPOCH[1]}-${DAY_PILLAR_EPOCH[2]} 00:00:00`);
			daydiff = Math.floor((dateValue - sb0.valueOf()) / (1e3 * 60 * 60 * 24));
		} else {
			const carry = ziHourSplit && date.getHours() === 23 ? 1 : 0;
			const dayNum = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + carry);
			const epochNum = Date.UTC(DAY_PILLAR_EPOCH[0], DAY_PILLAR_EPOCH[1] - 1, DAY_PILLAR_EPOCH[2]);
			daydiff = Math.round((dayNum - epochNum) / (1e3 * 60 * 60 * 24));
		}
		return new StemBranch((daydiff % 60 + 60) % 60, void 0, config);
	}
	/**
	* 取时柱天干地支（五鼠遁）
	* 甲己还加甲，乙庚丙作初。丙辛从戊起，丁壬庚子居。戊癸起壬子，周而复始求。
	*/
	static computeHourPillar(date, sbDay, config) {
		const isUTC = config?.isUTC || false;
		if (!sbDay) sbDay = FourPillars.computeDayPillar(date, config);
		const hour = getDateData(date, "Hours", isUTC);
		const dayStem = sbDay.stem;
		const branchNum = (hour + 1 >> 1) % 12;
		return new StemBranch(computeRatStem(dayStem.value, branchNum), branchNum, config);
	}
	/**
	* 由当前四柱反查匹配的公历日期（可能多解，如时柱地支为子时跨早/晚子时两解）。
	*
	* 目标口径（changeAgeTerm/ziHourSplit/isUTC/offset/lang）取自构造本实例时传入的
	* `_config`，与正推共用同一套口径，反查结果重新正推必然精确复现四柱。
	*
	* 不做逐年逐日逐时的朴素穷举：先用年柱 60 甲子的周期性（`computeYearPillar` 的年份
	* 与年柱值恒满足 `((year - 4) % 60 + 60) % 60`）把候选公历年收窄到只随
	* `(endYear - startYear) / 60` 增长的少数几个"候选换岁年"，再在每个候选换岁年
	* 附近的两个公历年内逐日验证——无论 changeAgeTerm 是节气还是 null（正月初一换岁），
	* 换岁窗口的起止点必落在这两个公历年内。时柱地支已知，除子时外每天只需验证 1 个
	* 代表时辰起点；子时验证 0 点、23 点两个代表时刻，分别对应早/晚子时（日柱进位
	* 方向不同，由 `computeDayPillar`/`computeHourPillar` 内部处理）。
	*/
	findDates(options) {
		const config = this._config;
		const isUTC = config.isUTC;
		const startYear = options?.startYear ?? 1900;
		const endYear = options?.endYear ?? (/* @__PURE__ */ new Date()).getFullYear();
		const targetYearValue = this.year.value;
		const targetMonthValue = this.month.value;
		const targetDayValue = this.day.value;
		const targetHourValue = this.hour.value;
		const hourBranchValue = this.hour.branch.value;
		const candidateHours = hourBranchValue === 0 ? [0, 23] : [hourBranchValue * 2 - 1];
		const rangeStart = startYear - 1;
		const rangeEnd = endYear + 1;
		const firstCandidateYear = rangeStart + ((((targetYearValue + 4) % 60 + 60) % 60 - rangeStart) % 60 + 60) % 60;
		const results = [];
		for (let yy = firstCandidateYear; yy <= rangeEnd; yy += 60) for (const y of [yy, yy + 1]) for (let m = 0; m < 12; m++) {
			const daysInMonth = isUTC ? new Date(Date.UTC(y, m + 1, 0)).getUTCDate() : new Date(y, m + 1, 0).getDate();
			for (let d = 1; d <= daysInMonth; d++) for (const h of candidateHours) {
				const candidate = isUTC ? new Date(Date.UTC(y, m, d, h)) : new Date(y, m, d, h);
				if (FourPillars.computeYearPillar(candidate, config).value !== targetYearValue) continue;
				if (FourPillars.computeMonthPillar(candidate, config).value !== targetMonthValue) continue;
				const daySb = FourPillars.computeDayPillar(candidate, config);
				if (daySb.value !== targetDayValue) continue;
				/* v8 ignore next */
				if (FourPillars.computeHourPillar(candidate, daySb, config).value !== targetHourValue) continue;
				const candidateYear = isUTC ? candidate.getUTCFullYear() : candidate.getFullYear();
				if (candidateYear < startYear || candidateYear > endYear) continue;
				results.push(candidate);
			}
		}
		return results;
	}
	toString() {
		return `${this.year} ${this.month} ${this.day} ${this.hour}`;
	}
	valueOf() {
		return this.value;
	}
};
//#endregion
//#region src/core/data/fetal-god-data.ts
/**
* 胎神逐日占游方定局（六十甲子）
* 绝对值为方位索引（中東東南南西南西西北北東北），正为外，负为内，0 为中
*/
const FETAL_GOD_DAY_DIRECTION = [
	2,
	2,
	3,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	5,
	6,
	6,
	6,
	6,
	6,
	6,
	7,
	7,
	7,
	7,
	7,
	-7,
	-7,
	-7,
	-7,
	-7,
	0,
	0,
	-3,
	-3,
	-3,
	-5,
	-1,
	-1,
	-1,
	-1,
	0,
	8,
	8,
	8,
	8,
	8,
	8,
	1,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2
];
//#endregion
//#region src/core/fetal-god.ts
/**
* 计算胎神数据
* 天干六甲胎神歌: 甲己之日占在門，乙庚碓磨休移动。丙辛廚灶莫相干，丁壬倉庫忌修弄。戊癸房床若移整。
* 地支六甲胎神歌: 子午二日碓须忌，丑未廁道莫修移。寅申火爐休要动，卯酉大門修当避。辰戌雞棲巳亥床。
*/
function computeFetalGodData(daySb, locale) {
	const stemPlace = locale.stemFetalGodPlace[daySb.stem.value % 5];
	const branchPlace = locale.branchFetalGodPlace[daySb.branch.value % 6];
	const directionValue = FETAL_GOD_DAY_DIRECTION[daySb.value % 60];
	return {
		stemPlace,
		branchPlace,
		directionValue,
		direction: (directionValue === 0 ? "" : directionValue > 0 ? locale.fetalGodOutsideDesc : locale.fetalGodInsideDesc) + locale.fetalGodDirection[Math.abs(directionValue)],
		description: locale.fetalGodDayDesc[daySb.value]
	};
}
//#endregion
//#region src/core/peng-zu.ts
/**
* 计算彭祖百忌数据
* 天干彭祖百忌: 甲不开仓财物耗散，乙不栽植千株不长……
* 地支彭祖百忌: 子不问卜自惹祸殃，丑不冠带主不还乡……
*/
function computePengZuData(daySb, locale) {
	return {
		stemTaboo: locale.pengZu.stem[daySb.stem.value],
		branchTaboo: locale.pengZu.branch[daySb.branch.value]
	};
}
//#endregion
//#region src/core/nine-yun.ts
/** 现行三元九运周期锚点：1864 年甲子，上元一运起始 */
const NINE_YUN_EPOCH_YEAR = 1864;
/**
* 计算三元九运
* 以 1864 年甲子（现行上元一运起始年）为锚点，180 年一大周期，60 年一元，20 年一运
*/
function computeNineYun(year, locale) {
	const offset = ((year - NINE_YUN_EPOCH_YEAR) % 180 + 180) % 180;
	const yunIndex = Math.floor(offset / 20) + 1;
	const yuanIndex = Math.floor((yunIndex - 1) / 3);
	return {
		yuanIndex,
		yuan: locale.nineYun.yuan[yuanIndex],
		yunIndex,
		yun: locale.nineYun.yun[yunIndex - 1]
	};
}
//#endregion
//#region src/natal/utils.ts
const TEN_GOD_LIST = [
	"正官",
	"七殺",
	"正財",
	"偏財",
	"食神",
	"傷官",
	"比肩",
	"劫財",
	"正印",
	"梟神"
];
const TEN_GOD_RELATIONS = {
	generating: ["食神", "傷官"],
	weakening: ["梟神", "正印"],
	sibling: ["比肩", "劫財"],
	overcoming: ["偏財", "正財"],
	counteracting: ["七殺", "正官"]
};
/** natalChart 命名空间下的翻译（缺失时回退 key 自身） */
const trans = (key, lang = _GlobalConfig.lang) => {
	return getTranslation(_GlobalConfig.locales[lang] ?? _GlobalConfig.locales.zh, `natalChart.${key}`);
};
/** 通过两天干五行生克计算十神 */
const computeTenGodByStem = (dayMaster, targetStem, lang = _GlobalConfig.lang) => {
	const isNotSame = dayMaster.value % 2 === targetStem.value % 2 ? 0 : 1;
	const targetElementValue = targetStem.element.value;
	let trgKey;
	if (dayMaster.element.generating().value === targetElementValue) trgKey = "generating";
	else if (dayMaster.element.weakening().value === targetElementValue) trgKey = "weakening";
	else if (dayMaster.element.overcoming().value === targetElementValue) trgKey = "overcoming";
	else if (dayMaster.element.counteracting().value === targetElementValue) trgKey = "counteracting";
	else trgKey = "sibling";
	return TenGod.create(TEN_GOD_RELATIONS[trgKey][isNotSame], { lang });
};
/** 月份数转地支序号（从 0 开始） */
const month2BranchValue = (month) => {
	return (month + 1) % 12;
};
/** 地支序号转月份数 (1~12) */
const branchValue2month = (branchValue) => {
	return (12 + branchValue - 1) % 12;
};
/**
* 长生十二宫起点偏移（按日干索引: 甲乙丙丁戊己庚辛壬癸）
* 阳干顺行，阴干逆行
*/
const LIFE_STAGE_OFFSET = [
	1,
	6,
	10,
	9,
	10,
	9,
	7,
	0,
	4,
	3
];
/** 计算长生十二宫索引（地势）: 0=長生 1=沐浴 ... 11=養 */
const computeLifeStageIndex = (dayStemValue, branchValue) => {
	let index = LIFE_STAGE_OFFSET[dayStemValue] + (dayStemValue % 2 === 0 ? branchValue : -branchValue);
	if (index >= 12) index -= 12;
	if (index < 0) index += 12;
	return index;
};
//#endregion
//#region src/natal/god-base.ts
var GodBase = class {
	key;
	_config = { lang: _GlobalConfig.lang };
	constructor(godKey, config) {
		this.key = godKey;
		if (config) this._config = Object.assign({}, this._config, config);
	}
	get name() {
		return trans(`gods.${this.key}`, this._config.lang);
	}
	toString() {
		return this.name;
	}
};
//#endregion
//#region src/natal/ten-god.ts
/** 十神 */
var TenGod = class TenGod extends GodBase {
	static godkeysSet = new Set(TEN_GOD_LIST);
	static instances = /* @__PURE__ */ new Map();
	static create(godKey, config) {
		const instMapKey = `${godKey}:${config?.lang || _GlobalConfig.lang}`;
		if (TenGod.instances.has(instMapKey)) return TenGod.instances.get(instMapKey);
		const inst = new TenGod(godKey, config);
		TenGod.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(godKey, config) {
		if (godKey !== "日主" && !TenGod.godkeysSet.has(godKey)) throw new Error(`錯誤的十神key:${godKey}`);
		super(godKey, config);
	}
	get name() {
		return trans(`tenGod.${this.key}`, this._config.lang);
	}
	/** 单字简称（如 正官→官）；locale 未提供对应条目时回退 key（「日主」即如此） */
	get shortName() {
		return trans(`tenGodShort.${this.key}`, this._config.lang);
	}
};
//#endregion
//#region src/natal/data/god-rules.ts
const godDict = {
	天乙貴人: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				[1, 7],
				[0, 8],
				[11, 9],
				[11, 9],
				[1, 7],
				[0, 8],
				[1, 7],
				[2, 6],
				[3, 5]
			]
		}]
	},
	文昌貴人: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				5,
				6,
				8,
				9,
				8,
				9,
				11,
				0,
				2,
				3
			]
		}]
	},
	國印貴人: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				10,
				11,
				1,
				2,
				1,
				2,
				4,
				5,
				7,
				8
			]
		}]
	},
	太極貴人: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV >> 1, bV],
			rule: [
				[0, 6],
				[3, 9],
				[
					4,
					10,
					1,
					7
				],
				[2, 11],
				[5, 8]
			]
		}]
	},
	金輿: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "branch",
			rule: [
				4,
				5,
				7,
				8,
				7,
				8,
				10,
				11,
				1,
				2
			]
		}]
	},
	綠神: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "branch",
			rule: [
				2,
				3,
				5,
				6,
				5,
				6,
				8,
				9,
				11,
				0
			]
		}]
	},
	垣城: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "branch",
			rule: [
				11,
				6,
				2,
				9,
				2,
				9,
				5,
				0,
				8,
				3
			]
		}]
	},
	羊刃: {
		luckLevel: -1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "branch",
			rule: [
				3,
				2,
				6,
				5,
				6,
				5,
				9,
				8,
				0,
				11
			]
		}]
	},
	天官: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year:hour"],
			findBy: "branch",
			rule: [
				7,
				4,
				5,
				9,
				10,
				3,
				11,
				8,
				2,
				8
			]
		}]
	},
	天福: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "sb",
			rule: [
				57,
				56,
				59,
				48,
				51,
				50,
				53,
				42,
				[25, 55],
				[4, 34]
			]
		}]
	},
	辭館: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "sb",
			rule: [
				26,
				27,
				41,
				54,
				53,
				6,
				8,
				9,
				12
			]
		}]
	},
	墓煞: {
		luckLevel: -1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "sb",
			rule: [
				[16, 46],
				[37, 7],
				[28, 58],
				[49, 19],
				[40, 10],
				[1, 31],
				[52, 22],
				[13, 43],
				[4, 34],
				[25, 55]
			]
		}]
	},
	時墓: {
		luckLevel: -1,
		rules: [{
			startBy: "stem",
			startPillar: ["day"],
			findBy: "sb",
			rule: [
				[55, 7],
				[34, 46],
				null,
				null,
				null,
				null,
				[1, 13],
				[40, 52],
				null,
				null
			]
		}]
	},
	天廚貴人: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				5,
				6,
				5,
				6,
				8,
				9,
				11,
				0,
				2,
				3
			]
		}]
	},
	天德: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "s,b",
			rule: [
				"b5",
				"s6",
				"s3",
				"b8",
				"s8",
				"s7",
				"b11",
				"s0",
				"s9",
				"b2",
				"s2",
				"s1"
			]
		}]
	},
	天德合: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "s,b",
			rule: [
				"b8",
				"s1",
				"s8",
				"b5",
				"s3",
				"s2",
				"b2",
				"s5",
				"s4",
				"b11",
				"s7",
				"s6"
			]
		}]
	},
	天醫: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "branch",
			rule: [
				11,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10
			]
		}]
	},
	太白星: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 3],
			rule: [
				5,
				1,
				9
			]
		}]
	},
	隔角: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["month:hour"],
			findBy: "branch",
			rule: [
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				0,
				1
			]
		}]
	},
	喪門: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				0,
				1
			]
		}]
	},
	吊客: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				10,
				11,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9
			]
		}]
	},
	勾煞: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			ruleParams: ["year.stem", "gender"],
			rule: (yaarStem, gender) => {
				if ((yaarStem.value + gender) % 2 === 1) return [
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					0,
					1,
					2
				];
				else return [
					9,
					10,
					11,
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8
				];
			}
		}]
	},
	絞煞: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			rule: (yaarStem, gender) => {
				if ((yaarStem + gender) % 2 === 1) return [
					9,
					10,
					11,
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8
				];
				else return [
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					0,
					1,
					2
				];
			}
		}]
	},
	元辰: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			ruleParams: ["year.stem", "gender"],
			rule: (yaarStem, gender) => {
				if ((yaarStem.value + gender) % 2 === 1) return [
					7,
					8,
					9,
					10,
					11,
					0,
					1,
					2,
					3,
					4,
					5,
					6
				];
				else return [
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					0,
					1,
					2,
					3,
					4
				];
			}
		}]
	},
	孤辰: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				2,
				2,
				5,
				5,
				5,
				8,
				8,
				8,
				11,
				11,
				11,
				2
			]
		}]
	},
	寡宿: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				10,
				10,
				1,
				1,
				1,
				4,
				4,
				4,
				7,
				7,
				7,
				10
			]
		}]
	},
	天羅: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				11,
				10
			]
		}, {
			startBy: "takeSoundElement",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				null,
				[10, 11],
				null,
				null,
				null
			]
		}]
	},
	地網: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				null,
				null,
				null,
				null,
				5,
				4,
				null,
				null,
				null,
				null,
				null,
				null
			]
		}, {
			startBy: "takeSoundElement",
			startPillar: ["year"],
			findBy: "branch",
			rule: [
				null,
				null,
				[4, 5],
				null,
				[4, 5]
			]
		}]
	},
	月德: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "stem",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				8,
				6,
				2,
				0
			]
		}]
	},
	月德合: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "stem",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				3,
				1,
				7,
				5
			]
		}]
	},
	德: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "stem",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				[0, 1],
				[2, 3],
				[
					4,
					5,
					8,
					9
				],
				[6, 7]
			]
		}]
	},
	秀: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["month"],
			findBy: "stem",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				[
					2,
					7,
					0,
					5
				],
				[1, 6],
				[4, 9],
				[3, 8]
			]
		}]
	},
	華蓋: {
		luckLevel: 0,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				4,
				1,
				10,
				7
			]
		}]
	},
	將星: {
		luckLevel: 1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				0,
				9,
				6,
				3
			]
		}]
	},
	驛馬: {
		luckLevel: 0,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				2,
				11,
				8,
				5
			]
		}]
	},
	桃花: {
		luckLevel: 0,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				9,
				6,
				3,
				0
			]
		}]
	},
	劫煞: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				5,
				2,
				11,
				8
			]
		}]
	},
	亡神: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				11,
				8,
				5,
				2
			]
		}]
	},
	災煞: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["year", "day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				6,
				3,
				0,
				9
			]
		}]
	},
	六厄: {
		luckLevel: -1,
		rules: [{
			startBy: "branch",
			startPillar: ["day"],
			findBy: "branch",
			sbFormatter: (sV, bV) => [sV, bV % 4],
			rule: [
				3,
				0,
				9,
				6
			]
		}]
	},
	日貴: {
		luckLevel: 1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				33,
				23,
				29,
				39
			]
		}]
	},
	魁罡貴人: {
		luckLevel: 1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				16,
				28,
				34,
				46
			]
		}]
	},
	日德: {
		luckLevel: 1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				50,
				52,
				4,
				16,
				58
			]
		}]
	},
	陰陽差錯: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				12,
				13,
				14,
				27,
				28,
				29,
				42,
				43,
				44,
				57,
				58,
				59
			]
		}]
	},
	陰陽煞: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [12, 54]
		}]
	},
	九醜: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				24,
				51,
				48,
				18,
				51,
				15,
				27,
				21,
				45,
				57
			]
		}]
	},
	天赦: {
		luckLevel: 1,
		rules: [{
			startBy: "season",
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				14,
				30,
				44,
				0
			]
		}]
	},
	四廢: {
		luckLevel: -1,
		rules: [{
			startBy: "season",
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				[56, 57],
				[48, 59],
				[50, 51],
				[53, 42]
			]
		}]
	},
	天地轉煞: {
		luckLevel: -1,
		rules: [{
			startBy: "season",
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				[51, 27],
				[42, 54],
				[57, 9],
				[12, 48]
			]
		}]
	},
	金神: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day", "null:hour"],
			findBy: "sb",
			rule: [
				1,
				5,
				9
			]
		}]
	},
	孤鸞: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day", "null:hour"],
			startAO: "and",
			findBy: "sb",
			rule: [
				50,
				41,
				42,
				53,
				54,
				44,
				47,
				48
			]
		}]
	},
	八專: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day", "null:hour"],
			findBy: "sb",
			rule: [
				50,
				51,
				43,
				34,
				55,
				56,
				57,
				49
			]
		}]
	},
	十惡大敗: {
		luckLevel: -1,
		rules: [{
			startBy: null,
			startPillar: ["null:day"],
			findBy: "sb",
			rule: [
				8,
				16,
				17,
				23,
				25,
				32,
				34,
				40,
				41,
				59
			]
		}]
	},
	學堂: {
		luckLevel: 1,
		rules: [{
			startBy: "stem",
			startPillar: ["year", "day"],
			findBy: "branch",
			rule: [
				11,
				11,
				2,
				2,
				8,
				8,
				5,
				8,
				8
			]
		}]
	},
	帝座: {
		luckLevel: 1,
		rules: [{
			startBy: "takeSoundElement",
			startPillar: ["hour"],
			findBy: "branch",
			rule: [
				3,
				6,
				6,
				9,
				0
			]
		}]
	},
	截路空亡: {
		luckLevel: -1,
		rules: [{
			startBy: "sb",
			startPillar: ["day:hour"],
			findBy: "stem",
			startMapping: [[
				10,
				21,
				32,
				43,
				15,
				26,
				37,
				48
			]],
			rule: [[8, 9]]
		}, {
			startBy: "sb",
			startPillar: ["day:hour"],
			findBy: "sb",
			startMapping: [[54, 59], [4, 9]],
			rule: [[48, 49], [58, 59]]
		}]
	}
};
const godKeys = Object.keys(godDict);
const godKeysSet = new Set(godKeys);
//#endregion
//#region src/natal/natal-god.ts
/** 取得八字神煞吉凶等级 */
const getGodLuckLevel = (godKey) => {
	if (!godKeysSet.has(godKey)) throw new Error(`Error NatalGod key: ${godKey}`);
	return godDict[godKey].luckLevel;
};
/** 八字神煞 */
var NatalGod = class NatalGod extends GodBase {
	luckLevel = 0;
	static godkeysSet = godKeysSet;
	static instances = /* @__PURE__ */ new Map();
	static create(godKey, config) {
		const instMapKey = `${godKey}:${config?.lang || _GlobalConfig.lang}`;
		if (NatalGod.instances.has(instMapKey)) return NatalGod.instances.get(instMapKey);
		const inst = new NatalGod(godKey, config);
		NatalGod.instances.set(instMapKey, inst);
		return inst;
	}
	constructor(godKey, config) {
		if (!godKeysSet.has(godKey)) throw new Error(`錯誤的八字神煞key:${godKey}`);
		super(godKey, config);
		this.luckLevel = getGodLuckLevel(godKey);
	}
};
//#endregion
//#region src/natal/pillar.ts
/** 柱（四柱之一，含十神/神煞/纳音/地势） */
var Pillar = class extends CacheClass {
	_sb;
	_dayMaster;
	_cate;
	_lang = _GlobalConfig.lang;
	gods = [];
	constructor(data) {
		super();
		this._sb = data.sb;
		this._cate = data.cate;
		this._dayMaster = data.dayMaster;
		if (data.lang) this._lang = data.lang;
	}
	_pushGods(gods) {
		this.gods.push(...gods);
	}
	get stem() {
		return this._sb.stem;
	}
	get branch() {
		return this._sb.branch;
	}
	get value() {
		return this._sb.value;
	}
	get name() {
		return this._sb.name;
	}
	/** 纳音 */
	get takeSound() {
		return this._sb.takeSound;
	}
	/** 纳音五行 */
	get takeSoundElement() {
		return this._sb.takeSoundElement;
	}
	/** 天干十神（日柱返回「日主」） */
	get stemTenGod() {
		return this._cached("pillar:stemTenGod", () => {
			if (this._cate === "day") return TenGod.create("日主", { lang: this._lang });
			return computeTenGodByStem(this._dayMaster, this.stem, this._lang);
		});
	}
	/** 地支藏干十神 */
	get branchTenGod() {
		return this._cached("pillar:branchTenGod", () => {
			return this.branch.hiddenStems.map((item) => {
				return computeTenGodByStem(this._dayMaster, item, this._lang);
			});
		});
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this._sb.voidBranches;
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this._sb.decade;
	}
	/** 地势（长生十二宫）索引: 0=長生 ... 11=養 */
	get lifeStageIndex() {
		return computeLifeStageIndex(this._dayMaster.value, this.branch.value);
	}
	/** 地势（长生十二宫）名 */
	get lifeStage() {
		return _GlobalConfig.locales[this._lang].lifeStage12[this.lifeStageIndex];
	}
	valueOf() {
		return this._sb.valueOf();
	}
	toString() {
		return this._sb.toString();
	}
};
//#endregion
//#region src/natal/natal-gods.ts
const ymdhList = [
	"year",
	"month",
	"day",
	"hour"
];
/** 检查某神煞在四柱的匹配结果 */
const checkNatalGod = (chart, godKey) => {
	if (!godKeysSet.has(godKey)) throw new Error(`Error NatalGod key: ${godKey}`);
	const { luckLevel, rules } = godDict[godKey];
	const allRes = [
		[],
		[],
		[],
		[]
	];
	let hasTrue = false;
	for (const rule of rules) {
		const { res, isHasTrue } = checkRuleItem(chart, rule);
		if (rules.length === 1) return {
			luckLevel,
			res,
			isHasTrue
		};
		for (let i = 0; i < allRes.length; i++) allRes[i].push(...res[i]);
		hasTrue = hasTrue || isHasTrue;
	}
	return {
		luckLevel,
		res: allRes,
		isHasTrue: hasTrue
	};
};
const checkRuleItem = (chart, ruleItem) => {
	const { startPillar, startAO } = ruleItem;
	const isAnd = startAO === "and";
	const res = [
		[],
		[],
		[],
		[]
	];
	const resTemp = [];
	let isAllTrue = true;
	let isHasTrue = false;
	for (const sp of startPillar) {
		const [spRes, isSpAllTrue, isSpHasTrue] = checkPerStartPillar(chart, ruleItem, sp);
		resTemp.push([spRes, isSpAllTrue]);
		isAllTrue = isAllTrue && isSpAllTrue;
		isHasTrue = isHasTrue || isSpHasTrue;
	}
	for (let i = 0; i < resTemp.length; i++) {
		const [spRes] = resTemp[i];
		const startP = startPillar[i].split(":")[0];
		if (isAnd && !isAllTrue) break;
		for (let j = 0; j < 4; j++) if (spRes[ymdhList[j]]) res[j].push(startP);
	}
	return {
		res,
		isAllTrue,
		isHasTrue
	};
};
const checkPerStartPillar = (chart, ruleItem, sp) => {
	const { startBy, startMapping, findBy, sbFormatter, ruleParams, rule } = ruleItem;
	const spSplit = sp.split(":");
	const startP = spSplit[0];
	const endPs = spSplit[1] ? [spSplit[1]] : ymdhList;
	const resDict = {
		year: false,
		month: false,
		day: false,
		hour: false
	};
	let ruleRes;
	if (typeof rule === "function") ruleRes = rule(...getRuleParams(chart, ruleParams));
	else ruleRes = rule;
	if (startP === "null") {
		const ruleSet = new Set(ruleRes);
		return getPillarCheckRes(chart, endPs, findBy, ruleSet);
	} else {
		const startPO = chart[startP];
		let startValue;
		if (startBy === "takeSoundElement") startValue = startPO.takeSoundElement.valueOf();
		else if (startBy === "sb") startValue = startPO.value;
		else if (startBy === "stem" || startBy === "branch") {
			let [sv, bv] = [startPO.stem.value, startPO.branch.value];
			if (typeof sbFormatter === "function") [sv, bv] = sbFormatter(sv, bv);
			startValue = startBy === "stem" ? sv : bv;
		} else throw new Error(`Error value RuleItem.startBy: ${startBy}`);
		if (startMapping) startValue = useStartMappingValue(startValue, startMapping);
		const ruleHit = ruleRes[startValue];
		if (ruleHit === null) return [
			resDict,
			false,
			false
		];
		const ruleSet = Array.isArray(ruleHit) ? new Set(ruleHit) : /* @__PURE__ */ new Set([ruleHit]);
		return getPillarCheckRes(chart, endPs, findBy, ruleSet);
	}
};
const useStartMappingValue = (startValue, startMapping) => {
	for (let i = 0; i < startMapping.length; i++) {
		const mapItem = startMapping[i];
		if (typeof mapItem === "number") {
			if (startValue === mapItem) return i;
		} else if (mapItem.includes(startValue)) return i;
	}
	return startValue;
};
const getRuleParams = (chart, ruleParams) => {
	if (ruleParams === null || ruleParams === void 0) return [];
	return ruleParams.map((item) => getObjectProperties(chart, item));
};
const getObjectProperties = (obj, propsString) => {
	const props = propsString.split(".");
	let res = obj;
	while (props.length > 0) {
		const curr = props.shift();
		if (curr === void 0 || res[curr] === void 0) return void 0;
		res = res[curr];
	}
	return res;
};
const getEndTarget = (endPO, findBy) => {
	let target;
	if (findBy === "s,b") target = [`s${endPO.stem.value}`, `b${endPO.branch.value}`];
	else if (findBy === "sb") target = endPO.value;
	else if (findBy === "stem") target = endPO.stem.value;
	else if (findBy === "branch") target = endPO.branch.value;
	else throw new Error(`Error godDict prop: findBy ${findBy}`);
	return target;
};
const getPillarCheckRes = (chart, endPs, findBy, ruleSet) => {
	const resDict = {
		year: false,
		month: false,
		day: false,
		hour: false
	};
	let allTrue = true;
	let hasTrue = false;
	for (const endP of endPs) {
		const endPO = chart[endP];
		const target = getEndTarget(endPO, findBy);
		let isHit = false;
		if (Array.isArray(target)) {
			for (const t of target) if (ruleSet.has(t)) {
				resDict[endP] = true;
				isHit = true;
				break;
			}
		} else if (ruleSet.has(target)) {
			isHit = true;
			resDict[endP] = true;
		}
		if (!isHit) allTrue = false;
		else hasTrue = true;
	}
	return [
		resDict,
		allTrue,
		hasTrue
	];
};
/** 计算四柱全部神煞 */
const createAllNatalGods = (chart) => {
	const allGodsRes = {
		year: [],
		month: [],
		day: [],
		hour: []
	};
	const godSet = {
		year: /* @__PURE__ */ new Set(),
		month: /* @__PURE__ */ new Set(),
		day: /* @__PURE__ */ new Set(),
		hour: /* @__PURE__ */ new Set()
	};
	for (const key of godKeys) {
		const { res } = checkNatalGod(chart, key);
		for (let i = 0; i < 4; i++) {
			const ymdh = ymdhList[i];
			if (res[i].length > 0 && !godSet[ymdh].has(key)) {
				const god = new NatalGod(key, { lang: chart._lang });
				godSet[ymdh].add(key);
				allGodsRes[ymdh].push(god);
			}
		}
	}
	return allGodsRes;
};
//#endregion
//#region src/fortune/daily-fortune.ts
/** 流日（流月节气区间内每个公历日的实际日柱） */
var DailyFortune = class {
	/** 月内第几日（0 起） */
	index;
	/** 公历日（当日 00:00） */
	date;
	_monthlyFortune;
	constructor(monthlyFortune, index, date) {
		this._monthlyFortune = monthlyFortune;
		this.index = index;
		this.date = date;
	}
	/** 语言（继承自所属流月） */
	get lang() {
		return this._monthlyFortune.lang;
	}
	get stemBranch() {
		const noon = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), 12, 0, 0);
		const lang = this.lang;
		return StemBranch.create(FourPillars.computeDayPillar(noon, { lang }).value, { lang });
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this.stemBranch.decade;
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this.stemBranch.voidBranches;
	}
};
//#endregion
//#region src/fortune/monthly-fortune.ts
/** 流月（流年天干五虎遁起寅月） */
var MonthlyFortune = class {
	index;
	_yearlyFortune;
	constructor(yearlyFortune, index) {
		this._yearlyFortune = yearlyFortune;
		this.index = index;
	}
	/** 语言（继承自所属流年） */
	get lang() {
		return this._yearlyFortune.lang;
	}
	/** 月名（正、二 ... 冬、腊，随 locale） */
	get monthName() {
		return _GlobalConfig.locales[this.lang].lunarMonthsAlias[this.index].replace(/月$/, "");
	}
	get stemBranch() {
		const yearStemValue = this._yearlyFortune.stemBranch.stem.value;
		const stem = (this.index + [
			2,
			4,
			6,
			8,
			0
		][yearStemValue % 5]) % 10;
		const branch = (this.index + 2) % 12;
		return StemBranch.create(computeStemBranchValue(stem, branch), { lang: this.lang });
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this.stemBranch.decade;
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this.stemBranch.voidBranches;
	}
	/** 本流月的节气月区间 [起, 止)（精确时刻） */
	getRange() {
		const year = this._yearlyFortune.year;
		const termOfMonth = (i) => i <= 10 ? SolarTerm.dateOf(year, 2 + 2 * i) : SolarTerm.dateOf(year + 1, 2 * i - 22);
		return [termOfMonth(this.index), termOfMonth(this.index + 1)];
	}
	/**
	* 流日列表：本流月节气区间内每个公历日的实际日柱。
	* 节交接当日归属新月（以交接时刻所在的公历日为月首日）。
	*/
	getDailyFortunes() {
		const [start, end] = this.getRange();
		const lastDayNum = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
		const res = [];
		for (let i = 0;; i++) {
			const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
			if (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) >= lastDayNum) break;
			res.push(new DailyFortune(this, i, d));
		}
		return res;
	}
};
//#endregion
//#region src/fortune/yearly-fortune.ts
/** 流年（以立春换岁的年干支） */
var YearlyFortune = class {
	year;
	age;
	index;
	_majorFortune;
	constructor(majorFortune, index) {
		this.year = majorFortune.startYear + index;
		this.age = majorFortune.startAge + index;
		this.index = index;
		this._majorFortune = majorFortune;
	}
	/** 语言（继承自所属大运） */
	get lang() {
		return this._majorFortune.lang;
	}
	get stemBranch() {
		const birthSolarYear = this._majorFortune._fortune._birthDate.getFullYear();
		let offset = FourPillars.computeYearPillar(birthSolarYear).value + this.index;
		if (this._majorFortune.index > 0) offset += this._majorFortune.startAge - 1;
		offset %= 60;
		return StemBranch.create(offset, { lang: this.lang });
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this.stemBranch.decade;
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this.stemBranch.voidBranches;
	}
	/** 流月列表（12 个月，寅月起） */
	getMonthlyFortunes() {
		const l = [];
		for (let i = 0; i < 12; i++) l.push(new MonthlyFortune(this, i));
		return l;
	}
};
//#endregion
//#region src/fortune/minor-fortune.ts
/** 小运（时柱顺/逆推） */
var MinorFortune = class {
	year;
	age;
	index;
	_majorFortune;
	_forward;
	constructor(majorFortune, index, forward) {
		this.year = majorFortune.startYear + index;
		this.age = majorFortune.startAge + index;
		this.index = index;
		this._majorFortune = majorFortune;
		this._forward = forward;
	}
	/** 语言（继承自所属大运） */
	get lang() {
		return this._majorFortune.lang;
	}
	get stemBranch() {
		let offset = this._majorFortune._fortune.natalChart.hour.value;
		let add = this.index + 1;
		if (this._majorFortune.index > 0) add += this._majorFortune.startAge - 1;
		offset += this._forward ? add : -add;
		return StemBranch.create((offset % 60 + 60) % 60, { lang: this.lang });
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this.stemBranch.decade;
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this.stemBranch.voidBranches;
	}
};
//#endregion
//#region src/fortune/major-fortune.ts
/** 大运（十年一步；index=0 为起运前区间，无干支） */
var MajorFortune = class {
	index;
	startYear;
	endYear;
	startAge;
	endAge;
	_fortune;
	constructor(fortune, index) {
		const birthYear = fortune._birthDate.getFullYear();
		const year = fortune.getStartDate().getFullYear();
		let startYear = birthYear;
		let startAge = 1;
		let endYear = year - 1;
		let endAge = year - birthYear;
		if (index >= 1) {
			startYear = year + (index - 1) * 10;
			startAge = startYear - birthYear + 1;
			endYear = startYear + 9;
			endAge = startAge + 9;
		}
		this.startYear = startYear;
		this.endYear = endYear;
		this.startAge = startAge;
		this.endAge = endAge;
		this.index = index;
		this._fortune = fortune;
	}
	/** 语言（继承自起运对象） */
	get lang() {
		return this._fortune.lang;
	}
	/** 大运干支（月柱顺/逆推；index=0 起运前无干支返回 null） */
	get stemBranch() {
		if (this.index < 1) return null;
		let offset = this._fortune.natalChart.month.value;
		offset += this._fortune.forward ? this.index : -this.index;
		return StemBranch.create((offset % 60 + 60) % 60, { lang: this.lang });
	}
	/** 旬（以旬首干支表示） */
	get decade() {
		return this.stemBranch ? this.stemBranch.decade : null;
	}
	/** 旬空（空亡） */
	get voidBranches() {
		return this.stemBranch ? this.stemBranch.voidBranches : null;
	}
	/** 流年列表（index=0 时数量为起运前年数） */
	getYearlyFortunes(n = 10) {
		if (this.index < 1) n = this.endYear - this.startYear + 1;
		const l = [];
		for (let i = 0; i < n; i++) l.push(new YearlyFortune(this, i));
		return l;
	}
	/** 小运列表（index=0 时数量为起运前年数） */
	getMinorFortunes(n = 10) {
		if (this.index < 1) n = this.endYear - this.startYear + 1;
		const l = [];
		for (let i = 0; i < n; i++) l.push(new MinorFortune(this, i, this._fortune.forward));
		return l;
	}
};
//#endregion
//#region src/fortune/fortune.ts
/** 民用日历日差（忽略时分秒） */
function civilDayDiff(from, to) {
	const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
	return Math.round((b.valueOf() - a.valueOf()) / 864e5);
}
/** a - b 的分钟差（日差按民用日历，分钟按当日时分，秒忽略；与 lunar-typescript 一致） */
function subtractMinute(a, b) {
	let days = civilDayDiff(b, a);
	let m = a.getHours() * 60 + a.getMinutes() - (b.getHours() * 60 + b.getMinutes());
	if (m < 0) {
		m += 1440;
		days--;
	}
	m += days * 1440;
	return m;
}
/** 时辰序号（precision='day' 起运专用: 23 点按亥时 11 计） */
function timeBranchIndex(d) {
	const h = d.getHours();
	if (h === 23) return 11;
	if (h === 0) return 0;
	return h + 1 >> 1;
}
function isLeapYear(y) {
	return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;
}
/** 加年（2 月末日在平年钳制到 28，与 lunar-typescript Solar.nextYear 一致） */
function addYears(d, years) {
	const y = d.getFullYear() + years;
	const m = d.getMonth();
	let day = d.getDate();
	if (m === 1 && day > 28 && !isLeapYear(y)) day = 28;
	return new Date(y, m, day, d.getHours(), d.getMinutes(), d.getSeconds());
}
/** 加月（日钳制到目标月长，与 lunar-typescript Solar.nextMonth 一致） */
function addMonths(d, months) {
	const total = d.getFullYear() * 12 + d.getMonth() + months;
	const y = Math.floor(total / 12);
	const m = total - y * 12;
	const maxDay = new Date(y, m + 1, 0).getDate();
	const day = Math.min(d.getDate(), maxDay);
	return new Date(y, m, day, d.getHours(), d.getMinutes(), d.getSeconds());
}
/**
* 起运（大运入口）
* 阳男阴女顺排，阴男阳女逆排；顺排数至将来节，逆排数至过去节
*/
var Fortune = class {
	natalChart;
	/** 语言（继承自命盘） */
	lang;
	/** 1=男(乾造) 0=女(坤造) */
	gender;
	/** 是否顺排 */
	forward;
	/** 起运: 出生后经过的年数 */
	startYear;
	/** 起运: 年数外加经过的月数 */
	startMonth;
	/** 起运: 月数外加经过的天数 */
	startDay;
	/** 起运: 天数外加经过的小时数（仅 precision='minute'） */
	startHour;
	_birthDate;
	constructor(natalChart, options) {
		const minutePrecision = options?.precision === "minute";
		this.natalChart = natalChart;
		this.lang = natalChart._lang;
		this.gender = natalChart.gender;
		const yang = natalChart.year.stem.value % 2 === 0;
		const man = this.gender === 1;
		const forward = yang && man || !yang && !man;
		this.forward = forward;
		const birth = natalChart.lunaris.toDate();
		this._birthDate = birth;
		const [, prevNodeDate] = SolarTerm.prevNode(birth);
		const [, nextNodeDate] = SolarTerm.nextNode(birth);
		const start = forward ? birth : prevNodeDate;
		const end = forward ? nextNodeDate : birth;
		let hour = 0;
		if (minutePrecision) {
			let minutes = subtractMinute(end, start);
			const year = Math.floor(minutes / 4320);
			minutes -= year * 4320;
			const month = Math.floor(minutes / 360);
			minutes -= month * 360;
			const day = Math.floor(minutes / 12);
			minutes -= day * 12;
			hour = minutes * 2;
			this.startYear = year;
			this.startMonth = month;
			this.startDay = day;
		} else {
			let hourDiff = timeBranchIndex(end) - timeBranchIndex(start);
			let dayDiff = civilDayDiff(start, end);
			if (hourDiff < 0) {
				hourDiff += 12;
				dayDiff--;
			}
			const monthDiff = Math.floor(hourDiff * 10 / 30);
			const month = dayDiff * 4 + monthDiff;
			this.startDay = hourDiff * 10 - monthDiff * 30;
			const year = Math.floor(month / 12);
			this.startMonth = month - year * 12;
			this.startYear = year;
		}
		this.startHour = hour;
	}
	/** 起运的公历时刻（出生时刻 + 起运年月日时） */
	getStartDate() {
		let d = addYears(this._birthDate, this.startYear);
		d = addMonths(d, this.startMonth);
		d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + this.startDay, d.getHours(), d.getMinutes(), d.getSeconds());
		if (this.startHour !== 0) d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + this.startHour, d.getMinutes(), d.getSeconds());
		return d;
	}
	/** 取得大运列表；[0] 为起运前区间 */
	getMajorFortunes(n = 10) {
		const l = [];
		for (let i = 0; i < n; i++) l.push(new MajorFortune(this, i));
		return l;
	}
};
//#endregion
//#region src/natal/natal-chart.ts
/** 八字扩展（十神、神煞、三宫、大运） */
var NatalChart = class extends CacheClass {
	_lang = _GlobalConfig.lang;
	dayMaster;
	fourPillars;
	lunaris;
	gender;
	year;
	month;
	day;
	hour;
	gods;
	constructor(lunaris, gender) {
		super();
		this.gender = gender;
		this.lunaris = lunaris;
		this.dayMaster = lunaris.fourPillars.dayMaster;
		this.fourPillars = lunaris.fourPillars;
		this._lang = lunaris.getConfig().lang;
		const createPillar = (ymdh) => {
			return new Pillar({
				sb: this.fourPillars[ymdh],
				dayMaster: this.dayMaster,
				cate: ymdh,
				lang: this.fourPillars.getConfig().lang
			});
		};
		this.year = createPillar("year");
		this.month = createPillar("month");
		this.day = createPillar("day");
		this.hour = createPillar("hour");
		this.gods = createAllNatalGods(this);
		for (const ymdh of [
			"year",
			"month",
			"day",
			"hour"
		]) this[ymdh]._pushGods(this.gods[ymdh]);
	}
	get list() {
		return [
			this.year,
			this.month,
			this.day,
			this.hour
		];
	}
	/** 乾造/坤造 */
	get genderName() {
		return trans(`gender.${this.gender}`, this._lang);
	}
	/** 空亡（日柱旬空） */
	get voidBranches() {
		return this.day.voidBranches;
	}
	/**
	* 胎元：生月干进一干，生月支进三支
	*/
	embryo() {
		return this._cached("natalChart:embryo", () => {
			return new StemBranch((this.month.stem.value + 1) % 10, (this.month.branch.value + 3) % 12, { lang: this.fourPillars.getConfig().lang });
		});
	}
	/**
	* 胎息：日柱天干五合、地支六合
	*/
	embryoBreath() {
		return this._cached("natalChart:embryoBreath", () => {
			return new StemBranch((this.day.stem.value + 5) % 10, (13 - this.day.branch.value) % 12, { lang: this.fourPillars.getConfig().lang });
		});
	}
	/**
	* 命宫
	* 口诀: 若问命主何命宫，子起正月逆查行。生月支上起生时，顺查至卯知命宫。
	* 数字计法: 寅为1，m = 月+时, m > 14 则 26-m, 否则 14-m，即为命宫月份数
	*/
	ownSign() {
		return this._cached("natalChart:ownSign", () => {
			const newMonth = branchValue2month(this.month.branch.value) + branchValue2month(this.hour.branch.value);
			const b = month2BranchValue(newMonth > 14 ? 26 - newMonth : 14 - newMonth);
			return new StemBranch(computeRatStem(this.year.stem.value, b) % 10, b, { lang: this.fourPillars.getConfig().lang });
		});
	}
	/**
	* 身宫
	* 口诀: 身宫口诀记心中，子起正月顺查行。生月支上起生时，逆推至酉知身宫。
	* 数学计算法: m = (月份数 + 时辰序号) % 12
	*/
	bodySign() {
		return this._cached("natalChart:bodySign", () => {
			const b = month2BranchValue((branchValue2month(this.month.branch.value) + (this.hour.branch.value + 1)) % 12);
			return new StemBranch(computeRatStem(this.year.stem.value, b) % 10, b, { lang: this.fourPillars.getConfig().lang });
		});
	}
	/** 起运（大运/小运/流年/流月/流日入口） */
	fortune(options) {
		return this._cached(`natalChart:fortune:${options?.precision ?? "day"}`, () => new Fortune(this, options));
	}
	toString() {
		return `${this.genderName}: ${this.year} ${this.month} ${this.day} ${this.hour}`;
	}
};
//#endregion
//#region src/almanac/data/day-month-acts.ts
const DAY_MONTH_ACTS = [
	[
		{
			good: [
				"交易",
				"进人口",
				"祭祀",
				"沐浴",
				"捕捉",
				"入殓",
				"除服",
				"成服",
				"安葬",
				"谢土",
				"启钻",
				"修坟"
			],
			bad: [
				"斋醮",
				"入宅",
				"修造",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"祈福",
				"斋醮",
				"订盟",
				"纳采",
				"裁衣",
				"拆卸",
				"起基",
				"竖柱",
				"上梁",
				"安床",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"挂匾",
				"求嗣",
				"出行",
				"合帐",
				"造畜稠"
			],
			bad: [
				"开仓",
				"嫁娶",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"出行",
				"开市",
				"交易",
				"立券",
				"动土",
				"纳财",
				"掘井",
				"会亲友"
			],
			bad: [
				"入宅",
				"安葬",
				"伐木",
				"作梁",
				"纳畜",
				"造畜稠",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"捕捉",
				"栽种"
			],
			bad: [
				"嫁娶",
				"入宅",
				"移徙",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"安床",
				"解除",
				"修造",
				"安葬"
			],
			bad: [
				"纳采",
				"问名",
				"订盟",
				"嫁娶",
				"入宅",
				"开仓",
				"出火",
				"动土",
				"破土",
				"纳畜",
				"伐木"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"动土",
				"上梁",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["斋醮"]
		},
		{
			good: [
				"祭祀",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"移徙",
				"入宅",
				"开仓",
				"出货财"
			]
		},
		{
			good: [
				"纳采",
				"祭祀",
				"祈福",
				"解除",
				"动土",
				"破土",
				"安葬"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"出火",
				"出行",
				"开光",
				"解除",
				"拆卸",
				"修造",
				"进人口",
				"安香",
				"交易",
				"立券",
				"入宅",
				"移徙",
				"安床",
				"动土",
				"破土",
				"谢土",
				"安葬",
				"入殓",
				"除服",
				"成服"
			],
			bad: [
				"斋醮",
				"开市",
				"开仓",
				"作灶",
				"造船"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"修饰垣墙",
				"平治道涂",
				"入殓",
				"移柩"
			],
			bad: [
				"嫁娶",
				"入宅",
				"上梁",
				"安门"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"会亲友",
				"沐浴",
				"理发",
				"裁衣",
				"冠笄",
				"安床",
				"除服",
				"成服",
				"启钻",
				"移柩",
				"安葬",
				"开生坟"
			],
			bad: [
				"开市",
				"入宅",
				"出行",
				"嫁娶",
				"修坟",
				"祈福",
				"动土",
				"安门",
				"谢土",
				"上梁"
			]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"嫁娶",
				"沐浴",
				"修造",
				"动土",
				"祈福",
				"开光",
				"塑绘",
				"出行",
				"订盟",
				"纳采",
				"裁衣",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"赴任",
				"竖柱",
				"上梁",
				"纳财",
				"扫舍",
				"栽种",
				"纳畜",
				"伐木"
			],
			bad: [
				"入宅",
				"作灶",
				"安床",
				"开仓"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"造车器",
				"祭祀",
				"祈福",
				"造庙",
				"安香",
				"出火",
				"出行",
				"归宁",
				"入学",
				"入宅",
				"交易",
				"立券",
				"求医",
				"治病",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"盖屋",
				"起基",
				"安门"
			],
			bad: [
				"斋醮",
				"伐木",
				"作梁",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"纳畜",
				"入殓",
				"启钻",
				"谢土",
				"除服",
				"成服"
			],
			bad: [
				"栽种",
				"开光",
				"出行",
				"针灸",
				"嫁娶",
				"入宅",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"塑绘",
				"酬神",
				"斋醮",
				"订盟",
				"纳采",
				"嫁娶",
				"裁衣",
				"动土",
				"起基",
				"出火",
				"拆卸",
				"移徙",
				"入宅",
				"安香",
				"修造",
				"竖柱",
				"上梁",
				"纳畜",
				"牧养",
				"祈福",
				"求嗣",
				"解除",
				"伐木",
				"定磉",
				"盖屋",
				"安门"
			],
			bad: ["栽种", "安葬"]
		},
		{
			good: [
				"祭祀",
				"修门",
				"取渔",
				"纳财",
				"纳畜",
				"馀事勿取"
			],
			bad: ["嫁娶", "入宅"]
		},
		{
			good: [
				"纳采",
				"祭祀",
				"祈福",
				"开市",
				"求医",
				"治病",
				"动土",
				"纳畜"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"塑绘",
				"开光",
				"出行",
				"修造",
				"动土",
				"造畜稠",
				"安床",
				"放水",
				"掘井",
				"开池",
				"开厕",
				"结网",
				"破土"
			],
			bad: ["出火", "入宅"]
		},
		{
			good: [
				"祭祀",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"破土",
				"安葬",
				"移柩",
				"入殓",
				"祭祀",
				"捕捉",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"开市",
				"交易"
			]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"纳采",
				"嫁娶",
				"开光",
				"塑绘",
				"斋醮",
				"安香",
				"开市",
				"立券",
				"除服",
				"成服",
				"入殓",
				"移柩",
				"安葬",
				"赴任",
				"进人口",
				"出行",
				"裁衣",
				"修造",
				"动土",
				"上梁",
				"经络",
				"交易"
			],
			bad: ["入宅", "伐木"]
		},
		{
			good: [
				"解除",
				"祭祀",
				"修饰垣墙",
				"平治道涂",
				"造畜稠",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"交易",
				"入宅",
				"入学",
				"安葬"
			]
		},
		{
			good: [
				"理发",
				"会亲友",
				"补垣",
				"塞穴",
				"结网"
			],
			bad: [
				"嫁娶",
				"入宅",
				"安门",
				"移徙"
			]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"开市",
				"交易",
				"立券",
				"出行",
				"会亲友",
				"安机械",
				"竖柱",
				"上梁",
				"平治道涂",
				"伐木",
				"拆卸",
				"盖屋",
				"起基",
				"安床",
				"安门",
				"解除",
				"安葬",
				"启钻",
				"除服",
				"成服",
				"修坟",
				"立碑",
				"移柩",
				"入殓"
			],
			bad: [
				"嫁娶",
				"动土",
				"破土",
				"祈福",
				"出火",
				"入宅"
			]
		},
		{
			good: [
				"沐浴",
				"解除",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"拆卸",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"扫舍",
				"修坟",
				"伐木",
				"纳财",
				"交易",
				"立券"
			],
			bad: [
				"作灶",
				"祭祀",
				"上梁",
				"出行"
			]
		},
		{
			good: [
				"开光",
				"解除",
				"伐木",
				"竖柱",
				"上梁",
				"交易",
				"立券",
				"纳畜",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"入宅",
				"出行",
				"移徙",
				"祭祀",
				"嫁娶",
				"动土",
				"破土",
				"作灶"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"冠笄",
				"拆卸",
				"修造",
				"动土",
				"安床",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"破土",
				"启钻",
				"造仓"
			],
			bad: [
				"作灶",
				"开光",
				"嫁娶",
				"开市",
				"入宅"
			]
		},
		{
			good: [
				"安香",
				"出火",
				"纳采",
				"订盟",
				"嫁娶",
				"开市",
				"立券",
				"交易",
				"挂匾",
				"开光",
				"出行",
				"解除",
				"安床",
				"栽种",
				"置产",
				"拆卸",
				"修造",
				"动土"
			],
			bad: [
				"作灶",
				"安葬",
				"祭祀",
				"入殓"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"出行",
				"移徙",
				"入宅"
			],
			bad: [
				"动土",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"开光",
				"解除",
				"拆卸",
				"动土",
				"安床",
				"修造",
				"上梁",
				"置产",
				"栽种",
				"破土",
				"安葬"
			],
			bad: [
				"作灶",
				"出火",
				"祭祀",
				"嫁娶",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"开市",
				"出行",
				"动土",
				"上梁",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["祭祀", "祈福"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"治病",
				"馀事勿取"
			],
			bad: [
				"祈福",
				"纳采",
				"订盟",
				"嫁娶",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"会亲友",
				"拆卸",
				"起基",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"沐浴",
				"捕捉",
				"开光",
				"塑绘"
			],
			bad: [
				"作灶",
				"入宅",
				"嫁娶"
			]
		},
		{
			good: [
				"入殓",
				"破土",
				"启钻",
				"安葬",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: [
				"开市",
				"入宅",
				"祭祀",
				"置产",
				"补垣",
				"塞穴"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"订盟",
				"纳采",
				"裁衣",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"安床",
				"移徙",
				"入宅",
				"安香",
				"除服",
				"成服",
				"入殓",
				"移柩",
				"安葬",
				"谢土",
				"赴任",
				"会亲友",
				"进人口",
				"出行",
				"竖柱",
				"上梁",
				"经络",
				"开市",
				"交易",
				"立券",
				"纳财",
				"开仓"
			],
			bad: [
				"作灶",
				"治病",
				"伐木",
				"作梁"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"平治道涂",
				"除服",
				"成服",
				"安葬",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"纳采",
				"订盟",
				"掘井"
			]
		},
		{
			good: [
				"出行",
				"嫁娶",
				"订盟",
				"纳采",
				"入殓",
				"安床",
				"启钻",
				"安葬",
				"祭祀",
				"裁衣",
				"会亲友",
				"进人口"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"嫁娶",
				"出行",
				"解除",
				"伐木",
				"拆卸",
				"进人口",
				"安床",
				"动土",
				"起基",
				"上梁",
				"栽种",
				"纳畜",
				"破土",
				"谢土",
				"启钻",
				"安葬"
			],
			bad: [
				"移徙",
				"入宅",
				"出火",
				"作灶",
				"掘井"
			]
		},
		{
			good: [
				"祈福",
				"开光",
				"塑绘",
				"酬神",
				"订盟",
				"纳采",
				"裁衣",
				"安床",
				"开市",
				"立券",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"立碑",
				"赴任",
				"会亲友",
				"出行",
				"交易",
				"竖柱"
			],
			bad: [
				"作灶",
				"掘井",
				"动土",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"修造",
				"动土",
				"合帐",
				"造畜稠",
				"安床",
				"移徙",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"开生坟",
				"合寿木",
				"补垣",
				"塞穴"
			],
			bad: [
				"入宅",
				"作灶",
				"理发",
				"开光",
				"安门"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"动土",
				"破土",
				"交易",
				"立券"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"祭祀",
				"结网",
				"馀事勿取"
			],
			bad: [
				"入宅",
				"出行",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"开市",
				"出行",
				"动土",
				"上梁",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["赴任"]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"祭祀",
				"祈福",
				"求嗣",
				"安香",
				"出火",
				"解除",
				"伐木",
				"入宅",
				"移徙",
				"安床",
				"开市",
				"交易",
				"立券",
				"栽种",
				"出行",
				"安葬"
			],
			bad: [
				"掘井",
				"理发",
				"作灶",
				"动土",
				"破土",
				"开池"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"移徙",
				"入宅",
				"出行",
				"栽种"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"安床",
				"纳畜",
				"入殓",
				"破土"
			],
			bad: [
				"入宅",
				"移徙",
				"掘井",
				"理发",
				"伐木",
				"交易",
				"开市",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"订盟",
				"纳采",
				"裁衣",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"安床",
				"移徙",
				"入宅",
				"安香",
				"入殓",
				"移柩",
				"安葬",
				"谢土",
				"赴任",
				"进人口",
				"会亲友"
			],
			bad: ["作灶", "治病"]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"开光",
				"安香",
				"出火",
				"出行",
				"会亲友",
				"安机械",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"盖屋",
				"起基",
				"定磉",
				"安床",
				"安门",
				"拆卸",
				"移徙",
				"造桥",
				"造船",
				"安葬",
				"破土",
				"入殓"
			],
			bad: [
				"开市",
				"造庙",
				"置产",
				"掘井"
			]
		},
		{
			good: [
				"修饰垣墙",
				"平治道涂",
				"入殓",
				"移柩",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅",
				"开光"
			]
		},
		{
			good: [
				"会亲友",
				"冠笄",
				"安床",
				"安机械",
				"祭祀",
				"祈福",
				"求嗣",
				"经络"
			],
			bad: [
				"嫁娶",
				"开市",
				"动土",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"扫舍",
				"塞穴"
			],
			bad: [
				"栽种",
				"作灶",
				"安葬",
				"嫁娶"
			]
		},
		{
			good: [
				"祭祀",
				"修饰垣墙",
				"馀事勿取"
			],
			bad: [
				"开光",
				"修造",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"嫁娶",
				"裁衣",
				"祭祀",
				"出行",
				"安床",
				"作灶",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["赴任", "捕捉"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"冠笄",
				"造车器",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"出行",
				"解除",
				"伐木",
				"出火",
				"入宅",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"安床",
				"栽种",
				"破土"
			],
			bad: [
				"行丧",
				"置产",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"纳财",
				"捕捉"
			],
			bad: ["开市", "破土"]
		},
		{
			good: [
				"安机械",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"普渡",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"开市",
				"交易",
				"立券",
				"移徙",
				"安床",
				"栽种",
				"上梁",
				"纳畜",
				"破土",
				"移柩",
				"安葬"
			],
			bad: [
				"入宅",
				"嫁娶",
				"掘井",
				"牧养"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"出行",
				"解除",
				"订盟",
				"嫁娶",
				"拆卸",
				"起基",
				"安床",
				"入宅",
				"开市",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"谢土",
				"挂匾",
				"开柱眼",
				"交易"
			],
			bad: [
				"造桥",
				"冠笄",
				"盖屋",
				"掘井"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"上梁",
				"出行",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"嫁娶",
				"安床",
				"进人口",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"立碑"
			],
			bad: [
				"开市",
				"交易",
				"破土",
				"作灶"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"进人口",
				"会亲友",
				"伐木",
				"作梁",
				"开柱眼",
				"安床",
				"掘井",
				"捕捉",
				"畋猎"
			],
			bad: [
				"开生坟",
				"破土",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"会亲友",
				"纳采",
				"进人口",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"祭祀",
				"开光",
				"塑绘",
				"祈福",
				"斋醮",
				"嫁娶",
				"安床",
				"移徙",
				"入宅",
				"安香",
				"纳畜"
			],
			bad: [
				"出行",
				"治病",
				"安葬",
				"开市"
			]
		},
		{
			good: [
				"作灶",
				"解除",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"祭祀",
				"祈福",
				"安葬",
				"安门"
			]
		},
		{
			good: [
				"开光",
				"塑绘",
				"裁衣",
				"冠笄",
				"伐木",
				"拆卸",
				"竖柱",
				"上梁",
				"开仓",
				"会亲友",
				"安机械",
				"造仓",
				"盖屋",
				"交易",
				"解除",
				"开市",
				"立券",
				"纳财"
			],
			bad: [
				"出行",
				"嫁娶",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"出火",
				"移徙",
				"入宅",
				"竖柱",
				"上梁",
				"会亲友",
				"盖屋",
				"起基",
				"治病",
				"安门",
				"造车器",
				"掘井",
				"开池"
			],
			bad: [
				"纳采",
				"出行",
				"修坟",
				"安葬",
				"开市",
				"立券",
				"作灶"
			]
		},
		{
			good: [
				"塞穴",
				"结网",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"合帐",
				"裁衣",
				"冠笄",
				"伐木",
				"上梁",
				"出火",
				"拆卸",
				"移徙",
				"修造",
				"动土",
				"安门",
				"纳财",
				"筑堤",
				"栽种",
				"塞穴"
			],
			bad: [
				"安床",
				"祈福",
				"出行",
				"安葬",
				"行丧",
				"开光"
			]
		},
		{
			good: [
				"嫁娶",
				"开市",
				"立券",
				"祭祀",
				"祈福",
				"动土",
				"移徙",
				"入宅"
			],
			bad: ["造庙", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"裁衣",
				"冠笄",
				"经络",
				"修造",
				"进人口",
				"安床",
				"动土",
				"竖柱",
				"上梁",
				"移徙",
				"交易",
				"立券",
				"栽种",
				"会亲友"
			],
			bad: [
				"行丧",
				"安葬",
				"出行",
				"作梁",
				"纳畜",
				"伐木",
				"造桥"
			]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"进人口",
				"动土",
				"上梁",
				"开光",
				"塑绘",
				"冠笄",
				"拆卸",
				"起基",
				"安床",
				"开市",
				"立券",
				"赴任",
				"经络"
			],
			bad: ["定磉", "安葬"]
		},
		{
			good: [
				"祭祀",
				"求嗣",
				"冠笄",
				"进人口",
				"会亲友",
				"安门",
				"安床",
				"经络",
				"纳财",
				"牧养",
				"畋猎",
				"放水",
				"割蜜"
			],
			bad: [
				"祈福",
				"斋醮",
				"纳采",
				"订盟",
				"嫁娶",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		}
	],
	[
		{
			good: [
				"破屋",
				"坏垣",
				"治病",
				"馀事勿取"
			],
			bad: ["移徙", "入宅"]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"出行",
				"订盟",
				"纳采",
				"沐浴",
				"修造",
				"动土",
				"祈福",
				"斋醮",
				"嫁娶",
				"拆卸",
				"安床",
				"入殓",
				"移柩",
				"安葬",
				"谢土",
				"赴任",
				"裁衣",
				"竖柱",
				"上梁",
				"伐木",
				"捕捉",
				"栽种",
				"破土",
				"安门"
			],
			bad: [
				"盖屋",
				"开市",
				"作灶",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"冠笄",
				"修饰垣墙",
				"置产"
			],
			bad: [
				"经络",
				"探病",
				"盖屋",
				"作灶",
				"动土"
			]
		},
		{
			good: [
				"冠笄",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"平治道涂",
				"修饰垣墙"
			],
			bad: [
				"盖屋",
				"作灶",
				"治病",
				"探病"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"纳采",
				"嫁娶",
				"开市",
				"出行",
				"会亲友",
				"安床",
				"结网",
				"除服",
				"成服",
				"启钻",
				"安葬",
				"移柩"
			],
			bad: [
				"祈福",
				"入宅",
				"盖屋",
				"动土",
				"破土",
				"探病"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"出行",
				"祭祀",
				"祈福",
				"斋醮",
				"动土",
				"上梁",
				"破土",
				"安葬"
			],
			bad: ["移徙", "入宅"]
		},
		{
			good: [
				"出行",
				"教牛马",
				"割蜜",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"盖屋",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"补垣",
				"塞穴",
				"结网",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"启钻",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"开光",
				"祭祀",
				"出行",
				"理发",
				"动土",
				"安床",
				"放水",
				"开渠",
				"栽种",
				"进人口"
			],
			bad: [
				"入宅",
				"上梁",
				"入殓",
				"盖屋",
				"探病",
				"作灶",
				"安门",
				"安葬",
				"纳畜",
				"伐木"
			]
		},
		{
			good: [
				"祭祀",
				"裁衣",
				"冠笄",
				"嫁娶",
				"纳婿",
				"会亲友",
				"除服",
				"成服",
				"移柩",
				"捕捉",
				"进人口",
				"入殓"
			],
			bad: [
				"移徙",
				"入宅",
				"作灶"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"祭祀",
				"祈福",
				"开光",
				"造车器",
				"出行",
				"入宅",
				"移徙",
				"安床",
				"安门",
				"拆卸",
				"修造",
				"动土",
				"栽种",
				"安葬",
				"破土",
				"启钻",
				"除服",
				"成服",
				"入殓",
				"立碑"
			],
			bad: [
				"探病",
				"纳畜",
				"伐木",
				"起基",
				"作梁",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"祈福",
				"开光",
				"塑绘",
				"斋醮",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"拆卸",
				"修造",
				"动土",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安床",
				"赴任",
				"出行",
				"移徙",
				"竖柱",
				"上梁",
				"伐木",
				"栽种",
				"破土",
				"安葬",
				"纳畜"
			],
			bad: ["盖屋", "治病"]
		}
	],
	[
		{
			good: [
				"安床",
				"架马",
				"祭祀",
				"塑绘",
				"开光",
				"出行",
				"理发",
				"伐木",
				"作梁",
				"开柱眼",
				"开厕",
				"畋猎",
				"破土",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"修坟",
				"立碑"
			],
			bad: [
				"作灶",
				"安门",
				"造桥",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"嫁娶",
				"祭祀",
				"祈福",
				"出行",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"安葬",
				"破土"
			],
			bad: ["开市", "斋醮"]
		},
		{
			good: [
				"祭祀",
				"嫁娶",
				"祈福",
				"纳采",
				"裁衣",
				"合帐",
				"安床",
				"入宅",
				"安香",
				"入殓",
				"移柩",
				"安葬",
				"谢土",
				"修造",
				"安碓磑",
				"求嗣",
				"会亲友",
				"挂匾",
				"交易",
				"立券",
				"纳财",
				"造仓",
				"放水"
			],
			bad: ["栽种", "伐木"]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"安床",
				"入宅",
				"安碓磑",
				"栽种"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"安床",
				"作灶",
				"造畜稠"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"出火",
				"拆卸",
				"修造",
				"进人口",
				"入宅",
				"移徙",
				"动土",
				"安床",
				"纳畜",
				"栽种",
				"纳财",
				"交易",
				"立券",
				"挂匾",
				"造畜稠"
			],
			bad: [
				"安葬",
				"开生坟",
				"行丧"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"出行",
				"祭祀",
				"祈福",
				"解除",
				"移徙",
				"入宅"
			],
			bad: ["动土", "安葬"]
		},
		{
			good: [
				"祭祀",
				"出行",
				"作梁",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"安床",
				"补垣",
				"塞穴",
				"入殓",
				"破土",
				"安葬",
				"移柩",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"入宅",
				"斋醮",
				"开光",
				"针灸",
				"掘井"
			]
		},
		{
			good: ["诸事不宜"],
			bad: [
				"入殓",
				"安葬",
				"开市",
				"交易"
			]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"移徙",
				"会亲友",
				"纳财",
				"理发",
				"捕捉"
			],
			bad: [
				"嫁娶",
				"开市",
				"开池",
				"开厕",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"安机械",
				"安床",
				"造畜稠",
				"入殓",
				"移柩",
				"启钻",
				"安葬",
				"谢土",
				"除服",
				"成服",
				"会亲友",
				"竖柱",
				"上梁",
				"经络",
				"开市",
				"交易",
				"立券",
				"纳财",
				"纳畜",
				"筑堤"
			],
			bad: [
				"嫁娶",
				"入宅",
				"治病",
				"赴任"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"入宅",
				"移徙",
				"纳畜",
				"入殓",
				"破土",
				"修坟",
				"立碑"
			],
			bad: [
				"伐木",
				"作梁",
				"动土",
				"安床",
				"栽种",
				"造桥"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"出行",
				"订盟",
				"纳采",
				"除服",
				"成服",
				"嫁娶",
				"纳婿",
				"入殓",
				"移柩",
				"启钻",
				"安葬",
				"立碑"
			],
			bad: ["入宅", "安床"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"理发",
				"扫舍",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"起基",
				"移柩",
				"安葬",
				"谢土",
				"沐浴",
				"扫舍",
				"开柱眼",
				"伐木",
				"出火"
			],
			bad: [
				"安床",
				"开市",
				"立券",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"沐浴",
				"纳畜",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"移徙",
				"入宅",
				"嫁娶",
				"出行",
				"安床"
			]
		},
		{
			good: [
				"沐浴",
				"平治道涂",
				"扫舍",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"安机械",
				"祭祀",
				"祈福",
				"求嗣",
				"沐浴",
				"解除",
				"纳采",
				"开市",
				"修造",
				"竖柱",
				"上梁",
				"开柱眼",
				"安碓磑",
				"归岫",
				"补垣",
				"塞穴",
				"拆卸",
				"放水",
				"出火",
				"扫舍",
				"开生坟",
				"合寿木",
				"安葬",
				"谢土",
				"启钻",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"安床",
				"作灶",
				"动土",
				"破土",
				"造船"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"斋醮",
				"治病",
				"破土",
				"安葬"
			],
			bad: ["开市", "入宅"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"解除",
				"竖柱",
				"入宅",
				"移徙",
				"纳财",
				"上梁",
				"纳畜",
				"入殓",
				"安葬",
				"启钻"
			],
			bad: [
				"栽种",
				"掘井",
				"动土",
				"安床",
				"破土",
				"置产"
			]
		},
		{
			good: [
				"祭祀",
				"裁衣",
				"冠笄",
				"嫁娶",
				"安机械",
				"拆卸",
				"动土",
				"起基",
				"移徙",
				"入宅",
				"入殓",
				"启钻",
				"安葬",
				"造仓",
				"经络"
			],
			bad: [
				"安床",
				"开光",
				"开市",
				"交易"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"出行",
				"嫁娶",
				"求医",
				"治病",
				"动土",
				"破土",
				"入学",
				"起基",
				"扫舍",
				"竖柱",
				"上梁",
				"开仓",
				"出货财",
				"置产",
				"栽种",
				"牧养",
				"开生坟",
				"谢土",
				"立碑"
			],
			bad: [
				"安门",
				"安床",
				"裁衣",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"沐浴",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		}
	],
	[
		{
			good: [
				"祭祀",
				"沐浴",
				"理发",
				"纳财",
				"进人口",
				"栽种",
				"扫舍",
				"捕捉",
				"畋猎",
				"结网"
			],
			bad: [
				"会亲友",
				"安葬",
				"入宅",
				"移徙",
				"安床",
				"开市",
				"行丧",
				"出火",
				"作灶",
				"安门"
			]
		},
		{
			good: [
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"立碑",
				"馀事勿取"
			],
			bad: ["破土", "伐木"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"安香",
				"出火",
				"修造",
				"出行",
				"开市",
				"移徙",
				"入宅",
				"动土",
				"安葬",
				"破土"
			],
			bad: [
				"安床",
				"作灶",
				"造船",
				"会亲友"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"求医",
				"治病"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"出行",
				"起基",
				"盖屋",
				"定磉",
				"安门",
				"入殓",
				"安葬"
			],
			bad: [
				"嫁娶",
				"开市",
				"纳财",
				"出火"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"动土",
				"上梁",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"安门",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"栽种",
				"破土",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"理发",
				"整手足甲",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"开市",
				"入宅",
				"出行",
				"修造",
				"词讼"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"开市",
				"安床",
				"入殓",
				"启钻",
				"安葬"
			],
			bad: [
				"祈福",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"解除",
				"祭祀",
				"祈福",
				"求嗣",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"安床",
				"纳畜",
				"盖屋",
				"合脊",
				"起基",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"出火",
				"嫁娶",
				"开光",
				"进人口",
				"出行",
				"词讼",
				"开市",
				"入宅",
				"移徙",
				"赴任"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"成服",
				"除服",
				"沐浴",
				"入殓"
			],
			bad: [
				"动土",
				"冠笄",
				"移徙",
				"入宅",
				"开市",
				"竖柱",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"裁衣",
				"冠笄",
				"合帐",
				"祭祀",
				"出行",
				"安床",
				"移徙",
				"塞穴",
				"入殓",
				"破土",
				"移柩",
				"安葬"
			],
			bad: [
				"开市",
				"栽种",
				"置产",
				"词讼",
				"安门",
				"掘井",
				"开光"
			]
		},
		{
			good: ["诸事不宜"],
			bad: ["无"]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"塑绘",
				"解除",
				"拆卸",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"安门",
				"置产",
				"开池",
				"掘井",
				"纳畜",
				"安床",
				"栽种",
				"造畜稠",
				"破土",
				"移柩",
				"立碑"
			],
			bad: [
				"嫁娶",
				"开市",
				"出火",
				"进人口",
				"入殓",
				"赴任",
				"入宅",
				"移徙",
				"出行",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"塑绘",
				"开光",
				"除服",
				"成服",
				"入殓",
				"作灶",
				"嫁娶",
				"捕捉",
				"畋猎",
				"纳财"
			],
			bad: [
				"开仓",
				"盖屋",
				"安葬",
				"安床"
			]
		},
		{
			good: [
				"塞穴",
				"结网",
				"取渔",
				"畋猎"
			],
			bad: [
				"嫁娶",
				"安门",
				"移徙",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"动土",
				"上梁",
				"订盟",
				"纳采",
				"嫁娶",
				"安机械",
				"拆卸",
				"安床",
				"入宅",
				"安香",
				"入殓",
				"移柩",
				"破土",
				"安葬",
				"立碑",
				"谢土",
				"赴任",
				"出行",
				"移徙",
				"祈福",
				"求嗣",
				"解除",
				"造仓",
				"进人口"
			],
			bad: ["开光", "出货财"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"求医",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"祈福",
				"斋醮",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"出行",
				"解除",
				"塑绘",
				"裁衣",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"上梁",
				"修造",
				"拆卸",
				"架马",
				"入宅",
				"伐木",
				"动土",
				"出火",
				"开柱眼"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"立券",
				"移徙",
				"入宅",
				"动土",
				"破土",
				"安葬"
			],
			bad: [
				"开光",
				"作灶",
				"盖屋",
				"架马",
				"开仓"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"裁衣",
				"结网",
				"冠笄",
				"沐浴"
			],
			bad: [
				"开仓",
				"出货财",
				"置产",
				"安葬",
				"动土",
				"破土",
				"掘井",
				"栽种"
			]
		},
		{
			good: [
				"沐浴",
				"理发",
				"会亲友",
				"塑绘",
				"开光",
				"栽种",
				"牧养",
				"嫁娶",
				"经络",
				"补垣",
				"塞穴"
			],
			bad: [
				"开市",
				"入宅",
				"动土",
				"破土",
				"安葬",
				"作灶",
				"上梁",
				"安床",
				"开仓",
				"祈福"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"赴任",
				"出行",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"造车器",
				"出行",
				"修造",
				"上梁",
				"盖屋",
				"安门",
				"安床",
				"造畜稠",
				"教牛马"
			],
			bad: [
				"出货财",
				"开仓",
				"动土",
				"破土",
				"安葬",
				"行丧",
				"伐木",
				"开渠",
				"栽种"
			]
		},
		{
			good: [
				"祈福",
				"斋醮",
				"出行",
				"订盟",
				"纳采",
				"入殓",
				"移柩",
				"破土",
				"安葬",
				"立碑",
				"结网"
			],
			bad: ["入宅", "作灶"]
		}
	],
	[
		{
			good: [
				"入宅",
				"移徙",
				"出行",
				"进人口",
				"修造",
				"动土",
				"起基",
				"上梁",
				"安门",
				"造仓",
				"补垣",
				"塞穴",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"开市",
				"安床",
				"栽种",
				"安葬",
				"祈福",
				"开光",
				"掘井"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"沐浴",
				"裁衣",
				"祈福",
				"斋醮",
				"订盟",
				"纳采",
				"嫁娶",
				"安机械",
				"开市",
				"立券",
				"安碓磑",
				"纳畜"
			],
			bad: [
				"栽种",
				"入殓",
				"安葬"
			]
		},
		{
			good: [
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"会亲友",
				"修造",
				"动土",
				"移徙",
				"入宅"
			],
			bad: [
				"嫁娶",
				"开市",
				"安葬",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"塑绘",
				"纳采",
				"裁衣",
				"拆卸",
				"安床",
				"起基",
				"动土",
				"竖柱",
				"上梁",
				"移徙",
				"入宅",
				"安香",
				"开市",
				"立券",
				"挂匾",
				"沐浴",
				"出行",
				"求嗣",
				"安门"
			],
			bad: [
				"嫁娶",
				"栽种",
				"伐木",
				"安葬"
			]
		},
		{
			good: [
				"沐浴",
				"捕捉",
				"畋猎",
				"结网",
				"取渔"
			],
			bad: [
				"祭祀",
				"嫁娶",
				"入宅",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"冠笄",
				"祭祀",
				"祈福",
				"斋醮",
				"出行",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"安香",
				"出火",
				"拆卸",
				"盖屋",
				"起基",
				"竖柱",
				"上梁",
				"定磉",
				"安门",
				"开池"
			],
			bad: [
				"嫁娶",
				"开市",
				"合寿木",
				"安葬"
			]
		},
		{
			good: [
				"入宅",
				"移徙",
				"安床",
				"开光",
				"祈福",
				"求嗣",
				"进人口",
				"开市",
				"交易",
				"立券",
				"出火",
				"拆卸",
				"修造",
				"动土"
			],
			bad: [
				"嫁娶",
				"破土",
				"置产",
				"栽种",
				"安葬",
				"修坟",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"理发",
				"作灶",
				"沐浴",
				"修饰垣墙",
				"平治道涂"
			],
			bad: [
				"嫁娶",
				"栽种",
				"祈福",
				"造桥",
				"安葬",
				"安门",
				"伐木",
				"作梁"
			]
		},
		{
			good: ["诸事不宜"],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"开光",
				"出行",
				"解除",
				"伐木",
				"作梁",
				"出火",
				"拆卸",
				"入宅",
				"移徙",
				"安床",
				"修造",
				"造畜稠",
				"扫舍"
			],
			bad: [
				"造庙",
				"嫁娶",
				"掘井",
				"栽种",
				"造桥",
				"作灶",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"出行",
				"冠笄",
				"进人口",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"动土",
				"安葬",
				"作灶"
			]
		}
	],
	[
		{
			good: ["造畜稠", "教牛马"],
			bad: [
				"入宅",
				"移徙",
				"分居",
				"作灶",
				"出火",
				"安香",
				"动土",
				"嫁娶",
				"掘井",
				"扫舍",
				"造桥"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"沐浴",
				"安床",
				"安机械",
				"造车器",
				"入殓",
				"移柩",
				"启钻",
				"安葬",
				"立碑",
				"合帐",
				"经络",
				"交易"
			],
			bad: [
				"作灶",
				"掘井",
				"嫁娶",
				"入宅"
			]
		},
		{
			good: [
				"纳采",
				"嫁娶",
				"祭祀",
				"祈福",
				"出行",
				"开市",
				"会亲友",
				"动土",
				"破土",
				"启钻"
			],
			bad: [
				"移徙",
				"入宅",
				"出火",
				"安门",
				"安葬"
			]
		},
		{
			good: [
				"裁衣",
				"合帐",
				"冠笄",
				"嫁娶",
				"纳婿",
				"安床",
				"入殓",
				"纳财"
			],
			bad: [
				"作灶",
				"开市",
				"安葬",
				"作梁"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"纳采",
				"订盟",
				"开光",
				"竖柱",
				"上梁",
				"开仓",
				"出货财",
				"盖屋",
				"起基",
				"定磉",
				"安门",
				"诸事不宜",
				"破土",
				"入殓",
				"启钻",
				"谢土"
			],
			bad: [
				"出火",
				"嫁娶",
				"开市"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"拆卸",
				"动土",
				"上梁",
				"出火",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"纳畜",
				"牧养",
				"竖柱",
				"安门",
				"修造",
				"解除",
				"会亲友"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"入宅",
				"嫁娶",
				"移徙"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"沐浴",
				"整手足甲",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"嫁娶",
				"入宅",
				"移徙",
				"作灶",
				"开市",
				"交易",
				"安门",
				"栽种"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"斋醮",
				"普渡",
				"移徙",
				"入宅",
				"出行",
				"安机械",
				"开光",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"盖屋",
				"起基",
				"定磉",
				"安门",
				"安葬",
				"破土"
			],
			bad: [
				"开市",
				"立券",
				"置产",
				"作灶",
				"造桥"
			]
		},
		{
			good: [
				"沐浴",
				"入殓",
				"移柩",
				"除服",
				"成服",
				"破土",
				"平治道涂"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅",
				"开市"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"开市",
				"交易",
				"立券",
				"会亲友",
				"纳畜",
				"牧养",
				"问名",
				"移徙",
				"解除",
				"开厕",
				"入学",
				"起基",
				"安床",
				"开仓",
				"出货财",
				"安葬",
				"启钻",
				"入殓",
				"除服",
				"成服"
			],
			bad: [
				"入宅",
				"上梁",
				"斋醮",
				"出火",
				"谢土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"嫁娶",
				"拆卸",
				"入宅",
				"安香",
				"入殓",
				"移柩",
				"理发",
				"安葬",
				"修坟",
				"谢土",
				"赴任",
				"移徙",
				"沐浴",
				"治病",
				"破土",
				"启钻",
				"整手足甲",
				"入学",
				"作梁"
			],
			bad: ["开市"]
		}
	],
	[
		{
			good: [
				"订盟",
				"纳采",
				"造车器",
				"祭祀",
				"祈福",
				"出行",
				"安香",
				"修造",
				"动土",
				"上梁",
				"开市",
				"交易",
				"立券",
				"移徙",
				"入宅",
				"会亲友",
				"安机械",
				"栽种",
				"纳畜",
				"盖屋",
				"起基",
				"安床",
				"造畜稠"
			],
			bad: [
				"破土",
				"安葬",
				"行丧",
				"开生坟"
			]
		},
		{
			good: [
				"解除",
				"扫舍",
				"祭祀",
				"教牛马",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"嫁娶",
				"动土",
				"开光",
				"盖屋",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"订盟",
				"纳采",
				"修造",
				"动土",
				"祈福",
				"塑绘",
				"斋醮",
				"沐浴",
				"拆卸",
				"起基",
				"入宅",
				"安香",
				"造庙",
				"移柩",
				"谢土",
				"除服",
				"成服",
				"入学",
				"习艺",
				"出行",
				"竖柱",
				"上梁",
				"掘井",
				"求嗣",
				"解除",
				"伐木"
			],
			bad: [
				"作灶",
				"安葬",
				"开市",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"捕捉",
				"解除",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"祭祀",
				"祈福",
				"开光",
				"伐木",
				"进人口",
				"安床",
				"拆卸",
				"修造",
				"动土",
				"栽种",
				"破土",
				"移柩",
				"安葬"
			],
			bad: [
				"入宅",
				"移徙",
				"理发",
				"出火",
				"嫁娶",
				"出行"
			]
		},
		{
			good: [
				"嫁娶",
				"安机械",
				"交易",
				"出行",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"塑绘",
				"开光",
				"合帐",
				"裁衣",
				"放水",
				"开池",
				"掘井"
			],
			bad: [
				"作灶",
				"理发",
				"造桥",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"普渡",
				"捕捉",
				"解除",
				"结网",
				"畋猎",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"开市",
				"交易",
				"入宅",
				"嫁娶"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"沐浴",
				"出火",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"开市",
				"交易",
				"立券",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"纳畜",
				"入殓",
				"安葬",
				"启钻",
				"除服",
				"成服"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["嫁娶", "开市"]
		},
		{
			good: ["诸事不宜"],
			bad: ["无"]
		}
	],
	[
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"安机械",
				"开光",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"盖屋",
				"起基",
				"造桥",
				"栽种",
				"纳畜",
				"造畜稠",
				"移柩",
				"入殓",
				"启钻",
				"修坟",
				"立碑",
				"安葬"
			],
			bad: [
				"祈福",
				"出火",
				"嫁娶",
				"入宅",
				"开市",
				"破土"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"开光",
				"解除",
				"伐木",
				"作梁",
				"出火",
				"入宅",
				"移徙",
				"安床",
				"拆卸",
				"动土",
				"上梁",
				"栽种",
				"纳畜",
				"安葬"
			],
			bad: [
				"嫁娶",
				"祭祀",
				"出行",
				"置产"
			]
		},
		{
			good: [
				"纳采",
				"会亲友",
				"竖柱",
				"上梁",
				"立券",
				"入殓",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"祭祀",
				"移徙",
				"入宅",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"安机械",
				"拆卸",
				"安床",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"修坟",
				"立碑",
				"经络",
				"交易",
				"立券",
				"纳财",
				"筑堤",
				"造仓",
				"补垣",
				"塞穴",
				"纳畜",
				"伐木",
				"架马"
			],
			bad: [
				"祭祀",
				"开光",
				"嫁娶",
				"入宅"
			]
		},
		{
			good: [
				"纳采",
				"嫁娶",
				"出行",
				"开市",
				"立券",
				"纳畜",
				"牧养",
				"出火",
				"移徙",
				"入宅"
			],
			bad: [
				"祈福",
				"动土",
				"破土",
				"安葬",
				"入殓"
			]
		},
		{
			good: [
				"结网",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"冠笄",
				"求医",
				"治病",
				"开市",
				"立券",
				"修造",
				"动土",
				"安机械",
				"破土",
				"安葬"
			],
			bad: [
				"斋醮",
				"祭祀",
				"移徙",
				"入宅",
				"上梁",
				"嫁娶"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"出行",
				"理发",
				"作梁",
				"出火",
				"拆卸",
				"修造",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"动土",
				"入宅",
				"移徙",
				"安床",
				"栽种"
			],
			bad: [
				"伐木",
				"祭祀",
				"纳畜"
			]
		},
		{
			good: [
				"沐浴",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["斋醮", "开市"]
		},
		{
			good: [
				"开光",
				"解除",
				"起基",
				"动土",
				"拆卸",
				"上梁",
				"立碑",
				"修坟",
				"安葬",
				"破土",
				"启钻",
				"移柩"
			],
			bad: [
				"嫁娶",
				"出行",
				"安床",
				"作灶",
				"祭祀",
				"入宅",
				"移徙",
				"出火",
				"进人口",
				"置产"
			]
		},
		{
			good: [
				"捕捉",
				"畋猎",
				"馀事勿取"
			],
			bad: [
				"开市",
				"交易",
				"祭祀",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"纳财",
				"开光",
				"出行",
				"入宅",
				"移徙",
				"安床",
				"纳畜",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"栽种",
				"破土",
				"置产",
				"祭祀",
				"嫁娶",
				"动土",
				"作灶",
				"祈福"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"平治道涂",
				"修坟",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: [
				"移徙",
				"入宅",
				"嫁娶",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"开池",
				"补垣",
				"嫁娶",
				"纳采",
				"纳畜",
				"取渔",
				"安床"
			],
			bad: [
				"修造",
				"上梁",
				"入宅",
				"祈福",
				"探病",
				"掘井",
				"动土",
				"安门",
				"安葬",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"出行",
				"开市",
				"立券",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: [
				"开光",
				"嫁娶",
				"作灶",
				"掘井",
				"纳畜"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"嫁娶",
				"冠笄",
				"安床",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"掘井",
				"动土",
				"作灶",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"冠笄",
				"作灶",
				"纳财",
				"交易"
			],
			bad: [
				"开光",
				"嫁娶",
				"掘井",
				"安葬",
				"安门",
				"探病"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"开市",
				"交易",
				"立券",
				"安床",
				"出行",
				"拆卸"
			],
			bad: [
				"纳畜",
				"入宅",
				"移徙",
				"安葬",
				"探病",
				"伐木",
				"上梁",
				"安门",
				"入殓",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"馀事勿取"
			],
			bad: [
				"开市",
				"安葬",
				"破土",
				"修坟",
				"掘井"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"出行",
				"祈福",
				"求嗣",
				"解除",
				"拆卸",
				"动土",
				"修造",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"纳畜",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"安香",
				"出火",
				"开市",
				"立券",
				"入宅",
				"挂匾",
				"造桥",
				"启钻",
				"安葬"
			],
			bad: [
				"动土",
				"破土",
				"嫁娶",
				"掘井",
				"安床"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"安香",
				"出火",
				"造庙",
				"移徙",
				"出行",
				"入宅",
				"起基",
				"竖柱",
				"上梁",
				"安床",
				"纳畜",
				"捕捉",
				"纳婿",
				"安葬"
			],
			bad: [
				"开市",
				"破土",
				"掘井",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"出火",
				"拆卸",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"动土",
				"修造",
				"纳畜",
				"入殓",
				"安葬",
				"立碑",
				"除服",
				"成服"
			],
			bad: ["无"]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"祈福",
				"求嗣",
				"雕刻",
				"开光",
				"安香",
				"出行",
				"入学",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"盖屋",
				"起基",
				"安门",
				"出火",
				"移徙",
				"入宅",
				"掘井",
				"造畜稠",
				"安葬",
				"破土",
				"除服",
				"成服"
			],
			bad: [
				"开市",
				"纳采",
				"订盟",
				"作灶",
				"造庙",
				"造船",
				"经络"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"会亲友",
				"求嗣",
				"理发",
				"冠笄",
				"结网",
				"捕捉",
				"开光"
			],
			bad: [
				"开市",
				"动土",
				"安葬",
				"破土"
			]
		},
		{
			good: ["塞穴", "诸事不宜"],
			bad: [
				"安门",
				"作灶",
				"安葬",
				"嫁娶"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"教牛马",
				"出行",
				"馀事勿取"
			],
			bad: [
				"动土",
				"破土",
				"行丧",
				"开光",
				"作梁",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"入宅",
				"移徙",
				"安床",
				"作灶",
				"塞穴",
				"栽种",
				"破土",
				"安葬"
			],
			bad: [
				"开光",
				"掘井",
				"开仓"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"安香",
				"解除",
				"移徙",
				"入宅",
				"会亲友",
				"求医",
				"治病",
				"动土",
				"破土",
				"开生坟",
				"合寿木"
			],
			bad: [
				"合帐",
				"上梁",
				"经络",
				"安葬",
				"入殓"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"纳财",
				"栽种",
				"纳畜",
				"进人口"
			],
			bad: [
				"安葬",
				"经络",
				"修坟",
				"破土",
				"开市",
				"安床",
				"启钻",
				"立碑"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"斋醮",
				"普渡",
				"移徙",
				"入宅",
				"动土",
				"治病",
				"开市",
				"交易",
				"立券",
				"开光",
				"修造",
				"造车器",
				"安香",
				"安床",
				"捕捉",
				"畋猎",
				"结网"
			],
			bad: [
				"纳采",
				"订盟",
				"经络",
				"行丧",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"嫁娶",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"开光",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"安床",
				"入宅",
				"移徙",
				"栽种",
				"伐木",
				"入殓",
				"破土",
				"除服",
				"成服"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["开市", "嫁娶"]
		},
		{
			good: [
				"开光",
				"解除",
				"拆卸",
				"修造",
				"动土",
				"安床",
				"纳畜",
				"安葬",
				"启钻",
				"入殓"
			],
			bad: [
				"嫁娶",
				"开市",
				"出火",
				"栽种",
				"破土",
				"入宅",
				"移徙",
				"安香",
				"分居",
				"掘井",
				"作灶"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"安香",
				"出火",
				"修造",
				"起基",
				"盖屋",
				"合脊",
				"安门",
				"安碓磑",
				"动土",
				"上梁",
				"移徙",
				"入宅"
			],
			bad: [
				"出行",
				"掘井",
				"破土",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"动土",
				"会亲友",
				"起基",
				"造仓",
				"纳畜",
				"牧养",
				"开厕",
				"进人口"
			],
			bad: [
				"掘井",
				"安葬",
				"栽种",
				"出行",
				"作灶",
				"开市",
				"入宅",
				"安门"
			]
		},
		{
			good: [
				"祭祀",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"祈福",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"开光",
				"塑绘",
				"求嗣",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"安机械",
				"作梁",
				"开柱眼",
				"安门",
				"安床",
				"造仓",
				"祭祀",
				"会亲友",
				"祈福",
				"经络",
				"纳财",
				"开市",
				"立券",
				"交易",
				"入学",
				"理发",
				"架马"
			],
			bad: [
				"出行",
				"斋醮",
				"安葬",
				"嫁娶"
			]
		},
		{
			good: [
				"沐浴",
				"斋醮",
				"解除",
				"求医",
				"治病",
				"会亲友",
				"造畜稠",
				"栽种",
				"理发",
				"扫舍"
			],
			bad: [
				"开市",
				"嫁娶",
				"移徙",
				"入宅",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"解除",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"修造",
				"动土",
				"作灶",
				"移徙",
				"入宅",
				"补垣",
				"塞穴",
				"纳畜",
				"牧养",
				"架马",
				"起基",
				"定磉",
				"开池",
				"造船"
			],
			bad: [
				"祈福",
				"开光",
				"掘井",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"开市",
				"牧养",
				"理发"
			],
			bad: [
				"嫁娶",
				"出行",
				"安葬",
				"入殓",
				"入宅",
				"作灶",
				"冠笄",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"作灶",
				"冠笄",
				"裁衣",
				"会亲友",
				"纳畜",
				"牧养",
				"安机械",
				"开市",
				"立券",
				"纳财",
				"安床"
			],
			bad: [
				"掘井",
				"出行",
				"破土",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"祭祀",
				"开光",
				"进人口",
				"入宅",
				"安床",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"栽种"
			],
			bad: [
				"嫁娶",
				"立碑",
				"出行",
				"伐木",
				"安葬",
				"行丧",
				"移徙",
				"纳畜"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"交易",
				"立券",
				"纳财",
				"栽种",
				"纳畜",
				"牧养"
			],
			bad: [
				"嫁娶",
				"开市",
				"入宅",
				"祈福",
				"安葬"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		}
	],
	[
		{
			good: [
				"祭祀",
				"沐浴",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅",
				"探病",
				"出行",
				"盖屋"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"入宅",
				"移徙",
				"安床",
				"修造",
				"动土",
				"进人口"
			],
			bad: [
				"掘井",
				"安葬",
				"栽种",
				"出行",
				"作灶",
				"开市",
				"安门"
			]
		},
		{
			good: [
				"祈福",
				"求嗣",
				"斋醮",
				"纳采",
				"嫁娶",
				"伐木",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"造庙",
				"安机械",
				"开市",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"破土",
				"谢土"
			],
			bad: [
				"置产",
				"盖屋",
				"合脊",
				"开光",
				"探病",
				"安门",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"嫁娶",
				"纳婿",
				"安葬"
			],
			bad: [
				"栽种",
				"盖屋",
				"作灶",
				"入宅"
			]
		},
		{
			good: [
				"求嗣",
				"出行",
				"解除",
				"订盟",
				"纳采",
				"嫁娶",
				"会亲友",
				"进人口",
				"安床",
				"开市",
				"交易",
				"纳畜",
				"牧养",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"祈福",
				"修造",
				"动土",
				"破土",
				"谢土"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"开光",
				"出行",
				"拆卸",
				"进人口",
				"入宅",
				"移柩",
				"动土",
				"安门",
				"上梁",
				"栽种",
				"破土",
				"修坟",
				"安葬"
			],
			bad: [
				"嫁娶",
				"安床",
				"探病",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"交易",
				"纳财"
			],
			bad: [
				"斋醮",
				"开渠",
				"上梁",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"破土",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"谢土",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"斋醮",
				"普渡",
				"解除",
				"出行",
				"会亲友",
				"开市",
				"纳财",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"开光",
				"开仓",
				"出货财",
				"纳畜",
				"牧养",
				"开池",
				"破土",
				"启钻"
			],
			bad: [
				"出火",
				"入宅",
				"盖屋",
				"安门",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"理发",
				"会亲友",
				"进人口",
				"嫁娶",
				"针灸",
				"入殓",
				"移柩"
			],
			bad: [
				"探病",
				"开渠",
				"安葬",
				"伐木",
				"作灶",
				"入宅"
			]
		},
		{
			good: [
				"造车器",
				"嫁娶",
				"订盟",
				"纳采",
				"会亲友",
				"祭祀",
				"出行",
				"开市",
				"立券",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: [
				"上梁",
				"开光",
				"盖屋",
				"架马",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"解除",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"纳财",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"纳畜"
			],
			bad: ["探病", "安葬"]
		}
	],
	[
		{
			good: [
				"冠笄",
				"纳财",
				"掘井",
				"开池",
				"出火",
				"安床",
				"交易",
				"立券",
				"畋猎",
				"结网",
				"理发",
				"放水"
			],
			bad: [
				"安门",
				"动土",
				"破土",
				"行丧",
				"安葬",
				"成服"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"入学",
				"习艺",
				"出行",
				"纳采",
				"订盟",
				"嫁娶",
				"会亲友",
				"进人口",
				"牧养",
				"捕捉",
				"入殓",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"开光",
				"开市",
				"入宅",
				"动土",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"订盟",
				"裁衣",
				"合帐",
				"安机械",
				"拆卸",
				"上梁",
				"安门",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"立碑",
				"开光",
				"塑绘",
				"入学",
				"出行",
				"起基",
				"定磉",
				"放水",
				"移徙",
				"入宅",
				"竖柱",
				"立券",
				"经络"
			],
			bad: ["伐木", "作梁"]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"安葬",
				"动土",
				"安床",
				"治病"
			]
		},
		{
			good: ["进人口", "会亲友"],
			bad: [
				"塞穴",
				"上梁",
				"动土",
				"伐木",
				"安葬",
				"词讼"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"冠笄",
				"会亲友",
				"安机械",
				"造车器",
				"祭祀",
				"出行",
				"纳财",
				"入宅",
				"安香",
				"出火",
				"入学",
				"塑绘",
				"开光",
				"拆卸",
				"起基",
				"修造",
				"动土",
				"牧养",
				"栽种",
				"安门",
				"开厕"
			],
			bad: [
				"行丧",
				"伐木",
				"作梁",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"交易",
				"割蜜",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"作灶",
				"安葬",
				"动土",
				"词讼",
				"作梁",
				"伐木",
				"掘井",
				"破土",
				"移徙"
			]
		},
		{
			good: [
				"嫁娶",
				"普渡",
				"祭祀",
				"祈福",
				"补垣",
				"塞穴",
				"断蚁",
				"筑堤",
				"入殓",
				"除服",
				"成服",
				"安葬"
			],
			bad: [
				"动土",
				"破土",
				"掘井",
				"开光",
				"上梁",
				"词讼"
			]
		},
		{
			good: [
				"祭祀",
				"立碑",
				"修坟",
				"启钻",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"纳财",
				"捕捉",
				"畋猎",
				"馀事勿取"
			],
			bad: [
				"动土",
				"破土",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"理发",
				"会亲友",
				"栽种",
				"纳畜",
				"牧养",
				"安葬",
				"修坟",
				"立碑",
				"启钻"
			],
			bad: [
				"入宅",
				"作灶",
				"词讼",
				"移徙",
				"出行",
				"赴任"
			]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"移徙",
				"入宅",
				"出行",
				"安机械",
				"会亲友",
				"祭祀",
				"祈福",
				"斋醮",
				"开光",
				"安香",
				"出火",
				"解除",
				"求医",
				"针灸",
				"治病",
				"盖屋",
				"起基",
				"修造",
				"安门",
				"造船",
				"纳畜",
				"牧养",
				"移柩",
				"入殓",
				"启钻",
				"谢土",
				"修坟",
				"立碑"
			],
			bad: [
				"嫁娶",
				"动土",
				"安床",
				"造桥",
				"掘井"
			]
		},
		{
			good: [
				"嫁娶",
				"开市",
				"交易",
				"立券",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"入宅",
				"移徙",
				"动土",
				"破土",
				"移柩",
				"安葬",
				"启钻",
				"除服",
				"成服"
			],
			bad: [
				"安床",
				"伐木",
				"祈福",
				"纳畜"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"求医",
				"治病",
				"扫舍",
				"破屋",
				"坏垣",
				"解除",
				"馀事勿取"
			],
			bad: [
				"入宅",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"塑绘",
				"祈福",
				"斋醮",
				"裁衣",
				"合帐",
				"冠笄",
				"嫁娶",
				"拆卸",
				"动土",
				"移徙",
				"入宅",
				"入殓",
				"移柩",
				"安葬",
				"谢土",
				"求嗣",
				"入学",
				"理发",
				"伐木",
				"架马",
				"作梁",
				"出火",
				"修造",
				"起基",
				"定磉",
				"放水",
				"赴任"
			],
			bad: ["安门"]
		},
		{
			good: [
				"造车器",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开市",
				"交易",
				"安机械",
				"雕刻",
				"开光",
				"盖屋",
				"合脊",
				"起基",
				"定磉",
				"安门",
				"纳畜",
				"安葬",
				"开生坟",
				"立碑",
				"谢土"
			],
			bad: [
				"入宅",
				"动土",
				"开仓",
				"出货财"
			]
		},
		{
			good: [
				"沐浴",
				"平治道涂",
				"扫舍",
				"入殓",
				"破土",
				"安葬",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"移徙",
				"伐木",
				"作梁",
				"安床",
				"祭祀",
				"祈福",
				"盖屋"
			]
		},
		{
			good: [
				"开光",
				"求嗣",
				"出行",
				"冠笄",
				"嫁娶",
				"伐木",
				"架马",
				"开柱眼",
				"修造",
				"移徙",
				"入宅",
				"开市",
				"交易",
				"立券",
				"安香",
				"出火",
				"挂匾",
				"起基",
				"开生坟",
				"合寿木",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬"
			],
			bad: [
				"安床",
				"出货财",
				"作灶",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"栽种",
				"纳畜",
				"入殓",
				"启钻",
				"除服",
				"成服"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"沐浴",
				"普渡",
				"出行",
				"纳财",
				"扫舍",
				"纳畜",
				"赴任"
			],
			bad: [
				"开市",
				"动土",
				"破土",
				"安床",
				"开仓",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"伐木",
				"拆卸",
				"修造",
				"动土",
				"移徙",
				"安葬",
				"破土",
				"修坟",
				"立碑"
			],
			bad: [
				"掘井",
				"祈福",
				"安床",
				"开市",
				"入宅",
				"挂匾",
				"开光"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"求医",
				"治病",
				"出火",
				"移徙",
				"入宅"
			],
			bad: [
				"开市",
				"开仓",
				"出货财",
				"安床",
				"安门",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"结网",
				"移柩",
				"入殓",
				"除服",
				"成服"
			],
			bad: [
				"安床",
				"开市",
				"交易",
				"出货财",
				"安葬",
				"修坟",
				"嫁娶",
				"作灶"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"沐浴",
				"作灶",
				"纳财",
				"捕捉",
				"畋猎",
				"安床",
				"扫舍"
			],
			bad: [
				"开市",
				"斋醮",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"破土",
				"除服",
				"成服",
				"启钻",
				"安葬",
				"修坟",
				"立碑",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"嫁娶",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"上梁",
				"盖屋",
				"入宅",
				"开市",
				"开池",
				"塞穴",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"破土"
			],
			bad: [
				"安床",
				"栽种",
				"治病",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"开光",
				"求嗣",
				"斋醮",
				"纳采",
				"订盟",
				"求医",
				"治病",
				"起基",
				"定磉",
				"造船",
				"取渔",
				"解除",
				"安葬",
				"启钻",
				"谢土",
				"入殓"
			],
			bad: [
				"开市",
				"动土",
				"掘井",
				"开池"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"动土",
				"解除",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"安门",
				"上梁",
				"安葬",
				"破土",
				"谢土"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"理发",
				"嫁娶",
				"作灶",
				"整手足甲",
				"扫舍",
				"修饰垣墙",
				"平治道涂"
			],
			bad: [
				"斋醮",
				"出行",
				"治病",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"解除",
				"安床",
				"牧养",
				"理发",
				"开市",
				"入殓",
				"启钻",
				"移柩",
				"安葬",
				"扫舍"
			],
			bad: [
				"作灶",
				"动土",
				"上梁",
				"栽种",
				"入宅",
				"移徙",
				"修造",
				"祈福"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"理发",
				"整手足甲",
				"冠笄",
				"解除",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"嫁娶",
				"出行",
				"入宅",
				"开市",
				"安门"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"冠笄",
				"祭祀",
				"沐浴",
				"作灶",
				"理发",
				"整手足甲",
				"扫舍",
				"补垣",
				"塞穴",
				"入殓",
				"破土",
				"启钻"
			],
			bad: [
				"开光",
				"嫁娶",
				"会亲友",
				"栽种",
				"针灸",
				"安葬"
			]
		},
		{
			good: ["解除", "馀事勿取"],
			bad: ["无"]
		}
	],
	[
		{
			good: [
				"祈福",
				"斋醮",
				"纳采",
				"订盟",
				"解除",
				"架马",
				"开柱眼",
				"修造",
				"动土",
				"起基",
				"上梁",
				"归岫",
				"盖屋",
				"合脊",
				"掘井",
				"除服",
				"成服",
				"破土",
				"栽种"
			],
			bad: [
				"移徙",
				"开市",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"结网",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"破土"
			],
			bad: ["馀事勿取"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"出行",
				"冠笄",
				"立券",
				"交易",
				"进人口",
				"开市",
				"移徙",
				"修造",
				"动土",
				"安床",
				"入殓",
				"移柩",
				"破土"
			],
			bad: [
				"开光",
				"作灶",
				"斋醮",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"解除",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"交易",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"合帐",
				"冠笄",
				"伐木",
				"架马",
				"作梁",
				"修造",
				"进人口",
				"嫁娶",
				"裁衣",
				"安床",
				"动土",
				"起基",
				"上梁",
				"竖柱",
				"放水",
				"会亲友"
			],
			bad: ["无"]
		},
		{
			good: [
				"安机械",
				"移徙",
				"入宅",
				"出行",
				"祭祀",
				"祈福",
				"斋醮",
				"纳采",
				"订盟",
				"安香",
				"出火",
				"解除",
				"会亲友",
				"修造",
				"动土",
				"拆卸",
				"起基",
				"定磉",
				"盖屋",
				"安床",
				"破土",
				"安葬",
				"入殓",
				"立碑"
			],
			bad: [
				"开市",
				"伐木",
				"作梁",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"塑绘",
				"冠笄",
				"嫁娶",
				"会亲友",
				"进人口",
				"经络",
				"裁衣",
				"栽种",
				"纳畜",
				"牧养",
				"补垣",
				"塞穴",
				"捕捉"
			],
			bad: [
				"祈福",
				"开市",
				"动土",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"塑绘",
				"开光",
				"出行",
				"解除",
				"理发",
				"整手足甲",
				"动土",
				"安床",
				"开池",
				"放水",
				"扫舍"
			],
			bad: [
				"伐木",
				"行丧",
				"作灶",
				"作梁",
				"安葬"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"置产",
				"求医",
				"治病",
				"开市",
				"交易",
				"立券",
				"会亲友",
				"移徙",
				"竖柱",
				"上梁",
				"盖屋",
				"合脊",
				"安门",
				"放水",
				"捕捉",
				"纳畜"
			],
			bad: [
				"造庙",
				"造船",
				"动土",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"安床",
				"祭祀",
				"开池",
				"补垣",
				"入殓",
				"移柩",
				"破土",
				"启钻"
			],
			bad: [
				"入宅",
				"移徙",
				"嫁娶",
				"掘井",
				"作灶",
				"出火",
				"进人口",
				"开市",
				"开光"
			]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"沐浴",
				"冠笄",
				"合帐",
				"裁衣",
				"修造",
				"动土",
				"拆卸",
				"移徙",
				"入宅",
				"安门",
				"开仓",
				"筑堤",
				"开厕",
				"栽种",
				"纳畜",
				"补垣",
				"塞穴"
			],
			bad: [
				"嫁娶",
				"祈福",
				"开光",
				"掘井",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"纳畜",
				"造畜稠",
				"入宅",
				"移徙",
				"安床",
				"开光",
				"祈福",
				"求嗣",
				"动土"
			],
			bad: [
				"嫁娶",
				"栽种",
				"安葬",
				"理发",
				"造庙",
				"作灶",
				"入殓",
				"行丧",
				"造桥"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"祈福",
				"求嗣",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"安门",
				"安床",
				"移徙",
				"造仓",
				"结网",
				"纳畜"
			],
			bad: [
				"伐木",
				"作灶",
				"安葬",
				"取渔",
				"入宅"
			]
		},
		{
			good: [
				"开市",
				"立券",
				"交易",
				"挂匾",
				"祭祀",
				"祈福",
				"开光",
				"入宅",
				"移徙",
				"安床",
				"拆卸",
				"动土",
				"上梁",
				"进人口"
			],
			bad: [
				"嫁娶",
				"行丧",
				"架马",
				"作梁",
				"理发",
				"牧养",
				"安葬",
				"纳畜",
				"伐木"
			]
		},
		{
			good: ["诸事不宜"],
			bad: ["无"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"沐浴",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"捕捉",
				"结网",
				"畋猎",
				"取渔",
				"馀事勿取"
			],
			bad: [
				"开市",
				"交易",
				"嫁娶",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"伐木",
				"出火",
				"拆卸",
				"入宅",
				"安床",
				"修造",
				"动土",
				"上梁",
				"挂匾",
				"纳畜"
			],
			bad: [
				"嫁娶",
				"栽种",
				"行丧",
				"理发",
				"修坟",
				"作灶"
			]
		},
		{
			good: [
				"出行",
				"沐浴",
				"订盟",
				"纳采",
				"裁衣",
				"竖柱",
				"上梁",
				"移徙",
				"纳畜",
				"牧养"
			],
			bad: [
				"嫁娶",
				"安门",
				"动土",
				"安葬"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"开光",
				"出行",
				"入宅",
				"移徙",
				"安床",
				"出火",
				"上梁"
			],
			bad: [
				"作灶",
				"行丧",
				"理发",
				"乘船",
				"嫁娶",
				"安葬"
			]
		},
		{
			good: [
				"出行",
				"造车器",
				"造畜稠",
				"解除",
				"冠笄",
				"裁衣",
				"作梁",
				"雕刻",
				"会亲友",
				"移徙",
				"入宅",
				"安机械",
				"开市",
				"扫舍"
			],
			bad: [
				"嫁娶",
				"动土",
				"破土",
				"修坟"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"馀事勿取"
			],
			bad: ["无"]
		}
	],
	[
		{
			good: [
				"合帐",
				"裁衣",
				"教牛马",
				"馀事勿取"
			],
			bad: [
				"入宅",
				"动土",
				"破土",
				"嫁娶",
				"作灶",
				"造船"
			]
		},
		{
			good: [
				"安床",
				"裁衣",
				"交易",
				"立券",
				"入殓",
				"移柩",
				"安葬",
				"除服",
				"成服"
			],
			bad: [
				"置产",
				"嫁娶",
				"出行",
				"开光",
				"栽种",
				"动土",
				"破土",
				"入宅",
				"治病"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"开光",
				"塑绘",
				"祈福",
				"求嗣",
				"订盟",
				"纳采",
				"冠笄",
				"裁衣",
				"嫁娶",
				"动土",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"出行",
				"安碓磑",
				"放水",
				"开市",
				"立券",
				"交易"
			],
			bad: [
				"安葬",
				"上梁",
				"入宅",
				"作灶"
			]
		},
		{
			good: [
				"理发",
				"冠笄",
				"嫁娶",
				"进人口"
			],
			bad: [
				"置产",
				"伐木",
				"纳畜",
				"造畜稠",
				"安葬",
				"破土",
				"作梁",
				"作灶",
				"开生坟"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"冠笄",
				"裁衣",
				"安机械",
				"拆卸",
				"修造",
				"动土",
				"安床",
				"经络",
				"开市"
			],
			bad: [
				"出火",
				"入宅",
				"安葬",
				"伐木"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"造车器",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"入殓",
				"破土",
				"安葬",
				"除服",
				"成服"
			],
			bad: ["开市", "立券"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"畋猎",
				"馀事勿取"
			],
			bad: ["嫁娶", "入宅"]
		},
		{
			good: [
				"解除",
				"祭祀",
				"理发",
				"入殓",
				"安葬",
				"破土"
			],
			bad: [
				"嫁娶",
				"开市",
				"出火",
				"作灶",
				"置产",
				"斋醮",
				"入宅",
				"移徙",
				"安门"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"普渡",
				"开光",
				"安香",
				"出火",
				"移徙",
				"入宅",
				"竖柱",
				"修造",
				"动土",
				"上梁",
				"起基",
				"盖屋",
				"安门",
				"造庙",
				"造桥",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"开市",
				"立券",
				"纳财",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"沐浴",
				"理发",
				"冠笄",
				"安床",
				"开市",
				"立券",
				"会亲友",
				"交易",
				"纳财",
				"结网",
				"教牛马"
			],
			bad: [
				"移徙",
				"入宅",
				"出行",
				"祈福",
				"嫁娶"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"出行",
				"解除",
				"出火",
				"拆卸",
				"修造",
				"进人口",
				"动土",
				"入宅",
				"移徙",
				"栽种",
				"纳畜",
				"掘井",
				"安葬",
				"除服",
				"成服"
			],
			bad: ["置产", "安床"]
		}
	],
	[
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"安香",
				"出火",
				"出行",
				"会亲友",
				"经络",
				"求医",
				"治病",
				"解除",
				"拆卸",
				"起基",
				"修造",
				"动土",
				"定磉",
				"扫舍",
				"栽种",
				"牧养",
				"造畜稠"
			],
			bad: [
				"斋醮",
				"作梁",
				"掘井",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"造畜稠",
				"教牛马",
				"针灸",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"动土",
				"开池",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"酬神",
				"裁衣",
				"安床",
				"立券",
				"交易",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"谢土",
				"启钻"
			],
			bad: [
				"出行",
				"嫁娶",
				"入宅",
				"动土"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"出火",
				"入宅",
				"移徙",
				"安床",
				"拆卸",
				"动土",
				"破土",
				"谢土"
			],
			bad: [
				"合帐",
				"开市",
				"安葬",
				"入殓"
			]
		},
		{
			good: ["祭祀", "馀事勿取"],
			bad: [
				"造庙",
				"嫁娶",
				"安床"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"祭祀",
				"祈福",
				"开光",
				"动土",
				"安床",
				"出行",
				"栽种",
				"纳畜",
				"牧养",
				"竖柱",
				"上梁",
				"解除",
				"破土"
			],
			bad: [
				"嫁娶",
				"掘井",
				"入宅",
				"移徙",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"安机械",
				"祭祀",
				"塑绘",
				"开光",
				"治病",
				"经络",
				"安床",
				"结网",
				"塞穴",
				"破土",
				"入殓"
			],
			bad: [
				"开市",
				"安门",
				"掘井",
				"作灶"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"捕捉",
				"畋猎",
				"纳畜",
				"牧养",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"启钻"
			],
			bad: [
				"嫁娶",
				"纳采",
				"订盟",
				"开市",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"栽种",
				"纳畜",
				"入殓",
				"安葬",
				"除服",
				"成服"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"造畜稠",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"安床",
				"掘井"
			]
		},
		{
			good: [
				"开光",
				"裁衣",
				"安门",
				"会亲友",
				"安床",
				"结网",
				"理发"
			],
			bad: [
				"嫁娶",
				"冠笄",
				"出行",
				"祈福",
				"安葬",
				"伐木",
				"入宅",
				"移徙",
				"出火",
				"栽种",
				"动土",
				"上梁"
			]
		}
	],
	[
		{
			good: [
				"纳财",
				"开市",
				"交易",
				"立券",
				"会亲友",
				"进人口",
				"经络",
				"祭祀",
				"祈福",
				"安香",
				"出火",
				"求医",
				"治病",
				"修造",
				"动土",
				"拆卸",
				"扫舍",
				"安床",
				"栽种",
				"牧养",
				"开生坟",
				"合寿木",
				"入殓",
				"安葬",
				"启钻"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"沐浴",
				"塑绘",
				"开光",
				"纳采",
				"订盟",
				"开市",
				"交易",
				"立券",
				"纳财",
				"起基",
				"动土",
				"定磉",
				"放水",
				"安葬",
				"破土",
				"启钻",
				"修坟",
				"立碑",
				"移柩"
			],
			bad: [
				"入宅",
				"安门",
				"祭祀",
				"谢土"
			]
		},
		{
			good: [
				"裁衣",
				"合帐",
				"入殓",
				"除服",
				"成服",
				"会亲友",
				"纳财"
			],
			bad: [
				"祭祀",
				"祈福",
				"移徙",
				"嫁娶",
				"入宅"
			]
		},
		{
			good: [
				"安床",
				"伐木",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"立券",
				"交易",
				"栽种",
				"纳畜",
				"牧养",
				"入殓",
				"安葬"
			],
			bad: [
				"嫁娶",
				"祭祀",
				"开光",
				"出行",
				"出火",
				"移徙",
				"入宅",
				"安门"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"嫁娶",
				"进人口",
				"会亲友",
				"交易",
				"立券",
				"动土",
				"除服",
				"谢土",
				"移柩",
				"破土",
				"启钻",
				"赴任",
				"出行",
				"开市",
				"纳财",
				"栽种"
			],
			bad: [
				"入殓",
				"安葬",
				"入宅",
				"安床"
			]
		},
		{
			good: [
				"解除",
				"出行",
				"纳采",
				"冠笄",
				"竖柱",
				"上梁",
				"移徙",
				"作灶",
				"进人口",
				"入宅",
				"纳畜",
				"牧养"
			],
			bad: [
				"祭祀",
				"伐木",
				"架马",
				"安床",
				"修造",
				"动土",
				"安葬",
				"修坟",
				"破土"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"进人口",
				"雕刻",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"开市",
				"栽种",
				"纳畜",
				"牧养",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"动土",
				"开光",
				"出行",
				"嫁娶",
				"纳采",
				"订盟",
				"入学",
				"开仓",
				"出货财",
				"纳畜",
				"牧养",
				"栽种",
				"破土",
				"启钻",
				"安葬",
				"立碑"
			],
			bad: [
				"入宅",
				"移徙",
				"作灶",
				"祭祀",
				"谢土"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"治病",
				"馀事勿取"
			],
			bad: ["行丧", "安葬"]
		},
		{
			good: [
				"解除",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"捕捉",
				"结网",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"启钻",
				"立碑"
			],
			bad: [
				"嫁娶",
				"祭祀",
				"入宅",
				"盖屋",
				"移徙"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"入宅",
				"移徙",
				"安床",
				"上梁",
				"开市",
				"交易",
				"立券",
				"栽种"
			],
			bad: [
				"祈福",
				"祭祀",
				"伐木",
				"掘井",
				"作灶",
				"谢土"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"入殓",
				"移柩",
				"馀事勿取"
			],
			bad: [
				"入宅",
				"修造",
				"动土",
				"破土",
				"安门",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"理发",
				"安床",
				"启钻",
				"安葬",
				"修坟",
				"开市",
				"交易",
				"立券",
				"纳财",
				"开池",
				"牧养"
			],
			bad: [
				"掘井",
				"祈福",
				"谢土",
				"动土",
				"入宅",
				"上梁",
				"修造",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"裁衣",
				"合帐",
				"冠笄",
				"订盟",
				"纳采",
				"嫁娶",
				"入宅",
				"安香",
				"谢土",
				"入殓",
				"移柩",
				"破土",
				"立碑",
				"会亲友",
				"出行",
				"祈福",
				"求嗣",
				"上梁",
				"放水"
			],
			bad: ["掘井"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"嫁娶",
				"冠笄",
				"出行",
				"开市",
				"交易",
				"会亲友",
				"教牛马",
				"除服",
				"成服",
				"启钻",
				"安葬",
				"移柩"
			],
			bad: [
				"动土",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"裁衣",
				"合帐",
				"安床",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"谢土",
				"立碑",
				"造畜稠"
			],
			bad: [
				"掘井",
				"安门",
				"嫁娶",
				"纳采"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"开市",
				"交易",
				"立券",
				"栽种",
				"安床",
				"纳畜",
				"移徙",
				"起基",
				"动土",
				"定磉",
				"造仓",
				"置产",
				"破土",
				"启钻",
				"修坟"
			],
			bad: [
				"入宅",
				"修造",
				"安门",
				"伐木",
				"入殓",
				"安葬",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"捕捉",
				"取渔",
				"修饰垣墙",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"入殓",
				"破土",
				"谢土",
				"安葬"
			],
			bad: [
				"掘井",
				"伐木",
				"纳畜",
				"合寿木"
			]
		},
		{
			good: [
				"祈福",
				"斋醮",
				"出行",
				"冠笄",
				"嫁娶",
				"雕刻",
				"开柱眼",
				"入宅",
				"造桥",
				"开市",
				"交易",
				"立券",
				"纳财",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"启钻"
			],
			bad: [
				"动土",
				"订盟",
				"安床",
				"开池"
			]
		},
		{
			good: [
				"祭祀",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"造庙",
				"出火",
				"安机械",
				"会亲友",
				"开市",
				"交易",
				"立券",
				"纳财",
				"习艺",
				"经络",
				"求医",
				"治病",
				"开池",
				"开厕",
				"畋猎",
				"结网",
				"栽种",
				"牧养",
				"安葬",
				"破土",
				"启钻"
			],
			bad: [
				"开光",
				"嫁娶",
				"掘井",
				"伐木",
				"作梁"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"伐木",
				"入宅",
				"移徙",
				"安床",
				"安葬"
			],
			bad: [
				"栽种",
				"掘井",
				"置产"
			]
		}
	],
	[
		{
			good: [
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"拆卸",
				"修造",
				"安床",
				"入宅",
				"出火",
				"安葬",
				"谢土",
				"赴任"
			],
			bad: [
				"掘井",
				"伐木",
				"斋醮",
				"作灶"
			]
		},
		{
			good: [
				"解除",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"移徙",
				"入宅",
				"掘井",
				"造庙",
				"栽种",
				"针灸",
				"治病",
				"开池"
			]
		},
		{
			good: [
				"安床",
				"合帐",
				"入宅",
				"问名",
				"纳采",
				"求嗣",
				"祭祀",
				"开仓"
			],
			bad: [
				"斋醮",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"塞穴",
				"整手足甲",
				"解除",
				"捕捉",
				"畋猎",
				"结网",
				"馀事勿取",
				"诸事不宜"
			],
			bad: [
				"嫁娶",
				"作灶",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"进人口",
				"嫁娶",
				"安床",
				"解除",
				"冠笄",
				"出行",
				"裁衣",
				"扫舍"
			],
			bad: [
				"掘井",
				"动土",
				"破土",
				"安葬",
				"开光"
			]
		},
		{
			good: [
				"嫁娶",
				"交易",
				"立券",
				"开厕",
				"补垣",
				"塞穴",
				"畋猎",
				"取渔",
				"开生坟"
			],
			bad: [
				"安床",
				"开渠",
				"上梁",
				"修造",
				"开市",
				"开光",
				"入宅",
				"移徙"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"祭祀",
				"祈福",
				"求医",
				"治病",
				"出行",
				"动土",
				"移徙",
				"入宅"
			],
			bad: ["开市", "安门"]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"作灶",
				"交易",
				"纳财",
				"栽种",
				"结网",
				"纳畜",
				"牧养",
				"进人口"
			],
			bad: [
				"开渠",
				"造船",
				"安床",
				"安葬",
				"破土",
				"出行",
				"修坟",
				"掘井",
				"开市",
				"开生坟"
			]
		},
		{
			good: [
				"祈福",
				"求嗣",
				"解除",
				"订盟",
				"纳采",
				"动土",
				"起基",
				"放水",
				"造仓",
				"开市",
				"纳畜",
				"牧养",
				"开生坟",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"开光",
				"出行",
				"理发",
				"作梁",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"挂匾",
				"栽种",
				"纳畜",
				"破土",
				"安葬",
				"入殓",
				"除服",
				"成服"
			],
			bad: [
				"开市",
				"掘井",
				"开渠",
				"造桥",
				"造船"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"理发",
				"针灸",
				"解除",
				"进人口",
				"整手足甲"
			],
			bad: [
				"嫁娶",
				"动土",
				"造船",
				"开池",
				"掘井",
				"出行",
				"修造",
				"入宅",
				"上梁",
				"移徙",
				"安葬",
				"破土",
				"作灶",
				"开市"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"裁衣",
				"冠笄",
				"嫁娶",
				"纳采",
				"拆卸",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"安床",
				"移徙",
				"入宅",
				"安香",
				"结网",
				"捕捉",
				"畋猎",
				"伐木",
				"进人口",
				"放水"
			],
			bad: [
				"出行",
				"安葬",
				"修坟",
				"开市"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"伐木",
				"出火",
				"拆卸",
				"入宅",
				"移徙",
				"修造",
				"动土",
				"上梁",
				"安床",
				"纳畜"
			],
			bad: [
				"开市",
				"行丧",
				"栽种",
				"出行",
				"出货财",
				"安葬",
				"置产",
				"词讼",
				"治病"
			]
		},
		{
			good: ["作灶", "平治道涂"],
			bad: [
				"祭祀",
				"祈福",
				"安葬",
				"安门",
				"馀事勿取"
			]
		},
		{
			good: [
				"纳财",
				"开市",
				"立券",
				"交易",
				"开光",
				"安床",
				"上梁",
				"盖屋",
				"修造",
				"起基"
			],
			bad: [
				"动土",
				"破土",
				"安葬",
				"行丧",
				"赴任",
				"出行",
				"嫁娶",
				"入宅",
				"移徙",
				"谢土",
				"词讼"
			]
		},
		{
			good: [
				"纳采",
				"开光",
				"求医",
				"治病",
				"动土",
				"上梁",
				"移徙",
				"入宅"
			],
			bad: [
				"嫁娶",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"塞穴",
				"断蚁",
				"结网",
				"畋猎",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"安葬",
				"入宅",
				"出行",
				"动土",
				"词讼"
			]
		},
		{
			good: [
				"裁衣",
				"作灶",
				"移徙",
				"入宅",
				"纳畜"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"纳采",
				"裁衣",
				"冠笄",
				"开光",
				"安床",
				"作梁",
				"修造",
				"动土",
				"作灶",
				"起基",
				"上梁",
				"盖屋",
				"纳畜",
				"牧养"
			],
			bad: [
				"移徙",
				"栽种",
				"出行",
				"行丧",
				"破土",
				"安葬",
				"词讼"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"解除",
				"订盟",
				"纳采",
				"嫁娶",
				"出火",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"拆卸",
				"起基",
				"安门",
				"分居",
				"开市",
				"交易",
				"立券",
				"纳财",
				"纳畜",
				"牧养"
			],
			bad: ["无"]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"挂匾",
				"栽种",
				"祭祀",
				"祈福",
				"开光",
				"拆卸",
				"动土",
				"安床"
			],
			bad: [
				"嫁娶",
				"破土",
				"进人口",
				"出行",
				"入宅",
				"移徙",
				"出火",
				"纳畜",
				"词讼",
				"安葬"
			]
		},
		{
			good: [
				"会亲友",
				"嫁娶",
				"订盟",
				"纳采",
				"纳婿",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"竖柱",
				"上梁",
				"安床",
				"纳财"
			],
			bad: [
				"出行",
				"祈福",
				"安葬",
				"作灶"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		}
	],
	[
		{
			good: [
				"祭祀",
				"求医",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"入宅",
				"移徙",
				"安床",
				"祭祀",
				"祈福",
				"开光",
				"出行",
				"解除",
				"出火",
				"拆卸",
				"动土",
				"纳畜",
				"谢土",
				"安葬",
				"破土"
			],
			bad: [
				"伐木",
				"开市",
				"交易",
				"上梁",
				"作灶",
				"安门",
				"盖屋"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"酬神",
				"斋醮",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"拆卸",
				"动土",
				"上梁",
				"安床",
				"安香",
				"造庙",
				"挂匾",
				"会亲友",
				"进人口",
				"出行",
				"修造",
				"纳财",
				"伐木",
				"放水",
				"出火",
				"纳畜",
				"沐浴",
				"安门"
			],
			bad: [
				"盖屋",
				"栽种",
				"安葬",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"嫁娶",
				"冠笄",
				"修饰垣墙",
				"置产",
				"平治道涂"
			],
			bad: [
				"开仓",
				"出货财",
				"盖屋",
				"作灶",
				"开市",
				"交易",
				"立券",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"开市",
				"安床",
				"启钻",
				"安葬"
			],
			bad: [
				"嫁娶",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"出行",
				"出火",
				"入宅",
				"移徙",
				"栽种",
				"纳畜",
				"牧养",
				"动土",
				"破土",
				"入殓",
				"安葬"
			],
			bad: [
				"作灶",
				"安床",
				"开仓",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"移柩",
				"启钻",
				"安葬"
			],
			bad: [
				"上梁",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"经络",
				"祭祀",
				"沐浴",
				"补垣",
				"塞穴",
				"除服",
				"成服",
				"移柩",
				"入殓",
				"启钻",
				"立碑"
			],
			bad: [
				"开光",
				"治病",
				"嫁娶",
				"掘井",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"祈福",
				"出行",
				"订盟",
				"纳采",
				"嫁娶",
				"裁衣",
				"动土",
				"安床",
				"放水",
				"开市",
				"掘井",
				"交易",
				"立券",
				"栽种",
				"开渠",
				"除服",
				"成服",
				"移柩",
				"破土"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"理发",
				"进人口",
				"作灶",
				"移柩",
				"冠笄",
				"会亲友"
			],
			bad: [
				"开仓",
				"出货财",
				"伐木",
				"纳畜",
				"开市",
				"上梁",
				"盖屋",
				"破土",
				"启钻",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"祈福",
				"斋醮",
				"出行",
				"订盟",
				"纳采",
				"裁衣",
				"嫁娶",
				"拆卸",
				"修造",
				"安床",
				"入宅",
				"安香",
				"入殓",
				"启钻",
				"安葬",
				"谢土",
				"赴任",
				"会亲友",
				"进人口",
				"移徙",
				"上梁",
				"经络",
				"开市",
				"交易",
				"立券",
				"纳财"
			],
			bad: [
				"开仓",
				"冠笄",
				"伐木",
				"作梁"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"雕刻",
				"移徙",
				"开市",
				"入宅",
				"出行",
				"动土",
				"会亲友",
				"入学",
				"修造",
				"起基",
				"安门",
				"安床",
				"造庙",
				"解除",
				"纳财",
				"开池",
				"造畜稠",
				"牧养"
			],
			bad: [
				"上梁",
				"开仓",
				"出货财",
				"盖屋",
				"造船"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"出行",
				"冠笄",
				"安机械",
				"移徙",
				"入宅",
				"安香",
				"安床",
				"除服",
				"成服",
				"移柩",
				"启钻"
			],
			bad: [
				"开光",
				"栽种",
				"治病",
				"安门",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"破屋",
				"坏垣",
				"解除",
				"馀事勿取"
			],
			bad: [
				"开市",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"酬神",
				"订盟",
				"纳采",
				"冠笄",
				"裁衣",
				"合帐",
				"嫁娶",
				"安床",
				"移徙",
				"入宅",
				"安香",
				"入殓",
				"移柩",
				"启钻",
				"安葬",
				"解除",
				"取渔",
				"捕捉",
				"伐木",
				"安门",
				"出火"
			],
			bad: [
				"栽种",
				"动土",
				"开市",
				"作灶"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"拆卸",
				"修造",
				"安门",
				"挂匾",
				"纳财",
				"扫舍"
			],
			bad: [
				"动土",
				"伐木",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"掘井",
				"平治道涂"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"开光",
				"纳采",
				"裁衣",
				"冠笄",
				"安床",
				"作灶",
				"进人口",
				"造仓",
				"塞穴"
			],
			bad: [
				"嫁娶",
				"栽种",
				"修造",
				"动土",
				"出行",
				"伐木",
				"作梁",
				"安葬",
				"谢土"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"出行",
				"祈福",
				"斋醮",
				"安床",
				"会亲友"
			],
			bad: [
				"移徙",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"出行",
				"裁衣",
				"冠笄",
				"交易",
				"雕刻",
				"纳财",
				"造畜稠",
				"造车器",
				"教牛马"
			],
			bad: [
				"移徙",
				"入宅",
				"栽种",
				"动土",
				"破土",
				"作灶",
				"安葬",
				"行丧",
				"伐木",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"斋醮",
				"作灶",
				"移徙",
				"入宅"
			],
			bad: ["动土", "破土"]
		},
		{
			good: [
				"祭祀",
				"修坟",
				"除服",
				"成服",
				"启钻",
				"移柩",
				"馀事勿取"
			],
			bad: [
				"开市",
				"入宅",
				"嫁娶",
				"动土",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"入殓",
				"除服",
				"成服",
				"畋猎"
			],
			bad: [
				"栽种",
				"动土",
				"安葬",
				"开市"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"伐木",
				"拆卸",
				"修造",
				"栽种",
				"纳畜",
				"安葬",
				"修坟",
				"立碑"
			],
			bad: [
				"嫁娶",
				"进人口",
				"入宅",
				"移徙",
				"出火",
				"出行"
			]
		}
	],
	[
		{
			good: [
				"塑绘",
				"斋醮",
				"出行",
				"拆卸",
				"解除",
				"修造",
				"移徙",
				"造船",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"修坟",
				"立碑",
				"谢土"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"开光",
				"安香",
				"出火",
				"纳财",
				"开市",
				"交易",
				"立券",
				"裁衣",
				"盖屋",
				"起基",
				"修造",
				"动土",
				"安门",
				"移徙",
				"入宅",
				"栽种",
				"牧养",
				"畋猎",
				"掘井",
				"开池",
				"安葬",
				"破土",
				"入殓",
				"除服",
				"成服",
				"立碑"
			],
			bad: [
				"祈福",
				"造庙",
				"祭祀",
				"安床",
				"谢土"
			]
		},
		{
			good: ["求医", "破屋"],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"入宅",
				"移徙",
				"解除",
				"栽种",
				"伐木",
				"破土",
				"谢土",
				"安葬"
			],
			bad: [
				"开市",
				"交易",
				"作灶",
				"纳财",
				"上梁",
				"安床",
				"盖屋",
				"造船"
			]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"开市",
				"动土",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"嫁娶",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"纳采",
				"嫁娶",
				"裁衣",
				"理发",
				"出行",
				"修造",
				"动土",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"移徙",
				"上梁",
				"栽种",
				"纳畜"
			],
			bad: [
				"伐木",
				"安葬",
				"安床",
				"祭祀",
				"祈福"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"出行",
				"求医",
				"治病",
				"开市",
				"移徙",
				"入宅",
				"启钻",
				"安葬"
			],
			bad: ["动土", "破土"]
		},
		{
			good: [
				"修造",
				"动土",
				"安机械",
				"祭祀",
				"沐浴",
				"解除",
				"拆卸",
				"治病",
				"作灶",
				"盖屋",
				"起基",
				"开池",
				"扫舍",
				"造畜稠",
				"开生坟",
				"合寿木",
				"安葬",
				"破土",
				"启钻",
				"移柩",
				"入殓",
				"立碑"
			],
			bad: [
				"开市",
				"入宅",
				"出行",
				"安床"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"纳畜",
				"祭祀",
				"入殓",
				"启钻",
				"安葬"
			],
			bad: [
				"作灶",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"安机械",
				"解除",
				"纳畜",
				"牧养",
				"沐浴",
				"伐木",
				"架马",
				"作梁",
				"安门",
				"扫舍",
				"合寿木",
				"安葬",
				"启钻",
				"立碑",
				"修坟"
			],
			bad: [
				"祈福",
				"开光",
				"开市",
				"入宅",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"沐浴",
				"竖柱",
				"订盟",
				"纳采",
				"嫁娶",
				"拆卸",
				"入宅",
				"移柩",
				"启钻",
				"谢土",
				"赴任",
				"出火",
				"纳畜"
			],
			bad: [
				"作灶",
				"入殓",
				"安葬",
				"安床"
			]
		},
		{
			good: [
				"沐浴",
				"扫舍",
				"捕捉",
				"畋猎",
				"解除",
				"塞穴",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"开市",
				"安床",
				"破土",
				"修坟"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"沐浴",
				"安床",
				"纳财",
				"畋猎",
				"捕捉"
			],
			bad: ["开市", "破土"]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"入殓",
				"破土",
				"启钻",
				"安葬",
				"修坟",
				"立碑",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"入宅",
				"作灶",
				"纳采",
				"订盟"
			]
		},
		{
			good: [
				"祈福",
				"求嗣",
				"斋醮",
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"嫁娶",
				"动土",
				"入宅",
				"安香",
				"移柩",
				"安葬",
				"谢土",
				"出行",
				"沐浴",
				"修造",
				"竖柱",
				"上梁",
				"纳财",
				"破土",
				"解除",
				"安门",
				"放水"
			],
			bad: ["作灶", "安床"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"馀事勿取"
			],
			bad: ["开光", "嫁娶"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"移徙",
				"求医"
			],
			bad: [
				"开市",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"挂匾",
				"祭祀",
				"祈福",
				"斋醮",
				"出行",
				"盖屋",
				"起基",
				"修造",
				"动土",
				"定磉",
				"安床",
				"安机械",
				"安葬",
				"破土",
				"启钻",
				"除服",
				"成服",
				"立碑"
			],
			bad: [
				"作灶",
				"嫁娶",
				"移徙",
				"入宅",
				"理发"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"沐浴",
				"扫舍",
				"修饰垣墙"
			],
			bad: ["行丧", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"造车器",
				"开光",
				"出行",
				"拆卸",
				"起基",
				"安床",
				"除服",
				"成服",
				"开市",
				"交易",
				"立券",
				"栽种",
				"牧养",
				"入殓",
				"移柩",
				"启钻"
			],
			bad: [
				"上梁",
				"入宅",
				"修造",
				"动土",
				"破土",
				"祭祀",
				"祈福",
				"斋醮"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"修造",
				"动土",
				"上梁",
				"破土",
				"安葬"
			],
			bad: ["嫁娶", "开市"]
		},
		{
			good: [
				"祭祀",
				"出行",
				"沐浴",
				"扫舍",
				"安葬",
				"馀事勿取"
			],
			bad: [
				"动土",
				"破土",
				"置产",
				"掘井"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"安机械",
				"入殓",
				"破土",
				"安葬"
			],
			bad: ["动土", "上梁"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"出行",
				"解除",
				"动土",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"拆卸",
				"破土"
			],
			bad: [
				"伐木",
				"上梁",
				"修造",
				"入殓",
				"理发",
				"会亲友",
				"入宅",
				"安门",
				"安葬",
				"作灶"
			]
		}
	],
	[
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"修造",
				"动土",
				"上梁",
				"破土"
			],
			bad: ["嫁娶", "作灶"]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"纳财",
				"捕捉",
				"畋猎"
			],
			bad: [
				"嫁娶",
				"开市",
				"入宅",
				"安床",
				"破土",
				"安葬"
			]
		},
		{
			good: [
				"取渔",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"立碑"
			],
			bad: [
				"嫁娶",
				"上梁",
				"入宅",
				"作灶"
			]
		},
		{
			good: [
				"纳采",
				"交易",
				"立券",
				"安床",
				"安机械",
				"安葬",
				"移柩",
				"动土",
				"破土",
				"立碑"
			],
			bad: [
				"嫁娶",
				"开光",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"求医",
				"治病",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"动土",
				"修造",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"解除",
				"挂匾",
				"栽种",
				"破土",
				"谢土",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"开市",
				"立券",
				"造船",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"出行",
				"开市",
				"祭祀",
				"祈福",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["作灶"]
		},
		{
			good: [
				"祭祀",
				"嫁娶",
				"畋猎",
				"结网"
			],
			bad: [
				"动土",
				"破土",
				"治病",
				"开渠"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"出行",
				"会亲友",
				"修造",
				"上梁",
				"移徙",
				"入宅"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"祭祀",
				"解除",
				"出行",
				"修造",
				"动土",
				"开市",
				"上梁",
				"安床",
				"整手足甲",
				"扫舍",
				"求医",
				"治病",
				"起基",
				"定磉",
				"盖屋",
				"合脊"
			],
			bad: [
				"造庙",
				"行丧",
				"安葬",
				"伐木",
				"作灶",
				"造船"
			]
		},
		{
			good: ["作灶", "造畜稠"],
			bad: ["行丧", "安葬"]
		},
		{
			good: [
				"合帐",
				"裁衣",
				"嫁娶",
				"安床",
				"入殓",
				"移柩",
				"破土",
				"造畜稠"
			],
			bad: [
				"置产",
				"造船",
				"开光",
				"掘井",
				"作灶"
			]
		}
	],
	[
		{
			good: [
				"出行",
				"沐浴",
				"理发",
				"补垣",
				"塞穴"
			],
			bad: ["入宅", "安葬"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"沐浴",
				"进人口",
				"会亲友",
				"入学",
				"治病",
				"安碓磑",
				"掘井",
				"开池",
				"纳畜",
				"牧养",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"合帐",
				"入宅",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"求嗣",
				"沐浴",
				"酬神",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"安机械",
				"安床",
				"造仓",
				"开池",
				"经络",
				"纳财",
				"开市",
				"立券",
				"交易",
				"结网",
				"取渔",
				"纳畜",
				"捕捉"
			],
			bad: [
				"安葬",
				"作灶",
				"伐木",
				"作梁"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"沐浴",
				"开光",
				"理发",
				"经络",
				"解除",
				"治病",
				"立碑",
				"栽种",
				"牧养",
				"掘井",
				"开池"
			],
			bad: [
				"嫁娶",
				"定磉",
				"合寿木",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"沐浴",
				"结网",
				"取渔"
			],
			bad: [
				"嫁娶",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["开光", "安葬"]
		},
		{
			good: [
				"订盟",
				"纳采",
				"出行",
				"祭祀",
				"祈福",
				"修造",
				"动土",
				"移徙",
				"入宅"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"会亲友",
				"入学",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"理发",
				"动土",
				"起基",
				"开市",
				"交易",
				"立券",
				"纳财",
				"造仓",
				"栽种",
				"纳畜",
				"牧养"
			],
			bad: [
				"嫁娶",
				"作灶",
				"出火",
				"置产",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"沐浴",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["嫁娶", "祈福"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"纳财",
				"栽种",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"开光",
				"出火",
				"拆卸",
				"安门",
				"修造"
			],
			bad: [
				"斋醮",
				"嫁娶",
				"行丧",
				"动土",
				"作灶",
				"安葬",
				"破土"
			]
		},
		{
			good: [
				"沐浴",
				"理发",
				"入学",
				"习艺",
				"进人口"
			],
			bad: ["嫁娶", "入宅"]
		},
		{
			good: [
				"解除",
				"修饰垣墙",
				"冠笄",
				"出行",
				"馀事勿取"
			],
			bad: [
				"开市",
				"动土",
				"破土",
				"嫁娶",
				"安葬"
			]
		}
	],
	[
		{
			good: ["教牛马", "馀事勿取"],
			bad: [
				"入宅",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"沐浴",
				"问名",
				"交易",
				"纳财",
				"入殓",
				"移柩",
				"安葬",
				"修坟",
				"立碑",
				"谢土",
				"造畜稠",
				"教牛马"
			],
			bad: [
				"入宅",
				"置产",
				"嫁娶",
				"动土",
				"栽种",
				"开市",
				"开光",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"祈福",
				"求嗣",
				"斋醮",
				"订盟",
				"纳采",
				"裁衣",
				"冠笄",
				"开市",
				"立券",
				"交易",
				"纳财",
				"除服",
				"谢土",
				"出行",
				"移柩"
			],
			bad: [
				"入殓",
				"安葬",
				"作灶",
				"入宅"
			]
		},
		{
			good: [
				"纳财",
				"交易",
				"立券",
				"栽种",
				"捕捉",
				"结网",
				"取渔",
				"进人口",
				"教牛马",
				"理发"
			],
			bad: [
				"入宅",
				"盖屋",
				"竖柱",
				"安葬"
			]
		},
		{
			good: ["无"],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"订盟",
				"纳采",
				"嫁娶",
				"解除",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"纳畜",
				"动土",
				"破土",
				"谢土",
				"安葬",
				"修坟"
			],
			bad: [
				"作灶",
				"开市",
				"经络"
			]
		},
		{
			good: ["诸事不宜"],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"解除",
				"整手足甲",
				"安床",
				"沐浴",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"谢土"
			],
			bad: [
				"嫁娶",
				"斋醮",
				"开市",
				"出火",
				"入宅",
				"移徙",
				"出行",
				"作灶",
				"安门",
				"伐木"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"斋醮",
				"动土",
				"移徙",
				"入宅"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"安床",
				"出行"
			]
		},
		{
			good: [
				"开光",
				"针灸",
				"会亲友",
				"启钻",
				"安葬"
			],
			bad: [
				"开市",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"进人口",
				"开市",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安门",
				"栽种",
				"动土",
				"求医",
				"治病",
				"会亲友",
				"起基",
				"修造",
				"盖屋",
				"安葬"
			],
			bad: [
				"作灶",
				"经络",
				"安床"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"出行",
				"求医",
				"治病",
				"祭祀",
				"祈福",
				"上梁",
				"纳畜"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"祭祀",
				"教牛马",
				"造畜稠",
				"会亲友",
				"解除",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"出行",
				"动土",
				"破土",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"入殓",
				"启钻",
				"安葬",
				"移柩"
			],
			bad: [
				"开光",
				"掘井",
				"针灸",
				"出行",
				"嫁娶",
				"入宅",
				"移徙",
				"作灶",
				"动土"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"出火",
				"安门",
				"安床",
				"上梁",
				"立碑",
				"移柩"
			],
			bad: [
				"开市",
				"交易",
				"合帐",
				"安葬"
			]
		},
		{
			good: [
				"解除",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"订盟",
				"纳采",
				"解除",
				"动土",
				"起基",
				"进人口",
				"开市",
				"交易",
				"立券",
				"纳财",
				"造仓",
				"开池",
				"栽种",
				"纳畜",
				"破土",
				"安葬"
			],
			bad: [
				"安床",
				"上梁",
				"裁衣",
				"入宅",
				"嫁娶"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"入殓",
				"破土",
				"安葬"
			],
			bad: ["开光", "开市"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"解除",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"捕捉",
				"结网",
				"入殓",
				"破土",
				"安葬"
			],
			bad: ["嫁娶", "入宅"]
		},
		{
			good: [
				"开光",
				"祈福",
				"求嗣",
				"斋醮",
				"修造",
				"动土",
				"纳财",
				"造仓",
				"开厕",
				"栽种",
				"牧养",
				"会亲友"
			],
			bad: [
				"作灶",
				"出火",
				"进人口",
				"开渠",
				"入宅",
				"移徙",
				"祭祀"
			]
		},
		{
			good: [
				"祭祀",
				"结网",
				"造畜稠",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"理发",
				"会亲友",
				"牧养",
				"开池",
				"造畜稠",
				"畋猎",
				"结网"
			],
			bad: [
				"祈福",
				"谢土",
				"安葬",
				"上梁",
				"作灶",
				"开市",
				"嫁娶",
				"出行",
				"入宅",
				"动土"
			]
		}
	],
	[
		{
			good: [
				"开市",
				"立券",
				"开光",
				"解除",
				"安机械",
				"上梁",
				"启钻",
				"安葬"
			],
			bad: ["嫁娶", "祈福"]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"解除",
				"出火",
				"拆卸",
				"修造",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"入殓",
				"修坟",
				"动土",
				"除服",
				"成服"
			],
			bad: [
				"作灶",
				"安葬",
				"祭祀",
				"开市",
				"纳采",
				"订盟",
				"纳畜",
				"谢土",
				"出行",
				"探病"
			]
		},
		{
			good: [
				"安床",
				"解除",
				"裁衣",
				"竖柱",
				"上梁",
				"交易",
				"立券",
				"纳财",
				"纳畜",
				"牧养",
				"入殓",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"嫁娶",
				"出行",
				"动土",
				"开渠",
				"入宅",
				"祭祀",
				"掘井"
			]
		},
		{
			good: [
				"冠笄",
				"立券",
				"交易",
				"修造",
				"动土",
				"安机械",
				"入殓",
				"安葬",
				"破土"
			],
			bad: [
				"嫁娶",
				"祈福",
				"出火",
				"入宅"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"进人口",
				"开市",
				"立券",
				"交易",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种"
			],
			bad: [
				"祈福",
				"入殓",
				"祭祀",
				"作灶",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"祭祀",
				"结网",
				"捕捉",
				"馀事勿取"
			],
			bad: [
				"探病",
				"嫁娶",
				"开市"
			]
		},
		{
			good: [
				"开光",
				"求医",
				"治病",
				"动土",
				"上梁",
				"入殓",
				"破土",
				"安葬"
			],
			bad: ["嫁娶"]
		},
		{
			good: [
				"嫁娶",
				"开市",
				"立券",
				"移徙",
				"入宅",
				"安机械",
				"会亲友",
				"经络",
				"安门",
				"安床",
				"挂匾",
				"拆卸",
				"开仓",
				"出货财",
				"开池",
				"栽种",
				"纳畜",
				"牧养",
				"破土",
				"安葬",
				"启钻",
				"移柩",
				"入殓",
				"立碑"
			],
			bad: [
				"祭祀",
				"祈福",
				"探病",
				"谢土",
				"造桥"
			]
		},
		{
			good: [
				"沐浴",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"开光",
				"解除",
				"拆卸",
				"修造",
				"动土",
				"竖柱",
				"安门",
				"牧养",
				"安葬",
				"修坟",
				"破土",
				"移柩"
			],
			bad: [
				"出火",
				"入宅",
				"移徙",
				"祈福",
				"祭祀",
				"安床",
				"开市",
				"嫁娶",
				"探病"
			]
		},
		{
			good: [
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"安葬"
			],
			bad: ["移徙", "入宅"]
		},
		{
			good: [
				"出行",
				"纳财",
				"开市",
				"交易",
				"立券",
				"动土",
				"移徙",
				"入宅",
				"裁衣",
				"会亲友",
				"拆卸",
				"进人口",
				"安香",
				"经络",
				"出货财",
				"修饰垣墙",
				"平治道涂"
			],
			bad: [
				"造庙",
				"谢土",
				"作灶",
				"作梁",
				"伐木",
				"安葬",
				"行丧",
				"修坟",
				"探病"
			]
		}
	],
	[
		{
			good: ["平治道涂", "馀事勿取"],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"出行",
				"起基",
				"安床",
				"纳财",
				"交易",
				"立券",
				"嫁娶",
				"栽种",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"挂匾",
				"入宅",
				"上梁",
				"祈福",
				"词讼",
				"作梁",
				"作灶",
				"开池",
				"安门",
				"动土",
				"破土",
				"掘井"
			]
		},
		{
			good: [
				"嫁娶",
				"安床",
				"开光",
				"出行",
				"祭祀",
				"动土",
				"出火",
				"解除",
				"会亲友",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"拆卸",
				"破土",
				"启钻",
				"安葬"
			],
			bad: ["掘井", "词讼"]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"出行",
				"立券",
				"交易",
				"冠笄",
				"纳财"
			],
			bad: [
				"嫁娶",
				"动土",
				"掘井",
				"起基",
				"定磉",
				"破土"
			]
		},
		{
			good: [
				"嫁娶",
				"出行",
				"合帐",
				"冠笄",
				"安床",
				"除服",
				"成服",
				"作灶",
				"交易",
				"立券",
				"入殓",
				"移柩",
				"破土",
				"安葬"
			],
			bad: [
				"词讼",
				"开光",
				"开市"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"纳采",
				"订盟",
				"嫁娶",
				"出行",
				"动土",
				"破土",
				"会亲友",
				"开市",
				"交易",
				"立券",
				"习艺",
				"拆卸",
				"起基",
				"安碓磑",
				"放水",
				"开池",
				"造仓",
				"开渠",
				"栽种",
				"谢土",
				"启钻",
				"修坟",
				"立碑"
			],
			bad: [
				"入宅",
				"安门",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"栽种",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"斋醮",
				"开光",
				"会亲友",
				"求医",
				"治病",
				"盖屋",
				"起基",
				"竖柱",
				"上梁",
				"安门",
				"安碓磑",
				"筑堤",
				"开池",
				"破土",
				"安葬",
				"除服",
				"成服"
			],
			bad: [
				"入宅",
				"开市",
				"掘井",
				"词讼",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"出行",
				"开市",
				"祭祀",
				"祈福",
				"移徙",
				"入宅",
				"启钻",
				"安葬"
			],
			bad: ["动土", "破土"]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"馀事勿取"
			],
			bad: ["移徙", "入宅"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"出行",
				"祭祀",
				"祈福",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["开市", "赴任"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"斋醮",
				"开光",
				"安香",
				"出火",
				"出行",
				"拆卸",
				"动土",
				"祈福",
				"进人口",
				"纳财",
				"交易",
				"立券",
				"移徙",
				"安床",
				"修造",
				"安葬",
				"除服",
				"成服"
			],
			bad: [
				"置产",
				"掘井",
				"词讼",
				"栽种"
			]
		}
	],
	[
		{
			good: [
				"求嗣",
				"斋醮",
				"塑绘",
				"订盟",
				"纳采",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"造桥",
				"安机械",
				"栽种",
				"纳畜",
				"牧养",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬"
			],
			bad: ["开市", "嫁娶"]
		},
		{
			good: ["平治道涂", "馀事勿取"],
			bad: [
				"开光",
				"嫁娶",
				"开仓",
				"出货财",
				"造船",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"求嗣",
				"会亲友",
				"安床",
				"牧养",
				"塑绘",
				"针灸"
			],
			bad: [
				"入宅",
				"移徙",
				"出火",
				"分居",
				"安香",
				"作灶",
				"开市",
				"交易",
				"立券",
				"安葬",
				"动土",
				"伐木"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"扫舍",
				"塞穴",
				"牧养"
			],
			bad: [
				"嫁娶",
				"安葬",
				"行丧",
				"安门"
			]
		},
		{
			good: [
				"出行",
				"修饰垣墙",
				"造畜稠",
				"教牛马",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"出行",
				"移徙",
				"入宅",
				"作灶",
				"造车器",
				"补垣",
				"塞穴",
				"开厕",
				"破土",
				"启钻",
				"除服",
				"成服",
				"入殓"
			],
			bad: [
				"盖屋",
				"造桥",
				"安门",
				"安葬",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"解除",
				"伐木",
				"入宅",
				"移徙",
				"安床",
				"出火",
				"拆卸",
				"修造",
				"上梁",
				"栽种",
				"移柩"
			],
			bad: [
				"安葬",
				"开市",
				"交易",
				"立券"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"移徙",
				"入宅",
				"出行",
				"祭祀",
				"祈福",
				"斋醮",
				"塑绘",
				"开光",
				"安香",
				"出火",
				"会亲友",
				"解除",
				"入学",
				"竖柱",
				"上梁",
				"拆卸",
				"盖屋",
				"起基",
				"栽种",
				"牧养",
				"纳畜"
			],
			bad: [
				"安葬",
				"破土",
				"开市",
				"开仓",
				"出货财",
				"启钻"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"求医",
				"治病",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["开光", "针灸"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"上梁",
				"合脊",
				"放水",
				"掘井",
				"破土",
				"移柩",
				"谢土",
				"除服",
				"成服"
			],
			bad: [
				"开市",
				"开仓",
				"安门",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"开光",
				"出行",
				"解除",
				"伐木",
				"出火",
				"入宅",
				"移徙",
				"拆卸",
				"修造",
				"栽种",
				"安葬",
				"入殓"
			],
			bad: [
				"破土",
				"动土",
				"安门",
				"作灶",
				"开市",
				"交易"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"修造",
				"动土",
				"移徙",
				"入宅"
			],
			bad: ["开市", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"会亲友",
				"祭祀",
				"安机械",
				"移徙",
				"入宅",
				"盖屋",
				"安床",
				"起基",
				"定磉",
				"安香",
				"出火",
				"挂匾",
				"拆卸",
				"置产"
			],
			bad: [
				"开市",
				"出行",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"作灶",
				"解除",
				"平治道涂"
			],
			bad: [
				"栽种",
				"出行",
				"祈福",
				"行丧",
				"纳畜",
				"安葬",
				"安门",
				"伐木",
				"作梁",
				"牧养"
			]
		},
		{
			good: [
				"纳财",
				"开市",
				"交易",
				"立券",
				"开光",
				"针灸",
				"会亲友",
				"理发",
				"安床",
				"造仓",
				"结网"
			],
			bad: [
				"移徙",
				"入宅",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"开光",
				"求嗣",
				"解除",
				"伐木",
				"出火",
				"入宅",
				"移徙",
				"安床",
				"拆卸",
				"修造",
				"动土",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"纳财",
				"安葬",
				"出行",
				"开市",
				"立券",
				"作灶",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"断蚁",
				"会亲友",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"求嗣",
				"嫁娶",
				"纳采",
				"合帐",
				"裁衣",
				"冠笄",
				"伐木",
				"作梁",
				"修造",
				"动土",
				"起基",
				"竖柱",
				"上梁",
				"安门",
				"作灶",
				"筑堤",
				"造畜稠"
			],
			bad: [
				"安葬",
				"出行",
				"祈福",
				"栽种"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"沐浴",
				"塑绘",
				"开光",
				"出火",
				"治病",
				"习艺",
				"伐木",
				"盖屋",
				"竖柱",
				"上梁",
				"安床",
				"作灶",
				"安碓磑",
				"挂匾",
				"掘井",
				"纳畜"
			],
			bad: [
				"出行",
				"安葬",
				"造桥"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"安机械",
				"作灶",
				"纳畜"
			],
			bad: ["动土", "安葬"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"进人口",
				"入宅",
				"移徙",
				"出火",
				"安床",
				"开市",
				"交易",
				"立券",
				"挂匾"
			],
			bad: [
				"安葬",
				"纳畜",
				"出行",
				"行丧",
				"伐木",
				"栽种",
				"造庙",
				"造桥"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"安机械",
				"纳财",
				"牧养"
			],
			bad: ["祈福", "安葬"]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		}
	],
	[
		{
			good: [
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"沐浴",
				"捕捉",
				"畋猎",
				"理发",
				"整手足甲",
				"入殓",
				"除服",
				"成服",
				"破土",
				"安葬",
				"谢土",
				"立碑",
				"修坟",
				"启钻"
			],
			bad: [
				"纳采",
				"订盟",
				"嫁娶",
				"上梁",
				"开市",
				"斋醮",
				"盖屋",
				"安门"
			]
		},
		{
			good: ["解除", "沐浴"],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"会亲友",
				"安机械",
				"纳财",
				"交易",
				"立券",
				"置产"
			],
			bad: [
				"开市",
				"盖屋",
				"治病",
				"作灶"
			]
		},
		{
			good: [
				"纳采",
				"嫁娶",
				"开光",
				"出行",
				"理发",
				"会亲友",
				"开市",
				"安床",
				"栽种",
				"牧养",
				"入殓",
				"移柩",
				"启钻"
			],
			bad: [
				"谢土",
				"祈福",
				"上梁",
				"作灶",
				"斋醮",
				"修造",
				"入宅",
				"安门"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"治病",
				"造车器",
				"修造",
				"动土",
				"移徙",
				"入宅"
			],
			bad: [
				"开市",
				"出行",
				"安床",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"塞穴",
				"断蚁",
				"结网"
			],
			bad: [
				"开市",
				"入宅",
				"嫁娶",
				"开光",
				"盖屋"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"动土",
				"安床",
				"掘井",
				"破土",
				"启钻"
			],
			bad: [
				"入宅",
				"作梁",
				"安门",
				"伐木",
				"修造",
				"上梁",
				"入殓",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"捕捉",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"盖屋",
				"作梁",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"出行",
				"开市",
				"祭祀",
				"祈福",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["斋醮", "安门"]
		},
		{
			good: [
				"祭祀",
				"扫舍",
				"破土",
				"安葬",
				"除服",
				"成服",
				"启钻",
				"移柩",
				"入殓",
				"立碑",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"入宅",
				"修造",
				"动土"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"入学",
				"订盟",
				"冠笄",
				"伐木",
				"修造",
				"动土",
				"起基",
				"放水",
				"交易",
				"开池"
			],
			bad: [
				"造桥",
				"安门",
				"理发",
				"造庙",
				"栽种",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"嫁娶",
				"开市"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"出行",
				"解除",
				"出火",
				"拆卸",
				"动土",
				"入宅",
				"移徙",
				"安床",
				"上梁",
				"栽种",
				"纳畜",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"开市",
				"立券",
				"理发",
				"作灶"
			]
		},
		{
			good: [
				"嫁娶",
				"造车器",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"安机械",
				"移徙",
				"入宅",
				"开市",
				"立券",
				"破土",
				"安葬"
			],
			bad: [
				"纳畜",
				"理发",
				"合寿木"
			]
		},
		{
			good: [
				"祭祀",
				"平治道涂",
				"解除",
				"修饰垣墙",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"会亲友",
				"安机械",
				"结网",
				"冠笄",
				"祭祀",
				"求嗣",
				"进人口",
				"经络"
			],
			bad: [
				"开市",
				"作灶",
				"动土",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"出火",
				"开光",
				"求嗣",
				"出行",
				"拆卸",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种",
				"动土"
			],
			bad: [
				"安葬",
				"行丧",
				"伐木",
				"作梁"
			]
		},
		{
			good: [
				"祭祀",
				"修造",
				"出行",
				"盖屋",
				"竖柱",
				"造车器",
				"教牛马",
				"造畜稠",
				"割蜜"
			],
			bad: [
				"动土",
				"破土",
				"掘井",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"拆卸",
				"修造",
				"移徙",
				"动土",
				"安床",
				"入殓",
				"破土",
				"安葬",
				"启钻"
			],
			bad: [
				"盖屋",
				"开光",
				"理发",
				"造船",
				"掘井",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"结网",
				"畋猎",
				"取渔",
				"会亲友",
				"入学",
				"移柩",
				"启钻",
				"除服",
				"成服"
			],
			bad: [
				"开市",
				"祈福",
				"动土",
				"破土",
				"入殓",
				"安葬",
				"造船"
			]
		},
		{
			good: [
				"祭祀",
				"塞穴",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"祭祀",
				"祈福",
				"修造",
				"动土",
				"安机械",
				"破土",
				"安葬"
			],
			bad: [
				"嫁娶",
				"移徙",
				"出火",
				"开市",
				"入宅"
			]
		}
	],
	[
		{
			good: [
				"解除",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"沐浴",
				"开仓",
				"出货财",
				"开市",
				"交易",
				"立券",
				"纳财",
				"栽种",
				"纳畜",
				"牧养",
				"畋猎",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"祈福",
				"嫁娶",
				"安床",
				"入宅",
				"造船"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"治病",
				"破屋",
				"坏垣",
				"扫舍"
			],
			bad: ["馀事勿取"]
		},
		{
			good: [
				"祈福",
				"斋醮",
				"出行",
				"移徙",
				"入宅",
				"修造",
				"动土",
				"破土",
				"安葬"
			],
			bad: [
				"纳采",
				"开光",
				"安床",
				"嫁娶",
				"开市"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"开光",
				"解除",
				"动土",
				"纳财",
				"交易",
				"纳畜",
				"扫舍"
			],
			bad: [
				"进人口",
				"出行",
				"嫁娶",
				"置产",
				"安床",
				"赴任",
				"安葬",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"移徙",
				"破土",
				"安葬",
				"扫舍",
				"平治道涂"
			],
			bad: [
				"祈福",
				"嫁娶",
				"入宅",
				"安床",
				"作灶"
			]
		},
		{
			good: [
				"开光",
				"求嗣",
				"出行",
				"解除",
				"伐木",
				"出火",
				"拆卸",
				"修造",
				"上梁",
				"起基",
				"入宅",
				"移徙",
				"开市",
				"交易",
				"立券",
				"栽种",
				"牧养",
				"入殓",
				"安葬",
				"除服",
				"成服"
			],
			bad: ["置产", "安床"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"塑绘",
				"开光",
				"入学",
				"解除",
				"扫舍",
				"治病",
				"开池",
				"牧养"
			],
			bad: [
				"嫁娶",
				"出行",
				"纳采",
				"入宅",
				"作灶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"上梁",
				"盖屋",
				"移徙",
				"安门",
				"纳财",
				"牧养",
				"纳畜",
				"安葬",
				"启钻",
				"入殓"
			],
			bad: [
				"破土",
				"置产",
				"掘井",
				"动土",
				"安床"
			]
		},
		{
			good: [
				"冠笄",
				"沐浴",
				"出行",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: [
				"嫁娶",
				"开市",
				"祭祀",
				"祈福",
				"斋醮",
				"纳采",
				"修坟"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"开市",
				"出行",
				"解除",
				"动土",
				"起基",
				"置产",
				"栽种"
			],
			bad: [
				"嫁娶",
				"作灶",
				"修坟",
				"安门",
				"入宅",
				"立碑",
				"安葬",
				"安床"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"捕捉",
				"畋猎",
				"结网",
				"扫舍"
			],
			bad: [
				"嫁娶",
				"纳采",
				"订盟",
				"安床",
				"动土",
				"破土",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"沐浴",
				"理发",
				"扫舍"
			],
			bad: [
				"伐木",
				"纳畜",
				"上梁",
				"入宅",
				"作灶",
				"造畜稠",
				"嫁娶",
				"安葬",
				"作梁",
				"造船",
				"安门"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"补垣",
				"塞穴",
				"断蚁",
				"解除",
				"馀事勿取"
			],
			bad: [
				"造庙",
				"入宅",
				"修造",
				"安葬",
				"行丧",
				"嫁娶"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"入宅",
				"移徙",
				"上梁",
				"挂匾",
				"开池",
				"入殓",
				"安葬",
				"破土",
				"启钻"
			],
			bad: [
				"嫁娶",
				"作灶",
				"安床"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"移徙",
				"开市",
				"入宅"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"出火",
				"拆卸",
				"入宅",
				"安床",
				"修造",
				"安门",
				"纳畜",
				"启钻",
				"安葬"
			],
			bad: [
				"动土",
				"破土",
				"纳财",
				"掘井",
				"挂匾",
				"开市",
				"伐木",
				"交易"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"求嗣",
				"安机械",
				"纳畜",
				"移徙",
				"入宅",
				"塑绘",
				"开光",
				"起基",
				"竖柱",
				"上梁",
				"作灶",
				"安门",
				"安香",
				"出火",
				"盖屋",
				"启钻",
				"安葬"
			],
			bad: [
				"动土",
				"破土",
				"嫁娶"
			]
		},
		{
			good: [
				"祭祀",
				"理发",
				"修饰垣墙",
				"平治道涂",
				"沐浴",
				"整手足甲",
				"扫舍"
			],
			bad: [
				"出行",
				"安门",
				"修造",
				"嫁娶",
				"上梁",
				"入宅"
			]
		},
		{
			good: [
				"纳财",
				"开市",
				"交易",
				"立券",
				"出行",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"扫舍",
				"起基",
				"竖柱",
				"安床",
				"移徙",
				"开仓",
				"出货财",
				"补垣",
				"塞穴",
				"栽种",
				"纳畜",
				"牧养"
			],
			bad: [
				"斋醮",
				"入宅",
				"安门",
				"安葬",
				"破土",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"沐浴",
				"理发",
				"整手足甲",
				"入殓",
				"移柩",
				"破土",
				"安葬",
				"扫舍"
			],
			bad: [
				"嫁娶",
				"会亲友",
				"进人口",
				"出行",
				"入宅",
				"移徙",
				"赴任",
				"作灶"
			]
		},
		{
			good: ["祭祀", "出行"],
			bad: [
				"嫁娶",
				"入宅",
				"修造",
				"动土",
				"会亲友",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"裁衣",
				"理发",
				"安床",
				"作灶",
				"造畜稠",
				"放水",
				"筑堤",
				"补垣",
				"塞穴",
				"整手足甲",
				"扫舍"
			],
			bad: [
				"嫁娶",
				"开光",
				"会亲友",
				"掘井",
				"安门",
				"栽种"
			]
		},
		{
			good: [
				"开市",
				"纳财",
				"出行",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"问名",
				"入学",
				"起基",
				"定磉",
				"置产",
				"开渠",
				"掘井",
				"拆卸",
				"栽种",
				"纳畜",
				"牧养",
				"动土",
				"破土",
				"启钻"
			],
			bad: [
				"移徙",
				"入宅",
				"出火",
				"入殓",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"开光",
				"祈福",
				"解除",
				"作梁",
				"动土",
				"安床",
				"掘井",
				"栽种",
				"纳畜",
				"破土",
				"移柩"
			],
			bad: [
				"嫁娶",
				"出行",
				"赴任",
				"盖屋",
				"入殓",
				"入宅",
				"移徙",
				"出火",
				"进人口",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"问名",
				"祭祀",
				"冠笄",
				"裁衣",
				"会亲友",
				"进人口",
				"纳财",
				"捕捉",
				"作灶"
			],
			bad: [
				"开市",
				"安床",
				"安葬",
				"修坟"
			]
		},
		{
			good: [
				"结网",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"破土"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"祭祀",
				"出行",
				"会亲友",
				"修造",
				"动土",
				"入殓",
				"破土"
			],
			bad: [
				"塑绘",
				"开光",
				"造桥",
				"除服",
				"成服"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"斋醮",
				"开光",
				"祭祀",
				"祈福",
				"求医",
				"治病",
				"会亲友",
				"动土",
				"解除",
				"捕捉",
				"纳畜",
				"牧养",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"移徙",
				"入宅",
				"盖屋",
				"架马"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开光",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"拆卸",
				"动土",
				"修造",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"挂匾",
				"交易",
				"立券",
				"栽种",
				"纳畜",
				"入殓",
				"破土",
				"启钻",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"修饰垣墙",
				"平治道涂"
			],
			bad: [
				"开市",
				"动土",
				"破土",
				"嫁娶",
				"修造",
				"安葬"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"进人口",
				"纳畜",
				"补垣",
				"塞穴",
				"栽种",
				"牧养"
			],
			bad: [
				"嫁娶",
				"纳财",
				"祈福",
				"安葬",
				"修造",
				"开市",
				"交易",
				"立券",
				"动土",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"出行",
				"修造",
				"动土",
				"移徙",
				"入宅"
			],
			bad: [
				"针灸",
				"伐木",
				"作梁",
				"造庙",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"出行",
				"裁衣",
				"冠笄",
				"会亲友",
				"造畜稠",
				"嫁娶",
				"竖柱",
				"上梁",
				"移徙",
				"纳财",
				"纳畜"
			],
			bad: [
				"动土",
				"伐木",
				"作梁",
				"行丧",
				"安葬",
				"开生坟"
			]
		},
		{
			good: [
				"祭祀",
				"理发",
				"置产",
				"塞穴",
				"除服",
				"成服",
				"移柩",
				"入殓",
				"破土",
				"安葬"
			],
			bad: [
				"嫁娶",
				"入宅",
				"安床",
				"掘井",
				"开光"
			]
		}
	],
	[
		{
			good: [
				"作梁",
				"修造",
				"动土",
				"安门",
				"作灶",
				"塞穴",
				"开池",
				"开厕",
				"筑堤",
				"补垣",
				"栽种"
			],
			bad: [
				"嫁娶",
				"祈福",
				"掘井",
				"行丧",
				"安葬",
				"安床"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"会亲友",
				"祭祀",
				"斋醮",
				"沐浴",
				"塑绘",
				"出火",
				"开光",
				"竖柱",
				"上梁",
				"开市",
				"交易",
				"立券",
				"作梁",
				"开柱眼",
				"伐木",
				"架马",
				"安门",
				"安床",
				"拆卸",
				"牧养",
				"造畜稠",
				"掘井"
			],
			bad: [
				"造庙",
				"嫁娶",
				"出行",
				"动土",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"移徙",
				"祭祀",
				"开光",
				"祈福",
				"出行",
				"解除",
				"进人口",
				"雇佣",
				"安床",
				"动土",
				"起基",
				"上梁",
				"安门"
			],
			bad: [
				"嫁娶",
				"安葬",
				"破土",
				"作梁",
				"纳畜",
				"牧养",
				"行丧",
				"作灶"
			]
		},
		{
			good: [
				"开光",
				"求嗣",
				"出行",
				"纳采",
				"冠笄",
				"出火",
				"拆卸",
				"起基",
				"修造",
				"动土",
				"上梁",
				"移徙",
				"造船",
				"开市",
				"交易",
				"立券",
				"纳财"
			],
			bad: [
				"祈福",
				"嫁娶",
				"安葬",
				"破土"
			]
		},
		{
			good: [
				"塞穴",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["行丧", "安葬"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"伐木",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"安床",
				"入宅",
				"移徙"
			],
			bad: [
				"嫁娶",
				"开市",
				"交易",
				"行丧",
				"安葬",
				"修坟"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"开光",
				"安香",
				"出火",
				"立券",
				"安机械",
				"移徙",
				"入宅",
				"竖柱",
				"上梁",
				"会亲友",
				"安床",
				"拆卸",
				"挂匾",
				"牧养",
				"教牛马"
			],
			bad: [
				"嫁娶",
				"安葬",
				"行丧",
				"破土",
				"修坟"
			]
		},
		{
			good: [
				"作灶",
				"沐浴",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"出行",
				"开市",
				"交易",
				"立券",
				"安机械",
				"出火",
				"上梁",
				"移徙"
			],
			bad: [
				"嫁娶",
				"安葬",
				"动土",
				"造桥"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"移徙",
				"伐木",
				"安床",
				"纳畜",
				"出火",
				"拆卸"
			],
			bad: [
				"安葬",
				"修坟",
				"作灶",
				"破土",
				"造庙",
				"动土",
				"嫁娶",
				"纳采"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"出行",
				"馀事勿取"
			],
			bad: [
				"开市",
				"动土",
				"破土",
				"行丧",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"安葬",
				"启钻",
				"移柩",
				"入殓",
				"除服",
				"成服"
			],
			bad: ["馀事勿取"]
		},
		{
			good: [
				"交易",
				"立券",
				"纳财",
				"安床",
				"裁衣",
				"造畜稠",
				"安葬",
				"谢土",
				"启钻",
				"除服",
				"成服",
				"修坟",
				"立碑",
				"移柩",
				"入殓"
			],
			bad: [
				"开光",
				"嫁娶",
				"开市",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"祈福",
				"求嗣",
				"解除",
				"动土",
				"安床",
				"栽种",
				"开池",
				"掘井",
				"祭祀",
				"破土",
				"启钻"
			],
			bad: [
				"入宅",
				"作灶",
				"伐木",
				"安葬",
				"出火",
				"出行",
				"纳畜"
			]
		},
		{
			good: [
				"理发",
				"冠笄",
				"嫁娶",
				"进人口",
				"栽种",
				"捕捉",
				"针灸"
			],
			bad: [
				"纳财",
				"开市",
				"安葬",
				"破土"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"解除",
				"纳采",
				"冠笄",
				"出火",
				"拆卸",
				"进人口",
				"安床",
				"动土",
				"上梁",
				"造庙",
				"掘井",
				"开池",
				"入殓",
				"移柩",
				"安葬",
				"破土"
			],
			bad: ["无"]
		},
		{
			good: [
				"沐浴",
				"扫舍",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"开市",
				"嫁娶",
				"作灶"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"沐浴",
				"理发",
				"捕捉",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"出火",
				"嫁娶",
				"入宅",
				"作灶",
				"上梁",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"求嗣",
				"开光",
				"出行",
				"伐木",
				"作梁",
				"出火",
				"解除",
				"拆卸",
				"进人口",
				"修造",
				"动土",
				"起基",
				"安床",
				"栽种",
				"纳畜",
				"入殓",
				"破土",
				"安葬",
				"除服",
				"成服"
			],
			bad: ["嫁娶", "移徙"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"嫁娶",
				"移徙",
				"出行",
				"上梁",
				"入宅"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"会亲友",
				"开光",
				"理发",
				"入殓",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: [
				"嫁娶",
				"作灶",
				"出火",
				"出行",
				"入宅",
				"移徙",
				"安床",
				"祈福",
				"上梁"
			]
		},
		{
			good: [
				"嫁娶",
				"造车器",
				"出行",
				"会亲友",
				"移徙",
				"入宅",
				"修造",
				"动土",
				"雕刻",
				"开光",
				"安香",
				"出火",
				"理发",
				"盖屋",
				"合脊",
				"起基",
				"归岫",
				"安门",
				"拆卸",
				"扫舍",
				"栽种",
				"造畜稠"
			],
			bad: [
				"开市",
				"纳采",
				"造庙",
				"安床",
				"开渠",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"出火",
				"拆卸",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入宅",
				"移徙",
				"安床",
				"栽种"
			],
			bad: [
				"作灶",
				"塑绘",
				"行丧",
				"词讼",
				"伐木",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"教牛马",
				"会亲友",
				"馀事勿取"
			],
			bad: [
				"破土",
				"动土",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"合帐",
				"裁衣",
				"经络",
				"伐木",
				"作梁",
				"安床",
				"作灶",
				"入殓",
				"安葬",
				"启钻",
				"移柩"
			],
			bad: [
				"词讼",
				"出火",
				"入宅"
			]
		},
		{
			good: [
				"开光",
				"祈福",
				"求嗣",
				"出行",
				"解除",
				"伐木",
				"盖屋",
				"起基",
				"修造",
				"架马",
				"安门",
				"移徙",
				"入宅",
				"造庙",
				"除服",
				"成服",
				"移柩",
				"谢土",
				"纳畜",
				"牧养"
			],
			bad: [
				"纳采",
				"动土",
				"开市",
				"交易"
			]
		},
		{
			good: [
				"解除",
				"破屋",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"安机械",
				"会亲友",
				"开光",
				"求医",
				"治病",
				"盖屋",
				"起基",
				"修造",
				"动土",
				"定磉",
				"竖柱",
				"上梁",
				"安门",
				"作灶",
				"放水",
				"开厕",
				"开池",
				"栽种",
				"牧养",
				"造畜稠",
				"破土",
				"安葬",
				"立碑"
			],
			bad: [
				"嫁娶",
				"出火",
				"移徙",
				"入宅"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"开池",
				"开厕",
				"结网",
				"祭祀",
				"修造",
				"动土",
				"安床",
				"放水",
				"经络",
				"破土"
			],
			bad: [
				"嫁娶",
				"造桥",
				"词讼",
				"移徙",
				"安门",
				"作灶",
				"栽种"
			]
		},
		{
			good: [
				"求医",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["嫁娶", "出行"]
		},
		{
			good: [
				"祭祀",
				"塞穴",
				"入殓",
				"破土",
				"安葬",
				"移柩",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"造车器",
				"安机械",
				"祭祀",
				"祈福",
				"开光",
				"安香",
				"出火",
				"出行",
				"开市",
				"立券",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: [
				"纳采",
				"订盟",
				"架马",
				"词讼",
				"开渠"
			]
		},
		{
			good: [
				"造畜稠",
				"平治道涂",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"塑绘",
				"会亲友",
				"安机械",
				"塞穴",
				"结网",
				"裁衣",
				"经络"
			],
			bad: [
				"嫁娶",
				"开市",
				"祈福",
				"斋醮",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"理发",
				"开光",
				"解除",
				"拆卸",
				"修造",
				"安葬",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"安床",
				"栽种"
			],
			bad: [
				"入宅",
				"移徙",
				"作灶",
				"祈福",
				"祭祀",
				"嫁娶",
				"谢土",
				"掘井",
				"盖屋",
				"探病"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"移徙",
				"纳财",
				"开市",
				"交易",
				"立券",
				"入宅",
				"会亲友",
				"解除",
				"求医",
				"治病",
				"入学",
				"安床",
				"安门",
				"安香",
				"出火",
				"拆卸",
				"扫舍",
				"挂匾",
				"开生坟",
				"合寿木",
				"破土",
				"修坟",
				"启钻",
				"入殓"
			],
			bad: [
				"探病",
				"祭祀",
				"出行",
				"上梁",
				"盖屋",
				"谢土",
				"安葬"
			]
		},
		{
			good: [
				"裁衣",
				"伐木",
				"作梁",
				"纳财",
				"交易",
				"立券"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"裁衣",
				"经络",
				"伐木",
				"开柱眼",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"合脊",
				"合寿木",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"启钻",
				"修坟",
				"立碑"
			],
			bad: [
				"祭祀",
				"嫁娶",
				"出行",
				"掘井"
			]
		},
		{
			good: [
				"嫁娶",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"拆卸",
				"出火",
				"开市",
				"立券",
				"交易",
				"入宅",
				"移徙",
				"安床",
				"动土",
				"破土",
				"谢土"
			],
			bad: [
				"祭祀",
				"入殓",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"栽种",
				"捕捉",
				"畋猎",
				"馀事勿取"
			],
			bad: [
				"开市",
				"动土",
				"祭祀",
				"斋醮",
				"安葬",
				"探病"
			]
		},
		{
			good: [
				"开市",
				"交易",
				"立券",
				"纳财",
				"栽种",
				"安床",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"入殓",
				"安葬",
				"破土",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"出火",
				"伐木",
				"祭祀",
				"入宅",
				"移徙",
				"纳畜",
				"探病"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"移徙",
				"入宅",
				"出行",
				"开市",
				"交易",
				"立券",
				"纳财",
				"会亲友",
				"安香",
				"出火",
				"拆卸",
				"盖屋",
				"起基",
				"安床",
				"作灶",
				"挂匾",
				"安葬",
				"破土",
				"启钻",
				"立碑",
				"入殓",
				"移柩"
			],
			bad: [
				"祈福",
				"上梁",
				"开仓",
				"掘井",
				"牧养"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"沐浴",
				"捕捉",
				"入殓",
				"除服",
				"成服",
				"破土",
				"启钻",
				"安葬"
			],
			bad: [
				"祭祀",
				"嫁娶",
				"安床",
				"开市",
				"入宅",
				"探病",
				"上梁"
			]
		},
		{
			good: [
				"入殓",
				"破土",
				"安葬",
				"启钻",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"纳采",
				"移徙",
				"纳财",
				"开市",
				"交易",
				"立券",
				"入宅",
				"修造",
				"动土",
				"竖柱",
				"起基",
				"定磉",
				"造庙",
				"安香",
				"出火",
				"修饰垣墙",
				"平治道涂",
				"会亲友",
				"出行",
				"开池",
				"开厕"
			],
			bad: [
				"开仓",
				"盖屋",
				"造桥",
				"祭祀"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"修饰垣墙",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"求嗣",
				"会亲友",
				"解除",
				"出行",
				"入学",
				"纳财",
				"开市",
				"交易",
				"立券",
				"习艺",
				"经络",
				"安床",
				"开仓",
				"出货财",
				"纳畜",
				"安葬",
				"启钻",
				"修坟",
				"入殓"
			],
			bad: [
				"入宅",
				"开光",
				"动土"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"出火",
				"拆卸",
				"动土",
				"上梁",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"入殓",
				"破土",
				"安葬",
				"启钻",
				"除服",
				"成服"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"会亲友",
				"立券",
				"交易",
				"裁衣",
				"合帐",
				"嫁娶",
				"冠笄",
				"进人口"
			],
			bad: [
				"栽种",
				"动土",
				"安葬",
				"掘井",
				"修坟",
				"探病"
			]
		},
		{
			good: [
				"祭祀",
				"裁衣",
				"冠笄",
				"安床",
				"交易",
				"立券",
				"开池",
				"补垣",
				"塞穴",
				"入殓",
				"破土",
				"启钻",
				"安葬",
				"谢土",
				"除服",
				"成服"
			],
			bad: [
				"嫁娶",
				"掘井",
				"探病",
				"开市",
				"开光",
				"栽种"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"订盟",
				"纳采",
				"解除",
				"出行",
				"动土",
				"破土",
				"习艺",
				"针灸",
				"理发",
				"会亲友",
				"起基",
				"修造",
				"竖柱",
				"定磉",
				"安床",
				"拆卸",
				"纳畜",
				"牧养",
				"放水",
				"除服",
				"成服",
				"修坟",
				"立碑"
			],
			bad: [
				"开市",
				"入宅",
				"探病",
				"出火",
				"盖屋"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"斋醮",
				"出行",
				"纳采",
				"订盟",
				"安机械",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"移徙",
				"入宅",
				"造庙",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"谢土"
			],
			bad: [
				"嫁娶",
				"开市",
				"栽种",
				"合寿木"
			]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"移柩",
				"结网",
				"启钻",
				"安葬",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: ["馀事勿取"],
			bad: ["探病"]
		},
		{
			good: [
				"祭祀",
				"入殓",
				"移柩",
				"开生坟",
				"破土",
				"启钻",
				"安葬",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"订盟",
				"纳采",
				"纳财",
				"开市",
				"立券",
				"祭祀",
				"祈福",
				"移徙",
				"入宅",
				"出行",
				"盖屋",
				"起基",
				"修造",
				"动土",
				"竖柱",
				"上梁",
				"安门",
				"安香",
				"出火",
				"教牛马",
				"会亲友",
				"破土"
			],
			bad: [
				"嫁娶",
				"安葬",
				"掘井",
				"置产",
				"造船"
			]
		}
	],
	[
		{
			good: [
				"入宅",
				"安床",
				"开光",
				"祭祀",
				"出火",
				"拆卸",
				"动土",
				"挂匾",
				"入殓",
				"破土",
				"安葬",
				"纳畜"
			],
			bad: [
				"嫁娶",
				"开市",
				"作灶",
				"置产",
				"作梁",
				"伐木"
			]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"嫁娶",
				"会亲友",
				"进人口",
				"裁衣",
				"结网",
				"平治道涂"
			],
			bad: [
				"移徙",
				"入宅",
				"造庙",
				"作灶",
				"治病",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"纳采",
				"出行",
				"会亲友",
				"上梁",
				"安机械",
				"安床",
				"牧养",
				"畋猎",
				"祭祀",
				"祈福",
				"开光",
				"修造",
				"安门",
				"盖屋",
				"起基"
			],
			bad: [
				"入宅",
				"作灶",
				"治病",
				"安葬",
				"移徙"
			]
		},
		{
			good: [
				"扫舍",
				"塞穴",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"出行",
				"教牛马",
				"扫舍",
				"馀事勿取"
			],
			bad: [
				"开光",
				"伐木",
				"安葬",
				"破土"
			]
		},
		{
			good: ["馀事勿取"],
			bad: ["无"]
		},
		{
			good: [
				"解除",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"进人口",
				"纳财",
				"纳畜",
				"牧养",
				"捕捉",
				"馀事勿取"
			],
			bad: [
				"开市",
				"入宅",
				"安床",
				"动土",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"出火",
				"拆卸",
				"祭祀",
				"祈福",
				"开光",
				"伐木",
				"动土",
				"开市",
				"交易",
				"立券",
				"入宅",
				"移徙",
				"安床",
				"纳畜",
				"入殓",
				"安葬"
			],
			bad: [
				"栽种",
				"作灶",
				"针灸",
				"出行"
			]
		},
		{
			good: [
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"安香",
				"出火",
				"修造",
				"动土",
				"上梁",
				"安门",
				"起基",
				"竖柱",
				"定磉",
				"开池",
				"移徙",
				"入宅",
				"立券",
				"破土"
			],
			bad: [
				"嫁娶",
				"造庙",
				"造桥",
				"造船",
				"作灶",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"解除",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"订盟",
				"纳采",
				"祭祀",
				"祈福",
				"塑绘",
				"开光",
				"移徙",
				"安床",
				"伐木",
				"作梁",
				"捕捉",
				"畋猎",
				"结网",
				"求医",
				"治病",
				"解除",
				"安葬",
				"除服",
				"成服",
				"移柩",
				"入殓",
				"立碑",
				"谢土"
			],
			bad: [
				"开市",
				"造庙",
				"动土",
				"破土"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"解除",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"安碓磑",
				"结网",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		},
		{
			good: [
				"修饰垣墙",
				"平治道涂",
				"祭祀",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"塑绘",
				"开光",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"安机械",
				"会亲友",
				"纳财",
				"开市",
				"立券",
				"交易",
				"安床",
				"竖柱",
				"上梁",
				"结网",
				"栽种",
				"解除",
				"经络"
			],
			bad: [
				"作灶",
				"出行",
				"入宅",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"纳采",
				"订盟",
				"解除",
				"栽种",
				"纳畜",
				"牧养",
				"扫舍",
				"进人口"
			],
			bad: [
				"修坟",
				"造桥",
				"作灶",
				"出行",
				"安葬",
				"盖屋",
				"入宅"
			]
		},
		{
			good: [
				"塞穴",
				"断蚁",
				"结网",
				"馀事勿取"
			],
			bad: ["破土", "安葬"]
		},
		{
			good: [
				"修造",
				"动土",
				"起基",
				"安门",
				"安床",
				"栽种",
				"筑堤",
				"补垣",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"掘井",
				"入宅",
				"移徙",
				"出火",
				"出行",
				"行丧",
				"安葬",
				"开光",
				"理发",
				"进人口"
			]
		},
		{
			good: [
				"祭祀",
				"塑绘",
				"开光",
				"求医",
				"治病",
				"嫁娶",
				"会亲友",
				"放水",
				"掘井",
				"牧养",
				"纳畜",
				"开渠",
				"安碓磑"
			],
			bad: [
				"盖屋",
				"入宅",
				"作灶",
				"入学",
				"安葬",
				"行丧"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"解除",
				"进人口",
				"交易",
				"立券",
				"纳财",
				"纳畜"
			],
			bad: [
				"动土",
				"破土",
				"嫁娶",
				"理发",
				"出行",
				"入宅",
				"移徙",
				"分居",
				"安香",
				"出火"
			]
		},
		{
			good: [
				"开光",
				"求嗣",
				"雕刻",
				"嫁娶",
				"订盟",
				"纳采",
				"出火",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"上梁",
				"放水",
				"移徙",
				"入宅",
				"造仓",
				"造船",
				"开市",
				"开池",
				"纳畜",
				"牧养",
				"挂匾"
			],
			bad: [
				"行丧",
				"安葬",
				"合寿木"
			]
		},
		{
			good: [
				"嫁娶",
				"求嗣",
				"纳采",
				"进人口",
				"纳财",
				"结网",
				"纳畜",
				"牧养",
				"会亲友"
			],
			bad: [
				"上梁",
				"作灶",
				"伐木",
				"出行",
				"安葬",
				"安门",
				"理发"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"祭祀",
				"馀事勿取"
			],
			bad: ["嫁娶", "安葬"]
		}
	],
	[
		{
			good: [
				"破屋",
				"坏垣",
				"祭祀",
				"沐浴",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"沐浴",
				"裁衣",
				"出行",
				"理发",
				"移徙",
				"捕捉",
				"畋猎",
				"放水",
				"入宅",
				"除服",
				"成服",
				"启钻",
				"安葬",
				"移柩",
				"入殓"
			],
			bad: [
				"盖屋",
				"开市",
				"动土",
				"破土"
			]
		},
		{
			good: [
				"造车器",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"移徙",
				"出行",
				"开市",
				"出火",
				"入宅",
				"立券",
				"交易",
				"安门",
				"安床",
				"安葬",
				"谢土"
			],
			bad: [
				"开光",
				"盖屋",
				"动土",
				"作灶",
				"栽种"
			]
		},
		{
			good: [
				"祭祀",
				"嫁娶",
				"纳婿",
				"除服",
				"成服",
				"入殓",
				"移柩"
			],
			bad: [
				"动土",
				"作灶",
				"入宅",
				"开光",
				"安床"
			]
		},
		{
			good: [
				"开光",
				"出行",
				"交易",
				"塞穴",
				"嫁娶",
				"理发",
				"开市",
				"安床"
			],
			bad: [
				"祈福",
				"出火",
				"置产",
				"动土",
				"破土",
				"安葬",
				"修造",
				"上梁",
				"入宅"
			]
		},
		{
			good: [
				"开光",
				"出行",
				"纳采",
				"嫁娶",
				"伐木",
				"架马",
				"出火",
				"拆卸",
				"移徙",
				"入宅",
				"造庙",
				"造桥",
				"造船",
				"造畜稠",
				"开市",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"教牛马",
				"断蚁",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"移徙",
				"入宅",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"塞穴",
				"结网",
				"畋猎",
				"馀事勿取"
			],
			bad: [
				"移徙",
				"开市",
				"入宅",
				"嫁娶",
				"开光",
				"安门"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"安床",
				"栽种",
				"移柩",
				"进人口",
				"会亲友",
				"除服",
				"成服"
			],
			bad: [
				"盖屋",
				"入殓",
				"安葬",
				"伐木",
				"入宅",
				"移徙",
				"置产",
				"纳畜"
			]
		},
		{
			good: [
				"祭祀",
				"嫁娶",
				"捕捉"
			],
			bad: [
				"开光",
				"动土",
				"破土",
				"开市",
				"修造",
				"入宅",
				"安门"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"开市",
				"开光",
				"出行",
				"入宅",
				"移徙",
				"出火",
				"拆卸",
				"修造",
				"安床"
			],
			bad: [
				"纳畜",
				"伐木",
				"置产",
				"作梁",
				"行丧",
				"安葬",
				"修坟",
				"立碑"
			]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"冠笄",
				"裁衣",
				"伐木",
				"作梁",
				"架马",
				"定磉",
				"开柱眼",
				"作灶",
				"移徙",
				"安床",
				"畋猎",
				"结网",
				"开池",
				"开厕",
				"除服",
				"成服",
				"启钻",
				"入殓",
				"移柩",
				"安葬"
			],
			bad: [
				"盖屋",
				"造船",
				"动土",
				"破土"
			]
		}
	],
	[
		{
			good: [
				"安床",
				"祭祀",
				"祈福",
				"求嗣",
				"冠笄",
				"伐木",
				"架马",
				"动土",
				"开池",
				"开厕",
				"结网",
				"入殓",
				"除服",
				"成服"
			],
			bad: [
				"安门",
				"栽种",
				"作灶",
				"治病"
			]
		},
		{
			good: [
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"安葬"
			]
		},
		{
			good: [
				"动土",
				"入殓",
				"嫁娶",
				"移柩",
				"安葬",
				"破土"
			],
			bad: [
				"开市",
				"作灶",
				"安床",
				"入宅",
				"上梁",
				"裁衣"
			]
		},
		{
			good: [
				"祈福",
				"求嗣",
				"开光",
				"塑绘",
				"斋醮",
				"订盟",
				"纳采",
				"嫁娶",
				"拆卸",
				"安床",
				"入宅",
				"安香",
				"移柩",
				"修坟",
				"安葬",
				"谢土",
				"栽种",
				"解除",
				"冠笄",
				"裁衣",
				"移徙",
				"修造",
				"动土",
				"竖柱",
				"放水",
				"启钻",
				"立碑"
			],
			bad: ["赴任"]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"畋猎",
				"结网",
				"修饰垣墙",
				"平治道涂",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"安床",
				"治病"
			]
		},
		{
			good: [
				"进人口",
				"牧养",
				"置产",
				"塞穴",
				"结网",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"嫁娶",
				"祭祀",
				"祈福",
				"开市",
				"纳财",
				"立券",
				"移徙",
				"出行",
				"修造",
				"动土",
				"起基",
				"定磉",
				"竖柱",
				"拆卸",
				"扫舍",
				"放水",
				"安香",
				"安床",
				"造船",
				"开池",
				"掘井",
				"造畜稠",
				"栽种"
			],
			bad: [
				"行丧",
				"安葬",
				"破土",
				"作灶",
				"伐木",
				"斋醮"
			]
		},
		{
			good: [
				"开市",
				"纳财",
				"祭祀",
				"塑绘",
				"安机械",
				"冠笄",
				"会亲友",
				"裁衣",
				"开仓",
				"经络",
				"纳畜",
				"造畜稠",
				"教牛马",
				"牧养"
			],
			bad: [
				"动土",
				"破土",
				"安葬",
				"治病"
			]
		},
		{
			good: [
				"祭祀",
				"动土",
				"筑堤",
				"开池",
				"会亲友",
				"塞穴",
				"入殓",
				"移柩",
				"破土",
				"安葬"
			],
			bad: [
				"开光",
				"出行",
				"修造",
				"上梁",
				"入宅",
				"安门",
				"作灶",
				"裁衣"
			]
		},
		{
			good: [
				"祭祀",
				"普渡",
				"解除",
				"会亲友",
				"捕捉",
				"畋猎",
				"启钻",
				"除服",
				"成服",
				"移柩"
			],
			bad: [
				"嫁娶",
				"开市",
				"动土",
				"掘井",
				"开池",
				"安葬"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"作灶",
				"纳财"
			],
			bad: [
				"安葬",
				"开市",
				"修坟",
				"立碑"
			]
		},
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"开光",
				"会亲友",
				"解除",
				"入学",
				"纳财",
				"交易",
				"立券",
				"经络",
				"起基",
				"动土",
				"定磉",
				"开池",
				"栽种",
				"纳畜",
				"牧养",
				"破土",
				"入殓",
				"立碑",
				"安葬"
			],
			bad: [
				"嫁娶",
				"开市",
				"入宅",
				"出火",
				"移徙"
			]
		}
	],
	[
		{
			good: [
				"解除",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"祭祀",
				"求嗣",
				"出火",
				"塑绘",
				"裁衣",
				"会亲友",
				"入学",
				"拆卸",
				"扫舍",
				"造仓",
				"挂匾",
				"掘井",
				"开池",
				"结网",
				"栽种",
				"纳畜",
				"破土",
				"修坟",
				"立碑",
				"安葬",
				"入殓"
			],
			bad: [
				"祈福",
				"嫁娶",
				"造庙",
				"安床",
				"谢土"
			]
		},
		{
			good: [
				"求医",
				"治病",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["开市", "嫁娶"]
		},
		{
			good: [
				"祭祀",
				"解除",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"修坟",
				"立碑",
				"谢土",
				"沐浴",
				"扫舍",
				"捕捉",
				"取渔",
				"结网",
				"畋猎",
				"理发"
			],
			bad: [
				"安床",
				"嫁娶",
				"作灶",
				"入宅"
			]
		},
		{
			good: [
				"沐浴",
				"祭祀",
				"解除",
				"安葬",
				"破土",
				"谢土",
				"移柩",
				"馀事勿取"
			],
			bad: [
				"斋醮",
				"开光",
				"嫁娶",
				"入宅",
				"上梁"
			]
		},
		{
			good: [
				"开光",
				"出行",
				"嫁娶"
			],
			bad: [
				"会亲友",
				"进人口",
				"修造",
				"动土",
				"起基",
				"移徙",
				"开市",
				"纳畜",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"破土",
				"安葬",
				"修坟",
				"立碑"
			]
		},
		{
			good: [
				"嫁娶",
				"开光",
				"祭祀",
				"祈福",
				"出行",
				"解除",
				"移徙",
				"入宅",
				"开市",
				"纳财",
				"起基",
				"修造",
				"竖柱",
				"上梁",
				"盖屋",
				"作灶",
				"出火",
				"安香",
				"补垣",
				"塞穴",
				"拆卸",
				"放水",
				"扫舍",
				"造仓",
				"造船",
				"栽种",
				"安葬"
			],
			bad: [
				"纳采",
				"订盟",
				"安床",
				"谢土",
				"破土",
				"动土"
			]
		},
		{
			good: [
				"移徙",
				"入宅",
				"治病",
				"会亲友",
				"祭祀",
				"祈福",
				"斋醮",
				"安香",
				"嫁娶",
				"盖屋",
				"起基"
			],
			bad: [
				"开市",
				"安床",
				"出行",
				"经络"
			]
		},
		{
			good: [
				"祭祀",
				"裁衣",
				"安门",
				"纳财",
				"扫舍",
				"出行",
				"进人口",
				"作灶",
				"纳畜",
				"造畜稠"
			],
			bad: [
				"安床",
				"动土",
				"安葬",
				"开生坟",
				"合寿木"
			]
		},
		{
			good: [
				"出行",
				"解除",
				"冠笄",
				"嫁娶",
				"伐木",
				"架马",
				"开柱眼",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"开生坟",
				"合寿木",
				"入殓",
				"移柩",
				"破土",
				"安葬",
				"修坟"
			],
			bad: [
				"祭祀",
				"祈福",
				"开光",
				"开市",
				"安床"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"出火",
				"进人口",
				"开市",
				"交易",
				"立券",
				"挂匾",
				"纳财",
				"入宅",
				"移徙",
				"栽种",
				"破土",
				"谢土"
			],
			bad: ["安床", "安葬"]
		},
		{
			good: [
				"捕捉",
				"畋猎",
				"会亲友",
				"解除",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"馀事勿取"
			],
			bad: [
				"安床",
				"安门",
				"破土",
				"修坟",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"开光",
				"理发",
				"整手足甲",
				"安床",
				"作灶",
				"扫舍",
				"教牛马"
			],
			bad: [
				"伐木",
				"纳畜",
				"破土",
				"安葬",
				"开生坟",
				"嫁娶",
				"开市",
				"动土",
				"交易",
				"作梁"
			]
		},
		{
			good: [
				"入殓",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"安葬",
				"修坟",
				"立碑"
			],
			bad: [
				"开市",
				"伐木",
				"嫁娶",
				"作梁"
			]
		},
		{
			good: [
				"祭祀",
				"斋醮",
				"沐浴",
				"开生坟",
				"除服",
				"成服",
				"移柩",
				"入殓",
				"破土",
				"安葬",
				"合寿木"
			],
			bad: [
				"开市",
				"嫁娶",
				"安床",
				"会亲友",
				"入宅",
				"作灶",
				"上梁"
			]
		},
		{
			good: ["破屋", "坏垣"],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"祭祀",
				"解除",
				"入殓",
				"移柩",
				"启钻",
				"安葬",
				"整手足甲",
				"捕捉",
				"畋猎",
				"取渔",
				"除服",
				"成服",
				"扫舍",
				"谢土",
				"斋醮"
			],
			bad: ["动土", "破土"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"出行",
				"祭祀",
				"祈福",
				"开市",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["安门"]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"理发",
				"作灶",
				"修饰垣墙",
				"平治道涂",
				"整手足甲",
				"沐浴",
				"冠笄"
			],
			bad: [
				"破土",
				"出行",
				"栽种"
			]
		},
		{
			good: [
				"塑绘",
				"出行",
				"冠笄",
				"嫁娶",
				"进人口",
				"裁衣",
				"纳婿",
				"造畜稠",
				"交易",
				"立券",
				"牧养",
				"开生坟",
				"入殓",
				"除服",
				"成服",
				"移柩",
				"安葬",
				"启钻"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"解除",
				"拆卸",
				"修造",
				"动土",
				"起基",
				"上梁",
				"安床",
				"安门",
				"开渠",
				"开池",
				"入殓",
				"破土",
				"启钻"
			],
			bad: [
				"嫁娶",
				"出行",
				"进人口",
				"作灶",
				"入宅",
				"移徙",
				"栽种",
				"赴任"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"出行",
				"沐浴",
				"交易",
				"扫舍",
				"教牛马"
			],
			bad: [
				"动土",
				"作灶",
				"行丧",
				"安葬",
				"修坟"
			]
		},
		{
			good: [
				"嫁娶",
				"祭祀",
				"祈福",
				"求嗣",
				"动土",
				"安床",
				"扫舍",
				"入殓",
				"移柩",
				"破土",
				"启钻",
				"安葬",
				"作灶",
				"整手足甲",
				"补垣",
				"除服",
				"成服"
			],
			bad: ["开光", "栽种"]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"斋醮",
				"沐浴",
				"冠笄",
				"出行",
				"理发",
				"拆卸",
				"解除",
				"起基",
				"动土",
				"定磉",
				"安碓磑",
				"开池",
				"掘井",
				"扫舍",
				"除服",
				"成服",
				"移柩",
				"启钻",
				"立碑",
				"谢土"
			],
			bad: [
				"移徙",
				"入宅",
				"安门",
				"作梁",
				"安葬"
			]
		}
	],
	[
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"拆卸",
				"修造",
				"动土",
				"上梁",
				"安床",
				"置产",
				"栽种",
				"破土"
			],
			bad: [
				"嫁娶",
				"进人口",
				"安葬",
				"出行",
				"赴任",
				"入宅",
				"移徙",
				"入殓",
				"开渠"
			]
		},
		{
			good: [
				"祭祀",
				"作灶",
				"入殓",
				"除服",
				"馀事勿取"
			],
			bad: ["开市", "安床"]
		},
		{
			good: [
				"祭祀",
				"塞穴",
				"结网",
				"破土",
				"谢土",
				"安葬",
				"移柩",
				"除服",
				"成服",
				"馀事勿取"
			],
			bad: ["嫁娶", "入宅"]
		},
		{
			good: [
				"祭祀",
				"出行",
				"订盟",
				"纳采",
				"裁衣",
				"合帐",
				"冠笄",
				"进人口",
				"动土",
				"安床",
				"作灶",
				"入殓",
				"移柩",
				"安葬",
				"破土",
				"结网",
				"取渔",
				"畋猎"
			],
			bad: ["作梁", "造庙"]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"解除",
				"破屋",
				"坏垣",
				"求医",
				"治病",
				"馀事勿取"
			],
			bad: ["嫁娶", "开市"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"求医",
				"治病",
				"修造",
				"动土",
				"移徙",
				"入宅",
				"破土",
				"安葬"
			],
			bad: ["开市", "开光"]
		},
		{
			good: [
				"嫁娶",
				"纳采",
				"订盟",
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出火",
				"出行",
				"拆卸",
				"修造",
				"动土",
				"进人口",
				"入宅",
				"移徙",
				"安床",
				"交易",
				"立券",
				"挂匾",
				"纳财",
				"入殓",
				"安葬",
				"启钻",
				"除服",
				"成服"
			],
			bad: ["掘井", "破土"]
		},
		{
			good: [
				"祭祀",
				"冠笄",
				"嫁娶",
				"捕捉",
				"结网",
				"畋猎",
				"取渔",
				"馀事勿取"
			],
			bad: ["无"]
		},
		{
			good: [
				"纳采",
				"订盟",
				"开光",
				"出行",
				"解除",
				"安香",
				"出火",
				"拆卸",
				"入宅",
				"移徙",
				"修造",
				"上梁",
				"安床",
				"栽种",
				"纳畜",
				"会亲友",
				"安机械",
				"经络"
			],
			bad: [
				"伐木",
				"谢土",
				"行丧",
				"祭祀",
				"作灶",
				"动土",
				"破土",
				"安葬",
				"祈福"
			]
		},
		{
			good: [
				"出行",
				"解除",
				"纳采",
				"冠笄",
				"雕刻",
				"修造",
				"动土",
				"起基",
				"上梁",
				"合脊",
				"安床",
				"移徙",
				"入宅",
				"开市",
				"栽种",
				"开厕"
			],
			bad: [
				"造庙",
				"安门",
				"行丧",
				"安葬"
			]
		},
		{
			good: [
				"祭祀",
				"祈福",
				"求嗣",
				"开光",
				"出行",
				"解除",
				"上梁",
				"入宅",
				"移徙",
				"安床",
				"安门",
				"纳财",
				"纳畜",
				"造畜稠"
			],
			bad: [
				"伐木",
				"行丧",
				"破土",
				"嫁娶",
				"安葬",
				"开渠"
			]
		},
		{
			good: [
				"嫁娶",
				"冠笄",
				"安床",
				"纳采",
				"会亲友",
				"塞穴",
				"捕捉",
				"置产",
				"造畜稠"
			],
			bad: [
				"开光",
				"掘井",
				"安葬",
				"谢土",
				"修坟"
			]
		}
	],
	[
		{
			good: [
				"沐浴",
				"冠笄",
				"补垣",
				"塞穴",
				"裁衣",
				"修造",
				"作梁",
				"开柱眼",
				"安碓磑",
				"筑堤",
				"开厕",
				"断蚁"
			],
			bad: [
				"移徙",
				"入宅",
				"嫁娶",
				"祈福",
				"开光",
				"掘井"
			]
		},
		{
			good: [
				"塑绘",
				"开光",
				"沐浴",
				"冠笄",
				"会亲友",
				"作灶",
				"放水",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"入殓",
				"安葬",
				"出行"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"理发",
				"作灶",
				"结网",
				"栽种"
			],
			bad: [
				"嫁娶",
				"词讼",
				"行丧",
				"安葬",
				"牧养",
				"伐木",
				"作梁",
				"开市",
				"纳畜",
				"造畜稠"
			]
		},
		{
			good: [
				"祭祀",
				"开光",
				"塑绘",
				"订盟",
				"纳采",
				"合帐",
				"冠笄",
				"拆卸",
				"动土",
				"起基",
				"上梁",
				"入宅",
				"安香",
				"开市",
				"立券",
				"纳财",
				"沐浴",
				"求嗣",
				"出火",
				"竖柱",
				"安门"
			],
			bad: [
				"造庙",
				"嫁娶",
				"伐木",
				"安葬"
			]
		},
		{
			good: [
				"沐浴",
				"塞穴",
				"畋猎",
				"结网",
				"取渔",
				"扫舍",
				"馀事勿取"
			],
			bad: ["祈福", "安葬"]
		},
		{
			good: [
				"祭祀",
				"破屋",
				"坏垣",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"畋猎",
				"捕捉",
				"结网",
				"取渔",
				"祭祀",
				"沐浴",
				"馀事勿取"
			],
			bad: [
				"嫁娶",
				"开市",
				"安葬",
				"启钻",
				"行丧"
			]
		},
		{
			good: [
				"沐浴",
				"扫舍",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		},
		{
			good: [
				"修饰垣墙",
				"平治道涂",
				"祭祀",
				"沐浴",
				"作灶"
			],
			bad: [
				"嫁娶",
				"词讼",
				"治病",
				"置产",
				"作梁",
				"祈福",
				"安葬",
				"栽种",
				"伐木",
				"安门"
			]
		},
		{
			good: [
				"开光",
				"塑绘",
				"出行",
				"解除",
				"冠笄",
				"裁衣",
				"挂匾",
				"作灶",
				"开市",
				"开池",
				"开厕",
				"补垣",
				"塞穴"
			],
			bad: ["无"]
		},
		{
			good: [
				"祭祀",
				"开光",
				"出行",
				"解除",
				"理发",
				"伐木",
				"出火",
				"拆卸",
				"上梁",
				"合脊",
				"安床",
				"造畜稠"
			],
			bad: [
				"嫁娶",
				"安葬",
				"行丧",
				"词讼",
				"造桥",
				"作灶",
				"破土",
				"动土"
			]
		},
		{
			good: [
				"祭祀",
				"沐浴",
				"馀事勿取"
			],
			bad: ["诸事不宜"]
		}
	]
];
//#endregion
//#region src/almanac/almanac.ts
var Almanac = class {
	_cache = /* @__PURE__ */ new Map();
	lunaris;
	constructor(lunaris) {
		this.lunaris = lunaris;
	}
	get lang() {
		return this.lunaris.getConfig("lang");
	}
	getActs() {
		return cacheAndReturn("almanac:getActs", () => {
			const dayValue = this.lunaris.fourPillars.day.value;
			const monthBranchValue = this.lunaris.fourPillars.month.branch.value;
			const cell = DAY_MONTH_ACTS[dayValue][monthBranchValue];
			return {
				good: cell.good.slice(),
				bad: cell.bad.slice()
			};
		}, this._cache);
	}
	getGoodActs() {
		return this.getActs().good;
	}
	getBadActs() {
		return this.getActs().bad;
	}
};
//#endregion
//#region src/markers/utils.ts
/** 添加 markers 到 store */
function addMarkers(markersStore, markersSetting, tags) {
	for (const item of markersSetting) {
		const { format, markers } = item;
		if (typeof format === "string") {
			let formatMapItem;
			if (markersStore.formatMap.has(format)) formatMapItem = markersStore.formatMap.get(format);
			else markersStore.formatList.push(format);
			if (formatMapItem === void 0) formatMapItem = /* @__PURE__ */ new Map();
			prettyMarkers(markers, formatMapItem, tags);
			markersStore.formatMap.set(format, formatMapItem);
		} else {
			const mapItem = /* @__PURE__ */ new Map();
			prettyMarkers(markers, mapItem, tags);
			markersStore.fnList.push({
				fn: format,
				markers: mapItem
			});
		}
	}
}
function prettyMarkers(markers, dateMapping, tags) {
	for (const key in markers) {
		const item = markers[key];
		const markerItemList = [];
		if (Array.isArray(item)) for (const it of item) markerItemList.push(prettyMarkersItem(it, tags));
		else markerItemList.push(prettyMarkersItem(item, tags));
		if (dateMapping.has(key)) dateMapping.set(key, dateMapping.get(key).concat(markerItemList));
		else dateMapping.set(key, markerItemList);
	}
	return dateMapping;
}
function prettyMarkersItem(markersItem, tags) {
	const { tag, name } = markersItem;
	const res = {
		tag: [],
		name
	};
	if (Array.isArray(tag)) res.tag = tag.slice();
	else if (typeof tag === "string") res.tag.push(tag);
	if (Array.isArray(tags)) res.tag = res.tag.concat(tags);
	else if (typeof tags === "string") res.tag.push(tags);
	if (markersItem.data !== void 0) res.data = Object.assign({}, markersItem.data);
	return res;
}
function filterStoreMarkers(mk, tagsOrNames, isTag = false) {
	return mk.filter((v) => {
		if (isTag) {
			const tn = Array.isArray(tagsOrNames) ? tagsOrNames : [tagsOrNames];
			return !isHasIntersection(v.tag, tn);
		} else if (Array.isArray(tagsOrNames)) return !tagsOrNames.includes(v.name);
		else return tagsOrNames !== v.name;
	});
}
function removeMarkersInMatcherMap(mk, tagsOrNames, isTag = true, matcher) {
	const runItem = (key, ton) => {
		if (!mk.has(key)) return false;
		const mkV = mk.get(key);
		if (ton === void 0) {
			mk.delete(key);
			return false;
		}
		const newV = filterStoreMarkers(mkV, ton, isTag);
		if (newV.length === 0) mk.delete(key);
		else if (newV.length < mkV.length) mk.set(key, newV);
		return true;
	};
	if (matcher === void 0) {
		const mkKeys = Array.from(mk.keys());
		for (const key of mkKeys) runItem(key, tagsOrNames);
	} else if (Array.isArray(matcher)) for (const key of matcher) runItem(key, tagsOrNames);
	else runItem(matcher, tagsOrNames);
}
/** 按标签或名称移除 markers */
function removeMarkersByTagOrName(markersStore, tagsOrNames, isTag = true) {
	removeMarkersFromFormatListByTN(markersStore, tagsOrNames, isTag);
	removeMarkersFromFnListByTN(markersStore, tagsOrNames, isTag);
}
function removeMarkersFromFormatItemByTN(formatMap, format, tagsOrNames, isTag = true, matcher) {
	if (formatMap.has(format)) {
		const mk = formatMap.get(format);
		removeMarkersInMatcherMap(mk, tagsOrNames, isTag, matcher);
		if (mk.size === 0) formatMap.delete(format);
		else return true;
	}
	return false;
}
function removeMarkersFromFormatListByTN(markersStore, tagsOrNames, isTag = true) {
	const { formatList, formatMap } = markersStore;
	const newFormatList = [];
	for (const format of formatList) if (removeMarkersFromFormatItemByTN(formatMap, format, tagsOrNames, isTag)) newFormatList.push(format);
	if (newFormatList.length !== formatList.length) markersStore.formatList = newFormatList;
}
function removeMarkersFromFnListByTN(markersStore, tagsOrNames, isTag = true, matcher) {
	const { fnList } = markersStore;
	const newFnList = [];
	for (const fnItem of fnList) {
		const { fn, markers } = fnItem;
		removeMarkersInMatcherMap(markers, tagsOrNames, isTag, matcher);
		if (markers.size > 0) newFnList.push({
			fn,
			markers
		});
	}
	if (newFnList.length !== fnList.length) markersStore.fnList = newFnList;
}
/**
* 移除 markers
* @param format 日期 format 格式如 MMDD；为 true 时只从 fnList 删除
*/
function removeMarkers(markersStore, format, matcher, name) {
	if (format === true) removeMarkersFromFnListByTN(markersStore, name, false, matcher);
	else {
		const { formatList, formatMap } = markersStore;
		removeMarkersFromFormatItemByTN(formatMap, format, name, false, matcher);
		if (!formatMap.has(format)) markersStore.formatList = formatList.filter((v) => v !== format);
	}
}
function getMarkersFromFormatList(markersStore, format, matcher) {
	const { formatMap } = markersStore;
	if (!formatMap.has(format)) return null;
	const matcherMap = formatMap.get(format);
	if (!matcherMap.has(matcher)) return null;
	return matcherMap.get(matcher);
}
/** 查两个数组是否有交集 */
function isHasIntersection(arr1, arr2) {
	for (let i = 0; i < arr2.length; i++) if (arr1.includes(arr2[i])) return true;
	return false;
}
function filterByObj(obj, data) {
	for (const key in obj) {
		const v = obj[key];
		const v2 = data[key];
		if (key === "tag") {
			if (Array.isArray(v)) {
				if (!Array.isArray(v2)) return false;
				else if (!isHasIntersection(v, v2)) return false;
			} else if (Array.isArray(v2) && !v2.includes(v)) return false;
		} else if (typeof v === "object" && v !== null && typeof v2 === "object" && v2 !== null) {
			if (!filterByObj(v, v2)) return false;
		} else if (v !== v2) return false;
	}
	return true;
}
//#endregion
//#region src/markers/markers.ts
/** 节日/纪念日标记系统 */
var Markers = class Markers {
	_list = null;
	static store = {
		formatList: [],
		formatMap: /* @__PURE__ */ new Map(),
		fnList: []
	};
	storeMarkers = [];
	storeMarkersFromGlobal = [];
	lunaris;
	static add(markersSetting, tags) {
		addMarkers(Markers.store, markersSetting, tags);
		return Markers;
	}
	static clean() {
		Markers.store.formatList = [];
		Markers.store.formatMap = /* @__PURE__ */ new Map();
		Markers.store.fnList = [];
		return Markers;
	}
	static cleanFnList() {
		Markers.store.fnList = [];
		return Markers;
	}
	static remove(format, matcher, names) {
		removeMarkers(Markers.store, format, matcher, names);
		return Markers;
	}
	static removeByTag(tags) {
		removeMarkersByTagOrName(Markers.store, tags, true);
		return Markers;
	}
	static removeByName(names) {
		removeMarkersByTagOrName(Markers.store, names, false);
		return Markers;
	}
	constructor(lunaris) {
		this.lunaris = lunaris;
		this.init();
	}
	init() {
		const mksArr = [];
		const mksStore = Markers.store;
		for (const formatKey of mksStore.formatList) {
			const mks = getMarkersFromFormatList(mksStore, formatKey, this.lunaris.format(formatKey));
			if (mks) mksArr.push(mks);
		}
		for (const { fn, markers } of mksStore.fnList) {
			const matcher = fn(this.lunaris);
			if (matcher === null) continue;
			const mks = markers.get(matcher);
			if (mks) mksArr.push(mks);
		}
		this.storeMarkersFromGlobal.splice(0, this.storeMarkersFromGlobal.length, ...mksArr.flat());
	}
	add(marker, tags) {
		this._list = null;
		if (Array.isArray(marker)) for (const item of marker) this.add(item, tags);
		else {
			const mk = prettyMarkersItem(marker, tags);
			this.storeMarkers.push(mk);
		}
		return this;
	}
	/**
	* 移除指定名称或 tag 的 markers
	* @param name 指定的 marker 名字或 tag
	* @param isTag name 参数是否为 tag
	* @param flag 1: 只移除全局设定的，2: 只移除实例 add 的，0: 全部
	*/
	remove(name, isTag = false, flag = 0) {
		this._list = null;
		if (flag === 0 || flag === 1) this.storeMarkersFromGlobal = filterStoreMarkers(this.storeMarkersFromGlobal, name, isTag);
		if (flag === 0 || flag === 2) this.storeMarkers = filterStoreMarkers(this.storeMarkers, name, isTag);
		return this;
	}
	/** 清除所有 markers */
	clean(flag = 0) {
		this._list = null;
		if (flag === 0 || flag === 1) this.storeMarkersFromGlobal = [];
		if (flag === 0 || flag === 2) this.storeMarkers = [];
		return this;
	}
	/** 重置 markers 实例 */
	reset() {
		this._list = null;
		this.clean(0);
		this.init();
		return this;
	}
	[Symbol.iterator]() {
		let index = 0;
		const list = this.list;
		return { next() {
			if (index < list.length) return {
				value: list[index++],
				done: false
			};
			return {
				value: void 0,
				done: true
			};
		} };
	}
	/** 取得 markers 列表 */
	get list() {
		if (this._list == null) this._list = [...this.storeMarkersFromGlobal, ...this.storeMarkers];
		return this._list;
	}
	filter(fn) {
		if (typeof fn === "function") return this.list.filter(fn);
		return this.list.filter((item) => filterByObj(fn, item));
	}
	find(fn) {
		if (typeof fn === "function") return this.list.find(fn);
		return this.list.find((item) => filterByObj(fn, item));
	}
	toString() {
		return this.list.map((v) => v.name).join(",");
	}
};
//#endregion
//#region src/core/lunaris.ts
var Lunaris = class Lunaris extends CacheClass {
	_config;
	_date;
	_offset;
	constructor(date, config) {
		super();
		this._config = Object.assign({ extra: {} }, _GlobalConfig, config);
		const { isUTC, offset } = this._config;
		const _date = parseDate(date, isUTC);
		if (offset !== 0) _date.setMinutes(_date.getMinutes() + offset);
		const localTimezoneOffset = -1 * parseDate(date).getTimezoneOffset();
		this._config.extra.localTimezoneOffset = localTimezoneOffset;
		this._date = _date;
		this._offset = offset;
	}
	static fromLunar(param, config) {
		const date = parseFromLunar(param, config?.lang);
		return new Lunaris(date, config);
	}
	get year() {
		return getDateData(this._date, "FullYear", this.isUTC());
	}
	get month() {
		return getDateData(this._date, "Month", this.isUTC()) + 1;
	}
	get day() {
		return getDateData(this._date, "Date", this.isUTC());
	}
	get dayOfWeek() {
		return getDateData(this._date, "Day", this.isUTC());
	}
	get hour() {
		return getDateData(this._date, "Hours", this.isUTC());
	}
	get minute() {
		return getDateData(this._date, "Minutes", this.isUTC());
	}
	get second() {
		return getDateData(this._date, "Seconds", this.isUTC());
	}
	get millis() {
		return getDateData(this._date, "Milliseconds", this.isUTC());
	}
	/** 农历 */
	get lunar() {
		return this._cached("lunaris:lunar", () => {
			return new Lunar(this._date, {
				lang: this._config.lang,
				isUTC: this.isUTC()
			});
		});
	}
	/** 八字四柱 */
	get fourPillars() {
		return this._cached("lunaris:fourPillars", () => {
			const config = {
				lang: this._config.lang,
				changeAgeTerm: this._config.changeAgeTerm,
				isUTC: this.isUTC(),
				offset: this._offset,
				ziHourSplit: this._config.ziHourSplit
			};
			return new FourPillars(this._date, config);
		});
	}
	/** 纳音（日柱） */
	get takeSound() {
		return this.fourPillars.day.takeSound;
	}
	/** 日冲干支（日柱相冲） */
	get dayClash() {
		return this.fourPillars.day.clash;
	}
	/** 胎神 */
	get fetalGodData() {
		return this._cached("lunaris:fetalGodData", () => computeFetalGodData(this.fourPillars.day, this.getLocale()));
	}
	/** 胎神描述 */
	get fetalGod() {
		return this.fetalGodData.description;
	}
	/** 彭祖百忌 */
	get pengZu() {
		return this._cached("lunaris:pengZu", () => computePengZuData(this.fourPillars.day, this.getLocale()));
	}
	/** 三元九运（换元换运边界跟随年柱换岁配置 changeAgeTerm） */
	get nineYun() {
		return this._cached("lunaris:nineYun", () => {
			return computeNineYun(FourPillars.computeYearPillarYear(this._date, {
				changeAgeTerm: this._config.changeAgeTerm,
				isUTC: this.isUTC()
			}), this.getLocale());
		});
	}
	/** 节气（当日无节气则为 null） */
	get solarTerm() {
		return this._cached("lunaris:solarTerm", () => {
			const year = this.year;
			if (year < 1901 || year > 2101) throw new Error(`${year} is not in the allowed time range.`);
			const month = this.month;
			const date = this.day;
			const [term1, term2] = SolarTerm.getMonthTerms(year, month);
			const config = { lang: this._config.lang };
			if (date === term1) return new SolarTerm((month - 1) * 2, config);
			else if (date === term2) return new SolarTerm((month - 1) * 2 + 1, config);
			else return null;
		});
	}
	/**
	* 八字命盘（十神/神煞/三宫/大运流年）
	* @param gender 1 男（乾造），0 女（坤造）
	*/
	natalChart(gender) {
		return this._cached(`lunaris:natalChart:${gender}`, () => new NatalChart(this, gender));
	}
	/** 黄历（神煞宜忌/建除十二神/时辰吉凶/吉神方位） */
	get almanac() {
		return this._cached("lunaris:almanac", () => new Almanac(this));
	}
	/** 节日/纪念日标记 */
	get markers() {
		return this._cached("lunaris:markers", () => new Markers(this));
	}
	/**
	* 取得当前日期之前的最近的节气点
	* @param nodeFlag 0: 取节, 1: 取气, 2: 节气皆取
	*/
	recentSolarTerm(nodeFlag) {
		return this._cached(`lunaris:recentSolarTerm:${nodeFlag}`, () => SolarTerm.findNode(this._date, {
			lang: this._config.lang,
			nodeFlag,
			returnValue: false,
			isUTC: this.isUTC()
		}));
	}
	/**
	* 取得当前日期所在的月建或月将地支
	* @param flag 0: 月建, 1: 月将
	*/
	getMonthBuilder(flag = 0) {
		return this._cached(`lunaris:getMonthBuilder:${flag}`, () => {
			const sbConfig = { lang: this._config.lang };
			const [term, termDate] = this.recentSolarTerm(flag);
			return [
				new StemBranch(computeMonthValueByTerm(this.toDate(), term.value, termDate), void 0, sbConfig),
				term,
				termDate
			];
		});
	}
	/** 季节索引 0春 1夏 2秋 3冬 */
	getSeasonIndex() {
		const termVal = this.recentSolarTerm(0)[0].value;
		if (2 <= termVal && termVal < 8) return 0;
		if (8 <= termVal && termVal < 14) return 1;
		if (14 <= termVal && termVal < 20) return 2;
		return 3;
	}
	getSeason(isShortName = false) {
		const ssv = this.getSeasonIndex();
		const locale = this.getLocale();
		return isShortName && locale.seasonShortName ? locale.seasonShortName[ssv] : locale.seasonName[ssv];
	}
	getLocale(lang) {
		return _GlobalConfig.locales[lang ?? this._config.lang];
	}
	/** 取得译文（点分路径） */
	L(key) {
		return getTranslation(this.getLocale(), key);
	}
	getConfig(key) {
		if (typeof key === "undefined") return this._config;
		return this._config[key];
	}
	toDate() {
		return new Date(this.valueOf());
	}
	clone() {
		return new Lunaris(this.valueOf(), this._config);
	}
	unix() {
		return Math.floor(this.valueOf() / 1e3);
	}
	valueOf() {
		return this._date.valueOf() - this._offset * 60 * 1e3;
	}
	local() {
		const config = Object.assign({}, this._config, {
			isUTC: false,
			offset: 0
		});
		return new Lunaris(this.toDate(), config);
	}
	utc() {
		return this.utcOffset(-this._offset);
	}
	isUTC() {
		return this._config.isUTC;
	}
	utcOffset(utcOffset) {
		if (utcOffset === void 0) {
			if (this.isUTC()) return this._offset;
			return computeUtcOffset(this._date);
		}
		const config = Object.assign({}, this._config, {
			isUTC: true,
			offset: Math.abs(utcOffset) <= 16 ? utcOffset * 60 : utcOffset
		});
		return new Lunaris(this._date, config);
	}
	toISOString() {
		return this._date.toISOString();
	}
	toUTCString() {
		return this._date.toUTCString();
	}
	toString() {
		return this._date.toUTCString() + ` (${this.lunar}) utcOffset: ${this.utcOffset()}`;
	}
	format(formatStr) {
		return format(formatStr, this);
	}
	diff(date, unit, float = false) {
		const u = unit ? prettyUnit(unit) : "millisecond";
		if (LUNAR_UNITS_SET.has(u)) return lunarDateDiff(this, date instanceof Lunaris ? date : new Lunaris(date, this._config), u, float);
		return dateDiff(this._date, date instanceof Lunaris ? date.toDate() : date, u, float);
	}
	add(value, unit) {
		const newDate = dateAdd(this.toDate(), value, unit);
		return new Lunaris(newDate, this.getConfig());
	}
};
//#endregion
//#region src/locale/zh-cn.ts
/** 简体中文语言包（以 zh 为基底合并） */
const locale$3 = {
	name: "zh-cn",
	leap: "闰",
	lunarYearUnit: "年",
	lunarHourUnit: "时",
	weekdaysShort: [
		"周日",
		"周一",
		"周二",
		"周三",
		"周四",
		"周五",
		"周六"
	],
	constellationName: "白羊座_金牛座_双子座_巨蟹座_狮子座_处女座_天秤座_天蝎座_射手座_摩羯座_水瓶座_双鱼座".split("_"),
	solarTerm: "小寒_大寒_立春_雨水_惊蛰_春分_清明_谷雨_立夏_小满_芒种_夏至_小暑_大暑_立秋_处暑_白露_秋分_寒露_霜降_立冬_小雪_大雪_冬至".split("_"),
	chineseZodiac: [
		"鼠",
		"牛",
		"虎",
		"兔",
		"龙",
		"蛇",
		"马",
		"羊",
		"猴",
		"鸡",
		"狗",
		"猪"
	],
	eightTrigram: "坤震坎兑艮离巽乾".split(""),
	directions: [
		"",
		"北",
		"西南",
		"东",
		"东南",
		"中",
		"西北",
		"西",
		"东北",
		"南"
	],
	lifeStage12: [
		"长生",
		"沐浴",
		"冠带",
		"临官",
		"帝旺",
		"衰",
		"病",
		"死",
		"墓",
		"绝",
		"胎",
		"养"
	],
	moonPhaseDetail: [
		"朔",
		"既朔",
		"蛾眉新",
		"蛾眉新",
		"蛾眉",
		"夕",
		"上弦",
		"上弦",
		"九夜",
		"宵",
		"宵",
		"宵",
		"渐盈凸",
		"小望",
		"望",
		"既望",
		"立待",
		"居待",
		"寝待",
		"更待",
		"渐亏凸",
		"下弦",
		"下弦",
		"有明",
		"有明",
		"蛾眉残",
		"蛾眉残",
		"残",
		"晓",
		"晦"
	],
	pengZu: {
		stem: [
			"甲不开仓财物耗散",
			"乙不栽植千株不长",
			"丙不修灶必见灾殃",
			"丁不剃头头必生疮",
			"戊不受田田主不祥",
			"己不破券二比并亡",
			"庚不经络织机虚张",
			"辛不合酱主人不尝",
			"壬不泱水更难提防",
			"癸不词讼理弱敌强"
		],
		branch: [
			"子不问卜自惹祸殃",
			"丑不冠带主不还乡",
			"寅不祭祀神鬼不尝",
			"卯不穿井水泉不香",
			"辰不哭泣必主重丧",
			"巳不远行财物伏藏",
			"午不苫盖屋主更张",
			"未不服药毒气入肠",
			"申不安床鬼祟入房",
			"酉不会客醉坐颠狂",
			"戌不吃犬作怪上床",
			"亥不嫁娶不利新郎"
		]
	},
	nineYun: {
		yuan: [
			"上元",
			"中元",
			"下元"
		],
		yun: [
			"一运",
			"二运",
			"三运",
			"四运",
			"五运",
			"六运",
			"七运",
			"八运",
			"九运"
		]
	},
	takeSound: [
		"海中金",
		"炉中火",
		"大林木",
		"路旁土",
		"剑锋金",
		"山头火",
		"涧下水",
		"城头土",
		"白腊金",
		"杨柳木",
		"井泉水",
		"屋上土",
		"霹雳火",
		"松柏木",
		"长流水",
		"砂中金",
		"山下火",
		"平地木",
		"壁上土",
		"金箔金",
		"覆灯火",
		"天河水",
		"大驿土",
		"钗钏金",
		"桑柘木",
		"大溪水",
		"砂中土",
		"天上火",
		"石榴木",
		"大海水"
	],
	stemFetalGodPlace: [
		"门",
		"碓磨",
		"厨灶",
		"仓库",
		"房床"
	],
	branchFetalGodPlace: [
		"碓",
		"厕",
		"炉",
		"门",
		"鸡栖",
		"床"
	],
	fetalGodDirection: [
		"中",
		"东",
		"东南",
		"南",
		"西南",
		"西",
		"西北",
		"北",
		"东北"
	],
	fetalGodDayDesc: [
		"占门碓外东南",
		"碓磨厕外东南",
		"厨灶炉外正南",
		"仓库门外正南",
		"房床栖外正南",
		"占门床外正南",
		"占碓磨外正南",
		"厨灶厕外西南",
		"仓库炉外西南",
		"房床门外西南",
		"门鸡栖外西南",
		"碓磨床外西南",
		"厨灶碓外西南",
		"仓库厕外正西",
		"房床炉外正西",
		"占大门外正西",
		"碓磨栖外正西",
		"厨灶床外正西",
		"仓库碓外西北",
		"房床厕外西北",
		"占门炉外西北",
		"门碓磨外西北",
		"厨灶栖外西北",
		"仓库床外西北",
		"房床碓外正北",
		"占门厕外正北",
		"碓磨炉外正北",
		"厨灶门外正北",
		"仓库栖外正北",
		"占房床房内北",
		"占门碓房内北",
		"碓磨厕房内北",
		"厨灶炉房内北",
		"门仓库房内北",
		"房床栖房内中",
		"占门床房内中",
		"占碓磨房内南",
		"厨灶厕房内南",
		"仓库炉房内南",
		"房床门房内西",
		"门鸡栖房内东",
		"碓磨床房内东",
		"厨灶碓房内东",
		"仓库厕房内东",
		"房床炉房内中",
		"占大门外东北",
		"碓磨栖外东北",
		"厨灶床外东北",
		"仓库碓外东北",
		"房床厕外东北",
		"占门炉外东北",
		"门碓磨外正东",
		"厨灶栖外正东",
		"仓库床外正东",
		"房床碓外正东",
		"占门厕外正东",
		"碓磨炉外东南",
		"厨灶门外东南",
		"仓库栖外东南",
		"占房床外东南"
	],
	fetalGodInsideDesc: "内",
	fetalGodOutsideDesc: "外",
	natalChart: {
		gender: ["坤造", "乾造"],
		tenGod: {
			正官: "正官",
			七殺: "七杀",
			正財: "正财",
			偏財: "偏财",
			食神: "食神",
			傷官: "伤官",
			比肩: "比肩",
			劫財: "劫财",
			正印: "正印",
			梟神: "枭神",
			日主: "日主"
		},
		tenGodShort: {
			正官: "官",
			七殺: "杀",
			正財: "财",
			偏財: "才",
			食神: "食",
			傷官: "伤",
			比肩: "比",
			劫財: "劫",
			正印: "印",
			梟神: "枭"
		},
		gods: {
			天乙貴人: "天乙贵人",
			文昌貴人: "文昌贵人",
			國印貴人: "国印贵人",
			太極貴人: "太极贵人",
			金輿: "金舆",
			綠神: "禄神",
			羊刃: "羊刃",
			天官: "天官",
			天福: "天福",
			辭館: "词馆",
			墓煞: "墓煞",
			時墓: "时墓",
			天廚貴人: "天厨贵人",
			天德: "天德",
			天德合: "天德合",
			太白星: "太白星",
			隔角: "隔角",
			喪門: "丧门",
			吊客: "吊客",
			勾煞: "勾煞",
			絞煞: "绞煞",
			元辰: "元辰",
			孤辰: "孤辰",
			寡宿: "寡宿",
			天羅: "天罗",
			地網: "地网",
			月德: "月德",
			月德合: "月德合",
			德: "德",
			秀: "秀",
			華蓋: "华盖",
			將星: "将星",
			驛馬: "驿马",
			桃花: "桃花",
			劫煞: "劫煞",
			亡神: "亡神",
			災煞: "灾煞",
			六厄: "六厄",
			日貴: "日贵",
			魁罡貴人: "魁罡贵人",
			日德: "日德",
			陰陽差錯: "阴阳差错",
			陰陽煞: "阴阳煞",
			九醜: "九丑",
			天赦: "天赦",
			四廢: "四废",
			天地轉煞: "天地转煞",
			金神: "金神",
			孤鸞: "孤鸾",
			八專: "八专",
			十惡大敗: "十恶大败",
			學堂: "学堂",
			帝座: "帝座",
			截路空亡: "截路空亡"
		}
	}
};
//#endregion
//#region src/locale/en.ts
/** English locale (merged over zh base) */
const locale = {
	name: "en",
	leap: "leap",
	lunarYearUnit: "",
	lunarHourUnit: "",
	bigMonth: "big",
	smallMonth: "small",
	weekdays: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	lunarMonths: (() => {
		const res = [];
		for (let i = 1; i < 13; i++) res.push(`${i}st month`);
		return res;
	})(),
	lunarMonthsAlias: (() => {
		const res = [];
		for (let i = 1; i < 13; i++) res.push(`${i}st`);
		return res;
	})(),
	lunarDays: (() => {
		const res = [];
		for (let i = 1; i < 31; i++) res.push(`${i}`);
		return res;
	})(),
	numerals: "0123456789".split(""),
	constellationName: "Aries_Taurus_Gemini_Cancer_Leo_Virgo_Libra_Scorpio_Sagittarius_Capricorn_Aquarius_Pisces".split("_"),
	solarTerm: "Moderate Cold,Severe Cold,Spring Commences,Spring Showers,Insects Waken,Vernal Equinox,Bright and Clear,Corn Rain,Summer Commences,Corn Forms,Corn on Ear,Summer Solstice,Moderate Heat,Great Heat,Autumn Commences,End of Heat,White Dew,Autumnal Equinox,Cold Dew,Frost,Winter Commences,Light Snow,Heavy Snow,Heavy Snow".split(","),
	seasonName: "Spring,Summer,Autumn,Winter".split(","),
	seasonShortName: "Spr.,Sum.,Aut.,Win.".split(","),
	stems: [
		"Jia",
		"Yi",
		"Bing",
		"Ding",
		"Wu",
		"Ji",
		"Geng",
		"Xin",
		"Ren",
		"Gui"
	],
	branches: [
		"Zi",
		"Chou",
		"Yin",
		"Mao",
		"Chen",
		"Si",
		"Wu",
		"Wei",
		"Shen",
		"You",
		"Xu",
		"Hai"
	],
	stemBranchSeparator: "-",
	chineseZodiac: [
		"Rat",
		"Ox",
		"Tiger",
		"Rabbit",
		"Dragon",
		"Snake",
		"Horse",
		"Goat",
		"Monkey",
		"Rooster",
		"Dog",
		"Pig"
	],
	fiveElements: [
		"Wood",
		"Fire",
		"Earth",
		"Metal",
		"Water"
	],
	eightTrigram: "Earth_Thunder_Water_Lake_Mountain_Fire_Wind_Heaven".split("_"),
	directions: [
		"",
		"North",
		"Southwest",
		"East",
		"Southeast",
		"Central",
		"Northwest",
		"West",
		"Northeast",
		"South"
	],
	meridiem: void 0,
	takeSound: [
		"Gold in the sea",
		"Fire in the furnace",
		"Big forest trees",
		"Roadside soil",
		"Swordsman Gold",
		"Mountain Fire",
		"Stream into the water",
		"City gate soil",
		"White gold",
		"willow wood",
		"Well spring water",
		"The soil on the house",
		"Human Torch",
		"Pine and Cypress",
		"Long Flowing Water",
		"Gold in Sand",
		"Fire under the mountain",
		"Plain wood",
		"Soil on the wall",
		"Gold foil",
		"Covered Lights",
		"The water of the heavenly river",
		"Big Post Earth",
		"Hairpin gold",
		"Mulberry wood",
		"Big stream water",
		"Sand in the soil",
		"Fire in the sky",
		"Pomegranate Wood",
		"Sea Water"
	]
};
//#endregion
//#region src/locale/ja.ts
/** 日本語ロケール（zh をベースにマージ） */
const locale$1 = {
	name: "ja",
	leap: "閏",
	lunarYearUnit: "",
	lunarHourUnit: "",
	bigMonth: "大",
	smallMonth: "小",
	weekdays: [
		"日曜日",
		"月曜日",
		"火曜日",
		"水曜日",
		"木曜日",
		"金曜日",
		"土曜日"
	],
	months: (() => {
		const res = [];
		for (let i = 1; i < 13; i++) res.push(`${i}月`);
		return res;
	})(),
	lunarMonths: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
	lunarMonthsAlias: "睦月_如月_弥生_卯月_皐月_水無月_文月_葉月_長月_神無月_霜月_師走".split("_"),
	lunarDays: "一_二_三_四_五_六_七_八_九_十_十一_十二_十三_十四_十五_十六_十七_十八_十九_二十_廿一_廿二_廿三_廿四_廿五_廿六_廿七_廿八_廿九_三十".split("_").map((i) => i + "日"),
	numerals: "〇一二三四五六七八九十".split(""),
	constellationName: "牡羊座_牡牛座_双子座_蟹座_獅子座_乙女座_天秤座_射手座_蠍座_山羊座_水瓶座_魚座".split("_"),
	solarTerm: "小寒_大寒_立春_雨水_啓蟄_春分_清明_穀雨_立夏_小満_芒種_夏至_小暑_大暑_立秋_処暑_白露_秋分_寒露_霜降_立冬_小雪_大雪_冬至".split("_"),
	seasonName: "春夏秋冬".split(""),
	stems: [
		"甲",
		"乙",
		"丙",
		"丁",
		"戊",
		"己",
		"庚",
		"辛",
		"壬",
		"癸"
	],
	branches: [
		"子",
		"丑",
		"寅",
		"卯",
		"辰",
		"巳",
		"午",
		"未",
		"申",
		"酉",
		"戌",
		"亥"
	],
	stemBranchSeparator: "",
	chineseZodiac: [
		"鼠",
		"牛",
		"虎",
		"兎",
		"竜",
		"蛇",
		"馬",
		"羊",
		"猿",
		"鶏",
		"犬",
		"猪"
	],
	fiveElements: [
		"木",
		"火",
		"土",
		"金",
		"水"
	],
	eightTrigram: "坤震坎兌艮離巽乾".split(""),
	directions: [
		"",
		"北",
		"南西",
		"東",
		"南東",
		"中",
		"北西",
		"西",
		"北東",
		"南"
	],
	meridiem: void 0,
	takeSound: [
		"海の中のゴールド",
		"ストーブの火",
		"大きな木",
		"道端の土",
		"剣刃金",
		"山頭火",
		"水に流れ込む",
		"城頭土",
		"白金",
		"柳の木",
		"井戸水",
		"屋上土",
		"落雷",
		"松と檜",
		"長く流れる水",
		"砂の中の金",
		"山下の火",
		"平地木",
		"壁土",
		"金フォイル",
		"覆われた光の火",
		"天河水",
		"大驛土",
		"かんざしゴールド",
		"桑柘木",
		"大きな流れの水",
		"砂の土",
		"空の火",
		"ザクロの木",
		"海水"
	]
};
//#endregion
//#region src/markers/festivals/zh.ts
const festivals = [
	{
		format: "MMDD",
		markers: {
			"0101": {
				tag: ["cn", "traditional"],
				name: "元旦"
			},
			"0110": {
				tag: ["cn", "occupation"],
				name: "中国人民警察节"
			},
			"0121": {
				tag: "international",
				name: "國際擁抱日"
			},
			"0202": {
				tag: ["international", "environment"],
				name: "世界濕地日"
			},
			"0204": {
				tag: ["international", "health"],
				name: "世界抗癌日"
			},
			"0210": {
				tag: "international",
				name: "國際氣象節"
			},
			"0214": {
				tag: "western",
				name: "情人節"
			},
			"0220": {
				tag: "international",
				name: "世界社會公正日"
			},
			"0301": {
				tag: ["international", "environment"],
				name: "國際海豹日"
			},
			"0303": [
				{
					tag: ["international", "environment"],
					name: "世界野生動植物日"
				},
				{
					tag: ["cn", "health"],
					name: "全國愛耳日"
				},
				{
					tag: ["international", "health"],
					name: "國際愛耳日"
				}
			],
			"0305": {
				tag: ["cn", "commemoration"],
				name: "學雷鋒記念日"
			},
			"0306": {
				tag: ["international", "health"],
				name: "世界青光眼日"
			},
			"0308": {
				tag: "international",
				name: "婦女節"
			},
			"0312": {
				tag: ["cn", "environment"],
				name: "植樹節"
			},
			"0315": {
				tag: "international",
				name: "國際消費日"
			},
			"0320": [{
				tag: "international",
				name: "世界無肉日"
			}, {
				tag: "international",
				name: "國際幸福日"
			}],
			"0321": [
				{
					tag: ["international", "environment"],
					name: "世界森林日"
				},
				{
					tag: "international",
					name: "世界睡眠日"
				},
				{
					tag: "international",
					name: "世界兒歌日"
				},
				{
					tag: "international",
					name: "國際消除種族歧視日"
				}
			],
			"0322": {
				tag: ["international", "environment"],
				name: "世界水日"
			},
			"0323": {
				tag: "international",
				name: "世界氣象日"
			},
			"0324": {
				tag: ["international", "health"],
				name: "世界防治結核病日"
			},
			"0327": {
				tag: "international",
				name: "世界戲劇日"
			},
			"0401": [{
				tag: ["international", "health"],
				name: "國際愛鳥日"
			}, {
				tag: "western",
				name: "愚人節"
			}],
			"0407": {
				tag: "international",
				name: "世界衛生日"
			},
			"0408": {
				tag: ["international", "environment"],
				name: "國際珍稀動物保護日"
			},
			"0415": {
				tag: "cn",
				name: "國家安全教育日"
			},
			"0422": {
				tag: ["international", "environment"],
				name: "世界地球日"
			},
			"0423": {
				tag: "international",
				name: "世界讀書日"
			},
			"0501": {
				tag: "international",
				name: "國際勞動節"
			},
			"0504": {
				tag: "cn",
				name: "中國青年節"
			},
			"0508": {
				tag: ["international", "health"],
				name: "世界紅十字日"
			},
			"0511": {
				tag: ["international", "health"],
				name: "防治肥胖日"
			},
			"0512": [{
				tag: ["international", "occupation"],
				name: "國際護士節"
			}, {
				tag: "cn",
				name: "全國防災減災日"
			}],
			"0515": {
				tag: ["cn", "health"],
				name: "全國碘缺乏病日"
			},
			"0517": {
				tag: "international",
				name: "世界電信日"
			},
			"0518": {
				tag: "international",
				name: "國際博物館日"
			},
			"0520": [{
				tag: "cn",
				name: "全國母乳餵養宣傳日"
			}, {
				tag: "cn",
				name: "中國學生營養日"
			}],
			"0525": {
				tag: ["international", "health"],
				name: "國際愛膚日"
			},
			"0531": {
				tag: ["international", "health"],
				name: "世界無煙日"
			},
			"0601": {
				tag: "cn",
				name: "兒童節"
			},
			"0605": {
				tag: ["international", "environment"],
				name: "世界環境日"
			},
			"0606": {
				tag: ["cn", "health"],
				name: "全國愛眼日"
			},
			"0609": {
				tag: "international",
				name: "世界認可日"
			},
			"0623": {
				tag: ["international", "sport"],
				name: "國際奧林匹克日"
			},
			"0625": {
				tag: "cn",
				name: "全國土地日"
			},
			"0626": {
				tag: "international",
				name: "國際反毒品日"
			},
			"0701": [{
				tag: ["cn", "commemoration"],
				name: "香港回歸日"
			}, {
				tag: ["cn", "commemoration"],
				name: "建黨節"
			}],
			"0711": [{
				tag: "international",
				name: "世界人口日"
			}, {
				tag: "cn",
				name: "中國航海日"
			}],
			"0801": {
				tag: ["cn", "commemoration"],
				name: "建軍節"
			},
			"0812": {
				tag: "international",
				name: "國際青年節"
			},
			"0819": {
				tag: ["cn", "occupation"],
				name: "中國醫師節"
			},
			"0903": {
				tag: ["cn", "commemoration"],
				name: "中國人民抗日戰爭勝利紀念日"
			},
			"0910": {
				tag: ["cn", "occupation"],
				name: "教師節"
			},
			"0912": {
				tag: ["cn", "health"],
				name: "預防出生缺陷日"
			},
			"0920": {
				tag: ["cn", "health"],
				name: "全國愛牙日"
			},
			"0921": {
				tag: "international",
				name: "國際和平日"
			},
			"0927": {
				tag: "international",
				name: "世界旅遊日"
			},
			"0930": {
				tag: ["cn", "commemoration"],
				name: "列士纪念日"
			},
			"1001": [{
				tag: "international",
				name: "國際音樂節"
			}, {
				tag: "cn",
				name: "國慶節"
			}],
			"1004": {
				tag: ["international", "environment"],
				name: "世界動物日"
			},
			"1007": {
				tag: "international",
				name: "國際住房日"
			},
			"1009": {
				tag: "international",
				name: "世界郵政日"
			},
			"1010": {
				tag: ["international", "health"],
				name: "世界精神衛生日"
			},
			"1013": {
				tag: ["international", "health"],
				name: "世界保健日"
			},
			"1015": {
				tag: "international",
				name: "國際盲人節"
			},
			"1016": {
				tag: "international",
				name: "世界糧食日"
			},
			"1017": {
				tag: "international",
				name: "世界消除貧困日"
			},
			"1024": [{
				tag: "international",
				name: "聯合國日"
			}, {
				tag: ["international", "occupation"],
				name: "程序員节"
			}],
			"1101": {
				tag: "western",
				name: "萬聖節"
			},
			"1108": {
				tag: ["cn", "occupation"],
				name: "中國記者日"
			},
			"1109": {
				tag: ["cn"],
				name: "消防宣傳日"
			},
			"1114": {
				tag: ["international", "health"],
				name: "世界糖尿病日"
			},
			"1117": {
				tag: ["international", "occupation"],
				name: "國際大學生節"
			},
			"1201": {
				tag: ["international", "health"],
				name: "世界愛滋病日"
			},
			"1203": {
				tag: ["international", "health"],
				name: "世界殘疾人日"
			},
			"1204": [{
				tag: ["cn"],
				name: "國家憲法日"
			}, {
				tag: ["cn"],
				name: "全國法制宣傳日"
			}],
			"1209": {
				tag: ["international", "sport"],
				name: "世界足球日"
			},
			"1213": {
				tag: ["cn", "commemoration"],
				name: "南京大屠殺死難者國家公鎮祭日"
			},
			"1220": {
				tag: ["cn", "commemoration"],
				name: "澳門回歸紀念日"
			},
			"1221": {
				tag: ["international", "sport"],
				name: "國際籃球日"
			},
			"1224": {
				tag: ["western"],
				name: "平安夜"
			},
			"1225": {
				tag: ["western"],
				name: "聖誕節"
			}
		}
	},
	{
		format: "M,d,dR",
		markers: {
			"3,4,2": {
				tag: ["international", "health"],
				name: "世界腎臟日"
			},
			"3,2,3": {
				tag: "international",
				name: "世界社會工作日"
			},
			"5,2,1": {
				tag: ["international", "health"],
				name: "世界防治哮喘日"
			},
			"5,0,2": {
				tag: "western",
				name: "母親節"
			},
			"5,0,3": {
				tag: ["cn", "health"],
				name: "全國助殘日"
			},
			"6,0,3": {
				tag: "western",
				name: "父親節"
			},
			"9,0,4": {
				tag: ["international", "health"],
				name: "國際聾人節"
			},
			"10,4,2": {
				tag: ["international", "health"],
				name: "世界視力日"
			},
			"11,4,4": {
				tag: "western",
				name: "感恩節"
			}
		}
	},
	{
		format: "M,d,dRr",
		markers: {
			"1,0,1": {
				tag: ["international", "health"],
				name: "國際麻風節"
			},
			"3,1,1": {
				tag: "cn",
				name: "中小學安全教育日"
			}
		}
	},
	{
		format: "lMn,lDn",
		markers: {
			"1,1": {
				tag: ["cn", "traditional"],
				name: "春節"
			},
			"2,2": {
				tag: ["cn", "traditional"],
				name: "龍抬頭"
			},
			"5,5": {
				tag: ["cn", "traditional"],
				name: "端午節"
			},
			"7,7": {
				tag: ["cn", "traditional"],
				name: "七夕節"
			},
			"7,15": {
				tag: ["cn", "traditional"],
				name: "中元節"
			},
			"8,15": {
				tag: ["cn", "traditional"],
				name: "中秋節"
			},
			"9,9": {
				tag: ["cn", "traditional"],
				name: "重陽節"
			},
			"12,8": {
				tag: ["cn", "traditional"],
				name: "腊八节"
			}
		}
	},
	{
		format: function(lunaris) {
			return lunaris.add(1, "day").day === 1 && lunaris.month === 2 ? "t" : "f";
		},
		markers: { t: {
			tag: ["international", "health"],
			name: "國際罕見病日"
		} }
	}
];
//#endregion
//#region src/markers/festivals/localize.ts
/**
* 按名称对照表从基准节日表生成本地化节日表。
* 返回深拷贝（format 函数按引用共享），两份数据互不影响。
*/
const localizeFestivalNames = (source, names) => {
	const localizeItem = (item) => ({
		...item,
		tag: Array.isArray(item.tag) ? [...item.tag] : item.tag,
		name: names[item.name] ?? item.name
	});
	return source.map((group) => {
		const markers = {};
		for (const key of Object.keys(group.markers)) {
			const value = group.markers[key];
			markers[key] = Array.isArray(value) ? value.map(localizeItem) : localizeItem(value);
		}
		return {
			format: group.format,
			markers
		};
	});
};
//#endregion
//#region src/markers/festivals/zh-cn.ts
const festivals$1 = localizeFestivalNames(festivals, {
	"國際擁抱日": "国际拥抱日",
	"世界濕地日": "世界湿地日",
	"國際氣象節": "国际气象节",
	"情人節": "情人节",
	"世界社會公正日": "世界社会公正日",
	"國際海豹日": "国际海豹日",
	"世界野生動植物日": "世界野生动植物日",
	"全國愛耳日": "全国爱耳日",
	"國際愛耳日": "国际爱耳日",
	"學雷鋒記念日": "学雷锋记念日",
	"婦女節": "妇女节",
	"植樹節": "植树节",
	"國際消費日": "国际消费日",
	"世界無肉日": "世界无肉日",
	"國際幸福日": "国际幸福日",
	"世界兒歌日": "世界儿歌日",
	"國際消除種族歧視日": "国际消除种族歧视日",
	"世界氣象日": "世界气象日",
	"世界防治結核病日": "世界防治结核病日",
	"世界戲劇日": "世界戏剧日",
	"國際愛鳥日": "国际爱鸟日",
	"愚人節": "愚人节",
	"世界衛生日": "世界卫生日",
	"國際珍稀動物保護日": "国际珍稀动物保护日",
	"國家安全教育日": "国家安全教育日",
	"世界讀書日": "世界读书日",
	"國際勞動節": "国际劳动节",
	"中國青年節": "中国青年节",
	"世界紅十字日": "世界红十字日",
	"國際護士節": "国际护士节",
	"全國防災減災日": "全国防灾减灾日",
	"全國碘缺乏病日": "全国碘缺乏病日",
	"世界電信日": "世界电信日",
	"國際博物館日": "国际博物馆日",
	"全國母乳餵養宣傳日": "全国母乳喂养宣传日",
	"中國學生營養日": "中国学生营养日",
	"國際愛膚日": "国际爱肤日",
	"世界無煙日": "世界无烟日",
	"兒童節": "儿童节",
	"世界環境日": "世界环境日",
	"全國愛眼日": "全国爱眼日",
	"世界認可日": "世界认可日",
	"國際奧林匹克日": "国际奥林匹克日",
	"全國土地日": "全国土地日",
	"國際反毒品日": "国际反毒品日",
	"香港回歸日": "香港回归日",
	"建黨節": "建党节",
	"中國航海日": "中国航海日",
	"建軍節": "建军节",
	"國際青年節": "国际青年节",
	"中國醫師節": "中国医师节",
	"中國人民抗日戰爭勝利紀念日": "中国人民抗日战争胜利纪念日",
	"教師節": "教师节",
	"預防出生缺陷日": "预防出生缺陷日",
	"全國愛牙日": "全国爱牙日",
	"國際和平日": "国际和平日",
	"世界旅遊日": "世界旅游日",
	"國際音樂節": "国际音乐节",
	"國慶節": "国庆节",
	"世界動物日": "世界动物日",
	"國際住房日": "国际住房日",
	"世界郵政日": "世界邮政日",
	"世界精神衛生日": "世界精神卫生日",
	"國際盲人節": "国际盲人节",
	"世界糧食日": "世界粮食日",
	"世界消除貧困日": "世界消除贫困日",
	"聯合國日": "联合国日",
	"程序員节": "程序员节",
	"萬聖節": "万圣节",
	"中國記者日": "中国记者日",
	"消防宣傳日": "消防宣传日",
	"國際大學生節": "国际大学生节",
	"世界愛滋病日": "世界爱滋病日",
	"世界殘疾人日": "世界残疾人日",
	"國家憲法日": "国家宪法日",
	"全國法制宣傳日": "全国法制宣传日",
	"南京大屠殺死難者國家公鎮祭日": "南京大屠杀死难者国家公镇祭日",
	"澳門回歸紀念日": "澳门回归纪念日",
	"國際籃球日": "国际篮球日",
	"聖誕節": "圣诞节",
	"世界腎臟日": "世界肾脏日",
	"世界社會工作日": "世界社会工作日",
	"母親節": "母亲节",
	"全國助殘日": "全国助残日",
	"父親節": "父亲节",
	"國際聾人節": "国际聋人节",
	"世界視力日": "世界视力日",
	"感恩節": "感恩节",
	"國際麻風節": "国际麻风节",
	"中小學安全教育日": "中小学安全教育日",
	"春節": "春节",
	"龍抬頭": "龙抬头",
	"端午節": "端午节",
	"七夕節": "七夕节",
	"中元節": "中元节",
	"中秋節": "中秋节",
	"重陽節": "重阳节",
	"國際罕見病日": "国际罕见病日"
});
festivals$1[0].markers["0515"].tag = ["international", "health"];
//#endregion
//#region src/index.ts
/** 创建 Lunaris 实例 */
const lunaris = function(date, config) {
	return new Lunaris(date, config);
};
/** 以 UTC 模式创建实例 */
lunaris.utc = function(date, config) {
	return new Lunaris(date, Object.assign({}, config, { isUTC: true }));
};
/** 从农历反查创建实例 */
lunaris.fromLunar = function(param, config) {
	return new Lunaris(parseFromLunar(param, config?.lang), config);
};
/** 从四柱干支反查创建实例（可能多解，如时柱地支为子跨早/晚子时两解） */
lunaris.fromFourPillars = function(pillars, options) {
	const toStemBranch = (item) => {
		if (item instanceof StemBranch) return item;
		if (typeof item === "string") return StemBranch.fromName(item, options);
		return StemBranch.create(item, options);
	};
	return new FourPillars((Array.isArray(pillars) ? pillars : [
		pillars.year,
		pillars.month,
		pillars.day,
		pillars.hour
	]).map(toStemBranch), options).findDates(options).map((date) => new Lunaris(date, options));
};
/** 更新全局配置 */
lunaris.config = function(config) {
	setGlobalConfig(config);
	return lunaris;
};
/**
* 注册语言包（以 zh 为基底合并）
* @param unChangeLang 是否保持当前默认语言不变
*/
lunaris.locale = function(localeData, unChangeLang = false) {
	if (Array.isArray(localeData)) {
		for (const item of localeData) lunaris.locale(item, unChangeLang);
		return lunaris;
	}
	if (!localeData || !localeData.name) return lunaris;
	_GlobalConfig.locales[localeData.name] = Object.assign({}, locale$2, _GlobalConfig.locales[localeData.name], localeData);
	if (!unChangeLang) _GlobalConfig.lang = localeData.name;
	return lunaris;
};
lunaris.getLocale = function(lang) {
	return _GlobalConfig.locales[lang];
};
lunaris.defineLocale = defineLocale;
lunaris.locale([
	locale$3,
	locale,
	locale$1
], true);
lunaris.Lunaris = Lunaris;
lunaris.Lunar = Lunar;
lunaris.SolarTerm = SolarTerm;
lunaris.FourPillars = FourPillars;
lunaris.NatalChart = NatalChart;
lunaris.StemBranch = StemBranch;
lunaris.Stem = Stem;
lunaris.Branch = Branch;
lunaris.FiveElement = FiveElement;
lunaris.Trigram = Trigram;
lunaris.Markers = Markers;
lunaris.Almanac = Almanac;
lunaris.Fortune = Fortune;
lunaris.MajorFortune = MajorFortune;
lunaris.MinorFortune = MinorFortune;
lunaris.YearlyFortune = YearlyFortune;
lunaris.MonthlyFortune = MonthlyFortune;
lunaris.DailyFortune = DailyFortune;
lunaris._globalConfig = _GlobalConfig;
//#endregion
export { Almanac, Branch, CacheClass, DAY_PILLAR_EPOCH, DailyFortune, FETAL_GOD_DAY_DIRECTION, FIRST_YEAR, FORMAT_DEFAULT, FiveElement, Fortune, FourPillars, HIDDEN_STEMS, INVALID_DATE_STRING, J2000, LAST_YEAR, LIFE_STAGE_OFFSET, LUNAR_MONTH_DATAS, LUNAR_NEW_YEAR_DATE, LUNAR_UNITS_SET, Lunar, Lunaris, MONTH_PILLAR_EPOCH, MajorFortune, Markers, MinorFortune, MonthlyFortune, NatalChart, NatalGod, GodBase as NatalGodBase, Pillar, REGEX_FORMAT, REGEX_PARSE, SolarTerm, Stem, StemBranch, TAKE_SOUND_ELEMENTS, TEN_GOD_LIST, TEN_GOD_RELATIONS, TenGod, Trigram, UNITS, YearlyFortune, _GlobalConfig, addMarkers, branchValue2month, cacheAndReturn, calcTerm, checkNatalGod, computeFetalGodData, computeGroup6ElementValue, computeLifeStageIndex, computeMeetingElementValue, computeMonthValueByTerm, computeNineYun, computePengZuData, computeRatStem, computeStemBranchValue, computeTenGodByStem, computeTriadElementValue, computeUtcOffset, countLunarMonthInYear, createAllNatalGods, dateAdd, dateDiff, lunaris as default, defineLocale, festivals as festivalsZh, festivals$1 as festivalsZhCn, filterByObj, filterStoreMarkers, format, getDateData, getDateOfStartOf23H, getGodLuckLevel, getLunarNewYearDay, getMarkersFromFormatList, getMonthDecimals, getTranslation, getTrigramValueByStem, getYearDecimals, getYearLeapMonth, godDict, godKeys, godKeysSet, isHasIntersection, isNumber, julianDayToDate, locale as localeEn, locale$1 as localeJa, locale$2 as localeZh, locale$3 as localeZhCn, lunarDateDiff, lunarMonthDiff, month2BranchValue, monthDiff, moonPhaseName, padZoneStr, parseCommonCreateClassValue, parseDate, parseFromLunar, phaseOfTheMoon, prettyLunarData, prettyMarkers, prettyMarkersItem, prettyUnit, removeMarkers, removeMarkersByTagOrName, removeMarkersFromFnListByTN, removeMarkersFromFormatItemByTN, removeMarkersFromFormatListByTN, removeMarkersInMatcherMap, setGlobalConfig, termAccurate, termAccurate2, twoList2Dict };
