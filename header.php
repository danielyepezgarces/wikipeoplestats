<header class="sticky top-0 z-50 w-full bg-gray-100 dark:bg-gray-800 shadow-md">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center transition-transform transform hover:scale-105">
                <a href="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400" style="font-family: 'Montserrat', sans-serif;">
                    <?php echo __('sitename'); ?>
                </a>
                <span class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase" style="line-height: 1;">
                    Beta
                </span>
            </div>

            <!-- Desktop Menu -->
            <nav class="hidden md:flex space-x-4">
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('home'); ?></a>
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/search/genders" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('genders'); ?></a>
                <a href="#" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('countries'); ?></a>
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/search/users" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('users'); ?></a>
                <a href="https://github.com/danielyepezgarces/wikipeoplestats" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('source_code'); ?></a>
            </nav>

            <div class="flex items-center space-x-4">
                <!-- Mobile Menu Button -->
                <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="md:hidden hidden transition-all duration-300 ease-in-out">
            <div class="px-2 pt-2 pb-3 space-y-2 sm:px-3">
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/" class="block px-3 py-4 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <i class="fas fa-home mr-2"></i><?php echo __('home'); ?>
                </a>
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/search/genders" class="block px-3 py-4 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <i class="fas fa-genderless mr-2"></i><?php echo __('genders'); ?>
                </a>
                <a href="#" class="block px-3 py-4 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <i class="fas fa-flag mr-2"></i><?php echo __('countries'); ?>
                </a>
                <a href="/<?php echo htmlspecialchars($currentLang['code']); ?>/search/users" class="block px-3 py-4 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <i class="fas fa-users mr-2"></i><?php echo __('users'); ?>
                </a>
                <a href="https://github.com/danielyepezgarces/wikipeoplestats" class="block px-3 py-4 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <i class="fas fa-code mr-2"></i><?php echo __('source_code'); ?>
                </a>
            </div>
        </div>
    </div>
</header>