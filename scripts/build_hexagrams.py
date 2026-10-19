#!/usr/bin/env python3
"""从 ichingshifa 的 data.pkl 提取六十四卦数据，生成 App 用的 hexagrams.json。

输出结构：
{
  "trigrams": {"乾": [1,1,1], ...},        # 下→上，1=阳 0=阴
  "names": {"乾": {"名":"乾为天","卦辞":"...","爻":[6 条]}},
  "table": {"乾|乾": "乾", ...}            # 上卦|下卦 -> 卦名
}
"""
import json
import pickle
import sys
from pathlib import Path

# 八卦（下→上，1=阳 0=阴）
TRIGRAMS = {
    "乾": [1, 1, 1],
    "兑": [1, 1, 0],
    "离": [1, 0, 1],
    "震": [1, 0, 0],
    "巽": [0, 1, 1],
    "坎": [0, 1, 0],
    "艮": [0, 0, 1],
    "坤": [0, 0, 0],
}

# 标准六十四卦表：上卦|下卦 -> 卦名
TABLE = {
    ("乾", "乾"): "乾", ("乾", "兑"): "履", ("乾", "离"): "同人", ("乾", "震"): "无妄",
    ("乾", "巽"): "姤", ("乾", "坎"): "讼", ("乾", "艮"): "遁", ("乾", "坤"): "否",
    ("兑", "乾"): "夬", ("兑", "兑"): "兑", ("兑", "离"): "革", ("兑", "震"): "随",
    ("兑", "巽"): "大过", ("兑", "坎"): "困", ("兑", "艮"): "咸", ("兑", "坤"): "萃",
    ("离", "乾"): "大有", ("离", "兑"): "睽", ("离", "离"): "离", ("离", "震"): "噬嗑",
    ("离", "巽"): "鼎", ("离", "坎"): "未济", ("离", "艮"): "旅", ("离", "坤"): "晋",
    ("震", "乾"): "大壮", ("震", "兑"): "归妹", ("震", "离"): "丰", ("震", "震"): "震",
    ("震", "巽"): "恒", ("震", "坎"): "解", ("震", "艮"): "小过", ("震", "坤"): "豫",
    ("巽", "乾"): "小畜", ("巽", "兑"): "中孚", ("巽", "离"): "家人", ("巽", "震"): "益",
    ("巽", "巽"): "巽", ("巽", "坎"): "涣", ("巽", "艮"): "渐", ("巽", "坤"): "观",
    ("坎", "乾"): "需", ("坎", "兑"): "节", ("坎", "离"): "既济", ("坎", "震"): "屯",
    ("坎", "巽"): "井", ("坎", "坎"): "坎", ("坎", "艮"): "蹇", ("坎", "坤"): "比",
    ("艮", "乾"): "大畜", ("艮", "兑"): "损", ("艮", "离"): "贲", ("艮", "震"): "颐",
    ("艮", "巽"): "蛊", ("艮", "坎"): "蒙", ("艮", "艮"): "艮", ("艮", "坤"): "剥",
    ("坤", "乾"): "泰", ("坤", "兑"): "临", ("坤", "离"): "明夷", ("坤", "震"): "复",
    ("坤", "巽"): "升", ("坤", "坎"): "师", ("坤", "艮"): "谦", ("坤", "坤"): "坤",
}

# 全名（上下同卦称「X为Y」）
NATURE = {"乾": "天", "兑": "泽", "离": "火", "震": "雷", "巽": "风", "坎": "水", "艮": "山", "坤": "地"}


def full_name(up, low):
    name = TABLE[(up, low)]
    if up == low:
        return f"{name}为{NATURE[name]}"
    return f"{NATURE[up]}{NATURE[low]}{name}"


def main():
    pkl = Path(sys.argv[1])
    out = Path(sys.argv[2])
    d = pickle.load(open(pkl, "rb"))
    details = d["易經卦爻詳解"]

    # 把简体卦名映射回去（data.pkl 用繁体）
    trad = {n: n for n in details}
    simple_map = {}
    for t in trad:
        s = t.translate(str.maketrans("觀遯剝晉頤蠱臨復夬姤萃升困井革鼎震艮漸歸豐旅巽兌渙節孚過既濟未濟", "观遁剥晋颐蛊临复夬姤萃升困井革鼎震艮渐归丰旅巽兑涣节孚过既济未济"))
        simple_map[s] = t

    names = {}
    for up in TRIGRAMS:
        for low in TRIGRAMS:
            simple = TABLE[(up, low)]
            tkey = simple_map.get(simple, simple)
            det = details.get(tkey, {})
            names[simple] = {
                "full": full_name(up, low),
                "up": up,
                "low": low,
                "line": det.get(0, ""),
                "yao": [det.get(i, "") for i in range(1, 7)],
            }

    payload = {
        "trigrams": TRIGRAMS,
        "natures": NATURE,
        "names": names,
        "table": {f"{u}|{l}": v for (u, l), v in TABLE.items()},
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    missing = [k for k, v in names.items() if not v["line"]]
    print(f"{len(names)} 卦 -> {out}")
    if missing:
        print("缺卦辞:", missing)


if __name__ == "__main__":
    main()
