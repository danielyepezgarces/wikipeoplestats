<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include '../config.php';

// Iniciar conexión a Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Medir tiempo de inicio
$startTime = microtime(true);

// Obtener el proyecto de la URL y la acción
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Definir uso de caché
$useCache = true; // Cambia esto a false si no quieres usar caché

// Comprobar si el usuario ha solicitado usar caché
if (isset($_GET['useCache'])) {
    $useCache = filter_var($_GET['useCache'], FILTER_VALIDATE_BOOLEAN);
}

// Generar la clave de caché única
$cacheKey = "api_response_" . md5("api_stats_" . $project);

// Purgar caché si se solicita
if ($action === 'purge') {
    $memcache->delete($cacheKey);
    echo json_encode(['message' => 'Cache purged successfully.']);
    exit;
}

// Comprobar si hay datos en caché solo si se permite
$cachedResponse = $useCache ? $memcache->get($cacheKey) : false;

$currentLastUpdated = null;
$cacheDuration = 21600; // 6 horas en segundos

if ($cachedResponse) {
    // Si hay respuesta en caché, devolverla
    $response = json_decode($cachedResponse, true);
    // Medir el tiempo total de ejecución
    $executionTime = microtime(true) - $startTime;
    $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos
    echo json_encode($response);
    exit;
}

// Definir la consulta SQL dependiendo del proyecto
if ($project === 'all') {
    // Consulta SQL para 'all'
    $sql = "
        SELECT 
            COUNT(DISTINCT p.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,
            (SELECT COUNT(DISTINCT creator_username) FROM articles) AS totalContributions,
            (SELECT MAX(last_updated) FROM project) AS lastUpdated
        FROM people p
    ";
} else {
    // Consulta SQL para un proyecto específico
    $sql = "
        SELECT 
            COUNT(DISTINCT a.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,
            COUNT(DISTINCT a.creator_username) AS totalContributions,
            MAX(w.last_updated) AS lastUpdated
        FROM articles a
        LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
        JOIN project w ON a.site = w.site
        WHERE a.site = '$project'
    ";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    $currentLastUpdated = $data['lastUpdated']; // Obtener el último actualizado

    // Generar la respuesta
    $response = [
        'totalPeople' => (int)$data['totalPeople'],
        'totalWomen' => (int)$data['totalWomen'],
        'totalMen' => (int)$data['totalMen'],
        'otherGenders' => (int)$data['otherGenders'],
        'totalContributions' => (int)$data['totalContributions'],
        'lastUpdated' => $currentLastUpdated ? $currentLastUpdated : null,
        'cachedUntil' => gmdate('c', time() + $cacheDuration), // Expiración del caché en UTC
    ];

    // Almacenar en caché solo si se permite y no hay respuesta en caché
    if ($useCache && !$cachedResponse) {
        $memcache->set($cacheKey, json_encode($response), $cacheDuration);
    }

    // Medir el tiempo total de ejecución
    $executionTime = microtime(true) - $startTime;
    $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos

    echo json_encode($response);
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>
