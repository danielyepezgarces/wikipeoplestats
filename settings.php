<?php
// Obtener el dominio actual
$currentDomain = $_SERVER['HTTP_HOST'];

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

    // Lista de idiomas soportados
    $supportedLanguages = [
        "aa", "ab", "ace", "ady", "af", "ak", "als", "alt", "am", "ami", "an", "ang", "ann", "anp", "ar",
        "arc", "ary", "arz", "as", "ast", "atj", "av", "avk", "awa", "ay", "az", "azb", "ba", "ban", "bar",
        "bat-smg", "bbc", "bcl", "bdr", "be", "be-tarask", "be-x-old", "bew", "bg", "bh", "bi", "bjn",
        "blk", "bm", "bn", "bo", "bpy", "br", "bs", "btm", "bug", "bxr", "ca", "cbk-zam", "cdo", "ce",
        "ceb", "ch", "cho", "chr", "chy", "ckb", "co", "cr", "crh", "cs", "csb", "cu", "cv", "cy", "da",
        "dag", "de", "dga", "din", "diq", "dsb", "dtp", "dty", "dv", "dz", "ee", "el", "eml", "en", "eo",
        "es", "et", "eu", "ext", "fa", "fat", "ff", "fi", "fiu-vro", "fj", "fo", "fon", "fr", "frp", "frr",
        "fur", "fy", "ga", "gag", "gan", "gcr", "gd", "gl", "glk", "gn", "gom", "gor", "got", "gpe", "gsw",
        "gu", "guc", "gur", "guw", "gv", "ha", "hak", "haw", "he", "hi", "hif", "ho", "hr", "hsb", "ht",
        "hu", "hy", "hyw", "hz", "ia", "iba", "id", "ie", "ig", "igl", "ii", "ik", "ilo", "inh", "io", "is",
        "it", "iu", "ja", "jam", "jbo", "jv", "ka", "kaa", "kab", "kbd", "kbp", "kcg", "kg", "kge", "ki",
        "kj", "kk", "kl", "km", "kn", "ko", "koi", "kr", "krc", "ks", "ksh", "ku", "kus", "kv", "kw", "ky",
        "la", "lad", "lb", "lbe", "lez", "lfn", "lg", "li", "lij", "lld", "lmo", "ln", "lo", "lrc", "lt",
        "ltg", "lv", "lzh", "mad", "mai", "map-bms", "mdf", "mg", "mh", "mhr", "mi", "min", "mk", "ml",
        "mn", "mni", "mnw", "mo", "mos", "mr", "mrj", "ms", "mt", "mus", "mwl", "my", "myv", "mzn", "na",
        "nah", "nan", "nap", "nds", "nds-nl", "ne", "new", "ng", "nia", "nl", "nn", "no", "nov", "nqo",
        "nr", "nrm", "nso", "nv", "ny", "oc", "olo", "om", "or", "os", "pa", "pag", "pam", "pap", "pcd",
        "pcm", "pdc", "pfl", "pi", "pih", "pl", "pms", "pnb", "pnt", "ps", "pt", "pwn", "qu", "rm", "rmy",
        "rn", "ro", "roa-rup", "roa-tara", "rsk", "ru", "rue", "rup", "rw", "sa", "sah", "sat", "sc", "scn",
        "sco", "sd", "se", "sg", "sgs", "sh", "shi", "shn", "shy", "si", "simple", "sk", "skr", "sl", "sm",
        "smn", "sn", "so", "sq", "sr", "srn", "ss", "st", "stq", "su", "sv", "sw", "szl", "szy", "ta",
        "tay", "tcy", "tdd", "te", "tet", "tg", "th", "ti", "tig", "tk", "tl", "tly", "tn", "to", "tpi",
        "tr", "trv", "ts", "tt", "tum", "tw", "ty", "tyv", "udm", "ug", "uk", "ur", "uz", "ve", "vec",
        "vep", "vi", "vls", "vo", "vro", "wa", "war", "wo", "wuu", "xal", "xh", "xmf", "yi", "yo", "yue",
        "za", "zea", "zgh", "zh", "zh-classical", "zh-min-nan", "zh-yue", "zu"
    ];

    // Verificar si el dominio es www.wikipeoplestats.org
    if ($currentDomain === 'www.wikipeoplestats.org') {
        return 'all';
    }

    // Verificar si el idioma es válido
    if (!in_array($lang, $supportedLanguages)) {
        return "unknown";
    }

    // Determinar el proyecto
    switch ($projectType) {
        case 'wikipedia':
            return $lang . 'wiki';
        case 'wikiquote':
            return $lang . 'quote';
        case 'wikisource':
            return $lang . 'source';
        default:
            return "unknown";
    }
}

// Función para obtener el dominio original
function getOriginalDomain($currentDomain) {
    // Separar el dominio en partes
    $parts = explode('.', $currentDomain);

    // Verificar si el dominio tiene al menos 3 partes
    if (count($parts) < 3) {
        return $currentDomain;
    }

    // Obtener el idioma y el tipo de proyecto
    $lang = $parts[0];
    $projectType = $parts[1];

    // Determinar el dominio original
    switch ($projectType) {
        case 'wikipedia':
            return $lang . '.wikipedia.org';
        case 'wikiquote':
            return $lang . '.wikiquote.org';
        case 'wikisource':
            return $lang . '.wikisource.org';
        default:
            return "www.wikidata.org";
    }
}

// Obtener el proyecto correspondiente
$wikiproject = getProject($currentDomain);

// Obtener el dominio original
$wikidomain = getOriginalDomain($currentDomain);

?>
