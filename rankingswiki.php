<?php
include 'languages.php';

// Función para obtener los datos de la API con parámetros dinámicos
function fetchData($timeFrame, $projectGroup) {
  // Construir la URL de la API con los parámetros dinámicos
  $api_url = "https://wikipeoplestats.wmcloud.org/api/rankings/wiki.php?timeFrame=$timeFrame&projectGroup=$projectGroup";
  
  // Usar cURL para obtener los datos de la API
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $api_url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);
  curl_close($ch);

  // Decodificar la respuesta JSON
  return json_decode($response, true);
}

// Si la solicitud es AJAX, enviar los datos en formato JSON
if (isset($_GET['ajax'])) {
  $timeFrame = isset($_GET['timeFrame']) ? $_GET['timeFrame'] : '1m'; // Default 1 month
  $projectGroup = isset($_GET['projectGroup']) ? $_GET['projectGroup'] : 'wiki'; // Default wiki
  $data = fetchData($timeFrame, $projectGroup);
  echo json_encode($data);  // Enviar los datos como JSON
  exit;
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

<div class="container mx-auto py-8">
    <!-- Formulario para cambiar los parámetros -->
    <form id="filterForm" class="mb-8">
        <div class="flex space-x-4">
            <div>
                <label for="timeFrame" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Time Frame</label>
                <select name="timeFrame" id="timeFrame" class="mt-1 block w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>
            <div>
                <label for="projectGroup" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Project Group</label>
                <select name="projectGroup" id="projectGroup" class="mt-1 block w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <option value="wiki">Wiki</option>
                    <option value="wikidata">Wikidata</option>
                    <option value="wikimedia">Wikimedia</option>
                </select>
            </div>
        </div>
    </form>

    <!-- Tabla donde se mostrarán los resultados -->
    <div class="overflow-x-auto">
        <div class="min-w-full bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" id="table-container">
            <!-- La tabla se actualizará dinámicamente aquí -->
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    // Función para actualizar la tabla con los datos de la API
    function updateTable(timeFrame, projectGroup) {
        $.ajax({
            url: 'tu_archivo_php.php',  // Ruta al archivo PHP que devuelve los datos en JSON
            type: 'GET',
            data: {
                ajax: true,
                timeFrame: timeFrame,
                projectGroup: projectGroup
            },
            success: function(response) {
                const data = JSON.parse(response);
                let tableHtml = `
                    <div class="grid grid-cols-7 bg-gray-100 dark:bg-gray-700 p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <div class="col-span-1 text-center">#</div>
                        <div class="col-span-1 text-center">Project</div>
                        <div class="col-span-1 text-center">Total People</div>
                        <div class="col-span-1 text-center">Total Women</div>
                        <div class="col-span-1 text-center">Total Men</div>
                        <div class="col-span-1 text-center">Other Genders</div>
                        <div class="col-span-1 text-center">Total Editors</div>
                    </div>`;

                // Si hay datos, crear filas para cada uno
                if (data && data.length > 0) {
                    data.forEach((item, index) => {
                        tableHtml += `
                            <div class="grid grid-cols-7 p-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
                                <div class="col-span-1 text-center">${index + 1}</div>
                                <div class="col-span-1 text-center">${item.project}</div>
                                <div class="col-span-1 text-center">${item.totalPeople}</div>
                                <div class="col-span-1 text-center">${item.totalWomen}</div>
                                <div class="col-span-1 text-center">${item.totalMen}</div>
                                <div class="col-span-1 text-center">${item.otherGenders}</div>
                                <div class="col-span-1 text-center">${item.totalEditors}</div>
                            </div>`;
                    });
                } else {
                    tableHtml += `<div class="col-span-7 text-center text-gray-500">No data available</div>`;
                }

                // Actualizar el contenido de la tabla
                $('#table-container').html(tableHtml);
            }
        });
    }

    // Escuchar los cambios en los selectores
    $('#filterForm').change(function() {
        const timeFrame = $('#timeFrame').val();
        const projectGroup = $('#projectGroup').val();
        updateTable(timeFrame, projectGroup); // Actualizar la tabla con los nuevos parámetros
    });

    // Cargar la tabla con los valores predeterminados al cargar la página
    updateTable('1m', 'wiki'); // Valores predeterminados
});
</script>


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