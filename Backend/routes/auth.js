const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
        });
    }
    next();
};

// ==========================================================
// Register API
// ==========================================================
router.post(
    "/register",
    [
        body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name can contain only letters and spaces."),
        body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
        body("password")
    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage(
        "Password must contain uppercase, lowercase, number and special character."
    ),
    ],
    handleValidation,
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check existing user
            const existingUser = await db.query(
                "SELECT id FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    message: "User already exists",
                });
            }

            // Password hash
            const hashedPassword = await bcrypt.hash(password, 12);

            // Insert user
            const result = await db.query(
                `INSERT INTO users (name, email, password)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, email`,
                [name, email, hashedPassword]
            );

            res.status(201).json({
                message: "Registration successful",
                user: result.rows[0],
            });
        } catch (error) {
            console.error("Register error:", error.message);
            res.status(500).json({
                message: "Server error",
            });
        }
    }
);

// ==========================================================
// Login API
// ==========================================================
router.post(
    "/login",
    [
        body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required."),
    ],
    handleValidation,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check user
            const result = await db.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            // Generic message on purpose — never reveal whether the email exists.
            const invalidCredsResponse = () =>
                res.status(400).json({ message: "Invalid Email or Password" });

            if (result.rows.length === 0) {
                return invalidCredsResponse();
            }

            const user = result.rows[0];

            // Compare Password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return invalidCredsResponse();
            }

            // Generate JWT Token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role || "user",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            res.json({
                message: "Login Successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error("Login error:", error.message);
            res.status(500).json({
                message: "Server Error",
            });
        }
    }
);

module.exports = router;
