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
*   Database seeding script for initial data setup, including predefined test users.
*   CRUD operations for Janaza Members, including payment status management and enhanced filtering/pagination.
*   CRUD operations for Mahalla Members, including enhanced filtering/pagination.
*   CRUD operations for Hifl Members, including filtering/pagination.
*   CRUD operations for Admin users (listing, creation, update, deletion - password updates require new password).

### Frontend
*   User login interface (`public/login.html` controlled by `public/js/login.js`).
*   Public member viewing page (`public/index.html` controlled by `public/js/main.js`) for Janaza and Mahallah members.
*   Admin Dashboard (`public/dashboard.html` controlled by `public/js/dashboard.js`):
    *   Management of Janaza Members:
        *   Display members with filtering (location, payment status) and pagination.
        *   Create, Update (details), Delete members (Edit/Delete UI to be fully implemented).
        *   Track and update all 12 monthly payment statuses (Paid, Not_Paid, Pending, Waived) directly in the member list table.
    *   Management of Mahalla Members:
        *   Display Mahalla members with filtering (location, zone) and pagination.
        *   Create, Update, Delete members (Edit/Delete UI to be fully implemented).
    *   Management of Hifl Members:
        *   Display Hifl members with filtering (location, zone, status) and pagination.
        *   Create, Update, Delete members (Edit/Delete UI to be fully implemented).
    *   Admin User Management:
        *   Interface to add new admin users.
        *   (Listing, Editing, Deleting Admins UI is **not yet implemented** in the frontend due to development tool limitations - Backend APIs are ready).
*   Dynamic content loading and UI updates using Vanilla JavaScript.
*   Styling with Tailwind CSS and DaisyUI components.

## Project Structure

```
/
|-- public/                 # Publicly served static assets
|   |-- js/                 # Frontend JavaScript files
|   |   |-- login.js        # Logic for login page
|   |   |-- main.js         # Logic for public member viewing page (index.html)
|   |   |-- dashboard.js    # Logic for admin dashboard
|   |-- login.html          # Login page
|   |-- index.html          # Public member viewing page (user homepage)
|   |-- dashboard.html      # Admin dashboard page
|   |-- output.css          # Compiled Tailwind CSS
|-- src/
|   |-- config/             # Database configuration (database.js)
|   |-- controllers/        # Request handlers (authController.js, memberController.js, mahallaMemberController.js, hiflMemberController.js, adminController.js, publicController.js)
|   |-- db/                 # Database utilities (seed.js)
|   |-- middleware/         # Custom middleware (authMiddleware.js, errorHandler.js)
|   |-- routes/             # API route definitions (authRoutes.js, memberRoutes.js, mahallaMemberRoutes.js, hiflMemberRoutes.js, adminRoutes.js, publicRoutes.js)
|   |-- services/           # Business logic (authService.js, memberService.js, mahallaMemberService.js) - Note: Some controllers now use direct DB access.
|   |-- utils/              # Utility functions (CustomError.js, jwtUtils.js, passwordUtils.js)
|-- .env.example            # Example environment variables
|-- .eslintrc.js            # ESLint configuration
|-- .gitignore              # Files to ignore in Git
|-- .prettierrc.js          # Prettier configuration
|-- input.css               # Tailwind CSS input file
|-- tailwind.config.js      # Tailwind CSS configuration
|-- package.json            # Project dependencies and scripts
|-- README.md               # This file
|-- server.js               # Main application entry point
```
*(Removed old root HTML/JS files from structure)*

## Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js)
*   PostgreSQL (running locally or via Docker)

## Setup and Installation

