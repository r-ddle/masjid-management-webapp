# Masjid Management System - Web Version

Masjid Management System - Web Version is a web-based application designed to help manage members, locations, zones, and related administrative details for a Masjid. It provides a central dashboard for easy data viewing and management.

## Features

*   User authentication (login)
*   Dashboard for viewing and managing data
*   Location and Zone selection/filtering for targeted data display
*   Management of Janaza Member Details
*   Management of Mahallah Member Details
*   Management of Hifl Madarsa Details
*   Functionality to add new members to the system
*   Functionality to add new admin accounts

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript, Tailwind CSS, DaisyUI
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (using Mongoose ODM)

## Setup and Installation

1.  **Prerequisites:**
    *   Node.js and npm (Node Package Manager) installed.
    *   MongoDB installed and running.

2.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd masjid-management-system-webversion
    ```
    (Replace `<repository_url>` with the actual URL of the repository)

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure MongoDB:**
    *   Open the `server.js` file.
    *   Locate the MongoDB connection string: `mongoose.connect('mongodb://localhost:27017/mydb', ...)`
    *   If your MongoDB instance is running on a different host or port, or requires authentication, update this string accordingly.

5.  **CSS Styling:**
    *   The project uses Tailwind CSS. The compiled CSS file is `output.css` (and `ouput.css`, though this might be a typo in the file listing).
    *   If you make changes to Tailwind CSS configuration (`tailwind.config.js`) or HTML classes, you may need to rebuild the CSS. The `package.json` does not specify a build script, so you might need to run the Tailwind CLI command directly if you modify styles (e.g., `npx tailwindcss -i ./input.css -o ./output.css --watch`).

6.  **Run the application:**
    ```bash
    node server.js
    ```
    The application should now be running on `http://localhost:3000`.

## Usage

1.  Once the application is running, open your web browser and navigate to `http://localhost:3000`.
2.  You will be presented with the login page.
3.  Enter your admin credentials to log in. (Note: You may need to create an initial admin user directly in the MongoDB `users` collection if one doesn't exist. The schema is `username: String, password: String`).
4.  After successful login, you will be redirected to the dashboard (`dashboard.html`).
5.  From the dashboard, you can:
    *   Select a Location and/or Zone to filter member data.
    *   View Janaza, Mahallah, or Hifl Madarsa member details.
    *   Add new members using the 'Add Member' button.
    *   Add new admin accounts using the 'Add Admin' button.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these general guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Ensure your code follows the project's coding style (if specified).
5.  Write tests for your changes (if applicable).
6.  Submit a pull request with a clear description of your changes.

(Further details on specific contribution processes can be added here as the project evolves.)

## License

This project is licensed under the ISC License. See the `LICENSE` file for more details (if one is created - typically, the ISC license text would be here or in a separate LICENSE file).

Copyright (c) 2024 [Your Name/Organization] (Please update with your name or organization)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
