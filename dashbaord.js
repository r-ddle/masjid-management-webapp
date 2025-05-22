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
        // Hide all content sections
        janazaContent.style.display = 'none';
        mahallaContent.style.display = 'none';
        hiflContent.style.display = 'none';

        // Remove 'active' class from all nav links
        janazaDetails.classList.remove('active');
        mahallaDetails.classList.remove('active');
        hiflDetails.classList.remove('active');

        // Show/hide location selector
        locationSelector.style.display = 'none'; // Default to hidden

        if (viewName === 'janaza') {
            janazaContent.style.display = 'block';
            janazaDetails.classList.add('active');
            locationSelector.style.display = 'block';
            updateHeaderText('Select a Location');
        } else if (viewName === 'mahalla') {
            mahallaContent.style.display = 'block';
            mahallaDetails.classList.add('active');
            updateHeaderText('Mahallah Member Details');
            loadMahallaMembers(); // Specific to Mahalla view
        } else if (viewName === 'hifl') {
            hiflContent.style.display = 'block'; // Corrected: show hiflContent
            hiflDetails.classList.add('active');
            updateHeaderText('Hifl Madarasa');
        }
    }

    janazaDetails.addEventListener('click', function() {
        setActiveView('janaza');
    });

    mahallaDetails.addEventListener('click', function() {
        setActiveView('mahalla');
    });
    
    hiflDetails.addEventListener('click', function() {
        setActiveView('hifl');
    });

    // Set the default view
    setActiveView('janaza'); // Default to Janaza view

});

// Check for WebView2 availability on DOMContentLoaded.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    if (window.chrome && window.chrome.webview) {
        console.log("WebView2 is available");
    } else {
        console.error("WebView2 is not available");
    }
});

// Function to load data for a specific location.
function loadLocation(location) {
    console.log(`Loading location: ${location}`);
    fetchMembersAndPopulateTable(location);
    
}


function loadMahallaMembers() {
    chrome.webview.postMessage({ action: "getMahallaMembers" });
}

