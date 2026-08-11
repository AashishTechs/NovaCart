const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const header = req.header("Authorization");

        if (!header) {
            return res.status(401).json({
                message: "Access Denied. No Token Provided.",
            });
        }

        // Support both "Bearer <token>" and a raw token for backward compatibility.
        const token = header.startsWith("Bearer ") ? header.slice(7) : header;

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid Token" });
    }
};

// Restricts a route to users whose JWT payload has role === "admin".
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
};

module.exports = authMiddleware;
module.exports.requireAdmin = requireAdmin;
