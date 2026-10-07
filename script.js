// ==========================================
// 1. PRODUCT DATA
// ==========================================
const products = [
  {
    id: 1,
    title: "Oud Royale",
    category: "woody",
    price: 240,
    notes: "Agarwood, Amber, Cardamom",
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Velvet Rose",
    category: "floral",
    price: 185,
    notes: "Damask Rose, Clove, Praline",
    badge: "New",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Solaris Zest",
    category: "fresh",
    price: 160,
    notes: "Bergamot, Vetiver, Sea Salt",
    badge: "",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "Amber Dusk",
    category: "oriental",
    price: 210,
    notes: "Vanilla Bean, Patchouli, Tonka",
    badge: "Exclusive",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Santal Mystic",
    category: "woody",
    price: 195,
    notes: "Sandalwood, Iris, Papyrus",
    badge: "",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Jasmine Noir",
    category: "floral",
    price: 175,
    notes: "Jasmine Sambac, Cashmeran",
    badge: "",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
  }
];

// State Management
let cart = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const cartIconBtn = document.getElementById('cartIconBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// ==========================================
// 2. RENDER PRODUCTS
// ==========================================
function renderProducts(items) {
  productGrid.innerHTML = '';
  if (items.length === 0) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No fragrances found matching your search.</p>`;
    return;
  }

  items.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <p class="product-notes">${product.notes}</p>
        <div class="product-bottom">
          <span class="product-price">$${product.price}</span>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// ==========================================
// 3. FILTERING & SEARCH
// ==========================================
function filterProducts() {
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filtered = products.filter(product => {
    const matchesCategory = activeFilter === 'all' || product.category === activeFilter;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                          product.notes.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  renderProducts(filtered);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    filterProducts();
  });
});

searchInput.addEventListener('input', filterProducts);

// ==========================================
// 4. CART SYSTEM
// ==========================================
function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = products.find(p => p.id === productId);
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
  showToast('Fragrance added to your selection');
}

function changeQuantity(id, change) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateCartUI() {
  // Cart badge count
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;

  // Cart total calculation
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalAmount.textContent = `$${totalCost.toFixed(2)}`;

  // Render sidebar items
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Your cart is currently empty.</p>`;
    return;
  }

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });
}

// ==========================================
// 5. SIDEBAR & TOAST CONTROLS
// ==========================================
function toggleCart() {
  cartSidebar.classList.toggle('active');
  cartOverlay.classList.toggle('active');
}

cartIconBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initial Render
renderProducts(products);