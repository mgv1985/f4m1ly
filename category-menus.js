(() => {
  const script = document.currentScript;
  const root = new URL('.', script.src);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('category-menus.css?v=1', root).href;
  document.head.append(style);

  const categories = {
    games: {
      label: 'Games',
      links: [['The Pool of Memory','The Pool of Memory/index.html?v=3'],['Pool of Memory 2','pool-of-memory-2/index.html'],['Gridline Sudoku','sudoku game/index.html?v=13'],['Counting','counting/index.html'],['RPG Tabletop','rpg/index.html'],['Adventure Chronicles','adventure-chronicles/index.html']]
    },
    family: {
      label: 'Family',
      links: [['Family Archive','archive.html?v=3'],['Shoes Cabinet','webshop/index.html'],['Schedule','schedule/index.html'],['Diet','diet/index.html']]
    },
    'read-learn': {
      label: 'Read & Learn',
      links: [['History Lessons','history/index.html']]
    },
    'tools-work': {
      label: 'Tools and Work',
      links: [['Timer','timer.html?v=6'],['Post it','post-it/index.html'],['Floral Gallery','floral-gallery/index.html'],['Text to Speech','tts.html']]
    }
  };

  const categoryAnchors = [...document.querySelectorAll('header a, header nav a, .topbar a, .header-actions a')]
    .filter((anchor) => categories[anchor.hash.slice(1)]);
  const dropdowns = [];

  categoryAnchors.forEach((anchor) => {
    const category = categories[anchor.hash.slice(1)];
    const dropdown = document.createElement('details');
    dropdown.className = 'category-dropdown';
    const bracketed = anchor.textContent.trim().startsWith('[');
    const summaryLabel = bracketed ? `[${category.label.toUpperCase()}]` : category.label;
    dropdown.innerHTML = `<summary>${summaryLabel}<span aria-hidden="true">＋</span></summary><div class="category-dropdown-panel"><p>${category.label}</p>${category.links.map(([label,path])=>`<a href="${new URL(path,root).href}">${label}<span aria-hidden="true">→</span></a>`).join('')}</div>`;

    const header = anchor.closest('header') || anchor.parentElement;
    const headerStyle = getComputedStyle(header);
    const foreground = getComputedStyle(anchor).color || headerStyle.color;
    const transparent = headerStyle.backgroundColor === 'rgba(0, 0, 0, 0)';
    dropdown.style.setProperty('--category-menu-fg', foreground);
    dropdown.style.setProperty('--category-menu-bg', transparent && foreground.includes('255') ? '#1c1210' : (transparent ? '#f3ead8' : headerStyle.backgroundColor));
    anchor.replaceWith(dropdown);
    dropdowns.push(dropdown);
  });

  dropdowns.forEach((dropdown) => dropdown.addEventListener('toggle', () => {
    if (dropdown.open) dropdowns.forEach((other) => { if (other !== dropdown) other.open = false; });
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.category-dropdown')) dropdowns.forEach((dropdown) => { dropdown.open = false; });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dropdowns.forEach((dropdown) => { dropdown.open = false; });
  });
})();
