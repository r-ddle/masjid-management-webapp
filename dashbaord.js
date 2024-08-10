// when the site loads this shit pops up
document.addEventListener('DOMContentLoaded', function() {
    const janazaDetails = document.getElementById('janaza-details');
    const mahallaDetails = document.getElementById('mahallah-details');
    const janazaContent = document.getElementById('janaza-content');
    const mahallaContent = document.getElementById('mahallah-content');
    const locationSelector = document.getElementById('location-selector');

    janazaContent.style.display = 'block';
    mahallaContent.style.display = 'none';
    locationSelector.style.display = 'block';
    updateHeaderText('Select a Location');

    janazaDetails.addEventListener('click', function() {
        janazaContent.style.display = 'block';
        mahallaContent.style.display = 'none';
        locationSelector.style.display = 'block';
        janazaDetails.classList.add('active');
        mahallaDetails.classList.remove('active');
        updateHeaderText('Select a Location');
    });

    mahallaDetails.addEventListener('click', function() {
        janazaContent.style.display = 'none';
        mahallaContent.style.display = 'block';
        locationSelector.style.display = 'none';
        mahallaDetails.classList.add('active');
        janazaDetails.classList.remove('active');
        updateHeaderText('Mahallah Member Details');
        loadMahallaMembers();
    });
});

// Let Content Load and check if webview works if not then we screwed fr
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    if (window.chrome && window.chrome.webview) {
        console.log("WebView2 is available");
    } else {
        console.error("WebView2 is not available");
    }
});

// Load Data for Each Location (FUCK THIS WAS PAINFUL)
function loadLocation(location) {
    console.log(`Loading location: ${location}`);
    fetchMembersAndPopulateTable(location);
}

function loadMahallaMembers() {
    chrome.webview.postMessage({ action: "getMahallaMembers" });
}

