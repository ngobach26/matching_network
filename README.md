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
docker compose exec user-service bin/rails db:prepare
docker compose exec user-service bin/rails db:seed
```

Or do it step-by-step:

```bash
docker compose exec user-service bin/rails db:create
docker compose exec user-service bin/rails db:migrate
docker compose exec user-service bin/rails db:seed
```

```bash
docker compose exec ride-service python seed_drivers.py
```

```bash
docker compose exec ride-service python seed_drivers.py
```

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

## Environment Variables Setup

Create a `.env` file in your project from .env.sample file and add the following variables:

### How to obtain these variables:

- **AUTH_SECRET_KEY**:  
  Generate a random secret string for JWT authentication.  
  Example: Use `openssl rand -hex 32` in your terminal, or use an online generator like https://randomkeygen.com/.

- **VNP_TMN_CODE** and **VNP_HASH_SECRET**:  
  These are provided by VNPAY when you register for a merchant account. Log in to your VNPAY merchant portal to find them.

- **FRONTEND_BASE_URL**:  
  The base URL of your frontend application.  
  For local development, use `http://localhost:3000`.  
  For production, use your actual deployed frontend URL.

- **AWS_REGION**:  
  The AWS region where your S3 bucket is hosted (e.g., `ap-southeast-1`).  
  You can find this information in your AWS S3 dashboard.

- **AWS_BUCKET**:  
  The name of your S3 bucket, visible in the AWS S3 dashboard.

- **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY**:  
  Create these in the AWS IAM Management Console.  
  - Go to IAM → Users → Add user (enable programmatic access).  
  - Assign permissions (e.g., AmazonS3FullAccess or your custom policy).  
  - After creating the user, you will see the access key ID and secret access key.

**Note:**  
Never share your `.env` file or commit it to your repository to keep your credentials secure.


## 🔗 Notes

- Kafka is used for inter-service communication (ride requests, driver assignment).
- Redis is used for driver location cache and distributed locking.
- MongoDB stores ride records.
- PostgreSQL or MySQL is used for Rails-based user accounts.
- Environment variables can be set in `.env` or directly in `docker-compose.yml`.

---

## ✅ Done!

Visit your frontend or API entry point to start testing. Happy building! 🚗💨
