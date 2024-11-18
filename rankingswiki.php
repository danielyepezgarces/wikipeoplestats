<?php

include 'languages.php';

// Now you can access the wiki parameter like this:
$currentWiki = $currentLang['wiki'];
$wikiproject = $currentWiki === "globalwiki" ? "all" : $currentWiki;

// Inicializar cURL
$ch = curl_init();

// Configurar la URL y las opciones de cURL
curl_setopt($ch, CURLOPT_URL, "https://wikipeoplestats.wmcloud.org/api/stats/{$wikiproject}");
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
    $lastUpdated = "N/A";
    $errorMessage = __('coming_soon_tracking_wiki');
} else {
    // Asignar los valores de la respuesta
    $totalPeople = $data['totalPeople'] ?? 0;
    $totalWomen = $data['totalWomen'] ?? 0;
    $totalMen = $data['totalMen'] ?? 0;
    $otherGenders = $data['otherGenders'] ?? 0;
    $totalContributions = $data['totalContributions'] ?? 0;
    $lastUpdated = $data['lastUpdated'];
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
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">


<?php include 'header.php'; // Incluir el encabezado ?>

<div class="w-4/5 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- Sidebar (1 parte) -->
  <aside class="bg-white dark:bg-[#1F2937] p-6 h-full lg:block">
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Opciones</h2>
    <ul>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 7D</a></li>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 1M</a></li>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 3M</a></li>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 6M</a></li>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 1Y</a></li>
      <li><a href="#" class="block py-2 px-4 rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">All time</a></li>
    </ul>
  </aside>

  <!-- Main Content (2 partes) -->
  <main class="col-span-2 bg-gray-50 dark:bg-[#1D2939] p-8 lg:p-16">
    <!-- Aquí no hay contenido -->
  </main>
</div>

      <!-- Footer -->
      <?php include 'footer.php'; ?>


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
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer/0.4.6/odometer.min.js"></script>
<script>
    // Inicializa los odómetros
    document.querySelectorAll('.odometer').forEach(function (odometer) {
        odometer.innerHTML = odometer.getAttribute('data-odometer-final');
    });
</script>

    
</body>
</html>