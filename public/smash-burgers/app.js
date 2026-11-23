const dishes = [
  { name: 'La Clásica', price: 19 },
  { name: 'La Criolla', price: 24 },
  { name: 'La Norteña', price: 26 },
  { name: 'Papas fritas', price: 8 },
];

const menu = document.querySelector('#site-nav');
const menuToggle = document.querySelector('.menu-toggle');

menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const formatPrice = (price) => `S/ ${price.toFixed(2).replace('.00', '')}`;
const itemContainer = document.querySelector('#order-items');
const quantities = dishes.map(() => 0);

dishes.forEach((dish, index) => {
  const row = document.createElement('div');
  row.className = 'order-item';
  row.innerHTML = `
    <span class="order-item-name">${dish.name}</span>
    <span class="order-item-price">${formatPrice(dish.price)}</span>
    <span class="quantity">
      <button type="button" aria-label="Quitar una ${dish.name}">−</button>
      <output aria-live="polite">0</output>
      <button type="button" aria-label="Agregar una ${dish.name}">+</button>
    </span>`;
  const [minus, plus] = row.querySelectorAll('button');
  const count = row.querySelector('output');
  const update = (delta) => {
    quantities[index] = Math.max(0, Math.min(9, quantities[index] + delta));
    count.value = String(quantities[index]);
    const total = quantities.reduce((sum, quantity, i) => sum + quantity * dishes[i].price, 0);
    document.querySelector('#order-total').textContent = formatPrice(total);
    document.querySelector('#order-result').textContent = '';
  };
  minus.addEventListener('click', () => update(-1));
  plus.addEventListener('click', () => update(1));
  itemContainer.append(row);
});

document.querySelector('#order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const total = quantities.reduce((sum, quantity, i) => sum + quantity * dishes[i].price, 0);
  const pickup = document.querySelector('#pickup-time').value;
  document.querySelector('#order-result').textContent = total
    ? `Resumen de muestra: ${quantities.reduce((sum, quantity) => sum + quantity, 0)} producto(s), ${formatPrice(total)}. Recojo referencial: ${pickup}. No se envió ningún pedido.`
    : 'Agrega una burger o unas papitas para ver el resumen.';
});

const anatomy = document.querySelector('[data-explode]');
const anatomySection = document.querySelector('#anatomia');
const layerGroups = [
  ['.bun-top', '.label-top'],
  ['.sauce-layer', '.label-sauce'],
  ['.onion-layer', '.label-onion'],
  ['.cheese-layer:not(.cheese-second)', '.label-cheese'],
  ['.patty-layer:not(.patty-second)', '.label-patty'],
  ['.cheese-second', '.label-cheese'],
  ['.patty-second', '.label-patty'],
  ['.pickle-layer', '.label-pickle'],
  ['.bun-bottom', '.label-bottom'],
];
let ticking = false;

function updateAnatomy() {
  const bounds = anatomySection.getBoundingClientRect();
  const travel = Math.max(1, anatomySection.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -bounds.top / travel));
  layerGroups.forEach(([selector], index) => {
    const layer = anatomy.querySelector(selector);
    const spread = (index - 4) * 48 * progress;
    layer.style.setProperty('--lift', `${spread}px`);
  });
  anatomy.querySelectorAll('.layer-label').forEach((label, index) => {
    const center = (index + 1) / 8;
    const opacity = Math.max(0, Math.min(1, 1 - Math.abs(progress - center) * 4.5));
    label.style.opacity = String(opacity);
  });
  ticking = false;
}

function requestAnatomyUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateAnatomy);
    ticking = true;
  }
}

window.addEventListener('scroll', requestAnatomyUpdate, { passive: true });
window.addEventListener('resize', requestAnatomyUpdate);
updateAnatomy();

const status = document.querySelector('#open-status');
const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function updateHours() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const open = dayIndex !== 1 && ((minutes >= 750 && minutes < 930) || (minutes >= 1140 && minutes < 1380));
  status.textContent = open ? 'Abierto ahora · concepto demo' : `Cerrado ahora · ${dayNames[(dayIndex + 1) % 7]} desde las 12:30`;
}

updateHours();
window.setInterval(updateHours, 60_000);
