<!-- Footer -->
<footer class="bg-gray-100 dark:bg-gray-800 p-4">
    <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4 md:hidden"> <!-- Show only on mobile -->
            <!-- Language Selector -->
            <button onclick="toggleLanguagePopup()" class="flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <span><?php echo $currentLang['flag']; ?></span>
            </button>

            <!-- Dark/Light Mode Toggle -->
            <button onclick="toggleTheme()" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            </button>
        </div>
    </div>
</footer>
