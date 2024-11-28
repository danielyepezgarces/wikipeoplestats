function toggleLanguagePopup() {
    const popup = document.getElementById('language-popup');
    popup.classList.toggle('hidden');
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark'); // Cambiar a <html>
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Check for saved theme preference or default to dark mode
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
}

// Close language popup when clicking outside
window.addEventListener('click', function(e) {
    const popup = document.getElementById('language-popup');
    if (!popup.contains(e.target) && !e.target.closest('button[onclick="toggleLanguagePopup()"]')) {
        popup.classList.add('hidden');
    }
});