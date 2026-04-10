#!/usr/bin/env node
// 5-hour session usage with surplus/deficit indicator and time remaining
// Shows: "5h: 32% ↓34% 1h23m" (↓ = under expected, ↑ = over expected)
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const fiveHour = data.rate_limits?.five_hour || {};
    const pct = fiveHour.used_percentage ?? null;
    const resetsAt = fiveHour.resets_at ?? null;
    const s = pct !== null ? Math.round(pct) : '?';
    let out = `5h: ${s}%`;
    if (pct !== null && resetsAt !== null) {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, resetsAt - now);
      const elapsed = 5 * 3600 - remaining;
      if (elapsed > 0 && remaining > 0) {
        const surplus = Math.round((elapsed / (5 * 3600)) * 100 - pct);
        out += surplus > 0 ? ` \u2193${surplus}%` : surplus < 0 ? ` \u2191${-surplus}%` : ` \u21940%`;
        out += ` ${fmtTime(remaining)}`;
      }
    }
    process.stdout.write(out);
  } catch (e) { process.stdout.write('ERR'); }
});
