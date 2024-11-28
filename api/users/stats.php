<?php
header("Content-Type: application/json");

include '../../config.php';

// Iniciar Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Obtener los parámetros de la URL
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);
$username = isset($_GET['username']) ? $_GET['username'] : '';
$username = $conn->real_escape_string($username);
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Definir el array de idiomas
$languages = [
    ['code' => 'all', 'name' => 'All Wikipedias', 'flag' => '🌐', 'date_format' => 'l, F j, Y', 'wiki' => 'globalwiki', 'creation_date' => '2001-01-15'],
    ['code' => 'en', 'name' => 'English', 'flag' => '🇬🇧', 'date_format' => 'l, F j, Y', 'wiki' => 'enwiki', 'creation_date' => '2001-01-15'],
    ['code' => 'fr', 'name' => 'Français', 'flag' => '🇫🇷', 'date_format' => 'l j F Y', 'wiki' => 'frwiki', 'creation_date' => '2001-01-15'],
    ['code' => 'es', 'name' => 'Español', 'flag' => '🇪🇸', 'date_format' => 'l, j \d\e F \d\e Y', 'wiki' => 'eswiki', 'creation_date' => '2001-05-20'],
    ['code' => 'de', 'name' => 'Deutsch', 'flag' => '🇩🇪', 'date_format' => 'l, j. F Y', 'wiki' => 'dewiki', 'creation_date' => '2001-03-01'],
    ['code' => 'it', 'name' => 'Italiano', 'flag' => '🇮🇹', 'date_format' => 'l j F Y', 'wiki' => 'itwiki', 'creation_date' => '2001-01-23'],
    ['code' => 'pt', 'name' => 'Português', 'flag' => '🇵🇹', 'date_format' => 'l, j \d\e F \d\e Y', 'wiki' => 'ptwiki', 'creation_date' => '2001-06-30'],
    ['code' => 'nl', 'name' => 'Nederlands', 'flag' => '🇳🇱', 'date_format' => 'l j F Y', 'wiki' => 'nlwiki', 'creation_date' => '2001-04-20'],
    ['code' => 'ru', 'name' => 'Русский', 'flag' => '🇷🇺', 'date_format' => 'l, j F Y', 'wiki' => 'ruwiki', 'creation_date' => '2001-05-01'],
    ['code' => 'ja', 'name' => '日本語', 'flag' => '🇯🇵', 'date_format' => 'Y年n月j日(l)', 'wiki' => 'jawiki', 'creation_date' => '2002-09-30'],
    ['code' => 'zh', 'name' => '中文', 'flag' => '🇨🇳', 'date_format' => 'Y年n月j日 l', 'wiki' => 'zhwiki', 'creation_date' => '2002-07-20'],
];

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

// Generar clave de caché única
$cacheKey = "stats_{$project}_{$username}_{$start_date}_{$end_date}";

// Comprobar si ya tenemos la respuesta en caché
$cachedResponse = $memcache->get($cacheKey);

// Duración del caché en segundos (6 horas)
$cacheDuration = 21600; 

if ($cachedResponse) {
    // Si encontramos el caché, devolver la respuesta
    $response = json_decode($cachedResponse, true);
    
    // Medir el tiempo de ejecución
    $executionTime = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
    $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos
    
    echo json_encode($response);
    exit;
}

// Definir la consulta SQL dependiendo del proyecto, usuario y fechas
if ($language_code === 'all') {
    $sql = "
        SELECT
            COUNT(DISTINCT p.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') THEN 1 ELSE 0 END) AS otherGenders,
            MAX(w.last_updated) AS lastUpdated
        FROM people p
        JOIN articles a ON p.wikidata_id = a.wikidata_id
        JOIN project w ON a.site = w.site
        WHERE a.creation_date >= '$start_date'
            AND a.creation_date <= '$end_date'
            AND a.creator_username = '$username'
    ";
} else {
    $sql = "
        SELECT
            COUNT(DISTINCT p.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') THEN 1 ELSE 0 END) AS otherGenders,
            MAX(w.last_updated) AS lastUpdated
        FROM people p
        JOIN articles a ON p.wikidata_id = a.wikidata_id
        JOIN project w ON a.site = w.site
        WHERE a.site = '{$languages[$language_code]['wiki']}'
            AND a.creation_date >= '$start_date'
            AND a.creation_date <= '$end_date'
            AND a.creator_username = '$username'
    ";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();

    // Verificar si todos los conteos son cero
    if ($data['totalPeople'] == 0 && $data['totalWomen'] == 0 && $data['totalMen'] == 0 && $data['otherGenders'] == 0) {
        echo json_encode(['error' => 'No data found']);
    } else {
        // Generar respuesta
        $response = [
            'totalPeople' => (int)$data['totalPeople'],
            'totalWomen' => (int)$data['totalWomen'],
            'totalMen' => (int)$data['totalMen'],
            'otherGenders' => (int)$data['otherGenders'],
            'lastUpdated' => $data['lastUpdated'] ? $data['lastUpdated'] : null,
        ];

        // Almacenar la respuesta en caché
        $memcache->set($cacheKey, json_encode($response), $cacheDuration);

        // Medir el tiempo de ejecución
        $executionTime = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
        $response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos

        echo json_encode($response);
    }
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>
