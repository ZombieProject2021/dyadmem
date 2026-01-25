<?php
/**
 * MySQL Connection Test Script
 * Tests MySQL connectivity with provided credentials
 */

// Get connection details from command line arguments or use defaults
$host = $argv[1] ?? 'localhost';
$user = $argv[2] ?? 'root';
$pass = $argv[3] ?? '';
$db   = $argv[4] ?? '';
$port = $argv[5] ?? 3306;

echo "========================================\n";
echo "  MySQL Connection Test\n";
echo "========================================\n\n";

echo "Connection Parameters:\n";
echo "  Host: $host\n";
echo "  Port: $port\n";
echo "  User: $user\n";
echo "  Pass: " . (empty($pass) ? "(empty)" : "***") . "\n";
echo "  Database: " . (empty($db) ? "(none)" : $db) . "\n\n";

// Test 1: Check if mysqli extension is loaded
echo "[1/4] Checking mysqli extension...\n";
if (!extension_loaded('mysqli')) {
    echo "  ✗ mysqli extension not loaded!\n";
    echo "  Please enable mysqli in php.ini\n";
    exit(1);
}
echo "  ✓ mysqli extension loaded\n\n";

// Test 2: Try to connect
echo "[2/4] Connecting to MySQL server...\n";
$conn = @mysqli_connect($host, $user, $pass, '', $port);

if (!$conn) {
    echo "  ✗ Connection failed!\n";
    echo "  Error: " . mysqli_connect_error() . "\n";
    echo "  Error code: " . mysqli_connect_errno() . "\n\n";
    
    echo "Common issues:\n";
    echo "  - MySQL server is not running\n";
    echo "  - Wrong host or port\n";
    echo "  - Wrong username or password\n";
    echo "  - Firewall blocking connection\n";
    exit(1);
}
echo "  ✓ Connected successfully!\n\n";

// Test 3: Get server info
echo "[3/4] Server Information:\n";
echo "  Server version: " . mysqli_get_server_info($conn) . "\n";
echo "  Protocol version: " . mysqli_get_proto_info($conn) . "\n";
echo "  Host info: " . mysqli_get_host_info($conn) . "\n\n";

// Test 4: Test database selection (if provided)
if (!empty($db)) {
    echo "[4/4] Selecting database '$db'...\n";
    if (!mysqli_select_db($conn, $db)) {
        echo "  ✗ Database selection failed!\n";
        echo "  Error: " . mysqli_error($conn) . "\n";
        echo "  The database might not exist.\n";
        mysqli_close($conn);
        exit(1);
    }
    echo "  ✓ Database selected successfully!\n\n";
    
    // Try to list tables
    echo "Tables in database:\n";
    $result = mysqli_query($conn, "SHOW TABLES");
    if ($result) {
        $count = 0;
        while ($row = mysqli_fetch_array($result)) {
            echo "  - " . $row[0] . "\n";
            $count++;
        }
        if ($count === 0) {
            echo "  (no tables found)\n";
        }
        mysqli_free_result($result);
    }
} else {
    echo "[4/4] No database specified, skipping database test.\n";
}

mysqli_close($conn);

echo "\n========================================\n";
echo "  ✓ All tests passed!\n";
echo "========================================\n";
echo "\nMySQL connection is working correctly.\n";
echo "You can now use MySQL with Dyad.\n\n";

echo "Usage:\n";
echo "  php test-mysql.php [host] [user] [pass] [database] [port]\n\n";
echo "Example:\n";
echo "  php test-mysql.php localhost root mypassword mydb 3306\n";

exit(0);
?>
