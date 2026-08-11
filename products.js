// =========================
// Products Data (Fallback)
// =========================

let products = [
    {
        id: 1,
        name: "Premium Smartphone",
        price: 899.99,
        image: "images/smartphone.jpg"
    },
    {
        id: 2,
        name: "Ultra Slim Laptop",
        price: 1299.99,
        image: "images/laptop.jpg"
    },
    {
        id: 3,
        name: "Smart Watch",
        price: 199.99,
        image: "images/smartwatch.jpg"
    },
    {
        id: 4,
        name: "Wireless Headphones",
        price: 149.99,
        image: "images/headphones.jpg"
    }
];

// =========================
// Containers
// =========================

const productContainer = document.getElementById("all-products");
const featuredProducts = document.getElementById("featured-products");

// =========================
// Card template helpers
// =========================

// Deterministic "mock" rating/badge/mrp so real backend data (which may not
// have these fields yet) still renders a premium-looking card consistently.
function pcMeta(product) {
    const seed = Number(product.id) || 1;
    const rating = product.rating || (4 + ((seed * 7) % 10) / 10).toFixed(1);
    const reviews = product.reviews || (20 + ((seed * 37) % 480));
    const mrp = product.mrp || Math.round(product.price * 1.35);
    const off = Math.max(0, Math.round((1 - product.price / mrp) * 100));
    const badge = product.badge || (seed % 5 === 0 ? "new" : seed % 3 === 0 ? "best" : off > 15 ? "sale" : null);
    const inStock = product.inStock !== false;
    return { rating, reviews, mrp, off, badge, inStock };
}

function starString(rating) {
    const r = Math.round(rating);
    return "★★★★★☆☆☆☆☆".slice(5 - r, 10 - r);
}

function badgeHtml(badge, inStock) {
    let html = "";
    if (badge === "sale") html += `<span class="pc-badge badge-sale">Deal</span>`;
    if (badge === "new") html += `<span class="pc-badge badge-new">New</span>`;
    if (badge === "best") html += `<span class="pc-badge badge-best">Bestseller</span>`;
    if (!inStock) html += `<span class="pc-badge badge-stock">Out of stock</span>`;
    return html;
}

function productCardHtml(product, opts = {}) {
    const { rating, reviews, mrp, off, badge, inStock } = pcMeta(product);
    const compact = !!opts.compact;

    return `
        <div class="product-card" data-id="${product.id}">

            <div class="pc-img-wrap">
                ${badgeHtml(badge, inStock)}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="pc-quick-row">
                    <button class="pc-icon-btn" title="Quick View" onclick="event.stopPropagation(); openQuickView(${product.id});">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="pc-icon-btn" title="Compare" onclick="event.stopPropagation(); toggleCompare(${product.id});">
                        <i class="fa-solid fa-scale-balanced"></i>
                    </button>
                </div>
            </div>

            <h3>${product.name}</h3>

            <div class="pc-rating">
                <span class="stars">${starString(rating)}</span>
                <span class="count">${rating} (${reviews})</span>
            </div>

            <div class="pc-price-row">
                <p style="margin:0;">$${product.price}</p>
                <span class="pc-mrp">$${mrp}</span>
                ${off > 0 ? `<span class="pc-off">${off}% off</span>` : ""}
            </div>

            <div class="card-actions-row">

                <button class="wishlist-btn" data-id="${product.id}">
                    <i class="fa-regular fa-heart"></i>
                </button>

                <button onclick="viewProduct(${product.id})">
                    View Details
                </button>

            </div>

            ${compact ? "" : `
            <div class="pc-btn-row">
                <button
                    class="add-cart"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}">
                    Add to Cart
                </button>
                <button class="btn-buy-now" onclick="buyNow(${product.id})">Buy Now</button>
            </div>`}

        </div>
    `;
}

function skeletonCardsHtml(count) {
    return Array.from({ length: count }).map(() => `
        <div class="skel-card">
            <div class="skel-block skel-img"></div>
            <div class="skel-block skel-line"></div>
            <div class="skel-block skel-line short"></div>
            <div class="skel-block skel-btn"></div>
        </div>
    `).join("");
}

// =========================
// Shop Page
// =========================

function displayProducts() {

    if (!productContainer) return;

    productContainer.innerHTML = products.map(product => productCardHtml(product)).join("");

}

