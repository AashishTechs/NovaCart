// =========================
// LOAD CART DATA
// =========================
const API_BASE_URL = "http://localhost:5000";
const cart = JSON.parse(localStorage.getItem("cart")) || [];


// =========================
// SHOW TOTAL ITEMS
// =========================

const totalItems = document.getElementById("total-items");

if(totalItems){

    totalItems.textContent = cart.reduce(
        (sum, product) => sum + product.quantity,
        0
    );

}



// =========================
// LOAD CHECKOUT PRODUCTS
// =========================

function loadCheckoutItems(){


    const box = document.getElementById("checkoutItems");

    if(!box) return;


    box.innerHTML = "";


    let total = 0;



    cart.forEach(product=>{


        total += Number(product.price) * Number(product.quantity);



        box.innerHTML += `

        <div class="checkout-product">

            <span>
                ${product.name}
            </span>


            <strong>
                ₹${product.price}
            </strong>


        </div>

        `;


    });



    const checkoutTotal =
    document.getElementById("checkout-total");



    if(checkoutTotal){

        checkoutTotal.textContent =
        "₹" + total.toFixed(2);

    }



}


loadCheckoutItems();






// =========================
// ADDRESS MODAL OPEN
// =========================


function openAddressModal(){

    document.getElementById("addressModal")
    .style.display="flex";

}




// =========================
// ADDRESS MODAL CLOSE
// =========================


function closeAddressModal(){

    document.getElementById("addressModal")
    .style.display="none";

}






// =========================
// SAVE ADDRESS
// =========================


const addressForm =
document.getElementById("addressForm");



if(addressForm){


addressForm.addEventListener("submit",function(e){


    e.preventDefault();



    let addressData = {


        name:
        document.getElementById("fullName").value,


        phone:
        document.getElementById("phone").value,


        address:
        document.getElementById("address").value,


        city:
        document.getElementById("city").value,


        state:
        document.getElementById("state").value


    };




    localStorage.setItem(

        "novacartAddress",

        JSON.stringify(addressData)

    );



    alert("Address Saved Successfully");



    closeAddressModal();



    loadAddress();



});



}







// =========================
// LOAD SAVED ADDRESS
// =========================


function loadAddress(){



const saved =
JSON.parse(
localStorage.getItem("novacartAddress")
);



if(!saved) return;



const box =
document.getElementById("savedAddresses");



if(box){


box.innerHTML = `


<div class="address-box active">


<div class="address-header">


<h3>

${saved.name}

</h3>


<i class="fa-solid fa-circle-check"></i>


</div>


<p>

${saved.address}

<br>

${saved.city}, ${saved.state}

<br>

Phone: ${saved.phone}

</p>



</div>


`;



}



}



loadAddress();






// =========================
// PLACE ORDER
// =========================


const checkoutForm =
document.getElementById("checkout-form");



if(checkoutForm){



checkoutForm.addEventListener(
"submit",
async function(e){


e.preventDefault();



try{


const token =
localStorage.getItem("token");



if(!token){


alert("Please login first!");

window.location.href="login.html";

return;


}




if(cart.length===0){


alert("Your cart is empty");

window.location.href="cart.html";

return;


}





const items =
cart.map(product=>({

    product_id:product.id,

    quantity:product.quantity

}));





const response =
await fetch(
`${API_BASE_URL}/api/orders`,
{


method:"POST",


headers:{


"Content-Type":"application/json",


"Authorization":
`Bearer ${token}`


},



body:JSON.stringify({

items

})


});





if(response.status===401){


localStorage.removeItem("token");

localStorage.removeItem("user");


alert("Session expired");


window.location.href="login.html";


return;


}





const data =
await response.json();




if(response.ok){



alert("🎉 Order Placed Successfully!");



localStorage.removeItem("cart");



window.location.href=
"order-success.html";



}else{


alert(data.message);


}





}
catch(error){


console.log(error);


alert("Server Error");


}



});



}