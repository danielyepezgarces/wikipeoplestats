<?php
require_once 'languages.php';
require_once 'events-list.php';

$wikiproject = getProject($currentDomain);
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
    <head>
    <meta charset="UTF-8">
    <title><?php echo __('sitename'); ?></title>
    <meta name="description" content="<?php echo __('site_description'); ?>">
    <meta name="keywords" content="<?php echo __('site_keywords'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/css/fonts/styles.css" rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/libs/font-awesome/all.min.css">
    <script src="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/js/tailwind.js"></script>
    <script src="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/js/main.js"></script>
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
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
<!-- Hero Section -->
<?php
require_once 'header.php';
?>

<!-- Events Grid Section -->
<section class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <?php 
        $hasEvents = false; // Variable para verificar si hay eventos disponibles
        
        foreach ($events as $event): 
            if (in_array($wikiproject, $event['wikis'])): 
                $hasEvents = true; // Se encontró al menos un evento
        ?>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <?php if (!empty($event['event_image'])): ?>
                        <img src="<?php echo htmlspecialchars($event['event_image']); ?>" 
                             alt="<?php echo htmlspecialchars($event['name']); ?>" 
                             class="w-full h-48 object-cover">
                    <?php endif; ?>
                    
                    <div class="p-6">
                        <h2 class="text-xl font-bold mb-2"><?php echo htmlspecialchars($event['name']); ?></h2>
                        
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p><?php echo date('M j', strtotime($event['start_date'])); ?> - 
                               <?php echo date('M j, Y', strtotime($event['end_date'])); ?></p>
                            <p><?php echo htmlspecialchars($event['location']); ?></p>
                        </div>
                        
                        <p class="text-gray-700 dark:text-gray-200 mb-4">
                            <?php echo htmlspecialchars($event['description']); ?>
                        </p>
                        
                        <a href="/event/<?php echo htmlspecialchars($event['slug']); ?>" 
                           class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                            <?php echo __('view_details'); ?>
                        </a>
                    </div>
                </div>
        <?php 
            endif; 
        endforeach; 
        ?>

        <?php if (!$hasEvents): // Mostrar mensaje si no hay eventos disponibles ?>
            <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400 text-xl">
                <?php echo __('no_events_available'); ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<!-- Past Events Section -->
<section class="container mx-auto px-4 py-12">
    <h2 class="text-2xl font-bold mb-8 text-center"><?php echo __('past_events'); ?></h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <?php 
        $hasPastEvents = false; // Variable to check if there are past events available
        $currentDate = date('Y-m-d'); // Get current date
        
        foreach ($events as $event): 
            // Check if event is past (end date is before current date) and belongs to current wiki project
            if (strtotime($event['end_date']) < strtotime($currentDate) && in_array($wikiproject, $event['wikis'])): 
                $hasPastEvents = true; // Found at least one past event
        ?>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden opacity-80">
                    <?php if (!empty($event['event_image'])): ?>
                        <img src="<?php echo htmlspecialchars($event['event_image']); ?>" 
                             alt="<?php echo htmlspecialchars($event['name']); ?>" 
                             class="w-full h-48 object-cover">
                    <?php endif; ?>
                    
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="text-xl font-bold"><?php echo htmlspecialchars($event['name']); ?></h2>
                            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                <?php echo __('past'); ?>
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p><?php echo date('M j', strtotime($event['start_date'])); ?> - 
                               <?php echo date('M j, Y', strtotime($event['end_date'])); ?></p>
                            <p><?php echo htmlspecialchars($event['location']); ?></p>
                        </div>
                        
                        <p class="text-gray-700 dark:text-gray-200 mb-4">
                            <?php echo htmlspecialchars($event['description']); ?>
                        </p>
                        
                        <a href="/event/<?php echo htmlspecialchars($event['slug']); ?>" 
                           class="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                            <?php echo __('view_recap'); ?>
                        </a>
                    </div>
                </div>
        <?php 
            endif; 
        endforeach; 
        ?>

        <?php if (!$hasPastEvents): // Show message if no past events are available ?>
            <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400 text-xl">
                <?php echo __('no_past_events'); ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php
require_once 'footer.php';<?php
require_once 'languages.php';
require_once 'events-list.php';

