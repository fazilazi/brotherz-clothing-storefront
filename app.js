const products = [
  {
    id: 'essential-tee',
    name: 'The Essential Tee',
    category: 'T-Shirts',
    price: 799,
    tag: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=82',
    alt: 'Classic everyday cotton t-shirt',
  },
  {
    id: 'street-shirt',
    name: 'Off-Duty Overshirt',
    category: 'Shirts',
    price: 1499,
    tag: 'NEW DROP',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=82',
    alt: 'Relaxed fit casual shirt',
  },
  {
    id: 'graphic-tee',
    name: 'After Hours Tee',
    category: 'T-Shirts',
    price: 899,
    tag: '',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=82',
    alt: 'Modern graphic t-shirt',
  },
  {
    id: 'everyday-shirt',
    name: 'The Everyday Shirt',
    category: 'Shirts',
    price: 1299,
    tag: '',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=82',
    alt: 'Smart casual button-up shirt',
  },
  {
    id: 'relaxed-pants',
    name: 'Relaxed Fit Pants',
    category: 'Bottoms',
    price: 1599,
    tag: 'EASY DAYS',
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=900&q=82',
    alt: 'Relaxed fit everyday trousers',
  },
  {
    id: 'weekend-tee',
    name: 'Weekend Club Tee',
    category: 'T-Shirts',
    price: 849,
    tag: '',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=82',
    alt: 'Weekend casual t-shirt',
  },
];

const primaryPhone = '918903162233';
const cartStorageKey = 'brotherz-cart-v1';
const productGrid = document.querySelector('#product-grid');
const emptyState = document.querySelector('#empty-state');
const cartDrawer = document.querySelector('#cart-drawer');
const drawerBackdrop = document.querySelector('#drawer-backdrop');
const checkoutBackdrop = document.querySelector('#checkout-backdrop');
const checkoutForm = document.querySelector('#checkout-form');
const phoneInput = document.querySelector('#checkout-form input[name="phone"]');
const cartItems = document.querySelector('#cart-items');
const emptyCart = document.querySelector('#empty-cart');
const drawerBottom = document.querySelector('#drawer-bottom');
const toast = document.querySelector('#toast');

