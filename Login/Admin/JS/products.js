let currentCard = null;

function showTab(tab) {
    const tabs = {
        pending: document.getElementById('pendingTab'),
        approved: document.getElementById('approvedTab'),
        rejected: document.getElementById('rejectedTab')
    };

    const buttons = {
        pending: document.getElementById('tabPending'),
        approved: document.getElementById('tabApproved'),
        rejected: document.getElementById('tabRejected')
    };

    Object.keys(tabs).forEach(key => {
        if (tabs[key]) {
            tabs[key].style.display = (key === tab) ? 'block' : 'none';
        }
    });

    Object.keys(buttons).forEach(key => {
        if (buttons[key]) {
            buttons[key].classList.toggle('active', key === tab);
        }
    });
}

function restoreProduct(btn) {
    const card = btn.closest('.card');
    const name = card.querySelector('h3').textContent;

    // Reset Badge
    const badge = card.querySelector('.badge');
    badge.className = 'badge bg-yellow';
    badge.textContent = 'Pending';
    
    const reasonTxt = card.querySelector('.reject-reason') || card.querySelector('p[style*="0.85rem"]');
    if (reasonTxt) reasonTxt.remove();

    // Reset Buttons
    card.querySelector('div:last-child').innerHTML = `
        <button class="btn btn-success" style="flex:1" onclick="showApprove(this)">✓ Approve</button>
        <button class="btn btn-outline" style="flex:1" onclick="showReject(this)">✕ Reject</button>
    `;

    document.querySelector('#pendingTab > div').appendChild(card);

    updateCounter('rejectedCount', -1);
    updateCounter('pendingCount', 1);

    showToast(name + ' restored to pending.');
}

function showApprove(btn) {
    currentCard = btn.closest('.card');
    const name = currentCard.querySelector('h3').textContent;
    const farmer = currentCard.querySelector('p').textContent.replace('Farmer: ', '');
    document.getElementById('approveContent').innerHTML = `<h3>${name}</h3><p>Farmer: ${farmer}</p><p>Visible to buyers after approval.</p>`;
    document.getElementById('approveModal').classList.add('active');
}

function confirmApprove() {
    if (!currentCard) return;
    const name = currentCard.querySelector('h3').textContent;
    
    currentCard.querySelector('.badge').className = 'badge bg-green';
    currentCard.querySelector('.badge').textContent = 'Approved';
    currentCard.querySelector('div:last-child').innerHTML = '<button class="btn btn-danger" style="width:100%" onclick="showTakeDown(this)">Take Down</button>';

    document.querySelector('#approvedTab > div').appendChild(currentCard);
    
    updateCounter('pendingCount', -1);
    updateCounter('approvedCount', 1);

    closeModals();
    showToast(name + ' approved!');
}

function showReject(btn) {
    currentCard = btn.closest('.card');
    document.getElementById('rejectModal').classList.add('active');
}

function confirmReject() {
    if (!currentCard) return;
    const name = currentCard.querySelector('h3').textContent;
    const reason = document.querySelector('input[name="rejectReason"]:checked')?.value || document.getElementById('rejectOther').value || "Unspecified";

    currentCard.querySelector('.badge').className = 'badge bg-red';
    currentCard.querySelector('.badge').textContent = 'Rejected';
    
    currentCard.querySelector('div:last-child').innerHTML = '<button class="btn btn-outline" style="width:100%" onclick="restoreProduct(this)">Restore to Pending</button>';

    document.querySelector('#rejectedTab > div').appendChild(currentCard);

    updateCounter('pendingCount', -1);
    updateCounter('rejectedCount', 1);

    closeModals();
    showToast(name + ' rejected.', 'error');
}

function showTakeDown(btn) {
    currentCard = btn.closest('.card');
    document.getElementById('takeDownModal').classList.add('active');
}

function confirmTakeDown() {
    if (!currentCard) return;
    const name = currentCard.querySelector('h3').textContent;
    currentCard.remove();
    updateCounter('approvedCount', -1);
    closeModals();
    showToast(name + ' taken down.', 'error');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function updateCounter(id, change) {
    const el = document.getElementById(id);
    if (el) {
        let val = parseInt(el.textContent) || 0;
        el.textContent = Math.max(0, val + change);
    }
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnConfirmApprove').onclick = confirmApprove;
    document.getElementById('btnConfirmReject').onclick = confirmReject;
    document.getElementById('btnConfirmTakeDown').onclick = confirmTakeDown;
});