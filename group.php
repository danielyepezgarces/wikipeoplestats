<?php
include 'languages.php'; // Cargar idiomas y traducciones

// Obtener slug de URL, por ejemplo /group/slug
$slug = $_GET['slug'] ?? '';

// Simulación array de grupos (en producción esto viene de BD o API)
$groups = [
    'wikimedia-argentina' => [
        'name' => 'Wikimedia Argentina',
        'admin' => 'Daniel YG',
        'members_count' => 125,
        'description' => 'Wikimedia Argentina promueve la educación y el acceso a la cultura',
        'creation_date' => '2024-01-01',
        'cover' => 'https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg',
        'cover_credit' => '© Paula Kindsvater (CC-BY-SA 4.0)',
        'members' => [
            ['username' => 'Usuario 1', 'join_date' => '2023-01-01', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 2', 'join_date' => '2023-02-15', 'member_type' => 'Socio'],
            ['username' => 'Usuario 3', 'join_date' => '2023-03-30', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 4', 'join_date' => '2023-04-12', 'member_type' => 'Socio'],
            ['username' => 'Usuario 5', 'join_date' => '2023-05-25', 'member_type' => 'Afiliado'],
        ],
        'avatar' => 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg',
    ],

    // Aquí puedes agregar más grupos con sus slugs
];

// Si no existe slug o grupo no encontrado, redirigir a /groups/
if (!$slug || !isset($groups[$slug])) {
    header('Location: /groups/');
    exit;
}

$grupo = $groups[$slug];

// Variables de idioma para traducciones
$currentLang = $languages[0] ?? ['code' => 'es']; // ejemplo, el primero o español por defecto

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang['code']); ?>">
<head>
    <meta charset="UTF-8" />
    <title><?php echo htmlspecialchars($grupo['name']); ?> - <?php echo __('sitename'); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="assets/css/fonts/styles.css" rel="stylesheet" />
    <link rel="stylesheet" href="libs/font-awesome/all.min.css" />
    <script src="assets/js/tailwind.js"></script>
    <style>
        #members-modal {
            background-color: rgba(0, 0, 0, 0.6);
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200">
    <?php include 'header.php'; ?>

    <main class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 w-full relative">
            <!-- Portada con imagen de fondo -->
            <div class="relative h-72 w-full bg-cover bg-center rounded-t-lg"
                style="background-image: url('<?php echo htmlspecialchars($grupo['cover']); ?>'); background-position: bottom;">
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-6">
                    <p class="text-lg mt-2"><?php echo htmlspecialchars($grupo['description']); ?></p>
                </div>

                <!-- Créditos dinámicos -->
                <?php if (!empty($grupo['cover_credit'])): ?>
                    <div class="absolute bottom-2 right-4 bg-black/60 p-2 rounded-md text-sm text-white italic max-w-xs break-words">
                        <?php if (is_array($grupo['cover_credit']) && !empty($grupo['cover_credit']['text']) && !empty($grupo['cover_credit']['url'])): ?>
                            <a href="<?php echo htmlspecialchars($grupo['cover_credit']['url']); ?>" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">
                                <?php echo htmlspecialchars($grupo['cover_credit']['text']); ?>
                            </a>
                        <?php else: ?>
                            <?php echo htmlspecialchars(is_array($grupo['cover_credit']) ? json_encode($grupo['cover_credit']) : $grupo['cover_credit']); ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Avatar centrado -->
            <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div class="h-36 w-36 rounded-full p-2 shadow-lg bg-gray-100 dark:bg-gray-700">
                    <img src="<?php echo htmlspecialchars($grupo['avatar']); ?>"
                        alt="Group Avatar"
                        class="h-full w-full rounded-full object-contain border-4 border-gray-900 dark:border-gray-100" />
                </div>
            </div>

            <!-- Contenido debajo del avatar -->
            <div class="mt-20 text-center px-6 pb-8">
                <h2 class="text-3xl font-bold mb-4"><?php echo htmlspecialchars($grupo['name']); ?></h2>
                <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left sm:text-center max-w-md sm:max-w-none mx-auto">
                    <div><strong><?php echo __('group_admin'); ?>:</strong> <?php echo htmlspecialchars($grupo['admin']); ?></div>
                    <div>
                        <strong><?php echo __('members_count'); ?>:</strong>
                        <span
                            class="cursor-pointer text-blue-600 hover:underline"
                            onclick="openModal()"
                            role="button"
                            tabindex="0"
                            onkeypress="if(event.key==='Enter'){openModal();}"
                        >
                            <?php echo intval($grupo['members_count']); ?>
                        </span>
                    </div>
                    <div><strong><?php echo __('creation_date'); ?>:</strong> <?php echo htmlspecialchars($grupo['creation_date']); ?></div>
                </div>

                <div class="mt-8 flex justify-center space-x-4">
                    <button
                        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        type="button"
                    >
                        <?php echo __('join_group'); ?>
                    </button>
                    <button
                        class="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                        type="button"
                    >
                        <?php echo __('view_details'); ?>
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal de Miembros -->
    <div
        id="members-modal"
        class="hidden fixed inset-0 z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
        aria-labelledby="members-modal-title"
    >
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 id="members-modal-title" class="text-2xl font-semibold"><?php echo __('members_list'); ?></h3>
                <button
                    onclick="closeModal()"
                    class="text-gray-600 dark:text-gray-300 text-3xl leading-none hover:text-gray-900 dark:hover:text-white"
                    aria-label="<?php echo __('close'); ?>"
                >&times;</button>
            </div>
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <?php foreach ($grupo['members'] as $member): ?>
                    <li class="py-2">
                        <strong><?php echo htmlspecialchars($member['username']); ?></strong> –
                        <?php echo htmlspecialchars($member['member_type']); ?> –
                        <span class="text-sm text-gray-500"><?php echo htmlspecialchars($member['join_date']); ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
            <div class="text-right mt-4">
                <button
                    onclick="closeModal()"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                    type="button"
                >
                    <?php echo __('close'); ?>
                </button>
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
