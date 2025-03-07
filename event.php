<?php
error_reporting( -1 );
ini_set( 'display_errors', 1 );

include 'languages.php';
include 'events-list.php'; // Include the events list

$uri = $_SERVER['REQUEST_URI'];
$eventSlug = basename($uri);

// Buscar el evento correspondiente
$currentEvent = null;
foreach ($events as $event) {
    if ($event['slug'] === $eventSlug) {
        $currentEvent = $event;
        break;
    }
}

if (!$currentEvent) {
    header('Location: /events');
    exit;
}

// Obtener parámetros de la URL
$wikiproject = getProject($currentDomain);
$startDate = $_GET['start'] ?? null;
$endDate = $_GET['end'] ?? null;
$wikidomain = getOriginalDomain($currentDomain);

// Construir URL de la API
$apiUrl = "https://api.wikipeoplestats.org/v1/genders/stats/{$wikiproject}";
$startDate = $currentEvent['start_date'] ?? null;
$endDate = $currentEvent['end_date'] ?? null;

if ($startDate) {
    $apiUrl .= "/{$startDate}";
    if ($endDate) {
        $apiUrl .= "/{$endDate}";
    }
}

// Inicializar cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "User-Agent: WikiPeopleStats/1.0"
]);

$response = curl_exec($ch);

// Verificar si hubo un error
if (curl_errno($ch)) {
    die("Error al acceder a la API: " . curl_error($ch));
}

curl_close($ch);

// Decodificar la respuesta JSON
$data = json_decode($response, true);

// Inicializar variables
$totalPeople = 0;
$totalWomen = 0;
$totalMen = 0;
$otherGenders = 0;
$totalContributions = 0;
$lastUpdated = "N/A";
$cachedUntil = "N/A";
$statsCredits = "";

// Verificar si hay datos válidos en la respuesta
if (isset($data) && is_array($data) && !isset($data['error'])) {
    $totalPeople = (int)($data['totalPeople'] ?? 0);
    $totalWomen = (int)($data['totalWomen'] ?? 0);
    $totalMen = (int)($data['totalMen'] ?? 0);
    $otherGenders = (int)($data['otherGenders'] ?? 0);
    $totalContributions = (int)($data['totalContributions'] ?? 0);
    $lastUpdated = htmlspecialchars($data['lastUpdated'] ?? "N/A");
    $cachedUntil = htmlspecialchars($data['cachedUntil'] ?? "N/A");

    // Verificar si todas las estadísticas son 0
    if ($totalPeople === 0 && $totalWomen === 0 && $totalMen === 0 && $otherGenders === 0 && $totalContributions === 0) {
        $statsCredits = __('coming_soon_tracking_wiki');
    } else {
        $statsCredits = sprintf(__('homepage_stats_credits'), $wikidomain);
    }
} else {
    $statsCredits = __('coming_soon_tracking_wiki');
}

// Mapear eventos
$events = [];
if (isset($data['events']) && is_array($data['events'])) {
    foreach ($data['events'] as $event) {
        $events[] = [
            'name' => $event['name'] ?? 'Evento sin nombre',
            'start_date' => $event['start_date'] ?? $startDate,
            'end_date' => $event['end_date'] ?? $endDate,
            'location' => $event['location'] ?? 'Ubicación no especificada',
            'description' => $event['description'] ?? 'Sin descripción',
            'url' => $event['url'] ?? '#'
        ];
    }
}

// Calcular los ratios
$ratioWomen = $totalPeople > 0 ? round(($totalWomen / $totalPeople) * 100, 2) : 0;
$ratioMen = $totalPeople > 0 ? round(($totalMen / $totalPeople) * 100, 2) : 0;
$ratioOtherGenders = $totalPeople > 0 ? round(($otherGenders / $totalPeople) * 100, 2) : 0;

$projects = ['Wikipedia', 'Wikiquote', 'Wikisource'];
$currentProject = $projects[0]; // Comienza con el primer proyecto

// Obtener el nombre traducido del proyecto
$currentProjectTranslated = __($currentProject);

// Obtener el mensaje principal
$message = sprintf(__('main_home_content'), $currentProjectTranslated);

$currentDateTime = new DateTime(); // Fecha y hora actual del servidor
$currentDate = $currentDateTime->format("Y-m-d"); // Extraer solo la fecha

// Convertir fechas a DateTime con hora mínima y máxima
$startDateTime = new DateTime($startDate . " 00:00:00");
$endDateTime = new DateTime($endDate . " 23:59:59");

$eventStatus = '';
$countdownDate = null;

if ($currentDateTime < $startDateTime) {
    $eventStatus = 'Este evento no ha comenzado';
    $countdownDate = $startDateTime->format("Y-m-d\T00:00:00\Z"); // Formato UTC
} elseif ($currentDateTime >= $startDateTime && $currentDateTime <= $endDateTime) {
    $eventStatus = 'Este evento finaliza en:';
    $countdownDate = $endDateTime->format("Y-m-d\T23:59:59\Z"); // Formato UTC
} else {
    $eventStatus = 'Este evento ya finalizó';
}

