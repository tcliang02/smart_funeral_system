<?php
/**
 * Validate JSONL files: count lines and JSON-decode each line to ensure validity.
 *
 * Usage:
 *   c:\xampp\php\php.exe backend\scripts\validate_jsonl.php --file=backend\datasets-jsonl\grief_counselor.openai-chat.jsonl
 *   c:\xampp\php\php.exe backend\scripts\validate_jsonl.php --dir=backend\datasets-jsonl
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

function println($m=''){echo $m.PHP_EOL;}

$root = realpath(__DIR__ . '/..');
$defaultDir = $root . DIRECTORY_SEPARATOR . 'datasets-jsonl';

$options = getopt('', ['file::','dir::']);
$file = $options['file'] ?? null;
$dir = $options['dir'] ?? $defaultDir;

$targets = [];
if ($file) {
    $targets[] = $file;
} else {
    foreach (glob($dir . DIRECTORY_SEPARATOR . '*.jsonl') as $p) {
        $targets[] = $p;
    }
}

if (empty($targets)) {
    println('No JSONL files found to validate.');
    exit(1);
}

foreach ($targets as $path) {
    if (!file_exists($path)) { println("❌ File not found: $path"); continue; }

    $fh = fopen($path, 'r');
    $lineNum = 0; $ok = 0; $errors = 0; $firstErr = null;
    while (($line = fgets($fh)) !== false) {
        $lineNum++;
        $line = trim($line);
        if ($line === '') continue; // allow blank lines
        $decoded = json_decode($line, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $errors++;
            if ($firstErr === null) {
                $firstErr = ['line' => $lineNum, 'error' => json_last_error_msg()];
            }
        } else {
            $ok++;
        }
    }
    fclose($fh);

    println("\nFile: $path");
    println("- Lines: $lineNum");
    println("- Valid JSON objects: $ok");
    println("- Errors: $errors" . ($firstErr ? " (first at line {$firstErr['line']}: {$firstErr['error']})" : ''));
    println($errors === 0 ? '✅ VALID' : '❌ INVALID');
}
