# TMTC Travel Itinerary API

---

## Tech Stack

- **Node.js + Express.js** – REST API framework
- **MongoDB + Mongoose** – Database & ORM
- **JWT** – Authentication
- **Redis / Node-cache** – Caching
- **Swagger** – API documentation

---

## Local Setup & Run

### Clone and Install

```bash
git clone <repo-url>
cd tmtc-backend-assignment
npm install
```

### Configure Environment

Create a `.env` file:

```env
PORT=4000
MONGO_URI=mongodb://mongo:27017/tmtc
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
SHARE_BASE_URL=http://localhost:4000/api/itineraries/share
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
EMAIL_FROM="TMTC Travel <your_email@example.com>"
NODE_ENV=development
SWAGGER_SERVER=http://localhost:4000
```

---

## Docker Setup

The project includes a `Dockerfile` and `docker-compose.yml` to run the backend and database services.

### Start Services

```bash
docker compose up -d
```

- Starts **Node.js backend**, **MongoDB**, and optionally **Redis** in detached mode.

### Stop & Remove Services

```bash
docker compose down -v
```

- Stops all containers and removes volumes (useful to reset the database).

### Access

- API: `http://localhost:4000/api`
- Swagger docs: `http://localhost:4000/api/docs`

> Make sure your `.env` file matches the `docker-compose.yml` environment variables.

---

## Testing

Run automated Jest + Supertest tests:

```bash
npm run test
```

---

## Features

- [x] User Register/Login (JWT Auth)
- [x] Create / Read / Update / Delete Itineraries
- [x] Filter by destination
- [x] Pagination & Sorting
- [x] Caching for faster reads
- [x] Swagger API Docs
- [x] Rate limiting
- [x] API Docs using swagger
- [x] Email Notification using nodemailer
