const byId = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const formatDuration = milliseconds => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(total % 60)}`;
};

function updateClock() {
  const now = new Date();
  byId('clockTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  byId('clockDate').textContent = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

let audioContext;
function prepareSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ||= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
}
let bellInterval = null;
function playBell() {
  if (!audioContext || audioContext.state !== 'running') return;
  const start = audioContext.currentTime;
  [[660, .11], [990, .035]].forEach(([frequency, volume]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + 1.45);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 1.5);
  });
}
function startBell() {
  clearInterval(bellInterval);
  playBell();
  bellInterval = setInterval(playBell, 2400);
}
function ring(title, message) {
  prepareSound(); startBell();
  byId('ringTitle').textContent = title;
  byId('ringMessage').textContent = `${message} The bell will continue until you press Stop.`;
  if (!byId('ringDialog').open) byId('ringDialog').showModal();
  navigator.vibrate?.([160, 120, 160]);
}
function stopRing() {
  clearInterval(bellInterval);
  bellInterval = null;
  byId('ringDialog').close();
}
byId('ringStop').addEventListener('click', stopRing);
byId('ringDialog').addEventListener('cancel', event => event.preventDefault());

let alarmAt = Number(localStorage.getItem('f4m1lyAlarmAt')) || 0;
function renderAlarm() {
  const active = alarmAt > Date.now();
  byId('cancelAlarm').disabled = !active;
  byId('alarmStatus').textContent = active
    ? `Alarm in ${formatDuration(alarmAt - Date.now())} · ${new Date(alarmAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`
    : 'No alarm set.';
}
byId('setAlarm').addEventListener('click', () => {
  const value = byId('alarmTime').value;
  if (!value) { byId('alarmStatus').textContent = 'Choose an alarm time first.'; return; }
  prepareSound();
  const [hours, minutes] = value.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  alarmAt = target.getTime();
  localStorage.setItem('f4m1lyAlarmAt', String(alarmAt));
  renderAlarm();
});
byId('cancelAlarm').addEventListener('click', () => {
  alarmAt = 0;
  localStorage.removeItem('f4m1lyAlarmAt');
  renderAlarm();
});

let timerEnd = 0, timerRemaining = 0, timerRunning = false, timerFinished = false;
function durationFromInputs() {
  const hours = Math.min(99, Math.max(0, Number(byId('timerHours').value) || 0));
  const minutes = Math.min(59, Math.max(0, Number(byId('timerMinutes').value) || 0));
  const seconds = Math.min(59, Math.max(0, Number(byId('timerSeconds').value) || 0));
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
function renderTimer() {
  const remaining = timerRunning ? Math.max(0, timerEnd - Date.now()) : timerRemaining || (timerFinished ? 0 : durationFromInputs());
  byId('timerDisplay').textContent = formatDuration(remaining);
  byId('timerStart').textContent = timerRunning ? 'Pause' : timerRemaining ? 'Resume' : 'Start';
}
byId('timerStart').addEventListener('click', () => {
  prepareSound();
  renderAlarm();
  if (timerRunning) {
    timerRemaining = Math.max(0, timerEnd - Date.now());
    timerRunning = false;
  } else {
    timerRemaining ||= durationFromInputs();
    if (!timerRemaining) return;
    timerEnd = Date.now() + timerRemaining;
    timerRunning = true;
  }
  renderTimer();
});
byId('timerReset').addEventListener('click', () => { timerRunning = false; timerFinished = false; timerEnd = 0; timerRemaining = 0; renderTimer(); });
document.querySelectorAll('.duration-inputs input').forEach(input => input.addEventListener('input', () => { if (!timerRunning && !timerRemaining) renderTimer(); }));

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
  if (stopwatchRunning) {
    stopwatchElapsed += Date.now() - stopwatchStartedAt;
    stopwatchRunning = false;
  } else {
    stopwatchStartedAt = Date.now();
    stopwatchRunning = true;
  }
  renderStopwatch();
});
byId('stopwatchReset').addEventListener('click', () => {
  stopwatchElapsed = 0;
  if (stopwatchRunning) stopwatchStartedAt = Date.now();
  renderStopwatch();
});
function tick() {
  updateClock();
  if (alarmAt && Date.now() >= alarmAt) {
    alarmAt = 0; localStorage.removeItem('f4m1lyAlarmAt'); ring('Alarm', 'Your alarm time has arrived.');
  }
  renderAlarm();
  if (timerRunning) {
    if (Date.now() >= timerEnd) { timerRunning = false; timerFinished = true; timerRemaining = 0; renderTimer(); ring('Timer complete', 'Your countdown has finished.'); }
    else renderTimer();
  }
  if (stopwatchRunning) renderStopwatch();
}

if (alarmAt > Date.now()) byId('alarmTime').value = `${pad(new Date(alarmAt).getHours())}:${pad(new Date(alarmAt).getMinutes())}`;
else { alarmAt = 0; localStorage.removeItem('f4m1lyAlarmAt'); }
updateClock(); renderAlarm(); renderTimer(); renderStopwatch(); tick(); setInterval(tick, 100);