# Node.js Express JWT Authentication API

This is a backend API built with Node.js, Express, and PostgreSQL, demonstrating JWT-based authentication, password hashing, and other best practices.

## Features

*   User authentication (login) with JWT.
*   Password hashing using `bcryptjs`.
*   Protected routes using JWT middleware.
*   Input validation using `express-validator`.
*   Centralized error handling.
*   Security enhancements: `helmet`, `cors`, rate limiting.
*   HTTP request logging with `morgan`.
*   Code linting with ESLint and formatting with Prettier.
*   Basic integration tests with Jest and Supertest.

## Project Structure

```
/
|-- src/
|   |-- config/         # Database configuration (database.js)
|   |-- controllers/    # Request handlers (authController.js, userController.js)
|   |-- middleware/     # Custom middleware (authMiddleware.js, errorHandler.js)
|   |-- models/         # Database interaction logic (User.js)
|   |-- routes/         # API route definitions (authRoutes.js, userRoutes.js)
|   |-- services/       # Business logic (authService.js)
|   |-- utils/          # Utility functions (CustomError.js, jwtUtils.js, passwordUtils.js)
|-- tests/              # Integration tests (auth.test.js)
|-- .env.example        # Example environment variables
|-- .eslintrc.js        # ESLint configuration
|-- .gitignore          # Files to ignore in Git
|-- .prettierrc.js      # Prettier configuration
|-- index.html          # Simple HTML page served at root (for basic testing/placeholder)
|-- package.json        # Project dependencies and scripts
|-- README.md           # This file
|-- server.js           # Main application entry point
```

## Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js)
*   PostgreSQL (running locally or via Docker)
*   Docker & Docker Compose (optional, for running PostgreSQL in a container)

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_name> # e.g., node-express-jwt-auth
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1.  **Create a `.env` file** by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  **Edit the `.env` file** with your actual configurations:
    ```dotenv
    # Server Configuration
    NODE_ENV=development
    PORT=3000

    # Database Configuration
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_postgres_user # Replace with your PostgreSQL username
    DB_PASSWORD=your_postgres_password # Replace with your PostgreSQL password
    DB_NAME=myapp_dev # Or your chosen database name

    # JWT Configuration
    JWT_SECRET=your_very_secret_and_long_jwt_key_generate_one # Replace with a strong, random secret (e.g., openssl rand -hex 32)

    # CORS Configuration (Update for your frontend's origin in production)
    CORS_ORIGIN=http://localhost:5173 # Example for a Vite frontend

    # Rate Limiting (Optional - Defaults are set in code if these are not present)
    # RATE_LIMIT_WINDOW_MS=900000
    # RATE_LIMIT_MAX_REQUESTS=100
    # LOGIN_RATE_LIMIT_WINDOW_MS=3600000
    # LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
    ```
    *   **Important:** Replace placeholders (especially `your_postgres_user`, `your_postgres_password`, and `JWT_SECRET`) with your actual credentials and a strong secret key.

### 4. Set up PostgreSQL Database

You have two primary options:

**Option A: Local PostgreSQL Installation**

