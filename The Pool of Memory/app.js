const SUPABASE_URL = 'https://owceeowarwqjsxpylnoo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DxH30XOgchm8PifrXNKn-w_9fRNFoQg';
const SCORE_ENDPOINT = `${SUPABASE_URL}/rest/v1/memory_scores`;
const state = { screen: 'start', phase: 'start', level: 1, score: 0, lives: 3, highestLevel: 1, tiles: [], expectedIndex: 0, timer: null, sound: true, selectedGroup: 'Under 18' };
const $ = (selector) => document.querySelector(selector);
const screens = { start: $('#start-screen'), game: $('#game-screen'), gameover: $('#gameover-screen'), submitted: $('#submitted-screen'), scores: $('#scores-screen') };
const groups = ['Under 18', '18–25', '26–40', '41–60', 'Over 60'];

function showScreen(name) { Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle('active', key === name)); state.screen = name; if (name === 'scores') renderScores(state.selectedGroup); }
function formatScore(score) { return score.toLocaleString('en-US').padStart(4, '0'); }
function playTone(type) {
  if (!state.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain();
  const settings = type === 'success' ? { notes: [523, 659, 784], duration: .13 } : type === 'failure' ? { notes: [180, 120], duration: .18 } : { notes: [420], duration: .055 };
  oscillator.type = type === 'failure' ? 'square' : 'triangle'; oscillator.frequency.setValueAtTime(settings.notes[0], context.currentTime);
  settings.notes.slice(1).forEach((note, index) => oscillator.frequency.setValueAtTime(note, context.currentTime + (index + 1) * settings.duration));
  gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + settings.duration * settings.notes.length);
  oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + settings.duration * settings.notes.length);
}
function uniqueNumbers(count, max) { const values = new Set(); while (values.size < count) values.add(Math.floor(Math.random() * max) + 1); return [...values].sort((a, b) => a - b); }
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
function updateHud() { $('#level-value').textContent = String(state.level).padStart(2, '0'); $('#score-value').textContent = formatScore(state.score); $('#lives-value').textContent = '♥ '.repeat(state.lives).trim() || '—'; }
function setPhase(label, time = '') { $('#phase-label').textContent = label; $('#phase-time').textContent = time; }
function renderBoard(numbers) {
  const board = $('#board'); board.innerHTML = '';
  state.tiles = shuffle(numbers).map((number, index) => ({ number, index, revealed: false }));
  const columns = Math.min(4, Math.max(3, Math.ceil(Math.sqrt(state.tiles.length))));
  const rows = Math.ceil(state.tiles.length / columns);
  const slots = Array.from({ length: columns * rows }, (_, index) => ({
    left: ((index % columns) + 0.5) * (100 / columns),
    top: (Math.floor(index / columns) + 0.5) * (100 / rows)
  }));
  shuffle(slots).slice(0, state.tiles.length).forEach((slot, slotIndex) => {
    const tile = state.tiles[slotIndex];
    const button = document.createElement('button'); button.className = 'tile'; button.type = 'button'; button.dataset.index = tile.index;
    button.style.left = `${slot.left}%`; button.style.top = `${slot.top}%`; button.setAttribute('aria-label', 'Hidden number tile');
    button.innerHTML = `<span class="tile-inner"><span class="tile-face tile-front">${tile.number}</span><span class="tile-face tile-back" aria-hidden="true"></span></span>`;
    button.addEventListener('click', () => selectTile(tile, button)); board.appendChild(button);
  });
}
function startRound() {
  clearInterval(state.timer); state.phase = 'memorizing'; state.expectedIndex = 0; updateHud(); const numbers = uniqueNumbers(state.level + 4, state.level + 14); renderBoard(numbers); showScreen('game');
  const duration = state.level + 4; const end = Date.now() + duration * 1000;
  setPhase('MEMORIZE', `${duration}.0s`); $('#game-hint').textContent = 'Keep the order in your head.';
  state.timer = setInterval(() => { const remaining = Math.max(0, end - Date.now()) / 1000; $('#phase-time').textContent = `${remaining.toFixed(1)}s`; if (remaining <= 0) { clearInterval(state.timer); hideTiles(); } }, 80);
}
function hideTiles() { if (state.phase !== 'memorizing') return; state.phase = 'playing'; setPhase('SMALLEST → LARGEST'); $('#game-hint').textContent = 'Choose the smallest number you remember.'; document.querySelectorAll('.tile').forEach(tile => tile.classList.add('is-hidden')); }
function selectTile(tile, button) {
  if (state.phase !== 'playing' || tile.revealed) return;
  playTone('click'); tile.revealed = true; button.classList.add('is-revealed');
  const expected = [...state.tiles].sort((a, b) => a.number - b.number)[state.expectedIndex];
  if (tile.number !== expected.number) { failRound(button); return; }
  button.classList.add('is-correct'); state.score += 100 * state.level; state.expectedIndex += 1; updateHud();
  if (state.expectedIndex === state.tiles.length) completeRound();
}
function completeRound() { state.phase = 'levelComplete'; playTone('success'); showToast(`LEVEL ${state.level} COMPLETE`); setPhase('COMPLETE'); $('#game-hint').textContent = 'Nice recall. Preparing the next round…'; setTimeout(() => { state.level += 1; state.highestLevel = Math.max(state.highestLevel, state.level); startRound(); }, 900); }
function failRound(button) { state.phase = 'levelFailed'; button.classList.add('is-wrong'); playTone('failure'); state.lives -= 1; updateHud(); document.querySelectorAll('.tile').forEach(tile => tile.classList.add('is-revealed')); showToast('WRONG ORDER'); setPhase('ROUND FAILED'); $('#game-hint').textContent = state.lives ? 'The sequence is revealed. Resetting your level…' : 'No lives left.'; setTimeout(() => { if (!state.lives) endGame(); else { state.level = Math.max(1, state.level - 1); startRound(); } }, 1300); }
function endGame() { clearInterval(state.timer); state.phase = 'gameOver'; $('#final-score').textContent = state.score.toLocaleString('en-US'); $('#final-level').textContent = state.highestLevel; $('#age-input').value = ''; $('#form-error').textContent = ''; showScreen('gameover'); }
function ageGroup(age) { if (age < 18) return 'Under 18'; if (age <= 25) return '18–25'; if (age <= 40) return '26–40'; if (age <= 60) return '41–60'; return 'Over 60'; }
function localScores() { try { return JSON.parse(localStorage.getItem('recallArcadeScores')) || []; } catch { return []; } }
function cacheLocalScore(record) { const scores = localScores(); scores.push(record); localStorage.setItem('recallArcadeScores', JSON.stringify(scores)); }
async function getScores() {
  try {
    const response = await fetch(`${SCORE_ENDPOINT}?select=score,age,age_group,level,created_at&order=score.desc&limit=500`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!response.ok) throw new Error(`Leaderboard request failed: ${response.status}`);
    return (await response.json()).map(item => ({ score: item.score, age: item.age, group: item.age_group, level: item.level, date: item.created_at }));
  } catch (error) {
    console.warn('Using this device’s saved scores.', error);
    return localScores();
  }
}
async function saveScore(record) {
  try {
    const response = await fetch(SCORE_ENDPOINT, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ score: record.score, age: record.age, age_group: record.group, level: record.level }) });
    if (!response.ok) throw new Error(`Score submission failed: ${response.status}`);
    return true;
  } catch (error) {
    console.warn('Saving score on this device only.', error);
    cacheLocalScore(record);
    showToast('SAVED ON THIS DEVICE');
    return false;
  }
}
async function renderScores(group = state.selectedGroup) {
  state.selectedGroup = group;
  document.querySelectorAll('.group-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.group === group));
  $('#scores-body').innerHTML = '';
  $('#empty-state').textContent = 'Loading scores…';
  $('#empty-state').style.display = 'block';
  const scores = (await getScores()).filter(item => item.group === group).sort((a, b) => b.score - a.score);
  $('#empty-state').textContent = 'No scores here yet. Be the first.';
  $('#empty-state').style.display = scores.length ? 'none' : 'block';
  scores.slice(0, 50).forEach((item, index) => { const row = document.createElement('tr'); row.innerHTML = `<td>${String(index + 1).padStart(2, '0')}</td><td>${item.score.toLocaleString('en-US')}</td><td>${item.level}</td><td>${item.age}</td><td>${new Date(item.date).toLocaleDateString()}</td>`; $('#scores-body').appendChild(row); });
}
async function submitScore(event) {
  event.preventDefault();
  const age = Number($('#age-input').value);
  if (!Number.isInteger(age) || age < 1 || age > 120) { $('#form-error').textContent = 'Enter a whole number between 1 and 120.'; return; }
  const group = ageGroup(age);
  const prior = (await getScores()).filter(item => item.group === group);
  const lower = prior.filter(item => item.score < state.score).length;
  const percentile = prior.length ? Math.round((lower / prior.length) * 100) : 0;
  await saveScore({ score: state.score, age, group, level: state.highestLevel, date: new Date().toISOString() });
  $('#result-group').textContent = group; $('#result-score').textContent = state.score.toLocaleString('en-US'); $('#result-percentile').textContent = `${percentile}th`; $('#result-copy').textContent = `You scored higher than ${percentile}% of players in your age group.`; $('#result-count').textContent = `Based on ${prior.length + 1} submitted score${prior.length === 0 ? '' : 's'} in your age group.`; state.selectedGroup = group; showScreen('submitted');
}
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1000); }
function startGame() { state.level = 1; state.score = 0; state.lives = 3; state.highestLevel = 1; startRound(); }

document.addEventListener('click', (event) => { const navigation = event.target.closest('[data-screen]'); if (navigation) { clearInterval(state.timer); showScreen(navigation.dataset.screen); } });
$('#start-button').addEventListener('click', startGame); $('#score-form').addEventListener('submit', submitScore); $('#play-again-button').addEventListener('click', startGame); $('#leaderboard-button').addEventListener('click', () => showScreen('scores')); $('#sound-toggle').addEventListener('click', () => { state.sound = !state.sound; $('#sound-icon').textContent = state.sound ? '◖' : '—'; $('#sound-toggle').setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on'); });
document.querySelectorAll('.group-tab').forEach(tab => tab.addEventListener('click', () => renderScores(tab.dataset.group)));
updateHud();
