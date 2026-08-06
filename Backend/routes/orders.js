const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }

    next();
};

// ==========================================================
// Create Order
// SECURITY: user_id comes from the verified JWT, never from the
// request body. Prices are looked up from the products table on
// the server — the client only supplies product_id + quantity —
// so a tampered cart in localStorage/devtools cannot change what
// gets charged.
// ==========================================================

router.post(
    "/",
    authMiddleware,
    [
        body("items")
            .isArray({ min: 1 })
            .withMessage("items are required."),
        body("items.*.product_id")
            .isInt({ gt: 0 })
            .withMessage("Each item needs a valid product_id."),
        body("items.*.quantity")
            .isInt({ gt: 0 })
            .withMessage("Each item needs a quantity greater than 0.")
    ],
    handleValidation,
    async (req, res) => {

        const user_id = req.user.id;
        const { items } = req.body;

        const client = await db.connect();

        try {

            await client.query("BEGIN");

            // Look up real, current prices & stock for every product in
            // the cart directly from the database — never trust client input.
            const productIds = items.map((item) => item.product_id);

            const productsResult = await client.query(
                `SELECT id, price, stock, name
                 FROM products
                 WHERE id = ANY($1::int[])`,
                [productIds]
            );

            const productsById = new Map(
                productsResult.rows.map((p) => [p.id, p])
            );

            let total_amount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = productsById.get(item.product_id);

                if (!product) {
                    throw Object.assign(
                        new Error(`Product ${item.product_id} not found`),
                        { status: 400 }
                    );
                }

                if (product.stock < item.quantity) {
                    throw Object.assign(
                        new Error(`Not enough stock for "${product.name}"`),
                        { status: 400 }
                    );
                }

                const price = Number(product.price);
                total_amount += price * item.quantity;

                orderItems.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    price
                });
            }

            const orderResult = await client.query(
                `INSERT INTO orders
                (user_id, total_amount)
                VALUES($1, $2)
                RETURNING *`,
                [user_id, total_amount]
            );

            const order = orderResult.rows[0];

            for (const item of orderItems) {

                await client.query(
                    `INSERT INTO order_items
                    (order_id, product_id, quantity, price)
                    VALUES($1, $2, $3, $4)`,
                    [order.id, item.product_id, item.quantity, item.price]
                );

                await client.query(
                    `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                    [item.quantity, item.product_id]
                );

            }

            await client.query("COMMIT");

            res.status(201).json({
                message: "Order created successfully",
                order
            });

        } catch (error) {

            await client.query("ROLLBACK");
            console.error("Create order error:", error.message);

            res.status(error.status || 500).json({
                message: error.status ? error.message : "Server Error"
            });

        } finally {

            client.release();

        }

    }
);

// ==========================================================
// Get Logged-In User's Orders
// Replaces the old "/:userId" route, which let anyone view any
// customer's order history just by guessing an ID. The user is
// now taken from the verified JWT, not the URL.
// ==========================================================

router.get("/my", authMiddleware, async (req, res) => {

    try {

        const result = await db.query(
            `SELECT *
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Get my orders error:", error.message);
        res.status(500).json({ message: "Server Error" });

    }

});

// ==========================================================
// Get Order Details (line items)
// Only the order's owner or an admin may view it.
// ==========================================================

router.get(
    "/details/:orderId",
    authMiddleware,
    [
        param("orderId")
            .isInt()
            .withMessage("Invalid Order ID")
    ],
    handleValidation,
    async (req, res) => {

        try {

            const { orderId } = req.params;

            const orderCheck = await db.query(
                "SELECT user_id FROM orders WHERE id = $1",
                [orderId]
            );

            if (orderCheck.rows.length === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            const isOwner = orderCheck.rows[0].user_id === req.user.id;
            const isAdmin = req.user.role === "admin";

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const result = await db.query(

                `SELECT
                    order_items.quantity,
                    order_items.price,
                    products.name,
                    products.image,
                    products.category

                FROM order_items

                JOIN products
                ON products.id = order_items.product_id

                WHERE order_items.order_id = $1`,

                [orderId]

            );

            res.json(result.rows);

        } catch (error) {

            console.error("Get order details error:", error.message);
            res.status(500).json({ message: "Server Error" });

        }

    }
);

module.exports = router;
