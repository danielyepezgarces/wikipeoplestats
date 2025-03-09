<?php
require_once 'header.php';

$events = include 'events-list.php';
?>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8"><?php echo __('events_title'); ?></h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($events as $event): ?>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <?php if ($event['event_image']): ?>
                    <img src="<?php echo $event['event_image']; ?>" 
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
                    
                    <a href="/event.php?slug=<?php echo $event['slug']; ?>" 
                       class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        <?php echo __('view_details'); ?>
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php
require_once 'footer.php';
?>