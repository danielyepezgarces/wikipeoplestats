<?php
header("Content-Type: application/json");

include '../../config.php';

// Obtener los parámetros de la URL
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);
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

if ($language_code === false) {
    $language_code = array_search($project . 'wiki', array_column($languages, 'wiki'));
}

if ($language_code === false) {
    $language_code = array_search(str_replace('.wikipedia.org', 'wiki', $project), array_column($languages, 'wiki'));
}

if ($language_code === false) {
    echo json_encode(['error' => 'Invalid project']);
    exit;
}

// Imprimir el código de idioma
echo "Language Code: $language_code\n";

// Si no se proporcionan las fechas de inicio y fin, usar la fecha de creación de la wiki seleccionada y la fecha actual
if (empty($start_date)) {
    $start_date = $languages[$language_code]['creation_date'];
}
if (empty($end_date)) {
    $end_date = date('Y-m-d');
}

// Imprimir fechas
echo "Start Date: $start_date\n";
echo "End Date: $end_date\n";

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

// Imprimir el calendario
var_dump($calendar);

// Definir la consulta dependiendo del proyecto y las fechas
if ($language_code === 'all') {
    $sql = "
        SELECT
            YEAR(a.creation_date) AS year,
            MONTH(a.creation_date) AS month,
            COUNT(*) AS total,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') THEN 1 ELSE 0 END) AS otherGenders
        FROM articles a
        JOIN wikipedia w ON a.site = w.site
        LEFT JOIN people p ON a.wikidata_id = p.wikidata_id
        WHERE a.creation_date >= '$start_date'
            AND a.creation_date <= '$end_date'
        GROUP BY YEAR(a.creation_date), MONTH(a.creation_date)
    ";
} else {
    $sql = "
        SELECT
            YEAR(a.creation_date) AS year,
            MONTH(a.creation_date) AS month,
            COUNT(*) AS total,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') THEN 1 ELSE 0 END) AS otherGenders
        FROM articles a
        JOIN wikipedia w ON a.site = w.site
        LEFT JOIN people p ON a.wikidata_id = p.wikidata_id
        WHERE a.site = '{$languages[$language_code]['wiki']}'
            AND a.creation_date >= '$start_date'
            AND a.creation_date <= '$end_date'
        GROUP BY YEAR(a.creation_date), MONTH(a.creation_date)
    ";
}

// Imprimir la consulta SQL
echo "SQL Query: $sql\n";

$result = $conn->query($sql);
if (!$result) {
    echo json_encode(['error' => $conn->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    // Imprimir cada fila obtenida
    var_dump($row);
    $data[] = [
        'year' => (int)$row['year'],
        'month' => (int)$row['month'],
        'total' => (int)$row['total'],
        'totalWomen' => (int)$row['totalWomen'],
        'totalMen' => (int)$row['totalMen'],
        'otherGenders' => (int)$row['otherGenders'],
    ];
}

// Imprimir los datos obtenidos
var_dump($data);

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

// Imprimir la respuesta final
var_dump($response);

echo json_encode($response);

$conn->close();
?>