$wikiproject = getProject($currentDomain);
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>" dir="<?php echo htmlspecialchars($currentLang['text_direction']); ?>">
    <head>
    <meta charset="UTF-8">
    <title><?php echo __('sitename'); ?></title>
    <meta name="description" content="<?php echo __('site_description'); ?>">
    <meta name="keywords" content="<?php echo __('site_keywords'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/css/fonts/styles.css" rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/libs/font-awesome/all.min.css">
    <script src="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/js/tailwind.js"></script>
    <script src="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/assets/js/main.js"></script>
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
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
<!-- Hero Section -->
<?php
require_once 'header.php';
?>

<!-- Active Events Section -->
<section class="container mx-auto px-4 py-12">
    <h2 class="text-2xl font-bold mb-8 text-center"><?php echo __('active_events'); ?></h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <?php 
        $hasActiveEvents = false; // Variable para verificar si hay eventos activos
        $currentDate = date('Y-m-d'); // Fecha actual
        
        foreach ($events as $event): 
            // Verifica si el evento no ha terminado y pertenece al proyecto wiki correcto
            if (in_array($wikiproject, $event['wikis']) && strtotime($event['end_date']) >= strtotime($currentDate)): 
                $hasActiveEvents = true; // Se encontró al menos un evento activo
        ?>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <?php if (!empty($event['event_image'])): ?>
                        <img src="<?php echo htmlspecialchars($event['event_image']); ?>" 
                             alt="<?php echo htmlspecialchars($event['name']); ?>" 
                             class="w-full h-48 object-cover">
                    <?php endif; ?>
                    
                    <div class="p-6">
                        <h2 class="text-xl font-bold mb-2"><?php echo htmlspecialchars($event['name']); ?></h2>
                        
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p><?php echo date('M j', strtotime($event['start_date'])); ?> - 
                               <?php echo date('M j, Y', strtotime($event['end_date'])); ?></p>
                            <p><?php echo htmlspecialchars($event['location']); ?></p>
                        </div>
                        
                        <p class="text-gray-700 dark:text-gray-200 mb-4">
                            <?php echo htmlspecialchars($event['description']); ?>
                        </p>
                        
                        <a href="/event/<?php echo htmlspecialchars($event['slug']); ?>" 
                           class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                            <?php echo __('view_details'); ?>
                        </a>
                    </div>
                </div>
        <?php 
            endif; 
        endforeach; 
        ?>

        <?php if (!$hasActiveEvents): // Mostrar mensaje si no hay eventos activos ?>
            <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400 text-xl">
                <?php echo __('no_active_events'); ?>
            </div>
        <?php endif; ?>
    </div>
</section>


<!-- Past Events Section -->
<section class="container mx-auto px-4 py-12">
    <h2 class="text-2xl font-bold mb-8 text-center"><?php echo __('past_events'); ?></h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <?php 
        $hasPastEvents = false; // Variable para verificar si hay eventos pasados
        $currentDate = date('Y-m-d'); // Fecha actual
        
        foreach ($events as $event): 
            // Verifica si el evento ya ha terminado y pertenece al proyecto wiki correcto
            if (in_array($wikiproject, $event['wikis']) && strtotime($event['end_date']) < strtotime($currentDate)): 
                $hasPastEvents = true; // Se encontró al menos un evento pasado
        ?>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden opacity-80">
                    <?php if (!empty($event['event_image'])): ?>
                        <img src="<?php echo htmlspecialchars($event['event_image']); ?>" 
                             alt="<?php echo htmlspecialchars($event['name']); ?>" 
                             class="w-full h-48 object-cover">
                    <?php endif; ?>
                    
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="text-xl font-bold"><?php echo htmlspecialchars($event['name']); ?></h2>
                            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                <?php echo __('past'); ?>
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p><?php echo date('M j', strtotime($event['start_date'])); ?> - 
                               <?php echo date('M j, Y', strtotime($event['end_date'])); ?></p>
                            <p><?php echo htmlspecialchars($event['location']); ?></p>
                        </div>
                        
                        <p class="text-gray-700 dark:text-gray-200 mb-4">
                            <?php echo htmlspecialchars($event['description']); ?>
                        </p>
                        
                        <a href="/event/<?php echo htmlspecialchars($event['slug']); ?>" 
                           class="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                            <?php echo __('view_recap'); ?>
                        </a>
                    </div>
                </div>
        <?php 
            endif; 
        endforeach; 
        ?>

        <?php if (!$hasPastEvents): // Mostrar mensaje si no hay eventos pasados ?>
            <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400 text-xl">
                <?php echo __('no_past_events'); ?>
            </div>
        <?php endif; ?>
    </div>
</section>


<?php
require_once 'footer.php';
?>
</body>
</html>