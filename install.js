#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const WIDGETS = ['usage-5h.js', 'usage-weekly.js', 'peak-hours.js'];

// Determine config dir
const configDir = process.env.XDG_CONFIG_HOME
  ? path.join(process.env.XDG_CONFIG_HOME, 'ccstatusline')
  : path.join(os.homedir(), '.config', 'ccstatusline');

const widgetsSrc = path.join(__dirname, 'widgets');

console.log('ccstatusline Budget Widgets');
console.log('==========================\n');

// Ensure config dir exists
fs.mkdirSync(configDir, { recursive: true });

// Copy widgets
for (const file of WIDGETS) {
  const src = path.join(widgetsSrc, file);
  const dest = path.join(configDir, file);
  fs.copyFileSync(src, dest);
  console.log(`  Installed: ${dest}`);
}

// Build snippet entries
const snippets = WIDGETS.map(file => {
  const id = file.replace('.js', '');
  const commandPath = path.join(configDir, file).replace(/\\/g, '/');
  return {
    id,
    type: 'custom-command',
    commandPath: `node ${commandPath}`,
    timeout: 2000
  };
});

// Try to patch settings.json
const settingsPath = path.join(configDir, 'settings.json');
let patched = false;

if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings.lines && Array.isArray(settings.lines[0])) {
      // Backup before modifying
      fs.copyFileSync(settingsPath, settingsPath + '.bak');

      let inserted = 0;
      for (const snippet of snippets) {
        const existingIdx = settings.lines[0].findIndex(w => w.id === snippet.id);
        if (existingIdx !== -1) {
          settings.lines[0][existingIdx] = snippet;
          console.log(`  Updated widget: ${snippet.id}`);
        } else {
          settings.lines[0].splice(inserted, 0, snippet);
          console.log(`  Added widget: ${snippet.id}`);
          inserted++;
        }
      }

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      patched = true;
      console.log(`\n  Settings updated: ${settingsPath}`);
      console.log(`  Backup saved: ${settingsPath}.bak`);
    }
  } catch (e) {
    console.log(`\n  Could not auto-patch settings: ${e.message}`);
  }
} else {
  console.log('\n  No ccstatusline settings found.');
  console.log('  Install ccstatusline first: https://github.com/sirmalloc/ccstatusline');
}

if (!patched) {
  console.log('\nAdd these to your ccstatusline settings.json lines array:\n');
  console.log(JSON.stringify(snippets, null, 2));
}

console.log('\nRestart Claude Code to see the widgets.');
console.log('Run "npx -y ccstatusline@latest" to customize layout.\n');

console.log('Widgets:');
console.log('  usage-5h      5-hour session usage with budget indicator (\u2193 under, \u2191 over)');
console.log('  usage-weekly  Weekly usage with budget indicator');
console.log('  peak-hours    Peak/off-peak indicator with countdown');
console.log('                Peak: weekdays 5am-11am PT (1pm-7pm GMT)\n');
