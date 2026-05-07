/* ============================================================
   reports.js — FARMDirect Reports Page
   ============================================================ */

// ── Data ──────────────────────────────────────────────────────
let reports = [
    { id: 'R-001', type: 'seller', reporter: 'Claire Torres', against: 'Pedro Lim (Buyer)', complaint: 'Buyer continuously cancels orders at the last minute causing major losses.', date: '1 week ago', status: 'resolved', notes: '' },
    { id: 'R-002', type: 'buyer',  reporter: 'Pedro Yang',    against: 'Farm Fresh Co. (Seller)', complaint: 'Delivery arrived 3 days late and all produce was spoiled on arrival.', date: '5 days ago', status: 'resolved', notes: 'Refund issued to buyer.' },
    { id: 'R-003', type: 'seller', reporter: 'Rose Flores',   against: 'Kevin Santos (Buyer)', complaint: 'Buyer repeatedly threatens seller for free products, became abusive.', date: '4 days ago', status: 'rejected', notes: 'Insufficient evidence provided.' },
    { id: 'R-004', type: 'buyer',  reporter: 'Roberto Lee',   against: 'GreenHills Farm (Seller)', complaint: 'Seller uses fake organic certification labels on non-organic produce.', date: '3 days ago', status: 'resolved', notes: 'Seller warned and listing removed.' },
    { id: 'R-005', type: 'seller', reporter: 'Maria Santos',  against: 'Donna Cruz (Buyer)', complaint: 'Buyer posting fake negative reviews to damage seller reputation unfairly.', date: '2 days ago', status: 'resolved', notes: '' },
    { id: 'R-006', type: 'buyer',  reporter: 'Lily Cheng',    against: 'Manuel Reyes (Seller)', complaint: 'Seller consistently gives wrong weight — always 200g to 400g short per order.', date: 'Yesterday', status: 'reviewing', notes: '' },
    { id: 'R-007', type: 'seller', reporter: 'Juan Perez',    against: 'Alan Sy (Buyer)', complaint: 'Buyer refused delivery without valid reason and demanded a full refund unfairly.', date: '5 hours ago', status: 'reviewing', notes: '' },
    { id: 'R-008', type: 'buyer',  reporter: 'Ana Mae',       against: 'Valley Fresh Farm (Seller)', complaint: 'Seller sold rotten vegetables and is refusing to process a refund despite evidence.', date: '2 hours ago', status: 'pending', notes: '' },
    { id: 'R-009', type: 'buyer',  reporter: 'Carlo Buenaventura', against: 'Sta. Cruz Organics (Seller)', complaint: 'Item listed as in-stock was unavailable after payment. No communication from seller.', date: '1 hour ago', status: 'pending', notes: '' },
    { id: 'R-010', type: 'seller', reporter: 'Nenita Ramos',  against: 'Brenda Go (Buyer)', complaint: 'Buyer claimed non-delivery but tracking shows item was delivered and signed for.', date: '45 mins ago', status: 'pending', notes: '' },
];

let currentTab = 'all';
let currentModalId = null;
let confirmCallback = null;
let selectedIds = new Set();

// ── Helpers ───────────────────────────────────────────────────
function statusLabel(s) {
    return { pending: 'Pending', reviewing: 'Reviewing', resolved: 'Resolved', rejected: 'Rejected' }[s] || s;
}

function typeLabel(t) {
    return t === 'buyer' ? 'Buyer reported Seller' : 'Seller reported Buyer';
}

// ── Render ────────────────────────────────────────────────────
function renderReports() {
    const query = (document.getElementById('reportSearch')?.value || '').toLowerCase();

    const filtered = reports.filter(r => {
        const tabMatch =
            currentTab === 'all'      ? true :
            currentTab === 'buyers'   ? r.type === 'buyer' :
            currentTab === 'sellers'  ? r.type === 'seller' :
            currentTab === 'resolved' ? r.status === 'resolved' :
            currentTab === 'rejected' ? r.status === 'rejected' : true;

        const queryMatch = !query ||
            r.id.toLowerCase().includes(query) ||
            r.reporter.toLowerCase().includes(query) ||
            r.against.toLowerCase().includes(query) ||
            r.complaint.toLowerCase().includes(query);

        return tabMatch && queryMatch;
    });

    document.getElementById('caseCount').textContent = filtered.length;

    const list = document.getElementById('reportList');
    const empty = document.getElementById('rp-empty');

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = filtered.map(r => buildRow(r)).join('');
    }

    updateStats();
}

