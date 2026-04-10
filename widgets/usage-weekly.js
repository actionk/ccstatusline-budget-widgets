#!/usr/bin/env node
// Weekly usage with surplus/deficit indicator and time remaining
// Shows: "Week: 27% ↓9% 2d3h" (↓ = under expected, ↑ = over expected)
function fmtTime(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return d > 0 ? `${d}d${h}h` : h > 0 ? `${h}h${m}m` : `${m}m`;
}
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const sevenDay = data.rate_limits?.seven_day || {};
    const pct = sevenDay.used_percentage ?? null;
    const resetsAt = sevenDay.resets_at ?? null;
    const w = pct !== null ? Math.round(pct) : '?';
    let out = `Week: ${w}%`;
    if (pct !== null && resetsAt !== null) {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, resetsAt - now);
      const elapsed = 7 * 24 * 3600 - remaining;
      if (elapsed > 0 && remaining > 0) {
        const surplus = Math.round((elapsed / (7 * 24 * 3600)) * 100 - pct);
        out += surplus > 0 ? ` \u2193${surplus}%` : surplus < 0 ? ` \u2191${-surplus}%` : ` \u21940%`;
        out += ` ${fmtTime(remaining)}`;
      }
    }
    process.stdout.write(out);
  } catch (e) { process.stdout.write('ERR'); }
});
