<?php
/**
 * Convert dataset JSON arrays to JSONL for fine-tuning
 *
 * Usage examples (Windows PowerShell):
 *   c:\xampp\php\php.exe backend\scripts\convert_to_jsonl.php --dataset=all --format=openai-chat
 *   c:\xampp\php\php.exe backend\scripts\convert_to_jsonl.php --dataset=grief_counselor --format=generic --out=backend\datasets-jsonl
 *
 * Supported formats:
 *   - generic: {"instruction":"...","response":"..."}
 *   - openai-chat: {"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

function println($msg = '') { echo $msg . PHP_EOL; }

$root = realpath(__DIR__ . '/..');
$datasetDir = $root . DIRECTORY_SEPARATOR . 'datasets';
$outDirDefault = $root . DIRECTORY_SEPARATOR . 'datasets-jsonl';
$configHumanized = $root . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'ai_prompts_humanized.json';
$configDefault = $root . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'ai_prompts.json';

// Parse CLI options
$longopts = [
    'dataset::',        // grief_counselor | website_helper | voice_memorial | all
    'format::',         // generic | openai-chat
    'out::',            // output directory
    'limit::',          // optional sample limit
    'include-system::', // true | false (only for openai-chat)
];
$options = getopt('', $longopts);

$datasetArg = strtolower($options['dataset'] ?? 'all');
$format = strtolower($options['format'] ?? 'openai-chat');
$outDir = $options['out'] ?? $outDirDefault;
$limit = isset($options['limit']) ? max(1, (int)$options['limit']) : null;
$includeSystem = true;
if (isset($options['include-system'])) {
    $val = strtolower((string)$options['include-system']);
    $includeSystem = !in_array($val, ['0','false','no','off'], true);
}

if (!is_dir($outDir)) {
    if (!mkdir($outDir, 0777, true)) {
        fwrite(STDERR, "Failed to create output directory: $outDir\n");
        exit(1);
    }
}

$datasets = [
    'grief_counselor' => $datasetDir . DIRECTORY_SEPARATOR . 'grief_counselor_dataset.json',
    'website_helper'  => $datasetDir . DIRECTORY_SEPARATOR . 'website_helper_dataset.json',
    'voice_memorial'  => $datasetDir . DIRECTORY_SEPARATOR . 'voice_memorial_dataset.json',
];

if (!in_array($datasetArg, array_keys($datasets)) && $datasetArg !== 'all') {
    println('Usage: php convert_to_jsonl.php --dataset={grief_counselor|website_helper|voice_memorial|all} --format={generic|openai-chat} [--out=path] [--limit=N] [--include-system=true|false]');
    exit(1);
}

// Load config to get system prompts
$configPath = file_exists($configHumanized) ? $configHumanized : (file_exists($configDefault) ? $configDefault : null);
$config = $configPath ? json_decode(file_get_contents($configPath), true) : null;

$modeMap = [
    'grief_counselor' => 'grief_counselor',
    'website_helper'  => 'website_helper',
    'voice_memorial'  => 'voice_memorial',
];

$convertedFiles = [];

$targets = $datasetArg === 'all' ? array_keys($datasets) : [$datasetArg];

foreach ($targets as $name) {
    $path = $datasets[$name];
    if (!file_exists($path)) {
        println("❌ Missing dataset: $path");
        continue;
    }

    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        println("❌ Invalid JSON in $path: " . json_last_error_msg());
        continue;
    }

    $total = count($data);
    $count = $limit ? min($limit, $total) : $total;

    // Determine system prompt for openai-chat
    $systemPrompt = null;
    if ($format === 'openai-chat' && $includeSystem && $config && isset($config['modes'][$modeMap[$name]]['system_prompt'])) {
        $systemPrompt = $config['modes'][$modeMap[$name]]['system_prompt'];
    }

    $outfile = $outDir . DIRECTORY_SEPARATOR . $name . '.' . str_replace('/', '-', $format) . '.jsonl';
    $fh = fopen($outfile, 'w');
    if (!$fh) {
        println("❌ Cannot write to $outfile");
        continue;
    }

    $written = 0;
    for ($i = 0; $i < $count; $i++) {
        $sample = $data[$i];
        if (!isset($sample['instruction']) || !isset($sample['response'])) continue;

        if ($format === 'generic') {
            $obj = [
                'instruction' => $sample['instruction'],
                'response'    => $sample['response'],
            ];
        } elseif ($format === 'openai-chat') {
            $messages = [];
            if ($systemPrompt) {
                $messages[] = ['role' => 'system', 'content' => $systemPrompt];
            }
            $messages[] = ['role' => 'user', 'content' => $sample['instruction']];
            $messages[] = ['role' => 'assistant', 'content' => $sample['response']];
            $obj = ['messages' => $messages];
        } else {
            // Fallback to generic
            $obj = [
                'instruction' => $sample['instruction'],
                'response'    => $sample['response'],
            ];
        }

        $line = json_encode($obj, JSON_UNESCAPED_UNICODE);
        if ($line === false) continue;
        fwrite($fh, $line . "\n");
        $written++;
    }

    fclose($fh);

    $convertedFiles[] = [
        'dataset' => $name,
        'input'   => $path,
        'output'  => $outfile,
        'total_samples' => $total,
        'written_lines' => $written,
        'format'  => $format,
    ];

    println("✅ Converted $name → $outfile ($written / $total lines)");
}

// Summary
println("\nSummary:");
foreach ($convertedFiles as $info) {
    println("- {$info['dataset']} -> {$info['output']} ({$info['written_lines']}/{$info['total_samples']})");
}

if (empty($convertedFiles)) {
    println('No files converted.');
    exit(1);
}

println("\nNext steps:");
println("- Upload the .jsonl file(s) to your fine-tuning provider.");
println("- Keep editing the original JSON arrays; re-run this script anytime to regenerate JSONL.");
