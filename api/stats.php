<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

include '../config.php';

// Obtener el proyecto de la URL
$project = isset($_GET['project']) ? $_GET['project'] : '';
$project = $conn->real_escape_string($project);

// Definir la consulta dependiendo del proyecto
if ($project === 'all') {
    // Para el caso 'all', contamos todas las personas en 'people'
    $sql = "
        SELECT 
            COUNT(DISTINCT p.wikidata_id) AS totalPeople,
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,  -- Incluye sin género
            (SELECT COUNT(DISTINCT creator_username) FROM articles) AS totalContributions,
            (SELECT MAX(last_updated) FROM wikipedia) AS lastUpdated
        FROM people p
    ";
} else {
    $sql = "
        SELECT 
            COUNT(DISTINCT a.wikidata_id) AS totalPeople,  -- Total usando a.wikidata_id
            SUM(CASE WHEN p.gender = 'Q6581072' THEN 1 ELSE 0 END) AS totalWomen,
            SUM(CASE WHEN p.gender = 'Q6581097' THEN 1 ELSE 0 END) AS totalMen,
            SUM(CASE WHEN p.gender NOT IN ('Q6581072', 'Q6581097') OR p.gender IS NULL THEN 1 ELSE 0 END) AS otherGenders,  -- Incluye sin género
            COUNT(DISTINCT a.creator_username) AS totalContributions,
            MAX(w.last_updated) AS lastUpdated
        FROM articles a
        LEFT JOIN people p ON p.wikidata_id = a.wikidata_id
        JOIN wikipedia w ON a.site = w.site
        WHERE a.site = '$project'
    ";
}




$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();

    // Verificar si todos los conteos son cero
    if ($data['totalPeople'] == 0 && $data['totalWomen'] == 0 && $data['totalMen'] == 0 && $data['otherGenders'] == 0 && $data['totalContributions'] == 0) {
        echo json_encode(['error' => 'No data found']);
    } else {
        // Generar respuesta
        $response = [
            'totalPeople' => (int)$data['totalPeople'],
            'totalWomen' => (int)$data['totalWomen'],
            'totalMen' => (int)$data['totalMen'],
            'otherGenders' => (int)$data['otherGenders'],
            'totalContributions' => (int)$data['totalContributions'],
            'lastUpdated' => $data['lastUpdated'] ? $data['lastUpdated'] : null,
        ];

        echo json_encode($response);
    }
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>