1.  **Install PostgreSQL:** Follow instructions for your OS from the [official PostgreSQL website](https://www.postgresql.org/download/).
2.  **Start PostgreSQL Service:** Ensure the PostgreSQL service is running.
3.  **Create Database and User:**
    Connect to PostgreSQL (e.g., using `psql`):
    ```bash
    sudo -u postgres psql # Or your system's equivalent
    ```
    Then execute the following SQL commands (replace `myapp_user` and `your_secure_password` if you used different values in `.env`):
    ```sql
    CREATE DATABASE myapp_dev;
    -- Optional: Create a dedicated user if you haven't already
    -- CREATE USER myapp_user WITH PASSWORD 'your_secure_password';
    -- GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO myapp_user;
    -- ALTER ROLE myapp_user SET client_encoding TO 'utf8';
    -- ALTER ROLE myapp_user SET default_transaction_isolation TO 'read committed';
    -- ALTER ROLE myapp_user SET timezone TO 'UTC';
    \q
    ```
4.  **Create the `users` table:**
    Connect to your newly created database (e.g., `psql -U your_postgres_user -d myapp_dev`):
    ```sql
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```
5.  **Insert Seed Users (for testing):**
    The application is seeded with two users. Their passwords are pre-hashed in the database.
    *   Username: `testuser`, Password: `password123`
    *   Username: `anotheruser`, Password: `securepassword`

    These users were added with the following hashed passwords (bcrypt, 10 rounds):
    *   `testuser`: `$2a$10$E9.E21Rss.U3O9sL9k8M9e22Q8U8Uu6bFjVjS.VLzSOjf4/gP9.Ba`
    *   `anotheruser`: `$2a$10$OKxKk9gXfGzDZA4pSSjN2uYQ8s3n0UaXnE4kL6S9jKqYq8s8jJk8K`

    If you need to re-insert them manually:
    ```sql
    INSERT INTO users (username, password_hash) VALUES ('testuser', '$2a$10$E9.E21Rss.U3O9sL9k8M9e22Q8U8Uu6bFjVjS.VLzSOjf4/gP9.Ba');
    INSERT INTO users (username, password_hash) VALUES ('anotheruser', '$2a$10$OKxKk9gXfGzDZA4pSSjN2uYQ8s3n0UaXnE4kL6S9jKqYq8s8jJk8K');
    ```
    *(No separate seed script is provided; these were inserted during development setup).*

**Option B: Using Docker for PostgreSQL**

1.  Ensure Docker and Docker Compose are installed.
2.  Create a `docker-compose.yml` file in the project root:
    ```yaml
    version: '3.8'
    services:
      postgres_db:
        image: postgres:15-alpine # Or your preferred PostgreSQL version
        container_name: myapp_postgres_dev
        environment:
          POSTGRES_USER: ${DB_USER:-your_postgres_user} # Uses DB_USER from .env or defaults
          POSTGRES_PASSWORD: ${DB_PASSWORD:-your_postgres_password} # Uses DB_PASSWORD from .env or defaults
          POSTGRES_DB: ${DB_NAME:-myapp_dev}
        ports:
          - "${DB_PORT:-5432}:5432"
        volumes:
          - postgres_dev_data:/var/lib/postgresql/data
    volumes:
      postgres_dev_data:
    ```
    *This `docker-compose.yml` will use values from your `.env` file if they are set, otherwise it uses the specified defaults.*
3.  Start the PostgreSQL container:
    ```bash
    docker-compose up -d
    ```
4.  The `users` table then needs to be created as described in Option A, step 4. You can connect to the Dockerized PostgreSQL instance using any SQL client (e.g., DBeaver, pgAdmin, or `psql` via `docker exec`):
    ```bash
    docker exec -it myapp_postgres_dev psql -U ${DB_USER:-your_postgres_user} -d ${DB_NAME:-myapp_dev}
    ```
    Then run the `CREATE TABLE` and `INSERT` statements.

## Running the Application

*   **Development Mode (with auto-reloading):**
    ```bash
    npm run start:dev
    ```
    The server will typically be available at `http://localhost:3000` (or the `PORT` specified in your `.env`).

*   **Production Mode:**
    ```bash
    npm start
    ```

## Running Tests

```bash
npm test
```
This command runs Jest integration tests. Ensure `NODE_ENV` is set to `test` (the script handles this).

*(Note: Test execution in some sandboxed CI/CD environments might require workarounds for resolving devDependencies. The scripts in `package.json` attempt to use direct paths to binaries in `node_modules/.bin/` as a common workaround.)*

## API Endpoints

*   **`POST /api/auth/login`**:
    *   Authenticates a user.
    *   Request body: `{ "username": "your_username", "password": "your_password" }`
    *   Success response (200): `{ "message": "Login successful", "token": "jwt_token_here", "user": { "id": 1, "username": "your_username" } }`
    *   Error responses (400, 401, 500): `{ "message": "Error message", "errors"? : [...] }`

*   **`GET /api/users/me`**: (Protected Route)
    *   Retrieves the authenticated user's information based on the JWT.
    *   Requires `Authorization: Bearer <token>` header.
    *   Success response (200): `{ "message": "Successfully accessed protected user data.", "user": { "id": 1, "username": "your_username" } }`
    *   Error responses (401): `{ "message": "Not authorized, ..." }`

A simple `index.html` is served at the root `/` for basic server verification.

## Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting.

*   **Check for linting issues:**
    ```bash
    npm run lint
    ```
*   **Fix linting issues automatically:**
    ```bash
    npm run lint:fix
    ```
*   **Format code with Prettier:**
    ```bash
    npm run format
    ```

*(Note: Similar to tests, running these scripts in some sandboxed environments might require workarounds for resolving binaries in `node_modules/.bin/`.)*

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code adheres to the linting and formatting standards.

## License

This project is licensed under the MIT License.