// =========================
// Home Page Featured
// =========================

function displayFeaturedProducts() {

    if (!featuredProducts) return;

    featuredProducts.innerHTML = products
        .slice(0, 4)
        .map(product => productCardHtml(product, { compact: true }))
        .join("");

}

// =========================
// Quick View / Compare / Buy Now
// =========================

function ensureQuickViewModal() {
    if (document.getElementById("quickViewOverlay")) return;
    const overlay = document.createElement("div");
    overlay.className = "qv-overlay";
    overlay.id = "quickViewOverlay";
    overlay.innerHTML = `<div class="qv-modal" id="qvModalBody"></div>`;
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeQuickView();
    });
    document.body.appendChild(overlay);
}

function openQuickView(id) {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;
    ensureQuickViewModal();

    const { rating, reviews, mrp, off } = pcMeta(product);
    const body = document.getElementById("qvModalBody");
    body.innerHTML = `
        <button class="qv-close" onclick="closeQuickView()"><i class="fa-solid fa-xmark"></i></button>
        <div class="qv-img"><img src="${product.image}" alt="${product.name}"></div>
        <div class="qv-info">
            <div class="pc-rating" style="justify-content:flex-start;">
                <span class="stars">${starString(rating)}</span>
                <span class="count">${rating} (${reviews} reviews)</span>
            </div>
            <h2>${product.name}</h2>
            <div class="pc-price-row">
                <span class="price">$${product.price}</span>
                <span class="pc-mrp">$${mrp}</span>
                ${off > 0 ? `<span class="pc-off">${off}% off</span>` : ""}
            </div>
            <p class="qv-desc">Premium quality, backed by NovaCart's 7-day easy return policy and secure checkout. Free shipping on orders over $50.</p>
            <button class="btn-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}" onclick="document.dispatchEvent(new CustomEvent('qv-add', {detail:${product.id}}))">Add to Cart</button>
            <button class="btn-buy-now" style="width:100%;" onclick="buyNow(${product.id})">Buy Now</button>
        </div>
    `;
    document.getElementById("quickViewOverlay").classList.add("open");
}

function closeQuickView() {
    const overlay = document.getElementById("quickViewOverlay");
    if (overlay) overlay.classList.remove("open");
}

// Bridge quick-view "Add to Cart" click to whatever cart logic already
// exists on the page (cart.js listens for .add-cart clicks elsewhere).
document.addEventListener("qv-add", function (e) {
    const id = e.detail;
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;
    const fakeBtn = document.createElement("button");
    fakeBtn.className = "add-cart";
    fakeBtn.dataset.id = product.id;
    fakeBtn.dataset.name = product.name;
    fakeBtn.dataset.price = product.price;
    fakeBtn.dataset.image = product.image;
    document.body.appendChild(fakeBtn);
    fakeBtn.click();
    fakeBtn.remove();
    closeQuickView();
});

function buyNow(id) {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;
    document.dispatchEvent(new CustomEvent('qv-add', { detail: id }));
    window.location.href = "checkout.html";
}

// Simple compare list (localStorage), max 4 items
function toggleCompare(id) {
    let list = JSON.parse(localStorage.getItem("compareList") || "[]");
    if (list.includes(id)) {
        list = list.filter(x => x !== id);
    } else {
        if (list.length >= 4) list.shift();
        list.push(id);
    }
    localStorage.setItem("compareList", JSON.stringify(list));
}

// =========================
// Load Products
// =========================

async function loadProducts() {

    if (productContainer) productContainer.innerHTML = skeletonCardsHtml(8);
    if (featuredProducts) featuredProducts.innerHTML = skeletonCardsHtml(4);

    try {

        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (response.ok) {
            products = await response.json();
        }

    } catch (error) {
        console.log("Backend unavailable. Using fallback products.");
    }

    displayProducts();
    displayFeaturedProducts();

}

// =========================
// View Product
// =========================

function viewProduct(id) {

    window.location.href = `product-details.html?id=${id}`;

}

// =========================
// Start
// =========================

window.productsReady = loadProducts();

// =========================
// Search Products
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const value = this.value.trim().toLowerCase();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(value)
        );

        productContainer.innerHTML = filtered.length
            ? filtered.map(product => productCardHtml(product)).join("")
            : `<h2 style="text-align:center;padding:50px;">No Products Found 😔</h2>`;

    });

});