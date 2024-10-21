<?php

include 'languages.php';

// Now you can access the wiki parameter like this:
$currentWiki = $currentLang['wiki'];
$wikiproject = $currentWiki === "globalwiki" ? "all" : $currentWiki;

// Inicializar cURL
$ch = curl_init();

// Configurar la URL y las opciones de cURL
curl_setopt($ch, CURLOPT_URL, "https://wikipeoplestats.danielyepezgarces.com.co/api/stats/{$wikiproject}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "User-Agent: WikiStatsPeople/1.0"
]);

// Ejecutar la solicitud
$response = curl_exec($ch);

// Verificar si hubo un error
if (curl_errno($ch)) {
    die("Error al acceder a la API: " . curl_error($ch));
}

// Cerrar cURL
curl_close($ch);

// Decodificar la respuesta JSON
$data = json_decode($response, true);

// Verificar si hay un error en la respuesta
if (isset($data['error']) && $data['error'] === 'No data found') {
    // Asignar cero a todas las estadísticas
    $totalPeople = 0;
    $totalWomen = 0;
    $totalMen = 0;
    $otherGenders = 0;
    $totalContributions = 0;
    $cachedUntil = $data['cachedUntil']; // Obtén la fecha de expiración
    $errorMessage = __('coming_soon_tracking_wiki');
} else {
    // Asignar los valores de la respuesta
    $totalPeople = $data['totalPeople'] ?? 0;
    $totalWomen = $data['totalWomen'] ?? 0;
    $totalMen = $data['totalMen'] ?? 0;
    $otherGenders = $data['otherGenders'] ?? 0;
    $totalContributions = $data['totalContributions'] ?? 0;
    $lastUpdated = $data['lastUpdated'] ?? "N/A";
    $cachedUntil = $data['cachedUntil']; // Obtén la fecha de expiración

// Mensaje de éxito según la wiki
if ($currentWiki === 'globalwiki') {
    $errorMessage = __('homepage_global_stats_credits');
} else {
    $lastUpdated = isset($data['last_updated']) ? $data['last_updated'] : 'N/A';
    $errorMessage = sprintf(
        __('homepage_stats_credits'), 
        str_replace('wiki', '.wikipedia', $currentWiki)
    ) . ' - ' . __('homepage_stats_last_update') . ': ' . htmlspecialchars($lastUpdated);
}
}

// Calcular los ratios
$ratioWomen = $totalPeople > 0 ? ($totalWomen / $totalPeople) * 100 : 0;
$ratioMen = $totalPeople > 0 ? ($totalMen / $totalPeople) * 100 : 0;
$ratioOtherGenders = $totalPeople > 0 ? ($otherGenders / $totalPeople) * 100 : 0;

// Obtener y formatear la última actualización
?>

<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <link href='https://tools-static.wmflabs.org/fontcdn/css?family=Montserrat:700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/font-awesome/6.6.0/css/all.css">
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-minimal.min.css">
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
</head>
<body class="bg-gray-100 dark:bg-darker text-gray-800 dark:text-gray-200 transition-colors duration-300">


<?php include 'header.php'; // Incluir el encabezado ?>

    
<main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
        <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('welcome_message'); ?></h1>
        <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300"><?php echo __('main_home_content'); ?></p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_people'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeople)); ?>">0</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_women'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomen)); ?>">0</p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($totalWomen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_men'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMen)); ?>">0</p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($totalMen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('other_genders'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($otherGenders)); ?>">0</p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($otherGenders / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-concierge-bell text-3xl text-green-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_editors'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalContributions)); ?>">0</p>
    </div>
</div>

<p class="mt-6 text-gray-900 dark:text-gray-100 text-center text-lg font-semibold bg-gray-200 dark:bg-gray-700 p-4 rounded">
    <?php echo $errorMessage; ?>
</p>

<div class="mt-8 text-center">
    <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        <?php echo __('cached_version_message', ['time' => $cachedUntil]); ?>
    </p>
    <div class="mt-4 inline-flex items-center justify-center">
        <button 
            id="purge-cache" 
            onclick="purgeCache()" 
            class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition flex items-center"
        >
            <span class="mr-2"><?php echo __('purge_cache_button'); ?></span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18M3 12h18M3 21h18" />
            </svg>
        </button>
    </div>
</div>


<?php include 'supporters.php'; ?>
<?php include 'footer.php'; ?>


</main>

<!-- Toast Container -->
<div id="toast" class="fixed bottom-4 right-4 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg hidden dark:bg-green-600">
    <span id="toast-message"></span>
    <button onclick="hideToast()" class="ml-2 text-white font-bold">&times;</button>
</div>

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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer/0.4.6/odometer.min.js"></script>
<script>
    // Inicializa los odómetros
    document.querySelectorAll('.odometer').forEach(function (odometer) {
        odometer.innerHTML = odometer.getAttribute('data-odometer-final');
    });
</script>


<script>
function showToast(message, bgColor = 'bg-green-500') {
    const toast = document.getElementById('toast');
    const messageElement = document.getElementById('toast-message');
    messageElement.innerText = message;
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white text-sm px-4 py-2 rounded shadow-lg dark:bg-green-600`;
    toast.classList.remove('hidden');

    // Oculta el toast después de 3 segundos
    setTimeout(() => {
        hideToast();
    }, 6000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
}

function purgeCache() {
    fetch("https://wikipeoplestats.danielyepezgarces.com.co/api/stats/<?php echo $wikiproject; ?>?action=purge", {
        method: 'GET',
        headers: {
            "User-Agent": "WikiStatsPeople/1.0"
        }
    })
    .then(response => response.json())
    .then(data => {
        // Muestra el toast de éxito
        showToast("<?php echo __('cache_purged_successfully'); ?>");
        
        // Recarga la página después de 2 segundos
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        showToast("<?php echo __('cache_purge_failed'); ?>", 'bg-red-500'); // Mensaje de error
    });
}
</script>

</body>
</html>