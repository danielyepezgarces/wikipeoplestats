<?php
header('Content-Type: application/json; charset=utf-8');

include '../../languages.php';

// Función para generar dominios basados en `wiki`
function getDomainFromWiki($wiki) {
    $domains = [
        'wiki' => 'wikipedia.org',
        'wikiquote' => 'wikiquote.org',
        'wikisource' => 'wikisource.org',
    ];

    // Separar el nombre de wiki y el tipo de proyecto
    if (preg_match('/^([a-z]+)(wiki|wikiquote|wikisource)$/', $wiki, $matches)) {
        $language = $matches[1];
        $project = $matches[2];

        if (isset($domains[$project])) {
            return "{$language}.{$domains[$project]}";
        }
    }
    return null;
}

// Leer los parámetros
$input = isset($_GET['input']) ? strtolower(trim($_GET['input'])) : '';

$result = [];

// Caso 1: Buscar proyectos por dominio (como `es.wikipedia.org`, `en.wikiquote.org`, etc.)
if ($input) {
    $found_wikis = [];

    foreach ($wikis as $wiki) {
        $domain = getDomainFromWiki($wiki['wiki']);

        if (strpos($domain, $input) !== false) {
            $found_wikis[] = [
                'code' => $wiki['code'],
                'wiki' => $wiki['wiki'],
                'domain' => $domain,
                'creation_date' => $wiki['creation_date'],
            ];
        }
    }

    if (!empty($found_wikis)) {
        $result['input'] = $input;
        $result['wikis'] = $found_wikis;
    } else {
        $result['error'] = "No wikis found for the input '{$input}'.";
    }
}

// Caso 2: Ningún parámetro proporcionado
else {
    $result['error'] = 'No input parameter provided. Please provide a domain or wiki name to search.';
}

// Devolver JSON
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);