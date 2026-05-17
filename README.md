# QuickDine

Smart QR-based restaurant ordering platform.

**Stack:** FastAPI · PostgreSQL · Next.js 15 · TypeScript · Tailwind · Zustand · WebSocket · Razorpay

## Quick Start

```bash
# 1. Clone and setup env files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 2. Start the full stack with Docker
docker-compose up -d

# 3. Seed the database (first run only)
cd backend && pip install -r requirements.txt && python seed.py

# 4. Open the app
# Customer: http://localhost:3000/?table=1
# Admin:    http://localhost:3000/admin  (admin / nova123)
```

## Local Development (without Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Features

| Customer | Admin |
|----------|-------|
| QR table detection | Live dashboard + WebSocket |
| Menu browse + search | Menu CRUD |
| Voice ordering (Web Speech API) | Kitchen display system |
| Cart + coupon + rewards | Order status management |
| Razorpay payment | Help request alerts + sound |
| Live order tracking (WebSocket) | Coupons & rewards config |
| Loyalty points | Premium members + custom pricing |
| Per-item ratings | Analytics + revenue charts |
| Waiter / help requests | QR code generation per table |

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL async URL |
| `SECRET_KEY` | JWT signing key (change in prod) |
| `RAZORPAY_KEY_ID` | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `FRONTEND_URL` | Used for QR code URLs |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL |
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key |
