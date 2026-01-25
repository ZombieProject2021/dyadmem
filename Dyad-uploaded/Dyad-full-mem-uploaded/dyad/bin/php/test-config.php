<?php
/**
 * PHP Configuration Test Script
 * Tests PHP installation and MySQL extensions
 */

echo "========================================\n";
echo "  PHP Configuration Test\n";
echo "========================================\n\n";

// Test 1: PHP Version
echo "[1/5] PHP Version:\n";
echo "  Version: " . PHP_VERSION . "\n";
echo "  Architecture: " . (PHP_INT_SIZE * 8) . "-bit\n";
echo "  Thread Safety: " . (PHP_ZTS ? "Enabled" : "Disabled") . "\n\n";

// Test 2: Configuration File
echo "[2/5] Configuration:\n";
$ini_file = php_ini_loaded_file();
if ($ini_file) {
    echo "  ✓ php.ini loaded: " . $ini_file . "\n";
} else {
    echo "  ✗ No php.ini loaded!\n";
}
echo "  Extension dir: " . ini_get('extension_dir') . "\n\n";

// Test 3: MySQL Extensions
echo "[3/5] MySQL Extensions:\n";
$mysql_extensions = ['mysqli', 'pdo_mysql', 'mysql'];
$loaded_count = 0;

foreach ($mysql_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "  ✓ $ext: Loaded\n";
        $loaded_count++;
    } else {
        echo "  ✗ $ext: Not loaded\n";
    }
}

if ($loaded_count === 0) {
    echo "\n  WARNING: No MySQL extensions loaded!\n";
    echo "  Please check php.ini configuration.\n";
}
echo "\n";

// Test 4: Important Extensions
echo "[4/5] Other Important Extensions:\n";
$important_extensions = ['curl', 'mbstring', 'openssl', 'json'];

foreach ($important_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "  ✓ $ext\n";
    } else {
        echo "  ✗ $ext (not loaded)\n";
    }
}
echo "\n";

// Test 5: Configuration Issues
echo "[5/5] Configuration Check:\n";
$issues = [];

// Check extension_dir
$ext_dir = ini_get('extension_dir');
if (strpos($ext_dir, 'E:\\') !== false || strpos($ext_dir, 'E:/') !== false) {
    $issues[] = "extension_dir contains absolute path (E:\\)";
}

// Check if mysqli is available
if (!extension_loaded('mysqli')) {
    $issues[] = "mysqli extension not loaded";
}

// Check if pdo_mysql is available
if (!extension_loaded('pdo_mysql')) {
    $issues[] = "pdo_mysql extension not loaded";
}

if (empty($issues)) {
    echo "  ✓ No configuration issues found!\n";
} else {
    echo "  Found " . count($issues) . " issue(s):\n";
    foreach ($issues as $issue) {
        echo "    - " . $issue . "\n";
    }
    echo "\n  Run setup-php.bat to fix these issues.\n";
}

echo "\n========================================\n";
echo "  Test Complete\n";
echo "========================================\n";

// Return exit code based on critical issues
if (!extension_loaded('mysqli') && !extension_loaded('pdo_mysql')) {
    exit(1); // Critical: No MySQL support
}

exit(0); // Success
?>
