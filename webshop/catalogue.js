const shoes = [
  ...[
    'Black Chunky Leather Loafers','Black Chunky Platform Ankle Boots','Black Leather Ankle Boots Product Shot','Black Leather Ankle Cowboy Boots','Black Suede Gold-Button Peep-Toe Bootie','Black Suede Knee-High Boot Pair','Brown Leather Buckled Slingback Heels','Brown Leather Mid-Calf Boots','Crisscross Neutral Heeled Sandals','Dark Brown Leather Wedge Ankle Boots','Glossy Black Patent Leather Loafers','Navy Suede Nine West Pumps','Plum Trail Shoes with Coral Outsoles','Rose Gold Woven-Texture Heeled Sandals','Silver Diamantique Block-Heel Pumps','Taupe Suede Chelsea Boots','White Gianna Kazakou Pumps','Worn Multicolour Adidas Running Shoes'
  ].map(title => ({ title, tag:'Anastasia', folder:'Anastasia Shoes' })),
  ...[
    'Black Knit Espadrille Slip-Ons','Black Rugged Hiking Boots Pair','Black Suede Chukka Boots Pair','Brown Suede Derby Shoes on White','Dark Navy GORE-TEX Chukka Boots','Grey Canvas Deck Shoes','Navy Knit Sneakers on White'
  ].map(title => ({ title, tag:'Gabriel', folder:'Gabriel Shoes' })),
  ...[
    'Children’s Navy Snow Boots','Navy Quilted Snow Boots with Green Treads'
  ].map(title => ({ title, tag:'Kids', folder:'Kids  Shoes' }))
].map(shoe => ({
  ...shoe,
  productImage:`Shoes Cabinet Ready/${shoe.folder}/${shoe.title} (1).jpg`,
  locationImage:`Shoes Cabinet Ready/${shoe.folder}/${shoe.title} (2).jpg`
}));

const grid = document.querySelector('#productGrid');
const count = document.querySelector('#itemCount');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const dialog = document.querySelector('#locationDialog');
const locationImage = document.querySelector('#locationImage');
const dialogTitle = document.querySelector('#dialogTitle');
let activeFilter = 'All';

function openLocation(shoe){
  locationImage.src = shoe.locationImage;
  locationImage.alt = `Storage location for ${shoe.title}`;
  dialogTitle.textContent = shoe.title;
  dialog.showModal();
}

function render(){
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visible = shoes.filter(shoe =>
    (activeFilter === 'All' || shoe.tag === activeFilter) &&
    shoe.title.toLocaleLowerCase().includes(query)
  );
  grid.replaceChildren(...visible.map(shoe => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'product-card';
    card.setAttribute('aria-label', `${shoe.title}. Show storage location.`);
    card.innerHTML = `<span class="product-image"><img loading="lazy" decoding="async"><span class="view-location">View location</span></span><span class="product-meta"><span class="product-tag"></span><span class="product-title"></span></span>`;
    const image = card.querySelector('img');
    image.src = shoe.productImage;
    image.alt = shoe.title;
    card.querySelector('.product-tag').textContent = shoe.tag;
    card.querySelector('.product-title').textContent = shoe.title;
    card.addEventListener('click', () => openLocation(shoe));
    return card;
  }));
  count.textContent = `${visible.length} ${visible.length === 1 ? 'pair' : 'pairs'}`;
  emptyState.hidden = visible.length !== 0;
}

document.querySelector('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if(!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  render();
});

searchInput.addEventListener('input', render);
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  locationImage.removeAttribute('src');
  locationImage.alt = '';
});
render();
