<?php
include 'languages.php'; // Cargar idiomas y traducciones

$project = isset($_GET['project']) ? $_GET['project'] : '';
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
<body>
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
        
        <p class="mt-6 text-gray-900 dark:text-gray-100 text-center text-lg font-semibold bg-gray-200 dark:bg-gray-700 p-4 rounded">
            <?php echo $errorMessage; ?>
        </p>
    </main>

    <script>
        let isCumulative = false;
        let chart; 

async function loadTranslations(locale) {
    try {
        const response = await fetch(`languages/${locale}.json`);
        translations = await response.json();
    } catch (error) {
        console.error('Error al cargar las traducciones:', error);
    }
}

        async function fetchData() {
            try {
                const response = await fetch('https://wikipeoplestats.danielyepezgarces.com.co/api/genders/graph/<?php echo $project; ?>/<?php echo $start_date; ?>/<?php echo $end_date; ?>');
                console.log(response)
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
                    "locales": [
    {
      "name": "en",
      "options": {
        "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "toolbar": {
          "exportToSVG": "Download SVG",
          "exportToPNG": "Download PNG",
          "menu": "Menu",
          "selection": "Selection",
          "selectionZoom": "Selection Zoom",
          "zoomIn": "Zoom In",
          "zoomOut": "Zoom Out",
          "pan": "Panning",
          "reset": "Reset Zoom"
        }
      }
    },
    {
      "name": "fr",
      "options": {
        "months": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        "shortMonths": ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
        "days": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        "shortDays": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        "toolbar": {
          "exportToSVG": "Télécharger SVG",
          "exportToPNG": "Télécharger PNG",
          "menu": "Menu",
          "selection": "Sélection",
          "selectionZoom": "Zoom sur sélection",
          "zoomIn": "Zoom avant",
          "zoomOut": "Zoom arrière",
          "pan": "Déplacer",
          "reset": "Réinitialiser le zoom"
        }
      }
    },
    {
      "name": "es",
      "options": {
        "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        "shortDays": ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        "toolbar": {
          "exportToSVG": "Descargar SVG",
          "exportToPNG": "Descargar PNG",
          "menu": "Menú",
          "selection": "Selección",
          "selectionZoom": "Zoom de selección",
          "zoomIn": "Acercar",
          "zoomOut": "Alejar",
          "pan": "Desplazar",
          "reset": "Restablecer zoom"
        }
      }
    },
    {
      "name": "it",
      "options": {
        "months": ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        "shortMonths": ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
        "days": ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
        "shortDays": ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
        "toolbar": {
          "exportToSVG": "Scarica SVG",
          "exportToPNG": "Scarica PNG",
          "menu": "Menu",
          "selection": "Selezione",
          "selectionZoom": "Zoom selezione",
          "zoomIn": "Ingrandisci",
          "zoomOut": "Riduci",
          "pan": "Panoramica",
          "reset": "Ripristina zoom"
        }
      }
    },
    {
      "name": "pt",
      "options": {
        "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        "days": ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
        "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        "toolbar": {
          "exportToSVG": "Baixar SVG",
          "exportToPNG": "Baixar PNG",
          "menu": "Menu",
          "selection": "Seleção",
          "selectionZoom": "Zoom de seleção",
          "zoomIn": "Aproximar",
          "zoomOut": "Afastar",
          "pan": "Deslocar",
          "reset": "Redefinir zoom"
        }
      }
    },
    {
      "name": "ru",
      "options": {
        "months": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        "shortMonths": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        "shortDays": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        "toolbar": {
          "exportToSVG": "Скачать SVG",
          "exportToPNG": "Скачать PNG",
          "menu": "Меню",
          "selection": "Выбор",
          "selectionZoom": "Масштабирование выбора",
          "zoomIn": "Увеличить",
          "zoomOut": "Уменьшить",
          "pan": "Перемещение",
          "reset": "Сбросить масштаб"
        }
      }
    },
    {
      "name": "de",
      "options": {
        "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        "toolbar": {
          "exportToSVG": "SVG herunterladen",
          "exportToPNG": "PNG herunterladen",
          "menu": "Menü",
          "selection": "Auswahl",
          "selectionZoom": "Auswahlzoom",
          "zoomIn": "Vergrößern",
          "zoomOut": "Verkleinern",
          "pan": "Verschieben",
          "reset": "Zoom zurücksetzen"
        }
      }
    },
    {
      "name": "zh",
      "options": {
        "months": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        "shortMonths": ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
        "days": ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        "shortDays": ["日", "一", "二", "三", "四", "五", "六"],
        "toolbar": {
          "exportToSVG": "下载 SVG",
          "exportToPNG": "下载 PNG",
          "menu": "菜单",
          "selection": "选择",
          "selectionZoom": "选择缩放",
          "zoomIn": "放大",
          "zoomOut": "缩小",
          "pan": "平移",
          "reset": "重置缩放"
        }
      }
    },
    {
      "name": "ja",
      "options": {
        "months": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        "shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        "days": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        "shortDays": ["日", "月", "火", "水", "木", "金", "土"],
        "toolbar": {
          "exportToSVG": "SVGをダウンロード",
          "exportToPNG": "PNGをダウンロード",
          "menu": "メニュー",
          "selection": "選択",
          "selectionZoom": "選択をズーム",
          "zoomIn": "ズームイン",
          "zoomOut": "ズームアウト",
          "pan": "パン",
          "reset": "ズームをリセット"
        }
      }
    },
    {
      "name": "ko",
      "options": {
        "months": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        "shortMonths": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        "days": ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        "shortDays": ["일", "월", "화", "수", "목", "금", "토"],
        "toolbar": {
          "exportToSVG": "SVG 다운로드",
          "exportToPNG": "PNG 다운로드",
          "menu": "메뉴",
          "selection": "선택",
          "selectionZoom": "선택 확대",
          "zoomIn": "확대",
          "zoomOut": "축소",
          "pan": "팬",
          "reset": "줌 초기화"
        }
      }
    },
    {
      "name": "nl",
      "options": {
        "months": ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
        "shortMonths": ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "days": ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
        "shortDays": ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
        "toolbar": {
          "exportToSVG": "Download SVG",
          "exportToPNG": "Download PNG",
          "menu": "Menu",
          "selection": "Selectie",
          "selectionZoom": "Selectie zoom",
          "zoomIn": "Inzoomen",
          "zoomOut": "Uitzoomen",
          "pan": "Pannen",
          "reset": "Zoom resetten"
        }
      }
    }
  ],
  "defaultLocale": "en"
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
