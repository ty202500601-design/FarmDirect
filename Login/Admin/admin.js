window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    document.querySelectorAll('.search-bar input').forEach((input) => {
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    showToast(`Searching for: ${query}`);
                }
            }
        });
    });

    document.querySelectorAll('.stats-grid .card').forEach((card) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const label = card.querySelector('.label')?.textContent || 'item';
            showToast(`Viewing ${label} details`);
        });
    });

    document.querySelectorAll('.notif-dropdown-item').forEach((item) => {
        item.addEventListener('click', () => {
            showToast('Notification opened');
        });
    });
});
