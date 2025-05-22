document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.getElementById('password'); // Use ID for password input
    const showPasswordCheckbox = document.getElementById('showPassword');
    const errorElement = document.getElementById('errorMessage'); // Use the existing p tag in HTML
    const loginButton = document.getElementById('loginButton');

    // Show Password Functionality
    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener('change', function() {
            passwordInput.type = this.checked ? 'text' : 'password';
        });
    }

    if (loginForm && usernameInput && passwordInput && errorElement && loginButton) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Clear previous error states and set loading state
            usernameInput.classList.remove('input-error');
            passwordInput.classList.remove('input-error');
            errorElement.textContent = ''; // Clear previous error message
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Logging in...';


            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json(); // Try to parse JSON regardless of status

                if (response.ok && data.token) {
                    // Login successful
                    console.log("Login successful:", data);
                    localStorage.setItem('authToken', data.token);
                    // Optionally store user info: localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/dashboard.html'; // Corrected redirect path
                    // No need to clear password or re-enable button here due to redirect
                    return; // Exit function to prevent finally block from running unnecessarily before redirect
                } else {
                    // Login failed - server returned an error or no token
                    const errorMessageText = data.message || `Login failed: ${response.statusText || response.status}`;
                    console.error("Login failed:", errorMessageText, data);
                    errorElement.textContent = errorMessageText;
                    usernameInput.classList.add('input-error');
                    passwordInput.classList.add('input-error');
                    
                    // Focus on the field with the error if discernible from the message
                    if (data.message) {
                        if (data.message.toLowerCase().includes('username')) {
                            usernameInput.focus();
                        } else if (data.message.toLowerCase().includes('password')) {
                            passwordInput.focus();
                        }
                    }
                }
            } catch (error) {
                // Network error or other issue with fetch itself
                console.error("Error during login (network/fetch issue):", error);
                errorElement.textContent = 'Login request failed. Please check your connection and try again.';
                usernameInput.classList.add('input-error');
                passwordInput.classList.add('input-error');
            } finally {
                // Re-enable button and reset text, unless a redirect is happening
                // The 'return' statement in the success case prevents this from running before redirect.
                // Check if we are still on the login page before trying to modify the button.
                if (document.getElementById('loginButton')) { 
                    loginButton.disabled = false;
                    loginButton.innerHTML = 'Login';
                }
                // Do not clear password on failed attempt, allow user to correct it or show/hide it.
            }
        });
    } else {
        console.error('Essential login form elements not found. Check IDs and HTML structure.');
        if (!loginForm) console.error('Login form not found');
        if (!usernameInput) console.error('Username input not found');
        if (!passwordInput) console.error('Password input not found');
        if (!errorElement) console.error('Error message element not found');
        if (!loginButton) console.error('Login button not found');
    }
});