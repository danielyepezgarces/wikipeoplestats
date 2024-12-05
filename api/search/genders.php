<?php
header('Content-Type: application/json; charset=utf-8');

include '../../languages.php';

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
