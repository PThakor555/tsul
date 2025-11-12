document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("product.html")) return;

  // === Product Data ===
  const products = {
    sweats: {
      name: "TSUL Sweats – Black Colorway",
      price: 40,
      images: [
        "https://i.ibb.co/bgJNGyM4/IMG-4235-1.jpg",
        "https://i.ibb.co/bgJNGyM4/IMG-4235-1.jpg"
      ],
      description: "Heavyweight comfort with a clean silhouette. Built for layering or lounging.",
      material: "100% cotton fleece",
      color: "Teal & Blue",
      origin: "USA"
    },
    hoodie: {
      name: "TSUL Hoodie – Black Colorway",
      price: 40,
      images: [
        "https://i.ibb.co/3ypNvTrD/IMG-4234.jpg",
        "https://i.ibb.co/3ypNvTrD/IMG-4234.jpg"
      ],
      description: "Relaxed fit with ribbed cuffs and hem. Built for layering and comfort.",
      material: "Midweight cotton blend",
      color: "Teal & Blue",
      origin: "USA"
    },
    tee: {
      name: "TSUL Tee – Black Colorway",
      price: 40,
      images: [
        "https://i.ibb.co/20tN9NzC/IMG-4233.jpg",
        "https://i.ibb.co/20tN9NzC/IMG-4233.jpg"
      ],
      description: "Lightweight and breathable. Tailored cut for everyday wear.",
      material: "Soft combed cotton",
      color: "Teal & Blue",
      origin: "USA"
    }
  };

  // === Setup ===
  const selectedSize = { value: "M" };
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const product = products[productId];
  const container = document.getElementById("product-page");

  if (!product || !container) {
    container.innerHTML = `<p class="centered">Product not found.</p>`;
    return;
  }

  // === Render Product Layout ===
  container.innerHTML = `
    <div class="product-layout">
      <div class="image-menu" id="image-menu">
        ${product.images.map((img, i) =>
          `<img src="${img}" class="${i === 0 ? 'active' : ''}" />`
        ).join("")}
      </div>

      <div class="product-info">
        <img id="main-image" src="${product.images[0]}" alt="${product.name}" />
        <h2>${product.name}</h2>
        <p><strong>Price:</strong> $${product.price}</p>

        <div class="size-buttons" id="size-buttons">
          <button data-size="S">S</button>
          <button data-size="M" class="active">M</button>
          <button data-size="L">L</button>
        </div>

        <div class="product-description">
          <p><strong>Material:</strong> ${product.material}</p>
          <p><strong>Color:</strong> ${product.color}</p>
          <p><strong>Made in:</strong> ${product.origin}</p>
          <p>${product.description}</p>
        </div>

        <button class="add-cart-btn" id="add-to-cart">Add to Cart</button>
      </div>
    </div>
  `;

  // === Image Thumbnail Click ===
  document.querySelectorAll("#image-menu img").forEach(img => {
    img.addEventListener("click", () => {
      document.getElementById("main-image").src = img.src;
      document.querySelectorAll("#image-menu img").forEach(i => i.classList.remove("active"));
      img.classList.add("active");
    });
  });

  // === Size Selection ===
  document.querySelectorAll("#size-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedSize.value = btn.dataset.size;
      document.querySelectorAll("#size-buttons button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // === Add to Cart ===
  document.getElementById("add-to-cart").addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("tsulCart")) || [];

    const existing = cart.find(item => item.name === product.name && item.size === selectedSize.value);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        size: selectedSize.value,
        quantity: 1
      });
    }

    localStorage.setItem("tsulCart", JSON.stringify(cart));
    alert(`${product.name} (${selectedSize.value}) added to cart.`);
  });
});