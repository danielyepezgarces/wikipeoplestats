<?php
header('Content-Type: application/json; charset=utf-8');

include '../../languages.php';

// Leer el parámetro de búsqueda
$query = isset($_GET['query']) ? strtolower(trim($_GET['query'])) : '';

if ($query) {
    // Normalizar la consulta
    $normalizedQuery = str_replace(['.', ' '], '', $query); // Eliminar puntos y espacios
    $normalizedQuery = preg_replace('/\.(org|com)$/', '', $normalizedQuery); // Eliminar dominios finales

    // Identificar el proyecto específico si corresponde
    $project = null;
    if (str_contains($query, 'wikipedia')) {
        $project = 'wiki';
    } elseif (str_contains($query, 'wikisource')) {
        $project = 'wikisource';
    } elseif (str_contains($query, 'wikiquote')) {
        $project = 'wikiquote';
    }

    // Filtrar resultados según proyecto
    $filtered = array_filter($wikis, function ($wiki) use ($normalizedQuery, $project) {
        $matchesCode = str_starts_with($wiki['wiki'], $normalizedQuery); // Coincidencia por código
        $matchesProject = $project ? str_contains($wiki['wiki'], $project) : true; // Coincidencia por proyecto
        return $matchesCode && $matchesProject;
    });

    // Manejo específico para dominios como 'es.wikisource.org'
    if (str_ends_with($query, '.org')) {
        $filtered = array_filter($filtered, function ($wiki) use ($project) {
            return str_contains($wiki['wiki'], $project); // Solo devolver el proyecto específico
        });
    }
} else {
    $filtered = $wikis; // Devuelve todo si no hay filtro (opcional)
}

// Devuelve los datos en formato JSON
echo json_encode(array_values($filtered), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