### 1. Clone the Repository
```bash
git clone <repository_url>
cd <repository_name>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
1.  Create a `.env` file: `cp .env.example .env`
2.  Edit `.env` with your PostgreSQL credentials, a strong `JWT_SECRET`, and other configurations as needed.

### 4. Set up PostgreSQL Database
Ensure PostgreSQL is running. Connect to your PostgreSQL instance and run the following SQL commands to create the database (if not already created via `.env` settings by your setup) and the necessary tables:

```sql
-- Example: CREATE DATABASE myapp_dev;
-- Connect to your database before running table creations.

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members Table (for Janaza Fund)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    address TEXT,
    location VARCHAR(100) NOT NULL,
    janaza2024 JSONB, -- e.g., {"jan": "Paid", "feb": "Not_Paid"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mahallah Members Table
CREATE TABLE IF NOT EXISTS mahallah_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(50), 
    address TEXT,
    telephone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hifl Members Table
CREATE TABLE IF NOT EXISTS hifl_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    telephone VARCHAR(50),
    location VARCHAR(100),
    zone VARCHAR(50),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Active', -- e.g., Active, Inactive, Graduated, Dropped
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Seed the Database
This script also creates tables if they don't exist (due to `IF NOT EXISTS` in table creation SQL and Hifl table creation logic in seed script).
It populates sample data, including predefined test users.
```bash
npm run db:seed
```

## Running the Application

1.  **Start the Backend Server:**
    *   Development: `npm run start:dev` (Server at `http://localhost:3000` or your `PORT`)
    *   Production: `npm start`

2.  **Access the Frontend:**
    Open `http://localhost:3000/` in your web browser. This serves `public/login.html`.
    After login, admins are redirected to `public/dashboard.html`.

*(Tailwind CSS: `output.css` is pre-compiled. For development, run `npx tailwindcss -i ./input.css -o ./public/output.css --watch` if making style changes.)*

## Test Users
The database seeding script (`npm run db:seed`) creates the following test users:
*   **Admin:**
    *   Username: `admintest`
    *   Password: `adminpassword`
*   **Regular User (for testing non-admin access if applicable, though current frontend primarily serves admin or public views):**
    *   Username: `membertest`
    *   Password: `memberpassword`
*   (Other users like `testuser`, `adminuser` might also be present from earlier seed data.)

## API Endpoints

### Authentication
*   **`POST /api/auth/login`**: Authenticates a user.
    *   Body: `{ "username": "...", "password": "..." }`

### Public API Endpoints (No Auth Required)
*   **`GET /api/public/members/janaza/:location`**: Retrieves public Janaza member details for a given location.
    *   Params: `location` (e.g., "AraliyaUyana").
    *   Response: `[ { "id", "name", "address", "location" }, ... ]`
*   **`GET /api/public/members/mahallah/zone/:zone`**: Retrieves public Mahallah member details for a specific zone.
    *   Params: `zone` (e.g., "2C").
    *   Response: `[ { "id", "name", "zone" }, ... ]`
*   **`GET /api/public/members/mahallah/:location`**: Retrieves public Mahallah members where location is treated as a zone.
*   **`GET /api/public/members/mahallah/:location/:zone`**: Retrieves public Mahallah members by zone (location param ignored by controller).


### Dashboard API Endpoints (JWT Auth Required - Prefix: `/api/dashboard`)

#### Janaza Members (`/members`)
*   **`GET /members`**: Retrieves Janaza members with pagination and filtering.
    *   Query Params: `location`, `janazaMonth`, `janazaStatus`, `search`, `page`, `limit`.
*   **`POST /members`**: Creates a new Janaza member.
*   **`GET /members/id/:memberId`**: Retrieves a Janaza member by ID.
*   **`PUT /members/:memberId`**: Updates a Janaza member.
*   **`DELETE /members/:memberId`**: Deletes a Janaza member.
*   **`PATCH /members/:memberId/payment-status`**: Updates monthly payment status.

#### Mahalla Members (`/mahallah-members`)
*   **`GET /mahallah-members`**: Retrieves Mahalla members with pagination and filtering.
    *   Query Params: `location`, `zone`, `search`, `page`, `limit`.
*   **`POST /mahallah-members`**: Creates a new Mahalla member.
*   **`GET /mahallah-members/:memberId`**: Retrieves a Mahalla member by ID.
*   **`PUT /mahallah-members/:memberId`**: Updates a Mahalla member.
*   **`DELETE /mahallah-members/:memberId`**: Deletes a Mahalla member.

#### Hifl Members (`/hifl-members`)
*   **`GET /hifl-members`**: Retrieves Hifl members with pagination and filtering.
    *   Query Params: `location`, `zone`, `status`, `search`, `page`, `limit`.
*   **`POST /hifl-members`**: Creates a new Hifl member.
*   **`GET /hifl-members/:id`**: Retrieves a Hifl member by ID.
*   **`PUT /hifl-members/:id`**: Updates a Hifl member.
*   **`DELETE /hifl-members/:id`**: Deletes a Hifl member.

#### Admins (`/admins`)
*   **`GET /admins`**: Retrieves admin users with pagination.
    *   Query Params: `page`, `limit`.
*   **`POST /admins`**: Creates a new admin user.
    *   Body: `{ "username", "password", "address" }`
*   **`GET /admins/:adminId`**: Retrieves an admin user by ID.
*   **`PUT /admins/:adminId`**: Updates an admin user (address, password).
*   **`DELETE /admins/:adminId`**: Deletes an admin user (cannot self-delete).

## Known Issues / Limitations
*   **Admin Management Frontend:** The UI for listing, editing, and deleting admin users within the "Admin Management" section of the dashboard (`public/dashboard.html`) is **not yet implemented**. While the backend APIs for these operations are complete and functional, the frontend components for interaction were not completed due to development tool limitations encountered during the project.
*   **Janaza Member Zone Filtering (Backend):** The `members` table (for Janaza members) does not have a dedicated `zone` column. Filtering Janaza members by `zone` via the API (`GET /api/dashboard/members?zone=...`) is not currently supported at the database query level.
*   **Mahallah Member Location Filtering (Backend):** The `mahallah_members` table does not have a dedicated `location` column (it uses `zone`). The API (`GET /api/dashboard/mahallah-members?location=...`) attempts to match the `location` parameter against the `zone` field if a specific `zone` filter is not also provided. True multi-zone location filtering would require a backend location-to-zone mapping.

## Linting and Formatting
... (Content remains the same) ...

## Contributing
... (Content remains the same) ...

## License
... (Content remains the same) ...
