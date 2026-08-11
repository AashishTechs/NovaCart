const express = require("express");
const { body, validationResult } = require("express-validator");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// Validation Handler
// ==========================================

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
        });
    }

    next();
};

// ==========================================
// Add New Address
// POST /api/address
// ==========================================

router.post(
    "/",
    authMiddleware,
    [
        body("full_name")
            .trim()
            .notEmpty()
            .withMessage("Full name is required."),

        body("phone")
            .matches(/^[6-9]\d{9}$/)
            .withMessage("Enter a valid 10-digit mobile number."),

        body("address_line1")
            .trim()
            .notEmpty()
            .withMessage("Address is required."),

        body("city")
            .trim()
            .notEmpty()
            .withMessage("City is required."),

        body("state")
            .trim()
            .notEmpty()
            .withMessage("State is required."),

        body("pincode")
            .matches(/^\d{6}$/)
            .withMessage("Enter a valid 6-digit pincode."),
    ],
    handleValidation,
    async (req, res) => {

        try {

            const user_id = req.user.id;

            const {
                full_name,
                phone,
                address_line1,
                address_line2,
                city,
                state,
                pincode,
                country,
            } = req.body;

            const result = await db.query(
                `INSERT INTO addresses
                (
                    user_id,
                    full_name,
                    phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    pincode,
                    country
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                RETURNING *`,
                [
                    user_id,
                    full_name,
                    phone,
                    address_line1,
                    address_line2 || null,
                    city,
                    state,
                    pincode,
                    country || "India",
                ]
            );

            res.status(201).json({
                message: "Address saved successfully.",
                address: result.rows[0],
            });

        } catch (error) {

            console.error("Add address error:", error.message);

            res.status(500).json({
                message: "Server Error",
            });

        }

    }
);

// ==========================================
// Get User Addresses
// GET /api/address
// ==========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const result = await db.query(
            `SELECT *
             FROM addresses
             WHERE user_id = $1
             ORDER BY is_default DESC, id DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Get addresses error:", error.message);

        res.status(500).json({
            message: "Server Error",
        });

    }

});

// ===== Part 2 starts below =====
// ==========================================
// Update Address
// PUT /api/address/:id
// ==========================================

router.put(
    "/:id",
    authMiddleware,
    [
        body("full_name").trim().notEmpty().withMessage("Full name is required."),
        body("phone").matches(/^[6-9]\d{9}$/).withMessage("Invalid phone number."),
        body("address_line1").trim().notEmpty().withMessage("Address is required."),
        body("city").trim().notEmpty().withMessage("City is required."),
        body("state").trim().notEmpty().withMessage("State is required."),
        body("pincode").matches(/^\d{6}$/).withMessage("Invalid pincode."),
    ],
    handleValidation,
    async (req, res) => {

        try {

            const { id } = req.params;

            const check = await db.query(
                "SELECT id FROM addresses WHERE id=$1 AND user_id=$2",
                [id, req.user.id]
            );

            if (check.rows.length === 0) {
                return res.status(404).json({
                    message: "Address not found.",
                });
            }

            const {
                full_name,
                phone,
                address_line1,
                address_line2,
                city,
                state,
                pincode,
                country,
            } = req.body;

            const result = await db.query(
                `UPDATE addresses
                 SET
                    full_name=$1,
                    phone=$2,
                    address_line1=$3,
                    address_line2=$4,
                    city=$5,
                    state=$6,
                    pincode=$7,
                    country=$8
                 WHERE id=$9 AND user_id=$10
                 RETURNING *`,
                [
                    full_name,
                    phone,
                    address_line1,
                    address_line2 || null,
                    city,
                    state,
                    pincode,
                    country || "India",
                    id,
                    req.user.id,
                ]
            );

            res.json({
                message: "Address updated successfully.",
                address: result.rows[0],
            });

        } catch (error) {

            console.error("Update address error:", error.message);

            res.status(500).json({
                message: "Server Error",
            });

        }

    }
);

// ==========================================
// Delete Address
// DELETE /api/address/:id
// ==========================================

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const result = await db.query(
            "DELETE FROM addresses WHERE id=$1 AND user_id=$2 RETURNING id",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Address not found.",
            });
        }

        res.json({
            message: "Address deleted successfully.",
        });

    } catch (error) {

        console.error("Delete address error:", error.message);

        res.status(500).json({
            message: "Server Error",
        });

    }

});

// ==========================================
// Set Default Address
// PUT /api/address/default/:id
// ==========================================

router.put("/default/:id", authMiddleware, async (req, res) => {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        await client.query(
            "UPDATE addresses SET is_default = false WHERE user_id = $1",
            [req.user.id]
        );

        const result = await client.query(
            `UPDATE addresses
             SET is_default = true
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Address not found.",
            });

        }

        await client.query("COMMIT");

        res.json({
            message: "Default address updated successfully.",
            address: result.rows[0],
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Default address error:", error.message);

        res.status(500).json({
            message: "Server Error",
        });

    } finally {

        client.release();

    }

});

module.exports = router;