<?php

class BaseController {
    protected $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    protected function getJsonInput() {
        return json_decode(file_get_contents("php://input"), true);
    }
}
