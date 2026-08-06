// =========================
// Add To Cart
// =========================

document.addEventListener("click", function(e){

    if(e.target.classList.contains("add-cart")){

        const button = e.target;
        console.log(button);
console.log(button.dataset);


        const product = {

    id: Number(button.dataset.id),
    name: button.dataset.name,
    price: Number(button.dataset.price),
    image: button.dataset.image,
    quantity: 1

};


        let cart = JSON.parse(localStorage.getItem("cart")) || [];


        const existingProduct = cart.find(
            item => item.id === product.id
        );


        if(existingProduct){

            existingProduct.quantity++;

        }
        else{

            cart.push(product);

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        showToast(product.name + " added to cart!");

        updateCartBadge();

    }

});


// =========================
// Display Cart
// =========================

const cartItems = document.querySelector(".cart-items");


function displayCart(){


    if(!cartItems) return;


    let cart = JSON.parse(localStorage.getItem("cart")) || [];


    cartItems.innerHTML = "";


    // Empty Cart

    if(cart.length === 0){


        cartItems.innerHTML = `

        <div class="empty-cart">

            <h2>Your Cart is Empty 🛒</h2>

            <p>Add some products and come back!</p>

            <a href="products.html">
                Continue Shopping
            </a>

        </div>

        `;


        updatePrice(0);

        return;

    }

    let subtotal = 0;

    const rowsHtml = cart.map((product, index) => {

        subtotal += product.price * product.quantity;

        return `

        <div class="cart-item">


            <img src="${product.image}">


            <div class="cart-info">


                <h3>${product.name}</h3>


                <p>$${product.price}</p>


                <div class="quantity-box">


                    <button class="minus-btn" data-index="${index}">
                    -
                    </button>


                    <span>
                    ${product.quantity}
                    </span>


                    <button class="plus-btn" data-index="${index}">
                    +
                    </button>


                </div>


                <button class="remove-btn" data-index="${index}">
                Remove
                </button>


            </div>


        </div>

        `;

    }).join("");

    cartItems.innerHTML = rowsHtml;



    updatePrice(subtotal);


    // Increase

    document.querySelectorAll(".plus-btn").forEach(btn=>{


        btn.addEventListener("click",()=>{


            let index = btn.dataset.index;


            cart[index].quantity++;


            saveCart(cart);


        });


    });


    // Decrease

    document.querySelectorAll(".minus-btn").forEach(btn=>{


        btn.addEventListener("click",()=>{


            let index = btn.dataset.index;


            if(cart[index].quantity > 1){

                cart[index].quantity--;

            }
            else{

                cart.splice(index,1);

            }


            saveCart(cart);


        });


    });


    // Remove

    document.querySelectorAll(".remove-btn").forEach(btn=>{


        btn.addEventListener("click",()=>{


            let index = btn.dataset.index;


            cart.splice(index,1);


            saveCart(cart);


            showToast("Item Removed");


        });


    });


}


// =========================
// Save Cart
// =========================

function saveCart(cart){


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

    updateCartBadge();

}


// =========================
// Price Calculation
// =========================


function updatePrice(subtotal){


    let tax = subtotal * 0.05;


    let discount = 0;


    if(localStorage.getItem("coupon") === "NOVA10"){

        discount = subtotal * 0.10;

    }


    let total = subtotal + tax - discount;



    if(document.getElementById("subtotal")){

        document.getElementById("subtotal").textContent =
        "$" + subtotal.toFixed(2);

    }



    if(document.getElementById("tax")){

        document.getElementById("tax").textContent =
        "$" + tax.toFixed(2);

    }



    if(document.getElementById("total")){

        document.getElementById("total").textContent =
        "$" + total.toFixed(2);

    }


}


// =========================
// Clear Cart
// =========================


const clearBtn = document.getElementById("clear-cart");


if(clearBtn){


    clearBtn.addEventListener("click",()=>{


        localStorage.removeItem("cart");


        displayCart();


        updateCartBadge();


        showToast("Cart Cleared");


    });


}





// =========================
// Coupon
// =========================


const couponBtn = document.getElementById("apply-coupon");


if(couponBtn){


    couponBtn.addEventListener("click",()=>{


        let code = document.getElementById("coupon").value;


        if(code === "NOVA10"){


            localStorage.setItem(
                "coupon",
                "NOVA10"
            );


            showToast("10% Coupon Applied 🎉");


            displayCart();


        }
        else{


            showToast("Invalid Coupon ❌");


        }


    });


}

// =========================
// Toast
// =========================


function showToast(message){


    const toast = document.createElement("div");


    toast.className = "toast";


    toast.innerText = message;



    document.body.appendChild(toast);



    setTimeout(()=>{


        toast.remove();


    },3000);


}

// =========================
// Cart Badge
// =========================


function updateCartBadge(){


    let cart = JSON.parse(localStorage.getItem("cart")) || [];


    let count = 0;



    cart.forEach(item=>{


        count += item.quantity;


    });



    const badge = document.querySelector(".cart-count");



    if(badge){

        badge.textContent = count;

    }


}





// Start

displayCart();

updateCartBadge();

// =========================
// Checkout
// =========================

const checkoutBtn = document.querySelector(".checkout-btn");


if(checkoutBtn){

    checkoutBtn.addEventListener("click", ()=>{

        let cart = JSON.parse(localStorage.getItem("cart")) || [];


        if(cart.length === 0){

            showToast("Your cart is empty ❌");

            return;

        }


        window.location.href = "checkout.html";


    });

}