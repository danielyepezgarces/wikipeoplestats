<?php
header("Content-Type: application/json");

include '../../config.php';
include '../../languages.php';

// Iniciar Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Medir tiempo de inicio
$startTime = microtime(true);

// Obtener los parámetros de la URL
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Buscar el código de idioma correspondiente al proyecto
$language_code = array_search($project, array_column($languages, 'wiki'));

// Si no se encuentra el código de idioma, buscar por el formato "es.wikipedia"
if ($language_code === false) {
    $language_code = array_search($project . 'wiki', array_column($languages, 'wiki'));
}

// Si no se encuentra el código de idioma, buscar por el formato "es.wikipedia.org"
if ($language_code === false) {
    $language_code = array_search(str_replace('.wikipedia.org', 'wiki', $project), array_column($languages, 'wiki'));
}

// Si no se encuentra el código de idioma, devolver un error
if ($language_code === false) {
    echo json_encode(['error' => 'Invalid project']);
    exit;
}

// Si no se proporcionan las fechas de inicio y fin, usar la fecha de creación de la wiki seleccionada y la fecha actual
if (empty($start_date)) {
    $start_date = $languages[$language_code]['creation_date'];
}
if (empty($end_date)) {
    $end_date = date('Y-m-d');
}

// Definir la clave de caché (más limpia, sin redundancia)
$cacheKey = "wikistats_{$project}_{$start_date}_{$end_date}";

// Comprobar si el caché existe
$cachedResponse = $memcache->get($cacheKey);

// Duración del caché en segundos (6 horas)
$cacheDuration = 21600; 

// Si la respuesta está en caché, devolverla
if ($cachedResponse) {
    $response = json_decode($cachedResponse, true);
    
    // Medir el tiempo total de ejecución
    $executionTime = microtime(true) - $startTime;
    $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos
    
    echo json_encode($response);
    exit;
}

// Definir la consulta SQL
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
    WHERE a.creation_date >= '$start_date'
        AND a.creation_date <= '$end_date'
";

// Filtro por idioma del proyecto
if ($language_code !== 'all') {
    $sql .= " AND a.site = '{$languages[$language_code]['wiki']}'";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();

    // Verificar si todos los conteos son cero
    if ($data['totalPeople'] == 0 && $data['totalWomen'] == 0 && $data['totalMen'] == 0 && $data['otherGenders'] == 0) {
        echo json_encode(['error' => 'No data found']);
    } else {
        // Generar la respuesta
        $response = [
            'totalPeople' => (int)$data['totalPeople'],
            'totalWomen' => (int)$data['totalWomen'],
            'totalMen' => (int)$data['totalMen'],
            'otherGenders' => (int)$data['otherGenders'],
            'lastUpdated' => $data['lastUpdated'] ? $data['lastUpdated'] : null,
        ];

        // Almacenar la respuesta en caché
        $memcache->set($cacheKey, json_encode($response), $cacheDuration);

        // Medir el tiempo total de ejecución
        $executionTime = microtime(true) - $startTime;
        $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos

        echo json_encode($response);
    }
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>
