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
$dataArray = array_values($data);

?>

<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <link href='https://tools-static.wmflabs.org/fontcdn/css?family=Montserrat:700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/font-awesome/6.6.0/css/all.css">
<link href="https://cdn.datatables.net/v/bm/dt-2.1.8/b-3.2.0/b-html5-3.2.0/datatables.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-minimal.min.css">
    <!-- Incluir CSS de DataTables -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">

    <!-- Incluir jQuery (DataTables depende de jQuery) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Incluir JS de DataTables -->
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
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
    <style>
        .dataTables_length {
    display: flex;              /* Usamos flexbox para alinear los elementos */
    align-items: center;        /* Centra verticalmente */
    gap: 10px;                  /* Espacio entre el label y el select */
    font-family: 'Arial', sans-serif; /* Fuente personalizada */
}
    </style>
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
        <li><a href="?interval=7d&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '7d') ? 'bg-primary-500 text-white' : '' ?>">Last 7D</a></li>
        <li><a href="?interval=1m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1m') ? 'bg-primary-500 text-white' : '' ?>">Last 1M</a></li>
        <li><a href="?interval=3m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '3m') ? 'bg-primary-500 text-white' : '' ?>">Last 3M</a></li>
        <li><a href="?interval=6m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '6m') ? 'bg-primary-500 text-white' : '' ?>">Last 6M</a></li>
        <li><a href="?interval=1y&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1y') ? 'bg-primary-500 text-white' : '' ?>">Last 1Y</a></li>
        <li><a href="?interval=all&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == 'all') ? 'bg-primary-500 text-white' : '' ?>">All time</a></li>
      </ul>
    </div>

    <!-- Sección By Project -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">By Project</h3>
      <ul>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wiki" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wiki') ? 'bg-primary-500 text-white' : '' ?>">Wikipedia</a></li>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wikiquote" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikiquote') ? 'bg-primary-500 text-white' : '' ?>">Wikiquote</a></li>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wikisource" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikimedia') ? 'bg-primary-500 text-white' : '' ?>">Wikisource</a></li>
      </ul>
    </div>
</aside>



<main class="col-span-5 bg-gray-50 dark:bg-[#1D2939] border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Tabla -->
    <div class="overflow-x-auto">
        <div class="min-w-full bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <!-- Cabecera de la tabla -->
            <table id="myTable" class="display min-w-full bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700 p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <th class="text-center">#</th>
                        <th class="text-center">Project</th>
                        <th class="text-center">Total People</th>
                        <th class="text-center">Total Women</th>
                        <th class="text-center">Total Men</th>
                        <th class="text-center">Other Genders</th>
                        <th class="text-center">Total Editors</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Aquí no es necesario insertar manualmente los datos con PHP -->
                </tbody>
            </table>
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
    <?php include 'languageselector.php'; ?>


    <script src="/assets/js/main.js?v=1"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer/0.4.6/odometer.min.js"></script>
<script>
    // Inicializa los odómetros
    document.querySelectorAll('.odometer').forEach(function (odometer) {
        odometer.innerHTML = odometer.getAttribute('data-odometer-final');
    });
</script>

<script>
$(document).ready(function() {
    // Los datos del PHP se pasan a JavaScript
    var tableData = <?php echo json_encode($dataArray[0]); ?>; // Accedemos al primer array dentro de la respuesta

    // Verificar si los datos son correctos en la consola
    console.log(tableData); // Verifica que los datos se estén pasando correctamente

    // Inicialización de DataTables
    $('#myTable').DataTable({
        "paging": true,             // Activa la paginación
        "searching": true,          // Activa la búsqueda
        "ordering": true,           // Activa el ordenamiento por columnas
        "pageLength": 10,           // Número de registros por página
        "lengthMenu": [10, 25, 50], // Opciones de páginas
        "data": tableData,          // Pasa todos los datos desde PHP
        "columns": [
            {
                "data": null, 
                "render": function (data, type, row, meta) {
                    return meta.row + 1;  // Esto muestra el índice de la fila
                }
            },
            { "data": "site" },            // Columna "Project"
            { "data": "totalPeople" },     // Columna "Total People"
            { "data": "totalWomen" },      // Columna "Total Women"
            { "data": "totalMen" },        // Columna "Total Men"
            { "data": "otherGenders" },    // Columna "Other Genders"
            { "data": "totalContributions" } // Columna "Total Editors"
        ]
    });
});


</script>
</body>
</html>