?>

<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
    <head>
    <meta charset="UTF-8">
    <title><?php echo __('sitename'); ?></title>
    <meta name="description" content="<?php echo __('site_description'); ?>">
    <meta name="keywords" content="<?php echo __('site_keywords'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='https://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/css/fonts/styles.css' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://<?php echo $_SERVER['HTTP_HOST']; ?>/libs/font-awesome/all.min.css">
    <script src="https://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/js/tailwind.js"></script>
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
    <!-- Imagen del evento -->
    <?php if (!empty($currentEvent['event_image'])) : ?>
        <div class="relative aspect-[16/3] mb-6 rounded-lg overflow-hidden">
            <img src="<?php echo htmlspecialchars($currentEvent['event_image']) ?>" 
                 alt="<?php echo htmlspecialchars($currentEvent['name']) ?>" 
                 class="w-full h-full object-cover"
                 loading="lazy">
        </div>
    <?php endif; ?>

    <h1 class="text-2xl text-center font-bold mb-6 text-gray-900 dark:text-gray-100">
        <?php echo htmlspecialchars($currentEvent['name']); ?>
    </h1>
    
    <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        <!-- Fechas -->
        <div class="flex-1 flex items-center space-x-4 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            <i class="fas fa-calendar-alt text-xl text-blue-500"></i>
            <div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Fechas</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                    <?php echo date('d M Y', strtotime($currentEvent['start_date'])) ?>
                    <?php if ($currentEvent['start_date'] !== $currentEvent['end_date']) : ?>
                        - <?php echo date('d M Y', strtotime($currentEvent['end_date'])) ?>
                    <?php endif; ?>
                </p>
            </div>
        </div>
        
        <!-- Ubicación -->
        <div class="flex-1 flex items-center space-x-4 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            <i class="fas fa-map-marker-alt text-xl text-green-500"></i>
            <div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Ubicación</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                    <?php echo htmlspecialchars($currentEvent['location']) ?>
                </p>
            </div>
        </div>
        
        <!-- Descripción -->
        <div class="flex-1 flex items-start space-x-4 p-4">
            <i class="fas fa-info-circle text-xl text-purple-500 mt-1"></i>
            <div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Descripción</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                    <?php echo htmlspecialchars($currentEvent['description']) ?>
                </p>
            </div>
        </div>
    </div>
    
    <div class="text-center mt-6">
        <a href="<?php echo htmlspecialchars($currentEvent['url']) ?>" 
           target="_blank"
           class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <i class="fas fa-external-link-alt mr-2"></i>
            Sitio oficial del evento
        </a>
    </div>
</div>
<div class="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-users text-3xl text-blue-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_people'); ?></h3>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300"><?php echo str_replace(',', ' ', number_format($totalPeople)); ?></p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-female text-3xl text-pink-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_women'); ?></h3>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300"><?php echo str_replace(',', ' ', number_format($totalWomen)); ?></p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($totalWomen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-male text-3xl text-blue-700 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_men'); ?></h3>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300"><?php echo str_replace(',', ' ', number_format($totalMen)); ?></p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($totalMen / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-genderless text-3xl text-purple-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('other_genders'); ?></h3>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300"><?php echo str_replace(',', ' ', number_format($otherGenders)); ?></p>
        <p class="mt-2 text-gray-500 dark:text-gray-400"><?php echo number_format(($totalPeople > 0) ? ($otherGenders / $totalPeople) * 100 : 0, 2); ?>%</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <i class="fas fa-concierge-bell text-3xl text-green-500 mb-2"></i>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"><?php echo __('total_editors'); ?></h3>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300"><?php echo str_replace(',', ' ', number_format($totalContributions)); ?></p>
    </div>
</div>

<div class="mt-6 text-center bg-gray-200 dark:bg-gray-700 p-4 rounded">
    <p id="event-status" class="text-gray-900 dark:text-gray-100 text-lg font-semibold">
        <?php echo $eventStatus; ?>
    </p>

    <?php if ($countdownDate) : ?>
        <div id="countdown" class="grid grid-cols-4 gap-4 mt-4">
            <div class="text-center">
                <span class="text-3xl font-bold" id="days">00</span>
                <span class="text-sm">Días</span>
            </div>
            <div class="text-center">
                <span class="text-3xl font-bold" id="hours">00</span>
                <span class="text-sm">Horas</span>
            </div>
            <div class="text-center">
                <span class="text-3xl font-bold" id="minutes">00</span>
                <span class="text-sm">Minutos</span>
            </div>
            <div class="text-center">
                <span class="text-3xl font-bold" id="seconds">00</span>
                <span class="text-sm">Segundos</span>
            </div>
        </div>
    <?php endif; ?>
</div>

