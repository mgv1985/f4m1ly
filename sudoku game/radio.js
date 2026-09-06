const player = document.querySelector('#radioPlayer');
const button = document.querySelector('#radioToggle');
const icon = document.querySelector('#radioIcon');
const label = document.querySelector('#radioLabel');

function showStopped() { button.setAttribute('aria-pressed', 'false'); icon.textContent = '▶'; label.textContent = 'Far East radio'; }
function showPlaying() { button.setAttribute('aria-pressed', 'true'); icon.textContent = 'Ⅱ'; label.textContent = 'Pause radio'; }
button.addEventListener('click', async () => {
  if (!player.paused) { player.pause(); showStopped(); return; }
  label.textContent = 'Connecting…'; button.disabled = true;
  try { await player.play(); showPlaying(); }
  catch { showStopped(); label.textContent = 'Radio unavailable'; }
  finally { button.disabled = false; }
});
player.addEventListener('playing', showPlaying);
player.addEventListener('pause', showStopped);
player.addEventListener('error', () => { showStopped(); label.textContent = 'Radio unavailable'; });