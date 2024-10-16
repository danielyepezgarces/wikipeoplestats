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

// Definir la consulta dependiendo del proyecto y las fechas
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
    JOIN wikipedia w ON a.site = w.site
    WHERE a.creation_date >= '$start_date'
        AND a.creation_date <= '$end_date'
";

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
        // Generar respuesta
        $response = [
            'totalPeople' => (int)$data['totalPeople'],
            'totalWomen' => (int)$data['totalWomen'],
            'totalMen' => (int)$data['totalMen'],
            'otherGenders' => (int)$data['otherGenders'],
            'lastUpdated' => $data['lastUpdated'] ? $data['lastUpdated'] : null,
        ];

        echo json_encode($response);
    }
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>
