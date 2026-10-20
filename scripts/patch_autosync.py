#!/usr/bin/env python3
"""学完一课自动上传进度（前提：同步已配置）。"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

old = """  function markDone(subjectId, unitId) {
    state.done[`${subjectId}/${unitId}`] = Date.now();
    const t = todayKey();
    state.days[t] = (state.days[t] || 0) + 1;
    touchStreak();
    saveState();
  }"""

new = """  function markDone(subjectId, unitId) {
    state.done[`${subjectId}/${unitId}`] = Date.now();
    const t = todayKey();
    state.days[t] = (state.days[t] || 0) + 1;
    touchStreak();
    saveState();
    autoSync();
  }

  /* 学完自动上传（只在配好同步时动作，悄悄进行，不打断学习） */
  let syncing = false;
  async function autoSync() {
    const S = window.MG_SYNC;
    if (!S || syncing) return;
    const c = S.cfg();
    if (!c.token || !c.gist) return;
    syncing = true;
    try {
      await S.push(c.token, c.gist, state);
      console.log('[sync] 进度已上传');
    } catch (e) {
      console.warn('[sync] 上传失败：' + e.message);
    } finally {
      syncing = false;
    }
  }"""

if old not in s:
    print("FAIL anchor")
    sys.exit(1)
s = s.replace(old, new, 1)
p.write_text(s, encoding="utf-8")
print("patched", len(s))
