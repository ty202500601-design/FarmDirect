// products.js - JavaScript for Product Moderation Page

let currentCard = null;
let currentTab = 'pending';

function showTab(tab) {
    currentTab = tab;
    document.getElementById('pendingTab').style.display = tab === 'pending' ? 'block' : 'none';
    document.getElementById('approvedTab').style.display = tab === 'approved' ? 'block' : 'none';
    document.getElementById('tabPending').classList.toggle('active', tab === 'pending');
    document.getElementById('tabApproved').classList.toggle('active', tab === 'approved');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    currentCard = null;
}

function showApprove(btn) {
    currentCard = btn.closest('.card');
    const name = currentCard.querySelector('h3').textContent;
    const farmer = currentCard.querySelector('p').textContent.replace('Farmer: ', '');
    document.getElementById('approveContent').innerHTML = `<h3>${name}</h3><p>Farmer: ${farmer}</p><p>Once approved, this product will be visible to buyers.</p>`;
    document.getElementById('approveModal').classList.add('active');
}

function confirmApprove() {
    if (!currentCard) return;
    const name = currentCard.querySelector('h3').textContent;
    currentCard.querySelector('.badge').className = 'badge bg-green';
    currentCard.querySelector('.badge').textContent = 'Approved';
    currentCard.querySelector('div:last-child').innerHTML = '<button class="btn btn-danger" style="width:100%" onclick="showTakeDown(this)">Take Down</button>';

    document.getElementById('approvedTab').querySelector('div').appendChild(currentCard);
    document.getElementById('pendingCount').textContent = parseInt(document.getElementById('pendingCount').textContent) - 1;
    document.getElementById('approvedCount').textContent = parseInt(document.getElementById('approvedCount').textContent) + 1;

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
    const reason = document.querySelector('input[name="rejectReason"]:checked')?.value || document.getElementById('rejectOther').value;
    currentCard.remove();
    document.getElementById('pendingCount').textContent = parseInt(document.getElementById('pendingCount').textContent) - 1;
    closeModals();
    showToast(name + ' rejected!', 'error');
}

function showTakeDown(btn) {
    currentCard = btn.closest('.card');
    document.getElementById('takeDownModal').classList.add('active');
}

function confirmTakeDown() {
    if (!currentCard) return;
    const name = currentCard.querySelector('h3').textContent;
    const reason = document.querySelector('input[name="takeDownReason"]:checked')?.value || document.getElementById('takeDownOther').value;
    currentCard.remove();
    document.getElementById('approvedCount').textContent = parseInt(document.getElementById('approvedCount').textContent) - 1;
    closeModals();
    showToast(name + ' taken down!', 'error');
}

// Attach confirm button handlers
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnConfirmApprove').addEventListener('click', confirmApprove);
    document.getElementById('btnConfirmReject').addEventListener('click', confirmReject);
    document.getElementById('btnConfirmTakeDown').addEventListener('click', confirmTakeDown);
});