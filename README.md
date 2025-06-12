# 🚀 Ride-Hailing Microservices App

This is a multi-service ride-hailing application built using Docker Compose. It includes services for users, rides, matching, and real-time driver notifications.

---

## 🧱 Requirements

- Docker
- Docker Compose v2+

---

## ▶️ Running the App

### Step 1: Start all services

```bash
docker-compose up -d --build
```

This command builds and starts all containers in detached mode.

---

### Step 2: Install Rails dependencies (for User Service)

```bash
docker-compose exec user-service bundle install
```

---

### Step 3: Migrate and seed the database

You can either run all in one:

```bash
docker-compose exec user-service rails db:prepare
docker-compose exec user-service rails db:seed
```

Or do it step-by-step:

```bash
docker-compose exec user-service rails db:create
docker-compose exec user-service rails db:migrate
docker-compose exec user-service rails db:seed
```

> 🔁 Replace `user-service` with your actual Rails service name if different.

---

## 🌱 Seed Data

The `db:seed` command will insert initial roles, test users, and default settings required for local development.

---

## 🛠️ Useful Commands

### View logs from a service

```bash
docker-compose logs -f ride-service
```

### Restart everything from scratch

```bash
docker-compose down
docker-compose up --build
```

---

## 🔗 Notes

- Kafka is used for inter-service communication (ride requests, driver assignment).
- Redis is used for driver location cache and distributed locking.
- MongoDB stores ride records.
- PostgreSQL or MySQL is used for Rails-based user accounts.
- Environment variables can be set in `.env` or directly in `docker-compose.yml`.

---

## ✅ Done!

Visit your frontend or API entry point to start testing. Happy building! 🚗💨
