// =========================
// Get Product ID from URL
// =========================

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

console.log("Product ID:", id);


// =========================
// Load Product Details
// =========================

async function loadProductDetails() {

    try {

        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

        const product = await response.json();

        console.log("Selected Product:", product);


        if(product && product.id) {


            document.getElementById("product-image").src = product.image;
            document.getElementById("product-image").alt = product.name;


            document.getElementById("product-category").textContent = product.category;

            document.getElementById("product-name").textContent = product.name;
            const crumb = document.getElementById("breadcrumb-name");
            if (crumb) crumb.textContent = product.name;

            document.getElementById("product-price").textContent = "$" + product.price;

            document.getElementById("product-description").textContent = product.description;


            if(document.getElementById("product-rating")){
                document.getElementById("product-rating").innerHTML = product.rating || "⭐⭐⭐⭐⭐";
            }

            const wishlistBtn = document.querySelector(".wishlist-btn");

            if (wishlistBtn) {
                wishlistBtn.dataset.id = product.id;

                if (typeof syncWishlistIcons === "function") {
                    syncWishlistIcons();
                }
            }

            loadRelatedProducts(product);

        } else {

            document.querySelector(".product-details").innerHTML = `
                <h2>Product Not Found</h2>
                <p>The requested product does not exist.</p>
            `;

        }


    } catch(error) {

        console.log("Error:", error);

    }

}

// =========================
// Related Products
// =========================

async function loadRelatedProducts(currentProduct) {
    const container = document.getElementById("related-products");
    if (!container) return;

    // Wait for the shared products list (loaded by products.js) if available
    if (window.productsReady && typeof window.productsReady.then === "function") {
        await window.productsReady;
    }

    if (typeof products === "undefined" || !Array.isArray(products) || typeof productCardHtml !== "function") {
        container.closest(".related-products")?.remove();
        return;
    }

    const related = products
        .filter(p => p.id !== currentProduct.id)
        .filter(p => !currentProduct.category || p.category === currentProduct.category)
        .slice(0, 4);

    const finalList = related.length ? related : products.filter(p => p.id !== currentProduct.id).slice(0, 4);

    if (!finalList.length) {
        container.closest(".related-products")?.remove();
        return;
    }

    container.innerHTML = finalList.map(p => productCardHtml(p, { compact: true })).join("");
}

// =========================
// Copy Link
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const copyBtn = document.getElementById("copyLinkBtn");
    if (!copyBtn) return;
    copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard?.writeText(window.location.href).then(() => {
            copyBtn.classList.add("copied");
            setTimeout(() => copyBtn.classList.remove("copied"), 1500);
        });
    });
});
loadProductDetails();