let activeCategory = 'All';
let searchQuery = '';
let cart = loadCart();
let toastTimer;

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    if (!Array.isArray(stored)) {
      localStorage.removeItem(cartStorageKey);
      showToast('Your saved bag could not be restored.');
      return [];
    }
    const restoredCart = stored.filter((item) =>
      item &&
      products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 99
    );
    if (restoredCart.length !== stored.length) {
      localStorage.setItem(cartStorageKey, JSON.stringify(restoredCart));
      showToast('Some saved bag items could not be restored.');
    }
    return restoredCart;
  } catch (error) {
    if (error instanceof SyntaxError) {
      localStorage.removeItem(cartStorageKey);
      showToast('Your saved bag data was invalid and has been cleared.');
      return [];
    }
    throw error;
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function renderProducts() {
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy" />
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">ADD TO BAG&nbsp; +</button>
      </div>
      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
        </div>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </article>
  `).join('');
  emptyState.hidden = visibleProducts.length > 0;
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + product.price * item.quantity;
  }, 0);

  document.querySelector('.cart-count').textContent = itemCount;
  document.querySelector('.drawer-count').textContent = `(${itemCount})`;
  document.querySelector('#cart-subtotal').textContent = formatPrice(subtotal);
  document.querySelector('#checkout-subtotal').textContent = formatPrice(subtotal);
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="" />
        <div class="cart-line-info">
          <h3 class="cart-line-name">${product.name}</h3>
          <p class="cart-line-price">${formatPrice(product.price)}</p>
          <div class="quantity-control" aria-label="${product.name} quantity">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from bag">×</button>
      </article>
    `;
  }).join('');

  const isEmpty = cart.length === 0;
  emptyCart.hidden = !isEmpty;
  cartItems.hidden = isEmpty;
  drawerBottom.hidden = isEmpty;
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    if (existing.quantity >= 99) {
      showToast('Maximum quantity is 99 per item.');
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${products.find((product) => product.id === id).name} added to your bag.`);
}

function changeQuantity(id, amount) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle('is-open', isOpen);
  cartDrawer.setAttribute('aria-hidden', String(!isOpen));
  drawerBackdrop.hidden = !isOpen;
  document.body.classList.toggle('drawer-open', isOpen);
  if (isOpen) cartDrawer.querySelector('.close-drawer').focus();
}

function setCheckoutOpen(isOpen) {
  checkoutBackdrop.hidden = !isOpen;
  document.body.classList.toggle('modal-open', isOpen);
  if (isOpen) checkoutBackdrop.querySelector('input[name="name"]').focus();
}

document.querySelector('.category-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll('.category-button').forEach((item) => item.classList.toggle('active', item === button));
  renderProducts();
});

document.querySelectorAll('[data-nav-category]').forEach((link) => {
  link.addEventListener('click', () => {
    activeCategory = link.dataset.navCategory;
    document.querySelectorAll('.category-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.category === activeCategory);
    });
    renderProducts();
  });
});

document.querySelector('#product-search').addEventListener('input', (event) => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderProducts();
});

document.querySelector('.search-toggle').addEventListener('click', () => {
  document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
  document.querySelector('#product-search').focus({ preventScroll: true });
});

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});

document.querySelector('.cart-button').addEventListener('click', () => setCartOpen(true));
document.querySelector('.close-drawer').addEventListener('click', () => setCartOpen(false));
drawerBackdrop.addEventListener('click', () => setCartOpen(false));
cartItems.addEventListener('click', (event) => {
  const quantityButton = event.target.closest('[data-quantity]');
  const removeButton = event.target.closest('[data-remove]');
  if (quantityButton) changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  if (removeButton) {
    cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
    saveCart();
    renderCart();
  }
});

document.querySelectorAll('.continue-shopping').forEach((button) => {
  button.addEventListener('click', () => {
    setCartOpen(false);
    if (button.closest('.cart-drawer')) document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
  });
});

document.querySelector('#checkout-button').addEventListener('click', () => {
  setCartOpen(false);
  setCheckoutOpen(true);
});
document.querySelector('.close-checkout').addEventListener('click', () => setCheckoutOpen(false));
checkoutBackdrop.addEventListener('click', (event) => {
  if (event.target === checkoutBackdrop) setCheckoutOpen(false);
});

document.querySelectorAll('input[name="fulfilment"]').forEach((input) => {
  input.addEventListener('change', () => {
    const addressField = document.querySelector('#address-field textarea');
    addressField.required = input.value === 'Delivery' && input.checked;
    document.querySelector('#address-field').hidden = input.value === 'Store pickup' && input.checked;
    if (input.value === 'Store pickup' && input.checked) addressField.value = '';
  });
});

document.querySelector('#address-field textarea').required =
  document.querySelector('input[name="fulfilment"]:checked').value === 'Delivery';

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity() || cart.length === 0) return;

  const formData = new FormData(checkoutForm);
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim();
  const phoneDigits = phone.match(/\d/g) || [];
  if (!/^[+0-9() -]{8,20}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
    phoneInput.setCustomValidity('Enter a valid phone number with 8 to 15 digits.');
    phoneInput.reportValidity();
    return;
  }
  const fulfilment = String(formData.get('fulfilment'));
  const address = String(formData.get('address') || '').trim();
  const note = String(formData.get('note') || '').trim();
  const orderLines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `• ${product.name} × ${item.quantity} — ${formatPrice(product.price * item.quantity)}`;
  });
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + product.price * item.quantity;
  }, 0);
  const message = [
    'Hi Brotherz! I would like to place an order:',
    '',
    ...orderLines,
    '',
    `Subtotal: ${formatPrice(subtotal)}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Fulfilment: ${fulfilment}`,
    ...(fulfilment === 'Delivery' ? [`Delivery address: ${address}`] : []),
    ...(note ? [`Note: ${note}`] : []),
    '',
    'Please confirm availability and delivery charges.',
  ].join('\n');

  window.open(`https://wa.me/${primaryPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!checkoutBackdrop.hidden) setCheckoutOpen(false);
    else if (cartDrawer.classList.contains('is-open')) setCartOpen(false);
  }
});

renderProducts();
renderCart();
