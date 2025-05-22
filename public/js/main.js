document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let currentMemberType = 'janaza'; // Default: 'janaza', 'mahallah', 'hifl'
    let currentLocation = '';
    let currentZone = '';

    // DOM Elements
    const sidebarLinks = document.querySelectorAll('.menu a');
    const locationTitleElement = document.getElementById('location-title');
    const locationSelect = document.getElementById('location-select');
    const zoneSelect = document.getElementById('zone-select');
    const tableBody = document.getElementById('table-body');
    const sidebarToggle = document.getElementById('sidebar-toggle'); // For mobile
    const sidebar = document.getElementById('sidebar');

    // Initial Setup
    if (locationTitleElement) locationTitleElement.textContent = 'Janaza Member Details';
    setInitialTableMessage();
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // --- Event Listeners ---

    // Sidebar Toggle for Mobile
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const newMemberType = this.getAttribute('data-member-type');
            if (!newMemberType) return; // Should not happen if data-attributes are set

            currentMemberType = newMemberType;
            currentLocation = ''; // Reset location/zone when member type changes
            currentZone = '';
            locationSelect.value = ''; // Reset dropdown
            zoneSelect.value = ''; // Reset dropdown

            updateSidebarActiveState(this);
            updateHeaderAndControls();
            
            setInitialTableMessage(); // Prompt to select location/zone again
            
            // Close sidebar on mobile after selection
            if (sidebar && window.innerWidth < 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Location Select
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            currentLocation = this.value;
            currentZone = ''; // Reset zone when location changes
            zoneSelect.value = '';

            updateHeaderAndControls(); // Update title, zone visibility

            if (!currentLocation) {
                setInitialTableMessage();
                return;
            }
            fetchAndDisplayMembers();
        });
    }

    // Zone Select
    if (zoneSelect) {
        zoneSelect.addEventListener('change', function() {
            currentZone = this.value;
            updateHeaderAndControls(); // Update title

            if (!currentZone) {
                // If zone is deselected, and current type is Mahallah, show message
                if (currentMemberType === 'mahallah') {
                    renderTableMessage('Please select a zone to display Mahallah members.');
                }
                return;
            }
            fetchAndDisplayMembers();
        });
    }

    // --- UI Update Functions ---

    function updateSidebarActiveState(activeLink) {
        sidebarLinks.forEach(link => {
            link.classList.remove('active', 'bg-emerald-100', 'text-emerald-800');
            link.classList.add('hover:bg-gray-300');
        });
        activeLink.classList.add('active', 'bg-emerald-100', 'text-emerald-800');
        activeLink.classList.remove('hover:bg-gray-300');
    }
    
    function updateHeaderAndControls() {
        let title = '';
        if (currentMemberType === 'janaza') {
            title = 'Janaza Member Details';
            if (currentLocation) title += ` - ${currentLocation}`;
            if (zoneSelect) zoneSelect.classList.add('hidden');
        } else if (currentMemberType === 'mahallah') {
            title = 'Mahallah Member Details';
            if (currentLocation) title += ` - ${currentLocation}`;
            if (currentZone) title += ` / ${currentZone}`;
            if (zoneSelect) zoneSelect.classList.remove('hidden');
        } else if (currentMemberType === 'hifl') {
            title = 'Hifl Madrasa Details';
            if (zoneSelect) zoneSelect.classList.add('hidden');
        }
        if (locationTitleElement) locationTitleElement.textContent = title;
    }

    function setInitialTableMessage() {
        if (currentMemberType === 'hifl') {
            renderTableMessage('Hifl member data and selection criteria will be available soon.');
        } else if (currentMemberType === 'mahallah' && !currentLocation) {
            renderTableMessage('Please select a Location first, then a Zone for Mahallah members.');
        } else if (currentMemberType === 'mahallah' && currentLocation && !currentZone) {
            renderTableMessage('Please select a Zone to display Mahallah members.');
        } 
        else {
            renderTableMessage('Please select a Location to display members.');
        }
    }

    // --- Data Fetching and Rendering ---

    async function fetchAndDisplayMembers() {
        if (currentMemberType === 'hifl') {
            renderTableMessage('Hifl member data is not yet available.');
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        if (!currentLocation && currentMemberType === 'janaza') {
            renderTableMessage('Please select a Location for Janaza members.');
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }
        
        if (currentMemberType === 'mahallah' && (!currentLocation || !currentZone) ) {
             if (!currentLocation) renderTableMessage('Please select a Location first, then a Zone for Mahallah members.');
             else if (!currentZone) renderTableMessage('Please select a Zone for Mahallah members.');
             if (typeof feather !== 'undefined') feather.replace();
             return;
        }


        let apiUrl = '';
        if (currentMemberType === 'janaza' && currentLocation) {
            apiUrl = `/api/public/members/janaza/${encodeURIComponent(currentLocation)}`;
        } else if (currentMemberType === 'mahallah' && currentZone) {
            // The public API for Mahallah uses zone directly. 
            // The `location` part of the route for Mahallah is handled by the controller logic or can be ignored if a specific zone route is hit.
            // Here, we use the specific zone for clarity, assuming `currentZone` is the selected zone name.
            apiUrl = `/api/public/members/mahallah/zone/${encodeURIComponent(currentZone)}`;
        } else {
            // Should not reach here if checks above are correct
            setInitialTableMessage(); 
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        renderTableMessage('<span class="loading loading-dots loading-md"></span> Loading members...');

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
            }
            const data = await response.json();
            renderTable(data, currentMemberType);
        } catch (error) {
            console.error('Fetch error:', error);
            renderTableMessage(`Failed to load members. ${error.message}`);
        } finally {
            if (typeof feather !== 'undefined') {
                feather.replace(); // Ensure icons are rendered after table updates
            }
        }
    }

    function renderTable(data, type) {
        if (!tableBody) return;
        tableBody.innerHTML = ''; // Clear previous content or loading message

        let headers = [];
        if (type === 'janaza') {
            headers = ['Name', 'Address', 'Location'];
        } else if (type === 'mahallah') {
            headers = ['Name', 'Zone'];
        }
        // Update table headers dynamically (optional, if <thead> is also managed by JS)
        // For now, assuming existing <thead> in HTML is generic enough or will be adjusted.
        // This example focuses on tbody:

        const tableHeadRow = document.querySelector('table thead tr');
        if (tableHeadRow) {
            tableHeadRow.innerHTML = ''; // Clear existing headers
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.className = 'bg-gray-50';
                th.textContent = headerText;
                tableHeadRow.appendChild(th);
            });
        }


        if (!data || data.length === 0) {
            let message = 'No members found';
            if (type === 'janaza' && currentLocation) message += ` for location: ${currentLocation}.`;
            else if (type === 'mahallah' && currentZone) message += ` for zone: ${currentZone}.`;
            else message += '.';
            renderTableMessage(message);
            return;
        }

        data.forEach(member => {
            const tr = document.createElement('tr');
            if (type === 'janaza') {
                tr.innerHTML = `
                    <td>${member.name || 'N/A'}</td>
                    <td>${member.address || 'N/A'}</td>
                    <td>${member.location || 'N/A'}</td>
                `;
            } else if (type === 'mahallah') {
                tr.innerHTML = `
                    <td>${member.name || 'N/A'}</td>
                    <td>${member.zone || 'N/A'}</td>
                `;
            }
            tableBody.appendChild(tr);
        });
    }

    function renderTableMessage(message) {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">${message}</td></tr>`;
    }

    // Add data-member-type attributes to sidebar links in public/index.html for this to work
    // Example: <a href="#" data-member-type="janaza">...</a>
    // Manually setting the first link as active for Janaza on load
    const firstSidebarLink = document.querySelector('.menu a[data-member-type="janaza"]');
    if (firstSidebarLink) {
        updateSidebarActiveState(firstSidebarLink);
    }
    updateHeaderAndControls(); // Initial header and control setup

});
