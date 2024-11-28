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
    // Obtener el valor de 'lang' de la URL actual (por ejemplo, '/es/rankings/wikis')
    $lang = $_GET['lang'] ?? 'en'; // Valor por defecto 'en' si no se encuentra 'lang'

    // Obtener la parte de la ruta actual para mantener la estructura como /rankings/wikis
    $baseUrl = "/$lang/rankings/wikis"; 

    // Agregar el parámetro 'page'
    $url = $baseUrl . "?page=" . $page;

    // Agregar otros parámetros como 'interval' y 'group', excluyendo 'page' y 'lang'
    foreach ($_GET as $key => $value) {
        if ($key !== 'page' && $key !== 'lang') {
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
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6"><?php echo __('filters'); ?></h2>

        <?php
        // Obtener los parámetros actuales sin incluir 'lang'
        $currentParams = $_GET;
        unset($currentParams['lang']);

        // Función para verificar si un parámetro está activo
        function isActive($key, $value) {
            return isset($_GET[$key]) && $_GET[$key] === $value;
        }
        ?>

        <!-- Sección By Date -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"><?php echo __('filters_bydate'); ?></h3>
            <ul>
                <li><a href="#" data-key="interval" data-value="7d" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('interval', '7d') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_7d'); ?></a></li>
                <li><a href="#" data-key="interval" data-value="1m" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('interval', '1m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_1m'); ?></a></li>
                <li><a href="#" data-key="interval" data-value="3m" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('interval', '3m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_3m'); ?></a></li>
                <li><a href="#" data-key="interval" data-value="6m" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('interval', '6m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_6m'); ?></a></li>
                <li><a href="#" data-key="interval" data-value="1y" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('interval', '1y') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_1y'); ?></a></li>
                <li><a href="#" data-key="interval" data-value="" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= !isset($_GET['interval']) ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_alltime'); ?></a></li>
            </ul>
        </div>

        <!-- Sección By Project -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"><?php echo __('filters_byproject'); ?></h3>
            <ul>
                <li><a href="#" data-key="group" data-value="wiki" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('group', 'wiki') ? 'bg-primary-500 text-white' : '' ?>">Wikipedia</a></li>
                <li><a href="#" data-key="group" data-value="wikiquote" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('group', 'wikiquote') ? 'bg-primary-500 text-white' : '' ?>">Wikiquote</a></li>
                <li><a href="#" data-key="group" data-value="wikisource" class="filter-link block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= isActive('group', 'wikisource') ? 'bg-primary-500 text-white' : '' ?>">Wikisource</a></li>
            </ul>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="col-span-5">
        <div class="overflow-hidden bg-white dark:bg-[#1F2937] p-6 shadow-lg rounded-lg">
            <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200"><?php echo __('title'); ?></h1>

            <!-- Tabla de resultados -->
            <div class="overflow-x-auto mt-6">
                <table class="min-w-full text-left text-sm">
                    <thead>
                        <tr>
                            <th class="px-4 py-2"><?php echo __('columns_rank'); ?></th>
                            <th class="px-4 py-2"><?php echo __('columns_project'); ?></th>
                            <th class="px-4 py-2"><?php echo __('columns_count'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($currentPageResults as $index => $item): ?>
                            <tr class="border-b dark:border-gray-700">
                                <td class="px-4 py-2"><?php echo $index + 1; ?></td>
                                <td class="px-4 py-2"><?php echo $item['project_name']; ?></td>
                                <td class="px-4 py-2"><?php echo $item['count']; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div class="mt-6">
                <nav aria-label="Page navigation">
                    <ul class="flex justify-center space-x-2">
                        <?php for ($page = 1; $page <= $totalPages; $page++): ?>
                            <li>
                                <a href="<?php echo buildPaginationUrl($page); ?>" class="py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 <?php echo $currentPage === $page ? 'font-semibold' : ''; ?>">
                                    <?php echo $page; ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                    </ul>
                </nav>
            </div>
        </div>
    </main>
</div>

</body>
</html>
