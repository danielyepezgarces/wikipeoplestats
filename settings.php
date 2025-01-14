<?php
// Obtener el dominio actual
$currentDomain = $_SERVER['HTTP_HOST'];

// Lista de idiomas soportados
$supportedLanguages = [
    "aa", "ab", "ace", "ady", "af", "ak", "als", "alt", "am", "ami", "an", "ang", "ann", "anp", "ar",
    "arc", "ary", "arz", "as", "ast", "atj", "av", "avk", "awa", "ay", "az", "azb", "ba", "ban", "bar",
    "bcl", "be", "be-x-old", "bg", "bh", "bi", "bjn", "bm", "bn", "bo", "bpy", "br", "bs", "bug", "bxr", 
    "ca", "cbk-zam", "ce", "ceb", "ch", "chk", "clc", "co", "cr", "crh", "cs", "csb", "cu", "cv", "cy", 
    "da", "de", "de-ch", "dsb", "dtp", "dv", "dz", "ee", "el", "eml", "en", "eo", "es", "et", "eu", "ext", 
    "fa", "ff", "fi", "fo", "fr", "frp", "frr", "fur", "fy", "ga", "gaa", "gan", "gd", "gl", "glk", "gn", 
    "gu", "gv", "hak", "he", "hi", "hif", "hr", "hsb", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", 
    "ik", "io", "is", "it", "ja", "jbo", "jv", "ka", "kaa", "kab", "kg", "kk", "kl", "km", "kn", "ko", "kok", 
    "kri", "ku", "kv", "kw", "ky", "la", "lad", "lb", "lbe", "lez", "li", "lij", "lmo", "ln", "lo", "lt", "ltg", 
    "lv", "map-bms", "mg", "mh", "mhr", "mi", "min", "mk", "ml", "mn", "mr", "ms", "mt", "my", "mzn", "nah", 
    "nap", "nb", "nds", "nds-nl", "ne", "new", "nl", "nn", "no", "nov", "nqo", "nr", "nv", "oc", "om", "or", 
    "os", "pa", "pap", "pl", "pms", "pnb", "ps", "pt", "qu", "quc", "quh", "rm", "rmy", "rn", "ro", "roa-rup", 
    "ru", "ru-sib", "rw", "sah", "sa", "sco", "sd", "se", "si", "simple", "sk", "sl", "sq", "sr", "srn", "ss", 
    "st", "su", "sv", "sw", "ta", "te", "tet", "tg", "th", "ti", "tk", "tl", "tr", "ts", "tt", "ug", "uk", "ur", 
    "uz", "vec", "vep", "vi", "vls", "vo", "wa", "war", "wo", "xh", "yi", "yo", "za", "zea", "zh", "zh-classical", 
    "zh-cn", "zh-hans", "zh-hant", "zu"
];

// Lista de proyectos tipo "quote" y "source"
$quoteProjects = ["wikiquote"];
$sourceProjects = ["wikisource"];

// Función para obtener el proyecto adecuado según el dominio
function getProject($currentDomain) {
    // Separar el dominio en partes
    $parts = explode('.', $currentDomain);

    // Verificar si el dominio tiene al menos 3 partes
    if (count($parts) < 3) {
        return "unknown";
    }

    // Obtener el idioma y el tipo de proyecto
    $lang = $parts[0];
    $projectType = $parts[1];

    // Verificar si el dominio es www.wikipeoplestats.org
    if ($currentDomain === 'www.wikipeoplestats.org') {
        return 'all';
    }

    // Verificar si el idioma es válido
    if (!in_array($lang, $GLOBALS['supportedLanguages'])) {
        return "wikidata";
    }

    // Verificar si el proyecto es de tipo "quote" o "source"
    if (in_array($projectType, $GLOBALS['quoteProjects'])) {
        return $lang . 'quote';
    } elseif (in_array($projectType, $GLOBALS['sourceProjects'])) {
        return $lang . 'source';
    }

    // Determinar el dominio para Wikipedia
    if ($projectType === 'wikipedia') {
        return $lang . 'wiki';
    }

    // Si no coincide con ningún proyecto conocido, retornar "wikidata"
    return "wikidata";
}

// Función para obtener el dominio original
function getOriginalDomain($currentDomain) {
    // Verificar si el dominio es www.wikipeoplestats.org
    if ($currentDomain === 'www.wikipeoplestats.org') {
        return 'www.wikidata.org';
    }

    // Separar el dominio en partes
    $parts = explode('.', $currentDomain);

    // Verificar si el dominio tiene al menos 3 partes
    if (count($parts) < 3) {
        return 'wikidata.org';
    }

    // Obtener el idioma y el tipo de proyecto
    $lang = $parts[0];
    $projectType = $parts[1];

    // Determinar el dominio original
    if (in_array($projectType, $GLOBALS['quoteProjects'])) {
        return $lang . '.wikiquote.org';
    } elseif (in_array($projectType, $GLOBALS['sourceProjects'])) {
        return $lang . '.wikisource.org';
    }

    // Para Wikipedia y otros proyectos
    if ($projectType === 'wikipedia') {
        return $lang . '.wikipedia.org';
    }

    // Si no coincide con ningún proyecto conocido, retornar "wikidata.org"
    return 'wikidata.org';
}

?>
