const SIZE = 9;
const DIFFICULTIES = { Easy: { clues: 43, multiplier: 1 }, Medium: { clues: 35, multiplier: 1.5 }, Hard: { clues: 29, multiplier: 2 } };

const state = {
  difficulty: 'Medium', puzzle: [], values: [], notes: [], errors: new Set(), selected: 0,
  mode: 'answer', status: 'playing', startedAt: 0, elapsed: 0, timerId: null, score: null, submitted: false, gameId: ''
};


function formatTime(seconds) { const hours = Math.floor(seconds / 3600); const mins = Math.floor((seconds % 3600) / 60); const secs = seconds % 60; return hours ? [hours, mins, secs].map(value => String(value).padStart(2, '0')).join(':') : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
function calculateScore(seconds, difficulty) { return Math.max(0, Math.round((10000 - seconds) * DIFFICULTIES[difficulty].multiplier)); }
function cloneNotes() { return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => new Set())); }
function flatIndex(row, col) { return row * SIZE + col; }
function selectedCell() { return [Math.floor(state.selected / SIZE), state.selected % SIZE]; }
function isGiven(index) { const [row, col] = [Math.floor(index / 9), index % 9]; return Boolean(state.puzzle[row][col]); }


let nextDifficulty='Medium',busy=false;
const rows=a=>Array.from({length:9},(_,r)=>a.slice(r*9,r*9+9));
async function api(path,body){const response=await fetch('/api/'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error);return data;}
function persist(){sessionStorage.setItem('gridline-game',JSON.stringify({...state,errors:[...state.errors],notes:state.notes.map(r=>r.map(s=>[...s])),timerId:null}));}
function applyGame(g){Object.assign(state,{gameId:g.gameId,difficulty:g.difficulty,status:g.status,elapsed:g.elapsed,score:g.score,submitted:g.submitted,startedAt:Date.now()-g.elapsed*1000});if(g.values)state.values=rows(g.values);persist();}
function startTimer(){clearInterval(state.timerId);state.timerId=setInterval(()=>{if(state.status==='playing'){state.elapsed=Math.floor((Date.now()-state.startedAt)/1000);updateTimer();}},250);}
async function startGame(difficulty=nextDifficulty,confirmDiscard=true){
 if(busy)return;
 const dirty=state.values.some((r,i)=>r.some((n,j)=>n!==state.puzzle[i][j]))||state.notes.some(r=>r.some(s=>s.size));
 if(confirmDiscard&&state.status==='playing'&&dirty&&!await confirmAction('Start a new game and discard your current progress?','New Game'))return;
 busy=true;setMessage('Creating your unique puzzle…');
 try{const g=await api('games',{difficulty});state.puzzle=rows(g.puzzle);state.values=rows(g.puzzle);state.notes=cloneNotes();state.errors=new Set();state.selected=g.puzzle.indexOf(0);state.mode='answer';applyGame(g);startTimer();if(location.hash!=='#high-scores')renderGame();}catch(e){setMessage(e.message,'error-message');}finally{busy=false;}
}
function confirmAction(message,label){return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.innerHTML='<h2>A moment before you go</h2><p></p><div class="dialog-actions"><button class="button" data-cancel>Cancel</button><button class="button primary" data-confirm></button></div>';dialog.querySelector('p').textContent=message;dialog.querySelector('[data-confirm]').textContent=label;const finish=v=>{dialog.close();dialog.remove();resolve(v);};dialog.querySelector('[data-cancel]').onclick=()=>finish(false);dialog.querySelector('[data-confirm]').onclick=()=>finish(true);dialog.oncancel=e=>{e.preventDefault();finish(false);};document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-cancel]').focus();});}

