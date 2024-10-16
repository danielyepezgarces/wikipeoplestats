<!-- Footer -->
<footer class="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
    <div class="border-t border-slate-900/5 py-10">
        <!-- Logo -->
        <div class="flex items-center justify-center mb-6 transition-transform transform hover:scale-105">
            <a href="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400" style="font-family: 'Montserrat', sans-serif;">
                <?php echo __('sitename'); ?>
            </a>
            <span class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase" style="line-height: 1;">
                Beta
            </span>
        </div>

        <div class="flex flex-col items-center">
            <p class="text-center text-sm leading-6 text-slate-500">
                © <?php echo date('Y'); ?> - <?php echo __('license_info'); ?>.
            </p>
            
            <div class="flex items-center justify-center space-x-4 text-sm font-semibold leading-6 text-slate-700 mt-4">
                <a href="/privacy-policy"><?php echo __('privacy_policy'); ?></a>
                <div class="h-4 w-px bg-slate-500/20"></div>
                <a href="/terms-of-use"><?php echo __('terms_of_use'); ?></a>
                <div class="h-4 w-px bg-slate-500/20"></div>
                <a href="https://github.com/danielyepezgarces/wikipeoplestats"><?php echo __('source_code'); ?></a>
            </div>
        </div>

        <!-- Mobile Footer Options -->
        <div class="flex items-center justify-center md:hidden mt-6 space-x-[10px]">
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
