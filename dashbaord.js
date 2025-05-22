// Initialize dashboard view on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', function() {
    const janazaDetails = document.getElementById('janaza-details');
    const mahallaDetails = document.getElementById('mahallah-details');
    const hiflDetails = document.getElementById('hifl-details');
    const janazaContent = document.getElementById('janaza-content');
    const mahallaContent = document.getElementById('mahallah-content');
    const hiflContent = document.getElementById('hifl-content');
    const locationSelector = document.getElementById('location-selector');

    function setActiveView(viewName) {
        janazaContent.style.display = 'none';
        mahallaContent.style.display = 'none';
        hiflContent.style.display = 'none';
        janazaDetails.classList.remove('active');
        mahallaDetails.classList.remove('active');
        hiflDetails.classList.remove('active');
        locationSelector.style.display = 'none';

        if (viewName === 'janaza') {
            janazaContent.style.display = 'block';
            janazaDetails.classList.add('active');
            locationSelector.style.display = 'block';
            updateHeaderText('Select a Location');
        } else if (viewName === 'mahalla') {
            mahallaContent.style.display = 'block';
            mahallaDetails.classList.add('active');
            updateHeaderText('Mahallah Member Details');
            loadMahallaMembers(); 
        } else if (viewName === 'hifl') {
            hiflContent.style.display = 'block';
            hiflDetails.classList.add('active');
            updateHeaderText('Hifl Madarasa');
        }
    }

    janazaDetails.addEventListener('click', () => setActiveView('janaza'));
    mahallaDetails.addEventListener('click', () => setActiveView('mahalla'));
    hiflDetails.addEventListener('click', () => setActiveView('hifl'));
    setActiveView('janaza');
});


// Function to load data for a specific location (Janaza members).
// This is called by the inline onclick handlers in dashboard.html
// Make sure global function loadLocation is defined
window.loadLocation = async function(shortForm, fullName) {
    const locationHeader = document.getElementById('location-header');
    updateHeaderText(fullName);
    locationHeader.dataset.shortForm = shortForm; // Store shortForm for later use (e.g. adding members)
    console.log(`Loading Janaza members for location: ${fullName} (${shortForm})`);
    await fetchMembersAndPopulateTable(shortForm);
}


async function fetchMembersAndPopulateTable(location) {
    const tableBody = document.querySelector("#janaza-content tbody"); // Target Janaza table body
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading members...</td></tr>'; // Show loading state

    try {
        console.log(`Fetching Janaza members for location: ${location}`);
        // Assuming authenticatedFetch is globally available from api.js
        const members = await authenticatedFetch(`/api/dashboard/members/${location}`, { method: 'GET' });
        populateTable(members); // Pass the direct array
    } catch (error) {
        console.error("Error fetching Janaza members:", error.message);
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-error">Failed to load members: ${error.message}. Please try again.</td></tr>`;
        // Optionally use Swal.fire for a more prominent error message
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: `Failed to load members for ${location}: ${error.message}`,
        });
    }
}

function populateTable(members) { // members is now a direct array
    const tableBody = document.querySelector("#janaza-content tbody"); // Target Janaza table body
    tableBody.innerHTML = ""; // Clear existing rows (loading message or previous data)

    if (!members || members.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No members found for this location.</td></tr>';
        return;
    }

    members.forEach((member) => {
        // Assuming API returns: id, name, address, telephone, janaza2024 (object)
        // Adjust property names if different (e.g., member.Id to member.id)
        const row = createTableRow(member); 
        tableBody.insertAdjacentHTML('beforeend', row); // More efficient than innerHTML +=
    });
}

