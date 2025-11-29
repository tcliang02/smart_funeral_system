<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

try {
    // Get user_id from query parameter (optional, for filtering)
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

    // Query to get all tributes with voice models
    $query = "
        SELECT 
            t.tribute_id,
            t.deceased_name as name,
            t.birth_date as date_of_birth,
            t.death_date as date_of_death,
            t.photo_url as profile_picture,
            t.created_by,
            vm.voice_id,
            vm.elevenlabs_voice_id,
            vm.audio_sample_path,
            vm.status as voice_status,
            vm.created_at as voice_created_at,
            (SELECT COUNT(*) FROM memories_database WHERE tribute_id = t.tribute_id) as memory_count,
            (SELECT COUNT(*) FROM personality_traits WHERE tribute_id = t.tribute_id) as trait_count
        FROM tributes t
        INNER JOIN voice_models vm ON t.tribute_id = vm.tribute_id
        WHERE vm.status IN ('ready', 'processing', 'failed')
    ";

    // If user_id is provided, filter by tributes they created
    if ($user_id > 0) {
        $query .= " AND t.created_by = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
    } else {
        $query .= " ORDER BY vm.created_at DESC";
        $stmt = $conn->prepare($query);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $voiceMemorials = [];
    while ($row = $result->fetch_assoc()) {
        // Build full photo URL if photo_url exists
        $photoUrl = null;
        if (!empty($row['profile_picture'])) {
            // If it's already a full URL (starts with http), use it as is
            if (strpos($row['profile_picture'], 'http') === 0) {
                $photoUrl = $row['profile_picture'];
            } else {
                // The photos are stored in the root uploads folder, not backend/uploads
                $photoUrl = 'http://localhost/smart_funeral_system/' . $row['profile_picture'];
            }
        }

        $voiceMemorials[] = [
            'tribute_id' => $row['tribute_id'],
            'name' => $row['name'],
            'birth_date' => $row['date_of_birth'],
            'death_date' => $row['date_of_death'],
            'photo' => $photoUrl,
            'profile_picture' => $photoUrl,
            'voice_id' => $row['voice_id'],
            'elevenlabs_voice_id' => $row['elevenlabs_voice_id'],
            'audio_sample_path' => $row['audio_sample_path'],
            'voice_status' => $row['voice_status'],
            'memory_count' => (int)$row['memory_count'],
            'trait_count' => (int)$row['trait_count'],
            'setup_complete' => ((int)$row['memory_count'] > 0 || (int)$row['trait_count'] > 0),
            'created_at' => $row['voice_created_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'count' => count($voiceMemorials),
        'voice_memorials' => $voiceMemorials
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

