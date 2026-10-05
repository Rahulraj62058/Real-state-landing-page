# GharKhoj - Real Estate Portal (Full-Stack MERN)

A single full-stack real estate platform: one project, one server, one port. Express serves both the **REST API** and the **React (Vite) frontend** seamlessly.

**Tech Stack**: MongoDB (with fallback in-memory database), Express.js, React 18, Node.js, Vite.

---

## Quick Start

Requires **Node.js 18+**. No local MongoDB installation or pre-configuration needed for first run.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Auto-database**: If `MONGO_URI` is empty or unreachable, an in-memory MongoDB server spins up automatically and seeds realistic demo listings and accounts.
- **Persistent database (optional)**: Set your MongoDB / Atlas connection string in `.env` and run `npm run seed` once to populate initial data.
- **Production mode**: Run `npm start` (builds the React frontend and serves everything via Express).

---

## Demo Accounts

Pre-seeded accounts ready to use (also available as quick-fill buttons on the login page):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@portal.test` | `admin123` | Listing approval/rejection, user management, global inquiry access |
| **Owner** | `owner@portal.test` | `owner123` | Create & manage property listings, receive customer inquiries |
| **User** | `user@portal.test` | `user123` | Search & filter properties, save favorites, contact owners |

---

## Features

- **Property Listings & Discovery**: Filter by city, listing type (Buy / Rent), property type (Apartment, House, Villa, Plot, Commercial), price range, and bedrooms.
- **Interactive Search**: Real-time keyword search across title, address, and city.
- **Favorites System**: Save and remove listings with optimistic updates, tracked per user.
- **Inquiry & Lead Capture**: Contact owners directly with inquiry forms; messages are routed to owners and visible in the admin inbox.
- **Owner Dashboard**: Add, edit, and delete properties; view incoming customer inquiries.
- **Admin Panel**:
  - Review submitted listings (Approve / Reject / Delete).
  - Manage user accounts and change user roles (`user`, `owner`, `admin`).
  - View overall platform metrics and incoming messages.
- **Security & RBAC**: JWT authentication with password hashing via `bcryptjs`, role-based route guards, and Mongoose schema validation.

---

## Project Structure

```text
├── package.json         # Project scripts and dependencies
├── vite.config.js       # Vite configuration
├── index.html           # HTML entry point
├── .env.example         # Template for environment variables
├── .env                 # Local environment variables
├── .gitignore           # Git ignore rules
├── server/
│   ├── server.js        # Express app, Vite integration, DB bootstrap
│   ├── seed.js          # Standalone database seed script
│   ├── seedData.js      # Seed dataset (users, properties, inquiries)
│   ├── middleware/
│   │   └── auth.js      # JWT authentication and role authorization
│   ├── models/
│   │   ├── User.js      # User schema, auth, password hashing
│   │   ├── Property.js  # Property schema and indexes
│   │   └── Inquiry.js   # Inquiry / contact message schema
│   └── routes/
│       ├── auth.js      # Register, login, current user (/api/auth)
│       ├── properties.js# Browse, search, CRUD (/api/properties)
│       ├── favorites.js # User favorites (/api/favorites)
│       ├── inquiries.js # Contact owner and received messages (/api/inquiries)
│       └── admin.js     # Admin metrics and management (/api/admin)
└── src/
    ├── main.jsx         # React DOM root with BrowserRouter & AuthProvider
    ├── App.jsx          # Header navigation and route definitions
    ├── AuthContext.jsx  # Authentication and user state management
    ├── api.js           # API fetch client with JWT authorization
    ├── util.js          # Price formatters and SVG placeholder fallback
    ├── styles.css       # Complete application styling
    ├── components/
    │   └── PropertyCard.jsx # Property card component
    └── pages/
        ├── Home.jsx         # Search and filter listings
        ├── PropertyDetail.jsx # Property gallery, specs, contact form
        ├── Auth.jsx         # Sign in and sign up page
        ├── Favorites.jsx    # Saved listings page
        ├── Dashboard.jsx    # Owner listings and inquiry inbox
        └── Admin.jsx        # Admin dashboard and moderation
```

---

## Available Scripts

- `npm run dev`: Starts the development server with live reload on server changes.
- `npm run build`: Bundles the React application with Vite into the `dist/` folder.
- `npm start`: Builds the production bundle and starts the production server.
- `npm run seed`: Populates the configured MongoDB database with sample users and listings.
