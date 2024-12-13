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
            <p class="text-center text-sm leading-6 dark:text-white text-slate-500">
                © <?php echo date('Y'); ?> - <?php echo __('license_info'); ?>
            </p>
            
            <div class="flex items-center dark:text-white justify-center space-x-4 text-sm font-semibold leading-6 text-slate-700 mt-4">
                <a href="/privacy-policy"><?php echo __('privacy_policy'); ?></a>
                <div class="h-4 w-px bg-slate-500/20"></div>
                <a href="/terms-of-use"><?php echo __('terms_of_use'); ?></a>
                <div class="h-4 w-px bg-slate-500/20"></div>
                <a href="https://github.com/danielyepezgarces/wikipeoplestats"><?php echo __('source_code'); ?></a>
            </div>
        </div>

        <div class="flex justify-center mt-6 space-x-4 flex-wrap">
    <!-- Badge: Powered by Wikimedia -->
    <div class="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 px-4 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto mb-4 sm:mb-0">
        <a href="https://wikitech.wikimedia.org/wiki/Help:Cloud_Services_introduction" target="_blank" class="flex items-center w-full">
            <img class="h-12 w-12 mr-2 mx-auto sm:mx-0" src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Wikimedia_Cloud_Services_logo.svg" alt="Wikimedia Cloud Services Logo">
            <div class="flex flex-col items-center sm:items-start text-center w-full">
                <span class="text-sm font-normal text-gray-800 dark:text-gray-200">Powered by</span>
                <span class="text-sm font-semibold font-montserrat text-gray-800 dark:text-white">Wikimedia</span>
                <span class="text-sm font-normal text-gray-800 dark:text-gray-200">Cloud Services</span>
            </div>
        </a>
    </div>

    <!-- Badge: Data from Wikidata -->
    <div class="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 px-4 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto mb-4 sm:mb-0">
        <a href="https://www.wikidata.org" target="_blank" class="flex items-center w-full">
            <img class="h-12 w-12 mr-2 mx-auto sm:mx-0" src="https://upload.wikimedia.org/wikipedia/commons/7/71/Wikidata.svg" alt="Wikidata Logo">
            <div class="flex flex-col items-center sm:items-start text-center w-full">
                <span class="text-sm font-normal text-gray-800 dark:text-gray-200">Data from</span>
                <span class="text-sm font-semibold font-montserrat text-gray-800 dark:text-white">Wikidata</span>
            </div>
        </a>
    </div>

    <!-- Badge: Data queried via QLever -->
    <div class="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 px-4 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto mb-4 sm:mb-0">
        <a href="https://qlever.cs.uni-freiburg.de/wikidata" target="_blank" class="flex items-center w-full">
            <div class="flex items-center justify-center h-12 w-12 mr-2 mx-auto sm:mx-0">
                <i class="fas fa-bolt text-[#82B36F] text-3xl"></i>
            </div>
            <div class="flex flex-col items-center sm:items-start text-center w-full">
                <span class="text-sm font-normal text-gray-800 dark:text-gray-200">Data queried</span>
                <span class="text-sm font-semibold font-montserrat text-gray-800 dark:text-white">via QLever</span>
            </div>
        </a>
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