<div class="mt-8 text-center">
<p class="text-lg font-semibold text-gray-900 dark:text-gray-100" id="cacheMessage">
        <?php echo sprintf(__('cached_version_message'), "<span id='cachecountdown'></span>"); ?>
    </p>
    <div class="mt-4 inline-flex items-center justify-center">
        <button
            id="purge-cache"
            onclick="purgeCache()"
            class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition flex items-center"
        >
            <span class="mr-2"><?php echo __('purge_cache_button'); ?></span>
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
</div>


<?php include 'supporters.php'; ?>
<?php include 'footer.php'; ?>


</main>

<!-- Toast Container -->
<div id="toast" class="fixed bottom-4 right-4 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg hidden dark:bg-green-600">
    <span id="toast-message"></span>
    <button onclick="hideToast()" class="ml-2 text-white font-bold">&times;</button>
</div>

    <!-- Language Selector Popup -->
    <?php include 'languageselector.php'; ?>

    <script src="https://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/js/main.js?v=2"></script>
    <script src="https://<?php echo $_SERVER['HTTP_HOST']; ?>/libs/jquery/main.min.js"></script>

<script>
function showToast(message, bgColor = 'bg-green-500') {
    const toast = document.getElementById('toast');
    const messageElement = document.getElementById('toast-message');
    messageElement.innerText = message;
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white text-sm px-4 py-2 rounded shadow-lg dark:bg-green-600`;
    toast.classList.remove('hidden');

    // Oculta el toast después de 3 segundos
    setTimeout(() => {
        hideToast();
    }, 6000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
}

function purgeCache() {
    fetch("https://api.wikipeoplestats.org/v1/stats/<?php echo $wikiproject; ?>?action=purge", {
        method: 'GET',
        headers: {
            "User-Agent": "WikiStatsPeople/1.0"
        }
    })
    .then(response => response.json())
    .then(data => {
        // Muestra el toast de éxito
        showToast("<?php echo __('cache_purged_successfully'); ?>");

        // Recarga la página después de 2 segundos
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        showToast("<?php echo __('cache_purge_failed'); ?>", 'bg-red-500'); // Mensaje de error
    });
}
</script>
<script>
        // Establece la fecha objetivo desde la variable PHP
        const targetDate = new Date("<?php echo $cachedUntil; ?>").getTime();

        // Traducciones
        const hoursLabel = "<?php echo __('hours'); ?>";
        const minutesLabel = "<?php echo __('minutes'); ?>";
        const secondsLabel = "<?php echo __('seconds'); ?>";
        const cacheUpdateMessage = "<?php echo __('cache_update_message'); ?>";

        // Actualiza el conteo regresivo cada segundo
        const countdownFunction = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            // Calcula horas, minutos y segundos
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Muestra el resultado en el elemento HTML con id cachecountdown
            document.getElementById("cachecountdown").innerHTML = `${hours} ${hoursLabel}, ${minutes} ${minutesLabel}, ${seconds} ${secondsLabel}`;

            // Si la cuenta regresiva termina
            if (distance < 0) {
                clearInterval(countdownFunction);
                document.getElementById("cacheMessage").innerHTML = cacheUpdateMessage;
            }
        }, 1000);
    </script>
    <script>
    const projectNames = [
        "<?php echo __('project_wikidata'); ?>",
        "<?php echo __('project_wikipedia'); ?>",
        "<?php echo __('project_wikiquote'); ?>",
        "<?php echo __('project_wikisource'); ?>"
    ];

    let currentIndex = 0;
    const projectTextElement = document.getElementById("wikimediaprojects");

    // Función para actualizar el contenido cada 3 segundos
    function updateProjectText() {
        const currentProject = projectNames[currentIndex];
        const newText = "<?php echo __('main_home_content'); ?>".replace('%s', currentProject);
        projectTextElement.innerHTML = newText;

        // Cambiar al siguiente proyecto
        currentIndex = (currentIndex + 1) % projectNames.length;
    }

    // Actualizar el texto cada 3 segundos
    setInterval(updateProjectText, 1000);

    // Llamada inicial para mostrar el primer texto
    updateProjectText();
</script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
    let countdownDateStr = "<?php echo $countdownDate; ?>"; 
    let countdownEl = document.getElementById("countdown");
    let statusEl = document.getElementById("event-status");

    if (!countdownDateStr) {
        if (statusEl) statusEl.innerText = "Este evento ya finalizó.";
        if (countdownEl) countdownEl.style.display = "none";
        return;
    }

    let countdownDate = new Date(countdownDateStr);
    let countdownTimestamp = countdownDate.getTime();

    function updateCountdown() {
        let now = new Date().getTime();
        let timeLeft = countdownTimestamp - now;

        if (timeLeft <= 0) {
            if (statusEl) statusEl.innerText = "Este evento ya finalizó.";
            if (countdownEl) countdownEl.style.display = "none";
            return;
        }

        let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Verificar que los elementos existen antes de modificar su contenido
        document.getElementById("days")?.innerText = days.toString().padStart(2, '0');
        document.getElementById("hours")?.innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes")?.innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds")?.innerText = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
});

</script>
</body>
</html>