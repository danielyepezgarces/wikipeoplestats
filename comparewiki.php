<?php
include 'languages.php'; // Cargar idiomas y traducciones

// Verificar que los parámetros existan
$project = isset($_GET['project']) ? $_GET['project'] : null;
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;

// Verificar si el proyecto está definido y no está vacío
if ($project) {
    // Separar los proyectos
    $projects = explode('-', $project);

    // Inicializar variables para cada equipo
    $teamAStats = [];
    $teamBStats = [];

    // Función para formatear el nombre del proyecto
    function formatProject($project) {
        // Eliminar el prefijo 'www.' si existe
        $project = preg_replace('/^www\./', '', $project);
        
        // Reemplazar '.wikipedia.org', '.wikipedia', y '.wiki' con ''
        $project = preg_replace('/\.wikipedia\.org$|\.wikipedia$|\.wiki$/', '', $project);
        
        // Retornar el proyecto en el formato correcto
        return $project . 'wiki';
    }

    // Función para obtener datos del equipo
    function getTeamData($project, $start_date, $end_date) {
        // Inicializar cURL
        $ch = curl_init();
        $url = "https://wikipeoplestats.danielyepezgarces.com.co/api/genders/stats/{$project}";
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

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            die("Error al acceder a la API: " . curl_error($ch));
        }
        curl_close($ch);

        $data = json_decode($response, true);
        if (isset($data['error']) && $data['error'] === 'No data found') {
            return [
                'totalPeople' => 0,
                'totalWomen' => 0,
                'totalMen' => 0,
                'otherGenders' => 0
            ];
        } else {
            return [
                'totalPeople' => $data['totalPeople'] ?? 0,
                'totalWomen' => $data['totalWomen'] ?? 0,
                'totalMen' => $data['totalMen'] ?? 0,
                'otherGenders' => $data['otherGenders'] ?? 0
            ];
        }
    }

    // Asegurarse de que hay dos proyectos
    if (count($projects) == 2) {
        // Formatear y obtener datos para cada equipo
        $projectA = formatProject(trim($projects[0]));
        $projectB = formatProject(trim($projects[1]));

        $teamAStats = getTeamData($projectA, $start_date, $end_date);
        $teamBStats = getTeamData($projectB, $start_date, $end_date);
    } else {
        die("Se requieren exactamente dos proyectos en el parámetro 'project'.");
    }

    // Asignar a variables
    $totalPeopleA = $teamAStats['totalPeople'];
    $totalWomenA = $teamAStats['totalWomen'];
    $totalMenA = $teamAStats['totalMen'];
    $otherGendersA = $teamAStats['otherGenders'];

    $totalPeopleB = $teamBStats['totalPeople'];
    $totalWomenB = $teamBStats['totalWomen'];
    $totalMenB = $teamBStats['totalMen'];
    $otherGendersB = $teamBStats['otherGenders'];
} else {
    die("El parámetro 'project' no está definido.");
}


// Obtener y formatear la última actualización
$lastUpdated = $data['lastUpdated'];
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <link href='https://tools-static.wmflabs.org/fontcdn/css?family=Montserrat:700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
    <?php include 'header.php'; // Incluir el encabezado ?>

    <main class="container mx-auto px-4 py-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
            <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
                <?php 
                    echo sprintf(__('welcome_project_message'), $project); 
                ?>
            </h1>
            <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300">
                <?php echo sprintf(__('main_project_content'), $project); ?>
            </p>
        </div>


        <div class="flex justify-between mt-8">
    <!-- Contenedor Izquierdo -->
    <div class="w-full md:w-1/2 p-4">
        <h2 class="text-center font-bold text-2xl mb-4"><?php echo $projectA; ?></h2>
        <div class="flex justify-between">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-center items-center text-center flex-1 mx-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_people'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeopleA)); ?>">
                    <?php echo number_format($totalPeopleA, 0, '', ' '); ?>
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_women'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomenA)); ?>">
                    <?php echo number_format($totalWomenA, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleA > 0) ? ($totalWomenA / $totalPeopleA) * 100 : 0, 2); ?>%</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_men'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMenA)); ?>">
                    <?php echo number_format($totalMenA, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleA > 0) ? ($totalMenA / $totalPeopleA) * 100 : 0, 2); ?>%</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('other_genders'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($otherGendersA)); ?>">
                    <?php echo number_format($otherGendersA, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleA > 0) ? ($otherGendersA / $totalPeopleA) * 100 : 0, 2); ?>%</p>
            </div>
        </div>
    </div>

    <!-- Contenedor Derecho -->
    <div class="w-full md:w-1/2 p-4">
        <h2 class="text-center font-bold text-2xl mb-4"><?php echo $projectB; ?></h2>
        <div class="flex justify-between">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-center items-center text-center flex-1 mx-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_people'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalPeopleB)); ?>">
                    <?php echo number_format($totalPeopleB, 0, '', ' '); ?>
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_women'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalWomenB)); ?>">
                    <?php echo number_format($totalWomenB, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleB > 0) ? ($totalWomenB / $totalPeopleB) * 100 : 0, 2); ?>%</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('total_men'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($totalMenB)); ?>">
                    <?php echo number_format($totalMenB, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleB > 0) ? ($totalMenB / $totalPeopleB) * 100 : 0, 2); ?>%</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex-1 mx-1">
                <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100"><?php echo __('other_genders'); ?></h3>
                <p class="odometer text-2xl font-semibold text-gray-700 dark:text-gray-300" data-odometer-final="<?php echo str_replace(',', ' ', number_format($otherGendersB)); ?>">
                    <?php echo number_format($otherGendersB, 0, '', ' '); ?>
                </p>
                <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeopleB > 0) ? ($otherGendersB / $totalPeopleB) * 100 : 0, 2); ?>%</p>
            </div>
        </div>
    </div>
