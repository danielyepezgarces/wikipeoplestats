<?php
header("Content-Type: application/json");

include '../../config.php';
include '../../languages.php';

// Iniciar Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Medir tiempo de inicio
$startTime = microtime(true);

// Obtener el valor de project
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);  // Escapar para prevenir inyecciones SQL


// Primero, eliminar los sufijos de dominio como '.org', '.com', etc.
$project = preg_replace('/\.(wikipedia|wikiquote|wikisource)\.org$/', '', $project); // Eliminar dominios

// Normalizar el valor de project para que coincida con las claves de wikis
// Verificamos si el proyecto es un wikiquote, wikisource, o wikipedia
if (strpos($project, 'wikiquote') !== false) {
    // Asegurarse de que sea 'wikiquote'
    $project = $project . 'wikiquote';
} elseif (strpos($project, 'wikisource') !== false) {
    // Asegurarse de que sea 'wikisource'
    $project = $project . 'wikisource';
} else {
    // Para otros casos, asumimos que es wikipedia
    if (strpos($project, 'wiki') === false) {
        $project = $project . 'wiki';  // Asegurarse de que sea 'wiki' para wikipedia
    }
}

// Depuración: Mostrar el valor final de 'project' después de la normalización
echo "Normalized project: " . $project . "<br>";

// Buscar la wiki correspondiente en el array wikis
$wiki_key = array_search($project, array_column($wikis, 'wiki'));

// Depuración: Mostrar el contenido de '$wikis'
echo "<pre>";
print_r($wikis);
echo "</pre>";

// Si no se encuentra, intentar variantes posibles
if ($wiki_key === false) {
    $variants = [
        $project,             // Buscar directamente
        $project . 'wiki',    // Ej.: "eswiki", "enwiki"
        $project . 'wikiquote', // Ej.: "enwikiquote"
        $project . 'wikisource', // Ej.: "dewikisource"
    ];

    foreach ($variants as $variant) {
        $wiki_key = array_search($variant, array_column($wikis, 'wiki'));
        if ($wiki_key !== false) {
            break; // Salir si encontramos una coincidencia
        }
    }
}

// Depuración: Verificar si se encontró el proyecto
if ($wiki_key === false) {
    echo json_encode(['error' => 'Project not found']);
    exit;
} else {
    echo "Found wiki key: " . $wiki_key . "<br>";
}



$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Si no se proporcionan fechas, usar valores predeterminados
if (empty($start_date)) {
    $start_date = $wikis[$wiki_key]['creation_date'];
}
if (empty($end_date)) {
    $end_date = date('Y-m-d');
}

// Definir la clave de caché (más limpia, sin redundancia)
$cacheKey = "wikistats_{$wiki['wiki']}_{$start_date}_{$end_date}";

if (isset($_GET['action']) && $_GET['action'] === 'purge') {
    $memcache->delete($cacheKey);
    echo json_encode(['message' => 'Cache purged successfully.']);
    exit;
}

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

$sql .= " AND a.site = '{$wiki['wiki']}'";  // Usar el valor de wiki obtenido

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