// Create HTML string for a single table row for Janaza members.
function createTableRow(member) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    // Ensure janaza2024 is an object, default to empty if null/undefined
    const memberPayments = member.janaza2024 || {}; 

    const paymentStatuses = months.map(month => {
        const status = memberPayments[month] || "Not_Paid"; // Default to "Not_Paid" if month not in object
        return `
            <div class="flex flex-col items-center font-display">
                <span class="text-xs font-semibold mb-1">${month.toUpperCase()}</span>
                <select class="select select-bordered select-xs w-full font-display"
                        onchange="updatePaymentStatus('${member.id}', '${month}', this.value)">
                    <option value="Not_Paid" ${status === "Not_Paid" ? "selected" : ""}>Not Paid</option>
                    <option value="Paid" ${status === "Paid" ? "selected" : ""}>Paid</option>
                    <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Waived" ${status === "Waived" ? "selected" : ""}>Waived</option>
                </select>
            </div>`;
    }).join("");

    // Using lowercase property names as per typical API responses and model definitions
    return `
        <tr id="row-${member.id}" class="font-display">
            <td class="p-4 border-b border-base-300">
                <div class="flex items-center gap-3">
                    <div class="flex flex-col">
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="name-${member.id}">
                            ${member.name}
                        </p>
                        <input type="text" name="username" placeholder="Enter your Username" class="input input-bordered pl-2 w-48 hidden" id="name-input-${member.id}" value="${member.name}" required>
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content opacity-70" id="telephone-${member.id}">
                            ${member.telephone || 'N/A'}
                        </p>
                        <input type="text" name="telephone" placeholder="Enter your Telephone" class="input input-bordered pl-2 w-48 hidden" id="telephone-input-${member.id}" value="${member.telephone || ''}" required>
                    </div>
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-col">
                    <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="address-${member.id}">
                        ${member.address || 'N/A'}
                    </p>
                    <input type="text" name="address" placeholder="Enter your Address" class="input input-bordered pl-2 w-48 hidden" id="address-input-${member.id}" value="${member.address || ''}" required>
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-wrap gap-2 font-display">
                    ${paymentStatuses}
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-col items-start gap-2">
                    <button class="btn btn-ghost btn-xs w-full font-display"
                        type="button" onclick="editMember('${member.id}')" id="edit-button-${member.id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-pencil-simple w-4 h-4 mr-2"></i>Edit
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="updateMember('${member.id}')" id="update-button-${member.id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-check-circle w-4 h-4 mr-2"></i>Update
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="cancelEdit('${member.id}')" id="cancel-button-${member.id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-x-circle w-4 h-4 mr-2"></i>Cancel
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="deleteMember('${member.id}')" id="delete-button-${member.id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-trash w-4 h-4 mr-2"></i>Delete
                        </span>
                    </button>
                </div>
            </td>
        </tr>`;
}


// --- Functions below are placeholders or need further refactoring with authenticatedFetch ---

