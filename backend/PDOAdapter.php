<?php
/**
 * PDO Adapter for MySQLi Compatibility
 * 
 * This class allows existing MySQLi code to run on a PDO connection (e.g., for Supabase/PostgreSQL).
 * It mimics the MySQLi interface but delegates to PDO.
 */

class PDOAdapter {
    private $pdo;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }
    
    public function prepare($sql) {
        try {
            $stmt = $this->pdo->prepare($sql);
            return new PDOStatementAdapter($stmt);
        } catch (PDOException $e) {
            error_log("Prepare failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function query($sql) {
        try {
            $stmt = $this->pdo->query($sql);
            return new PDOStatementAdapter($stmt);
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function begin_transaction() {
        return $this->pdo->beginTransaction();
    }
    
    public function commit() {
        return $this->pdo->commit();
    }
    
    public function rollback() {
        return $this->pdo->rollBack();
    }
    
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
    
    // Magic getter for insert_id and error
    public function __get($name) {
        if ($name === 'insert_id') {
            return $this->pdo->lastInsertId();
        }
        if ($name === 'error') {
            $info = $this->pdo->errorInfo();
            return $info[2] ?? '';
        }
        if ($name === 'connect_error') {
            return null; // Connected successfully if we are here
        }
        return null;
    }
    
    public function close() {
        $this->pdo = null;
        return true;
    }
    
    // For direct PDO access if needed
    public function getPDO() {
        return $this->pdo;
    }
}

class PDOStatementAdapter {
    private $stmt;
    private $boundParams = [];
    
    public function __construct(PDOStatement $stmt) {
        $this->stmt = $stmt;
    }
    
    // Emulate bind_param
    public function bind_param($types, &...$vars) {
        // Clear previous bindings
        $this->boundParams = [];
        
        foreach ($vars as $i => &$var) {
            // PDO uses 1-based indexing for ? placeholders
            // We bind by reference to emulate MySQLi behavior
            $this->stmt->bindParam($i + 1, $var);
            $this->boundParams[] = &$var;
        }
        return true;
    }
    
    public function execute($params = null) {
        try {
            if ($params !== null) {
                return $this->stmt->execute($params);
            }
            return $this->stmt->execute();
        } catch (PDOException $e) {
            error_log("Execute failed: " . $e->getMessage());
            return false;
        }
    }
    
    // Emulate get_result (returns self as it's iterable)
    public function get_result() {
        return $this;
    }
    
    // Emulate fetch_assoc
    public function fetch_assoc() {
        return $this->stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Emulate fetch_array
    public function fetch_array() {
        return $this->stmt->fetch(PDO::FETCH_BOTH);
    }
    
    // Emulate fetch_all
    public function fetch_all($mode = PDO::FETCH_ASSOC) {
        return $this->stmt->fetchAll($mode);
    }
    
    // Emulate num_rows
    public function __get($name) {
        if ($name === 'num_rows') {
            return $this->stmt->rowCount();
        }
        if ($name === 'error') {
            $info = $this->stmt->errorInfo();
            return $info[2] ?? '';
        }
        return null;
    }
    
    // Forward other calls to PDOStatement
    public function __call($method, $args) {
        return call_user_func_array([$this->stmt, $method], $args);
    }
}
