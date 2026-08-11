console.log("products.js loaded");

// =========================
// Products Management
// =========================

const table = document.getElementById("productTable");
const searchProduct = document.getElementById("searchProduct");

let products = [];

// =========================
// Load Products
// =========================

async function loadProducts() {

    try {

        const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
            cache: "no-store",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Products Error:", error);

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">Failed to load products</td>
                </tr>
            `;

        }

    }

}

// =========================
// Display Products
// =========================

// =========================
// Resolve Image Path
// Product images are stored as paths relative to the storefront's
// root (e.g. "images/laptop.jpg") because that's where they're
// used on the public site. This admin page lives one folder deeper
// (/admin/), so that same bare path would incorrectly resolve to
// /admin/images/laptop.jpg and 404. Full URLs, absolute paths, and
// data URIs are left untouched.
// =========================

function resolveImageSrc(path) {

    if (!path) return path;

    if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("/")) {
        return path;
    }

    return "../" + path;

}

function displayProducts(data) {

    if (!table) return;

    table.innerHTML = "";

    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">No Products Found</td>
            </tr>
        `;

        return;

    }

    table.innerHTML = data.map(product => `
            <tr>

                <td>${product.id}</td>

                <td>
                    <img
                        src="${resolveImageSrc(product.image)}"
                        width="60"
                        height="60"
                        alt="${product.name}">
                </td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>$${Number(product.price).toFixed(2)}</td>

                <td>${product.stock}</td>

                <td>

                    <a
                        href="edit-product.html?id=${product.id}"
                        class="edit-btn">
                        ✏ Edit
                    </a>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})">
                        🗑 Delete
                    </button>

                </td>

            </tr>
        `).join("");

}

// =========================
// Delete Product
// =========================

async function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/products/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete product");
        }

        alert(data.message);

        await loadProducts();

    } catch (error) {

        console.error("Delete Product Error:", error);

        alert(error.message);

    }

}

// =========================
// Search Product
// =========================

if (searchProduct) {

    searchProduct.addEventListener("keyup", function () {

        const value = this.value.toLowerCase().trim();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(value) ||
            product.category.toLowerCase().includes(value)
        );

        displayProducts(filtered);

    });

}

// =========================
// Image Fallback
// A file path ("../images/no-image.png") is fragile — if that file
// is ever missing, the fallback itself 404s and can re-trigger this
// same handler. An inline SVG data URI can never fail to load, and
// the dataset flag stops it from ever being applied twice to the
// same image.
// =========================

const PRODUCT_IMAGE_FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
            <rect width="100%" height="100%" fill="#e5e7eb"/>
            <text x="50%" y="50%" font-size="9" fill="#6b7280"
                text-anchor="middle" dominant-baseline="middle">No Image</text>
        </svg>`
    );

document.addEventListener("error", function (e) {

    if (e.target.tagName === "IMG" && !e.target.dataset.fallbackApplied) {
        e.target.dataset.fallbackApplied = "true";
        e.target.src = PRODUCT_IMAGE_FALLBACK;
    }

}, true);

// =========================
// Start
// =========================

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

// =========================
// Global
// =========================

window.deleteProduct = deleteProduct;