async function loadMahallaMembers() {
    console.log("loadMahallaMembers called");
    const tableBody = document.getElementById("mahallah-table-body");
    if (!tableBody) {
        console.error("Mahallah table body not found");
        return;
    }
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading Mahalla members...</td></tr>';

    try {
        // Optional: Add zone filter if needed, e.g., by getting a zone from UI
        // const zone = document.getElementById('some-zone-selector')?.value;
        // const url = zone ? `/api/dashboard/mahallah-members?zone=${zone}` : '/api/dashboard/mahallah-members';
        const members = await authenticatedFetch('/api/dashboard/mahallah-members', { method: 'GET' });
        
        tableBody.innerHTML = ""; // Clear loading message

        if (!members || members.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No Mahalla members found.</td></tr>';
            return;
        }

        members.forEach((member) => {
            const row = createMahallaTableRow(member);
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error("Error fetching Mahalla members:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Failed to load Mahalla members: ${error.message}.</td></tr>`;
        Swal.fire({
            icon: 'error',
            title: 'Mahalla Loading Error',
            text: `Failed to load Mahalla members: ${error.message}`,
        });
    }
}

// Removed handleMahallaMembers function as it's no longer used.

function createMahallaTableRow(member) {
    // Ensure properties are lowercase, matching typical API responses from Node/Express
    return `
        <tr id="row-mahalla-${member.id}" class="font-display">
            <td class="p-4 border-b border-base-300">${member.zone || 'N/A'}</td>
            <td class="p-4 border-b border-base-300">${member.name || 'N/A'}</td>
            <td class="p-4 border-b border-base-300">${member.address || 'N/A'}</td>
            <td class="p-4 border-b border-base-300">${member.telephone || 'N/A'}</td>
            <td class="p-4 border-b border-base-300">
                <button class="btn btn-ghost btn-xs" onclick="alert('Edit for Mahalla member ID ${member.id} not implemented yet.')">Edit</button>
            </td>
        </tr>`;
}

async function updatePaymentStatus(memberId, month, status) {
    const locationHeader = document.getElementById('location-header');
    const location = locationHeader.dataset.shortForm; 
    console.log(`Updating payment status for member ${memberId}, month ${month}, status ${status}, location ${location}`);
    
    // TODO: Refactor this to use authenticatedFetch
    try {
        const updatedMember = await authenticatedFetch(`/api/dashboard/members/${memberId}/payment-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, status })
        });
        console.log(`Payment status updated for member ${memberId}, month ${month}:`, updatedMember);
        Swal.fire({
            icon: 'success',
            title: 'Payment Status Updated',
            text: `Payment for ${month} set to ${status}.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } catch (error) {
        console.error(`Error updating payment status for member ${memberId}, month ${month}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: `Failed to update payment status: ${error.message}. Please try again.`,
        });
        // Optionally, revert the select dropdown to its previous value if you store it before changing.
    }
}


function editMember(memberId) {
    // This function toggles UI elements for inline editing.
    // It does not directly make API calls, so authenticatedFetch is not directly used here.
    // However, the updateMember function it calls WILL need to use authenticatedFetch.
    console.log(`Toggling edit mode for member ${memberId}`);
    const nameElement = document.getElementById(`name-${memberId}`);
    const nameInput = document.getElementById(`name-input-${memberId}`);
    const telephoneElement = document.getElementById(`telephone-${memberId}`);
    const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
    const addressElement = document.getElementById(`address-${memberId}`);
    const addressInput = document.getElementById(`address-input-${memberId}`);
    const editButton = document.getElementById(`edit-button-${memberId}`);
    const updateButton = document.getElementById(`update-button-${memberId}`);
    const cancelButton = document.getElementById(`cancel-button-${memberId}`);
    const deleteButton = document.getElementById(`delete-button-${memberId}`);

    nameElement.classList.add('hidden');
    nameInput.classList.remove('hidden');
    telephoneElement.classList.add('hidden');
    telephoneInput.classList.remove('hidden');
    addressElement.classList.add('hidden');
    addressInput.classList.remove('hidden');
    
    editButton.classList.add('hidden');
    updateButton.classList.remove('hidden');
    cancelButton.classList.remove('hidden');
    if(deleteButton) deleteButton.classList.remove('hidden');
}

function cancelEdit(memberId) {
    // This function also toggles UI elements.
    console.log(`Cancelling edit for member ${memberId}`);
    exitEditMode(memberId);
}

function exitEditMode(memberId) {
    const nameElement = document.getElementById(`name-${memberId}`);
    const nameInput = document.getElementById(`name-input-${memberId}`);
    const telephoneElement = document.getElementById(`telephone-${memberId}`);
    const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
    const addressElement = document.getElementById(`address-${memberId}`);
    const addressInput = document.getElementById(`address-input-${memberId}`);
    const editButton = document.getElementById(`edit-button-${memberId}`);
    const updateButton = document.getElementById(`update-button-${memberId}`);
    const cancelButton = document.getElementById(`cancel-button-${memberId}`);
    const deleteButton = document.getElementById(`delete-button-${memberId}`);

    nameElement.classList.remove('hidden');
    nameInput.classList.add('hidden');
    telephoneElement.classList.remove('hidden');
    telephoneInput.classList.add('hidden');
    addressElement.classList.remove('hidden');
    addressInput.classList.add('hidden');

    editButton.classList.remove('hidden');
    updateButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    if(deleteButton) deleteButton.classList.add('hidden');
}


async function updateMember(memberId) {
    console.log(`Attempting to update member ${memberId}`);
    const nameInput = document.getElementById(`name-input-${memberId}`);
    const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
    const addressInput = document.getElementById(`address-input-${memberId}`);
    const location = document.getElementById('location-header').dataset.shortForm;


    const memberData = {
        name: nameInput.value,
        telephone: telephoneInput.value,
        address: addressInput.value,
        location: location // Include location if your API requires it for update context
        // janaza2024 field is not part of this direct update, it's handled by updatePaymentStatus
    };

    // TODO: Refactor to use authenticatedFetch
    // console.warn("updateMember needs refactoring to use authenticatedFetch.");
    
    try {
        // First, fetch the current member's data to get existing location and janaza2024
        const currentMember = await authenticatedFetch(`/api/dashboard/members/id/${memberId}`, { method: 'GET' });
        if (!currentMember) {
            Swal.fire("Error", "Could not fetch current member details. Update aborted.", "error");
            return;
        }

        const payload = {
            name: nameInput.value,
            telephone: telephoneInput.value,
            address: addressInput.value,
            location: currentMember.location, // Use existing location
            janaza2024: currentMember.janaza2024 // Preserve existing payment data
        };

        const updatedMemberFromAPI = await authenticatedFetch(`/api/dashboard/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Update UI with data from API response
        const nameElement = document.getElementById(`name-${memberId}`);
        const telephoneElement = document.getElementById(`telephone-${memberId}`);
        const addressElement = document.getElementById(`address-${memberId}`);
        
        nameElement.textContent = updatedMemberFromAPI.name;
        telephoneElement.textContent = updatedMemberFromAPI.telephone;
        addressElement.textContent = updatedMemberFromAPI.address;
        
        Swal.fire("Updated!", "Member details have been updated.", "success");
        exitEditMode(memberId);

    } catch (error) {
        console.error("Failed to update member:", error);
        Swal.fire("Error", `Failed to update member: ${error.message || 'Unknown error'}. Please try again.`, "error");
    }
}

// Removed handleMemberUpdateResult as it's no longer used.


function showAddMemberRow() {
    document.getElementById('add-member-row').classList.remove('hidden');
}

function cancelAddMember() {
    document.getElementById('add-member-row').classList.add('hidden');
    document.getElementById('new-member-name').value = '';
    document.getElementById('new-member-telephone').value = '';
    document.getElementById('new-member-address').value = '';
}

async function addNewMember() {
    const name = document.getElementById('new-member-name').value;
    const telephone = document.getElementById('new-member-telephone').value;
    const address = document.getElementById('new-member-address').value;
    const location = document.getElementById('location-header').dataset.shortForm;

    if (!name || !telephone || !address || !location) {
        Swal.fire("Validation Error", "Please fill in all fields and ensure a location is selected.", "error");
        return;
    }

    const memberData = { name, telephone, address, location };
    console.log("Adding new member:", memberData);

    // TODO: Refactor to use authenticatedFetch
    console.warn("addNewMember needs refactoring to use authenticatedFetch.");
    
    try {
       const newMember = await authenticatedFetch('/api/dashboard/members', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(memberData)
       });
       Swal.fire("Added!", "Member has been successfully added.", "success");
       cancelAddMember(); // Hide form and clear fields
       await fetchMembersAndPopulateTable(location); // Refresh table for the current location
    } catch (error) {
       console.error("Failed to add member:", error);
       Swal.fire("Error", `Failed to add member: ${error.message || 'Unknown error'}.`, "error");
    }
}

// Removed handleAddMemberResult function as it's no longer used.


async function deleteMember(memberId) {
    const location = document.getElementById('location-header').dataset.shortForm;
    console.log(`Attempting to delete member ${memberId} from location ${location}`);

    // TODO: Refactor to use authenticatedFetch
    // console.warn("deleteMember needs refactoring to use authenticatedFetch.");

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await authenticatedFetch(`/api/dashboard/members/${memberId}`, { method: 'DELETE' });
                document.getElementById(`row-${memberId}`)?.remove();
                Swal.fire("Deleted!", "Member has been deleted.", "success");
            } catch (error) {
                console.error(`Failed to delete member ${memberId}:`, error);
                Swal.fire("Error", `Failed to delete member: ${error?.message || 'Unknown error'}.`, "error");
            }
        }
    });
}

