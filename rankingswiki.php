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
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-minimal.min.css">
    <!-- Incluir CSS de DataTables -->

    <!-- Incluir jQuery (DataTables depende de jQuery) -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

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
    </style>
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">


<?php include 'header.php'; // Incluir el encabezado ?>

<div class="w-4/5 mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8">
  <!-- Sidebar -->
  <aside class="col-span-1 bg-white dark:bg-[#1F2937] p-6 h-full lg:block border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Título de la sección -->
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6"><?php echo __('filters'); ?></h2>
    
    <!-- Sección By Date -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"><?php echo __('filters_bydate'); ?></h3>
      <ul>
        <li><a href="?interval=7d&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '7d') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_7d'); ?></a></li>
        <li><a href="?interval=1m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_1m'); ?></a></li>
        <li><a href="?interval=3m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '3m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_3m'); ?></a></li>
        <li><a href="?interval=6m&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '6m') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_6m'); ?></a></li>
        <li><a href="?interval=1y&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == '1y') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_last_1y'); ?></a></li>
        <li><a href="?interval=all&group=<?= htmlspecialchars($_GET['projectGroup'] ?? '') ?>" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['timeFrame'] == 'all') ? 'bg-primary-500 text-white' : '' ?>"><?php echo __('filters_alltime'); ?></a></li>
      </ul>
    </div>

    <!-- Sección By Project -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"><?php echo __('filters_byproject'); ?></h3>
      <ul>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wiki" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wiki') ? 'bg-primary-500 text-white' : '' ?>">Wikipedia</a></li>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wikiquote" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikiquote') ? 'bg-primary-500 text-white' : '' ?>">Wikiquote</a></li>
        <li><a href="?interval=<?= htmlspecialchars($_GET['timeFrame'] ?? '') ?>&group=wikisource" class="block py-4 px-2 text-base font-medium rounded hover:bg-primary-500 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 <?= ($_GET['projectGroup'] == 'wikimedia') ? 'bg-primary-500 text-white' : '' ?>">Wikisource</a></li>
      </ul>
    </div>
</aside>



<main class="col-span-5 bg-gray-50 dark:bg-[#1D2939] border border-gray-200 dark:border-gray-700 rounded-lg">
    <!-- Tabla -->
    <div class="">
        <div class="min-w-full rounded-lg bordershadow-sm">
            <!-- Cabecera de la tabla -->
            <table id="rankingwiki" class="display min-w-full bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700 p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <th class="text-center">#</th>
                        <th class="text-center"><?php echo __('project'); ?></th>
                        <th class="text-center"><?php echo __('total_people'); ?></th>
                        <th class="text-center"><?php echo __('total_women'); ?></th>
                        <th class="text-center"><?php echo __('total_men'); ?></th>
                        <th class="text-center"><?php echo __('other_genders'); ?></th>
                        <th class="text-center"><?php echo __('total_editors'); ?></th>
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
    var tableData = <?php echo json_encode($dataArray[0]); ?>;

    $('#rankingwiki').DataTable({
        data: tableData,
        columns: [
            {
                data: null, 
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: "site" },
            { data: "totalPeople" },
            { data: "totalWomen" },
            { data: "totalMen" },
            { data: "otherGenders" },
            { data: "totalContributions" }
        ],
        lengthChange: false, // Desactiva el control de "Results per page"
        language: {
            search: "",
            searchPlaceholder: "Search...",
            info: "<?php echo __('datatables_info'); ?>",
            paginate: {
                first: '«',
                previous: '‹',
                next: '›',
                last: '»'
            }
        },
        dom: '<"flex flex-col sm:flex-row items-center justify-between mb-4"<"flex items-center"l><"flex items-center"f>><"overflow-x-auto"t><"flex flex-col sm:flex-row items-center justify-between mt-4"<"flex items-center"i><"flex items-center"p>>',
        drawCallback: function() {
                // Detectar si es escritorio (ancho mayor a 1024px)
            if (window.innerWidth > 1024) {
                  $('.dataTables_wrapper .overflow-x-auto').removeClass('overflow-x-auto');
            } else {
                 // Asegurarse de que se aplique el scroll en pantallas pequeñas
                  $('.dataTables_wrapper').addClass('overflow-x-auto');
            }

            $('table.dataTable thead th').addClass(
             'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm py-3 px-4 border-b border-gray-300 dark:border-gray-600'
            );

            // Aplicar clases de Tailwind a varios elementos
            $('.dataTables_wrapper select, .dataTables_wrapper input[type="search"]').addClass('block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500');

            // Mejorar la apariencia de los botones de paginación
            $('.dataTables_wrapper .dataTables_paginate .paginate_button').addClass('px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 rounded-lg mx-1');

            // Mejorar la apariencia del botón activo
            $('.dataTables_wrapper .dataTables_paginate .paginate_button.current').addClass('bg-blue-500 text-white px-4 py-2 dark:text-white rounded-lg');
            $('.dataTables_wrapper .dataTables_paginate .paginate_button.current').removeClass('bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500');


            // Mejorar la apariencia del botón deshabilitado
            $('.dataTables_wrapper .dataTables_paginate .paginate_button.disabled').addClass('opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600');

            // Mejorar la apariencia del texto de información y selector de entradas
            $('.dataTables_wrapper .dataTables_info').addClass('text-sm text-gray-700 dark:text-gray-400 py-2 ml-4');
            $('.dataTables_wrapper .dataTables_length').addClass('text-sm text-gray-700 dark:text-gray-400 py-2');

            // Mejorar la apariencia de las filas y celdas de la tabla
            $('table.dataTable tbody tr').addClass('hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200');
            $('table.dataTable tbody td').addClass('p-3 text-sm text-gray-700 dark:text-gray-300');

            // Ajustar el contenedor de paginación
            $('.dataTables_wrapper .dataTables_paginate').addClass('pagination flex justify-center items-center space-x-2 mt-4 mb-4 mr-4');
            $('.dataTables_wrapper .dataTables_paginate .paginate_button').addClass('mx-1'); // Esto aplica margen horizontal a cada botón

            // Mejorar la apariencia del input de búsqueda
            $('.dataTables_wrapper .dataTables_filter input').addClass('ml-2');
            $('.dataTables_wrapper .dataTables_filter label').addClass('flex items-center');

            $('table.dataTable thead th').removeClass('sorting sorting_asc sorting_desc')
            .addClass('sorting bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm py-3 px-4 border-b border-gray-300 dark:border-gray-600');
        }
    });
});

</script>
</body>
</html>