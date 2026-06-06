# My E-commerce Clothing App

A full-stack e-commerce application for a clothing business, built with **Angular 21** on the frontend and **Spring Boot** on the backend, backed by a **MySQL** database and packaged with **Docker**.

---

## Tech Stack

| Layer       | Technology                                       |
| ----------- | ------------------------------------------------ |
| Frontend    | Angular 21 (SSR enabled), TypeScript, RxJS       |
| Backend     | Spring Boot 2.5, Java 11, Spring Security, JPA   |
| Auth        | JWT (JSON Web Tokens)                            |
| Database    | MySQL 8                                          |
| Build Tools | Maven (backend), Angular CLI / npm (frontend)    |
| Deployment  | Docker, Docker Compose                           |

---

## Features

- User registration and login with JWT-based authentication
- Role-based access control (regular user vs. admin)
- Product browsing — Shop page, product list, and product detail views
- Shopping cart with per-user persistence
- Checkout flow
- Admin dashboard for managing products and orders
- Static informational pages (Home, About, Help)
- Server-side rendering (SSR) for faster initial loads and better SEO
- Responsive UI for mobile and desktop

---

## Project Structure

```
my-ecommerce-clothing-app/
├── backend/                          # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/ecommerce/
│       │   ├── EcommerceApplication.java
│       │   ├── config/               # Spring Security & app configuration
│       │   ├── controller/           # REST endpoints (Auth, Product, Cart, Order)
│       │   ├── dto/                  # Request / response payloads
│       │   ├── exception/            # Global exception handling
│       │   ├── model/                # JPA entities (User, Product, Cart, Order)
│       │   ├── repository/           # Spring Data JPA repositories
│       │   └── service/              # Business logic + JWT utilities
│       └── resources/
│           ├── application.yml       # DB, server, CORS, security config
│           └── data.sql              # Seed data
│
├── frontend/                         # Angular 21 application
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── main.ts / main.server.ts  # Browser & SSR entry points
│       ├── server.ts                 # Express SSR server
│       └── app/
│           ├── app.ts                # Root component
│           ├── app.routes.ts         # Client-side routing
│           ├── components/           # Reusable UI: header, footer, cart,
│           │                         #   product-card, product-list
│           ├── pages/                # Route-level views: home, shop, about,
│           │                         #   help, login, register, product-detail,
│           │                         #   checkout, admin
│           ├── services/             # API, auth, and cart services
│           ├── guards/               # Route guards (auth, admin)
│           └── interceptors/         # HTTP interceptors (JWT injection)
│
├── docker/                           # Container setup
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- **Java 11** or higher
- **Maven 3.6+**
- **Node.js 18+** and **npm**
- **MySQL 8** (running locally on port `3306`)
- **Docker** & **Docker Compose** *(optional — only for containerized setup)*

### 1. Database Setup

Create a MySQL database named `ecommerce_db`:

```sql
CREATE DATABASE ecommerce_db;
```

Then update the credentials in [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml) to match your local MySQL setup.

> **Note:** The seed data in `data.sql` will be loaded automatically on first run.

### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will be available at **http://localhost:8080**.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be available at **http://localhost:4200**.

### 4. Docker Setup *(Optional)*

To run the full stack in containers:

```bash
cd docker
docker-compose up --build
```

---

## Available Scripts (Frontend)

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Start the dev server (`ng serve`)        |
| `npm run build` | Build for production                     |
| `npm run watch` | Build in watch mode (development config) |
| `npm test`      | Run unit tests                           |

---

## API Overview

| Endpoint Group   | Description                            |
| ---------------- | -------------------------------------- |
| `/api/auth/*`    | Register, login, JWT token issuance    |
| `/api/products/*`| Product listing, detail, admin CRUD    |
| `/api/cart/*`    | Cart operations (add, update, remove)  |
| `/api/orders/*`  | Place and view orders                  |

> See the controllers in [backend/src/main/java/com/example/ecommerce/controller/](backend/src/main/java/com/example/ecommerce/controller/) for exact routes and payloads.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
