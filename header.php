<!-- header.php -->
<header class="sticky top-0 z-50 w-full bg-gray-100 dark:bg-gray-800 shadow-md">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center transition-transform transform hover:scale-105">
                <a href="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    <?php echo __('sitename'); ?>
                </a>
                <span class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase">
                    Beta
                </span>
            </div>
            <!-- Menu y selector de idioma -->
            <nav class="hidden md:flex space-x-4">
                <a href="#" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('home'); ?></a>
                <a href="#" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-10"><?php echo __('genders'); ?></a>
                <!-- Agrega más enlaces aquí -->
            </nav>
            <div class="flex items-center space-x-4">
                <button onclick="toggleLanguagePopup()" class="flex items-center space-x-2">
                    <span><?php echo $currentLang['flag']; ?></span>
                    <span><?php echo $currentLang['name']; ?></span>
                </button>
                <!-- Otros botones -->
            </div>
        </div>
    </div>
</header>
