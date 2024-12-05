<?php
header('Content-Type: application/json; charset=utf-8');

include '../../languages.php';

// Asociar prefijos con dominios
$domains = [
    'wiki' => 'wikipedia.org',
    'wikiquote' => 'wikiquote.org',
    'wikisource' => 'wikisource.org',
];

// Leer el parámetro de entrada
$query = isset($_GET['dbname']) ? strtolower(trim($_GET['dbname'])) : '';

if ($query) {
    // Buscar en la lista de wikis
    $result = array_filter($wikis, function ($wiki) use ($query) {
        return $wiki['wiki'] === $query;
    });

    if (!empty($result)) {
        $result = array_values($result)[0]; // Primer resultado
        $dbname = $result['wiki'];

        // Detectar dominio del dbname
        foreach ($domains as $prefix => $domain) {
            if (str_contains($dbname, $prefix)) {
                $result['domain'] = "{$result['code']}.$domain";
                break;
            }
        }
    } else {
        $result = ['error' => 'Database name not found.'];
    }
} else {
    $result = ['error' => 'No dbname provided.'];
}

// Devolver JSON
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);