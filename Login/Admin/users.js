// users.js - JavaScript for User Management Page

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Approve buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.textContent.includes('Approve')) {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const name = row.querySelector('td strong').textContent;
                row.remove();
                showToast('Approved ' + name);
            });
        }
    });

    // Suspend buttons
    document.querySelectorAll('.btn-suspend').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.querySelector('td strong').textContent;
            let warnings = parseInt(this.getAttribute('data-warnings')) || 0;

            if (warnings < 3) {
                warnings++;
                this.setAttribute('data-warnings', warnings);
                showToast(`Warning #${warnings} issued to ${name}`, warnings === 3 ? 'error' : 'success');
                updateSuspendButtons();
            } else {
                // If they click on "Final Warning" (3 warnings already)
                if (confirm(`Maximum warnings reached. Permanently suspend ${name}?`)) {
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        showToast(`${name} has been suspended`, 'error');
                    }, 300);
                }
            }
        });
    });

    // Initialize button states on load
    updateSuspendButtons();

    // View buttons - open user detail modal
    document.querySelectorAll('table').forEach((table, tableIndex) => {
        table.querySelectorAll('tbody tr').forEach((row, rowIndex) => {
            const viewBtn = row.querySelector('.btn-outline');
            if (viewBtn && viewBtn.textContent.includes('View')) {
                viewBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const name = row.querySelector('td strong').textContent;
                    const badge = row.querySelector('.badge');
                    const status = badge ? badge.textContent : 'Active';
                    const type = tableIndex === 0 ? 'Farmer' : (tableIndex === 1 ? 'Farmer' : 'Buyer');
                    showUserModal(name, type, status);
                });
            }
        });
    });

    // Review button - open review modal
    document.querySelectorAll('table').forEach(table => {
        table.querySelectorAll('tbody tr').forEach(row => {
            const reviewBtn = row.querySelector('.btn-outline');
            if (reviewBtn && reviewBtn.textContent.includes('Review')) {
                reviewBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const name = row.querySelector('td strong').textContent;
                    const barangay = row.querySelector('td:nth-child(2)').textContent;
                    const doc = row.querySelector('.text-muted')?.textContent || 'ID_Proof.pdf';
                    showReviewModal(name, barangay, doc);
                });
            }
        });
    });
});

// View User Details Modal
function showUserModal(name, type, status) {
    const initials = name.split(' ').map(n => n[0]).join('');
    const isActive = status === 'Active';

    document.getElementById('modalTitle').textContent = type + ' Details';
    document.getElementById('modalBody').innerHTML = `
        <div style="text-align: center;">
            <div class="user-avatar-lg">${initials}</div>
            <h3 style="margin: 0 0 8px;">${name}</h3>
            <span class="modal-value badge ${isActive ? 'bg-green' : 'bg-yellow'}">${status}</span>
        </div>
        <div class="modal-section">
            <div class="modal-label">Email</div>
            <div class="modal-value">${name.toLowerCase().replace(' ', '.')}@email.com</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Phone</div>
            <div class="modal-value">+63 912 345 6789</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">${type === 'Farmer' ? 'Farm Location' : 'Address'}</div>
            <div class="modal-value">Zambowood, Zamboanga City</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Member Since</div>
            <div class="modal-value">January 2026</div>
        </div>
        ${type === 'Farmer' ? `
        <div class="modal-section">
            <div class="modal-label">Farm Size</div>
            <div class="modal-value">2.5 hectares</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Main Products</div>
            <div class="modal-value">Rice, Corn, Vegetables</div>
        </div>
        ` : ''}
    `;
    document.getElementById('modalActions').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        <button class="btn btn-danger" onclick="closeModal(); showToast('User suspended')">Suspend</button>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

// Review Farmer Modal
function showReviewModal(name, barangay, doc) {
    const initials = name.split(' ').map(n => n[0]).join('');

    document.getElementById('modalTitle').textContent = 'Farmer Verification Review';
    document.getElementById('modalBody').innerHTML = `
        <div style="text-align: center;">
            <div class="user-avatar-lg">${initials}</div>
            <h3 style="margin: 0 0 8px;">${name}</h3>
            <span class="modal-value badge bg-yellow">Pending Review</span>
        </div>
        <div class="modal-section">
            <div class="modal-label">Barangay</div>
            <div class="modal-value">${barangay}</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Application Date</div>
            <div class="modal-value">April 25, 2026</div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Submitted Documents</div>
            <div class="doc-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <div style="margin-top: 8px; font-weight: 500;">${doc}</div>
                <div style="font-size: 0.8rem; color: #888;">Click to view document</div>
            </div>
        </div>
        <div class="modal-section">
            <div class="modal-label">Notes</div>
            <div class="modal-value">First-time farmer applicant. All documents appear valid and complete.</div>
        </div>
    `;
    document.getElementById('modalActions').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal()">Reject</button>
        <button class="btn btn-primary" onclick="closeModal(); showToast('Approved ${name}')">Approve</button>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

// Dynamic Warning and Suspend Logic
function updateSuspendButtons() {
    document.querySelectorAll('.btn-suspend').forEach(btn => {
        const warnings = parseInt(btn.getAttribute('data-warnings')) || 0;

        // Clear all possible warning classes first
        btn.classList.remove('btn-warning-0', 'btn-warning-1', 'btn-warning-2', 'btn-warning-3');

        if (warnings === 0) {
            btn.classList.add('btn-warning-0');
            btn.textContent = 'Issue Warning';
        } else if (warnings === 1) {
            btn.classList.add('btn-warning-1');
            btn.textContent = '1st Warning';
        } else if (warnings === 2) {
            btn.classList.add('btn-warning-2');
            btn.textContent = '2nd Warning';
        } else {
            btn.classList.add('btn-warning-3');
            btn.textContent = 'Final Warning';
        }
    });
}