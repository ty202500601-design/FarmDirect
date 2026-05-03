document.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('toast');

    function showToast(message, type = 'success') {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim().toLowerCase();
                if (query) {
                    showToast(`Searching for: ${query}`);
                }
            }
        });
    }

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

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});
