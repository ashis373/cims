<?php
require_once __DIR__ . '/jwt_utils.php';

// Try to get token from Authorization header or cookie
$jwt = null;
$headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
if (!isset($headers['authorization']) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers['authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
}
if (!isset($headers['x-requested-with']) && isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    $headers['x-requested-with'] = $_SERVER['HTTP_X_REQUESTED_WITH'];
}
if (!isset($headers['x-csrf-token']) && isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
    $headers['x-csrf-token'] = $_SERVER['HTTP_X_CSRF_TOKEN'];
}
if (isset($headers['authorization']) && strpos($headers['authorization'], 'Bearer ') === 0) {
    $jwt = substr($headers['authorization'], 7);
} elseif (isset($_COOKIE['auth_token'])) {
    $jwt = $_COOKIE['auth_token'];
} elseif (isset($_GET['token']) && is_string($_GET['token'])) {
    $jwt = $_GET['token'];
}

$payload = false;
if ($jwt) {
    $payload = validate_jwt($jwt);
}



if (!$payload || !isset($payload['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid or expired token"]);
    exit;
}

global $conn;
if (!isset($conn)) {
    require_once __DIR__ . '/db.php';
}

// Check if token is revoked
if ($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) === 3) {
        $signature = $parts[2];
        $revokedStmt = $conn->prepare("SELECT id FROM cims_revoked_tokens WHERE token_signature = ?");
        $revokedStmt->execute([$signature]);
        if ($revokedStmt->fetchColumn()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Token has been revoked (logged out)"]);
            exit;
        }
    }
}

// Check if user is still active in database
$stmt = $conn->prepare("SELECT is_active FROM cims_users WHERE id = ?");
$stmt->execute([$payload['user_id']]);
$isActive = $stmt->fetchColumn();

if (!$isActive) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: Account deactivated"]);
    exit;
}

$currentUser = $payload['user_id'];

// Optional RBAC check
if (isset($allowed_roles) && is_array($allowed_roles) && count($allowed_roles) > 0) {
    $stmt = $conn->prepare("SELECT r.role_name FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$currentUser]);
    $userRole = $stmt->fetchColumn();
    
    if (!$userRole || !in_array($userRole, $allowed_roles)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "You do not have the required role to access this. Please contact the Administrator."]);
        exit;
    }
}

// CSRF Protection for Cookie-based requests on state-changing methods
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if (in_array($requestMethod, ['POST', 'PUT', 'DELETE', 'PATCH']) && !isset($headers['authorization']) && isset($_COOKIE['auth_token'])) {
    $hasCustomHeader = isset($headers['x-requested-with']) || isset($headers['x-csrf-token']);
    $secFetchSite = strtolower($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
    
    if (!$hasCustomHeader && !in_array($secFetchSite, ['same-origin', 'same-site', 'none'])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: CSRF check failed. Custom header required for cookie authentication."]);
        exit;
    }
}

// Backward compatibility: Optional Module Permission Check
if (isset($required_module)) {
    require_permission($required_module, isset($required_permission) ? str_replace('can_', '', $required_permission) : null);
}

function require_permission($module, $action = null) {
    global $conn, $currentUser, $moduleScope;
    
    if (!$action) {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        switch ($method) {
            case 'POST': $action = 'add'; break;
            case 'PUT': $action = 'edit'; break;
            case 'DELETE': $action = 'delete'; break;
            case 'GET': default: $action = 'view'; break;
        }
    }
    
    $stmt = $conn->prepare("SELECT r.role_name, r.is_system_admin, r.id as role_id FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$currentUser]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && ($user['is_system_admin'] == 1 || $user['role_name'] === 'Administrator')) {
        $moduleScope = 'All';
    } elseif ($user) {
        $permStmt = $conn->prepare("SELECT can_view, can_add, can_edit, can_delete, can_approve, can_export, scope FROM cims_permissions WHERE role_id = ? AND module_name = ?");
        $permStmt->execute([$user['role_id'], $module]);
        $perms = $permStmt->fetch(PDO::FETCH_ASSOC);
        
        $reqPerm = 'can_' . $action;
        
        if (!$perms || !isset($perms[$reqPerm]) || ($perms[$reqPerm] !== 1 && $perms[$reqPerm] !== "1")) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "You do not have access to perform this action ($action on $module). Please contact the Administrator."]);
            exit;
        }
        
        $moduleScope = $perms['scope'] ?? 'Assigned';
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
}

function get_candidate_scope_where($tableAlias = 'c') {
    global $moduleScope, $currentUser;
    if ($moduleScope === 'All') return '1=1';
    if ($moduleScope === 'None') return '1=0';
    $uid = (int)$currentUser;
    return "($tableAlias.assigned_recruiter_id = $uid OR $tableAlias.assigned_hiring_manager_id = $uid)";
}

function check_candidate_access($candidateId) {
    global $conn, $moduleScope, $currentUser;
    if ($moduleScope === 'All') return true;
    if ($moduleScope === 'None') return false;
    $stmt = $conn->prepare("SELECT assigned_recruiter_id, assigned_hiring_manager_id FROM cims_candidates WHERE id = ?");
    $stmt->execute([$candidateId]);
    $cand = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cand) return false;
    $uid = (int)$currentUser;
    return ($cand['assigned_recruiter_id'] == $uid || $cand['assigned_hiring_manager_id'] == $uid);
}
?>

