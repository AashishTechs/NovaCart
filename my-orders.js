const ordersContainer = document.getElementById("orders-container");

async function loadOrders() {

    const token = localStorage.getItem("token");

    if (!token) {

        ordersContainer.innerHTML = `
            <h2>Please <a href="login.html">log in</a> to view your orders.</h2>
        `;

        return;

    }

    try {

        // SECURITY FIX: the user used to be hardcoded to id 1, so every
        // logged-in visitor saw the same account's orders. The backend
        // now identifies the user from the JWT itself via /api/orders/my.
        const response = await fetch(
            `${API_BASE_URL}/api/orders/my`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            ordersContainer.innerHTML = `
                <h2>Your session has expired. Please <a href="login.html">log in</a> again.</h2>
            `;

            return;

        }

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await response.json();

        if (orders.length === 0) {

            ordersContainer.innerHTML = `
                <h2>No Orders Found</h2>
            `;

            return;

        }

        ordersContainer.innerHTML = "";

        orders.forEach(order => {

            const orderCard = document.createElement("div");
            orderCard.className = "order-card";

            const orderIdEl = document.createElement("h2");
            orderIdEl.textContent = `Order #${order.id}`;

            const totalEl = document.createElement("p");
            const totalLabel = document.createElement("strong");
            totalLabel.textContent = "Total: ";
            totalEl.appendChild(totalLabel);
            totalEl.appendChild(
                document.createTextNode(`$${Number(order.total_amount).toFixed(2)}`)
            );

            const statusEl = document.createElement("p");
            const statusLabel = document.createElement("strong");
            statusLabel.textContent = "Status: ";
            const statusSpan = document.createElement("span");
            statusSpan.className = "order-status";
            statusSpan.textContent = order.status;
            statusEl.appendChild(statusLabel);
            statusEl.appendChild(statusSpan);

            const dateEl = document.createElement("p");
            const dateLabel = document.createElement("strong");
            dateLabel.textContent = "Date: ";
            dateEl.appendChild(dateLabel);
            dateEl.appendChild(
                document.createTextNode(new Date(order.created_at).toLocaleString())
            );

            orderCard.appendChild(orderIdEl);
            orderCard.appendChild(totalEl);
            orderCard.appendChild(statusEl);
            orderCard.appendChild(dateEl);

            ordersContainer.appendChild(orderCard);

        });

    } catch (error) {

        console.log(error);

        ordersContainer.innerHTML = `
            <h2>Failed to load orders.</h2>
        `;

    }

}

loadOrders();
