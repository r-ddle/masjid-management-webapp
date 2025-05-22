async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('authToken');

    // Initialize headers if not provided
    options.headers = options.headers || {};

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    } else {
        // For dashboard operations, a token is generally expected.
        // Redirecting if no token is a common pattern for protected routes.
        console.warn('No auth token found in localStorage. Redirecting to login.');
        window.location.href = 'index.html'; // Redirect to login
        throw new Error('Authentication required. Redirecting to login.'); // Stop further execution
    }

    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            console.error('Unauthorized (401). Redirecting to login.');
            localStorage.removeItem('authToken'); // Clear potentially invalid token
            window.location.href = 'index.html';
            throw new Error('Unauthorized'); // Stop further processing in the calling function
        }

        // For other non-ok responses, try to parse error from body, then throw
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If response body is not JSON or empty
                errorData = { message: response.statusText || 'Unknown error' };
            }
            console.error(`API Error (${response.status}):`, errorData);
            throw new Error(`API Error (${response.status}): ${errorData.message}`);
        }

        // If response is ok, parse and return JSON data
        // Handle cases where response might be OK but body is empty (e.g., 204 No Content)
        if (response.status === 204) {
            return null; // Or undefined, or an empty object, depending on expected behavior
        }
        return await response.json();

    } catch (error) {
        // Handle network errors or errors thrown from response checks
        console.error('Fetch operation failed:', error.message);
        // Re-throw the error so the calling function can handle it (e.g., update UI)
        // If it's an error we constructed (like 'API Error...'), it will be re-thrown as is.
        // If it's a network error, it will be re-thrown.
        throw error; 
    }
}