// Fetch member list from C# backend.
function fetchMembersAndPopulateTable(location) {
    try {
        console.log(`Fetching members for location: ${location}`);
        chrome.webview.postMessage({ action: "getMembers", location: location });
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

// Callback function to handle received member list.
function handleMembers(location, membersJson) {
    console.log(`Received ${location} members data:`, membersJson);
    populateTable(membersJson);
}
chrome.webview.addEventListener('message', (event) => {
    console.log("Received message from WebView:", event);
    const { action, data } = event;
    if (action === "getMembers") {
        const location = data.location;
        handleMembers(location, data.members);
    }
});

function handleMahallaMembers(membersJson) {
    console.log(`Received Mahallah members data:`, membersJson);
    const tableBody = document.getElementById("mahallah-table-body");
    if (!tableBody) {
        console.error("Mahallah table body not found");
        return;
    }
    tableBody.innerHTML = ""; // Clear existing rows

    const members = JSON.parse(membersJson);
    members.forEach((member) => {
        const row = createMahallaTableRow(member);
        tableBody.innerHTML += row;
    });
}

// Update payment status for a member.
function updatePaymentStatus(memberId, month, status) {
    const locationHeader = document.getElementById('location-header');
    const statusLocation = locationHeader.dataset.shortForm;
    console.log('Location header element:', locationHeader);
    console.log('Status location from dataset:', statusLocation);
    
    const message = {
        action: "updatePaymentStatus",
        Id: memberId,
        month: month,
        status: status,
        statusLocation: statusLocation
    };
    console.log("Sending updatePaymentStatus message:", JSON.stringify(message));
    chrome.webview.postMessage(message);
}

// Populate the main data table with member information.
function populateTable(membersJson) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    membersJson.forEach((memberJson) => {
        const row = createTableRow(memberJson);
        tableBody.innerHTML += row;
    });
}

// Create HTML string for a single table row.
function createTableRow(member) {
    const months = [
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    const paymentStatuses = months
        .map(
            (month) =>
                `<div class="flex flex-col items-center font-display">
                    <span class="text-xs font-semibold mb-1">${month.toUpperCase()}</span>
                    <select class="select select-bordered select-xs w-full font-display"
                            onchange="updatePaymentStatus('${member.Id}', '${month}', this.value)">
                        <option value="Not_Paid" ${member.Janaza2024[month] === "Not_Paid" ? "selected" : ""}>Not Paid</option>
                        <option value="Paid" ${member.Janaza2024[month] === "Paid" ? "selected" : ""}>Paid</option>
                    </select>
                </div>`
        )
        .join("");

    return `
        <tr id="row-${member.Id}" class="font-display">
            <td class="p-4 border-b border-base-300">
                <div class="flex items-center gap-3">
                    <div class="flex flex-col">
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="name-${member.Id}">
                            ${member.Name}
                        </p>
                        <input type="text" name="username" placeholder="Enter your Username" class="input input-bordered pl-2 w-48 hidden" id="name-input-${member.Id}" value="${member.Name}" required>
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content opacity-70" id="telephone-${member.Id}">
                            ${member.Telephone}
                        </p>
                        <input type="text" name="telephone" placeholder="Enter your Telephone" class="input input-bordered pl-2 w-48 hidden" id="telephone-input-${member.Id}" value="${member.Telephone}" required>
                    </div>
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-col">
                    <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="address-${member.Id}">
                        ${member.Address}
                    </p>
                    <input type="text" name="address" placeholder="Enter your Address" class="input input-bordered pl-2 w-48 hidden" id="address-input-${member.Id}" value="${member.Address}" required>
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
                        type="button" onclick="editMember('${member.Id}')" id="edit-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-pencil-simple w-4 h-4 mr-2"></i>
                            Edit
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="updateMember('${member.Id}')" id="update-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-check-circle w-4 h-4 mr-2"></i>
                            Update
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="cancelEdit('${member.Id}')" id="cancel-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-x-circle w-4 h-4 mr-2"></i>
                            Cancel
                        </span>
                    </button>
                    <button class="btn btn-ghost btn-xs w-full font-display hidden"
                        type="button" onclick="deleteMember('${member.Id}')" id="delete-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-trash w-4 h-4 mr-2"></i>
                            Delete
                        </span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function createMahallaTableRow(member) {
    return `
        <tr id="row-${member.Id}" class="font-display">
            <td class="p-4 border-b border-base-300">
                <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content">
                    ${member.Zone || 'N/A'}
                </p>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex items-center gap-3">
                    <div class="flex flex-col">
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="name-${member.Id}">
                            ${member.Name || 'N/A'}
                        </p>
                        <input type="text" name="username" placeholder="Enter your Username" class="input input-bordered pl-2 w-48 hidden" id="name-input-${member.Id}" value="${member.Name || ''}" required>
                    </div>
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-col">
                    <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="address-${member.Id}">
                        ${member.Address || 'N/A'}
                    </p>
                    <input type="text" name="address" placeholder="Enter your Address" class="input input-bordered pl-2 w-48 hidden" id="address-input-${member.Id}" value="${member.Address || ''}" required>
                </div>
            </td>
            <td class="p-4 border-b border-base-300">
                <p class="block font-display text-sm antialiased font-normal leading-normal text-base-content" id="telephone-${member.Id}">
                    ${member.Telephone || 'N/A'}
                </p>
                <input type="text" name="telephone" placeholder="Enter your Telephone" class="input input-bordered pl-2 w-48 hidden" id="telephone-input-${member.Id}" value="${member.Telephone || ''}" required>
            </td>
            <td class="p-4 border-b border-base-300">
                <div class="flex flex-col items-start gap-2">
                    <button class="btn btn-ghost btn-xs w-full font-display"
                        type="button" onclick="editMember('${member.Id}')" id="edit-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <i class="ph ph-pencil-simple w-4 h-4 mr-2"></i>
                            Edit
                        </span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Enable editing mode for a member's details.
function editMember(memberId) {
    const nameElement = document.getElementById(`name-${memberId}`);
    const nameInput = document.getElementById(`name-input-${memberId}`);
    const telephoneElement = document.getElementById(`telephone-${memberId}`);
    const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
    const addressElement = document.getElementById(`address-${memberId}`);
    const addressInput = document.getElementById(`address-input-${memberId}`);
    const editButton = document.getElementById(`edit-button-${memberId}`);
    const updateButton = document.getElementById(`update-button-${memberId}`);
    const cancelButton = document.getElementById(`cancel-button-${memberId}`);

    nameElement.classList.add('hidden');
    nameInput.classList.remove('hidden');
    telephoneElement.classList.add('hidden');
    telephoneInput.classList.remove('hidden');
    addressElement.classList.add('hidden');
    addressInput.classList.remove('hidden');
    editButton.classList.add('hidden');
    updateButton.classList.remove('hidden');
    cancelButton.classList.remove('hidden');
    document.getElementById(`delete-button-${memberId}`).classList.remove('hidden');
}

// Send updated member data to the backend.
function updateMember(memberId) {
    const nameInput = document.getElementById(`name-input-${memberId}`);
    const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
    const addressInput = document.getElementById(`address-input-${memberId}`);

    const updatedName = nameInput.value;
    const updatedTelephone = telephoneInput.value;
    const updatedAddress = addressInput.value;

    // Send update request to C#
    chrome.webview.postMessage({
        action: "updateMember",
        Id: memberId,
        name: updatedName,
        telephone: updatedTelephone,
        address: updatedAddress
    });
}

// Handle the result of a member update operation.
function handleMemberUpdateResult(success, memberId) {
    if (success) {
        // Update working now update the bloody UI
        const nameElement = document.getElementById(`name-${memberId}`);
        const telephoneElement = document.getElementById(`telephone-${memberId}`);
        const addressElement = document.getElementById(`address-${memberId}`);

        const nameInput = document.getElementById(`name-input-${memberId}`);
        const telephoneInput = document.getElementById(`telephone-input-${memberId}`);
        const addressInput = document.getElementById(`address-input-${memberId}`);

        nameElement.textContent = nameInput.value;
        telephoneElement.textContent = telephoneInput.value;
        addressElement.textContent = addressInput.value;
        Swal.fire({
            title: "Sweet!",
            text: "Member Details Have Been Updated!",
            icon:'success'});
        exitEditMode(memberId);
    } else {
        alert("Failed to update member information. Please try again.");
    }
}

// Cancel member editing mode.
function cancelEdit(memberId) {
    exitEditMode(memberId);
}

// Revert UI from editing mode to display mode.
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

    nameElement.classList.remove('hidden');
    nameInput.classList.add('hidden');
    telephoneElement.classList.remove('hidden');
    telephoneInput.classList.add('hidden');
    addressElement.classList.remove('hidden');
    addressInput.classList.add('hidden');
    editButton.classList.remove('hidden');
    updateButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    document.getElementById(`delete-button-${memberId}`).classList.add('hidden');
}

// Display the 'Add Member' form row.
function showAddMemberRow() {
    document.getElementById('add-member-row').classList.remove('hidden');
}

// Display the 'Add Admin' form row.
//step 1
function showAddAdminRow() {
    document.getElementById('add-admin-row').classList.remove('hidden');
}

//step 2
// Process and send new admin data to the backend.
function addNewAdmin() {
    const username = document.getElementById('new-admin-name').value;
    const address = document.getElementById('new-admin-address').value;
    const password = document.getElementById('new-admin-password').value;

    if (username && address && password) {
        chrome.webview.postMessage({
            action: "addAdmin",
            username: username,
            address: address,
            password: password
        });
        cancelAddAdminMember(); // This will hide the row and clear the fields
    } else {
        alert("Please fill in all fields and ensure a location is selected.");
    }
}

function handleAddAdminResult(successAdmin) {
    if (successAdmin) {
        Swal.fire({
            position: "center",
            height: 10,
            width: 400,
            icon:'success',
            title: "Administrator has been successfully added!",
            showConfirmButton: false,
            timer: 1500});
        const location = document.getElementById('location-header').dataset.shortForm;
        loadLocation(location, document.getElementById('location-header').textContent);
    } else {
        alert('Failed to add AdministratorPlease try again.');
    }
}

function handleAddMemberResult(success) {
    if (success) {
        Swal.fire({
            position: "center",
            height: 10,
            width: 400,
            icon:'success',
            title: "Member has been successfully added!",
            showConfirmButton: false,
            timer: 1500
          });
        const location = document.getElementById('location-header').dataset.shortForm;
        loadLocation(location, document.getElementById('location-header').textContent);
    } else {
        alert('Failed to add member. Please try again.');
    }
}

// Hide the 'Add Member' form row and clear fields.
function cancelAddMember() {
    document.getElementById('add-member-row').classList.add('hidden');
    // Clear the input fields 
    document.getElementById('new-member-name').value = '';
    document.getElementById('new-member-telephone').value = '';
    document.getElementById('new-member-address').value = '';
}

// Process and send new member data to the backend.
function addNewMember() {
    const name = document.getElementById('new-member-name').value;
    const telephone = document.getElementById('new-member-telephone').value;
    const address = document.getElementById('new-member-address').value;
    const location = document.getElementById('location-header').dataset.shortForm;

    if (name && telephone && address && location) {
        chrome.webview.postMessage({
            action: "addMember",
            name: name,
            telephone: telephone,
            address: address,
            location: location
        });
        cancelAddMember(); // This will hide the row and clear the fields
    } else {
        alert("Please fill in all fields and ensure a location is selected.");
    }
}

// Handle the result of adding a new member.
function handleAddMemberResult(success) {
    if (success) {
        Swal.fire({
            position: "center",
            height: 10,
            width: 400,
            icon:'success',
            title: "Member has been successfully added!",
            showConfirmButton: false,
            timer: 1500
          });
        // Refresh the member list else how you gonna see the updates u stupid or smth
        const location = document.getElementById('location-header').dataset.shortForm;
        loadLocation(location, document.getElementById('location-header').textContent);
    } else {
        alert('Failed to add member. Please try again.');
    }
}

// Initiate member deletion process.
function deleteMember(memberId) {
    Swal.fire({
        title: "Deleted",
        text: "Your Member has been deleted.",
        icon: "warning"
      })
        const location = document.getElementById('location-header').dataset.shortForm;
        chrome.webview.postMessage({
            action: "deleteMember",
            Id: memberId,
            location: location
        });
    
}

// Handle the result of deleting a member.
function handleDeleteMemberResult(success, memberId) {
    if (success) {
        // Remove the row from the table
        document.getElementById(`row-${memberId}`).remove();
    } else {
        Swal.fire({
            position: "center",
            height: 10,
            width: 400,
            icon:'Erorr',
            title: "Member has been successfully added!",
            showConfirmButton: false,
            timer: 1500
          });
    }
}

// Load data for the selected location and update the header.
function loadLocation(shortForm, fullName) {
    const locationHeader = document.getElementById('location-header');
    updateHeaderText(fullName);
    locationHeader.dataset.shortForm = shortForm;
    console.log(`Location set: ${fullName}, shortForm: ${shortForm}`);
    
    // Your existing code to load members
    chrome.webview.postMessage({
        action: "getMembers",
        location: shortForm
    });
}

function updateHeaderText(text) {
    const headerElement = document.getElementById('location-header');
    if (headerElement) {
        headerElement.textContent = text;
    }
}

function cancelAddAdminMember() {
    document.getElementById('add-admin-row').classList.add('hidden');
    // Clear the input fields 
    document.getElementById('new-admin-name').value = '';
    document.getElementById('new-admin-password').value = '';
    document.getElementById('new-admin-address').value = '';
}
