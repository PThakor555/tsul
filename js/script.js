// === Accent Color Logic ===
const accentColors = ["#3082FF", "#C77DFF", "#5EF08F", "#FF8C42", "#FF4A64"];
let accentIndex = 0;

function setAccentColor(color) {
  document.documentElement.style.setProperty("--accent-color", color);
  document.documentElement.style.setProperty("--accent-shadow", `0 0 2px ${color}`);
}
setAccentColor(accentColors[accentIndex]);

document.addEventListener("click", () => {
  accentIndex = (accentIndex + 1) % accentColors.length;
  setAccentColor(accentColors[accentIndex]);
});

// === Canvas Setup ===
const canvas = document.getElementById("gumballs");
const ctx = canvas?.getContext("2d");

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// === Ball Class + Animation ===
class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.dx = (Math.random() - 0.5) * 2;
    this.dy = Math.random() * 0.5 + 1;
    this.gravity = 0.15;
    this.bounce = 0.6;
    this.opacity = 0;
    this.startTime = performance.now();
    this.angle = Math.random() * Math.PI * 2;
    this.waveAmplitude = Math.random() * 15 + 10;
    this.waveSpeed = Math.random() * 0.05 + 0.02;
    this.faded = false;
  }

  shadeColor(base, percent) {
    const f = parseInt(base.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    return "#" + (
      0x1000000 +
      (Math.round((t - R) * p / 100 + R) * 0x10000) +
      (Math.round((t - G) * p / 100 + G) * 0x100) +
      Math.round((t - B) * p / 100 + B)
    ).toString(16).slice(1);
  }

  draw() {
    const gradient = ctx.createRadialGradient(
      this.x - this.radius / 3,
      this.y - this.radius / 3,
      this.radius / 8,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.2, this.color);
    gradient.addColorStop(0.6, this.shadeColor(this.color, -25));
    gradient.addColorStop(0.9, this.shadeColor(this.color, -45));

    ctx.beginPath();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1;
  }

  update() {
    this.x += Math.sin(this.angle) * this.waveAmplitude * 0.01;
    this.angle += this.waveSpeed;

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.dy *= -this.bounce;
    } else {
      this.dy += this.gravity;
    }

    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx *= -1;
    }

    this.x += this.dx;
    this.y += this.dy;

    const elapsed = performance.now() - this.startTime;
    if (elapsed < 1000) {
      this.opacity = Math.min(1, this.opacity + 0.03);
    }
    if (elapsed > 5000 && !this.faded) {
      this.opacity -= 0.02;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this.faded = true;
      }
    }

    this.draw();
  }
}

const balls = Array.from({ length: 80 }, () => {
  const radius = Math.random() * 30 + 20;
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * -1;
  const color = accentColors[Math.floor(Math.random() * accentColors.length)];
  return new Ball(x, y, radius, color);
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balls.forEach(ball => ball.update());
  requestAnimationFrame(animate);
}
animate();
setTimeout(() => {
  const logoContainer = document.getElementById("logo-enter-container");
  if (logoContainer) {
    logoContainer.style.opacity = 1;
  }
}, 3500);
// === Cart Logic ===
function getCart() {
  return JSON.parse(localStorage.getItem("tsulCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("tsulCart", JSON.stringify(cart));
}

function addToCart({ name, price, size }) {
  const cart = getCart();
  const parsedPrice = parseFloat(price);
  const existing = cart.find(item => item.name === name && item.size === size);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ name, price: parsedPrice, size, quantity: 1 });
  }

  saveCart(cart);
  renderCart();

  const note = document.getElementById("cart-notification");
  if (note) {
    note.querySelector("span").textContent = `${name} (${size}) added to cart`;
    note.classList.remove("hidden");
    setTimeout(() => note.classList.add("hidden"), 3000);
  }
}

function renderCart() {
  const cartList = document.getElementById("cart-items");
  if (!cartList) return;

  const cart = getCart();
  const TAX_RATE = 0.0825;
  let subtotal = 0;
  let html = `------------------------------\nTSUL Fall/Holiday 2025 Receipt\n------------------------------\n`;

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    html += `${index + 1}. ${item.name} (${item.size}) x${item.quantity} - $${lineTotal.toFixed(2)}\n`;
    subtotal += lineTotal;
  });

  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  html += `------------------------------\nSubtotal: $${subtotal.toFixed(2)}\nTax (8.25%): $${tax.toFixed(2)}\nTotal: $${total.toFixed(2)}\n------------------------------\nPrinted: ${new Date().toLocaleString()}`;

  cartList.textContent = html;
}

function clearCart() {
  localStorage.removeItem("tsulCart");
  renderCart();
}

function deleteCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// === Section Navigation ===
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  if (id === "cart") renderCart();
}

// === Burger Menu Toggle ===
function toggleBurger(open) {
  const navLinks = document.getElementById("nav-links");
  const backBtn = document.getElementById("back-btn");

  if (navLinks && backBtn) {
    navLinks.classList.toggle("open", open);
    backBtn.style.display = open ? "block" : "none";
  }
}
// === Search Logic ===
let searchTimeout;

function performSearch(query) {
  const results = [];
  const products = document.querySelectorAll(".product-tile");

  products.forEach(product => {
    const name = product.querySelector("h3")?.textContent.toLowerCase() || "";
    const price = product.querySelector("p")?.textContent.toLowerCase() || "";
    const section = product.closest("section")?.id || "home";

    const matchType = name === query.toLowerCase()
      ? "exact"
      : name.includes(query.toLowerCase()) || price.includes(query.toLowerCase())
      ? "partial"
      : null;

    if (matchType) {
      results.push({ name, section, element: product, match: matchType });
    }
  });

  return results.sort((a, b) => (a.match === "exact" ? -1 : 1));
}

