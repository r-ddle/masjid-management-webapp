// JWT Check - Redirect to login if no token
const authToken = localStorage.getItem('authToken');
if (!authToken) {
  window.location.href = '/login.html';
}

// Initialize Feather Icons
if (typeof feather !== 'undefined') {
    feather.replace();
}

document.addEventListener('DOMContentLoaded', () => {
    // --- General Dashboard Elements & Event Listeners ---
    const sidebarToggleDashboard = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sectionTitleElement = document.getElementById('section-title');
    const allMenuItems = document.querySelectorAll('.menu a');
    const allSections = document.querySelectorAll('main > section');
    const logoutLinkDropdown = document.getElementById('logout-link-dropdown');
    const logoutLinkSidebar = document.getElementById('logout-link-sidebar');

    if (sidebarToggleDashboard && sidebar) {
        sidebarToggleDashboard.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    allMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const sectionId = this.getAttribute('data-section');
            const href = this.getAttribute('href');

            if (href && href !== "#" && !sectionId) {
                if (this.id === 'logout-link-sidebar' || this.id === 'logout-link-dropdown') {
                    // Logout handled by specific listeners
                }
                return; 
            }
            
            e.preventDefault(); 

            if (sectionId) {
                allMenuItems.forEach(i => {
                    i.classList.remove('active', 'bg-emerald-100', 'text-emerald-800');
                    i.classList.add('hover:bg-gray-300');
                });
                this.classList.add('active', 'bg-emerald-100', 'text-emerald-800');
                this.classList.remove('hover:bg-gray-300');
                
                if (sectionTitleElement) {
                    const iconElement = this.querySelector('i');
                    const titleText = iconElement ? this.textContent.replace(iconElement.textContent, '').trim() : this.textContent.trim();
                    sectionTitleElement.textContent = titleText;
                }
                
                allSections.forEach(s => s.classList.add('hidden'));
                const targetSection = document.getElementById(`${sectionId}-section`);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                    if (sectionId === 'members' && !targetSection.dataset.initialized) {
                        initializeMemberManagement();
                        targetSection.dataset.initialized = 'true'; 
                    }
                    if (sectionId === 'admins' && !targetSection.dataset.initializedAdmins) {
                        targetSection.dataset.initializedAdmins = 'true';
                    }
                }
                
                if (sidebar && window.innerWidth < 768) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });
    
    document.querySelectorAll('.modal:not(#add-member-modal):not(#add-admin-modal) form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const modal = this.closest('.modal');
            if (modal && typeof modal.close === 'function') modal.close();
            else if (modal) modal.style.display = 'none';
        });
    });


    function handleLogout() {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }

    if (logoutLinkDropdown) logoutLinkDropdown.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    if (logoutLinkSidebar) logoutLinkSidebar.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });

    // --- Member Management Section Specific Logic ---
    let currentDashboardMemberType = 'janaza'; 
    let memberFilters = { location: '', zone: '', status: '', search: '', payment_status: '' };
    let memberPagination = { currentPage: 1, limit: 10, totalItems: 0, totalPages: 0 };
    
    // Edit Mode State
    let isEditMode = false;
    let editingMemberId = null;
    let editingMemberType = null;

    const memberTypeTabs = document.querySelectorAll('#member-type-tabs .tab');
    const memberManagementTitle = document.getElementById('member-management-title');
    const memberSearchInput = document.getElementById('member-search-input');
    const memberSearchButton = document.getElementById('member-search-button');
    
    const filterLocationSelect = document.getElementById('filter-location');
    const filterZoneSelect = document.getElementById('filter-zone');
    const filterJanazaPaymentStatusSelect = document.getElementById('filter-janaza-payment-status');
    const filterHiflStatusSelect = document.getElementById('filter-hifl-status');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    
    const membersTable = document.getElementById('members-table');
    const membersTableHead = membersTable ? membersTable.querySelector('thead tr') : null;
    const membersTableBody = document.getElementById('members-table-body');
    
    const membersPaginationControls = document.getElementById('members-pagination-controls');
    const membersPaginationInfo = document.getElementById('members-pagination-info');
    const membersPaginationButtons = document.getElementById('members-pagination-buttons');
    
    const addMemberButton = document.getElementById('add-member-button'); 
    const addMemberModal = document.getElementById('add-member-modal');
    const addMemberForm = document.getElementById('add-member-form');
    const addMemberTypeSelect = document.getElementById('add-member-type-select');
    const addMemberNameInput = document.getElementById('add-member-name');
    const addMemberTelephoneInput = document.getElementById('add-member-telephone');
    const addMemberAddressInput = document.getElementById('add-member-address');
    const addMemberLocationInput = document.getElementById('add-member-location');
    const addMemberZoneInput = document.getElementById('add-member-zone');
    const addMemberEnrollmentDateInput = document.getElementById('add-member-enrollment-date');
    const addMemberHiflStatusSelect = document.getElementById('add-member-hifl-status');
    const addMemberErrorMessage = document.getElementById('add-member-error-message');
    const addMemberSubmitButton = document.getElementById('add-member-submit-button');
    const addMemberModalCloseButton = document.getElementById('add-member-modal-close-button');


    function initializeMemberManagement() {
        if (!document.getElementById('members-section') || document.getElementById('members-section').classList.contains('hidden')) return;
        updateFilterVisibility();
        loadMembers(); 
    }
    
    async function fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json', 
            ...options.headers,
            'Authorization': `Bearer ${authToken}`
        };
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) { 
            handleLogout(); 
            throw new Error('Unauthorized: Redirecting to login.');
        }
        const responseData = await response.json().catch(() => {
             if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
             return null; 
        });
        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || `HTTP error ${response.status}`);
        }
        return responseData;
    }

    if (memberTypeTabs && memberTypeTabs.length > 0) {
        memberTypeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                memberTypeTabs.forEach(t => t.classList.remove('tab-active'));
                this.classList.add('tab-active');
                currentDashboardMemberType = this.getAttribute('data-member-type');
                if (memberManagementTitle) memberManagementTitle.textContent = `${this.textContent}`;
                
                memberFilters = { location: '', zone: '', status: '', search: '', payment_status: '' }; 
                memberPagination.currentPage = 1; 
                if (filterLocationSelect) filterLocationSelect.value = '';
                if (filterZoneSelect) filterZoneSelect.value = '';
                if (filterJanazaPaymentStatusSelect) filterJanazaPaymentStatusSelect.value = '';
                if (filterHiflStatusSelect) filterHiflStatusSelect.value = '';
                if(memberSearchInput) memberSearchInput.value = '';

                updateFilterVisibility();
                loadMembers();
            });
        });
    }


    function updateFilterVisibility() {
        if (!filterLocationSelect || !filterZoneSelect || !filterJanazaPaymentStatusSelect || !filterHiflStatusSelect) return;
        filterLocationSelect.style.display = 'inline-block'; 
        filterZoneSelect.style.display = (currentDashboardMemberType === 'mahallah' || currentDashboardMemberType === 'hifl') ? 'inline-block' : 'none';
        filterJanazaPaymentStatusSelect.style.display = (currentDashboardMemberType === 'janaza') ? 'inline-block' : 'none';
        filterHiflStatusSelect.style.display = (currentDashboardMemberType === 'hifl') ? 'inline-block' : 'none';
    }
    
    async function loadMembers() {
        if (!membersTableBody || !membersTableHead) { return; }
        membersTableBody.innerHTML = `<tr><td colspan="16" class="text-center py-8"><span class="loading loading-dots loading-lg"></span></td></tr>`; // Increased colspan for Janaza
        membersTableHead.innerHTML = ''; 
        let apiUrl = `/api/dashboard/`;
        const queryParams = new URLSearchParams();
        queryParams.append('page', memberPagination.currentPage);
        queryParams.append('limit', memberPagination.limit);
        if (memberFilters.search) queryParams.append('search', memberFilters.search);
        
        let tableHeaders = ['<label><input type="checkbox" class="checkbox checkbox-sm" id="select-all-members" /></label>', 'Name'];
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        switch (currentDashboardMemberType) {
            case 'janaza':
                apiUrl += 'members';
                if (memberFilters.location) queryParams.append('location', memberFilters.location);
                // For Janaza payment status filter, we need both month and status.
                // The filter dropdown provides status, but which month?
                // If filterJanazaPaymentStatusSelect.value is set, we might need a companion month selector,
                // or the API needs to interpret a general status query.
                // For now, if memberFilters.payment_status is set, let's assume it's for 'jan' for simplicity,
                // or the API can search across all months for that status if it supports it.
                // The dashboard currently has one payment status filter, not per month.
                if (memberFilters.payment_status) {
                    // This is a simplification. A more robust solution would require month selection for filtering.
                    // Or the API should search for this status in any month.
                    // For now, we'll pass it as 'janazaStatus' as per existing backend.
                    queryParams.append('janazaStatus', memberFilters.payment_status); 
                    // queryParams.append('janazaMonth', 'jan'); // Example if API needed specific month
                }
                tableHeaders.push('Telephone', 'Address', 'Location');
                months.forEach(m => tableHeaders.push(m.charAt(0).toUpperCase() + m.slice(1))); // Add month headers
                tableHeaders.push('Actions');
                break;
            case 'mahallah':
                apiUrl += 'mahallah-members';
                if (memberFilters.location) queryParams.append('location', memberFilters.location);
                if (memberFilters.zone) queryParams.append('zone', memberFilters.zone);
                tableHeaders.push('Telephone', 'Address', 'Zone', 'Actions');
                break;
            case 'hifl':
                apiUrl += 'hifl-members';
                if (memberFilters.location) queryParams.append('location', memberFilters.location);
                if (memberFilters.zone) queryParams.append('zone', memberFilters.zone);
                if (memberFilters.status) queryParams.append('status', memberFilters.status);
                tableHeaders.push('Telephone', 'Address', 'Location', 'Zone', 'Enroll Date', 'Status', 'Actions');
                break;
            default: membersTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8">Invalid member type.</td></tr>`; return;
        }
        apiUrl += `?${queryParams.toString()}`;
        try {
            const response = await fetchWithAuth(apiUrl);
            const dataToRender = Array.isArray(response.data) ? response.data : [];
            memberPagination.totalItems = response.pagination?.totalItems || dataToRender.length;
            memberPagination.totalPages = response.pagination?.totalPages || Math.ceil(dataToRender.length / memberPagination.limit);
            memberPagination.currentPage = response.pagination?.currentPage || 1;
            renderMembersTable(dataToRender, tableHeaders);
            renderPaginationControls();
        } catch (error) {
            console.error(`Error loading ${currentDashboardMemberType} members:`, error);
            membersTableBody.innerHTML = `<tr><td colspan="${tableHeaders.length || 8}" class="text-center py-8 text-error">Error: ${error.message}</td></tr>`;
        } finally { if (typeof feather !== 'undefined') feather.replace(); }
    }

    function renderMembersTable(members, headers) {
        membersTableHead.innerHTML = ''; 
        headers.forEach(headerTextOrHtml => { 
            const th = document.createElement('th'); 
            th.innerHTML = headerTextOrHtml; // For checkbox HTML
            if (headerTextOrHtml.length === 3 || headerTextOrHtml.length === 4 && headerTextOrHtml !== 'Name') { // Simple check for month headers
                th.classList.add('text-center'); // Center month headers
            }
            membersTableHead.appendChild(th); 
        });

        membersTableBody.innerHTML = ''; 
        if (members.length === 0) { 
            membersTableBody.innerHTML = `<tr><td colspan="${headers.length}" class="text-center py-8">No members found.</td></tr>`; 
            return; 
        }

        const paymentStatuses = ["Paid", "Not_Paid", "Pending", "Waived"]; // Standard statuses
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        members.forEach(member => {
            const tr = document.createElement('tr'); 
            tr.setAttribute('data-member-id', member.id); 
            
            let rowHtml = `<td><label><input type="checkbox" class="checkbox checkbox-xs member-checkbox" value="${member.id}" /></label></td>`;
            rowHtml += `<td>${member.name || 'N/A'}</td>`;

            if (currentDashboardMemberType === 'janaza') {
                rowHtml += `
                    <td>${member.telephone || 'N/A'}</td>
                    <td>${member.address || 'N/A'}</td>
                    <td>${member.location || 'N/A'}</td>`;
                months.forEach(month => {
                    const currentStatus = (member.janaza2024 && member.janaza2024[month]) ? member.janaza2024[month] : 'Not_Paid'; // Default if not set
                    let selectHtml = `<td class="text-center"><select class="select select-bordered select-xs payment-status-dropdown" data-member-id="${member.id}" data-month="${month}" data-original-status="${currentStatus}">`;
                    paymentStatuses.forEach(status => {
                        selectHtml += `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`;
                    });
                    selectHtml += `</select></td>`;
                    rowHtml += selectHtml;
                });
            } else if (currentDashboardMemberType === 'mahallah') {
                 rowHtml += `
                    <td>${member.telephone || 'N/A'}</td>
                    <td>${member.address || 'N/A'}</td>
                    <td>${member.zone || 'N/A'}</td>`;
            } else if (currentDashboardMemberType === 'hifl') {
                rowHtml += `
                    <td>${member.telephone || 'N/A'}</td>
                    <td>${member.address || 'N/A'}</td>
                    <td>${member.location || 'N/A'}</td>
                    <td>${member.zone || 'N/A'}</td>
                    <td>${member.enrollment_date ? new Date(member.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="badge ${member.status === 'Active' ? 'badge-success' : 'badge-ghost'}">${member.status || 'N/A'}</span></td>`;
            }
            
            tr.innerHTML = rowHtml; // Set base HTML

            const actionsTd = document.createElement('td');
            actionsTd.innerHTML = `
                <button class="btn btn-xs btn-ghost" data-action="edit" data-id="${member.id}" data-member-type="${currentDashboardMemberType}"><i data-feather="edit" class="h-4 w-4"></i></button>
                <button class="btn btn-xs btn-ghost text-error" data-action="delete" data-id="${member.id}" data-member-type="${currentDashboardMemberType}"><i data-feather="trash-2" class="h-4 w-4"></i></button>
            `;
            tr.appendChild(actionsTd); 
            membersTableBody.appendChild(tr);
        });
    }
    
    function renderPaginationControls() {
        // ... (renderPaginationControls function as previously defined)
        if (!membersPaginationControls || !membersPaginationInfo || !membersPaginationButtons) return;
        if (memberPagination.totalItems === 0 && memberPagination.totalPages <=1) { membersPaginationControls.style.display = 'none'; return; }
        membersPaginationControls.style.display = 'flex';
        const { currentPage, totalPages, totalItems, limit } = memberPagination;
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
        const endItem = Math.min(currentPage * limit, totalItems);
        membersPaginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} members`;
        membersPaginationButtons.innerHTML = ''; 
        const prevButton = document.createElement('button'); prevButton.className = 'join-item btn btn-sm'; prevButton.innerHTML = '«'; if (currentPage === 1) prevButton.disabled = true; prevButton.addEventListener('click', () => { memberPagination.currentPage--; loadMembers(); }); membersPaginationButtons.appendChild(prevButton);
        let startPage = Math.max(1, currentPage - 2); let endPage = Math.min(totalPages, currentPage + 2); if(totalPages <= 5) {startPage=1; endPage=totalPages;} else { if(currentPage <=3){endPage = 5;} if(currentPage > totalPages - 3){startPage = totalPages - 4;} }
        for (let i = startPage; i <= endPage; i++) { const pageButton = document.createElement('button'); pageButton.className = `join-item btn btn-sm ${i === currentPage ? 'btn-active' : ''}`; pageButton.textContent = i; pageButton.addEventListener('click', () => { memberPagination.currentPage = i; loadMembers(); }); membersPaginationButtons.appendChild(pageButton); }
        const nextButton = document.createElement('button'); nextButton.className = 'join-item btn btn-sm'; nextButton.innerHTML = '»'; if (currentPage === totalPages || totalPages === 0) nextButton.disabled = true; nextButton.addEventListener('click', () => { memberPagination.currentPage++; loadMembers(); }); membersPaginationButtons.appendChild(nextButton);
    }

    // Event Listeners for Member Filters
    [filterLocationSelect, filterZoneSelect, filterJanazaPaymentStatusSelect, filterHiflStatusSelect].forEach(sel => {
        if (sel) sel.addEventListener('change', () => {
            if(filterLocationSelect) memberFilters.location = filterLocationSelect.value;
            if(filterZoneSelect) memberFilters.zone = filterZoneSelect.value;
            if(filterJanazaPaymentStatusSelect) memberFilters.payment_status = filterJanazaPaymentStatusSelect.value;
            if(filterHiflStatusSelect) memberFilters.status = filterHiflStatusSelect.value;
            memberPagination.currentPage = 1;
            loadMembers();
        });
    });

    if (memberSearchButton && memberSearchInput) { /* ... */ }
    if (clearFiltersButton) { /* ... */ }
    if (addMemberTypeSelect) { /* ... */ }
    function updateAddMemberFormFieldsVisibility() { /* ... */ }
    if (addMemberButton && addMemberModal) { /* ... */ }
    if (addMemberModalCloseButton) { /* ... */ }
    if (addMemberForm) { /* ... */ }
    if (addAdminShowPasswordCheckbox && addAdminPasswordInput) { /* ... */ }
    if (addAdminShowConfirmPasswordCheckbox && addAdminConfirmPasswordInput) { /* ... */ }
    if (addAdminModalCloseButton && addAdminModal) { /* ... */ }
    if (addAdminForm) { /* ... */ }

    // --- Janaza Payment Status Update Logic ---
    if (membersTableBody) {
        membersTableBody.addEventListener('change', async function(event) {
            if (event.target.classList.contains('payment-status-dropdown')) {
                const dropdown = event.target;
                const memberId = dropdown.dataset.memberId;
                const month = dropdown.dataset.month;
                const newStatus = dropdown.value;
                const originalStatus = dropdown.dataset.originalStatus;

                dropdown.disabled = true;
                // Optionally add a small loading spinner next to the dropdown
                // const spinner = document.createElement('span');
                // spinner.className = 'loading loading-spinner loading-xs ml-2';
                // dropdown.parentNode.appendChild(spinner);

                try {
                    await updateJanazaPaymentStatus(memberId, month, newStatus);
                    alert(`Payment status for ${month.toUpperCase()} updated to ${newStatus}.`);
                    dropdown.dataset.originalStatus = newStatus; // Update original status for next change
                } catch (error) {
                    alert(`Failed to update status: ${error.message}`);
                    dropdown.value = originalStatus; // Revert on failure
                } finally {
                    dropdown.disabled = false;
                    // if (spinner) spinner.remove();
                }
            }
        });
    }

    async function updateJanazaPaymentStatus(memberId, month, status) {
        const apiEndpoint = `/api/dashboard/members/${memberId}/payment-status`;
        await fetchWithAuth(apiEndpoint, {
            method: 'PATCH',
            body: JSON.stringify({ month, status })
        });
        // No full table reload, relying on dropdown visual update and success alert.
        // If complex interactions depend on this data elsewhere, consider a targeted row update or full reload.
    }


    // Initial setup
    const activeSectionLink = document.querySelector('.menu a.active');
    if (activeSectionLink) {
        const activeSectionId = activeSectionLink.getAttribute('data-section');
        if (activeSectionId === 'members' && document.getElementById('members-section') && !document.getElementById('members-section').dataset.initialized) {
            initializeMemberManagement();
            document.getElementById('members-section').dataset.initialized = 'true';
        }
    } else { 
        const firstMenuItem = document.querySelector('.menu a[data-section="dashboard"]');
        if (firstMenuItem) firstMenuItem.click(); 
    }
    
    // --- Edit Member Functionality ---
    async function handleEditMemberClick(memberId, memberType) {
        console.log(`Fetching ${memberType} member with ID ${memberId} for editing.`);
        const editButton = membersTableBody.querySelector(`button[data-action="edit"][data-id="${memberId}"]`);
        if(editButton) editButton.disabled = true; // Disable button during fetch

        let apiEndpoint = '/api/dashboard/';
        if (memberType === 'janaza') {
            apiEndpoint += `members/id/${memberId}`; 
        } else if (memberType === 'mahallah') {
            apiEndpoint += `mahallah-members/${memberId}`;
        } else if (memberType === 'hifl') {
            apiEndpoint += `hifl-members/${memberId}`;
        } else {
            alert('Unknown member type for editing.');
            if(editButton) editButton.disabled = false;
            return;
        }

        try {
            const memberData = await fetchWithAuth(apiEndpoint);
            if (!memberData) {
                alert('Failed to fetch member details.');
                if(editButton) editButton.disabled = false;
                return;
            }

            addMemberForm.reset();
            addMemberTypeSelect.value = memberType;
            addMemberTypeSelect.disabled = true; // Disable type change during edit
            updateAddMemberFormFieldsVisibility(); 

            addMemberNameInput.value = memberData.name || '';
            addMemberTelephoneInput.value = memberData.telephone || '';
            addMemberAddressInput.value = memberData.address || '';

            if (memberType === 'janaza') {
                addMemberLocationInput.value = memberData.location || '';
                // janaza2024 is not directly edited in this form.
            } else if (memberType === 'mahallah') {
                addMemberZoneInput.value = memberData.zone || '';
            } else if (memberType === 'hifl') {
                addMemberLocationInput.value = memberData.location || '';
                addMemberZoneInput.value = memberData.zone || '';
                if (memberData.enrollment_date) {
                    addMemberEnrollmentDateInput.value = new Date(memberData.enrollment_date).toISOString().split('T')[0];
                }
                addMemberHiflStatusSelect.value = memberData.status || 'Active';
            }

            isEditMode = true;
            editingMemberId = memberId;
            editingMemberType = memberType;
            
            const modalTitle = addMemberModal.querySelector('h3');
            if(modalTitle) modalTitle.textContent = `Edit ${memberType.charAt(0).toUpperCase() + memberType.slice(1)} Member`;
            addMemberSubmitButton.textContent = 'Save Changes';
            if(addMemberErrorMessage) addMemberErrorMessage.textContent = '';

            addMemberModal.showModal();

        } catch (error) {
            console.error('Error fetching member for edit:', error);
            alert(`Error fetching member details: ${error.message}`);
        } finally {
            if(editButton) editButton.disabled = false;
        }
    }
    
    if (membersTableBody) {
        membersTableBody.addEventListener('click', async (event) => {
            const targetButton = event.target.closest('button[data-action]');
            if (!targetButton) return;

            const action = targetButton.dataset.action;
            const memberId = targetButton.dataset.id;
            const memberType = targetButton.dataset.memberType;

            if (action === 'edit') {
                await handleEditMemberClick(memberId, memberType);
            } else if (action === 'delete') {
                if (!window.confirm(`Are you sure you want to delete this ${memberType} member (ID: ${memberId})? This action cannot be undone.`)) {
                    return;
                }

                targetButton.disabled = true;
                const originalButtonContent = targetButton.innerHTML; 
                targetButton.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
                
                let apiEndpoint = '/api/dashboard/';
                if (memberType === 'janaza') apiEndpoint += `members/${memberId}`;
                else if (memberType === 'mahallah') apiEndpoint += `mahallah-members/${memberId}`;
                else if (memberType === 'hifl') apiEndpoint += `hifl-members/${memberId}`;
                else {
                    alert('Unknown member type for deletion.');
                    targetButton.disabled = false;
                    targetButton.innerHTML = originalButtonContent; 
                    if(typeof feather !== 'undefined') feather.replace();
                    return;
                }

                try {
                    await fetchWithAuth(apiEndpoint, { method: 'DELETE' });
                    alert(`${memberType.charAt(0).toUpperCase() + memberType.slice(1)} member (ID: ${memberId}) deleted successfully!`);
                    loadMembers(); 
                } catch (error) {
                    console.error('Error deleting member:', error);
                    alert(`Failed to delete member (ID: ${memberId}): ${error.message}`);
                    targetButton.disabled = false;
                    targetButton.innerHTML = originalButtonContent; 
                    if(typeof feather !== 'undefined') feather.replace();
                }
            }
        });
    }
    
    // Modify the addMemberForm submit listener for Edit functionality
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if(addMemberErrorMessage) addMemberErrorMessage.textContent = '';
            addMemberSubmitButton.disabled = true;
            const originalButtonText = isEditMode ? 'Save Changes' : 'Add Member'; // Corrected variable name
            addMemberSubmitButton.innerHTML = `<span class="loading loading-spinner loading-xs"></span> ${isEditMode ? 'Saving...' : 'Adding...'}`;

            const memberTypeToSubmit = isEditMode ? editingMemberType : addMemberTypeSelect.value;
            
            const payload = {
                name: addMemberNameInput.value.trim(),
                telephone: addMemberTelephoneInput.value.trim() || null,
                address: addMemberAddressInput.value.trim() || null,
            };

            let apiEndpoint = '/api/dashboard/';
            let method = isEditMode ? 'PUT' : 'POST';

            if (!payload.name) {
                addMemberErrorMessage.textContent = 'Name is required.';
                addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return;
            }

            if (memberTypeToSubmit === 'janaza') {
                apiEndpoint += `members`;
                payload.location = addMemberLocationInput.value.trim();
                if (!payload.location) { addMemberErrorMessage.textContent = 'Location is required for Janaza members.'; addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return; }
                if (isEditMode) {
                    apiEndpoint += `/${editingMemberId}`;
                } else {
                     payload.janaza2024 = {}; 
                }
            } else if (memberTypeToSubmit === 'mahallah') {
                apiEndpoint += `mahallah-members`;
                payload.zone = addMemberZoneInput.value.trim();
                if (!payload.zone) { addMemberErrorMessage.textContent = 'Zone is required for Mahallah members.'; addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return; }
                if (isEditMode) { apiEndpoint += `/${editingMemberId}`; }
            } else if (memberTypeToSubmit === 'hifl') {
                apiEndpoint += `hifl-members`;
                payload.location = addMemberLocationInput.value.trim();
                payload.zone = addMemberZoneInput.value.trim();
                payload.enrollment_date = addMemberEnrollmentDateInput.value || null;
                payload.status = addMemberHiflStatusSelect.value;
                if (!payload.location && (isEditMode || !addMemberLocationInput.closest('.form-control').style.display === 'none')) { addMemberErrorMessage.textContent = 'Location is required for Hifl members.'; addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return; }
                if (!payload.zone && (isEditMode || !addMemberZoneInput.closest('.form-control').style.display === 'none')) { addMemberErrorMessage.textContent = 'Zone is required for Hifl members.'; addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return; }
                if (isEditMode) { apiEndpoint += `/${editingMemberId}`; }
            } else {
                addMemberErrorMessage.textContent = 'Invalid member type.';
                addMemberSubmitButton.disabled = false; addMemberSubmitButton.innerHTML = originalButtonText; return;
            }
            
            try {
                await fetchWithAuth(apiEndpoint, { method, body: JSON.stringify(payload) });
                addMemberModal.close();
                alert(`Member ${isEditMode ? 'updated' : 'added'} successfully!`);
                loadMembers(); 
                
                resetAddMemberModalState(); // Reset modal after successful operation

            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'adding'} member:`, error);
                addMemberErrorMessage.textContent = error.message || `Failed to ${isEditMode ? 'update' : 'add'} member.`;
            } finally {
                addMemberSubmitButton.disabled = false;
                addMemberSubmitButton.innerHTML = originalButtonText;
            }
        });
    }
    
    function resetAddMemberModalState() {
        if(addMemberForm) addMemberForm.reset();
        if(addMemberErrorMessage) addMemberErrorMessage.textContent = '';
        isEditMode = false; 
        editingMemberId = null; 
        editingMemberType = null;
        if(addMemberTypeSelect) addMemberTypeSelect.disabled = false; 
        const modalTitle = addMemberModal ? addMemberModal.querySelector('h3') : null;
        if(modalTitle) modalTitle.textContent = 'Add New Member';
        if(addMemberSubmitButton) addMemberSubmitButton.textContent = 'Add Member';
        if(addMemberTypeSelect) updateAddMemberFormFieldsVisibility(); // Ensure fields reset correctly for "add"
    }

    if (addMemberModalCloseButton) {
        addMemberModalCloseButton.addEventListener('click', resetAddMemberModalState);
    }
    const cancelButtonInModal = addMemberModal ? addMemberModal.querySelector('.modal-action button[type="button"]') : null;
    if (cancelButtonInModal) {
        cancelButtonInModal.addEventListener('click', resetAddMemberModalState);
    }

});

const observer = new MutationObserver(mutations => { 
    for (const mutation of mutations) { 
        if (mutation.type === 'childList' || mutation.type === 'attributes') { 
            if (typeof feather !== 'undefined') { 
                feather.replace(); 
            } 
            break; 
        } 
    }
});
const mainContentArea = document.querySelector('.main-content main');
if(mainContentArea) observer.observe(mainContentArea, { childList: true, subtree: true, attributes: true });