</div>



        <div class="flex justify-end mt-4 mb-2">
            <button id="toggleChart" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">Mostrar Acumulado</button>
        </div>
        <div class="mt-8" id="chartContainer"></div> <!-- Cambiado a div -->
        
        <p class="mt-6 text-gray-900 dark:text-gray-100 text-center text-lg font-semibold bg-gray-200 dark:bg-gray-700 p-4 rounded">
            <?php echo $errorMessage; ?>
        </p>
    </main>

    <script>
    let isCumulative = false;
    let chart; 

    async function fetchData() {
        try {
            // Crear las promesas para ambas solicitudes
            const responses = await Promise.all([
    fetch(`https://corsproxy.io/?${encodeURIComponent('https://wikipeoplestats.danielyepezgarces.com.co/api/genders/graph/<?php echo $projectA; ?>/<?php echo $start_date; ?>/<?php echo $end_date; ?>')}`),
    fetch(`https://corsproxy.io/?${encodeURIComponent('https://wikipeoplestats.danielyepezgarces.com.co/api/genders/graph/<?php echo $projectB; ?>/<?php echo $start_date; ?>/<?php echo $end_date; ?>')}`)
]);

            const dataA = await responses[0].json();
            const dataB = await responses[1].json();

            const combinedData = combineData(dataA.data, dataB.data);

            const firstNonZeroIndex = combinedData.findIndex(item => item.total > 0 || item.totalWomen > 0 || item.totalMen > 0 || item.otherGenders > 0);
            const filteredData = combinedData.slice(firstNonZeroIndex);

            if (filteredData.length === 0) {
                console.error('No hay datos válidos para mostrar.');
                return;
            }

            // Crear y renderizar el gráfico
            createChart(filteredData, dataA.data, dataB.data);
        } catch (error) {
            console.error('Error al obtener datos:', error);
        }
    }

    function combineData(dataA, dataB) {
        // Combinar los datos de ambos proyectos
        return dataA.map((item, index) => {
            const itemB = dataB[index] || { total: 0, totalWomen: 0, totalMen: 0, otherGenders: 0 };
            return {
                year: item.year,
                month: item.month,
                total: item.total + itemB.total,
                totalWomen: item.totalWomen + itemB.totalWomen,
                totalMen: item.totalMen + itemB.totalMen,
                otherGenders: item.otherGenders + itemB.otherGenders,
            };
        });
    }

    function calculateCumulative(data, key) {
        let cumulativeSum = 0;
        return data.map(item => {
            cumulativeSum += item[key];
            return cumulativeSum;
        });
    }

    function createChart(filteredData, dataA, dataB) {
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
                    name: '<?php echo __('total_graph'); ?> (A)',
                    data: isCumulative ? calculateCumulative(filteredData, 'total') : filteredData.map(item => item.total)
                },
                {
                    name: '<?php echo __('total_women'); ?> (A)',
                    data: isCumulative ? calculateCumulative(filteredData, 'totalWomen') : filteredData.map(item => item.totalWomen)
                },
                {
                    name: '<?php echo __('total_men'); ?> (A)',
                    data: isCumulative ? calculateCumulative(filteredData, 'totalMen') : filteredData.map(item => item.totalMen)
                },
                {
                    name: '<?php echo __('other_genders'); ?> (A)',
                    data: isCumulative ? calculateCumulative(filteredData, 'otherGenders') : filteredData.map(item => item.otherGenders)
                },
                {
                    name: '<?php echo __('total_graph'); ?> (B)',
                    data: isCumulative ? calculateCumulative(dataB, 'total') : dataB.map(item => item.total)
                },
                {
                    name: '<?php echo __('total_women'); ?> (B)',
                    data: isCumulative ? calculateCumulative(dataB, 'totalWomen') : dataB.map(item => item.totalWomen)
                },
                {
                    name: '<?php echo __('total_men'); ?> (B)',
                    data: isCumulative ? calculateCumulative(dataB, 'totalMen') : dataB.map(item => item.totalMen)
                },
                {
                    name: '<?php echo __('other_genders'); ?> (B)',
                    data: isCumulative ? calculateCumulative(dataB, 'otherGenders') : dataB.map(item => item.otherGenders)
                }
            ],
            xaxis: {
                categories: filteredData.map(item => `${item.year}-${item.month}`),
                title: {
                    text: '<?php echo __('timeline_graph'); ?>'
                }
            },
            yaxis: {
                title: {
                    text: '<?php echo __('quantity_graph'); ?>'
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
</body>
</html>