// Removed handleDeleteMemberResult as it's no longer used.


function showAddAdminRow() {
    document.getElementById('add-admin-row').classList.remove('hidden');
}

function cancelAddAdminMember() {
    document.getElementById('add-admin-row').classList.add('hidden');
    document.getElementById('new-admin-name').value = '';
    document.getElementById('new-admin-password').value = '';
    document.getElementById('new-admin-address').value = '';
}

async function addNewAdmin() {
    const username = document.getElementById('new-admin-name').value;
    const address = document.getElementById('new-admin-address').value;
    const password = document.getElementById('new-admin-password').value;

    if (!username || !password) { // Address is optional
        Swal.fire("Validation Error", "Username and Password are required.", "error");
        return;
    }
    const adminData = { username, password, address };
    console.log("Adding new admin:", adminData);
    
    // TODO: Refactor to use authenticatedFetch
    // console.warn("addNewAdmin needs refactoring to use authenticatedFetch.");
    
    try {
       const newAdmin = await authenticatedFetch('/api/dashboard/admins', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(adminData)
       });
       Swal.fire("Admin Added!", `Administrator account for ${newAdmin.username} has been successfully created.`, "success");
       cancelAddAdminMember();
       // No admin list to refresh currently, but if there was one, call its refresh function here.
    } catch (error) {
       console.error("Failed to add admin:", error);
       Swal.fire("Error", `Failed to add admin: ${error.message || 'Unknown error'}.`, "error");
    }
}

// Removed handleAddAdminResult as it's no longer used.


function updateHeaderText(text) {
    const headerElement = document.getElementById('location-header');
    if (headerElement) {
        headerElement.textContent = text;
    }
}
