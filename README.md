# Full-Stack Masjid Management System (Node.js, Express, PostgreSQL, Vanilla JS)

This is a full-stack web application designed for Masjid Management. It features a Node.js, Express, and PostgreSQL backend API with JWT-based authentication, and a Vanilla JavaScript frontend with HTML and Tailwind CSS for the user interface.

## Features

### Backend
*   User authentication (login) with JWT.
*   Password hashing using `bcryptjs`.
*   Protected API routes using JWT middleware.
*   Comprehensive input validation for API endpoints using `express-validator`.
*   Centralized error handling.
*   Security enhancements: `helmet` for HTTP headers, `cors` for cross-origin resource sharing, and rate limiting for API requests.
*   HTTP request logging with `morgan`.
*   Database seeding script for initial data setup.
*   CRUD operations for Janaza Members, including payment status management.
*   List/Create operations for Mahalla Members.
*   Admin user creation.

### Frontend
*   User login interface.
*   Dashboard for managing various aspects of the Masjid.
*   Janaza Member Management:
    *   Display members by location.
    *   Create, Update, Delete members.
    *   Track and update monthly payment statuses (Paid, Not_Paid, Pending, Waived) for Janaza members.
*   Mahalla Member Management:
    *   Display Mahalla members, filterable by zone.
    *   Create new Mahalla members.
*   Admin User Creation: Interface to add new admin users to the system.
*   Dynamic content loading and UI updates using Vanilla JavaScript.
*   Styling with Tailwind CSS.

## Project Structure

```
/
|-- src/
|   |-- config/         # Database configuration (database.js)
|   |-- controllers/    # Request handlers (authController.js, userController.js, memberController.js, mahallaMemberController.js, adminController.js)
|   |-- db/             # Database utilities (seed.js)
|   |-- middleware/     # Custom middleware (authMiddleware.js, errorHandler.js)
|   |-- models/         # Database interaction logic (User.js, Member.js, MahallaMember.js)
|   |-- routes/         # API route definitions (authRoutes.js, userRoutes.js, memberRoutes.js, mahallaMemberRoutes.js, adminRoutes.js)
|   |-- services/       # Business logic (authService.js, memberService.js, mahallaMemberService.js)
|   |-- utils/          # Utility functions (CustomError.js, jwtUtils.js, passwordUtils.js)
|-- tests/              # Integration tests (auth.test.js)
|-- .env.example        # Example environment variables
|-- .eslintrc.js        # ESLint configuration
|-- .gitignore          # Files to ignore in Git
|-- .prettierrc.js      # Prettier configuration
|-- index.html          # Login page HTML
|-- dashboard.html      # Dashboard page HTML
|-- app.js              # JavaScript for login page (index.html)
|-- dashbaord.js        # JavaScript for dashboard page (dashboard.html)
|-- api.js              # Frontend helper for authenticated API calls
|-- dashboard-api.js    # Frontend API calls specific to dashboard operations
|-- input.css           # Tailwind CSS input file
|-- output.css          # Tailwind CSS compiled output file
|-- tailwind.config.js  # Tailwind CSS configuration
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
cd <repository_name> # e.g., masjid-management-system
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
    CORS_ORIGIN=http://localhost:3000 # Adjusted for serving HTML from the same origin, or your specific frontend URL like http://localhost:5173

    # Rate Limiting (Optional - Defaults are set in code if these are not present)
    # RATE_LIMIT_WINDOW_MS=900000
    # RATE_LIMIT_MAX_REQUESTS=100
    # LOGIN_RATE_LIMIT_WINDOW_MS=3600000
    # LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
    ```
    *   **Important:** Replace placeholders (especially `your_postgres_user`, `your_postgres_password`, and `JWT_SECRET`) with your actual credentials and a strong secret key.

### 4. Set up PostgreSQL Database

Follow either **Option A (Local PostgreSQL)** or **Option B (Docker for PostgreSQL)** from the original setup instructions to install and configure PostgreSQL. Ensure your database service is running and you can connect to it.

