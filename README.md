# NovaCart 🛍️

A full-stack e-commerce web app with a premium dark & gold themed storefront, a wishlist, cart, checkout flow, and a complete admin panel — backed by an Express + PostgreSQL (Supabase) REST API.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

## ✨ Features

**Storefront**
- Home page with hero banner and featured products
- Full shop page with search and filtering
- Product details page
- Wishlist (persisted in `localStorage`, synced with live product data)
- Shopping cart and multi-step checkout
- Order history ("My Orders")
- User registration and login (JWT-based)

**Admin Panel**
- Secure admin login, protected by role-based JWT auth
- Dashboard with sales/orders overview
- Product management (create, edit, delete)
- Order management
- User management
- Profile and password settings

**Backend API**
- REST API built with Express 5
- PostgreSQL via Supabase
- JWT authentication with role-based access control (`user` / `admin`)
- Input validation with `express-validator`
- Security middleware: `helmet`, `cors` allow-list, rate limiting (`express-rate-limit`)
- Centralized error handling and health-check endpoint

## 🗂️ Project Structure

```
Novacart/
├── index.html, products.html, cart.html, checkout.html, ...   # Storefront pages
├── style.css                                                  # Shared storefront styling
├── config.js                                                  # Frontend API base URL config
├── script.js, cart.js, products.js, wishlist.js, ...          # Storefront logic
├── admin/                                                      # Admin panel (separate mini-app)
│   ├── css/admin.css
│   ├── js/
│   └── *.html
├── images/                                                     # Product & category images
└── Backend/
    ├── server.js                                               # Express entry point
    ├── config/db.js                                            # PostgreSQL connection pool
    ├── middleware/authMiddleware.js                            # JWT auth + admin guard
    └── routes/
        ├── auth.js                                             # /api/auth
        ├── products.js                                         # /api/products
        ├── orders.js                                           # /api/orders
        └── admin.js                                            # /api/admin
```

## 🛠️ Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript |
| Backend   | Node.js, Express 5 |
| Database  | PostgreSQL (Supabase) |
| Auth      | JSON Web Tokens (`jsonwebtoken`), `bcrypt` for password hashing |
| Security  | `helmet`, `cors`, `express-rate-limit`, `express-validator` |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) (or any PostgreSQL) database

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/novacart.git
cd novacart
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/` (use `.env.example` as a reference if present):

```env
PORT=5000
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=a_long_random_secret
ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
NODE_ENV=development
```

Start the backend:
```bash
npm start
```
The API runs at `http://localhost:5000`. Check `http://localhost:5000/health` to confirm the database connection.

### 3. Frontend setup
The frontend is static HTML/CSS/JS — no build step needed.

- Open the project root with a static server (e.g. VS Code **Live Server** extension) so `index.html` runs on something like `http://127.0.0.1:5500`.
- Confirm `config.js` (in the project root and in `admin/js/`) points to your backend:
  ```js
  const API_BASE_URL = "http://localhost:5000";
  ```

### 4. Admin access
Visit `admin/login.html` and sign in with an account whose role is `admin` in the database.

## 🔐 Environment Variables

| Variable | Description |
|----------|--------------|
| `PORT` | Port the Express server listens on |
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `JWT_SECRET` | Secret used to sign/verify JWTs |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed by CORS |
| `NODE_ENV` | `development` or `production` |

> ⚠️ Never commit your real `.env` file. Add it to `.gitignore` before pushing to GitHub.

## 📡 API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | `/api/auth/register` | Create a new user | — |
| POST | `/api/auth/login` | Log in, returns a JWT | — |
| GET | `/api/products` | List all products | — |
| GET | `/api/products/:id` | Get a single product | — |
| POST | `/api/orders` | Place an order | User |
| GET | `/api/orders/my` | Get the logged-in user's orders | User |
| GET | `/api/orders/details/:orderId` | Get line items for an order | User / Admin |
| GET | `/api/admin/dashboard` | Admin dashboard stats | Admin |
| GET/POST/PUT/DELETE | `/api/admin/products` | Manage products | Admin |
| GET/PUT/DELETE | `/api/admin/orders` | Manage orders | Admin |
| GET/PUT/DELETE | `/api/admin/users` | Manage users | Admin |
| GET | `/health` | Health check | — |

## 📦 Deployment Notes

- The frontend can be deployed as static files (Netlify, Vercel, GitHub Pages, etc.) — just update `API_BASE_URL` in `config.js` to your production API URL.
- The backend can be deployed to any Node host (Render, Railway, Fly.io, etc.). Set the environment variables listed above in your host's dashboard.
- Make sure `ALLOWED_ORIGINS` includes your deployed frontend URL, or the API will reject requests with a CORS error.

## 📄 License

ISC
