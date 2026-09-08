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
    ? `Alarm set for ${new Date(alarmAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}.`
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

let targetAt = Number(localStorage.getItem('f4m1lyTargetAt')) || 0;
function toInputDateTime(timestamp) {
  const date = new Date(timestamp - new Date(timestamp).getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
}
function renderTarget() {
  const remaining = targetAt - Date.now();
  const active = remaining > 0;
  byId('clearTarget').disabled = !targetAt;
  if (!targetAt) { byId('remainingDisplay').textContent = '—'; byId('remainingStatus').textContent = 'Choose a future date and time.'; return; }
  if (!active) { byId('remainingDisplay').textContent = '00d 00:00:00'; byId('remainingStatus').textContent = 'The target time has arrived.'; return; }
  const totalSeconds = Math.ceil(remaining / 1000), days = Math.floor(totalSeconds / 86400);
  byId('remainingDisplay').textContent = `${pad(days)}d ${formatDuration(remaining % 86400000)}`;
  byId('remainingStatus').textContent = `Until ${new Date(targetAt).toLocaleString()}.`;
}
byId('setTarget').addEventListener('click', () => {
  const target = new Date(byId('targetTime').value).getTime();
  if (!target || target <= Date.now()) { byId('remainingStatus').textContent = 'Choose a date and time in the future.'; return; }
  prepareSound(); targetAt = target; localStorage.setItem('f4m1lyTargetAt', String(targetAt)); renderTarget();
});
byId('clearTarget').addEventListener('click', () => { targetAt = 0; localStorage.removeItem('f4m1lyTargetAt'); byId('targetTime').value = ''; renderTarget(); });

let targetRang = false;
function tick() {
  updateClock();
  if (alarmAt && Date.now() >= alarmAt) {
    alarmAt = 0; localStorage.removeItem('f4m1lyAlarmAt'); renderAlarm(); ring('Alarm', 'Your alarm time has arrived.');
  }
  if (timerRunning) {
    if (Date.now() >= timerEnd) { timerRunning = false; timerFinished = true; timerRemaining = 0; renderTimer(); ring('Timer complete', 'Your countdown has finished.'); }
    else renderTimer();
  }
  if (targetAt && Date.now() >= targetAt && !targetRang) { targetRang = true; ring('Target reached', 'The time you were waiting for has arrived.'); }
  if (targetAt && Date.now() < targetAt) targetRang = false;
  renderTarget();
}

if (alarmAt > Date.now()) byId('alarmTime').value = `${pad(new Date(alarmAt).getHours())}:${pad(new Date(alarmAt).getMinutes())}`;
else { alarmAt = 0; localStorage.removeItem('f4m1lyAlarmAt'); }
if (targetAt) byId('targetTime').value = toInputDateTime(targetAt);
updateClock(); renderAlarm(); renderTimer(); renderTarget(); tick(); setInterval(tick, 250);