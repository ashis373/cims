<?php
require_once __DIR__ . '/../cors.php';

include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';
require_permission('dashboard');

// Period filter: '6months', 'this_year', 'last_year', 'yearly'
$period = $_GET['period'] ?? 'this_year';

try {
    $scopeWhere = get_candidate_scope_where('c');
    $stats = [];

    // Total
    $stats['total'] = (int)$conn->query("SELECT COUNT(*) FROM cims_candidates c WHERE $scopeWhere")->fetchColumn();

    // Active (Not inactive stages, not blacklisted)
    $stats['active'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage NOT IN ('Rejected', 'Offer Declined', 'No Show', 'Offer Expired') 
        AND c.isBlacklisted = 0
        AND $scopeWhere
    ")->fetchColumn();

    // New Applicants
    $stats['newApplicants'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'New Applicant' AND $scopeWhere
    ")->fetchColumn();

    // Scheduled
    $stats['scheduled'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'Interview Scheduled' AND $scopeWhere
    ")->fetchColumn();

    // Selected
    $stats['selected'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage IN ('Shortlisted', 'Interview Completed') AND $scopeWhere
    ")->fetchColumn();

    // Offers Released
    $stats['offersReleased'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'Offer Released' AND $scopeWhere
    ")->fetchColumn();

    // Offers Accepted
    $stats['offersAccepted'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'Offer Accepted' AND $scopeWhere
    ")->fetchColumn();

    // Offers Declined
    $stats['offersDeclined'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'Offer Declined' AND $scopeWhere
    ")->fetchColumn();

    // Offers Pending
    $stats['offersPending'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_candidate_offers o 
        JOIN cims_applications a ON o.application_id = a.id 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE o.offerStatus = 'Pending' AND $scopeWhere
    ")->fetchColumn();

    // Joined
    $stats['joined'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'Joined' AND $scopeWhere
    ")->fetchColumn();

    // Rejected
    $stats['rejected'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_candidate_rejections r 
        JOIN cims_candidates c ON r.candidate_id = c.id 
        WHERE r.type = 'Rejected' AND $scopeWhere
    ")->fetchColumn();

    // Blacklisted
    $stats['blacklisted'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_candidate_rejections r 
        JOIN cims_candidates c ON r.candidate_id = c.id 
        WHERE r.type = 'Blacklisted' AND $scopeWhere
    ")->fetchColumn();

    // No Show
    $stats['noShow'] = (int)$conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage = 'No Show' AND $scopeWhere
    ")->fetchColumn();

    // Dedicated Quick Stats
    $stats['quickStats'] = [
        'newCandidates' => (int)$stats['newApplicants'],
        'interviewsScheduled' => (int)$stats['scheduled'],
        'offersPending' => (int)$stats['offersPending'],
        'joined' => (int)$stats['joined'],
        'noShows' => (int)$stats['noShow'],
        'rejected' => (int)$stats['rejected']
    ];
    
    // Funnel Data
    $stages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled', 'Offer Released', 'Joined', 'Rejected', 'No Show', 'On Hold'];
    $funnel = [];
    foreach ($stages as $stage) {
        $stmt = $conn->prepare("
            SELECT COUNT(*) FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE a.stage = ? AND $scopeWhere
        ");
        $stmt->execute([$stage]);
        $funnel[$stage] = (int)$stmt->fetchColumn();
    }
    $stats['funnel'] = $funnel;

    // Build periods array based on selected filter
    $intervals = [];
    $currentYear = (int)date('Y');

    if ($period === 'last_year') {
        $targetYear = $currentYear - 1;
        for ($m = 1; $m <= 12; $m++) {
            $monthNum = str_pad($m, 2, '0', STR_PAD_LEFT);
            $monthStart = "$targetYear-$monthNum-01 00:00:00";
            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $m, $targetYear);
            $monthEnd = "$targetYear-$monthNum-$daysInMonth 23:59:59";
            $monthLabel = date('M', strtotime("$targetYear-$monthNum-01"));
            $intervals[] = ['label' => $monthLabel, 'start' => $monthStart, 'end' => $monthEnd];
        }
    } elseif ($period === 'yearly') {
        for ($y = $currentYear - 4; $y <= $currentYear; $y++) {
            $yearStart = "$y-01-01 00:00:00";
            $yearEnd = "$y-12-31 23:59:59";
            $intervals[] = ['label' => (string)$y, 'start' => $yearStart, 'end' => $yearEnd];
        }
    } elseif ($period === '6months') {
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = date('Y-m-01 00:00:00', strtotime("-$i months"));
            $monthEnd = date('Y-m-t 23:59:59', strtotime("-$i months"));
            $monthLabel = date('M', strtotime("-$i months"));
            $intervals[] = ['label' => $monthLabel, 'start' => $monthStart, 'end' => $monthEnd];
        }
    } else {
        // 'this_year' - 12 months of current year
        for ($m = 1; $m <= 12; $m++) {
            $monthNum = str_pad($m, 2, '0', STR_PAD_LEFT);
            $monthStart = "$currentYear-$monthNum-01 00:00:00";
            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $m, $currentYear);
            $monthEnd = "$currentYear-$monthNum-$daysInMonth 23:59:59";
            $monthLabel = date('M', strtotime("$currentYear-$monthNum-01"));
            $intervals[] = ['label' => $monthLabel, 'start' => $monthStart, 'end' => $monthEnd];
        }
    }

    $trend = [];
    foreach ($intervals as $inv) {
        $start = $inv['start'];
        $end = $inv['end'];
        $label = $inv['label'];

        // 1. Applied
        $appliedStmt = $conn->prepare("
            SELECT COUNT(*) FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE a.appliedAt >= ? AND a.appliedAt <= ? AND $scopeWhere
        ");
        $appliedStmt->execute([$start, $end]);
        $appliedCount = (int)$appliedStmt->fetchColumn();

        // 2. Interviews
        $interviewsStmt = $conn->prepare("
            SELECT COUNT(*) FROM cims_candidate_interviews i 
            JOIN cims_applications a ON i.application_id = a.id 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE ((i.interviewDate >= ? AND i.interviewDate <= ?) 
               OR (i.created_at >= ? AND i.created_at <= ?)) 
              AND $scopeWhere
        ");
        $interviewsStmt->execute([$start, $end, $start, $end]);
        $interviewsCount = (int)$interviewsStmt->fetchColumn();

        if ($interviewsCount === 0) {
            $interviewsStmt2 = $conn->prepare("
                SELECT COUNT(*) FROM cims_applications a 
                JOIN cims_candidates c ON a.candidate_id = c.id 
                WHERE a.stage IN ('HR Call Scheduled', 'Interview Scheduled', 'Interview Completed') 
                  AND a.appliedAt >= ? AND a.appliedAt <= ? AND $scopeWhere
            ");
            $interviewsStmt2->execute([$start, $end]);
            $interviewsCount = (int)$interviewsStmt2->fetchColumn();
        }

        // 3. Selected
        $selectedStmt = $conn->prepare("
            SELECT COUNT(*) FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE a.stage IN ('Shortlisted', 'Interview Completed', 'Offer Released', 'Offer Accepted', 'Joined') 
              AND a.appliedAt >= ? AND a.appliedAt <= ? AND $scopeWhere
        ");
        $selectedStmt->execute([$start, $end]);
        $selectedCount = (int)$selectedStmt->fetchColumn();

        // 4. Joined
        $joinedStmt = $conn->prepare("
            SELECT COUNT(*) FROM cims_candidate_offers o 
            JOIN cims_applications a ON o.application_id = a.id 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE ((o.joiningDate >= ? AND o.joiningDate <= ?) 
               OR (o.acceptedDate >= ? AND o.acceptedDate <= ? AND o.offerStatus = 'Joined'))
              AND $scopeWhere
        ");
        $joinedStmt->execute([$start, $end, $start, $end]);
        $joinedCount = (int)$joinedStmt->fetchColumn();

        if ($joinedCount === 0) {
            $joinedStmt2 = $conn->prepare("
                SELECT COUNT(*) FROM cims_applications a 
                JOIN cims_candidates c ON a.candidate_id = c.id 
                WHERE a.stage = 'Joined' AND a.appliedAt >= ? AND a.appliedAt <= ? AND $scopeWhere
            ");
            $joinedStmt2->execute([$start, $end]);
            $joinedCount = (int)$joinedStmt2->fetchColumn();
        }

        $trend[] = [
            'month' => $label,
            'applied' => $appliedCount,
            'interviews' => $interviewsCount,
            'selected' => $selectedCount,
            'joined' => $joinedCount
        ];
    }
    $stats['trend'] = $trend;
    $stats['period'] = $period;

    // Today's Schedule
    $scheduleStmt = $conn->prepare("
        SELECT 
            i.id,
            i.application_id,
            i.type,
            i.interviewDate,
            i.end_time,
            i.mode,
            i.interviewers,
            i.meeting_link,
            i.location,
            i.notes,
            i.status,
            a.candidate_id,
            a.role_applied,
            a.department,
            a.stage,
            c.name as candidate_name,
            c.email as candidate_email
        FROM cims_candidate_interviews i
        JOIN cims_applications a ON i.application_id = a.id
        JOIN cims_candidates c ON a.candidate_id = c.id
        WHERE DATE(i.interviewDate) = CURDATE() AND $scopeWhere
        ORDER BY i.interviewDate ASC
    ");
    $scheduleStmt->execute();
    $rawSchedule = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);

    $isUpcoming = false;
    if (empty($rawSchedule)) {
        // If no interviews today, fetch upcoming scheduled interviews
        $upcomingStmt = $conn->prepare("
            SELECT 
                i.id,
                i.application_id,
                i.type,
                i.interviewDate,
                i.end_time,
                i.mode,
                i.interviewers,
                i.meeting_link,
                i.location,
                i.notes,
                i.status,
                a.candidate_id,
                a.role_applied,
                a.department,
                a.stage,
                c.name as candidate_name,
                c.email as candidate_email
            FROM cims_candidate_interviews i
            JOIN cims_applications a ON i.application_id = a.id
            JOIN cims_candidates c ON a.candidate_id = c.id
            WHERE i.interviewDate >= CURDATE() AND $scopeWhere
            ORDER BY i.interviewDate ASC
            LIMIT 5
        ");
        $upcomingStmt->execute();
        $rawSchedule = $upcomingStmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($rawSchedule)) {
            $isUpcoming = true;
        }
    }

    $formattedSchedule = [];
    foreach ($rawSchedule as $row) {
        $ts = strtotime($row['interviewDate']);
        $timeStr = date('h:i', $ts);
        $ampm = date('A', $ts);
        
        $nameParts = preg_split('/\s+/', trim($row['candidate_name']));
        $initials = '';
        if (count($nameParts) >= 2) {
            $initials = strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[count($nameParts) - 1], 0, 1));
        } else if (count($nameParts) === 1 && strlen($nameParts[0]) > 0) {
            $initials = strtoupper(substr($nameParts[0], 0, min(2, strlen($nameParts[0]))));
        } else {
            $initials = 'CD';
        }

        $role = !empty($row['role_applied']) ? $row['role_applied'] : (!empty($row['department']) ? $row['department'] : 'Candidate');

        $formattedSchedule[] = [
            'id' => (int)$row['id'],
            'applicationId' => (int)$row['application_id'],
            'candidateId' => $row['candidate_id'],
            'candidateName' => $row['candidate_name'],
            'candidateEmail' => $row['candidate_email'],
            'initials' => $initials,
            'role' => $role,
            'type' => !empty($row['type']) ? $row['type'] : 'Technical Interview',
            'time' => $timeStr,
            'ampm' => $ampm,
            'rawDate' => $row['interviewDate'],
            'formattedDate' => date('M d, Y', $ts),
            'mode' => !empty($row['mode']) ? $row['mode'] : 'Online',
            'interviewers' => $row['interviewers'] ?? '',
            'meetingLink' => $row['meeting_link'] ?? '',
            'location' => $row['location'] ?? '',
            'notes' => $row['notes'] ?? '',
            'status' => $row['status'] ?? 'Scheduled',
            'isToday' => (date('Y-m-d', $ts) === date('Y-m-d'))
        ];
    }
    $stats['todaySchedule'] = $formattedSchedule;
    $stats['scheduleIsUpcoming'] = $isUpcoming;
    
    echo json_encode($stats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "An error occurred while fetching dashboard statistics."]);
}
