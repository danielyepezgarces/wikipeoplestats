<?php
include 'languages.php'; // Cargar idiomas y traducciones
?>

<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
   <link href='https://tools-static.wmflabs.org/fontcdn/css?family=Montserrat:700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"}
                    }
                }
            }
        }
    </script>
    <!-- Otras cabeceras -->
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
    <?php include 'header.php'; // Incluir el encabezado ?>

    <main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
        <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('welcome_message'); ?></h1>
        <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300"><?php echo __('input_section_intro'); ?></p>

        <form class="mt-6 grid grid-cols-3 gap-4" onsubmit="return validateDates()">
    <!-- Project Input -->
    <div class="flex items-center col-span-1">
        <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <?php echo __('input_project_label'); ?>
        </label>
        <span class="ml-1 cursor-pointer" title="Provide the name of the project.">
            <i class="fas fa-question-circle text-gray-500 dark:text-gray-400"></i>
        </span>
    </div>
    <div class="relative col-span-2">
        <input type="text" id="project" name="project"
            class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring focus:ring-primary-500 focus:border-primary-500 h-10 appearance-none transition duration-300"
            required oninput="autocompleteWiki(this)">
        <div id="suggestions"
            class="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg max-h-60 overflow-y-auto hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100 dark:scrollbar-thumb-blue-400 dark:scrollbar-track-gray-800">
            <!-- Las sugerencias se mostrarán aquí -->
        </div>
    </div>

    <!-- Start Date Input -->
    <div class="flex items-center col-span-1">
        <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <?php echo __('input_start_date_label'); ?>
        </label>
        <span class="ml-1 cursor-pointer" title="Select the project start date.">
            <i class="fas fa-question-circle text-gray-500 dark:text-gray-400"></i>
        </span>
    </div>
    <input type="date" id="start_date" name="start_date"
        class="mt-1 block w-full col-span-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring focus:ring-primary-500 focus:border-primary-500 appearance-none transition duration-300">

    <!-- End Date Input -->
    <div class="flex items-center col-span-1">
        <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <?php echo __('input_end_date_label'); ?>
        </label>
        <span class="ml-1 cursor-pointer" title="Select the project end date.">
            <i class="fas fa-question-circle text-gray-500 dark:text-gray-400"></i>
        </span>
    </div>
    <input type="date" id="end_date" name="end_date"
        class="mt-1 block w-full col-span-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring focus:ring-primary-500 focus:border-primary-500 appearance-none transition duration-300">

    <div class="col-span-3 flex items-center justify-center">
        <button type="submit"
            class="bg-blue-500 dark:bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg">
            <?php echo __('submit_button'); ?>
        </button>
    </div>
</form>

    </div>
</main>

<?php include 'languageselector.php'; // Incluir el encabezado ?>


<script>
let wikiCreationDate = ''; // Fecha de creación de la wiki (se actualiza dinámicamente)

// Función para manejar el autocomplete de las wikis
function autocompleteWiki(input) {
    const query = input.value;

    // Si el campo está vacío, no mostrar sugerencias
    if (!query) {
        document.getElementById('suggestions').classList.add('hidden');
        return;
    }

    // Llamada a la API de búsqueda
    fetch(`https://api.wikipeoplestats.org/v1/search/genders?query=${query}`)
        .then(response => response.json())
        .then(data => {
            const suggestions = data.wikis || [];
            const suggestionsList = document.getElementById('suggestions');
            suggestionsList.innerHTML = ''; // Limpiar las sugerencias anteriores

            if (suggestions.length > 0) {
                suggestionsList.classList.remove('hidden');
                suggestions.forEach(wiki => {
                    const listItem = document.createElement('div');
                    listItem.className =
                        "p-2 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition duration-200 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0";
                    listItem.textContent = `${wiki.wiki} (${wiki.domain})`;
                    listItem.onclick = function () {
                        document.getElementById('project').value = wiki.wiki;
                        document.getElementById('suggestions').classList.add('hidden');
                        wikiCreationDate = wiki.creation_date; // Actualizar fecha de creación
                    };
                    suggestionsList.appendChild(listItem);
                });
            } else {
                suggestionsList.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching autocomplete data:', error);
            document.getElementById('suggestions').classList.add('hidden');
        });
}

// Función para validar las fechas antes de enviar el formulario
function validateDates() {
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Validar fecha de inicio si está presente
    if (startDateInput.value) {
        if (startDateInput.value < wikiCreationDate) {
            alert(`La fecha de inicio debe ser igual o mayor a la fecha de creación de la wiki seleccionada (${wikiCreationDate}).`);
            return false;
        }

        if (startDateInput.value > todayString) {
            alert("La fecha de inicio no puede ser mayor que la fecha de hoy.");
            return false;
        }
    }

    // Validar fecha de fin si está presente
    if (endDateInput.value) {
        if (startDateInput.value && endDateInput.value < startDateInput.value) {
            alert("La fecha de fin debe ser igual o mayor que la fecha de inicio.");
            return false;
        }

        if (endDateInput.value > todayString) {
            alert("La fecha de fin no puede ser mayor que la fecha de hoy.");
            return false;
        }
    }

    // Si todo está bien, redirigir a la nueva URL
    return redirectToUrl();
}


// Función para redirigir a la URL con los parámetros seleccionados
function redirectToUrl() {
    const project = document.getElementById('project').value.trim();
    const startDate = document.getElementById('start_date').value.trim();
    const endDate = document.getElementById('end_date').value.trim();

    if (!project) {
        alert("Por favor selecciona un proyecto válido.");
        return false;
    }

    // Separar idioma y tipo de proyecto
    const match = project.match(/^([a-z]{2,3})(wiki(?:quote|source|books|versity|news|data)?)$/);
    if (!match) {
        alert("El formato del proyecto no es válido.");
        return false;
    }

    const lang = match[1]; // Código de idioma (ej: 'es')
    const type = match[2] === 'wiki' ? '' : `.${match[2].replace('wiki', '')}`; // Tipo de proyecto (ej: '.quote', '.source', o vacío para wiki)

    // Construir el subdominio dinámico
    let url = `https://${lang}${type}.wikipeoplestats.org/genders`;

    // Añadir fechas si están presentes
    if (startDate && endDate) {
        url += `/${startDate}/${endDate}`;
    } else if (startDate) {
        url += `/${startDate}/`;
    } else if (endDate) {
        url += `//${endDate}`; // Doble barra si solo hay fecha de fin
    } else {
        url += `//`; // Doble barra si no hay fechas
    }

    // Redirigir a la nueva URL
    window.location.href = url;
    return false; // Prevenir el envío del formulario
}

</script>

    <script src="https://wikipeoplestats.org/assets/js/main.js"></script>
</body>
</html>
