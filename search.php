<?php
include 'languages.php'; // Cargar idiomas y traducciones
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?></title>
    <!-- Otras cabeceras -->
</head>
<body>
    <?php include 'header.php'; // Incluir el encabezado ?>
    
    <main>
        <h1><?php echo __('welcome_message'); ?></h1>
        <!-- Contenido principal -->
    </main>
    
    <script>
        function changeLanguage(lang) {
            window.location.href = '/' + lang + '/';
        }
    </script>
</body>
</html>
