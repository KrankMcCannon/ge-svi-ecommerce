
# GE SVI Ecommerce API Project

Welcome to the **GE SVI Ecommerce API** project! This project is built using **NestJS**, **TypeScript**, **PostgreSQL**, and **RabbitMQ**. It includes two main components:

1. **Main Application**: The API for handling e-commerce functionalities.
2. **Microservice**: A RabbitMQ-driven microservice for processing asynchronous tasks (e.g., sending emails).

This guide will walk you through how to set up and run the project locally using **Docker** and **Docker Compose**. No deep knowledge of Docker is required—just follow the steps, and you'll have everything running smoothly!

---

## Table of Contents

1. [Requirements](#requirements)
2. [Project Structure](#project-structure)
3. [Setup Steps](#setup-steps)
4. [Running the Project](#running-the-project)
5. [Accessing Services](#accessing-services)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Requirements

Before you begin, make sure you have the following tools installed on your machine:

- **Docker**: Download and install from [Docker's official website](https://www.docker.com/get-started).
- **Docker Compose**: This comes with Docker, but ensure it's available by running `docker-compose --version`.

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
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables configuration
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

2. **Set Up Environment Variables**

   The project uses a `.env` file to manage environment variables. You can customize the `.env` file based on your local setup.

   Here's an example `.env` file:

   ```bash
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=password
   DATABASE_NAME=ge-svi-ecommerce
   JWT_SECRET=my_super_mega_ultra_giga_secret
   RABBITMQ_URI=amqp://rabbitmq:rabbitmq@rabbitmq:5672
   RABBITMQ_QUEUE=EMAIL
   PORT=3000
   IP=0.0.0.0
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
| `DATABASE_HOST`            | Hostname of the PostgreSQL server              |
| `DATABASE_PORT`            | Port of the PostgreSQL server                  |
| `DATABASE_USERNAME`        | PostgreSQL username                            |
| `DATABASE_PASSWORD`        | PostgreSQL password                            |
| `DATABASE_NAME`            | Name of the PostgreSQL database                |
| `JWT_SECRET`               | Secret for JWT token generation                |
| `RABBITMQ_URI`             | RabbitMQ connection URI                        |
| `RABBITMQ_QUEUE`           | RabbitMQ queue name (used by the microservice) |
| `PORT`                     | Port for the main application                  |
| `IP`                       | IP address for the main application            |
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
