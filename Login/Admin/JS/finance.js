document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-success').forEach(btn => {
        if (btn.textContent.includes('Approve')) {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const name = row.cells[0].textContent;
                const amount = row.cells[2].textContent;
                row.style.background = '#e8f5e9';
                row.style.opacity = '0.5';
                setTimeout(() => row.remove(), 500);
                showToast('Payout of ' + amount + ' approved for ' + name);
            });
        }
    });

    document.querySelectorAll('.btn-outline').forEach(btn => {
        if (btn.textContent.includes('Invoice')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const name = row.cells[0].textContent;
                const account = row.cells[1].textContent;
                const amount = row.cells[2].textContent;
                const amountNum = parseFloat(amount.replace(/[₱,]/g, ''));
                const fee = (amountNum * 0.05).toFixed(2);
                const total = (amountNum - fee).toFixed(2);

                document.getElementById('invoiceDate').textContent = new Date().toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                document.getElementById('invoiceFarmer').textContent = name;
                document.getElementById('invoiceAccount').textContent = account;
                document.getElementById('invoiceRef').textContent = 'FD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
                document.getElementById('invoiceAmount').textContent = amount;
                document.getElementById('invoiceFee').textContent = '-₱' + parseFloat(fee).toLocaleString();
                document.getElementById('invoiceTotal').textContent = '₱' + parseFloat(total).toLocaleString();
                document.getElementById('invoiceModal').classList.add('active');
            });
        }
    });

    const invoiceCloseButton = document.querySelector('#invoiceModal .btn-success');
    if (invoiceCloseButton) {
        invoiceCloseButton.addEventListener('click', () => {
            document.getElementById('invoiceModal').classList.remove('active');
        });
    }

    const exportButton = document.querySelector('.btn-info');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            showToast('Exporting monthly report...');
        });
    }
});
