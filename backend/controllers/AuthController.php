<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../helpers.php';

class AuthController extends BaseController {

    public function login() {
        $data = $this->getJsonInput();
        $username = sanitize($data["username"] ?? "");
        $password = $data["password"] ?? "";
        $role = sanitize($data["role"] ?? "");

        if (empty($username) || empty($password)) {
            return $this->jsonResponse(["success" => false, "message" => "Please fill in all fields."], 400);
        }

        try {
            // Query by role if provided
            if (!empty($role)) {
                $stmt = $this->conn->prepare("SELECT * FROM users WHERE name = :username AND role = :role");
                $stmt->execute(['username' => $username, 'role' => $role]);
            } else {
                $stmt = $this->conn->prepare("SELECT * FROM users WHERE name = :username");
                $stmt->execute(['username' => $username]);
            }
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user["password"])) {
                // Create user data for token
                $userData = [
                    "user_id" => $user["user_id"],
                    "name" => $user["name"],
                    "email" => $user["email"],
                    "role" => $user["role"]
                ];

                // Generate JWT token
                $token = generateToken($userData);

                // If provider, fetch their provider details
                $provider = null;
                if ($user["role"] === "provider") {
                    $provider = getProviderByUserId($this->conn, $user["user_id"]);
                }

                return $this->jsonResponse([
                    "success" => true,
                    "message" => "Login successful",
                    "token" => $token,
                    "user" => [
                        "user_id" => $user["user_id"],
                        "name" => $user["name"],
                        "role" => $user["role"],
                        "email" => $user["email"]
                    ],
                    "provider" => $provider
                ]);

            } else {
                return $this->jsonResponse(["success" => false, "message" => $user ? "Invalid password." : "User not found."], 401);
            }

        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return $this->jsonResponse(["success" => false, "message" => "Server error"], 500);
        }
    }

    public function register() {
        $data = $this->getJsonInput();
        $username = sanitize($data["username"] ?? "");
        $email = sanitize($data["email"] ?? "");
        $password = $data["password"] ?? "";
        $requestedRole = sanitize($data["role"] ?? "guest");

        $validRoles = ["family", "guest", "provider"];
        $role = in_array($requestedRole, $validRoles) ? $requestedRole : "guest";

        if (empty($username) || empty($email) || empty($password)) {
            return $this->jsonResponse(["success" => false, "message" => "All fields are required."], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->jsonResponse(["success" => false, "message" => "Invalid email format."], 400);
        }

        if (strlen($password) < 6) {
            return $this->jsonResponse(["success" => false, "message" => "Password must be at least 6 characters."], 400);
        }

        try {
            // Check if name or email already exists
            $check = $this->conn->prepare("SELECT * FROM users WHERE name = :username OR email = :email");
            $check->execute(['username' => $username, 'email' => $email]);
            
            if ($check->rowCount() > 0) {
                return $this->jsonResponse(["success" => false, "message" => "Username or email already exists."], 409);
            }

            // Secure password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Insert into users table
            $stmt = $this->conn->prepare("INSERT INTO users (name, email, password, role) VALUES (:username, :email, :password, :role)");
            $result = $stmt->execute([
                'username' => $username, 
                'email' => $email, 
                'password' => $hashed_password, 
                'role' => $role
            ]);

            if ($result) {
                $user_id = $this->conn->lastInsertId();

                // If service provider, insert into service_provider table
                if ($role === "provider") {
                    $provider_stmt = $this->conn->prepare("
                        INSERT INTO service_provider (user_id, company_name, phone, email, is_active)
                        VALUES (:user_id, :company_name, '', :email, 1)
                    ");
                    $provider_stmt->execute([
                        'user_id' => $user_id, 
                        'company_name' => $username, 
                        'email' => $email
                    ]);
                }

                return $this->jsonResponse(["success" => true]);
            } else {
                return $this->jsonResponse(["success" => false, "message" => "Registration failed."], 500);
            }

        } catch (Exception $e) {
            error_log("Register error: " . $e->getMessage());
            return $this->jsonResponse(["success" => false, "message" => "Server error: " . $e->getMessage()], 500);
        }
    }
}
