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

    // Caso especial para Wikidata
    if ($wiki === 'wikidatawiki') {
        return 'wikidata.org';
    }

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
$input = isset($_GET['query']) ? strtolower(trim($_GET['query'])) : '';

$result = [];

// Caso 1: Buscar proyectos por dominio o nombre de wiki (ej. `eswiki`, `eswikisource`, `es.wikipedia.org`, etc.)
if ($input) {
    $found_wikis = [];

    // Comprobamos si el input es solo un código de idioma (ej. 'es', 'en', etc.)
    $is_language_code = strlen($input) === 2;  // Verifica si es un código de idioma de 2 caracteres (ej. 'es', 'en', etc.)
    $is_wiki_name = preg_match('/^[a-z]+(wiki|wikiquote|wikisource|wikidata)$/', $input); // Incluido Wikidata

    foreach ($wikis as $wiki) {
        // Generamos el dominio
        $domain = getDomainFromWiki($wiki['wiki']);
        
        // Si el input es un código de idioma, buscamos todos los proyectos de ese idioma
        if ($is_language_code) {
            if (strpos($wiki['code'], $input) !== false) {
                $found_wikis[] = [
                    'code' => $wiki['code'],
                    'wiki' => $wiki['wiki'],
                    'domain' => $domain,
                    'creation_date' => $wiki['creation_date'],
                ];
            }
        }
        // Si el input es un nombre de wiki (como 'eswiki', 'eswikisource', 'wikidatawiki', etc.)
        elseif ($is_wiki_name) {
            if (strpos($wiki['wiki'], $input) !== false) {
                $found_wikis[] = [
                    'code' => $wiki['code'],
                    'wiki' => $wiki['wiki'],
                    'domain' => $domain,
                    'creation_date' => $wiki['creation_date'],
                ];
            }
        }
        // Si el input no es ni un código de idioma ni un nombre de wiki, buscamos en el dominio completo
        else {
            if (strpos($domain, $input) !== false) {
                $found_wikis[] = [
                    'code' => $wiki['code'],
                    'wiki' => $wiki['wiki'],
                    'domain' => $domain,
                    'creation_date' => $wiki['creation_date'],
                ];
            }
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
