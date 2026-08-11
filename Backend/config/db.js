const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Check your .env file.");
}
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err.message);
});

pool.connect()
    .then((client) => {
        console.log("Supabase Database Connected ✅");
        client.release();
    })
    .catch((error) => {
        console.log("Database Connection Error ❌", error.message);
    });

module.exports = pool;