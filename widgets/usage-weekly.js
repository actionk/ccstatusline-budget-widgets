#!/usr/bin/env node
// Weekly usage with surplus/deficit indicator
// Shows: "Week: 27% ↓9%" (↓ = under expected, ↑ = over expected)
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
      }
    }
    process.stdout.write(out);
  } catch (e) { process.stdout.write('ERR'); }
});
