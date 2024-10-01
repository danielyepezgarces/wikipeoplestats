<?php
include 'languages.php'; // Cargar idiomas y traducciones
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"}
                    }
                }
            }
        }
    </script>
    <!-- Otras cabeceras -->
</head>
<body>
    <?php include 'header.php'; // Incluir el encabezado ?>
    
    <main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
        <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('welcome_message'); ?></h1>
        <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300"><?php echo __('main_home_content'); ?></p>
    </div>

    <!-- Contenedor de Inputs -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
        <h2 class="text-2xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('input_section_title'); ?></h2>
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_project_label'); ?></label>
                <input type="text" id="project" name="project" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500" required>
            </div>
            <div>
                <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_start_date_label'); ?></label>
                <input type="date" id="start_date" name="start_date" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500" required>
            </div>
            <div>
                <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_end_date_label'); ?></label>
                <input type="date" id="end_date" name="end_date" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500" required>
            </div>
            <div class="flex items-center justify-center">
                <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
                    <?php echo __('submit_button'); ?>
                </button>
            </div>
        </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total People</h3>
            <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeople)); ?>">0</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total Women</h3>
            <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomen)); ?>">0</p>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalWomen / $totalPeople) * 100 : 0, 2); ?>%</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total Men</h3>
            <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMen)); ?>">0</p>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalMen / $totalPeople) * 100 : 0, 2); ?>%</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Other Genders</h3>
            <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($otherGenders)); ?>">0</p>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($otherGenders / $totalPeople) * 100 : 0, 2); ?>%</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <i class="fas fa-concierge-bell text-3xl text-green-500 mb-2"></i>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total Users Contributions</h3>
            <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalContributions)); ?>">0</p>
        </div>
    </div>

    <p class="mt-6 text-gray-900 dark:text-gray-100 text-center text-lg font-semibold bg-gray-200 dark:bg-gray-700 p-4 rounded">
        <?php echo $errorMessage; ?>
    </p>
</main>


        <!-- Language Selector Popup -->
        <div id="language-popup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('select_language'); ?></h2>
            <div class="overflow-y-auto flex-grow">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <?php foreach ($languages as $lang): ?>
                        <button onclick="changeLanguage('<?php echo $lang['code']; ?>')" class="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                            <span class="text-2xl"><?php echo $lang['flag']; ?></span>
                            <span><?php echo $lang['name']; ?></span>
                        </button>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function changeLanguage(lang) {
            window.location.href = '/' + lang + '/';
        }

        function toggleLanguagePopup() {
            const popup = document.getElementById('language-popup');
            popup.classList.toggle('hidden');
        }

        function toggleTheme() {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        }

        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        }

        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        }

        // Close language popup when clicking outside
        window.addEventListener('click', function(e) {
            const popup = document.getElementById('language-popup');
            if (!popup.contains(e.target) && !e.target.closest('button[onclick="toggleLanguagePopup()"]')) {
                popup.classList.add('hidden');
            }
        });
    </script>
</body>
</html>
