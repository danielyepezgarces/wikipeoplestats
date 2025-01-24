<?php
// Incluir el archivo de idiomas
include_once('languages.php');

// Obtener el dominio actual para determinar el proyecto
$currentDomain = $_SERVER['HTTP_HOST'];
$project = getProject($currentDomain);

// Obtener el idioma actual basado en las preferencias globales o la excepción local
$currentLang = getLanguageByCode($defaultLang);

// Verificar si existe una excepción local para este proyecto
$exceptionLang = isset($_COOKIE["local_exception_$project"]) ? $_COOKIE["local_exception_$project"] : null;

// Si existe una excepción local, usamos ese idioma
if ($exceptionLang && in_array($exceptionLang, array_column($languages, 'code'))) {
    $currentLang = getLanguageByCode($exceptionLang);
} else {
    // Si no hay excepción local, manejamos el idioma global
    if (isset($_COOKIE['global_usage']) && $_COOKIE['global_usage'] == 'true') {
        $requestedLang = isset($_COOKIE['language']) ? $_COOKIE['language'] : $project; // Usa proyecto o idioma global
        $currentLang = getLanguageByCode($requestedLang);
    } else {
        // Si no hay preferencia global, usamos el idioma por defecto
        $currentLang = getLanguageByCode($project);
    }
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
            <input type="checkbox" id="global-preference" <?php echo (isset($_COOKIE['global_usage']) && $_COOKIE['global_usage'] == 'true' && !isset($_COOKIE["local_exception_$project"])) ? 'checked' : ''; ?> class="form-checkbox text-blue-500" <?php echo isset($_COOKIE["local_exception_$project"]) ? 'disabled' : ''; ?>>
            <label for="global-preference" class="text-gray-800 dark:text-gray-200"><?php echo __('set_global_preference'); ?></label>
        </div>

        <!-- Checkbox para establecer excepción local -->
        <div class="mt-4 flex items-center space-x-2">
            <input type="checkbox" id="local-exception" <?php echo isset($_COOKIE["local_exception_$project"]) ? 'checked' : ''; ?> class="form-checkbox text-blue-500">
            <label for="local-exception" class="text-gray-800 dark:text-gray-200"><?php echo __('set_local_exception'); ?></label>
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
    const isLocalException = document.getElementById('local-exception').checked; // Comprobamos si se marca la excepción local

    // Enviar una solicitud AJAX al servidor para cambiar el idioma en la sesión
    fetch('https://wikipeoplestats.org/languages.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `lang=${langCode}&global_usage=${isGlobal ? 'true' : 'false'}&local_exception=${isLocalException ? 'true' : 'false'}`,  // Pasamos el código de idioma y la preferencia global
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
