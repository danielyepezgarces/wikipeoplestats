<?php
// Incluir el archivo de idiomas
include_once('languages.php');

// Obtener el proyecto actual (subdominio o dominio)
$currentDomain = $_SERVER['HTTP_HOST'];
$parts = explode('.', $currentDomain);
$projectName = (count($parts) >= 3) ? $parts[0] : ''; // Usar el subdominio como el nombre del proyecto

// Obtener el idioma actual según la preferencia global o la excepción local
$localExceptionLanguage = getLocalExceptionLanguage($projectName);
if ($localExceptionLanguage !== '') {
    // Si hay una excepción local, usar ese idioma
    foreach ($languages as $lang) {
        if ($lang['code'] === $localExceptionLanguage) {
            $currentLang = $lang;
            break;
        }
    }
} else {
    // Si no hay una excepción local, usar la preferencia global o el idioma predeterminado
    $currentLang = $languages[0]; // Inglés por defecto, si no hay preferencia global
    if ($userLanguage = getUserLanguage()) {
        foreach ($languages as $lang) {
            if ($lang['code'] === $userLanguage) {
                $currentLang = $lang;
                break;
            }
        }
    }
}

// Función para obtener el idioma de la excepción local para un proyecto
function getLocalExceptionLanguage($projectName) {
    if (isset($_COOKIE["local_exception_$projectName"])) {
        return $_COOKIE["local_exception_$projectName"];
    }
    return '';
}

// Función para obtener el idioma preferido globalmente del usuario
function getUserLanguage() {
    return isset($_COOKIE['user_language']) ? $_COOKIE['user_language'] : null;
}

?>

<div id="language-popup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-[95%] sm:max-w-lg lg:max-w-4xl xl:max-w-5xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('select_language'); ?></h2>

        <!-- Selector de idioma -->
        <div class="mb-4">
            <label for="language-selector" class="block text-gray-800 dark:text-gray-200"><?php echo __('choose_language'); ?></label>
            <select id="language-selector" class="w-full mt-2 p-2 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <?php foreach ($languages as $lang): ?>
                    <option value="<?php echo $lang['code']; ?>" <?php echo ($currentLang['code'] === $lang['code']) ? 'selected' : ''; ?>>
                        <?php echo $lang['name']; ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <!-- Checkbox para establecer preferencias globales -->
        <div class="mt-4 flex items-center space-x-2">
            <input type="checkbox" id="global-preference" <?php echo (isset($_COOKIE['global_usage']) && $_COOKIE['global_usage'] == 'true') ? 'checked' : ''; ?> class="form-checkbox text-blue-500">
            <label for="global-preference" class="text-gray-800 dark:text-gray-200"><?php echo __('set_global_preference'); ?></label>
        </div>

        <div class="mt-4 flex justify-end">
            <button onclick="changeLanguage()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><?php echo __('save_language'); ?></button>
        </div>
    </div>
</div>

<script>
// Función para cambiar el idioma
function changeLanguage() {
    const langCode = document.getElementById('language-selector').value;
    const isGlobal = document.getElementById('global-preference').checked; // Comprobamos si se marca la preferencia global

    // Enviar una solicitud AJAX al servidor para cambiar el idioma en languages.php
    fetch('languages.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `lang=${langCode}&global_usage=${isGlobal ? 'true' : 'false'}`,  // Pasamos el código de idioma y la preferencia global
    })
    .then(response => response.json())  // Esperamos una respuesta JSON
    .then(data => {
        if (data.success) {
            // Si el cambio fue exitoso, recargar la página para reflejar el idioma cambiado
            location.reload();
        } else {
            console.error('Error al cambiar el idioma:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
</script>
