<?php
header("Content-Type: application/json");

include '../../config.php'; // Archivo de configuración de la base de datos

// Iniciar conexión a Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Medir tiempo de inicio
$startTime = microtime(true);

// Obtener la acción
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Definir uso de caché
$useCache = true; // Cambia esto a false si no quieres usar caché

// Comprobar si el usuario ha solicitado usar caché
if (isset($_GET['useCache'])) {
    $useCache = filter_var($_GET['useCache'], FILTER_VALIDATE_BOOLEAN);
}

// Cambiar la clave de caché a 'rankingwiki'
$cacheKey = "rankingwiki"; // Nueva clave de caché

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

// Consulta SQL general (sin filtrar por proyecto específico)
$sql = "
    SELECT 
        a.site AS site,
        COUNT(DISTINCT a.wikidata_id) AS totalPeople,
        SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
        SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
        SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,
        COUNT(DISTINCT a.creator_username) AS totalContributions,
        MAX(pr.last_updated) AS lastUpdated,
        pr.code AS siteCode  -- Agregar el campo 'code' de la tabla 'project'
    FROM articles a
    LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
    JOIN project pr ON a.site = pr.site  -- Cambiar alias de 'project' a 'pr'
    GROUP BY a.site
    ORDER BY totalContributions DESC
";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $response = [];
    while ($data = $result->fetch_assoc()) {
        $currentLastUpdated = $data['lastUpdated']; // Obtener el último actualizado

        // Agregar cada sitio al ranking
        $response[] = [
            'site' => $data['site'],
            'totalPeople' => (int)$data['totalPeople'],
            'totalWomen' => (int)$data['totalWomen'],
            'totalMen' => (int)$data['totalMen'],
            'otherGenders' => (int)$data['otherGenders'],
            'totalContributions' => (int)$data['totalContributions'],
            'lastUpdated' => $currentLastUpdated ? $currentLastUpdated : null,
            'siteCode' => $data['siteCode'], // Incluir el campo 'code' en la respuesta
        ];
    }

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