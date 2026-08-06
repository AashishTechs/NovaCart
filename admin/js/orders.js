// =========================
// Orders Management
// =========================

const table = document.getElementById("ordersTable");

let orders = [];


// =========================
// Load Orders
// =========================

async function loadOrders(){

    try{

        const response = await fetch(
            `${API_BASE_URL}/api/admin/orders`,
            {
                headers:{
                    "Authorization":
                    "Bearer " + localStorage.getItem("token")
                }
            }
        );


        if(!response.ok){
            throw new Error("Failed to fetch orders");
        }


        orders = await response.json();

        displayOrders(orders);


    }
    catch(error){

        console.error(error);

        alert("Failed to load orders");

    }

}



// =========================
// Status Badge
// =========================

function statusBadge(status){


    let className = "";


    switch(status){

        case "Pending":
            className="pending";
            break;


        case "Processing":
            className="processing";
            break;


        case "Shipped":
            className="shipped";
            break;


        case "Delivered":
            className="delivered";
            break;


        case "Cancelled":
            className="cancelled";
            break;


        default:
            className="pending";

    }



    return `
    <span class="status ${className}">
        ${status}
    </span>
    `;


}




// =========================
// Display Orders
// =========================


function displayOrders(data){


    if(!table) return;


    table.innerHTML="";



    if(data.length===0){

        table.innerHTML=`

        <tr>
        <td colspan="6">
        No Orders Found
        </td>
        </tr>

        `;

        return;

    }




    table.innerHTML=data.map(order=>{


        return `

        <tr>


        <td>
        #${order.id}
        </td>



        <td>
        ${order.customer}
        </td>



        <td>
        $${Number(order.total_amount).toFixed(2)}
        </td>



        <td>

        ${statusBadge(order.status)}

        <br>


        <select 
        onchange="changeStatus(${order.id},this.value)">

            <option value="">
            Change
            </option>

            <option>
            Pending
            </option>

            <option>
            Processing
            </option>

            <option>
            Shipped
            </option>

            <option>
            Delivered
            </option>

            <option>
            Cancelled
            </option>

        </select>


        </td>




        <td>
        ${new Date(order.created_at)
        .toLocaleDateString()}
        </td>



        <td>


        <button onclick="viewOrder(${order.id})">
        👁 View
        </button>



        <button onclick="deleteOrder(${order.id})">
        🗑 Delete
        </button>


        </td>



        </tr>

        `;


    }).join("");

}



// =========================
// Change Status
// =========================


async function changeStatus(id,status){


    if(!status) return;


    try{


        const response = await fetch(

            `${API_BASE_URL}/api/admin/orders/${id}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json",

                    "Authorization":
                    "Bearer " + localStorage.getItem("token")

                },


                body:JSON.stringify({

                    status:status

                })

            }

        );



        if(!response.ok){

            throw new Error("Update failed");

        }



        alert(
        "Order status updated"
        );


        loadOrders();


    }
    catch(error){

        console.error(error);

        alert(
        "Failed to update status"
        );

    }


}




// =========================
// Delete Order
// =========================


async function deleteOrder(id){


    if(!confirm(
        "Delete this order?"
    )) return;



    try{


        const response = await fetch(

        `${API_BASE_URL}/api/admin/orders/${id}`,

        {

            method:"DELETE",

            headers:{

                "Authorization":
                "Bearer " + localStorage.getItem("token")

            }

        }

        );



        if(!response.ok){

            throw new Error();

        }


        alert(
        "Order deleted"
        );


        loadOrders();



    }
    catch(error){

        alert(
        "Delete failed"
        );

    }


}




// =========================
// View Order
// =========================


function viewOrder(id){

    alert(
        "Order Details Coming Soon\nOrder ID: "+id
    );

}




// =========================
// Search
// =========================


const searchOrder =
document.getElementById("searchOrder");


if(searchOrder){


searchOrder.addEventListener(
"keyup",
function(){


let value=this.value.toLowerCase();



let filtered=orders.filter(order=>{


return (

order.customer
.toLowerCase()
.includes(value)

||

order.id
.toString()
.includes(value)

);


});


displayOrders(filtered);



});


}




// =========================
// Start
// =========================


loadOrders();