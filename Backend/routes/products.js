const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ==========================================================
// Get All Products
// ==========================================================
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM products ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get products error:", error.message);
        res.status(500).json({
            message: "Server Error",
        });
    }
});

// ==========================================================
// Get Single Product By ID
// ==========================================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const result = await db.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get product error:", error.message);
        res.status(500).json({
            message: "Server Error",
        });
    }
});

// ==========================================================
// NOTE: Creating and deleting products used to be exposed here
// with no authentication at all — anyone could add or delete
// catalog products. Those operations now live exclusively behind
// authMiddleware + requireAdmin in routes/admin.js
// (POST/PUT/DELETE /api/admin/products). This public router stays
// read-only, which is all the storefront needs.
// ==========================================================

module.exports = router;
