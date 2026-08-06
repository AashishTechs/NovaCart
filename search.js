// =========================
// Product Search
// =========================

const searchInput = document.querySelector("#search");

const products = document.querySelectorAll(".product-card");

if(searchInput){

searchInput.addEventListener("keyup",()=>{

const value = searchInput.value.toLowerCase();

products.forEach(product=>{

const text = product.innerText.toLowerCase();

product.style.display =
text.includes(value) ? "block" : "none";

});

});

}