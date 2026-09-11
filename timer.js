const byId = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const cleanNote = value => value.trim().slice(0, 24);
const escapeHTML = value => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

const formatDuration = milliseconds => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(total % 60)}`;
};

function offsetLabel(timeZone, date = new Date()) {
  try {
    const offset = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'GMT';
    const match = offset.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
    if (!match) return '+0';
    return `${match[1]}${Number(match[2])}${match[3] && match[3] !== '00' ? `:${match[3]}` : ''}`;
  } catch { return ''; }
}

function placeFromTimeZone(timeZone) {
  return (timeZone.split('/').pop() || 'Local').replaceAll('_', ' ');
}

function updateClock() {
  const now = new Date();
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  byId('clockTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  byId('localClockInfo').textContent = `${offsetLabel(localZone, now)} ${placeFromTimeZone(localZone)}`;
  byId('clockDate').textContent = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  renderWorldClocks(now);
}

function makeBellAudio() {
  const sampleRate = 22050;
  const duration = 2.4;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const write = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, samples * 2, true);
  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    let signal = 0;
    [0, .42].forEach((offset, toneIndex) => {
      const age = time - offset;
      if (age >= 0 && age < 1.15) {
        const envelope = Math.exp(-3.6 * age) * Math.min(1, age * 45);
        signal += Math.sin(2 * Math.PI * (toneIndex ? 880 : 660) * age) * envelope * .18;
        signal += Math.sin(2 * Math.PI * (toneIndex ? 1320 : 990) * age) * envelope * .045;
      }
    });
    view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, signal)) * 32767, true);
  }
  const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' })));
  audio.loop = true;
  audio.preload = 'auto';
  return audio;
}

const bellAudio = makeBellAudio();
let soundPrepared = false;
function prepareSound() {
  if (soundPrepared) return;
  const attempt = bellAudio.play();
  if (attempt) attempt.then(() => { bellAudio.pause(); bellAudio.currentTime = 0; soundPrepared = true; }).catch(() => {});
}
function startBell() {
  bellAudio.currentTime = 0;
  bellAudio.play().catch(() => {});
}
function stopRing() {
  bellAudio.pause();
  bellAudio.currentTime = 0;
  if (byId('ringDialog').open) byId('ringDialog').close();
}
function ring(events) {
  const labels = events.map(event => event.note || event.type).join(' · ');
  byId('ringTitle').textContent = events.length === 1 ? (events[0].note || events[0].type) : `${events.length} reminders`;
  byId('ringMessage').textContent = `${labels}. The bell will continue until you press Stop.`;
  if (!byId('ringDialog').open) byId('ringDialog').showModal();
  startBell();
  navigator.vibrate?.([160, 120, 160]);
}
byId('ringStop').addEventListener('click', stopRing);
byId('ringDialog').addEventListener('cancel', event => event.preventDefault());

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
let alarms = readList('f4m1lyAlarms');
let timers = readList('f4m1lyTimers');
let worldClocks = readList('f4m1lyWorldClocks');
const saveAlarms = () => localStorage.setItem('f4m1lyAlarms', JSON.stringify(alarms));
const saveTimers = () => localStorage.setItem('f4m1lyTimers', JSON.stringify(timers));
const saveWorldClocks = () => localStorage.setItem('f4m1lyWorldClocks', JSON.stringify(worldClocks));

function worldClockMarkup(clock, now) {
  const time = new Intl.DateTimeFormat([], { timeZone: clock.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
  const place = escapeHTML(clock.name);
  const country = clock.country ? `, ${escapeHTML(clock.country)}` : '';
  return `<div class="world-clock-item" data-clock-id="${clock.id}"><time>${time}</time><span><strong>${place}${country}</strong><small>${offsetLabel(clock.timezone, now)}</small></span><button type="button" aria-label="Remove ${place}">×</button></div>`;
}
function renderWorldClocks(now = new Date()) {
  const list = byId('worldClockList');
  const scrollTop = list.scrollTop;
  list.innerHTML = worldClocks.length ? worldClocks.map(clock => worldClockMarkup(clock, now)).join('') : '';
  list.scrollTop = scrollTop;
}
async function addWorldClock() {
  const input = byId('clockLocation');
  const query = input.value.trim();
  if (query.length < 2) { byId('clockStatus').textContent = 'Write a place first.'; return; }
  const button = byId('addClock');
  button.disabled = true;
  byId('clockStatus').textContent = 'Finding place…';
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    if (!response.ok) throw new Error('Location search is unavailable.');
    const result = (await response.json()).results?.[0];
    if (!result?.timezone) throw new Error('Place not found. Try adding its country.');
    if (!worldClocks.some(clock => clock.timezone === result.timezone && clock.name === result.name)) {
      worldClocks.push({ id: makeId(), name: result.name, country: result.country || '', timezone: result.timezone });
      saveWorldClocks();
    }
    input.value = '';
    byId('clockStatus').textContent = `${result.name} added.`;
    renderWorldClocks();
  } catch (error) {
    byId('clockStatus').textContent = error.message || 'Could not find that place.';
  } finally { button.disabled = false; }
}
byId('addClock').addEventListener('click', addWorldClock);
byId('clockLocation').addEventListener('keydown', event => { if (event.key === 'Enter') addWorldClock(); });
byId('worldClockList').addEventListener('click', event => {
  const item = event.target.closest('[data-clock-id]');
  if (!item || event.target.tagName !== 'BUTTON') return;
  worldClocks = worldClocks.filter(clock => clock.id !== item.dataset.clockId);
  saveWorldClocks(); renderWorldClocks();
});

const legacyAlarm = Number(localStorage.getItem('f4m1lyAlarmAt')) || 0;
if (legacyAlarm > Date.now() && !alarms.some(alarm => alarm.at === legacyAlarm)) {
  alarms.push({ id: makeId(), at: legacyAlarm, note: '' });
  saveAlarms();
}
localStorage.removeItem('f4m1lyAlarmAt');

function alarmMarkup(alarm, now) {
  const date = new Date(alarm.at);
  const note = escapeHTML(alarm.note || 'Alarm');
  return `<div class="time-list-item" data-alarm-id="${alarm.id}"><div><strong>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><span>${note}</span></div><output>${formatDuration(alarm.at - now)}</output><button type="button" aria-label="Cancel ${note}">Cancel</button></div>`;
}
function renderAlarms(now = Date.now()) {
  const list = byId('alarmList');
  const scrollTop = list.scrollTop;
  list.innerHTML = alarms.length ? alarms.sort((a, b) => a.at - b.at).map(alarm => alarmMarkup(alarm, now)).join('') : '<p class="empty-time-list">No alarms set.</p>';
  list.scrollTop = scrollTop;
}
byId('setAlarm').addEventListener('click', () => {
  const value = byId('alarmTime').value;
  if (!value) { byId('alarmStatus').textContent = 'Choose a time first.'; return; }
  prepareSound();
  const [hours, minutes] = value.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  alarms.push({ id: makeId(), at: target.getTime(), note: cleanNote(byId('alarmNote').value) });
  byId('alarmNote').value = '';
  byId('alarmStatus').textContent = 'Alarm added.';
  saveAlarms(); renderAlarms();
});
byId('alarmList').addEventListener('click', event => {
  const item = event.target.closest('[data-alarm-id]');
  if (!item || event.target.tagName !== 'BUTTON') return;
  alarms = alarms.filter(alarm => alarm.id !== item.dataset.alarmId);
  saveAlarms(); renderAlarms();
});

function durationFromInputs() {
  const hours = Math.min(99, Math.max(0, Number(byId('timerHours').value) || 0));
  const minutes = Math.min(59, Math.max(0, Number(byId('timerMinutes').value) || 0));
  const seconds = Math.min(59, Math.max(0, Number(byId('timerSeconds').value) || 0));
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
function timerMarkup(timer, now) {
  const remaining = timer.running ? Math.max(0, timer.end - now) : timer.remaining;
  const note = escapeHTML(timer.note || 'Timer');
  return `<div class="time-list-item" data-timer-id="${timer.id}"><div><strong>${formatDuration(remaining)}</strong><span>${note}</span></div><button type="button" data-pause>${timer.running ? 'Pause' : 'Resume'}</button><button type="button" data-remove aria-label="Remove ${note}">×</button></div>`;
}
function renderTimers(now = Date.now()) {
  const list = byId('timerList');
  const scrollTop = list.scrollTop;
  list.innerHTML = timers.length ? timers.map(timer => timerMarkup(timer, now)).join('') : '<p class="empty-time-list">No timers running.</p>';
  list.scrollTop = scrollTop;
}
byId('timerStart').addEventListener('click', () => {
  const duration = durationFromInputs();
  if (!duration) { byId('timerStatus').textContent = 'Enter a duration first.'; return; }
  prepareSound();
  timers.push({ id: makeId(), end: Date.now() + duration, remaining: duration, running: true, note: cleanNote(byId('timerNote').value) });
  byId('timerNote').value = '';
  byId('timerStatus').textContent = 'Timer started.';
  saveTimers(); renderTimers();
});
byId('timerList').addEventListener('click', event => {
  const item = event.target.closest('[data-timer-id]');
  if (!item || event.target.tagName !== 'BUTTON') return;
  const timer = timers.find(candidate => candidate.id === item.dataset.timerId);
  if (!timer) return;
  if (event.target.matches('[data-remove]')) timers = timers.filter(candidate => candidate.id !== timer.id);
  else if (event.target.matches('[data-pause]')) {
    if (timer.running) { timer.remaining = Math.max(0, timer.end - Date.now()); timer.running = false; }
    else { timer.end = Date.now() + timer.remaining; timer.running = true; }
  }
  saveTimers(); renderTimers();
});

function formatStopwatch(milliseconds) {
  const tenths = Math.floor(Math.max(0, milliseconds) / 100);
  const hours = Math.floor(tenths / 36000);
  const minutes = Math.floor((tenths % 36000) / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${tenths % 10}`;
}
let stopwatchElapsed = 0, stopwatchStartedAt = 0, stopwatchRunning = false;
function renderStopwatch() {
  const elapsed = stopwatchElapsed + (stopwatchRunning ? Date.now() - stopwatchStartedAt : 0);
  byId('stopwatchDisplay').textContent = formatStopwatch(elapsed);
  byId('stopwatchToggle').textContent = stopwatchRunning ? 'Stop' : 'Start';
  byId('stopwatchStatus').textContent = stopwatchRunning ? 'Running.' : stopwatchElapsed ? 'Stopped.' : 'Ready to start.';
}
byId('stopwatchToggle').addEventListener('click', () => {
  if (stopwatchRunning) { stopwatchElapsed += Date.now() - stopwatchStartedAt; stopwatchRunning = false; }
  else { stopwatchStartedAt = Date.now(); stopwatchRunning = true; }
  renderStopwatch();
});
byId('stopwatchReset').addEventListener('click', () => {
  stopwatchElapsed = 0;
  if (stopwatchRunning) stopwatchStartedAt = Date.now();
  renderStopwatch();
});

function tick() {
  const now = Date.now();
  updateClock();
  const due = [];
  const dueAlarms = alarms.filter(alarm => now >= alarm.at);
  if (dueAlarms.length) {
    due.push(...dueAlarms.map(alarm => ({ type: 'Alarm', note: alarm.note })));
    alarms = alarms.filter(alarm => now < alarm.at); saveAlarms();
  }
  const finishedTimers = timers.filter(timer => timer.running && now >= timer.end);
  if (finishedTimers.length) {
    due.push(...finishedTimers.map(timer => ({ type: 'Timer', note: timer.note })));
    timers = timers.filter(timer => !finishedTimers.includes(timer)); saveTimers();
  }
  renderAlarms(now); renderTimers(now);
  if (stopwatchRunning) renderStopwatch();
  if (due.length) ring(due);
}

const tickerWorker = (() => {
  try {
    const worker = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),250)'], { type: 'text/javascript' })));
    worker.onmessage = tick;
    return worker;
  } catch { return null; }
})();
if (!tickerWorker) setInterval(tick, 250);
document.addEventListener('visibilitychange', tick);
window.addEventListener('focus', tick);
window.addEventListener('pageshow', tick);

updateClock(); renderAlarms(); renderTimers(); renderStopwatch(); tick();
