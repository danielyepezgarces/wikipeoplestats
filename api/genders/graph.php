<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include '../../config.php';
include '../../languages.php';

// Iniciar Memcached
$memcache = new Memcached();
$memcache->addServer('localhost', 11211); // Cambia según tu configuración

// Obtener el valor de project
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);  // Escapar para prevenir inyecciones SQL

// Normalizar el valor de project para que coincida con las claves de wikis
$project = str_replace(['.wikipedia.org', '.wikiquote.org', '.wikisource.org', '.wikipedia', '.wikiquote', '.wikisource'], '', $project);

// Depuración: Mostrar el valor de $project
var_dump($project);

// Buscar la wiki correspondiente en el array wikis
$wiki_key = array_search($project, array_column($wikis, 'wiki'));

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

// Depuración: Verificar si se encontró la wiki
var_dump($wiki_key);

// Verificar si encontramos el proyecto en wikis
if ($wiki_key !== false) {
    // Aquí puedes acceder a los datos de la wiki correspondiente
    $wiki = $wikis[$wiki_key];
} else {
    // Si no se encuentra, enviar un error
    echo json_encode(['error' => 'Project not found']);
    exit;
}

// Si no se proporcionan fechas, usar valores predeterminados
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : $wikis[$wiki_key]['creation_date'];
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');

// Depuración: Mostrar las fechas
var_dump($start_date);
var_dump($end_date);

// Generar una tabla de calendario para el rango de fechas especificado
$start_year = (int)date('Y', strtotime($start_date));
$start_month = (int)date('m', strtotime($start_date));
$end_year = (int)date('Y', strtotime($end_date));
$end_month = (int)date('m', strtotime($end_date));

$calendar = [];
for ($year = $start_year; $year <= $end_year; $year++) {
    $start_month_in_year = ($year == $start_year) ? $start_month : 1;
    $end_month_in_year = ($year == $end_year) ? $end_month : 12;
    for ($month = $start_month_in_year; $month <= $end_month_in_year; $month++) {
        $calendar[] = [
            'year' => $year,
            'month' => $month,
        ];
    }
}

// Depuración: Verificar el calendario generado
var_dump($calendar);

// Generar clave de caché única
$cacheKey = "graph_{$wiki['wiki']}_{$start_date}_{$end_date}";

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

// Consulta SQL
$sql = "
    SELECT
        YEAR(a.creation_date) AS year,
        MONTH(a.creation_date) AS month,
        COUNT(*) AS total,
        SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
        SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
        SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders
    FROM articles a
    JOIN project w ON a.site = w.site
    LEFT JOIN people p ON a.wikidata_id = p.wikidata_id
    WHERE a.creation_date >= '$start_date'
        AND a.creation_date <= '$end_date'
    GROUP BY YEAR(a.creation_date), MONTH(a.creation_date)
";

// Depuración: Mostrar la consulta SQL
var_dump($sql);

$result = $conn->query($sql);


$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'year' => (int)$row['year'],
        'month' => (int)$row['month'],
        'total' => (int)$row['total'],
        'totalWomen' => (int)$row['totalWomen'],
        'totalMen' => (int)$row['totalMen'],
        'otherGenders' => (int)$row['otherGenders'],
    ];
}


// Combinar los datos de la tabla de calendario con los datos de la consulta
$combined_data = [];
foreach ($calendar as $date) {
    $match = false;
    foreach ($data as $row) {
        if ($row['year'] == $date['year'] && $row['month'] == $date['month']) {
            $combined_data[] = $row;
            $match = true;
            break;
        }
    }
    if (!$match) {
        $combined_data[] = [
            'year' => $date['year'],
            'month' => $date['month'],
            'total' => 0,
            'totalWomen' => 0,
            'totalMen' => 0,
            'otherGenders' => 0,
        ];
    }
}


// Generar respuesta
$response = [
    'data' => $combined_data,
];

// Almacenar la respuesta en caché
$memcache->set($cacheKey, json_encode($response), $cacheDuration);

// Medir el tiempo de ejecución
$executionTime = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
$response['executionTime'] = round($executionTime * 1000, 2); // En milisegundos

// Depuración: Verificar la respuesta final antes de enviarla
var_dump($response);

echo json_encode($response);

$conn->close();
?>
