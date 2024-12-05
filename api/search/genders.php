<?php
header('Content-Type: application/json; charset=utf-8');

include '../../languages.php';

// Leer el parámetro de búsqueda
$query = isset($_GET['query']) ? strtolower(trim($_GET['query'])) : '';

if ($query) {
    // Normalizar la consulta para tratar diferentes formatos
    $normalizedQuery = str_replace(['.', ' '], '', $query); // Eliminar puntos y espacios
    $normalizedQuery = preg_replace('/wikipedia|wikiquote|wikisource|\.org$/', '', $normalizedQuery); // Eliminar sufijos como 'wikipedia.org'
    
    // Filtrar los resultados según el término normalizado
    $filtered = array_filter($wikis, function ($wiki) use ($normalizedQuery) {
        // Comparar contra 'wiki', 'code' y términos normalizados
        return str_contains($wiki['wiki'], $normalizedQuery) || str_contains($wiki['code'], $normalizedQuery);
    });

    // Si el término es exacto como un dominio, priorizar resultados únicos
    if (str_ends_with($query, '.wikipedia.org')) {
        $filtered = array_filter($filtered, function ($wiki) use ($normalizedQuery) {
            return str_ends_with($wiki['wiki'], 'wiki'); // Solo devuelve wikis principales
        });
    }
} else {
    $filtered = $wikis; // Devuelve todo si no hay filtro (opcional)
}

// Devuelve los datos en formato JSON
echo json_encode(array_values($filtered), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
