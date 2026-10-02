const files = window.FLORAL_IMAGES || [];

const CATEGORY_NAMES = {
  Chamelaucium: 'Chamelaucium',
  ChrysanthemumBloom: 'Chrysanthemum Bloom',
  Ecuador: 'Ecuador Roses',
  Gypsophilla: 'Gypsophila',
  Hydrangea: 'Hydrangea',
  Hypericum: 'Hypericum',
  Lisianthus: 'Lisianthus',
  Oriental: 'Oriental Lilies',
  Roses: 'Roses',
  Santini: 'Santini',
  Spray: 'Spray Roses'
};

const COLOUR_PATTERNS = [
  ['Light Blue', /\blight blue\b/i],
  ['Bordeaux', /\bbordeaux\b/i],
  ['Cerise', /\bcerise\b/i],
  ['Coral', /\bcoral\b/i],
  ['Cream', /\bcream(?:y)?\b/i],
  ['Ivory', /\bivory\b/i],
  ['Lavender', /\blavender\b/i],
  ['Milka', /\bmilka\b/i],
  ['Orange', /\borange\b/i],
  ['Peach', /\bpeach\b/i],
  ['Pink', /\bpink\b/i],
  ['Purple', /\bpurple\b/i],
  ['Rainbow', /\brainbow\b/i],
  ['Red', /\bred\b/i],
  ['Salmon', /\bsalmon\b/i],
  ['Blue', /\bblue\b/i],
  ['White', /\bwhite\b/i],
  ['Yellow', /\byellow\b/i]
];

const state = { type: '', colour: '' };
let visibleFlowers = [];
let lightboxIndex = 0;

const typeFilters = document.querySelector('#typeFilters');
const colourFilters = document.querySelector('#colourFilters');
const photoGrid = document.querySelector('#photoGrid');
const resultCount = document.querySelector('#resultCount');
const activeFilters = document.querySelector('#activeFilters');
const clearFilters = document.querySelector('#clearFilters');
const emptyState = document.querySelector('#emptyState');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');

function cleanFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/_result$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function flowerFromFilename(filename) {
  const clean = cleanFilename(filename);
  const rawType = clean.split(' ')[0];
  const colours = COLOUR_PATTERNS
    .filter(([, pattern]) => pattern.test(clean))
    .map(([name]) => name)
    .filter((name, index, list) => name !== 'Blue' || !list.includes('Light Blue'));
  return {
    filename,
    src: `images/${encodeURIComponent(filename).replace(/%2F/g, '/')}`,
    title: clean,
    type: CATEGORY_NAMES[rawType] || rawType,
    colours
  };
}

const flowers = files.map(flowerFromFilename).sort((a, b) => a.title.localeCompare(b.title));

function tally(values) {
  return values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
}

function makeFilterButton(name, count, key) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.value = name;
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `${name}<small>${count}</small>`;
  button.addEventListener('click', () => {
    state[key] = state[key] === name ? '' : name;
    render();
  });
  return button;
}

function buildFilters() {
  const types = tally(flowers.map(flower => flower.type));
  const colours = tally(flowers.flatMap(flower => flower.colours));
  [...types].sort(([a], [b]) => a.localeCompare(b)).forEach(([name, count]) => {
    typeFilters.append(makeFilterButton(name, count, 'type'));
  });
  [...colours].sort(([a], [b]) => a.localeCompare(b)).forEach(([name, count]) => {
    colourFilters.append(makeFilterButton(name, count, 'colour'));
  });
}

function updateFilterControls() {
  document.querySelectorAll('#typeFilters button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.value === state.type));
  });
  document.querySelectorAll('#colourFilters button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.value === state.colour));
  });
  clearFilters.hidden = !state.type && !state.colour;
  activeFilters.replaceChildren();
  if (!state.type && !state.colour) {
    activeFilters.textContent = 'Showing the complete collection';
    return;
  }
  activeFilters.append('Selected:');
  [state.type, state.colour].filter(Boolean).forEach(value => {
    const tag = document.createElement('span');
    tag.textContent = value;
    activeFilters.append(tag);
  });
}

function renderCard(flower, index) {
  const figure = document.createElement('figure');
  figure.className = 'photo-card';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Open ${flower.title}`);
  const image = document.createElement('img');
  image.src = flower.src;
  image.alt = flower.title;
  image.loading = 'lazy';
  image.decoding = 'async';
  button.append(image);
  button.addEventListener('click', () => openLightbox(index));
  const caption = document.createElement('figcaption');
  const title = document.createElement('h3');
  title.textContent = flower.title;
  const tags = document.createElement('div');
  tags.className = 'card-tags';
  [flower.type, ...flower.colours].forEach(value => {
    const tag = document.createElement('span');
    tag.textContent = value;
    tags.append(tag);
  });
  caption.append(title, tags);
  figure.append(button, caption);
  return figure;
}

function render() {
  visibleFlowers = flowers.filter(flower => {
    const typeMatch = !state.type || flower.type === state.type;
    const colourMatch = !state.colour || flower.colours.includes(state.colour);
    return typeMatch && colourMatch;
  });
  updateFilterControls();
  resultCount.textContent = `${visibleFlowers.length} of ${flowers.length} specimens`;
  photoGrid.replaceChildren(...visibleFlowers.map(renderCard));
  emptyState.hidden = visibleFlowers.length > 0;
  photoGrid.hidden = visibleFlowers.length === 0;
}

function openLightbox(index) {
  lightboxIndex = index;
  const flower = visibleFlowers[index];
  if (!flower) return;
  lightboxImage.src = flower.src;
  lightboxImage.alt = flower.title;
  lightboxCaption.textContent = `${flower.title} · ${flower.type}${flower.colours.length ? ` · ${flower.colours.join(', ')}` : ''}`;
  if (!lightbox.open) lightbox.showModal();
}

function changePhoto(direction) {
  if (!visibleFlowers.length) return;
  openLightbox((lightboxIndex + direction + visibleFlowers.length) % visibleFlowers.length);
}

clearFilters.addEventListener('click', () => { state.type = ''; state.colour = ''; render(); });
document.querySelector('#closeLightbox').addEventListener('click', () => lightbox.close());
document.querySelector('#previousPhoto').addEventListener('click', () => changePhoto(-1));
document.querySelector('#nextPhoto').addEventListener('click', () => changePhoto(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', event => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') changePhoto(-1);
  if (event.key === 'ArrowRight') changePhoto(1);
});

buildFilters();
render();
