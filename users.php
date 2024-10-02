<?php
include 'languages.php'; // Cargar idiomas y traducciones

$project = isset($_GET['project']) ? $_GET['project'] : '';
$username = isset($_GET['username']) ? $_GET['username'] : '';
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Inicializar cURL
$ch = curl_init();

// Configurar la URL y las opciones de cURL
$url = "https://wikipeoplestats.toolforge.org/api/users/stats/{$project}/{$username}";
if (!empty($start_date)) {
    $url .= "/{$start_date}";
    if (!empty($end_date)) {
        $url .= "/{$end_date}";
    }
}


curl_setopt($ch, CURLOPT_URL, $url);
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
    $errorMessage = __('coming_soon_tracking_wiki');
} else {
    // Asignar los valores de la respuesta
    $totalPeople = $data['totalPeople'] ?? 0;
    $totalWomen = $data['totalWomen'] ?? 0;
    $totalMen = $data['totalMen'] ?? 0;
    $otherGenders = $data['otherGenders'] ?? 0;
    // Mensaje de éxito según la wiki
    if ($project === 'all') {
        $errorMessage = __('homepage_global_stats_credits');
    } else {
        $lastUpdated = isset($data['last_updated']) ? $data['last_updated'] : 'N/A';
    
        // Reemplazar cualquier variación de wiki a .wikipedia.org
        $formattedProject = preg_replace('/^(.*?)(\.wiki|wiki)$/', '$1.wikipedia.org', $project);
    
        // En caso de que el formato ya sea correcto (por ejemplo, ya contiene .wikipedia.org)
        if (!preg_match('/\.wikipedia\.org$/', $formattedProject)) {
            $formattedProject .= '.org'; // Añadir .org si no está presente
        }
    
        $errorMessage = sprintf(
            __('homepage_stats_credits'),
            $formattedProject
        ) . ' - ' . __('homepage_stats_last_update') . ': ' . htmlspecialchars($lastUpdated);
    }
    
}

// Calcular los ratios
$ratioWomen = $totalPeople > 0 ? ($totalWomen / $totalPeople) * 100 : 0;
$ratioMen = $totalPeople > 0 ? ($totalMen / $totalPeople) * 100 : 0;
$ratioOtherGenders = $totalPeople > 0 ? ($otherGenders / $totalPeople) * 100 : 0;

// Obtener y formatear la última actualización
$lastUpdated = $data['lastUpdated'];
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <style>
    #chartContainer {
        width: 100%; /* O cualquier ancho deseado */
        height: 400px; /* Ajusta la altura según necesites */
    }
    #myChart {
        width: 100% !important; /* Asegúrate de que el canvas use todo el ancho */
        height: 100% !important; /* Asegúrate de que el canvas use toda la altura */
    }
</style>
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
    <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
        <?php 
            echo sprintf(__('welcome_user_message'), $username, $project); 
        ?>
    </h1>
    <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300">
    <?php echo sprintf(__('main_user_content'), $username, $project); ?>
    </p>
</div>


    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total People</h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeople)); ?>">
            <?php echo number_format($totalPeople, 0, '', ' '); ?>
        </p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total Women</h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomen)); ?>">
            <?php echo number_format($totalWomen, 0, '', ' '); ?>
        </p>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalWomen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Total Men</h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMen)); ?>">
            <?php echo number_format($totalMen, 0, '', ' '); ?>
        </p>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalMen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Other Genders</h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($otherGenders)); ?>">
            <?php echo number_format($otherGenders, 0, '', ' '); ?>
        </p>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($otherGenders / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
</div>

<div class="flex justify-end mt-4 mb-2">
        <button id="toggleChart" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">Mostrar Acumulado</button>
    </div>
<div class="mt-8" id="chartContainer"></div> <!-- Cambiado a div -->


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
    <?php if ($lang['code'] !== 'all'): // Omite el idioma 'all' ?>
        <button onclick="changeLanguage('<?php echo $lang['code']; ?>')" class="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
            <span class="text-2xl"><?php echo $lang['flag']; ?></span>
            <span><?php echo $lang['name']; ?></span>
        </button>
    <?php endif; ?>
<?php endforeach; ?>

                </div>
            </div>
        </div>
    </div>
    <script>
        let isCumulative = false; // Estado inicial
        let chart; // Variable para almacenar la instancia del gráfico

        async function fetchData() {
            try {
                const response = await fetch('https://wikipeoplestats.toolforge.org/api/users/graph/<?php echo $project; ?>/<?php echo $username; ?>/<?php echo $start_date; ?>/<?php echo $end_date; ?>');
                const data = await response.json();

                const firstNonZeroIndex = data.data.findIndex(item => item.total > 0 || item.totalWomen > 0 || item.totalMen > 0 || item.otherGenders > 0);
                const filteredData = data.data.slice(firstNonZeroIndex);

                if (filteredData.length === 0) {
                    console.error('No hay datos válidos para mostrar.');
                    return;
                }

                // Crear y renderizar el gráfico
                createChart(filteredData);
            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        }

        function calculateCumulative(data, key) {
            let cumulativeSum = 0;
            return data.map(item => {
                cumulativeSum += item[key];
                return cumulativeSum;
            });
        }

        function createChart(filteredData) {
            // Destruir el gráfico anterior si existe
            if (chart) {
                chart.destroy();
            }

            const options = {
                chart: {
                    type: 'line',
                    height: 400,
                },
                series: [
                    {
                        name: 'Total',
                        data: isCumulative ? calculateCumulative(filteredData, 'total') : filteredData.map(item => item.total)
                    },
                    {
                        name: 'Total Women',
                        data: isCumulative ? calculateCumulative(filteredData, 'totalWomen') : filteredData.map(item => item.totalWomen)
                    },
                    {
                        name: 'Total Men',
                        data: isCumulative ? calculateCumulative(filteredData, 'totalMen') : filteredData.map(item => item.totalMen)
                    },
                    {
                        name: 'Other Genders',
                        data: isCumulative ? calculateCumulative(filteredData, 'otherGenders') : filteredData.map(item => item.otherGenders)
                    }
                ],
                xaxis: {
                    categories: filteredData.map(item => `${item.year}-${item.month}`),
                    title: {
                        text: 'Mes'
                    }
                },
                yaxis: {
                    title: {
                        text: 'Cantidad'
                    }
                },
                tooltip: {
                    shared: true,
                    intersect: false,
                },
                legend: {
                    position: 'top'
                },
                stroke: {
                    curve: 'smooth'
                }
            };

            // Crear una nueva instancia del gráfico
            chart = new ApexCharts(document.querySelector("#chartContainer"), options);
            chart.render();
        }

        document.getElementById('toggleChart').addEventListener('click', () => {
            isCumulative = !isCumulative; // Alternar estado
            fetchData(); // Volver a obtener y renderizar el gráfico
            document.getElementById('toggleChart').innerText = isCumulative ? 'Mostrar Normal' : 'Mostrar Acumulado';
        });

        // Llamar a la función para obtener datos
        fetchData();
    </script>
    <script>



function changeLanguage(lang) {
    const url = lang ? '/' + lang + '/search/genders' : '/search/genders';
    window.location.href = url;
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
