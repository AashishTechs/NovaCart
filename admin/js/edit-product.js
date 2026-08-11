// ==========================================================
// Edit Product
// Previously this file was a stub: it filled the form with a
// hardcoded dummy product and only console.logged on submit,
// never actually loading or saving real data. This version reads
// ?id= from the URL, loads the real product, and saves changes
// through the protected admin API.
// ==========================================================

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const imageInput = document.getElementById("image");
const descriptionInput = document.getElementById("description");
const editProductForm = document.getElementById("editProductForm");

if (!productId) {

    alert("No product selected to edit.");
    window.location.href = "products.html";

}

// ==========================================================
// Load Product Data
// ==========================================================

async function loadProduct() {

    try {

        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);

        if (!response.ok) {
            throw new Error("Failed to load product");
        }

        const product = await response.json();

        if (nameInput) nameInput.value = product.name;
        if (categoryInput) categoryInput.value = product.category;
        if (priceInput) priceInput.value = product.price;
        if (stockInput) stockInput.value = product.stock;
        if (imageInput) imageInput.value = product.image;
        if (descriptionInput) descriptionInput.value = product.description;

    } catch (error) {

        console.error("Load Product Error:", error);
        alert("Failed to load product details.");
        window.location.href = "products.html";

    }

}

loadProduct();

// ==========================================================
// Update Product
// ==========================================================

if (editProductForm) {

    editProductForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const updatedProduct = {

            name: nameInput.value.trim(),
            category: categoryInput.value.trim(),
            price: Number(priceInput.value),
            stock: Number(stockInput.value),
            image: normalizeImagePath(imageInput.value.trim()),
            description: descriptionInput.value.trim()

        };

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/admin/products/${productId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },

                    body: JSON.stringify(updatedProduct)

                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update product");
            }

            alert("✅ Product Updated Successfully!");
            window.location.href = "products.html";

        } catch (error) {

            console.error("Update Product Error:", error);
            alert(error.message);

        }

    });

}