function updateTimer() { const timer = document.querySelector('[data-timer]'); if (timer) timer.textContent = formatTime(state.elapsed); }
function setCellNumber(number) {
  if (busy || state.status !== 'playing' || isGiven(state.selected)) return;
  const [row, col] = selectedCell();
  if (state.mode === 'notes') { state.notes[row][col].has(number) ? state.notes[row][col].delete(number) : state.notes[row][col].add(number); state.values[row][col] = 0; }
  else { state.values[row][col] = number; state.notes[row][col].clear(); state.errors.delete(state.selected); }
  state.errors.delete(state.selected); persist(); renderBoard();
}
function eraseCell() { if (busy || state.status !== 'playing' || isGiven(state.selected)) return; const [row, col] = selectedCell(); state.values[row][col] = 0; state.notes[row][col].clear(); state.errors.delete(state.selected); persist(); renderBoard(); }
async function eraseAll() { if (busy || state.status !== 'playing') return; const changed = state.values.some((row, rowIndex) => row.some((value, colIndex) => value !== state.puzzle[rowIndex][colIndex])) || state.notes.some(row => row.some(notes => notes.size)); if (!changed) return; if (!await confirmAction('Erase all of your answers and notes from this puzzle?', 'Erase All')) return; state.values = state.puzzle.map(row => [...row]); state.notes = cloneNotes(); state.errors.clear(); persist(); renderBoard(); }
function moveSelection(deltaRow, deltaCol) { const [row, col] = selectedCell(); state.selected = flatIndex((row + deltaRow + 9) % 9, (col + deltaCol + 9) % 9); renderBoard(); document.querySelector(`[data-cell="${state.selected}"]`)?.focus(); }

async function checkSolved(){if(state.status!=='playing'||busy)return;busy=true;try{const result=await api('games/'+state.gameId+'/check',{values:state.values.flat()});state.errors=new Set(result.errors);applyGame(result);renderGame();if(state.status!=='solved')setMessage(result.complete?'There are some mistakes. The incorrect cells have been marked in red.':'The Sudoku is not complete yet.','error-message');}catch(e){setMessage(e.message,'error-message');}finally{busy=false;}}
async function revealSolution(){if(state.status!=='playing'||busy)return;if(!await confirmAction('Are you sure? Showing the solution will end this game and you will not be able to submit a score.','Show Solution'))return;busy=true;try{const g=await api('games/'+state.gameId+'/reveal',{});state.notes=cloneNotes();state.errors=new Set();applyGame(g);renderGame();}catch(e){setMessage(e.message,'error-message');}finally{busy=false;}}