function showSearchResults(results) {
  const searchInput = document.getElementById("search-input");
  const searchContainer = document.getElementById("search-container") || createSearchContainer();
  searchContainer.innerHTML = "";
  searchContainer.style.display = results.length ? "block" : "none";

  results.forEach(result => {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.innerHTML = `
      <div style="font-weight: bold;">${result.name}</div>
      <div style="font-size: 0.8em; color: #ccc;">${result.section.toUpperCase()} Collection</div>
    `;
    item.style.cssText = `
      padding: 10px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);
      background: ${result.match === "exact" ? "var(--accent-color)" : "var(--bg-light)"};
      color: ${result.match === "exact" ? "white" : "var(--text-light)"};
    `;

    item.addEventListener("click", () => {
      showSection(result.section);
      result.element.scrollIntoView({ behavior: "smooth", block: "center" });
      result.element.style.background = "var(--accent-color)";
      result.element.style.color = "white";
      setTimeout(() => {
        result.element.style.background = "";
        result.element.style.color = "";
      }, 2000);

      searchInput.value = "";
      searchContainer.style.display = "none";
    });

    item.addEventListener("mouseenter", () => {
      item.style.background = result.match === "exact" ? "var(--accent-hover)" : "var(--border-color)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.background = result.match === "exact" ? "var(--accent-color)" : "var(--bg-light)";
    });

    searchContainer.appendChild(item);
  });
}

function createSearchContainer() {
  const searchInput = document.getElementById("search-input");
  const container = document.createElement("div");
  container.id = "search-container";
  container.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
  `;
  searchInput.parentNode.style.position = "relative";
  searchInput.parentNode.appendChild(container);
  return container;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim().toLowerCase();
        const results = performSearch(query);
        showSearchResults(results);
      }, 300);
    });
  }
});
// === Search Fallback ===
function handleSearch(query) {
  const allSections = document.querySelectorAll(".section");
  allSections.forEach(section => section.style.display = "none");

  const menSection = document.getElementById("men");
  const products = menSection.querySelectorAll(".product");
  let matchFound = false;

  products.forEach(product => {
    const title = product.querySelector("h3").textContent.toLowerCase();
    if (title.includes(query.toLowerCase())) {
      product.style.display = "block";
      matchFound = true;
    } else {
      product.style.display = "none";
    }
  });

  menSection.style.display = "block";
  menSection.classList.add("active");

  if (!matchFound && !menSection.querySelector(".no-results")) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.style.textAlign = "center";
    message.style.color = "var(--text-muted)";
    message.textContent = `No results for "${query}"`;
    menSection.appendChild(message);
  }
}
// === DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  const enterBtn = document.getElementById("enter-btn");
  if (enterBtn) {
    enterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("intro").style.display = "none";
      document.querySelector(".tsul-header")?.classList.add("visible");
      document.querySelector("main")?.classList.add("with-header");
      showSection("home");
    });
  }

  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  const backBtn = document.getElementById("back-btn");

  if (burger && navLinks && backBtn) {
    burger.addEventListener("click", () => {
      toggleBurger(!navLinks.classList.contains("open"));
    });
    backBtn.addEventListener("click", () => {
      toggleBurger(false);
    });
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.trim();
      if (searchTimeout) clearTimeout(searchTimeout);

      if (query.length === 0) {
        const container = document.getElementById("search-container");
        if (container) container.style.display = "none";
        return;
      }

      searchTimeout = setTimeout(() => {
        const results = performSearch(query);
        showSearchResults(results);
      }, 300);
    });

    document.addEventListener("click", (e) => {
      if (
        !e.target.closest("#search-input") &&
        !e.target.closest("#search-container")
      ) {
        const container = document.getElementById("search-container");
        if (container) container.style.display = "none";
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (query) handleSearch(query);
      }
    });
  }

  // Fade-in observer
  const fadeEls = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });
  fadeEls.forEach(el => observer.observe(el));
});

// === Global Exposure ===
window.clearCart = clearCart;
window.deleteCartItem = deleteCartItem;
window.addToCart = addToCart;
window.renderCart = renderCart;
window.toggleBurger = toggleBurger;
window.showSection = showSection;
window.openProductViewer = openProductViewer;
window.closeProductViewer = closeProductViewer;
function toggleAboutModal() {
  const modal = document.getElementById("about-modal");
  if (!modal) return;
  const isVisible = modal.style.display === "flex";
  modal.style.display = isVisible ? "none" : "flex";
}
window.toggleAboutModal = toggleAboutModal;
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#home") {
    showSection("home");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.hash.replace("#", "?"));
  const skipIntro = params.get("skipIntro");

  if (skipIntro === "true") {
    document.getElementById("intro").style.display = "none";
    document.querySelector(".tsul-header")?.classList.add("visible");
    document.querySelector("main")?.classList.add("with-header");
    showSection("home");
    return;
  }

  // Normal intro behavior continues here...
});
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const allTiles = document.querySelectorAll(".product-tile");

      allTiles.forEach(tile => {
        const text = tile.textContent.toLowerCase();
        tile.style.display = text.includes(query) ? "block" : "none";
      });
    });
  }
});