function buildRow(r) {
    const isSelected = selectedIds.has(r.id);
    const isClosed   = r.status === 'resolved' || r.status === 'rejected';

    const actions = isClosed
        ? `<button class="rp-btn rp-btn--view"   onclick="openReview('${r.id}', event)">👁 View</button>
           <button class="rp-btn rp-btn--reopen" onclick="quickAction('${r.id}','pending', event)">🔄 Reopen</button>`
        : `<button class="rp-btn rp-btn--view"   onclick="openReview('${r.id}', event)">👁 Review</button>
           ${r.status !== 'reviewing' ? `<button class="rp-btn rp-btn--review" onclick="quickAction('${r.id}','reviewing', event)">🔍 Reviewing</button>` : ''}
           <button class="rp-btn rp-btn--resolve" onclick="quickAction('${r.id}','resolved', event)">✅ Resolve</button>
           <button class="rp-btn rp-btn--reject"  onclick="quickAction('${r.id}','rejected', event)">❌ Reject</button>`;

    return `
    <div class="rp-row ${isSelected ? 'rp-row--selected' : ''}" id="row-${r.id}" onclick="rowClick('${r.id}', event)">
        <input type="checkbox" class="rp-check" id="chk-${r.id}"
            ${isSelected ? 'checked' : ''}
            onclick="toggleSelect('${r.id}', event)">
        <div class="rp-icon-bubble rp-icon-bubble--${r.type}">
            ${r.type === 'buyer' ? '🛒' : '🌾'}
        </div>
        <div class="rp-row-content">
            <span class="rp-type-tag rp-type-tag--${r.type}">${typeLabel(r.type)}</span>
            <span class="rp-row-name">${r.reporter}</span>
            <div class="rp-row-desc">${r.complaint}</div>
            <div class="rp-row-meta">Reported ${r.date} &bull; Case #${r.id}</div>
        </div>
        <span class="rp-status rp-status--${r.status}">${statusLabel(r.status)}</span>
        <div class="rp-row-actions" onclick="event.stopPropagation()">
            ${actions}
        </div>
    </div>`;
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats() {
    document.getElementById('statPending').textContent   = reports.filter(r => r.status === 'pending').length;
    document.getElementById('statReviewing').textContent = reports.filter(r => r.status === 'reviewing').length;
    document.getElementById('statResolved').textContent  = reports.filter(r => r.status === 'resolved').length;
    document.getElementById('statRejected').textContent  = reports.filter(r => r.status === 'rejected').length;
}

// ── Tab switching ─────────────────────────────────────────────
function switchTab(btn) {
    document.querySelectorAll('.rp-tabs .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    selectedIds.clear();
    renderReports();
}

// ── Quick action (inline buttons) ────────────────────────────
function quickAction(id, newStatus, e) {
    if (e) e.stopPropagation();
    const r = reports.find(x => x.id === id);
    if (!r) return;

    const labels = { pending: 'reopen', reviewing: 'mark as Reviewing', resolved: 'resolve', rejected: 'reject' };
    const btnClasses = { pending: 'btn-outline', reviewing: 'rp-btn--review', resolved: 'btn-success', rejected: 'btn-danger' };
    const icons = { pending:'🔄', reviewing:'🔍', resolved:'✅', rejected:'❌' };

    openConfirm(
        `${icons[newStatus]} ${labels[newStatus].charAt(0).toUpperCase() + labels[newStatus].slice(1)} case #${id}?`,
        `You are about to <strong>${labels[newStatus]}</strong> case <strong>#${id}</strong> — reported by <strong>${r.reporter}</strong>. This will update the case status immediately.`,
        btnClasses[newStatus],
        () => {
            r.status = newStatus;
            renderReports();
            showToast(`Case #${id} marked as ${statusLabel(newStatus)}.`, newStatus === 'rejected' ? 'error' : newStatus === 'resolved' ? 'success' : 'info');
        }
    );
}

// ── Row click (open review) ───────────────────────────────────
function rowClick(id, e) {
    // If clicking checkbox area, don't open modal
    if (e.target.type === 'checkbox') return;
    openReview(id, e);
}

// ── Checkbox selection ────────────────────────────────────────
function toggleSelect(id, e) {
    e.stopPropagation();
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    const bulk = document.getElementById('bulkActions');
    bulk.style.display = selectedIds.size > 0 ? 'flex' : 'none';
    renderReports();
}

function clearSelection() {
    selectedIds.clear();
    document.getElementById('bulkActions').style.display = 'none';
    renderReports();
}

function bulkResolve() {
    openConfirm(
        `✅ Resolve ${selectedIds.size} cases?`,
        `This will mark all <strong>${selectedIds.size} selected cases</strong> as Resolved.`,
        'btn-success',
        () => {
            selectedIds.forEach(id => {
                const r = reports.find(x => x.id === id);
                if (r && r.status !== 'rejected') r.status = 'resolved';
            });
            showToast(`${selectedIds.size} cases resolved.`, 'success');
            selectedIds.clear();
            document.getElementById('bulkActions').style.display = 'none';
            renderReports();
        }
    );
}

function bulkReject() {
    openConfirm(
        `❌ Reject ${selectedIds.size} cases?`,
        `This will mark all <strong>${selectedIds.size} selected cases</strong> as Rejected.`,
        'btn-danger',
        () => {
            selectedIds.forEach(id => {
                const r = reports.find(x => x.id === id);
                if (r && r.status !== 'resolved') r.status = 'rejected';
            });
            showToast(`${selectedIds.size} cases rejected.`, 'error');
            selectedIds.clear();
            document.getElementById('bulkActions').style.display = 'none';
            renderReports();
        }
    );
}

// ── Review modal ──────────────────────────────────────────────
function openReview(id, e) {
    if (e) e.stopPropagation();
    const r = reports.find(x => x.id === id);
    if (!r) return;
    currentModalId = id;

    // Header colour
    const header = document.getElementById('reviewModalHeader');
    const isClosed = r.status === 'resolved' || r.status === 'rejected';
    header.className = 'modal-header ' + (isClosed ? (r.status === 'resolved' ? 'green' : 'red') : 'green');

    document.getElementById('reviewModalIcon').textContent = r.type === 'buyer' ? '🛒' : '🌾';
    document.getElementById('reviewTitle').textContent     = `Case #${r.id}`;
    document.getElementById('reviewCaseNum').textContent   = typeLabel(r.type);
    document.getElementById('rvReportedBy').textContent    = r.reporter;
    document.getElementById('rvAgainst').textContent       = r.against;
    document.getElementById('rvType').innerHTML            = `<span class="rp-type-tag rp-type-tag--${r.type}">${typeLabel(r.type)}</span>`;
    document.getElementById('rvDate').textContent          = `Reported ${r.date}`;
    document.getElementById('rvComplaint').textContent     = r.complaint;
    document.getElementById('rvStatus').innerHTML          = `<span class="rp-status rp-status--${r.status}">${statusLabel(r.status)}</span>`;
    document.getElementById('reviewNotes').value           = r.notes || '';

    // Show relevant buttons
    const show = (id, visible) => { document.getElementById(id).style.display = visible ? 'inline-flex' : 'none'; };
    show('rvBtnReopen',  isClosed);
    show('rvBtnReview',  !isClosed && r.status !== 'reviewing');
    show('rvBtnReject',  !isClosed);
    show('rvBtnResolve', !isClosed);

    document.getElementById('reviewModal').classList.add('active');
}

function actionFromModal(newStatus) {
    const r = reports.find(x => x.id === currentModalId);
    if (!r) return;
    r.status = newStatus;
    r.notes  = document.getElementById('reviewNotes').value.trim();
    closeModal();
    renderReports();
    showToast(`Case #${r.id} marked as ${statusLabel(newStatus)}.`, newStatus === 'rejected' ? 'error' : newStatus === 'resolved' ? 'success' : 'info');
}

function closeModal() {
    document.getElementById('reviewModal').classList.remove('active');
    currentModalId = null;
}

// ── Confirm modal ─────────────────────────────────────────────
function openConfirm(title, message, btnClass, callback) {
    document.getElementById('confirmTitle').textContent  = title;
    document.getElementById('confirmMsg').innerHTML      = message;
    const btn = document.getElementById('confirmBtn');
    btn.className = 'btn ' + btnClass;
    btn.textContent = 'Confirm';
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.add('active');
}

function executeConfirm() {
    if (confirmCallback) { confirmCallback(); confirmCallback = null; }
    closeConfirm();
}

function closeConfirm() {
    document.getElementById('confirmModal').classList.remove('active');
}

// ── Stat card click → filter ──────────────────────────────────
document.querySelectorAll('.rp-hstat').forEach((card, i) => {
    const tabs = ['pending', 'reviewing', 'resolved', 'rejected'];
    card.addEventListener('click', () => {
        const target = document.querySelector(`.rp-tabs .tab[data-tab="${tabs[i]}"]`);
        if (target) switchTab(target);
    });
});

// ── Navbar dropdowns (click-toggle, not hover) ────────────────
function toggleDropdown(id, e) {
    e.stopPropagation();
    const el = document.getElementById(id);
    const isOpen = el.classList.contains('open');
    document.querySelectorAll('.notif-dropdown, .profile-dropdown').forEach(d => d.classList.remove('open'));
    if (!isOpen) el.classList.add('open');
}
document.addEventListener('click', () => {
    document.querySelectorAll('.notif-dropdown, .profile-dropdown').forEach(d => d.classList.remove('open'));
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => {
        if (e.target === o) {
            o.classList.remove('active');
            currentModalId = null;
            confirmCallback = null;
        }
    });
});

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    t.innerHTML = `${icons[type] || 'ℹ️'} ${msg}`;
    t.className = `toast show ${type}`;
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Init ──────────────────────────────────────────────────────
renderReports();