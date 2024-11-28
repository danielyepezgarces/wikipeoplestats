<div id="language-popup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-[95%] sm:max-w-lg lg:max-w-4xl xl:max-w-5xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('select_language'); ?></h2>
        <div class="overflow-y-auto flex-grow">
            <!-- Aplicamos el estilo de scroll personalizado con separación -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 max-h-[60vh] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-transparent">
                <?php foreach ($languages as $lang): ?>
                    <button onclick="changeLanguage('<?php echo $lang['code']; ?>')" class="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                        <span class="text-2xl"><?php echo $lang['flag']; ?></span>
                        <span><?php echo $lang['name']; ?></span>
                    </button>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<script>
function changeLanguage(langCode) {
    // Enviar una solicitud AJAX al servidor para cambiar el idioma en la sesión
    fetch('languages.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `lang=${langCode}`,
    })
    .then(response => response.json())
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
