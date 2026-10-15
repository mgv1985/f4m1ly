/* Keep the original rules, but scatter circular tokens without a visible grid. */
renderBoard = function renderScatteredBoard(numbers) {
  const board = document.querySelector('#board');
  board.innerHTML = '';
  state.tiles = shuffle(numbers).map((number, index) => ({ number, index, revealed: false }));

  const count = state.tiles.length;
  const minimumDistance = Math.max(15, 34 - count * 1.15);
  const positions = [];

  state.tiles.forEach((tile) => {
    let best = null;
    let bestDistance = -1;

    for (let attempt = 0; attempt < 240; attempt += 1) {
      const candidate = { left: 8 + Math.random() * 84, top: 12 + Math.random() * 76 };
      const nearest = positions.length
        ? Math.min(...positions.map((placed) => Math.hypot((candidate.left - placed.left) * 1.65, candidate.top - placed.top)))
        : Infinity;

      if (nearest > bestDistance) {
        best = candidate;
        bestDistance = nearest;
      }
      if (nearest >= minimumDistance) break;
    }

    positions.push(best);
    const button = document.createElement('button');
    button.className = 'tile';
    button.type = 'button';
    button.dataset.index = tile.index;
    button.style.left = `${best.left}%`;
    button.style.top = `${best.top}%`;
    button.setAttribute('aria-label', 'Hidden number token');
    button.innerHTML = `<span class="tile-inner"><span class="tile-face tile-front">${tile.number}</span><span class="tile-face tile-back" aria-hidden="true"></span></span>`;
    button.addEventListener('click', () => selectTile(tile, button));
    board.appendChild(button);
  });
};
