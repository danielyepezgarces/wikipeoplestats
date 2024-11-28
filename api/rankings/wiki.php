<?php
header("Content-Type: application/json");

// Habilitar reporte de errores para el desarrollo
ini_set('display_errors', 1);  // Mostrar errores en la pantalla
error_reporting(E_ALL);         // Reportar todos los errores

include '../../config.php'; // Archivo de configuración de la base de datos

// Iniciar conexión a Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Medir tiempo de inicio
$startTime = microtime(true);

// Obtener la acción, el filtro de tiempo y el filtro de proyecto
$action = isset($_GET['action']) ? $_GET['action'] : '';
$timeFrame = isset($_GET['interval']) ? $_GET['interval'] : 'alltime'; // Valor por defecto es 'alltime'
$projectGroup = isset($_GET['group']) ? $_GET['group'] : ''; // Filtro por proyecto

// Definir uso de caché
$useCache = true; // Cambia esto a false si no quieres usar caché

// Comprobar si el usuario ha solicitado usar caché
if (isset($_GET['useCache'])) {
    $useCache = filter_var($_GET['useCache'], FILTER_VALIDATE_BOOLEAN);
}

// Cambiar la clave de caché a 'rankingwiki' con filtros
$cacheKey = "rankingwiki_" . $timeFrame . "_" . $projectGroup; // Nueva clave de caché con filtros de tiempo y proyecto

// Purgar caché si se solicita
if ($action === 'purge') {
    $memcache->delete($cacheKey);
    echo json_encode(['message' => 'Cache purged successfully.']);
    exit;
}

// Comprobar si hay datos en caché solo si se permite
$cachedData = $useCache ? $memcache->get($cacheKey) : false;

$currentLastUpdated = null;
$cacheDuration = 21600; // 6 horas en segundos

if ($cachedData) {
    // Si hay respuesta en caché, decodificar los datos almacenados
    $data = json_decode($cachedData, true);
} else {
    // Filtrar según el marco de tiempo
    $timeCondition = "";
    $currentDate = date('Y-m-d H:i:s'); // Fecha actual

    switch ($timeFrame) {
        case '7d':
            $timeCondition = "AND a.creation_date >= DATE_SUB('$currentDate', INTERVAL 7 DAY)";
            break;
        case '1m':
            $timeCondition = "AND a.creation_date >= DATE_SUB('$currentDate', INTERVAL 1 MONTH)";
            break;
        case '3m':
            $timeCondition = "AND a.creation_date >= DATE_SUB('$currentDate', INTERVAL 3 MONTH)";
            break;
        case '6m':
            $timeCondition = "AND a.creation_date >= DATE_SUB('$currentDate', INTERVAL 6 MONTH)";
            break;
        case '1y':
            $timeCondition = "AND a.creation_date >= DATE_SUB('$currentDate', INTERVAL 1 YEAR)";
            break;
        case 'alltime':
        default:
            // No filtro de tiempo para todo el tiempo
            $timeCondition = "";
            break;
    }

    // Filtrar por el grupo del proyecto (si se especifica)
    $projectCondition = "";
    if ($projectGroup) {
        $projectCondition = "AND pr.group = '" . $conn->real_escape_string($projectGroup) . "'"; // Evitar inyecciones SQL
    }

    // Consulta SQL general (con filtro de tiempo y grupo de proyecto)
    $sql = "
        SELECT 
            a.site AS site,
            COUNT(DISTINCT a.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,
            COUNT(DISTINCT a.creator_username) AS totalContributions,
            MAX(a.creation_date) AS lastUpdated, -- Ahora la fecha de creación del artículo
            pr.group AS siteCode  -- Agregar el campo 'code' de la tabla 'project'
        FROM articles a
        LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
        JOIN project pr ON a.site = pr.site  -- Cambiar alias de 'project' a 'pr'
        WHERE 1=1
        $timeCondition
        $projectCondition
        GROUP BY a.site
        ORDER BY totalContributions DESC
    ";

    $result = $conn->query($sql);

    $data = []; // Array de datos
    if ($result->num_rows > 0) {
        while ($dataRow = $result->fetch_assoc()) {
            $currentLastUpdated = $dataRow['lastUpdated']; // Obtener el último creado

            // Agregar cada sitio al array de datos
            $data[] = [
                'site' => $dataRow['site'],
                'totalPeople' => (int)$dataRow['totalPeople'],
                'totalWomen' => (int)$dataRow['totalWomen'],
                'totalMen' => (int)$dataRow['totalMen'],
                'otherGenders' => (int)$dataRow['otherGenders'],
                'totalContributions' => (int)$dataRow['totalContributions'],
                'lastUpdated' => $currentLastUpdated ? $currentLastUpdated : null,
                'siteCode' => $dataRow['siteCode'], // Incluir el campo 'code' en la respuesta
            ];
        }

        // Almacenar los datos en caché (sin tiempo de ejecución)
        if ($useCache) {
            $memcache->set($cacheKey, json_encode($data), $cacheDuration);
        }
    } else {
        $data = ['error' => 'No data found'];
    }
}

// Medir el tiempo total de ejecución
$executionTime = microtime(true) - $startTime;
$executionTime = round($executionTime * 1000, 2); // En milisegundos

// Crear la respuesta final con los datos y el tiempo de ejecución
$response = [
    'data' => $data,
    'executionTime' => $executionTime // Tiempo de ejecución calculado dinámicamente
];

// Imprimir la respuesta final
echo json_encode($response);

$conn->close();
?>
