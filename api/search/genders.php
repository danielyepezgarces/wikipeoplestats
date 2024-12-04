<?php
header('Content-Type: application/json; charset=utf-8');

// Datos de ejemplo
$wikis = [
    ['code' => 'aa', 'wiki' => 'aawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ab', 'wiki' => 'abwiki', 'creation_date' => '2001-12-20'],
    ['code' => 'ace', 'wiki' => 'acewiki', 'creation_date' => '2004-03-29'],
    ['code' => 'ady', 'wiki' => 'adywiki', 'creation_date' => '2004-05-28'],
    ['code' => 'af', 'wiki' => 'afwiki', 'creation_date' => '2001-10-16'],
    // Más elementos...
];

// Leer el parámetro de búsqueda
$query = isset($_GET['query']) ? strtolower($_GET['query']) : '';

if ($query) {
    // Filtrar los resultados según el término de búsqueda
    $filtered = array_filter($wikis, function ($wiki) use ($query) {
        return str_contains(strtolower($wiki['wiki']), $query);
    });
} else {
    // Devuelve todo si no hay filtro (opcional, dependiendo del caso)
    $filtered = $wikis;
}

// Devuelve los datos en formato JSON
echo json_encode(array_values($filtered), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
