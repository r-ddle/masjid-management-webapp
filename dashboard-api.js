// This file will centralize API calls for dashboard operations,
// utilizing the authenticatedFetch helper from api.js.

/**
 * Adds a new admin user.
 * @param {object} adminData - The admin data.
 * @param {string} adminData.username - The username of the new admin.
 * @param {string} adminData.password - The password for the new admin.
 * @param {string} [adminData.address] - The optional address for the new admin.
 * @returns {Promise<object>} The response from the API (typically the new admin user object).
 * @throws {Error} If the API call fails.
 */
async function addNewAdminAPI(adminData) {
    if (!adminData || !adminData.username || !adminData.password) {
        throw new Error('Username and password are required to add a new admin.');
    }

    try {
        // authenticatedFetch is globally available from api.js
        const response = await authenticatedFetch('/api/dashboard/admins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });
        return response; // authenticatedFetch already parses JSON and handles non-OK errors
    } catch (error) {
        // Log the error for debugging and re-throw to be handled by the caller
        console.error('Error in addNewAdminAPI:', error.message);
        throw error; // Re-throw the error to be caught by the calling function in dashbaord.js
    }
}

// Future dashboard-related API functions can be added here:
// e.g., editMemberAPI, deleteMemberAPI, updatePaymentStatusAPI, etc.
