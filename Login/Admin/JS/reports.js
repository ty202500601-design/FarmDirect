// reports.js - JavaScript for Reports & Complaints Page

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.report-card').forEach(card => {
        const typeBuyer = card.querySelector('.type.buyer');
        const status = card.querySelector('.report-status');

        if (tab === 'all') {
            card.style.display = 'flex';
        } else if (tab === 'buyers') {
            card.style.display = typeBuyer ? 'flex' : 'none';
        } else if (tab === 'sellers') {
            card.style.display = typeBuyer ? 'none' : 'flex';
        } else if (tab === 'resolved') {
            card.style.display = status.classList.contains('resolved') ? 'flex' : 'none';
        }
    });

    showToast('Showing ' + tab + ' reports');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            const caseNum = this.dataset.case;
            if (caseNum) viewReport(caseNum);
        });
    });
});

let currentCaseForAction = null;

function viewReport(caseNum) {
    const card = document.querySelector('.report-card[data-case="' + caseNum + '"]');
    const type = card.querySelector('.type').textContent;
    const name = card.querySelector('strong').textContent;
    const complaint = card.querySelector('p').textContent;
    const date = card.querySelector('.date').textContent;
    const status = card.querySelector('.report-status').textContent;

    document.getElementById('reviewCase').textContent = '#' + caseNum;
    document.getElementById('reviewType').textContent = type;
    document.getElementById('reviewParty').textContent = name;
    document.getElementById('reviewComplaint').textContent = complaint;
    document.getElementById('reviewDate').textContent = date;
    document.getElementById('reviewTitle').textContent = 'Case #' + caseNum + ' - ' + status;

    const evidenceImages = {
        'R-008': ['https://images.unsplash.com/photo-1518874112838-4eb9220dce86?w=200', 'https://images.unsplash.com/photo-1540420773420-3366772f4996?w=200'],
        'R-007': ['https://images.unsplash.com/photo-1601493700631-2b16ec4b6c6c?w=200'],
        'R-006': ['https://images.unsplash.com/photo-1604928141064-6f9f8e8e2f9d?w=200'],
        'R-005': [],
        'R-004': [],
        'R-003': [],
        'R-002': ['https://images.unsplash.com/photo-1607920591413-4b0077abc82e?w=200'],
        'R-001': []
    };

    const imgs = evidenceImages[caseNum] || [];
    const evidenceDiv = document.getElementById('reviewEvidence');
    if (imgs.length > 0) {
        evidenceDiv.innerHTML = imgs.map(url => `<img src="${url}" alt="Evidence">`).join('');
    } else {
        evidenceDiv.innerHTML = '<span style="color:#999;font-size:.9rem;">No evidence photos submitted</span>';
    }

    document.getElementById('btnResolve').style.display = (status === 'Resolved') ? 'none' : 'inline-block';
    document.getElementById('btnReject').style.display = (status === 'Resolved' || status === 'Rejected') ? 'none' : 'inline-block';

    document.getElementById('reviewModal').classList.add('active');
    currentCaseForAction = caseNum;
}

function closeReview() {
    document.getElementById('reviewModal').classList.remove('active');
    document.querySelector('.review-notes').value = '';
}

function resolveFromReview() {
    const card = document.querySelector('.report-card[data-case="' + currentCaseForAction + '"]');
    const status = card.querySelector('.report-status');
    const actions = card.querySelector('.report-actions');

    status.className = 'report-status resolved';
    status.textContent = 'Resolved';
    actions.innerHTML = '<button class="btn-action btn-pending">Reopen</button>';

    closeReview();
    showToast('Case ' + currentCaseForAction + ' resolved!');
}

function rejectFromReview() {
    const card = document.querySelector('.report-card[data-case="' + currentCaseForAction + '"]');
    const status = card.querySelector('.report-status');
    const actions = card.querySelector('.report-actions');

    status.className = 'report-status rejected';
    status.textContent = 'Rejected';
    actions.innerHTML = '<button class="btn-action btn-pending">Reopen</button>';

    closeReview();
    showToast('Case ' + currentCaseForAction + ' rejected!');
}

function reopenReport(btn) {
    const card = btn.closest('.report-card');
    const caseNum = card.dataset.case;
    const status = card.querySelector('.report-status');

    status.className = 'report-status pending';
    status.textContent = 'Pending';

    card.querySelector('.report-actions').innerHTML = '<button class="btn-action btn-pending" onclick="viewReport(\'' + caseNum + '\')">Review</button> <button class="btn-action btn-resolve" onclick="resolveFromButton(this)">Resolve</button> <button class="btn-action btn-reject" onclick="rejectFromButton(this)">Reject</button>';

    showToast('Case ' + caseNum + ' reopened');
}

function resolveFromButton(btn) {
    const card = btn.closest('.report-card');
    const caseNum = card.dataset.case;
    const status = card.querySelector('.report-status');

    status.className = 'report-status resolved';
    status.textContent = 'Resolved';
    card.querySelector('.report-actions').innerHTML = '<button class="btn-action btn-pending" onclick="reopenReport(this)">Reopen</button>';

    showToast('Case ' + caseNum + ' resolved!');
}

function rejectFromButton(btn) {
    const card = btn.closest('.report-card');
    const caseNum = card.dataset.case;
    const status = card.querySelector('.report-status');

    status.className = 'report-status rejected';
    status.textContent = 'Rejected';
    card.querySelector('.report-actions').innerHTML = '<button class="btn-action btn-pending" onclick="reopenReport(this)">Reopen</button>';

    showToast('Case ' + caseNum + ' rejected!');
}