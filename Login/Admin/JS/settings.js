// Settings navigation
document.querySelectorAll('.settings-nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        showToast('Viewing ' + this.textContent.trim());
    });
});

// Toggle switches - show feedback when toggled
document.querySelectorAll('.switch input').forEach(toggle => {
    toggle.addEventListener('change', function() {
        const label = this.closest('.toggle-switch').querySelector('.toggle-label').textContent;
        const status = this.checked ? 'enabled' : 'disabled';
        showToast(label + ' ' + status);
    });
});

// Save button
document.querySelector('.btn-save').addEventListener('click', function() {
    const name = document.querySelector('input[type="text"]:nth-of-type(1)').value;
    const email = document.querySelector('input[type="email"]').value;
    const zones = document.querySelectorAll('.form-input')[3].value;
    const commission = document.querySelector('input[type="number"]').value;

    showToast('Settings saved successfully!');
});

// Form input focus effects
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--accent-green)';
    });
    input.addEventListener('blur', function() {
        this.style.borderColor = '#ddd';
    });
});