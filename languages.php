<?php
// languages.php

// Available languages
$languages = [
    ['code' => 'all', 'name' => 'All Wikipedias', 'flag' => '🌐', 'date_format' => 'l, F j, Y', 'wiki' => 'globalwiki', 'creation_date' => '2001-01-15', 'text_direction' => 'ltr'],
    ['code' => 'af', 'name' => 'Afrikaans', 'flag' => '🇿🇦', 'date_format' => 'l, j F Y', 'wiki' => 'afwiki', 'creation_date' => '2001-10-16', 'text_direction' => 'ltr'],
    ['code' => 'ar', 'name' => 'العربية', 'flag' => '🇸🇦', 'date_format' => 'D, j F Y', 'wiki' => 'arwiki', 'creation_date' => '2003-07-11', 'text_direction' => 'rtl'],
    ['code' => 'ca', 'name' => 'Català', 'flag' => '🇪🇸', 'date_format' => 'l, j \d\e F \d\e Y', 'wiki' => 'cawiki', 'creation_date' => '2001-03-28', 'text_direction' => 'ltr'],
    ['code' => 'ce', 'name' => 'Нохчийн', 'flag' => '🇦🇲', 'date_format' => 'd. MMMM Y', 'wiki' => 'cewiki', 'creation_date' => '2006-03-29', 'text_direction' => 'ltr'],
    ['code' => 'cs', 'name' => 'Čeština', 'flag' => '🇨🇿', 'date_format' => 'd. m. Y', 'wiki' => 'cswiki', 'creation_date' => '2002-05-03', 'text_direction' => 'ltr'],
    ['code' => 'de', 'name' => 'Deutsch', 'flag' => '🇩🇪', 'date_format' => 'l, j. F Y', 'wiki' => 'dewiki', 'creation_date' => '2001-03-16', 'text_direction' => 'ltr'],
    ['code' => 'en', 'name' => 'English', 'flag' => '🇬🇧', 'date_format' => 'l, F j, Y', 'wiki' => 'enwiki', 'creation_date' => '2001-01-15', 'text_direction' => 'ltr'],
    ['code' => 'es', 'name' => 'Español', 'flag' => '🇪🇸', 'date_format' => 'l, j \d\e F \d\e Y', 'wiki' => 'eswiki', 'creation_date' => '2001-05-20', 'text_direction' => 'ltr'],
    ['code' => 'fi', 'name' => 'Suomi', 'flag' => '🇫🇮', 'date_format' => 'l, j. F Y', 'wiki' => 'fiwiki', 'creation_date' => '2003-05-06', 'text_direction' => 'ltr'],
    ['code' => 'fr', 'name' => 'Français', 'flag' => '🇫🇷', 'date_format' => 'l j F Y', 'wiki' => 'frwiki', 'creation_date' => '2001-03-23', 'text_direction' => 'ltr'],
    ['code' => 'id', 'name' => 'Bahasa Indonesia', 'flag' => '🇮🇩', 'date_format' => 'd F Y', 'wiki' => 'idwiki', 'creation_date' => '2003-05-30', 'text_direction' => 'ltr'],
    ['code' => 'it', 'name' => 'Italiano', 'flag' => '🇮🇹', 'date_format' => 'l j F Y', 'wiki' => 'itwiki', 'creation_date' => '2001-05-10', 'text_direction' => 'ltr'],
    ['code' => 'ko', 'name' => '한국어', 'flag' => '🇰🇷', 'date_format' => 'YYYY년 M월 D일 (ddd)', 'wiki' => 'kowiki', 'creation_date' => '2002-06-30', 'text_direction' => 'ltr'],
    ['code' => 'ja', 'name' => '日本語', 'flag' => '🇯🇵', 'date_format' => 'Y年n月j日(l)', 'wiki' => 'jawiki', 'creation_date' => '2001-05-11', 'text_direction' => 'ltr'],
    ['code' => 'nl', 'name' => 'Nederlands', 'flag' => '🇳🇱', 'date_format' => 'l j F Y', 'wiki' => 'nlwiki', 'creation_date' => '2001-06-19', 'text_direction' => 'ltr'],
    ['code' => 'no', 'name' => 'Norsk', 'flag' => '🇳🇴', 'date_format' => 'l j. F Y', 'wiki' => 'nowiki', 'creation_date' => '2001-10-26', 'text_direction' => 'ltr'],
    ['code' => 'pl', 'name' => 'Polski', 'flag' => '🇵🇱', 'date_format' => 'l j F Y', 'wiki' => 'plwiki', 'creation_date' => '2001-09-26', 'text_direction' => 'ltr'],
    ['code' => 'pt', 'name' => 'Português', 'flag' => '🇵🇹', 'date_format' => 'l, j \d\e F \d\e Y', 'wiki' => 'ptwiki', 'creation_date' => '2001-05-11', 'text_direction' => 'ltr'],
    ['code' => 'ru', 'name' => 'Русский', 'flag' => '🇷🇺', 'date_format' => 'l, j F Y', 'wiki' => 'ruwiki', 'creation_date' => '2001-05-20', 'text_direction' => 'ltr'],
    ['code' => 'sr', 'name' => 'Српски', 'flag' => '🇷🇸', 'date_format' => 'd. m. Y.', 'wiki' => 'srwiki', 'creation_date' => '2003-02-16', 'text_direction' => 'ltr'],
    ['code' => 'sv', 'name' => 'Svenska', 'flag' => '🇸🇪', 'date_format' => 'l, j F Y', 'wiki' => 'svwiki', 'creation_date' => '2001-06-17', 'text_direction' => 'ltr'],
    ['code' => 'tr', 'name' => 'Türkçe', 'flag' => '🇹🇷', 'date_format' => 'd F Y', 'wiki' => 'trwiki', 'creation_date' => '2002-12-05', 'text_direction' => 'ltr'],
    ['code' => 'uk', 'name' => 'Українська', 'flag' => '🇺🇦', 'date_format' => 'l, j F Y', 'wiki' => 'ukwiki', 'creation_date' => '2004-05-30', 'text_direction' => 'ltr'],
    ['code' => 'vi', 'name' => 'Tiếng Việt', 'flag' => '🇻🇳', 'date_format' => 'd tháng m Y', 'wiki' => 'viwiki', 'creation_date' => '2002-11-01', 'text_direction' => 'ltr'],
    ['code' => 'zh', 'name' => '中文', 'flag' => '🇨🇳', 'date_format' => 'Y年n月j日 l', 'wiki' => 'zhwiki', 'creation_date' => '2001-05-11', 'text_direction' => 'ltr'],
];

// Set default language
$currentLang = $languages[0];

// Check if a language is selected
if (isset($_GET['lang'])) {
    $requestedLang = $_GET['lang'];
    foreach ($languages as $lang) {
        if ($lang['code'] === $requestedLang) {
            $currentLang = $lang;
            break;
        }
    }
}

// Load translations
$translations = [];
$jsonFile = __DIR__ . '/languages/' . $currentLang['code'] . '.json';
if (file_exists($jsonFile)) {
    $translations = json_decode(file_get_contents($jsonFile), true);
}

// Translation function
function __($key) {
    global $translations;
    return $translations[$key] ?? $key;
}

// Set locale for date formatting
setlocale(LC_TIME, $currentLang['code'] . '_' . strtoupper($currentLang['code']) . '.UTF-8');