After setting up PostgreSQL and creating the database and user as per your `.env` file, you need to create the required tables. Connect to your database (e.g., `psql -U your_postgres_user -d myapp_dev`) and run the following SQL commands:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members Table (for Janaza Fund)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    address TEXT,
    location VARCHAR(100) NOT NULL, -- Refers to a specific community location
    janaza2024 JSONB, -- Stores payment status for each month, e.g., {"jan": "Paid", "feb": "Not_Paid"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mahallah Members Table
CREATE TABLE mahallah_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(50), -- e.g., "2C", "3C"
    address TEXT,
    telephone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
**Note:** Ensure these tables are created before proceeding to the next step.

### 5. Seed the Database

Once the `.env` file is configured and the database tables are created, run the seed script to populate the database with initial sample data. This will create:
*   Sample users, including an administrator account.
*   Sample Janaza fund members with varying payment statuses.
*   Sample Mahalla members.

```bash
npm run db:seed
```
The script will log its progress to the console.

## Running the Application

1.  **Start the Backend Server:**
    *   **Development Mode (with auto-reloading):**
        ```bash
        npm run start:dev
        ```
        The server will typically be available at `http://localhost:3000` (or the `PORT` specified in your `.env`).
    *   **Production Mode:**
        ```bash
        npm start
        ```

2.  **Access the Frontend:**
    Once the server is running, open `http://localhost:3000/` in your web browser to access the application (the `index.html` login page is served at the root).

*(Note: The Tailwind CSS (`output.css`) is pre-compiled. If you make changes to `input.css` or Tailwind classes in HTML/JS, you'll need to manually re-run the Tailwind CLI build command: `npx tailwindcss -i ./input.css -o ./output.css --watch` during development if you wish to see live style updates, or run it once before committing changes.)*


## Running Tests

```bash
npm test
```
This command runs Jest integration tests for the backend API. Ensure `NODE_ENV` is set to `test` (the script handles this).

## API Endpoints

All `/api/dashboard/` routes are protected and require JWT authentication.

### Authentication
*   **`POST /api/auth/login`**:
    *   Authenticates a user.
    *   Request body: `{ "username": "your_username", "password": "your_password" }`
    *   Success response (200): `{ "message": "Login successful", "token": "jwt_token_here", "user": { "id": 1, "username": "your_username" } }`

### User (Self)
*   **`GET /api/users/me`**: (Protected)
    *   Retrieves the authenticated user's information.
    *   Success response (200): `{ "message": "Successfully accessed protected user data.", "user": { "id": 1, "username": "your_username" } }`

### Dashboard - Janaza Members
*   **`GET /api/dashboard/members/:location`**: (Protected)
    *   Retrieves all Janaza members for a specific location.
    *   Params: `location` (e.g., "AraliyaUyana").
    *   Success response (200): `[ { "id": 1, "name": "Member Name", ... }, ... ]`
*   **`POST /api/dashboard/members`**: (Protected)
    *   Creates a new Janaza member.
    *   Request body: `{ "name": "New Member", "telephone": "077...", "address": "123 St", "location": "AraliyaUyana", "janaza2024": {} }`
    *   Success response (201): `{ "id": 1, "name": "New Member", ... }`
*   **`GET /api/dashboard/members/id/:memberId`**: (Protected)
    *   Retrieves a single Janaza member by their ID.
    *   Params: `memberId`.
    *   Success response (200): `{ "id": 1, "name": "Member Name", ... }`
*   **`PUT /api/dashboard/members/:memberId`**: (Protected)
    *   Updates an existing Janaza member.
    *   Params: `memberId`.
    *   Request body: `{ "name": "Updated Name", "telephone": "071...", "address": "456 Ave", "location": "AraliyaUyana", "janaza2024": {"jan":"Paid"} }`
    *   Success response (200): `{ "id": 1, "name": "Updated Name", ... }`
*   **`DELETE /api/dashboard/members/:memberId`**: (Protected)
    *   Deletes a Janaza member.
    *   Params: `memberId`.
    *   Success response (200): `{ "message": "Member deleted successfully", "memberId": 1 }`
*   **`PATCH /api/dashboard/members/:memberId/payment-status`**: (Protected)
    *   Updates the payment status for a specific month for a Janaza member.
    *   Params: `memberId`.
    *   Request body: `{ "month": "jan", "status": "Paid" }`
    *   Success response (200): `{ "id": 1, ..., "janaza2024": {"jan":"Paid", ...} }`

### Dashboard - Mahalla Members
*   **`GET /api/dashboard/mahallah-members`**: (Protected)
    *   Retrieves all Mahalla members. Can be filtered by zone.
    *   Query Params (optional): `zone` (e.g., "?zone=2C").
    *   Success response (200): `[ { "id": 1, "name": "Mahalla Member", "zone": "2C", ... }, ... ]`
*   **`POST /api/dashboard/mahallah-members`**: (Protected)
    *   Creates a new Mahalla member.
    *   Request body: `{ "name": "New Mahalla Member", "zone": "3C", "address": "789 Lane", "telephone": "075..." }`
    *   Success response (201): `{ "id": 1, "name": "New Mahalla Member", ... }`

### Dashboard - Admins
*   **`POST /api/dashboard/admins`**: (Protected)
    *   Creates a new admin user. Requires the authenticated user to have sufficient privileges (though this role-based authorization is not explicitly implemented beyond JWT protection).
    *   Request body: `{ "username": "newadmin", "password": "strongpassword", "address": "Admin Address" }`
    *   Success response (201): `{ "message": "Admin user created successfully", "user": { "id": 2, "username": "newadmin", "address": "Admin Address", "is_admin": true } }` (password_hash is not returned)

## Frontend

The frontend is built with:
*   **HTML5**
*   **Vanilla JavaScript** for client-side logic and DOM manipulation.
    *   `app.js`: Handles login page interactions.
    *   `dashbaord.js`: Manages dashboard functionality, data display, and user interactions for member management.
    *   `api.js`: A generic helper function (`authenticatedFetch`) for making authenticated API calls to the backend, handling token attachment and 401 errors.
    *   `dashboard-api.js`: Contains functions that use `api.js` for specific dashboard-related backend operations (e.g., adding an admin).
*   **Tailwind CSS** for styling.
    *   `input.css`: Main CSS file where Tailwind directives and custom styles are defined.
    *   `output.css`: The compiled CSS file used by the HTML pages.
    *   `tailwind.config.js`: Configuration file for Tailwind CSS.
    *   To recompile `output.css` after changes to Tailwind classes or `input.css`, you can run `npx tailwindcss -i ./input.css -o ./output.css`. For continuous development, use `npx tailwindcss -i ./input.css -o ./output.css --watch`.

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

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code adheres to the linting and formatting standards.

## License

This project is licensed under the MIT License.