function setMessage(text, kind = '') { const message = document.querySelector('[data-message]'); if (message) { message.textContent = text; message.className = `message ${kind}`; } }
function printDocument(values) {
  const lines = Array.from({length:10},(_,i)=>{
    const p=2+i*100, width=i%3===0?3:1;
    return `<path d="M ${p} 2 V 902 M 2 ${p} H 902" stroke="black" stroke-width="${width}" fill="none"/>`;
  }).join('');
  const numbers = values.map((n,i)=>n?`<text x="${52+i%9*100}" y="${52+Math.floor(i/9)*100}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="44" fill="black">${n}</text>`:'').join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title></title><style>@page{size:auto;margin:0}*{box-sizing:border-box}html,body{margin:0;background:white}body{padding:8mm}svg{display:block;width:100%;height:auto;break-inside:avoid}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 904 904">${lines}${numbers}</svg></body></html>`;
}
async function printSudoku(kind) {
  if(busy)return;
  busy=true;
  try {
    if(state.status!=='printed'&&!await confirmAction('Printing stops the timer and permanently removes this game from high-score eligibility, including any submitted score. This applies even if you cancel the print dialog.','Continue to print'))return;
    const g=await api('games/'+state.gameId+'/print',{kind});
    clearInterval(state.timerId);applyGame(g);renderGame();
    document.querySelector('[data-print-preview]')?.remove();
    const preview=document.createElement('dialog');preview.dataset.printPreview='';
    preview.innerHTML='<div class="print-toolbar"><strong>Ready to print</strong><button class="button" data-close-print>Close</button><button class="button primary" data-open-print>Print</button></div><p>Choose portrait A4 or Letter. Turn off headers and footers if your browser adds them.</p><div class="print-sheet"></div>';
    const sheet=preview.querySelector('.print-sheet');
    sheet.innerHTML=printDocument(g.printValues).match(/<svg[\s\S]*<\/svg>/)[0];
    preview.querySelector('[data-close-print]').onclick=()=>{preview.close();preview.remove();};
    preview.querySelector('[data-open-print]').onclick=()=>window.print();
    document.body.append(preview);preview.showModal();
  }catch(e){setMessage(e.message,'error-message');}finally{busy=false;}
}
function findDuplicateConflicts() {
  const cells = new Set(), rows = new Set(), columns = new Set(), boxes = new Set();
  for (let row = 0; row < SIZE; row++) {
    for (let number = 1; number <= SIZE; number++) {
      const matches = [];
      for (let col = 0; col < SIZE; col++) if (state.values[row][col] === number) matches.push(flatIndex(row, col));
      if (matches.length > 1) { rows.add(row); matches.forEach(index => cells.add(index)); }
    }
  }
  for (let col = 0; col < SIZE; col++) {
    for (let number = 1; number <= SIZE; number++) {
      const matches = [];
      for (let row = 0; row < SIZE; row++) if (state.values[row][col] === number) matches.push(flatIndex(row, col));
      if (matches.length > 1) { columns.add(col); matches.forEach(index => cells.add(index)); }
    }
  }
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = boxRow * 3 + boxCol;
      for (let number = 1; number <= SIZE; number++) {
        const matches = [];
        for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
          for (let colOffset = 0; colOffset < 3; colOffset++) {
            const row = boxRow * 3 + rowOffset, col = boxCol * 3 + colOffset;
            if (state.values[row][col] === number) matches.push(flatIndex(row, col));
          }
        }
        if (matches.length > 1) { boxes.add(box); matches.forEach(index => cells.add(index)); }
      }
    }
  }
  return { cells, rows, columns, boxes };
}
function renderBoard() {
  const board = document.querySelector('[data-board]'); if (!board) return; board.innerHTML = '';
  const counts = Array(10).fill(0);
  state.values.flat().forEach(value => { if (value) counts[value]++; });
  document.querySelectorAll('[data-number]').forEach(button => {
    const number = Number(button.dataset.number);
    const complete = counts[number] === 9;
    button.classList.toggle('all-placed', complete);
    button.setAttribute('aria-label', `Enter ${number}, ${counts[number]} of 9 placed`);
    button.title = complete ? `All nine ${number}s placed` : `${counts[number]} of 9 placed`;
  });
  const [selectedRow, selectedCol] = selectedCell(); const selectedValue = state.values[selectedRow][selectedCol]; const conflicts = findDuplicateConflicts();
  for (let index = 0; index < 81; index++) {
    const row = Math.floor(index / 9); const col = index % 9; const button = document.createElement('button'); button.className = 'cell'; button.dataset.cell = index; button.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`); button.tabIndex = index === state.selected ? 0 : -1;
    const given = Boolean(state.puzzle[row][col]); if (given) button.classList.add('given'); if (index === state.selected) button.classList.add('selected'); if (row === selectedRow || col === selectedCol) button.classList.add('related'); if (selectedValue && state.values[row][col] === selectedValue) button.classList.add('same-number'); if (conflicts.rows.has(row) || conflicts.columns.has(col) || conflicts.boxes.has(Math.floor(row / 3) * 3 + Math.floor(col / 3))) button.classList.add('conflict-line'); if (conflicts.cells.has(index)) button.classList.add('conflict-number'); if (state.errors.has(index)) button.classList.add('error'); if (state.status === 'solution_revealed' && !given) button.classList.add('revealed');
    if (state.values[row][col]) button.append(String(state.values[row][col])); else if (state.notes[row][col].size) { const notes = document.createElement('span'); notes.className = 'notes'; [...state.notes[row][col]].sort((a,b) => a-b).forEach(number => { const note = document.createElement('span'); note.textContent = number; note.style.gridColumn = number % 3 || 3; note.style.gridRow = Math.ceil(number / 3); notes.append(note); }); button.append(notes); }
    button.setAttribute('aria-label',button.getAttribute('aria-label')+(state.values[row][col]?', '+state.values[row][col]:', empty')+(given?', fixed clue':'')); button.addEventListener('click', () => { state.selected = index; renderBoard(); document.querySelector('[data-cell="'+index+'"]').focus(); }); board.append(button);
  }
}
function renderGame() {
  document.querySelectorAll('[data-route-link]').forEach(link => link.setAttribute('aria-current', link.dataset.routeLink === 'game' ? 'page' : 'false'));
  document.getElementById('app').innerHTML = `<div class="game-layout"><section><div class="eyebrow">Daily pattern practice / ${state.difficulty}</div><h1>Find the calm<br>inside the <em>grid.</em></h1><p class="intro">A focused Sudoku board for solving slowly, cleanly, and on your own terms.</p><div class="game-top"><div><div class="timer-label">Solve time</div><div class="timer" data-timer>${formatTime(state.elapsed)}</div></div><div class="badge">${state.status === 'playing' ? 'In progress' : state.status === 'solved' ? 'Complete' : state.status === 'printed' ? 'Printed / unranked' : 'Solution shown'}</div></div><div class="board-wrap"><div class="board" data-board role="grid" aria-label="Sudoku board"></div></div><div class="controls"><div class="number-pad">${[1,2,3,4,5,6,7,8,9].map(number => `<button type="button" data-number="${number}" aria-label="Enter ${number}">${number}</button>`).join('')}</div><div class="tool-row"><button aria-pressed="${state.mode === 'notes'}" class="tool ${state.mode === 'notes' ? 'active' : ''}" data-mode type="button">Notes: ${state.mode === "notes" ? "on" : "off"}</button><button class="tool" data-erase type="button">Erase</button><button class="tool erase-all" data-erase-all type="button">Erase All</button></div></div><div class="message" role="status" aria-live="polite" data-message></div>${state.status === 'solved' && !state.submitted ? `<dialog class="score-dialog" data-score-dialog><div class="score-box"><p class="score-congratulations">Congratulations! You solved the Sudoku in ${formatTime(state.elapsed)}.</p><span class="eyebrow">Puzzle complete / ${state.difficulty}</span><strong>${state.score.toLocaleString()} pts</strong><div class="score-form"><input data-name maxlength="20" placeholder="Your nickname" aria-label="Your nickname"><button class="button primary" data-submit type="button">Submit Score</button></div><p class="score-error" data-score-error role="alert"></p></div></dialog>` : ''}</section><aside class="side-panel"><h2>Set the conditions.</h2><p>Choose a difficulty, mark possibilities with pencil notes, and commit when the pattern clicks.</p><div class="difficulty">${Object.keys(DIFFICULTIES).map(level => `<button type="button" data-difficulty="${level}" class="${nextDifficulty === level ? 'active' : ''}">${level}</button>`).join('')}</div><div class="side-actions"><button class="button" data-new type="button">New Game <span aria-hidden="true">&nearr;</span></button><button class="button primary" data-solved type="button" ${state.status !== 'playing' ? 'disabled' : ''}>Check the answer</button><button class="button secondary" data-reveal type="button" ${state.status !== 'playing' ? 'disabled' : ''}>Show me the solution</button><button class="button secondary" data-print-puzzle type="button">Print that sudoku</button><button class="button secondary" data-print-solution type="button">Print the solution</button></div><div class="help-card"><h3>A little room to think.</h3><p>Select a cell, then enter an answer. Turn on Notes to keep several possibilities in its place.</p><p><kbd>1–9</kbd> enter &nbsp; <kbd>N</kbd> notes<br><kbd>↑ ↓ ← →</kbd> move &nbsp; <kbd>Delete</kbd> erase</p><h3>Every second counts.</h3><p>Score = (10,000 − seconds) × difficulty, rounded and never below zero.<br>Easy ×1 · Medium ×1.5 · Hard ×2</p><p>Your answers are checked only when you press <strong>Check the answer</strong>.</p></div></aside></div>`;
  renderBoard(); bindGameEvents(); if(state.status==='printed')setMessage('Timer stopped. This printed game is not eligible for high scores. Start a new game to play again.'); if(state.status==='solved')setMessage('Congratulations! You solved the Sudoku in '+formatTime(state.elapsed)+'.'+(state.submitted?' Score submitted.':''),'success');if(state.status==='solution_revealed')setMessage('Solution revealed. Start a new game when you’re ready to try another Sudoku.');const scoreDialog=document.querySelector('[data-score-dialog]');if(scoreDialog){scoreDialog.addEventListener('cancel',event=>event.preventDefault());scoreDialog.showModal();document.querySelector('[data-name]')?.focus();}const submit=document.querySelector('[data-submit]');if(submit)submit.disabled=state.submitted;
}
function bindGameEvents() { document.querySelector('[data-print-puzzle]').addEventListener('click',()=>printSudoku('puzzle')); document.querySelector('[data-print-solution]').addEventListener('click',()=>printSudoku('solution')); document.querySelectorAll('[data-number]').forEach(button => button.addEventListener('click', () => setCellNumber(Number(button.dataset.number)))); document.querySelector('[data-mode]').addEventListener('click', () => { state.mode = state.mode === 'notes' ? 'answer' : 'notes'; renderGame(); }); document.querySelector('[data-erase]').addEventListener('click', eraseCell); document.querySelector('[data-erase-all]').addEventListener('click', eraseAll); document.querySelector('[data-new]').addEventListener('click', () => startGame(nextDifficulty)); document.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => { nextDifficulty = button.dataset.difficulty; renderGame(); })); document.querySelector('[data-solved]').addEventListener('click', checkSolved); document.querySelector('[data-reveal]').addEventListener('click', revealSolution);  const submit = document.querySelector('[data-submit]'); if (submit) submit.addEventListener('click', submitScore); }
function handleKeyboard(event) { const number = Number(event.key); if (number >= 1 && number <= 9) { setCellNumber(number); return; } if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') { eraseCell(); return; } const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }; if (moves[event.key]) { event.preventDefault(); moveSelection(...moves[event.key]); } }

async function submitScore(){if(state.status!=='solved'||state.submitted||busy)return;const input=document.querySelector('[data-name]'),error=document.querySelector('[data-score-error]');if(!input.value.trim()){if(error)error.textContent='Please enter a nickname.';input.focus();return;}busy=true;const button=document.querySelector('[data-submit]');if(button){button.disabled=true;button.textContent='Submitting…';}try{applyGame(await api('games/'+state.gameId+'/score',{name:input.value.trim()}));const box=document.querySelector('[data-score-dialog] .score-box');if(box)box.innerHTML='<div class="score-success"><span class="success-mark">✓</span><h2>Score submitted</h2><p>Taking you to the high scores…</p></div>';setTimeout(()=>{location.hash='high-scores';},1500);}catch(e){if(error)error.textContent=e.message;if(button){button.disabled=false;button.textContent='Submit Score';}}finally{busy=false;}}

async function renderScores(filter = 'All') { document.querySelectorAll('[data-route-link]').forEach(link => link.setAttribute('aria-current', link.dataset.routeLink === 'scores' ? 'page' : 'false')); let all;try{all=await api('scores');}catch(e){document.getElementById('app').textContent=e.message;return;}if(location.hash!=='#high-scores')return;const scores=all.filter(item=>filter==='All'||item.difficulty===filter).slice(0,100); document.getElementById('app').innerHTML = `<div class="page-heading"><div class="eyebrow">The archive / top 100</div><h1>High <em>Scores.</em></h1><p class="intro">A record of clean solves, quick patterns, and patient thinking.</p><button class="button primary scores-new-game" data-score-new type="button">New Game <span aria-hidden="true">&nearr;</span></button></div><div class="filter-row">${['All', ...Object.keys(DIFFICULTIES)].map(level => `<button class="difficulty ${filter === level ? 'active' : ''}" data-filter="${level}">${level === 'All' ? 'Overall' : level}</button>`).join('')}</div><div class="leaderboard">${scores.length ? `<table class="score-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Time</th><th>Difficulty</th><th>Date</th></tr></thead><tbody>${scores.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.name)}</strong></td><td>${item.score.toLocaleString()}</td><td>${formatTime(item.time)}</td><td>${item.difficulty}</td><td>${new Date(item.date).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No scores yet. Your first clean solve belongs here.</div>'}</div>`; document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => renderScores(button.dataset.filter))); document.querySelector('[data-score-new]')?.addEventListener('click',()=>{location.hash='play';startGame(nextDifficulty,false);}); }
function escapeHtml(text) { return text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }

function route(){if(location.hash==='#high-scores')renderScores();else if(state.puzzle.length)renderGame();else{document.getElementById('app').innerHTML='<p role="status" class="message" data-message>Creating your unique puzzle…</p>';startGame(nextDifficulty,false);}}
window.addEventListener('hashchange',route);
document.addEventListener('click',event=>{const link=event.target.closest('[data-route-link]');if(link&&!event.ctrlKey&&!event.metaKey){event.preventDefault();location.hash=link.dataset.routeLink==='scores'?'high-scores':'play';route();}});
document.addEventListener('keydown',event=>{if(location.hash==='#high-scores'||!state.puzzle.length||document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||event.ctrlKey||event.metaKey||event.altKey)return;if(/^[1-9]$/.test(event.key)||['Backspace','Delete','0','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();handleKeyboard(event);}if(event.key.toLowerCase()==='n'){state.mode=state.mode==='notes'?'answer':'notes';renderGame();}});
async function init(){try{const saved=JSON.parse(sessionStorage.getItem('gridline-game'));if(saved){const g=await api('games/'+saved.gameId);Object.assign(state,saved);state.notes=saved.notes.map(r=>r.map(a=>new Set(a)));state.errors=new Set(saved.errors);applyGame(g);nextDifficulty=g.difficulty;startTimer();}}catch{sessionStorage.removeItem('gridline-game');}route();}init();




