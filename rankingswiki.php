<?php
include 'languages.php';

function fetchData($timeFrame, $projectGroup) {
    $url = "https://wikipeoplestats.wmcloud.org/api/rankings/wiki.php?interval=$timeFrame&group=$projectGroup";

    // Usar file_get_contents o cURL para obtener los datos de la API
    $response = file_get_contents($url);

    // Comprobar si la respuesta es válida
    if ($response === false) {
        return [];
    }

    // Decodificar los datos JSON
    return json_decode($response, true);
}

// Obtener los parámetros de la URL
$timeFrame = isset($_GET['interval']) ? $_GET['interval'] : '1m';
$projectGroup = isset($_GET['group']) ? $_GET['group'] : 'wiki';



// Obtener los datos de la API
$data = fetchData($timeFrame, $projectGroup);

// Configuración de la paginación
$resultsPerPage = 10;  // Número de resultados por página
$totalResults = count($data);  // Número total de resultados
$totalPages = ceil($totalResults / $resultsPerPage);  // Número total de páginas

// Obtener la página actual desde la URL, por defecto es la página 1
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;

// Asegurarse de que la página actual esté dentro del rango válido
$currentPage = max(1, min($currentPage, $totalPages));

// Calcular el índice de inicio de los resultados en la página actual
$startIndex = ($currentPage - 1) * $resultsPerPage;

// Obtener los resultados para la página actual
$currentPageResults = array_slice($data, $startIndex, $resultsPerPage);

function buildPaginationUrl($page) {
    $url = $_SERVER['PHP_SELF'] . "?page=" . $page;
    // Agregar otros parámetros de la URL
    foreach ($_GET as $key => $value) {
        if ($key !== 'page') {
            $url .= "&$key=$value";
        }
    }
    return $url;
}
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
  <!-- Sidebar -->
  <aside class="col-span-1 bg-white dark:bg-[#1F2937] p-6 h-full lg:block border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Título de la sección -->
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Filters</h2>
    
    <!-- Sección By Date -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">By Date</h3>
      <ul>
        <li><a href="?timeFrame=7d&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '7d') ? 'bg-primary-500 text-white' : '' ?>">Last 7D</a></li>
        <li><a href="?timeFrame=1m&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1m') ? 'bg-primary-500 text-white' : '' ?>">Last 1M</a></li>
        <li><a href="?timeFrame=3m&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '3m') ? 'bg-primary-500 text-white' : '' ?>">Last 3M</a></li>
        <li><a href="?timeFrame=6m&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '6m') ? 'bg-primary-500 text-white' : '' ?>">Last 6M</a></li>
        <li><a href="?timeFrame=1y&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1y') ? 'bg-primary-500 text-white' : '' ?>">Last 1Y</a></li>
        <li><a href="?timeFrame=all&projectGroup=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == 'all') ? 'bg-primary-500 text-white' : '' ?>">All time</a></li>
      </ul>
    </div>
    
    <!-- Sección By Project -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">By Project</h3>
      <ul>
        <li><a href="?timeFrame=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&projectGroup=wiki" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wiki') ? 'bg-primary-500 text-white' : '' ?>">Wikipedia</a></li>
        <li><a href="?timeFrame=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&projectGroup=wikiquote" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikiquote') ? 'bg-primary-500 text-white' : '' ?>">Wikiquote</a></li>
        <li><a href="?timeFrame=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&projectGroup=wikimedia" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikimedia') ? 'bg-primary-500 text-white' : '' ?>">Wikisource</a></li>
      </ul>
    </div>
</aside>



  <!-- Main -->
  <main class="col-span-5 bg-gray-50 dark:bg-[#1D2939] border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Tabla -->
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

            <?php if (!empty($currentPageResults)) : ?>
                <?php foreach ($currentPageResults as $index => $item): ?>
                    <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
                        <div class="col-span-1 text-center"><?= $startIndex + $index + 1 ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['site']) ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['totalPeople']) ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['totalWomen']) ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['totalMen']) ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['otherGenders']) ?></div>
                        <div class="col-span-1 text-center"><?= htmlspecialchars($item['totalContributions']) ?></div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-span-7 text-center text-gray-500">No data available</div>
            <?php endif; ?>
        </div>
    </div>

<!-- Paginación -->
<div class="pagination flex justify-center items-center space-x-2 mt-4 mb-4">
    <!-- Enlace a la página anterior -->
    <?php if ($currentPage > 1): ?>
        <a href="<?= buildPaginationUrl($currentPage - 1) ?>" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded-lg">Previous</a>
    <?php else: ?>
        <span class="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white rounded-lg cursor-not-allowed">Previous</span>
    <?php endif; ?>

    <!-- Enlaces a las páginas (máximo 10 páginas) -->
    <?php
    $maxButtons = 10;
    $startPage = max(1, $currentPage - floor($maxButtons / 2));  // Rango de inicio
    $endPage = min($totalPages, $startPage + $maxButtons - 1); // Rango de fin

    // Si el rango de fin es menor que el total de páginas, ajustar el rango de inicio
    if ($endPage - $startPage + 1 < $maxButtons) {
        $startPage = max(1, $endPage - $maxButtons + 1);
    }

    // Mostrar los botones de las páginas
    for ($i = $startPage; $i <= $endPage; $i++):
    ?>
        <a href="<?= buildPaginationUrl($i) ?>" class="px-4 py-2 <?= $i === $currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500' ?> rounded-lg"><?= $i ?></a>
    <?php endfor; ?>

    <!-- Enlace a la siguiente página -->
    <?php if ($currentPage < $totalPages): ?>
        <a href="<?= buildPaginationUrl($currentPage + 1) ?>" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded-lg">Next</a>
    <?php else: ?>
        <span class="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white rounded-lg cursor-not-allowed">Next</span>
    <?php endif; ?>
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

    <script src="/assets/js/main.js?v=1"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer/0.4.6/odometer.min.js"></script>
<script>
    // Inicializa los odómetros
    document.querySelectorAll('.odometer').forEach(function (odometer) {
        odometer.innerHTML = odometer.getAttribute('data-odometer-final');
    });
</script>

</body>
</html>