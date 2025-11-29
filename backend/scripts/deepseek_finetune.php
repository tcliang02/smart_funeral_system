<?php
/**
 * DeepSeek Fine-tuning Helper (OpenAI-compatible)
 *
 * Usage (PowerShell):
 *   $env:DEEPSEEK_API_KEY = "sk-..."
 *   # Optional: $env:DEEPSEEK_API_BASE = "https://api.deepseek.com"
 *
 *   # Create a job from a JSONL file (openai-chat format)
 *   c:\xampp\php\php.exe backend\scripts\deepseek_finetune.php --file=backend\datasets-jsonl\grief_counselor.openai-chat.jsonl --model=deepseek-chat --suffix=grief-v1 --poll=true
 *
 * Notes:
 * - This assumes DeepSeek exposes OpenAI-style endpoints:
 *   - POST   /v1/files  (multipart, purpose=fine-tune)
 *   - POST   /v1/fine_tuning/jobs  (JSON body)
 *   - GET    /v1/fine_tuning/jobs/{id}
 * - If your account uses different endpoints/fields, adjust --base accordingly.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

function println($m=''){ echo $m . PHP_EOL; }
function read_env($k,$d=null){ $v=getenv($k); return $v!==false?$v:$d; }

$options = getopt('', [
    'file:',        // required: path to JSONL
    'model:',       // required: base model, e.g., deepseek-chat
    'suffix::',     // optional job suffix
    'poll::',       // true|false (default false)
    'base::',       // override API base (default env or https://api.deepseek.com)
    'timeout::'     // poll timeout seconds (default 900)
]);

$apiKey  = read_env('DEEPSEEK_API_KEY');
$apiBase = rtrim($options['base'] ?? read_env('DEEPSEEK_API_BASE','https://api.deepseek.com'), '/');
$file    = $options['file'] ?? null;
$model   = $options['model'] ?? null;
$suffix  = $options['suffix'] ?? null;
$poll    = isset($options['poll']) ? !in_array(strtolower($options['poll']), ['0','false','no'], true) : false;
$timeout = isset($options['timeout']) ? max(30, (int)$options['timeout']) : 900;

if (!$apiKey) { println('❌ Missing DEEPSEEK_API_KEY environment variable'); exit(1); }
if (!$file || !file_exists($file)) { println('❌ --file is required and must exist'); exit(1); }
if (!$model) { println('❌ --model is required (e.g., deepseek-chat)'); exit(1); }

$root = realpath(__DIR__ . '/..');
$outDir = $root . DIRECTORY_SEPARATOR . 'fine-tune-jobs';
if (!is_dir($outDir)) mkdir($outDir, 0777, true);

function http_post_multipart($url, $headers, $fields) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $resp, $err];
}

function http_post_json($url, $headers, $body) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $headers[] = 'Content-Type: application/json';
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $resp, $err];
}

function http_get($url, $headers) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $resp, $err];
}

println('Uploading training file...');
$headers = [
    'Authorization: Bearer ' . $apiKey
];
$fields = [
    'purpose' => 'fine-tune',
    'file' => new CURLFile($file, 'application/jsonl', basename($file))
];

// Try multiple upload endpoints for compatibility
$uploadEndpoints = [
    $apiBase . '/v1/files',
    $apiBase . '/files'
];
$fileObj = null; $last = null;
foreach ($uploadEndpoints as $url) {
    [$code, $resp, $err] = http_post_multipart($url, $headers, $fields);
    $last = [$code, $resp, $err, $url];
    if ($err) { continue; }
    if ($code >= 200 && $code < 300) {
        $tmp = json_decode($resp, true);
        if (isset($tmp['id'])) { $fileObj = $tmp; break; }
        if (isset($tmp['data']['id'])) { $fileObj = $tmp['data']; break; }
    }
}
if (!$fileObj) {
    [$code, $resp, $err, $url] = $last;
    println('❌ Upload failed (last endpoint ' . $url . '): HTTP ' . $code . "\n" . $resp);
    if ($err) println('cURL error: ' . $err);
    exit(1);
}
println('✅ Uploaded file id: ' . $fileObj['id']);

println('Creating fine-tuning job...');
$jobBody = [
    'training_file' => $fileObj['id'],
    'model' => $model,
];
if ($suffix) $jobBody['suffix'] = $suffix;

// Try both new and legacy endpoints
$jobEndpoints = [
    $apiBase . '/v1/fine_tuning/jobs',
    $apiBase . '/v1/fine-tunes'
];
$job = null; $lastJob = null;
foreach ($jobEndpoints as $url) {
    [$code, $resp, $err] = http_post_json($url, $headers, $jobBody);
    $lastJob = [$code, $resp, $err, $url];
    if ($err) { continue; }
    if ($code >= 200 && $code < 300) {
        $tmp = json_decode($resp, true);
        if (isset($tmp['id'])) { $job = $tmp; break; }
        if (isset($tmp['data']['id'])) { $job = $tmp['data']; break; }
    }
}
if (!$job) {
    [$code, $resp, $err, $url] = $lastJob;
    println('❌ Create job failed (last endpoint ' . $url . '): HTTP ' . $code . "\n" . $resp);
    if ($err) println('cURL error: ' . $err);
    exit(1);
}
println('✅ Job created: ' . $job['id'] . ' (status: ' . ($job['status'] ?? 'unknown') . ')');

$stamp = date('Ymd_His');
file_put_contents($outDir . DIRECTORY_SEPARATOR . $stamp . '_job_created.json', json_encode($job, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));

if (!$poll) {
    println('Tip: Re-run with --poll=true to wait for completion.');
    exit(0);
}

println('Polling job status (timeout: ' . $timeout . 's)...');
$start = time();
$jobId = $job['id'];
$final = null;
while (true) {
    // Try both polling endpoints
    $pollUrls = [
        $apiBase . '/v1/fine_tuning/jobs/' . $jobId,
        $apiBase . '/v1/fine-tunes/' . $jobId,
    ];
    $st = null; $lastPoll = null;
    foreach ($pollUrls as $purl) {
        [$c2, $r2, $e2] = http_get($purl, $headers);
        $lastPoll = [$c2, $r2, $e2, $purl];
        if ($e2) { continue; }
        if ($c2 >= 200 && $c2 < 300) { $st = json_decode($r2, true); break; }
    }
    if (!$st) {
        [$c2, $r2, $e2, $purl] = $lastPoll;
        println('❌ Get job failed (last endpoint ' . $purl . '): HTTP ' . $c2 . "\n" . $r2);
        if ($e2) println('cURL error: ' . $e2);
        break;
    }
    $status = $st['status'] ?? 'unknown';
    println('• status: ' . $status);
    if (in_array($status, ['succeeded','failed','cancelled'], true)) { $final = $st; break; }
    if ((time() - $start) > $timeout) { println('⏱️ Timeout reached, stopping poll.'); break; }
    sleep(5);
}

if ($final) {
    file_put_contents($outDir . DIRECTORY_SEPARATOR . $stamp . '_job_final.json', json_encode($final, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
    println('Saved final job status.');
}

println('Done.');
