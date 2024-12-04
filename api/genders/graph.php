<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include '../../config.php';
include '../../languages.php';

$memcache = new Memcached();
$memcache->addServer('localhost', 11211);

$cacheDuration = 3600; // Duración del caché en segundos
$dailyThreshold = 90; // Umbral en días para datos diarios

// Obtener parámetros de entrada
$start_date = $_GET['start_date'] ?? null;
$end_date = $_GET['end_date'] ?? null;
$action = $_GET['action'] ?? null;
$wiki = ['wiki' => $_GET['wiki'] ?? null];

// Validación básica
if (!$start_date || !$end_date || !$wiki['wiki']) {
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

// Cálculo del rango de fechas
$startDateTime = new DateTime($start_date);
$endDateTime = new DateTime($end_date);
$dateDiff = $startDateTime->diff($endDateTime)->days;

// Clave de caché única
$cacheKey = "wikistats_{$wiki['wiki']}_{$start_date}_{$end_date}";

// Acción de purga del caché
if ($action === 'purge') {
    $memcache->delete($cacheKey);
    echo json_encode(['message' => 'Cache purged successfully.']);
    exit;
}

// Comprobar si hay datos en caché
$cachedResponse = $memcache->get($cacheKey);
if ($cachedResponse) {
    $response = json_decode($cachedResponse, true);
    $executionTime = microtime(true) - $startTime;
    $response['executionTime'] = round($executionTime * 1000, 2);
    echo json_encode($response);
    exit;
}

// Construir la consulta SQL dinámicamente
if ($dateDiff <= $dailyThreshold) {
    // Consulta para datos diarios
    $sql = "
        SELECT
            YEAR(a.creation_date) AS year,
            MONTH(a.creation_date) AS month,
            DAY(a.creation_date) AS day,
            COUNT(DISTINCT a.wikidata_id) AS total,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders
        FROM articles a
        LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
        JOIN project w ON a.site = w.site
        WHERE a.creation_date >= '$start_date'
          AND a.creation_date <= '$end_date'
          AND a.site = '{$wiki['wiki']}'
        GROUP BY YEAR(a.creation_date), MONTH(a.creation_date), DAY(a.creation_date)
        ORDER BY YEAR(a.creation_date), MONTH(a.creation_date), DAY(a.creation_date)
    ";
} else {
    // Consulta para datos mensuales
    $sql = "
        SELECT
            YEAR(a.creation_date) AS year,
            MONTH(a.creation_date) AS month,
            NULL AS day,
            COUNT(DISTINCT a.wikidata_id) AS total,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders
        FROM articles a
        LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
        JOIN project w ON a.site = w.site
        WHERE a.creation_date >= '$start_date'
          AND a.creation_date <= '$end_date'
          AND a.site = '{$wiki['wiki']}'
        GROUP BY YEAR(a.creation_date), MONTH(a.creation_date)
        ORDER BY YEAR(a.creation_date), MONTH(a.creation_date)
    ";
}

$result = $conn->query($sql);

// Procesar resultados
if ($result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'year' => (int)$row['year'],
            'month' => (int)$row['month'],
            'day' => $row['day'] !== null ? (int)$row['day'] : null,
            'total' => (int)$row['total'],
            'totalWomen' => (int)$row['totalWomen'],
            'totalMen' => (int)$row['totalMen'],
            'otherGenders' => (int)$row['otherGenders'],
        ];
    }

    $response = ['data' => $data];

    // Guardar en caché
    $memcache->set($cacheKey, json_encode($response), $cacheDuration);

    // Medir tiempo de ejecución
    $executionTime = microtime(true) - $startTime;
    $response['executionTime'] = round($executionTime * 1000, 2);

    echo json_encode($response);
} else {
    echo json_encode(['error' => 'No data found']);
}

// Cerrar la conexión a la base de datos
$conn->close();
?>
