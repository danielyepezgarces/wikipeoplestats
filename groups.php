<?php
include 'languages.php'; // Cargar idiomas y traducciones

$project = isset($_GET['project']) ? $_GET['project'] : '';
$username = isset($_GET['username']) ? $_GET['username'] : '';
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Obtener el creation_date de la wiki seleccionada
$language = array_filter($languages, function($lang) use ($project) {
    return strpos($project, $lang['code']) !== false; // Comprobar si el código está en el input
});
$creation_date = !empty($language) ? reset($language)['creation_date'] : '';

// Establecer start_date y end_date
if (empty($start_date)) {
    $start_date = $creation_date; // Usar la fecha de creación si no se proporciona start_date
}
if (empty($end_date)) {
    $end_date = date('Y-m-d'); // Usar la fecha actual si no se proporciona end_date
}

// Inicializar cURL
$ch = curl_init();

// Configurar la URL y las opciones de cURL
$url = "https://wikipeoplestats.wmcloud.org/api/users/stats/{$project}/{$username}";
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

$group_name = "Wikimedia Argentina";
$admin_name = "Daniel YG";
$members_count = 125;
$group_description = "Wikimedia Argentina promueve la educación y el acceso a la cultura";
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($username) . ' - ' . __('sitename'); ?></title>
    <link href='https://tools-static.wmflabs.org/fontcdn/css?family=Montserrat:700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/font-awesome/6.7.1/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://tools-static.wmflabs.org/cdnjs/ajax/libs/apexcharts/3.54.0/apexcharts.js"></script>
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
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
    <?php include 'header.php'; // Incluir el encabezado ?>

    
    <main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-10 w-full max-w-4xl mx-auto">
    <!-- Header con Imagen del Grupo -->
    <div class="relative">
        <!-- Banner con centrado al fondo -->
        <div class="h-48 w-full bg-cover bg-center rounded-t-lg" 
             style="background-image: url('https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg'); background-position: bottom;">
            <!-- Texto superpuesto sobre el banner -->
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-4 rounded-b-lg">
                <h2 class="text-3xl font-bold"><?php echo $group_name; ?></h2>
                <p class="text-sm"><?php echo $group_description; ?></p>
            </div>
        </div>

        <!-- Avatar centrado sobre el banner -->
        <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div class="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg" 
                     alt="Group Avatar" class="h-full w-full rounded-full object-contain">
            </div>
        </div>
    </div>

    <!-- Contenido Principal -->
    <div class="mt-16 text-center">
        <!-- Nombre del Grupo -->
        <h2 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
            <?php echo $group_name; ?>
        </h2>

        <!-- Administrador -->
        <p class="text-lg text-gray-600 dark:text-gray-400 mt-2">
            <span class="font-semibold"><?php echo __('Group Admin'); ?>:</span> <?php echo $admin_name; ?>
        </p>

        <!-- Número de Miembros -->
        <p class="text-lg text-gray-600 dark:text-gray-400 mt-2">
            <span class="font-semibold"><?php echo __('Members Count'); ?>:</span> <?php echo $members_count; ?>
        </p>

        <!-- Botones de Acción -->
        <div class="mt-8 flex justify-center space-x-6">
            <button class="bg-blue-600 text-white px-6 py-3 text-lg rounded-lg shadow hover:bg-blue-700 transition">
                <?php echo __('Join Group'); ?>
            </button>
            <button class="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 text-lg rounded-lg shadow hover:bg-gray-400 dark:hover:bg-gray-600 transition">
                <?php echo __('View Details'); ?>
            </button>
        </div>
    </div>
</div>


    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_people'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeople)); ?>">
            <?php echo number_format($totalPeople, 0, '', ' '); ?>
        </p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_women'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomen)); ?>">
            <?php echo number_format($totalWomen, 0, '', ' '); ?>
        </p>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalWomen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_men'); ?></h3>
        <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMen)); ?>">
            <?php echo number_format($totalMen, 0, '', ' '); ?>
        </p>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Ratio: <?php echo number_format(($totalPeople > 0) ? ($totalMen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('other_genders'); ?></h3>
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
        <?php include 'languageselector.php'; ?>
        
    <script>
        let isCumulative = false; // Estado inicial
        let chart; // Variable para almacenar la instancia del gráfico

        async function fetchData() {
            try {
                const response = await fetch('https://wikipeoplestats.wmcloud.org/api/users/graph/<?php echo $project; ?>/<?php echo $username; ?>/<?php echo $start_date; ?>/<?php echo $end_date; ?>');
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
                        name: '<?php echo __('total_graph'); ?>',
                        data: isCumulative ? calculateCumulative(filteredData, 'total') : filteredData.map(item => item.total)
                    },
                    {
                        name: '<?php echo __('total_women'); ?>',
                        data: isCumulative ? calculateCumulative(filteredData, 'totalWomen') : filteredData.map(item => item.totalWomen)
                    },
                    {
                        name: '<?php echo __('total_men'); ?>',
                        data: isCumulative ? calculateCumulative(filteredData, 'totalMen') : filteredData.map(item => item.totalMen)
                    },
                    {
                        name: '<?php echo __('other_genders'); ?>',
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
    <script src="https://wikipeoplestats.wmcloud.org/assets/js/main.js"></script>
</body>
</html>
