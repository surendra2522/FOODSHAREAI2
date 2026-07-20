# FoodShare AI — Developer Documentation

FoodShare AI is an intelligent logistics and routing platform that matches surplus edible food from donors with charities.

## Folder Structure Overview

```text
AI-Food-Redistribution/
├── backend/            # Express.js REST Server API
│   ├── config/         # DB Connection managers
│   ├── middleware/     # JWT security layers
│   ├── models/         # MongoDB Mongoose schemas
│   ├── routes/         # Auth & Logistics routing endpoints
│   └── server.js       # Express server bootloader
├── database/           # MongoDB configuration and seeds
│   ├── docker-compose.yml # Local Mongo service configuration
│   ├── seed.js         # Seed database entries
│   └── package.json    # Seed script launchpad
├── docs/               # Technical specs and documents
│   └── API_DOCUMENTATION.md
└── frontend/           # Vite + React Client App
    ├── public/
    └── src/            # Components, Contexts, Pages and Utilities
```

---

## 1. Authentication Specs

All authenticated transactions pass through a signed JSON Web Token (JWT) injected in the `Authorization` header.

### Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user. Returns JWT and user object. |
| `POST` | `/api/auth/login` | Public | Verify user credentials. Returns JWT. |
| `GET` | `/api/auth/me` | Private | Retrieve profile payload for authenticated token session. |

---

## 2. Redistribution Logistics Specs

Core routing system matches donors and active food-banks using proximity and carbon-telemetry.

### Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donations` | Private | Retrieves available listings (Charity sees available, Donor sees all). |
| `POST` | `/api/donations` | Private (Donor) | Submits a new surplus food item listing. |
| `PUT` | `/api/donations/:id/claim` | Private (Charity) | Claims an available food item, changing status to `claimed`. |
| `GET` | `/api/donations/stats` | Private | Aggregates environmental CO₂ offsets and saved weight metrics. |

---

## 3. Local Environment Quickstart

To boot up the project from scratch, follow these instructions:

### A. Run Database (Docker Compose)
If you have Docker installed:
```bash
cd database
docker-compose up -d
npm install
npm run seed
```

### B. Run Backend API
```bash
cd backend
npm install
npm run dev
```

### C. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```

Your React + Vite client will open on [http://localhost:5173](http://localhost:5173) and link with the server on [http://localhost:5000](http://localhost:5000).
