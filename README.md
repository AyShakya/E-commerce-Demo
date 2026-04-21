# E-commerce Demo

A full-stack e-commerce application built with a React + Vite frontend and an Express + MongoDB backend. The project covers the complete shopping flow: browsing products, product details, cart management, checkout, online payments, order tracking, and an admin panel for product and order operations.

## Overview

This project is designed as a practical e-commerce system with both customer-facing and admin-facing features. The frontend is a modern single-page app with protected routes for authenticated users, while the backend exposes REST APIs for authentication, catalog management, cart operations, order processing, payments, refunds, and admin reporting.

The application is organized so it can be used as a portfolio project, a resume project, or a base for a production-style storefront.

## Key Features

- User registration, login, logout, and token refresh
- Protected customer dashboard, cart, and checkout pages
- Product listing, product details, and catalog browsing
- Cart add, update, remove, and clear actions
- Razorpay payment integration for checkout
- Order creation, order history, and order detail access
- Admin dashboard with product management and order status control
- Refund handling and payment logging for operational visibility
- Cloudinary image uploads for product media
- MongoDB persistence with Mongoose models
- Security middleware including CORS, Helmet, rate limiting, and cookie-based auth

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Razorpay payments
- Cloudinary uploads
- Multer file handling
- Nodemailer for email flows
- Rate limiting, Helmet, and cookie parsing

## Project Structure

```text
backend/
  app.js                # Express app setup, middleware, and routes
  server.js             # Server bootstrap and database connection
  src/
    config/             # MongoDB and Cloudinary configuration
    controllers/        # Business logic for auth, products, orders, payments, admin, users
    middlewares/        # Auth, validation, upload, and error handling
    models/             # Mongoose schemas
    routes/             # API route definitions
    services/           # Payment and token services
    utils/              # Helpers, categories, validation, and rate limiting
    workers/            # Background jobs such as reservation expiry

frontend/
  src/
    api/                # Axios wrappers and API modules
    components/         # Shared UI building blocks
    context/            # Authentication context
    hooks/              # Reusable hooks
    pages/              # Public, auth, user, and admin pages
```

## Frontend Pages

- `/` Home
- `/products` Product listing
- `/products/:id` Product details
- `/contact` Contact page
- `/login` Login
- `/register` Register
- `/cart` Protected cart page
- `/checkout` Protected checkout flow
- `/dashboard` Protected user dashboard

## Backend API Highlights

- `POST /api/auth/register` Register a user
- `POST /api/auth/login` Log in
- `POST /api/auth/logout` Log out
- `POST /api/auth/refresh` Refresh access token
- `GET /api/products` Get all products
- `GET /api/products/:id` Get a product by ID
- `GET /api/cart` Get current cart
- `POST /api/cart/add` Add item to cart
- `POST /api/payments/create` Create a payment order
- `POST /api/payments/webhook` Handle Razorpay webhook events
- `GET /api/orders/my` Get the current user’s orders
- `GET /api/admin/summary` Get admin dashboard summary

## Setup

### Prerequisites

- Node.js 18+ recommended
- MongoDB database
- Cloudinary account
- Razorpay test or live credentials

### Backend Installation

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the required variables:

```env
CLIENT_URL=http://localhost:5173
PORT=4000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend Installation

```bash
cd frontend
npm install
```

## Running the Project

### Start Backend

```bash
cd backend
npm start
```

The server starts from `server.js` and connects to MongoDB before listening on the configured port.

### Start Frontend

```bash
cd frontend
npm run dev
```

The Vite app usually runs on `http://localhost:5173`.

## Available Scripts

### Backend

- `npm start` Run the backend with Nodemon

### Frontend

- `npm run dev` Start the Vite development server
- `npm run build` Build for production
- `npm run lint` Run ESLint
- `npm run preview` Preview the production build

## Why This Project Stands Out

- End-to-end commerce flow from product discovery to paid order placement
- Role-based access with customer and admin experiences
- Real payment integration instead of a mocked checkout only
- Clean separation of controllers, routes, services, and models
- Production-style security and operational middleware
- Suitable as a resume project because it demonstrates full-stack architecture, API design, payment integration, and admin workflow implementation

## Notes

- Do not commit real secrets to version control.
- If you need a public deployment, update `CLIENT_URL` and any allowed CORS origins accordingly.
- The frontend README in `frontend/` is still the default Vite template; this root README is the project-level documentation.
