<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    ["id" => 1, "name" => "Иван Иванов", "email" => "ivan@example.com"],
    ["id" => 2, "name" => "Мария Петрова", "email" => "maria@example.com"],
    ["id" => 3, "name" => "PHP Server", "email" => "status@working.ok"]
]);
?>
