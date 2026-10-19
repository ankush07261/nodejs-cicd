# SkyCast & Admin Management Fullstack Application

A complete fullstack application featuring **React (Vite)** on the frontend, **Node.js (Express MVC)** on the backend, and **PostgreSQL** database, secured with **JWT Authentication** and **Role-Based Access Control (RBAC)**.

---

## 🚀 Architecture & Flow
```
React (Vite) [Port: 5173]
       │
   HTTP Requests (Bearer JWT)
       ▼
Node.js Express MVC [Port: 5000]
       │
    pg Driver
       ▼
PostgreSQL Database (`weather_fullstack_db`) [Port: 5432]
```

- **Frontend never talks to PostgreSQL directly**: Only the Node.js backend connects to PostgreSQL using the `pg` pool.
- **Role-Based Access**:
  - `admin`: Can view live weather analytics AND access the **Users Management (CRUD)** console.
  - `user`: Can view only the **Weather** analytics dashboard.

---

## 🔑 Pre-seeded Credentials
- **Admin**: `admin` / `admin` (Role: `admin`)
- **Users**: `user1` / `user1` through `user50` / `user50` (Role: `user`)

---

## 🛠️ How to Run the Application

### 1. Start the Backend Server (Port 5000)
```powershell
# From root directory:
npm run dev:server

# Or navigate to server/:
cd server
npm run dev
```

### 2. Start the Frontend Application (Port 5173)
```powershell
# From root directory:
npm run dev:client

# Or navigate to client/:
cd client
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 📡 Postman API Reference & Test Guide

### Base URL: `http://localhost:5000/api`

### 1. Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Headers**: None

---

### 2. Login (Generate JWT Token)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (`raw` JSON):
```json
{
  "username": "admin",
  "password": "admin"
}
```
> **Tip for Postman**: Copy the returned `token` from the response to use in the Authorization header for protected requests.

---

### 3. Get Current User Profile (`/auth/me`)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/me`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_JWT_TOKEN_HERE>`

---

### 4. Get Users with Pagination & Filter (Admin Only)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/users?page=1&limit=10&search=&role=`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_ADMIN_TOKEN_HERE>`
- **Query Parameters (optional)**:
  - `page`: Page number (e.g. `1`, `2`)
  - `limit`: Records per page (e.g. `10`, `25`)
  - `search`: Filter by username (e.g. `user5`)
  - `role`: Filter by role (`admin` or `user`)

> **Note**: If you call this endpoint with a regular user token (e.g. `user1`), it returns `403 Forbidden`.

---

### 5. Get User by ID (Admin Only)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/users/1`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_ADMIN_TOKEN_HERE>`

---

### 6. Create New User (Admin Only)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/users`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_ADMIN_TOKEN_HERE>`
  - `Content-Type: application/json`
- **Body** (`raw` JSON):
```json
{
  "username": "user51",
  "password": "user51",
  "role": "user"
}
```

---

### 7. Update User (Admin Only)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/users/52`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_ADMIN_TOKEN_HERE>`
  - `Content-Type: application/json`
- **Body** (`raw` JSON):
```json
{
  "username": "user51_updated",
  "password": "newpassword123",
  "role": "user"
}
```
*(Password is optional. If omitted, existing password is preserved).*

---

### 8. Delete User (Admin Only)
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/users/52`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_ADMIN_TOKEN_HERE>`

---

## 🐳 Running with Docker & Docker Compose

Run the entire full-stack application (PostgreSQL + Express Backend + React Frontend) with a single command:

```powershell
# Build and start all services in detached mode
docker compose up -d --build

# View logs for all running services
docker compose logs -f

# Check container status
docker compose ps

# Seed initial database users (admin + user1-50) inside the server container
docker compose exec server npm run seed

# Stop all services and containers
docker compose down

# Stop and remove persistent database volumes (clean reset)
docker compose down -v
```

### Exposed Endpoints via Docker:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **PostgreSQL Database**: `localhost:5432`

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The repository includes an automated CI/CD pipeline located in `.github/workflows/ci-cd.yml`:

1. **Backend CI**:
   - Tests and validates Node.js 22 syntax and dependencies.
2. **Frontend CI**:
   - Compiles and builds the production React (Vite) bundle.
3. **Docker Images Validation**:
   - Validates `docker compose config`.
   - Builds both backend and frontend Docker images using Buildx.
4. **Publish to GitHub Container Registry (GHCR)**:
   - On every push to `main`, builds and tags production images with both `:latest` and commit SHA, publishing them to `ghcr.io`.

