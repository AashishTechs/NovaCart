// =========================
// Toggle Wishlist (heart click)
// =========================

document.addEventListener("click", function (e) {

    const btn = e.target.closest(".wishlist-btn");

    if (!btn) return;

    e.stopPropagation();

    const id = Number(btn.dataset.id);

    if (!id) return;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists = wishlist.includes(id);

    const icon = btn.querySelector("i");

    if (exists) {

        wishlist = wishlist.filter(item => item !== id);

        if (icon) {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }

    } else {

        wishlist.push(id);

        if (icon) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        }

    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

});

// =========================
// Sync Heart Icons (filled/outline)
// Waits for the real product catalog (loaded from the backend
// in products.js) before touching the DOM, otherwise cards that
// render after this runs would get skipped.
// =========================

async function syncWishlistIcons() {

    if (window.productsReady) {
        try {
            await window.productsReady;
        } catch (error) {
            // fallback products are already in place, continue anyway
        }
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    document.querySelectorAll(".wishlist-btn").forEach(btn => {

        const id = Number(btn.dataset.id);

        const icon = btn.querySelector("i");

        if (!icon) return;

        if (wishlist.includes(id)) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }

    });

}

document.addEventListener("DOMContentLoaded", syncWishlistIcons);

// =========================
// Display Wishlist Page
// Also waits for the real product catalog so saved items
// actually resolve to a product instead of being filtered out.
// =========================

async function renderWishlistPage() {

    const wishlistContainer = document.querySelector(".wishlist-container");

    if (!wishlistContainer) return;

    if (window.productsReady) {
        try {
            await window.productsReady;
        } catch (error) {
            // fallback products are already in place, continue anyway
        }
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (wishlist.length === 0) {

        wishlistContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your Wishlist is Empty ❤️</h2>
                <p>Save your favorite products here.</p>

                <a href="products.html">
                    Continue Shopping
                </a>
            </div>
        `;

        return;

    }

    const matchedProducts = wishlist
        .map(id => products.find(item => item.id === id))
        .filter(Boolean);

    if (matchedProducts.length === 0) {

        wishlistContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your Wishlist is Empty ❤️</h2>
                <p>Save your favorite products here.</p>

                <a href="products.html">
                    Continue Shopping
                </a>
            </div>
        `;

        return;

    }

    wishlistContainer.innerHTML = matchedProducts
        .map(product => `
            <div class="product-card">

                <img src="${product.image}" alt="${product.name}">

                <h3>${product.name}</h3>

                <p>$${product.price}</p>

                <button
                    class="wishlist-remove"
                    data-id="${product.id}">
                    Remove ❤️
                </button>

                <button
                    class="add-cart"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}">
                    Add to Cart
                </button>

            </div>
        `).join("");

}

document.addEventListener("DOMContentLoaded", renderWishlistPage);

// =========================
// Remove From Wishlist
// =========================

document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("wishlist-remove")) return;

    const id = Number(e.target.dataset.id);

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlist = wishlist.filter(item => item !== id);

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    renderWishlistPage();

});
