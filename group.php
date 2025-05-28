<?php
include 'languages.php'; // Cargar idiomas y traducciones

// Definir base path dinámico para assets
$base_path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/';

// Obtener slug de URL amigable: /group/slug
$slug = $_GET['slug'] ?? '';

// Lista de grupos con datos dinámicos
$groups = [
    'wikimedia-argentina' => [
        'name' => 'Wikimedia Argentina',
        'admin' => 'Daniel YG',
        'members_count' => 125,
        'description' => 'Wikimedia Argentina promueve la educación y el acceso a la cultura',
        'creation_date' => '2024-01-01',
        'credits' => '© Paula Kindsvater (CC-BY-SA 4.0)',
        'cover_image' => 'https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg',
        'avatar' => 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg',
        'members' => [
            ['username' => 'Usuario 1', 'join_date' => '2023-01-01', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 2', 'join_date' => '2023-02-15', 'member_type' => 'Socio'],
            ['username' => 'Usuario 3', 'join_date' => '2023-03-30', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 4', 'join_date' => '2023-04-12', 'member_type' => 'Socio'],
            ['username' => 'Usuario 5', 'join_date' => '2023-05-25', 'member_type' => 'Afiliado'],
        ],
    ],
    // Puedes agregar más grupos aquí...
];

// Si no existe el slug o no se encuentra, redirigir a /groups/
if (!$slug || !isset($groups[$slug])) {
    header('Location: /groups/');
    exit;
}

$group = $groups[$slug];

// Aquí puedes agregar la lógica para obtener las estadísticas del usuario si quieres
// Por simplicidad, dejo estático el nombre y no uso API en este ejemplo

$currentLang = ['code' => 'es']; // Para el lang, podría venir de tu sistema de idiomas

function __($key) {
    // Aquí tu función de traducción; para demo simple devuelvo la clave
    $translations = [
        'sitename' => 'WikiPeopleStats',
        'group_admin' => 'Administrador',
        'members_count' => 'Miembros',
        'creation_date' => 'Fecha de creación',
        'join_group' => 'Unirse al grupo',
        'view_details' => 'Ver detalles',
        'members_list' => 'Lista de miembros',
        'close' => 'Cerrar',
    ];
    return $translations[$key] ?? $key;
}
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>">
<head>
    <meta charset="UTF-8" />
    <title><?php echo htmlspecialchars($group['name']); ?> - <?php echo __('sitename'); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="<?php echo $base_path; ?>assets/css/fonts/styles.css" rel="stylesheet" />
    <link rel="stylesheet" href="<?php echo $base_path; ?>libs/font-awesome/all.min.css" />
    <script src="<?php echo $base_path; ?>assets/js/tailwind.js"></script>
    <style>
        #members-modal { background-color: rgba(0,0,0,0.6); }
    </style>
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200">
<?php include 'header.php'; ?>

<main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 w-full relative">
        <div class="h-72 w-full bg-cover bg-center rounded-t-lg"
             style="background-image: url('<?php echo htmlspecialchars($group['cover_image']); ?>'); background-position: bottom;">
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-6">
                <p class="text-lg mt-2"><?php echo htmlspecialchars($group['description']); ?></p>
            </div>
            <div class="absolute bottom-2 right-4 bg-black/60 p-2 rounded-md text-sm text-white italic">
                <?php echo htmlspecialchars($group['credits']); ?>
            </div>
        </div>

        <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div class="h-36 w-36 rounded-full p-2 shadow-lg bg-gray-100 dark:bg-gray-700">
                <img src="<?php echo htmlspecialchars($group['avatar']); ?>" alt="Group Avatar"
                     class="h-full w-full rounded-full object-contain border-4 border-gray-900 dark:border-gray-100" />
            </div>
        </div>

        <div class="mt-20 text-center px-6">
            <h2 class="text-3xl font-bold mb-4"><?php echo htmlspecialchars($group['name']); ?></h2>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div><strong><?php echo __('group_admin'); ?>:</strong> <?php echo htmlspecialchars($group['admin']); ?></div>
                <div><strong><?php echo __('members_count'); ?>:</strong>
                    <span class="cursor-pointer text-blue-600" onclick="openModal()"><?php echo (int)$group['members_count']; ?></span>
                </div>
                <div><strong><?php echo __('creation_date'); ?>:</strong> <?php echo htmlspecialchars($group['creation_date']); ?></div>
            </div>

            <div class="mt-8 flex justify-center space-x-4">
                <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"><?php echo __('join_group'); ?></button>
                <button class="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"><?php echo __('view_details'); ?></button>
            </div>
        </div>
    </div>
</main>

<!-- Modal de Miembros -->
<div id="members-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-semibold"><?php echo __('members_list'); ?></h3>
            <button onclick="closeModal()" class="text-gray-600 dark:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            <?php foreach ($group['members'] as $member): ?>
                <li class="py-2">
                    <strong><?php echo htmlspecialchars($member['username']); ?></strong> –
                    <?php echo htmlspecialchars($member['member_type']); ?> –
                    <span class="text-sm text-gray-500"><?php echo htmlspecialchars($member['join_date']); ?></span>
                </li>
            <?php endforeach; ?>
        </ul>
        <div class="text-right mt-4">
            <button onclick="closeModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"><?php echo __('close'); ?></button>
        </div>
    </div>
</div>

<script>
function openModal() {
    document.getElementById('members-modal').classList.remove('hidden');
}
function closeModal() {
    document.getElementById('members-modal').classList.add('hidden');
}
</script>

</body>
</html>
