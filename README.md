# FoodShare AI 🍃

An intelligent, real-time logistics and proximity-matching platform designed to reduce edible food waste by redirecting business surplus to local food banks, shelters, and soup kitchens.

## Core Stack
- **Frontend**: React (v19) + Vite, Tailwind CSS (v3)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose Schema & Models)
- **Authentication**: JWT (JSON Web Tokens) with route guards

---

## Folder Structure

```text
├── frontend/           # React + Vite client app
├── backend/            # Express REST API server
├── database/           # MongoDB configuration, seeds, and Docker specs
└── docs/               # Technical API documentation
```

---

## Quickstart

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and optionally **Docker** installed.

### 2. Start Database
If you have Docker:
```bash
cd database
docker-compose up -d
```
Otherwise, make sure a local MongoDB service is running on `mongodb://localhost:27017/foodshare`.

### 3. Seed Database
Populate initial accounts and listings:
```bash
npm run seed
```
**Default Seed Accounts:**
- **Donor Account**: `donor@foodshare.com` / `password123`
- **Charity Account**: `charity@foodshare.com` / `password123`

### 4. Install & Launch Environment
Install all dependencies (frontend, backend, database) in one step:
```bash
npm run install-all
```

Start the React client and Express API concurrently:
```bash
npm run dev
```

The application will launch on:
- **Client**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **API Reference Docs**: Navigate to [http://localhost:5173/docs](http://localhost:5173/docs) or view `docs/API_DOCUMENTATION.md`
