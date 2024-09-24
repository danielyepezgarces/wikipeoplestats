// Function to toggle dark/light mode
function toggleTheme() {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');

    // Save the theme preference in local storage
    const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Function to toggle the mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Function to close the mobile menu
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.add('hidden');
}

// Function to handle clicks outside the mobile menu
function handleClickOutside(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const toggleButton = document.getElementById('toggle-menu-button');

    // Check if the click is outside the menu and the toggle button
    if (!mobileMenu.contains(event.target) && !toggleButton.contains(event.target)) {
        closeMobileMenu();
    }
}

// Load the saved theme preference from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load the default theme if no preference is set
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = 'light'; // Cambia esto a 'dark' si quieres que sea oscuro por defecto

    // Set the theme based on saved preference or default
    const themeToApply = savedTheme ? savedTheme : defaultTheme;
    document.documentElement.classList.toggle('dark', themeToApply === 'dark');

    // Add event listener for clicks outside the mobile menu
    document.addEventListener('click', handleClickOutside);
});
