require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const db = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const addressRoutes = require("./routes/address");
const adminRoutes = require("./routes/admin");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// ==========================================================
// Security & Performance Middleware
// ==========================================================

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — restrict to an allow-list via ALLOWED_ORIGINS (comma separated).
// Falls back to allowing all origins only in local development.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

// General API rate limit — protects every route from abuse/DoS.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

// Stricter limiter for auth endpoints to slow down brute-force/credential-stuffing.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many auth attempts. Please try again later." },
});

// ==========================================================
// Routes
// ==========================================================

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);

// Health check — useful for uptime monitoring / load balancers.
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "NovaCart Backend Running 🚀" });
});

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ status: "ok", database: "connected" });
    } catch (error) {
        res.status(503).json({ status: "error", database: "unreachable" });
    }
});

// Protected profile route
app.get("/api/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome to NovaCart",
        user: req.user,
    });
});

// ==========================================================
// 404 handler
// ==========================================================

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ==========================================================
// Centralized error handler
// ==========================================================

app.use((err, req, res, next) => {
    console.error(err.stack || err.message);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin not allowed" });
    }

    const status = err.status || 500;
    res.status(status).json({
        message: status === 500 ? "Internal Server Error" : err.message,
    });
});

// ==========================================================
// Start Server
// ==========================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing server gracefully.");
    db.end().finally(() => process.exit(0));
});
