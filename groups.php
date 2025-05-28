<?php
include 'languages.php'; // Cargar idiomas y traducciones

$project = $_GET['project'] ?? '';
$username = $_GET['username'] ?? '';
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';

// Buscar la fecha de creación del idioma/proyecto
$language = array_filter($languages, fn($lang) => strpos($project, $lang['code']) !== false);
$creation_date = !empty($language) ? reset($language)['creation_date'] : '';

if (empty($start_date)) $start_date = $creation_date;
if (empty($end_date)) $end_date = date('Y-m-d');

$url = "https://api.wikipeoplestats.org/v1/users/stats/{$project}/{$username}";
if ($start_date) {
    $url .= "/{$start_date}";
    if ($end_date) $url .= "/{$end_date}";
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["User-Agent: WikiPeopleStats/1.0"]
]);
$response = curl_exec($ch);
if (curl_errno($ch)) die("Error en la API: " . curl_error($ch));
curl_close($ch);

$data = json_decode($response, true);
if (isset($data['error']) && $data['error'] === 'No data found') {
    $totalPeople = $totalWomen = $totalMen = $otherGenders = 0;
    $errorMessage = __('coming_soon_tracking_wiki');
} else {
    $totalPeople = $data['totalPeople'] ?? 0;
    $totalWomen = $data['totalWomen'] ?? 0;
    $totalMen = $data['totalMen'] ?? 0;
    $otherGenders = $data['otherGenders'] ?? 0;
    $lastUpdated = $data['last_updated'] ?? 'N/A';

    $formattedProject = preg_replace('/^(.*?)(\.wiki|wiki)$/', '$1.wikipedia.org', $project);
    if (!preg_match('/\.wikipedia\.org$/', $formattedProject)) {
        $formattedProject .= '.org';
    }

    $errorMessage = $project === 'all'
        ? __('homepage_global_stats_credits')
        : sprintf(__('homepage_stats_credits'), $formattedProject) . ' - ' . __('homepage_stats_last_update') . ': ' . htmlspecialchars($lastUpdated);
}

$ratioWomen = $totalPeople > 0 ? ($totalWomen / $totalPeople) * 100 : 0;
$ratioMen = $totalPeople > 0 ? ($totalMen / $totalPeople) * 100 : 0;
$ratioOtherGenders = $totalPeople > 0 ? ($otherGenders / $totalPeople) * 100 : 0;

// Datos de grupo de comunidad
$members = [
    ['username' => 'Usuario 1', 'join_date' => '2023-01-01', 'member_type' => 'Afiliado'],
    ['username' => 'Usuario 2', 'join_date' => '2023-02-15', 'member_type' => 'Socio'],
    ['username' => 'Usuario 3', 'join_date' => '2023-03-30', 'member_type' => 'Afiliado'],
    ['username' => 'Usuario 4', 'join_date' => '2023-04-12', 'member_type' => 'Socio'],
    ['username' => 'Usuario 5', 'join_date' => '2023-05-25', 'member_type' => 'Afiliado'],
];
$group_name = "Wikimedia Argentina";
$admin_name = "Daniel YG";
$members_count = 125;
$group_description = "Wikimedia Argentina promueve la educación y el acceso a la cultura";
$creation_date = '2024-01-01';
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($username) . ' - ' . __('sitename'); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="assets/css/fonts/styles.css" rel="stylesheet">
    <link rel="stylesheet" href="libs/font-awesome/all.min.css">
    <script src="assets/js/tailwind.js"></script>
    <style>
        #members-modal { background-color: rgba(0,0,0,0.6); }
    </style>
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200">
<?php include 'header.php'; ?>

<main class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 w-full">
        <div class="relative">
            <div class="h-72 w-full bg-cover bg-center rounded-t-lg"
                 style="background-image: url('https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg'); background-position: bottom;">
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-6">
                    <p class="text-lg mt-2"><?php echo $group_description; ?></p>
                </div>
                <div class="absolute bottom-2 right-4 bg-black/60 p-2 rounded-md text-sm text-white italic">
                    © Paula Kindsvater (CC-BY-SA 4.0)
                </div>
            </div>

            <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div class="h-36 w-36 rounded-full p-2 shadow-lg bg-gray-100 dark:bg-gray-700">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg"
                         alt="Group Avatar" class="h-full w-full rounded-full object-contain border-4 border-gray-900 dark:border-gray-100">
                </div>
            </div>
        </div>

        <div class="mt-20 text-center px-6">
            <h2 class="text-3xl font-bold mb-4"><?php echo $group_name; ?></h2>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div><strong><?php echo __('group_admin'); ?>:</strong> <?php echo $admin_name; ?></div>
                <div><strong><?php echo __('members_count'); ?>:</strong>
                    <span class="cursor-pointer text-blue-600" onclick="openModal()"><?php echo $members_count; ?></span>
                </div>
                <div><strong><?php echo __('creation_date'); ?>:</strong> <?php echo $creation_date; ?></div>
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
            <button onclick="closeModal()" class="text-gray-600 dark:text-gray-300">&times;</button>
        </div>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            <?php foreach ($members as $member): ?>
                <li class="py-2">
                    <strong><?php echo $member['username']; ?></strong> –
                    <?php echo $member['member_type']; ?> –
                    <span class="text-sm text-gray-500"><?php echo $member['join_date']; ?></span>
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
