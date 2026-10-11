(() => {
  const script = document.currentScript;
  const root = new URL('.', script.src);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('site-nav.css?v=2', root).href;
  document.head.append(style);
  const href = (path) => new URL(path, root).href;
  const categories = [
    { name: 'Games', links: [
      ['The Pool of Memory', 'The Pool of Memory/index.html?v=3'], ['Gridline Sudoku', 'sudoku game/index.html?v=13'],
      ['Counting', 'counting/index.html'], ['RPG Tabletop', 'rpg/index.html'], ['Adventure Chronicles', 'adventure-chronicles/index.html']
    ] },
    { name: 'Family', links: [
      ['Family Archive', 'archive.html?v=3'], ['Shoes Cabinet', 'webshop/index.html'], ['Schedule', 'schedule/index.html'], ['Diet', 'diet/index.html']
    ] },
    { name: 'Read & Learn', links: [['History Lessons', 'history/index.html']] },
    { name: 'Tools and Work', links: [
      ['Timer', 'timer.html?v=6'], ['Post it', 'post-it/index.html'], ['Floral Gallery', 'floral-gallery/index.html'], ['Text to Speech', 'tts.html']
    ] }
  ];

  const oldHeader = document.body.querySelector(':scope > header');
  const header = document.createElement('header');
  header.className = 'global-site-nav';
  header.innerHTML = `
    <div class="global-nav-brand">
      <a class="global-nav-archive" href="${href('archive.html?v=3')}" aria-label="Open the Family Archive"><span aria-hidden="true">✦</span></a>
      <a class="global-nav-secret" href="${href('screensaver.html')}" tabindex="-1" aria-hidden="true" title=""></a>
      <a class="global-nav-home" href="${href('index.html')}">F4M1LY</a>
    </div>
    <nav class="global-nav-groups" aria-label="Site categories">
      ${categories.map((category) => `
        <details class="global-nav-group">
          <summary>${category.name}<span aria-hidden="true">＋</span></summary>
          <div class="global-nav-menu">
            <p>${category.name}</p>
            ${category.links.map(([label, path]) => `<a href="${href(path)}">${label}<span aria-hidden="true">→</span></a>`).join('')}
          </div>
        </details>`).join('')}
    </nav>`;
  document.body.prepend(header);
  document.body.classList.add('has-global-site-nav');

  const globalPaths = new Set(['/index.html', '/archive.html', '/timer.html', '/tts.html', '/login.html']);
  ['The Pool of Memory', 'sudoku game', 'counting', 'webshop', 'rpg', 'adventure-chronicles', 'post-it', 'floral-gallery', 'schedule', 'diet', 'history']
    .forEach((folder) => globalPaths.add(`/${folder}/index.html`));
  if (oldHeader) {
    oldHeader.querySelectorAll('nav a, .header-actions a, .explore-menu').forEach((item) => {
      if (item.matches('.explore-menu')) { item.hidden = true; return; }
      const url = new URL(item.href, location.href);
      const path = decodeURI(url.pathname);
      if ([...globalPaths].some((globalPath) => path.endsWith(globalPath))) item.hidden = true;
    });
    oldHeader.querySelectorAll('nav').forEach((nav) => {
      if (![...nav.children].some((item) => !item.hidden)) nav.hidden = true;
    });
  }
  if (document.body.classList.contains('home-page')) oldHeader.hidden = true;

  const groups = [...header.querySelectorAll('.global-nav-group')];
  groups.forEach((group) => group.addEventListener('toggle', () => {
    if (group.open) groups.forEach((other) => { if (other !== group) other.open = false; });
  }));
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) groups.forEach((group) => { group.open = false; });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') groups.forEach((group) => { group.open = false; });
  });
})();