// Ask csharp "boi gimme them members list asap"
function fetchMembersAndPopulateTable(location) {
    try {
        console.log(`Fetching members for location: ${location}`);
        chrome.webview.postMessage({ action: "getMembers", location: location });
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

// handle them members list boi ~Riddle
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

// touch this code and your entire bloodline is gone ~g0j0
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

// DO NOT FUCK WITH THIS CODE
function populateTable(membersJson) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    membersJson.forEach((memberJson) => {
        const row = createTableRow(memberJson);
        tableBody.innerHTML += row;
    });
}

// if i see a single word missing get ready to meet god
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
                    <select class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            onchange="updatePaymentStatus('${member.Id}', '${month}', this.value)">
                        <option value="Not_Paid" ${member.Janaza2024[month] === "Not_Paid" ? "selected" : ""}>Not Paid</option>
                        <option value="Paid" ${member.Janaza2024[month] === "Paid" ? "selected" : ""}>Paid</option>
                    </select>
                </div>`
        )
        .join("");

    return `
        <tr id="row-${member.Id}" class="font-display">
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex items-center gap-3">
                    <div class="flex flex-col">
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900" id="name-${member.Id}">
                            ${member.Name}
                        </p>
                        <input type="text" name="username" placeholder="Enter your Username" class="inputuser input input-bordered pl-2 w-48 hidden" id="name-input-${member.Id}" value="${member.Name}" required>
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70" id="telephone-${member.Id}">
                            ${member.Telephone}
                        </p>
                        <input type="text" name="telephone" placeholder="Enter your Telephone" class="inputuser input input-bordered pl-2 w-48 hidden" id="telephone-input-${member.Id}" value="${member.Telephone}" required>
                    </div>
                </div>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex flex-col">
                    <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900" id="address-${member.Id}">
                        ${member.Address}
                    </p>
                    <input type="text" name="address" placeholder="Enter your Address" class="inputuser input input-bordered pl-2 w-48 hidden" id="address-input-${member.Id}" value="${member.Address}" required>
                </div>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex flex-wrap gap-2 font-display">
                    ${paymentStatuses}
                </div>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex flex-col items-start gap-2">
                    <button class="relative w-full select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button" onclick="editMember('${member.Id}')" id="edit-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="w-4 h-4 mr-2">
                                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"></path>
                            </svg>
                            Edit
                        </span>
                    </button>
                    <button class="relative w-full select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hidden"
                        type="button" onclick="updateMember('${member.Id}')" id="update-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256" class="w-4 h-4 mr-2"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
                            Update
                        </span>
                    </button>
                    <button class="relative w-full select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hidden"
                        type="button" onclick="cancelEdit('${member.Id}')" id="cancel-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256" class="w-4 h-4 mr-2"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                            Cancel
                        </span>
                    </button>
                    <button class="relative w-full select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hidden"
                        type="button" onclick="deleteMember('${member.Id}')" id="delete-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256" class="w-4 h-4 mr-2"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
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
            <td class="p-4 border-b border-blue-gray-50">
                <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    ${member.Zone || 'N/A'}
                </p>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex items-center gap-3">
                    <div class="flex flex-col">
                        <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900" id="name-${member.Id}">
                            ${member.Name || 'N/A'}
                        </p>
                        <input type="text" name="username" placeholder="Enter your Username" class="inputuser input input-bordered pl-2 w-48 hidden" id="name-input-${member.Id}" value="${member.Name || ''}" required>
                    </div>
                </div>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex flex-col">
                    <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900" id="address-${member.Id}">
                        ${member.Address || 'N/A'}
                    </p>
                    <input type="text" name="address" placeholder="Enter your Address" class="inputuser input input-bordered pl-2 w-48 hidden" id="address-input-${member.Id}" value="${member.Address || ''}" required>
                </div>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <p class="block font-display text-sm antialiased font-normal leading-normal text-blue-gray-900" id="telephone-${member.Id}">
                    ${member.Telephone || 'N/A'}
                </p>
                <input type="text" name="telephone" placeholder="Enter your Telephone" class="inputuser input input-bordered pl-2 w-48 hidden" id="telephone-input-${member.Id}" value="${member.Telephone || ''}" required>
            </td>
            <td class="p-4 border-b border-blue-gray-50">
                <div class="flex flex-col items-start gap-2">
                    <button class="relative w-full select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button" onclick="editMember('${member.Id}')" id="edit-button-${member.Id}">
                        <span class="flex items-center justify-center font-display">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="w-4 h-4 mr-2">
                                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"></path>
                            </svg>
                            Edit
                        </span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// changing dick 8====D to Dickhennawatte ✅
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

    //  this will make u go into edit modeeee had a MENTAL Breakdown doin this shit
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

// after editing we just update the db 
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

// get the success confirmation and update everything in the table
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

        exitEditMode(memberId);
    } else {
        // Update failed... fuck.
        alert("Failed to update member information. Please try again.");
    }
}

// woah woah stop dont change the data
function cancelEdit(memberId) {
    exitEditMode(memberId);
}

// leaving editing mode cya
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

    // Toggle visibility to well toggle visibility unfortunatley it wont bring ur dad back
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

// add member row shows up with this beautiful function so dont fuck with it
function showAddMemberRow() {
    document.getElementById('add-member-row').classList.remove('hidden');
}

// not welcome {user}!   BOOOOOOOOOOOOOOOOOOM!!!
function cancelAddMember() {
    document.getElementById('add-member-row').classList.add('hidden');
    // Clear the input fields 
    document.getElementById('new-member-name').value = '';
    document.getElementById('new-member-telephone').value = '';
    document.getElementById('new-member-address').value = '';
}

// welcome {user}!
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

// handle it obviously
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

// get out of here {user}!
function deleteMember(memberId) {
    if (confirm("Are you sure you want to delete this member?")) {
        const location = document.getElementById('location-header').dataset.shortForm;
        chrome.webview.postMessage({
            action: "deleteMember",
            Id: memberId,
            location: location
        });
    }
}

// trash (sakura) taken out
function handleDeleteMemberResult(success, memberId) {
    if (success) {
        // Remove the row from the table
        document.getElementById(`row-${memberId}`).remove();
        alert('Member deleted successfully!');
    } else {
        alert('Failed to delete member. Please try again.');
    }
}

// this shows what location ur currently viewing I See you jhon yes you  from Dickhenawatte
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