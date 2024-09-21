
# GE SVI Ecommerce API Project

Welcome to the **GE SVI Ecommerce API** project! This project is built using **NestJS**, **TypeScript**, **PostgreSQL**, and **RabbitMQ**. It includes two main components:

1. **Main Application**: The API for handling e-commerce functionalities.
2. **Microservice**: A RabbitMQ-driven microservice for processing asynchronous tasks (e.g., sending emails).

This guide will walk you through how to set up and run the project locally using **Docker** and **Docker Compose**. No deep knowledge of Docker is required, just follow the steps, and you'll have everything running smoothly!

---

## Table of Contents

1. [Requirements](#requirements)
2. [Project Structure](#project-structure)
3. [Setup Steps](#setup-steps)
4. [Running the Project](#running-the-project)
5. [Accessing Services](#accessing-services)
6. [Environment Variables](#environment-variables)
7. [Postman Setup](#postman-collection)
8. [Troubleshooting](#troubleshooting)

---

## Requirements

Before you begin, make sure you have the following tools installed on your machine:

- **Docker**: Download and install from [Docker's official website](https://www.docker.com/get-started).
- **Docker Compose**: This comes with Docker, but ensure it's available by running `docker-compose --version`.
- **Postman**: Download and install Postman from [Postman's official website](https://www.postman.com/downloads/).

---

## Project Structure

Here is the basic structure of the project:

```
root/
│                            # Main Application
├── Dockerfile                  # Dockerfile for the Main App
├── src/                        # Main App source code
│   ├── auth                    # Auth folder
│   ├── carts                   # Carts folder
│   ├── config                  # Config folder
│   ├── email                   # Email folder
│   ├── orders                  # Orders folder
│   ├── products                # Products folder
│   ├── users                   # Users folder
│   └── test                    # E2E Test folder
│
├── microservice/               # Microservice source code
│   ├── Dockerfile              # Dockerfile for the Microservice
│   ├── controller              # Microservice Controller
│   ├── service                 # Microservice Service
│   └── module                  # Microservice Module
│
├── postman/                    # Postman collection and environment
│
├── docker-compose.yml          # Docker Compose configuration
├── .env.example                # Environment variables configuration
├── package.json                # Node Package Manager
└── yarn.lock                   # Detailed Libraries info
```

---

## Setup Steps

1. **Clone the Repository**

   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/KrankMcCannon/ge-svi-ecommerce.git
   cd ge-svi-ecommerce
   ```

2. **Create Your `.env` File**

   The project uses a .env file to manage environment variables.
   You need to create this file by copying the provided .env.example file.

   ```bash
   cp .env.example .env 
   ```

   Here's an example `.env` file:

   ```bash
   NODE_ENV='development'
   PORT=3000
   IP='0.0.0.0'
   DATABASE_HOST='localhost'
   DATABASE_NAME='ge-svi-ecommerce'
   DATABASE_PORT=5432
   DATABASE_USERNAME='postgres'
   DATABASE_PASSWORD='password'
   SWAGGER_TITLE='GE SVI Ecommerce API'
   SWAGGER_DESCRIPTION='API documentation for GE SVI Ecommerce'
   SWAGGER_VERSION='1.0.0'
   JWT_SECRET='my_super_mega_ultra_giga_secret'
   RABBITMQ_URI='amqp://rabbitmq:rabbitmq@localhost:5672'
   RABBITMQ_QUEUE='EMAIL'
   RABBITMQ_DEFAULT_USER='rabbitmq'
   RABBITMQ_DEFAULT_PASS='rabbitmq'
   PGADMIN_DEFAULT_EMAIL='admin@admin.com'
   PGADMIN_DEFAULT_PASSWORD='admin'
   ```

   Feel free to adjust the variables if needed.

---

## Running the Project

The project is configured to run all necessary services using **Docker Compose**, which will manage:

- The **Main Application** (NestJS API).
- The **Microservice** for RabbitMQ event handling.
- **PostgreSQL** as the database.
- **pgAdmin** for managing the database visually.
- **RabbitMQ** as the message broker.

### Steps to Run:

1. **Build and Start the Services**

   From the project root, run:

   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build the Docker images for the main app and microservice.
   - Start the containers for PostgreSQL, RabbitMQ, pgAdmin, the main app, and the microservice.
   
2. **Check that the Services Are Running**

   Docker Compose will display logs for each service. Once everything is running, you should see output like this:

   - **app**: Running on `http://localhost:3000`
   - **pgAdmin**: Running on `http://localhost:5050` (use the credentials in the `.env` file).
   - **RabbitMQ Management Console**: Running on `http://localhost:15672` (default user/password: `rabbitmq/rabbitmq`).

---

## Postman Setup

### Step 1: Download and Install Postman

If you haven't already, download and install Postman from the official website.

### Step 2: Download the Postman Collection

To simplify API testing, a Postman Collection has been provided.

1. Download and import the Postman Collection and Environment:

   - [Download Collection](./postman/ge-svi-ecommerce.postman_collection.json)
   - [Download Environment](./postman/ge-svi-ecommerce.postman_environment.json)

2. Open Postman and import the files by clicking the "Import" button in the top-left corner.

### Step 3: Authentication Flow in Postman

- First, call the **Register** endpoint.
- Second, call the **Login** endpoint.
- After receiving the **access token** from the response, Postman will automatically set the `access_token` environment variable.
- The token will be included in subsequent requests to endpoints that require authentication.

To manually set or reset environment variables in Postman:
1. Go to the "Environments" tab.
2. Select the **Ge SVI E-Commerce** environment.
3. Manually add or update the **access_token**.

---

## Accessing Services

### 1. **Main Application (API)**

The main application runs on `http://localhost:3000`. You can explore the API endpoints by visiting the Swagger documentation:

```bash
http://localhost:3000/api/docs
```

This is an interactive API documentation that allows you to test the endpoints.

### 2. **pgAdmin (Database Management)**

pgAdmin allows you to manage the PostgreSQL database visually. Access it at:

```bash
http://localhost:5050
```

Use the credentials from the `.env` file (`PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`) to log in.

Once logged in, connect to the PostgreSQL server using these details:

- **Host**: `postgres`
- **Username**: `postgres`
- **Password**: `password` (as per `.env` file)
- **Port**: `5432`

### 3. **RabbitMQ Management Console**

The RabbitMQ management console is available at:

```bash
http://localhost:15672
```

Log in using the default credentials (`rabbitmq/rabbitmq`).

From here, you can monitor and manage RabbitMQ queues, including the one used by the microservice (`EMAIL`).

---

## Environment Variables

Here’s a summary of important environment variables you’ll encounter in the `.env` file:

| Variable                   | Description                                    |
|----------------------------|------------------------------------------------|
| `NODE_ENV`                 | Node Environment for the application           |
| `PORT`                     | Port for the main application                  |
| `IP`                       | IP address for the main application            |
| `DATABASE_HOST`            | Hostname of the PostgreSQL server              |
| `DATABASE_NAME`            | Name of the PostgreSQL database                |
| `DATABASE_PORT`            | Port of the PostgreSQL server                  |
| `DATABASE_USERNAME`        | PostgreSQL username                            |
| `DATABASE_PASSWORD`        | PostgreSQL password                            |
| `SWAGGER_TITLE`            | Swagger Documentation Title                    |
| `SWAGGER_DESCRIPTION`      | Swagger Documentation Description              |
| `SWAGGER_VERSION`          | Swagger Documentation Versioning               |
| `JWT_SECRET`               | Secret for JWT token generation                |
| `RABBITMQ_URI`             | RabbitMQ connection URI                        |
| `RABBITMQ_QUEUE`           | RabbitMQ queue name (used by the microservice) |
| `RABBITMQ_DEFAULT_USER`    | RabbitMQ username (used by the microservice)   |
| `RABBITMQ_DEFAULT_PASS`    | RabbitMQ password (used by the microservice)   |
| `PGADMIN_DEFAULT_EMAIL`    | Default email for pgAdmin login                |
| `PGADMIN_DEFAULT_PASSWORD` | Default password for pgAdmin login             |

---

## Troubleshooting

If you run into any issues, here are a few common solutions:

### 1. **Port Conflicts**

If any ports (like `3000`, `5432`, `5050`, or `15672`) are already in use, you can change them in the `docker-compose.yml` file. For example, change:

```yaml
ports:
  - '3000:3000'
```

to:

```yaml
ports:
  - '3001:3000'
```

### 2. **Database Connection Issues**

Ensure that PostgreSQL has started successfully. You can check the logs of the `postgres` container:

```bash
docker-compose logs postgres
```

### 3. **Rebuilding Containers**

If something seems off, you can force rebuild the containers:

```bash
docker-compose down
docker-compose up --build
```

---

## Conclusion

You should now have everything set up and running! This project uses Docker to simplify running and developing the application. You can explore the API via Swagger, manage the database via pgAdmin, and monitor RabbitMQ through its management console.

If you have any questions or need further clarification, feel free to reach out!

Enjoy buying products with **Ge.Svi. E-Commerce** ! 🚀
