<?php
include 'languages.php'; // Cargar idiomas y traducciones

// Grupos predefinidos
$groups = [
    'wikimedia-argentina' => [
        'group_name' => 'Wikimedia Argentina',
        'admin_name' => 'Daniel YG',
        'members_count' => 125,
        'group_description' => 'Wikimedia Argentina promueve la educación y el acceso a la cultura',
        'creation_date' => '2024-01-01',
        'banner_image' => 'https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg',
        'avatar_image' => 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg',
        'image_credit' => '© Paula Kindsvater (CC-BY-SA 4.0)',
        'members' => [
            ['username' => 'Usuario 1', 'join_date' => '2023-01-01', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 2', 'join_date' => '2023-02-15', 'member_type' => 'Socio'],
            ['username' => 'Usuario 3', 'join_date' => '2023-03-30', 'member_type' => 'Afiliado'],
            ['username' => 'Usuario 4', 'join_date' => '2023-04-12', 'member_type' => 'Socio'],
            ['username' => 'Usuario 5', 'join_date' => '2023-05-25', 'member_type' => 'Afiliado'],
        ],
        'stats' => [
            'totalPeople' => 342,
            'totalWomen' => 128,
            'totalMen' => 198,
            'otherGenders' => 16,
            'last_updated' => date('Y-m-d H:i:s')
        ]
    ],
];

// Obtener grupo solicitado
$slug = $_GET['slug'] ?? '';
if (!$slug || !array_key_exists($slug, $groups)) {
    header('Location: /groups/');
    exit;
}

$group = $groups[$slug];
$group_name = htmlspecialchars($group['group_name']);
$admin_name = htmlspecialchars($group['admin_name']);
$members_count = (int)$group['members_count'];
$group_description = htmlspecialchars($group['group_description']);
$creation_date = htmlspecialchars($group['creation_date']);
$members = $group['members'];
$banner_image = htmlspecialchars($group['banner_image']);
$avatar_image = htmlspecialchars($group['avatar_image']);
$image_credit = htmlspecialchars($group['image_credit']);

// Estadísticas
$totalPeople = $group['stats']['totalPeople'] ?? 0;
$totalWomen = $group['stats']['totalWomen'] ?? 0;
$totalMen = $group['stats']['totalMen'] ?? 0;
$otherGenders = $group['stats']['otherGenders'] ?? 0;
$lastUpdated = $group['stats']['last_updated'] ?? date('Y-m-d H:i:s');

// Calcular ratios
$ratioWomen = $totalPeople > 0 ? ($totalWomen / $totalPeople) * 100 : 0;
$ratioMen = $totalPeople > 0 ? ($totalMen / $totalPeople) * 100 : 0;
$ratioOtherGenders = $totalPeople > 0 ? ($otherGenders / $totalPeople) * 100 : 0;

// Mensaje de créditos
$errorMessage = sprintf(
    __('homepage_stats_credits'),
    $group_name
) . ' - ' . __('homepage_stats_last_update') . ': ' . htmlspecialchars($lastUpdated);
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang['code']; ?>" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $group_name . ' - ' . __('sitename'); ?></title>
    <meta name="description" content="<?php echo $group_description; ?>">
    
    <!-- Fuentes y estilos -->
    <link href="assets/css/fonts/styles.css" rel="stylesheet">
    <link rel="stylesheet" href="libs/font-awesome/all.min.css">
    <script src="assets/js/tailwind.js"></script>
    
    <!-- Gráficos -->
    <script src="https://tools-static.wmflabs.org/cdnjs/ajax/libs/apexcharts/3.54.0/apexcharts.min.js"></script>
    
    <style>
        #chartContainer { width: 100%; height: 400px; }
        .group-banner { height: 20rem; }
        .group-avatar { width: 9rem; height: 9rem; }
        
        @media (max-width: 640px) {
            .group-banner { height: 16rem; }
            .group-avatar { width: 7rem; height: 7rem; }
        }
        
        #members-modal {
            background-color: rgba(0,0,0,0.7);
            backdrop-filter: blur(5px);
        }
    </style>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
                            300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
                            600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af",
                            900: "#1e3a8a", 950: "#172554"
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300">
    <?php include 'header.php'; ?>
    
    <main class="container mx-auto px-4 py-8">
        <!-- Banner del grupo -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 overflow-hidden">
            <div class="relative group-banner w-full bg-cover bg-center" 
                 style="background-image: url('<?php echo $banner_image; ?>');">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-6 text-white">
                    <p class="text-lg md:text-xl"><?php echo $group_description; ?></p>
                </div>
                <div class="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-md text-sm text-white italic">
                    <?php echo $image_credit; ?>
                </div>
            </div>
            
            <!-- Avatar del grupo -->
            <div class="flex justify-center -mt-16">
                <div class="group-avatar rounded-full p-2 shadow-xl bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800">
                    <img src="<?php echo $avatar_image; ?>" 
                         alt="<?php echo __('group_avatar_alt', ['group' => $group_name]); ?>"
                         class="w-full h-full rounded-full object-cover">
                </div>
            </div>
            
            <!-- Información del grupo -->
            <div class="px-6 pb-8 pt-6 text-center">
                <h1 class="text-3xl font-bold mb-6"><?php echo $group_name; ?></h1>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <h3 class="text-xl font-semibold"><?php echo __('group_admin'); ?></h3>
                        <p class="text-lg"><?php echo $admin_name; ?></p>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold"><?php echo __('members_count'); ?></h3>
                        <p class="text-lg cursor-pointer text-primary-600 hover:text-primary-800 dark:hover:text-primary-400"
                           onclick="openModal()"><?php echo number_format($members_count); ?></p>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold"><?php echo __('creation_date'); ?></h3>
                        <p class="text-lg"><?php echo $creation_date; ?></p>
                    </div>
                </div>
                
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg shadow transition">
                        <?php echo __('join_group'); ?>
                    </button>
                    <button class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-lg shadow transition">
                        <?php echo __('view_details'); ?>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Estadísticas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                <i class="fas fa-users text-4xl text-primary-500 mb-3"></i>
                <h3 class="text-xl font-bold mb-2"><?php echo __('total_people'); ?></h3>
                <p class="text-3xl font-bold mb-1"><?php echo number_format($totalPeople); ?></p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                <i class="fas fa-female text-4xl text-pink-500 mb-3"></i>
                <h3 class="text-xl font-bold mb-2"><?php echo __('total_women'); ?></h3>
                <p class="text-3xl font-bold mb-1"><?php echo number_format($totalWomen); ?></p>
                <p class="text-gray-500 dark:text-gray-400"><?php echo number_format($ratioWomen, 1); ?>%</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                <i class="fas fa-male text-4xl text-blue-600 mb-3"></i>
                <h3 class="text-xl font-bold mb-2"><?php echo __('total_men'); ?></h3>
                <p class="text-3xl font-bold mb-1"><?php echo number_format($totalMen); ?></p>
                <p class="text-gray-500 dark:text-gray-400"><?php echo number_format($ratioMen, 1); ?>%</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                <i class="fas fa-genderless text-4xl text-purple-500 mb-3"></i>
                <h3 class="text-xl font-bold mb-2"><?php echo __('other_genders'); ?></h3>
                <p class="text-3xl font-bold mb-1"><?php echo number_format($otherGenders); ?></p>
                <p class="text-gray-500 dark:text-gray-400"><?php echo number_format($ratioOtherGenders, 1); ?>%</p>
            </div>
        </div>
        
        <!-- Gráfico -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-10">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold"><?php echo __('activity_over_time'); ?></h2>
                <button id="toggleChart" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm">
                    <?php echo __('show_cumulative'); ?>
                </button>
            </div>
            <div id="chartContainer"></div>
        </div>
        
        <!-- Créditos -->
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p class="text-gray-800 dark:text-gray-200"><?php echo $errorMessage; ?></p>
        </div>
    </main>
    
    <!-- Modal de miembros -->
    <div id="members-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center border-b dark:border-gray-700 p-4">
                <h3 class="text-2xl font-bold"><?php echo __('members_list'); ?></h3>
                <button onclick="closeModal()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
            </div>
            
            <div class="overflow-y-auto flex-1">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"><?php echo __('user'); ?></th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"><?php echo __('join_date'); ?></th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"><?php echo __('member_type'); ?></th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <?php foreach ($members as $member): ?>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                <?php echo htmlspecialchars($member['username']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <?php echo htmlspecialchars($member['join_date']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <?php echo htmlspecialchars($member['member_type']); ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            
            <div class="border-t dark:border-gray-700 p-4 text-right">
                <button onclick="closeModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm">
                    <?php echo __('close'); ?>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Selector de idioma -->
    <?php include 'languageselector.php'; ?>
    
    <script>
        // Modal functions
        function openModal() {
            document.getElementById('members-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal() {
            document.getElementById('members-modal').classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        // Gráfico
        let isCumulative = false;
        let chart;
        
        async function fetchData() {
            try {
                // Simulación de datos - en producción usaría la API real
                const mockData = {
                    data: [
                        { year: '2023', month: '01', total: 10, totalWomen: 3, totalMen: 6, otherGenders: 1 },
                        { year: '2023', month: '02', total: 15, totalWomen: 5, totalMen: 9, otherGenders: 1 },
                        { year: '2023', month: '03', total: 22, totalWomen: 8, totalMen: 12, otherGenders: 2 },
                        { year: '2023', month: '04', total: 30, totalWomen: 12, totalMen: 16, otherGenders: 2 },
                        { year: '2023', month: '05', total: 45, totalWomen: 18, totalMen: 24, otherGenders: 3 }
                    ]
                };
                
                createChart(mockData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        
        function createChart(data) {
            if (chart) chart.destroy();
            
            const options = {
                chart: {
                    type: 'line',
                    height: '100%',
                    toolbar: { show: true },
                    zoom: { enabled: true }
                },
                series: [
                    {
                        name: '<?php echo __('total_graph'); ?>',
                        data: isCumulative ? calculateCumulative(data, 'total') : data.map(d => d.total)
                    },
                    {
                        name: '<?php echo __('total_women'); ?>',
                        data: isCumulative ? calculateCumulative(data, 'totalWomen') : data.map(d => d.totalWomen)
                    },
                    {
                        name: '<?php echo __('total_men'); ?>',
                        data: isCumulative ? calculateCumulative(data, 'totalMen') : data.map(d => d.totalMen)
                    },
                    {
                        name: '<?php echo __('other_genders'); ?>',
                        data: isCumulative ? calculateCumulative(data, 'otherGenders') : data.map(d => d.otherGenders)
                    }
                ],
                xaxis: {
                    categories: data.map(d => `${d.year}-${d.month}`),
                    title: { text: '<?php echo __('month'); ?>' }
                },
                yaxis: { title: { text: '<?php echo __('quantity'); ?>' } },
                stroke: { curve: 'smooth', width: 3 },
                markers: { size: 5 },
                tooltip: { shared: true, intersect: false },
                legend: { position: 'top' },
                colors: ['#3b82f6', '#ec4899', '#3b82f6', '#a855f7']
            };
            
            chart = new ApexCharts(document.querySelector("#chartContainer"), options);
            chart.render();
        }
        
        function calculateCumulative(data, key) {
            let sum = 0;
            return data.map(item => {
                sum += item[key];
                return sum;
            });
        }
        
        // Event listeners
        document.getElementById('toggleChart').addEventListener('click', () => {
            isCumulative = !isCumulative;
            fetchData();
            document.getElementById('toggleChart').textContent = 
                isCumulative ? '<?php echo __('show_normal'); ?>' : '<?php echo __('show_cumulative'); ?>';
        });
        
        // Inicializar
        document.addEventListener('DOMContentLoaded', () => {
            fetchData();
            
            // Cerrar modal con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !document.getElementById('members-modal').classList.contains('hidden')) {
                    closeModal();
                }
            });
        });
    </script>
</body>
</html>