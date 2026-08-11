const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/authMiddleware");

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
};

const productValidation = [
    body("name").trim().notEmpty().withMessage("Product name is required."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0."),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative number."),
    body("image").trim().notEmpty().withMessage("Image is required."),
    body("description").trim().notEmpty().withMessage("Description is required.")
];

// =========================
// Admin Authentication
// =========================

router.use(authMiddleware, requireAdmin);

// =========================
// Admin Dashboard
// =========================

router.get("/dashboard", async (req, res) => {

    try {

        const users = await db.query(
            "SELECT COUNT(*) FROM users"
        );

        const products = await db.query(
            "SELECT COUNT(*) FROM products"
        );

        const orders = await db.query(
            "SELECT COUNT(*) FROM orders"
        );

        const revenue = await db.query(
            `
            SELECT COALESCE(SUM(total_amount),0) AS revenue
            FROM orders
            `
        );

        res.json({

            totalUsers: Number(users.rows[0].count),

            totalProducts: Number(products.rows[0].count),

            totalOrders: Number(orders.rows[0].count),

            totalRevenue: Number(revenue.rows[0].revenue)

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// =========================
// Get All Users
// =========================

router.get("/users", async (req, res) => {

    try {

        const result = await db.query(

            `
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            ORDER BY id ASC
            `

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load users"
        });

    }

});

// =========================
// Update User Role
// =========================

router.put("/users/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { role } = req.body;

        if (!role || !["admin", "user"].includes(role)) {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        const result = await db.query(

            `
            UPDATE users
            SET role = $1
            WHERE id = $2
            RETURNING id,name,email,role
            `,

            [role, id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json({

            message: "Role updated successfully",
            user: result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});


// =========================
// Delete User
// =========================

router.delete("/users/:id", async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        await client.query("BEGIN");

        // Check user exists
        const user = await client.query(
            "SELECT id FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "User not found"
            });

        }

        // Delete order items
        await client.query(

            `
            DELETE FROM order_items
            WHERE order_id IN (
                SELECT id
                FROM orders
                WHERE user_id = $1
            )
            `,

            [id]

        );

        // Delete orders
        await client.query(

            `
            DELETE FROM orders
            WHERE user_id = $1
            `,

            [id]

        );

        // Delete user
        await client.query(

            `
            DELETE FROM users
            WHERE id = $1
            `,

            [id]

        );

        await client.query("COMMIT");

        res.json({

            message: "User deleted successfully"

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Delete User Error:", error);

        res.status(500).json({

            message: error.message,
            detail: error.detail,
            code: error.code

        });

    } finally {

        client.release();

    }

});

// =========================
// Get All Products
// =========================

router.get("/products", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT *
            FROM products
            ORDER BY id ASC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load products"
        });

    }

});


// =========================
// Add Product
// =========================

router.post("/products", productValidation, handleValidation, async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            image,
            category,
            stock
        } = req.body;

        const result = await db.query(

            `
            INSERT INTO products
            (
                name,
                description,
                price,
                image,
                category,
                stock
            )

            VALUES($1,$2,$3,$4,$5,$6)

            RETURNING *
            `,

            [
                name,
                description,
                Number(price),
                image,
                category,
                Number(stock)
            ]

        );

        res.status(201).json({

            message: "Product Added Successfully",

            product: result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to add product"
        });

    }

});


// =========================
// Update Product
// =========================

router.put("/products/:id", productValidation, handleValidation, async (req, res) => {

    try {

        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const {

            name,
            description,
            price,
            image,
            category,
            stock

        } = req.body;

        const result = await db.query(

            `
            UPDATE products

            SET

            name=$1,
            description=$2,
            price=$3,
            image=$4,
            category=$5,
            stock=$6

            WHERE id=$7

            RETURNING *

            `,

            [

                name,
                description,
                Number(price),
                image,
                category,
                Number(stock),
                id

            ]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.json({

            message: "Product Updated Successfully",

            product: result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update product"
        });

    }

});


// =========================
// Delete Product
// =========================

router.delete("/products/:id", async (req, res) => {

    try {

        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const result = await db.query(

            `
            DELETE FROM products
            WHERE id=$1
            RETURNING *
            `,

            [id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        res.json({

            message: "Product Deleted Successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to delete product"

        });

    }

});

// =========================
// Get All Orders
// =========================

router.get("/orders", async (req, res) => {

    try {

        const result = await db.query(

            `
            SELECT
                o.id,
                u.name AS customer,
                u.email,
                o.total_amount,
                o.status,
                o.created_at
            FROM orders o
            JOIN users u
            ON o.user_id = u.id
            ORDER BY o.id DESC
            `

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load orders"
        });

    }

});


// =========================
// Update Order Status
// =========================

router.put("/orders/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(

            `
            UPDATE orders
            SET status = $1
            WHERE id = $2
            RETURNING *
            `,

            [status, id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        res.json({

            message: "Order status updated successfully",
            order: result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update order"
        });

    }

});


// =========================
// Delete Order
// =========================

router.delete("/orders/:id", async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        await client.query("BEGIN");

        // Delete order items
        await client.query(

            `
            DELETE FROM order_items
            WHERE order_id = $1
            `,

            [id]

        );

        // Delete order
        const result = await client.query(

            `
            DELETE FROM orders
            WHERE id = $1
            RETURNING *
            `,

            [id]

        );

        if (result.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Order not found"
            });

        }

        await client.query("COMMIT");

        res.json({

            message: "Order deleted successfully"

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    } finally {

        client.release();

    }

});


// =========================
// Export Router
// =========================

module.exports = router;