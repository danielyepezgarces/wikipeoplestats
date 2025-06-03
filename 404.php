<?php
// Incluir el archivo de traducciones
include('languages.php');

// Obtener el path completo de la URL solicitada
$request_path = $_SERVER['REQUEST_URI'];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo __('sitename'); ?> - 404</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 20px;
            border: 1px solid #ccc;
            background-color: #fff;
            border-radius: 10px;
        }
        h1 {
            color: #ff0000;
            font-size: 3em;
        }
        p {
            font-size: 1.2em;
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 1.2em;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <h1><?php echo __('404_message'); ?></h1>
    <p><?php echo __('404_description'); ?></p>
    <p><strong><?php echo __('requested_path'); ?>:</strong> <?php echo htmlspecialchars($request_path); ?></p>
    
    <!-- Botón para volver al inicio -->
    <a href="/" class="button"><?php echo __('go_back_home'); ?></a>
</div>

</body>
</html>
