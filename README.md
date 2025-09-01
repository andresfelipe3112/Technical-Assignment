

# Transaction Service (Backend) – NestJS

This project implements a **transaction management backend**, developed with **NestJS** and **TypeScript**, following modular design, security best practices, performance optimization, and maintainability standards.

---

## ✅ Implemented Features

| Feature                    | Status | Description                                                          |
| -------------------------- | ------ | -------------------------------------------------------------------- |
| **Transaction Management** | ✅      | Create transactions between wallets.                                 |
|   ↳ Internal Transfers     | ✅      | Balance movements within the system.                                 |
|   ↳ External Transfers     | ✅      | Mocked call to third-party provider API.                             |
| **Security**               | ✅      | Endpoints secured with JWT (Access and Refresh Tokens).              |
|   ↳ Authorization          | ✅      | Role-Based Access Control (RBAC) for users and admins.               |
| **Database**               | ✅      | PostgreSQL with TypeORM; atomic transactions ensure data integrity.  |
|   ↳ Data Integrity         | ✅      | Prevents negative balances and incomplete operations.                |
| **Performance**            | ✅      | Pagination in transaction history and Redis caching for efficiency.  |
| **API Exposure**           | ✅      | Endpoints available via REST and GraphQL.                            |
| **Testing**                | ✅      | Unit and E2E tests with Jest covering business logic and guards.     |
| **DevOps**                 | ✅      | Docker Compose ready for full deployment.                            |
| **Documentation**          | ✅      | Detailed README with architectural decisions and setup instructions. |

---

## 🏛️ Architecture & Design Decisions

* **Modularity & SOLID Principles**: Separate modules (`Auth`, `Users`, `Wallets`, `Transactions`) with single responsibility. Facilitates scalability and maintenance.
* **Security First**:

  * JWT for stateless authentication.
  * Refresh Token flow for enhanced security and user experience.
  * `RolesGuard` for granular endpoint access control.
* **ORM & Atomic Transactions**:

  * TypeORM for strong typing and NestJS integration.
  * Critical operations use atomic transactions to ensure consistency.
* **Performance Optimization**:

  * **Redis Caching**: Stores latest 5 transactions per user.
  * **Pagination**: Efficient queries for large datasets.
* **Validation**: DTOs with `class-validator` and `class-transformer` ensure clean and valid incoming data.

---

## 💻 Tech Stack

| Area              | Technology                    |
| ----------------- | ----------------------------- |
| Backend Framework | NestJS, TypeScript            |
| Database          | PostgreSQL                    |
| ORM               | TypeORM                       |
| In-Memory Cache   | Redis                         |
| APIs              | REST, GraphQL                 |
| Authentication    | JWT (Access & Refresh Tokens) |
| Testing           | Jest (Unit & Integration)     |
| Containerization  | Docker, Docker Compose        |

---

## 🚀 Installation & Setup

### 1. Prerequisites

* Node.js ≥ 18
* Docker & Docker Compose

### 2. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_NAME>
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Adjust values if needed
```

### 4. Run with Docker (recommended)

```bash
docker-compose up --build
```

The API will be available at [http://localhost:3000](http://localhost:3000).

### 5. Run locally (alternative)

```bash
npm install
npm run start:dev
```

> Ensure PostgreSQL and Redis are running locally and `.env` variables are correctly configured.

---

## 🧪 Running Tests

```bash
npm run test
```

* Runs all unit and integration tests (`*.spec.ts`) using Jest.

---

## 📄 API Usage

* **REST Base URL**: `http://localhost:3000`
* **GraphQL Playground**: `http://localhost:3000/graphql`

### Basic Workflow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → returns `access_token` and `refresh_token`
3. **Create Transaction**: `POST /transactions` (requires token)
4. **View History**: `GET /transactions` (requires token)

**Authorization Header**:

```
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 🎯 Evaluation Criteria Alignment

| Criteria                   | How It’s Addressed                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Backend Design**         | Modular, maintainable, following SOLID and separation of concerns.                   |
| **Security & Correctness** | JWT authentication, role-based authorization, input validation, atomic transactions. |
| **Performance Awareness**  | Pagination, Redis caching, efficient TypeORM queries.                                |
| **Testing Discipline**     | Comprehensive coverage of business logic, guards, and user flows.                    |
| **DevOps Practices**       | Docker Compose for reproducible deployment.                                          |
| **Documentation Clarity**  | Clear README, setup instructions, and technical decisions explained.                 |
| **(Optional Bonus)**       | API ready for frontend integration to demonstrate full-stack capability.             |

