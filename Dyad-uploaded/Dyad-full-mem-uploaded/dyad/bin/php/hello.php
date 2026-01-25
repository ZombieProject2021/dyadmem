<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Разрешаем запросы из Electron/React

echo json_encode([
    "status" => "success",
    "message" => "Привет! PHP успешно работает через порт 8000",
    "php_version" => PHP_VERSION,
    "time" => date('Y-m-d H:i:s')
]);
?>
