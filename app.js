document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const cardBody = document.querySelector('.card-body'); // The div that might get input-error class

    // Create an error message element if it doesn't exist and append it to the form
    let errorElement = document.getElementById('loginErrorMessage');
    if (!errorElement && loginForm) {
        errorElement = document.createElement('p');
        errorElement.id = 'loginErrorMessage';
        errorElement.className = 'text-error text-sm mt-2 text-center'; // DaisyUI styled
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
            // Insert the error message before the submit button
            submitButton.parentNode.insertBefore(errorElement, submitButton);
        } else {
            // Fallback: append to the form if button not found (less ideal placement)
            loginForm.appendChild(errorElement);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Clear previous error states
            usernameInput.classList.remove('input-error');
            passwordInput.classList.remove('input-error');
            if (cardBody) cardBody.classList.remove('input-error'); // Clear error from card-body
            if (errorElement) errorElement.textContent = ''; // Clear previous error message text

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json(); // Try to parse JSON regardless of status

                if (response.ok) {
                    // Login successful (status 200-299)
                    console.log("Login successful:", data);
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        // Optionally store user info: localStorage.setItem('user', JSON.stringify(data.user));
                        window.location.href = 'dashboard.html'; // Redirect to dashboard
                    } else {
                        // This case means success (2xx) but no token, which is unusual for login
                        console.error("Login successful, but no token received.");
                        if (errorElement) errorElement.textContent = 'Login succeeded but no token was provided.';
                        usernameInput.classList.add('input-error');
                        passwordInput.classList.add('input-error');
                        if (cardBody) cardBody.classList.add('input-error');
                    }
                    // Clear password field even if token is missing but response is ok
                    passwordInput.value = ''; 
                } else {
                    // Login failed - server returned an error (e.g., 400, 401, 500)
                    console.error("Login failed (server error):", data);
                    const errorMessage = data.message || `Login failed: ${response.statusText || response.status}`;
                    if (errorElement) errorElement.textContent = errorMessage;
                    usernameInput.classList.add('input-error');
                    passwordInput.classList.add('input-error');
                    if (cardBody) cardBody.classList.add('input-error');
                    passwordInput.value = ''; // Clear password field
                }
            } catch (error) {
                // Network error or other issue with fetch itself (e.g., failed to connect, CORS issue)
                console.error("Error during login (network/fetch issue):", error);
                if (errorElement) errorElement.textContent = 'Login request failed. Please check your connection and try again.';
                usernameInput.classList.add('input-error');
                passwordInput.classList.add('input-error');
                if (cardBody) cardBody.classList.add('input-error');
                passwordInput.value = ''; // Clear password field
            }
        });
    }
});