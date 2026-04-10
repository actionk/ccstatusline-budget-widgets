# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

npm package providing three ccstatusline widgets for Claude Code API budget tracking. Published via `npx ccstatusline-budget-widgets`, which runs `install.js` to copy widgets and patch user's ccstatusline `settings.json`.

No build step, no dependencies, no tests, no linting — pure vanilla Node.js.

## Architecture

```
install.js          # Entry point (bin). Copies widgets, patches settings.json.
widgets/
  usage-5h.js       # 5-hour session budget widget
  usage-weekly.js   # 7-day rolling budget widget
  peak-hours.js     # Peak hours indicator widget
```

**Widget protocol**: Each widget is a standalone executable Node.js script. ccstatusline pipes JSON budget data to stdin; widget outputs formatted text to stdout. Registered as `custom-command` with 2000ms timeout.

**Data flow in usage widgets**: Read `data.rate_limits.five_hour` (or `seven_day`) from stdin JSON → compute `surplus = (elapsed_time_fraction * 100) - usage_percent` → output `{label}: {pct}% {↓ or ↑}`.

**Peak hours logic** (`peak-hours.js`): Uses `Intl.DateTimeFormat` to get current PT time. Peak = weekdays 5am–11am PT. Outputs `⚡ Peak {countdown}` or `Off-peak {countdown}`.

**Installer** (`install.js`): Resolves config dir via `XDG_CONFIG_HOME` or platform defaults, copies widget files, reads/writes ccstatusline `settings.json` (backs up as `.bak`), generates `custom-command` entries with absolute `commandPath`.

## Publishing

```bash
npm publish
```

Test installer locally:
```bash
node install.js
```

Simulate widget with ccstatusline JSON input:
```bash
echo '{"rate_limits":{"five_hour":{"tokens_used":1000,"tokens_limit":5000,"reset_time":"..."}}}' | node widgets/usage-5h.js
```
