#!/usr/bin/env node
// Peak hours indicator with countdown
// Peak: weekdays 5am-11am PT (1pm-7pm GMT)
// Shows: "⚡ Peak 3h20m" or "Off-peak 17h37m"
const dtf = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric', minute: 'numeric', weekday: 'short',
  hour12: false
});
const parts = Object.fromEntries(
  dtf.formatToParts(new Date()).map(p => [p.type, p.value])
);
const dayName = parts.weekday; // Mon, Tue, ...
const hour = parseInt(parts.hour, 10);
const min = parseInt(parts.minute, 10);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayIndex = weekdays.indexOf(dayName); // -1 for Sat/Sun
const weekday = dayIndex !== -1;
const peak = weekday && hour >= 5 && hour < 11;

function fmt(totalMin) {
  if (totalMin <= 0) return '0m';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

function minsUntilHour(targetHour) {
  return (targetHour - hour) * 60 - min;
}

if (peak) {
  process.stdout.write(`\u26a1 Peak ${fmt(minsUntilHour(11))}`);
} else {
  let daysUntil;
  if (weekday && hour < 5) {
    daysUntil = 0;
  } else if (dayIndex === 4 && hour >= 11) {
    daysUntil = 3; // Friday after peak -> Monday
  } else if (dayName === 'Sat') {
    daysUntil = 2;
  } else if (dayName === 'Sun') {
    daysUntil = 1;
  } else if (weekday && hour >= 11) {
    daysUntil = 1;
  } else {
    daysUntil = 0;
  }
  const minsLeft = daysUntil * 24 * 60 + minsUntilHour(5);
  process.stdout.write(`Off-peak ${fmt(minsLeft)}`);
}
