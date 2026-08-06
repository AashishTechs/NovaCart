// Auth guard + logout are handled globally by admin-auth.js and
// logout.js (included before this file on dashboard.html).

const token = localStorage.getItem("token");

// Load Dashboard Data

async function loadDashboard(){

    try{

        const response = await fetch(

            `${API_BASE_URL}/api/admin/dashboard`,

            {

                headers:{

                    "Authorization":
                    "Bearer " + token

                }

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            console.log(data.message);
            return;

        }

        const users =
        document.getElementById(
            "totalUsers"
        );

        const products =
        document.getElementById(
            "totalProducts"
        );

        const orders =
        document.getElementById(
            "totalOrders"
        );

        const revenue =
        document.getElementById(
            "totalRevenue"
        );

        if(users)
            users.textContent =
            data.totalUsers || 0;

        if(products)
            products.textContent =
            data.totalProducts || 0;

        if(orders)
            orders.textContent =
            data.totalOrders || 0;

        if(revenue)
            revenue.textContent =
            "$" + (data.totalRevenue || 0);

    }
    catch(error){

        console.log(
            "Dashboard Error:",
            error
        );

    }

}

loadDashboard();
