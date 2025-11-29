<?php
/**
 * Check what endpoints DeepSeek actually supports
 */

$apiKey = 'sk-3ff887b3eab042c9a3294fd3d62c8d80';
$base = 'https://api.deepseek.com';

$endpoints = [
    '/v1/models',
    '/models',
    '/v1/chat/completions',
    '/v1/files',
    '/files',
    '/v1/fine_tuning/jobs',
    '/v1/fine-tunes',
];

echo "Testing DeepSeek endpoints...\n\n";

foreach ($endpoints as $path) {
    $url = $base . $path;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $status = $code == 200 ? '✅ EXISTS' : 
              ($code == 404 ? '❌ NOT FOUND' : 
              ($code == 405 ? '⚠️ EXISTS (wrong method)' : 
              "⚠️ HTTP $code"));
    
    echo "$status - $url\n";
}

echo "\nConclusion:\n";
echo "- If /v1/chat/completions exists: Chat API works (already using this)\n";
echo "- If /v1/files or /v1/fine_tuning/jobs NOT FOUND: Fine-tuning not supported via API\n";
