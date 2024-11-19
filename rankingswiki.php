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

<div class="w-4/5 mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8">
  <!-- Sidebar (1/6 del ancho en pantallas grandes) -->
  <aside class="col-span-1 bg-white dark:bg-[#1F2937] p-6 h-full lg:block border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Título de la sección -->
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Filters</h2>
    
    <!-- Sección By Date -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">By Date</h3>
      <ul>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 7D</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 1M</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 3M</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 6M</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Last 1Y</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">All time</a></li>
      </ul>
    </div>
    
    <!-- Sección By Project -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">By Project</h3>
      <ul>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Wikipedia</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Wikiquote</a></li>
        <li><a href="#" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200">Wikisource</a></li>
      </ul>
    </div>
  </aside>

  <!-- Main Content (5/6 del ancho en pantallas grandes) -->
  <main class="col-span-5 bg-gray-50 dark:bg-[#1D2939] border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Tabla full width -->
    <div class="overflow-x-auto">
      <div class="min-w-full bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <!-- Cabecera de la tabla -->
        <div class="grid grid-cols-7 bg-gray-100 dark:bg-gray-700 p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
          <div class="col-span-1 text-center">#</div>
          <div class="col-span-1 text-center">Project</div>
          <div class="col-span-1 text-center">Total People</div>
          <div class="col-span-1 text-center">Total Women</div>
          <div class="col-span-1 text-center">Total Men</div>
          <div class="col-span-1 text-center">Other Genders</div>
          <div class="col-span-1 text-center">Total Editors</div>
        </div>
        <!-- Fila de Datos -->
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">1</div>
          <div class="col-span-1 text-center">enwiki</div>
          <div class="col-span-1 text-center">4,536,514</div>
          <div class="col-span-1 text-center">814,077</div>
          <div class="col-span-1 text-center">3,537,989</div>
          <div class="col-span-1 text-center">184,448</div>
          <div class="col-span-1 text-center">1,079,811</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">2</div>
          <div class="col-span-1 text-center">eswiki</div>
          <div class="col-span-1 text-center">2,234,567</div>
          <div class="col-span-1 text-center">456,123</div>
          <div class="col-span-1 text-center">1,789,456</div>
          <div class="col-span-1 text-center">99,123</div>
          <div class="col-span-1 text-center">567,890</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">3</div>
          <div class="col-span-1 text-center">enwikiquote</div>
          <div class="col-span-1 text-center">1,123,456</div>
          <div class="col-span-1 text-center">210,678</div>
          <div class="col-span-1 text-center">800,345</div>
          <div class="col-span-1 text-center">45,567</div>
          <div class="col-span-1 text-center">123,456</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">4</div>
          <div class="col-span-1 text-center">eswikiquote</div>
          <div class="col-span-1 text-center">500,000</div>
          <div class="col-span-1 text-center">100,000</div>
          <div class="col-span-1 text-center">350,000</div>
          <div class="col-span-1 text-center">10,000</div>
          <div class="col-span-1 text-center">80,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">5</div>
          <div class="col-span-1 text-center">frwiki</div>
          <div class="col-span-1 text-center">1,876,234</div>
          <div class="col-span-1 text-center">350,654</div>
          <div class="col-span-1 text-center">1,200,123</div>
          <div class="col-span-1 text-center">35,000</div>
          <div class="col-span-1 text-center">450,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">6</div>
          <div class="col-span-1 text-center">dewiki</div>
          <div class="col-span-1 text-center">2,345,678</div>
          <div class="col-span-1 text-center">450,000</div>
          <div class="col-span-1 text-center">1,700,000</div>
          <div class="col-span-1 text-center">35,000</div>
          <div class="col-span-1 text-center">560,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">7</div>
          <div class="col-span-1 text-center">itwiki</div>
          <div class="col-span-1 text-center">1,234,567</div>
          <div class="col-span-1 text-center">320,000</div>
          <div class="col-span-1 text-center">900,000</div>
          <div class="col-span-1 text-center">25,000</div>
          <div class="col-span-1 text-center">450,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">8</div>
          <div class="col-span-1 text-center">plwiki</div>
          <div class="col-span-1 text-center">800,000</div>
          <div class="col-span-1 text-center">150,000</div>
          <div class="col-span-1 text-center">600,000</div>
          <div class="col-span-1 text-center">20,000</div>
          <div class="col-span-1 text-center">250,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
          <div class="col-span-1 text-center">9</div>
          <div class="col-span-1 text-center">ja.wikipedia</div>
          <div class="col-span-1 text-center">2,500,000</div>
          <div class="col-span-1 text-center">550,000</div>
          <div class="col-span-1 text-center">1,900,000</div>
          <div class="col-span-1 text-center">50,000</div>
          <div class="col-span-1 text-center">620,000</div>
        </div>
        <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 font-semibold bg-gray-100 dark:bg-gray-800">
          <div class="col-span-1 text-center">Total</div>
          <div class="col-span-1 text-center"></div>
          <div class="col-span-1 text-center">15,876,060</div>
          <div class="col-span-1 text-center">3,805,954</div>
          <div class="col-span-1 text-center">13,028,348</div>
          <div class="col-span-1 text-center">627,963</div>
          <div class="col-span-1 text-center">4,287,904</div>
        </div>
      </div>
    </div>
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