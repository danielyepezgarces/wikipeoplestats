<?php
include 'languages.php'; // Cargar idiomas y traducciones
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
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
<body>
    <?php include 'header.php'; // Incluir el encabezado ?>

    <main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
        <h1 class="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100"><?php echo __('welcome_message'); ?></h1>
        <p class="text-xl text-gray-700 text-center justify-center dark:text-gray-300"><?php echo __('input_section_intro'); ?></p>

        <form class="mt-6 grid grid-cols-3 gap-4" onsubmit="return validateDates()">
    <!-- Project Input -->
    <div class="flex items-center col-span-1">
        <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_project_label'); ?></label>
        <span class="ml-1 cursor-pointer" title="Provide the name of the project.">
            <i class="fas fa-question-circle text-gray-500"></i>
        </span>
    </div>
    <div class="relative col-span-2">
        <input type="text" id="project" name="project" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500 h-10 appearance-none" required oninput="autocompleteWiki(this)">
        <div id="suggestions" class="absolute bg-white shadow-lg border w-full rounded-md mt-1 hidden z-10">
            <!-- Las sugerencias se mostrarán aquí -->
        </div>
    </div>

    <!-- Start Date Input -->
    <div class="flex items-center col-span-1">
        <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_start_date_label'); ?></label>
        <span class="ml-1 cursor-pointer" title="Select the project start date.">
            <i class="fas fa-question-circle text-gray-500"></i>
        </span>
    </div>
    <input type="date" id="start_date" name="start_date" class="mt-1 block w-full col-span-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500 appearance-none">

    <!-- End Date Input -->
    <div class="flex items-center col-span-1">
        <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300"><?php echo __('input_end_date_label'); ?></label>
        <span class="ml-1 cursor-pointer" title="Select the project end date.">
            <i class="fas fa-question-circle text-gray-500"></i>
        </span>
    </div>
    <input type="date" id="end_date" name="end_date" class="mt-1 block w-full col-span-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-primary-500 appearance-none">

    <div class="col-span-3 flex items-center justify-center">
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg">
            <?php echo __('submit_button'); ?>
        </button>
    </div>
</form>
    </div>
</main>

<?php include 'languageselector.php'; // Incluir el encabezado ?>


    <script>
function redirectToUrl() {
    const project = document.getElementById('project').value;
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    // Crear la URL base
    let url = `/genders/${project}`;

    // Lógica para manejar las fechas
    if (startDate && endDate) {
        url += `/${startDate}/${endDate}`;
    } else if (startDate) {
        url += `/${startDate}/`;
    } else if (endDate) {
        url += `//${endDate}`; // Aquí pasamos la barra vacía
    } else {
        url += `//`; // Pasamos dos barras si no hay parámetros
    }

    // Redirigir a la nueva URL
    window.location.href = url;
    return false; // Prevenir el envío del formulario
}
</script>
<script>
    let wikiCreationDate = ''; // Variable para almacenar la fecha de creación

    // Función para obtener las wikis de la API y manejar la validación
    function fetchWikiData(input) {
        fetch(`https://wikipeoplestats.wmcloud.org/api/search/genders.php?query=${input}`)
            .then(response => response.json())
            .then(data => {
                const wikis = data.wikis || [];
                const suggestionsContainer = document.getElementById('suggestions');

                // Limpiar las sugerencias previas
                suggestionsContainer.innerHTML = '';

                // Mostrar las sugerencias de wikis
                wikis.forEach(wiki => {
                    const div = document.createElement('div');
                    div.className = "cursor-pointer hover:bg-gray-100 p-2"; // Añadir estilo de hover
                    div.textContent = `${wiki.wiki} - ${wiki.code}`;
                    div.onclick = () => {
                        document.getElementById('project').value = wiki.wiki; // Establecer el valor en el input
                        suggestionsContainer.classList.add('hidden'); // Ocultar las sugerencias
                        wikiCreationDate = wiki.creation_date; // Guardar la fecha de creación
                        setCreationDate(wikiCreationDate); // Establecer la fecha de creación en los inputs
                    };
                    suggestionsContainer.appendChild(div);
                });

                // Mostrar el contenedor de sugerencias si hay wikis
                suggestionsContainer.classList.toggle('hidden', wikis.length === 0);
            })
            .catch(error => console.error('Error fetching wiki data:', error));
    }

    // Establecer las fechas mínimas y máximas para las entradas de fecha
    function setCreationDate(creationDate) {
        const startDateInput = document.getElementById('start_date');
        const endDateInput = document.getElementById('end_date');

        // Establecer la fecha mínima de inicio y la fecha máxima de fin
        startDateInput.min = creationDate; // La fecha de inicio no puede ser antes de la fecha de creación
        const today = new Date().toISOString().split('T')[0];
        endDateInput.max = today; // La fecha de fin no puede ser posterior a la fecha actual
    }

    // Función para validar las fechas antes de enviar el formulario
    function validateDates() {
        const startDateInput = document.getElementById('start_date');
        const endDateInput = document.getElementById('end_date');
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Comprobación de fechas
        if (startDateInput.value < wikiCreationDate) {
            alert(`La fecha de inicio debe ser igual o mayor a la fecha de creación de la wiki seleccionada (${wikiCreationDate}).`);
            return false;
        }

        if (startDateInput.value > todayString) {
            alert("La fecha de inicio no puede ser mayor que la fecha de hoy.");
            return false;
        }

        if (endDateInput.value < startDateInput.value) {
            alert("La fecha de fin debe ser igual o mayor que la fecha de inicio.");
            return false;
        }

        return true; // Validación correcta
    }

    // Autocompletar de wiki
    document.getElementById('project').addEventListener('input', function() {
        const input = this.value;
        fetchWikiData(input);
    });

    // Establecer el máximo de end_date al cargar la página
    window.onload = function() {
        const endDateInput = document.getElementById('end_date');
        const today = new Date();
        endDateInput.max = today.toISOString().split('T')[0];
    }
</script>

    <script src="https://wikipeoplestats.wmcloud.org/assets/js/main.js"></script>
</body>
</html>
