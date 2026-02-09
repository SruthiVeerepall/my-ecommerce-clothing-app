# My E-commerce Clothing App

This is a full-stack e-commerce application for a clothing business built using Java Spring Boot for the backend and React for the frontend.

## Project Structure

```
my-ecommerce-clothing-app
├── backend                # Backend application
│   ├── pom.xml           # Maven configuration file
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── example
│   │   │   │           └── ecommerce
│   │   │   │               ├── EcommerceApplication.java
│   │   │   │               ├── controller
│   │   │   │               │   ├── ProductController.java
│   │   │   │               │   ├── CartController.java
│   │   │   │               │   └── OrderController.java
│   │   │   │               ├── model
│   │   │   │               │   ├── Product.java
│   │   │   │               │   ├── User.java
│   │   │   │               │   └── Order.java
│   │   │   │               ├── repository
│   │   │   │               │   ├── ProductRepository.java
│   │   │   │               │   └── OrderRepository.java
│   │   │   │               ├── service
│   │   │   │               │   ├── ProductService.java
│   │   │   │               │   └── OrderService.java
│   │   │   │               └── config
│   │   │   │                   └── SecurityConfig.java
│   │   │   └── resources
│   │   │       ├── application.yml
│   │   │       └── data.sql
│   │   └── test
│   │       └── java
│   │           └── com
│   │               └── example
│   │                   └── ecommerce
│   │                       └── EcommerceApplicationTests.java
├── frontend               # Frontend application
│   ├── package.json       # npm configuration file
│   ├── tsconfig.json      # TypeScript configuration file
│   ├── public
│   │   └── index.html     # Main HTML file
│   └── src
│       ├── index.tsx      # Entry point for React application
│       ├── App.tsx        # Root component
│       ├── components
│       │   ├── ProductList.tsx
│       │   ├── ProductCard.tsx
│       │   └── Cart.tsx
│       ├── pages
│       │   ├── Home.tsx
│       │   ├── ProductDetail.tsx
│       │   └── Checkout.tsx
│       ├── services
│       │   └── api.ts
│       └── styles
│           └── main.css
├── docker                 # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── .gitignore             # Git ignore file
├── README.md              # Project documentation
└── LICENSE                # Licensing information
```

## Features

- User authentication and authorization
- Product listing and detail view
- Shopping cart functionality
- Order management
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Java 11 or higher
- Node.js and npm
- Maven
- Docker (optional)

### Backend Setup

1. Navigate to the `backend` directory.
2. Run `mvn clean install` to build the project.
3. Run the application using `mvn spring-boot:run`.

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server.

### Docker Setup

1. Navigate to the `docker` directory.
2. Run `docker-compose up` to start the application using Docker.

## License

This project is licensed under the MIT License. See the LICENSE file for details.