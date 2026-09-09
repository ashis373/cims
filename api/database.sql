-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 05, 2026 at 07:20 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cims`
--

-- --------------------------------------------------------

--
-- Table structure for table `cims_applications`
--

CREATE TABLE `cims_applications` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `role_applied` varchar(255) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `stage` varchar(100) DEFAULT 'New Applicant',
  `recruiter` varchar(255) DEFAULT NULL,
  `recruiter_id` int(11) DEFAULT NULL,
  `appliedAt` datetime DEFAULT current_timestamp(),
  `department` varchar(100) DEFAULT NULL,
  `stageReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_audit_logs`
--

CREATE TABLE `cims_audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `log_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_blacklist_reasons`
--

CREATE TABLE `cims_blacklist_reasons` (
  `id` int(11) NOT NULL,
  `reason_text` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidates`
--

CREATE TABLE `cims_candidates` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `alternateMobile` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `preferredLocation` varchar(255) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `relevantExperience` varchar(100) DEFAULT NULL,
  `currentCompany` varchar(255) DEFAULT NULL,
  `currentDesignation` varchar(255) DEFAULT NULL,
  `currentCtc` varchar(100) DEFAULT NULL,
  `expectedCtc` varchar(100) DEFAULT NULL,
  `noticePeriod` varchar(100) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `resume` text DEFAULT NULL,
  `linkedInProfile` varchar(255) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `isBlacklisted` tinyint(1) DEFAULT 0,
  `blacklistReason` text DEFAULT NULL,
  `blacklistDate` datetime DEFAULT NULL,
  `blacklistedBy` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_documents`
--

CREATE TABLE `cims_candidate_documents` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `uploadedBy` varchar(255) DEFAULT 'System',
  `uploadedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_history`
--

CREATE TABLE `cims_candidate_history` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_interviews`
--

CREATE TABLE `cims_candidate_interviews` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `interviewDate` datetime NOT NULL,
  `feedback` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  `end_time` datetime DEFAULT NULL,
  `mode` varchar(50) DEFAULT 'Online',
  `interviewers` text DEFAULT NULL,
  `meeting_link` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'Admin',
  `created_at` datetime DEFAULT current_timestamp(),
  `rating` int(11) DEFAULT NULL,
  `recommendation` varchar(50) DEFAULT NULL,
  `comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_notes`
--

CREATE TABLE `cims_candidate_notes` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `createdBy` varchar(255) DEFAULT 'System',
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_offers`
--

CREATE TABLE `cims_candidate_offers` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `offeredCtc` varchar(100) DEFAULT NULL,
  `offerDate` datetime DEFAULT NULL,
  `offerStatus` varchar(50) DEFAULT 'Pending',
  `acceptedDate` datetime DEFAULT NULL,
  `joiningDate` datetime DEFAULT NULL,
  `declinedReason` text DEFAULT NULL,
  `noJoinReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_candidate_rejections`
--

CREATE TABLE `cims_candidate_rejections` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `recordedAt` datetime DEFAULT current_timestamp(),
  `recordedBy` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_company_settings`
--

CREATE TABLE `cims_company_settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `date_format` varchar(20) DEFAULT 'MM/DD/YYYY'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_departments`
--

CREATE TABLE `cims_departments` (
  `id` int(11) NOT NULL,
  `dept_id` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `color_theme` varchar(255) DEFAULT 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-500/25',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_email_logs`
--

CREATE TABLE `cims_email_logs` (
  `id` int(11) NOT NULL,
  `recipient_email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `candidate_id` varchar(50) DEFAULT NULL,
  `status` enum('Delivered','Opened','Bounced','Processing','Failed') DEFAULT 'Processing',
  `error_message` text DEFAULT NULL,
  `unique_hash` varchar(64) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_email_queue`
--

CREATE TABLE `cims_email_queue` (
  `id` int(11) NOT NULL,
  `candidate_id` varchar(50) DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `sending_method` enum('Automatic','Manual') DEFAULT 'Manual',
  `unique_hash` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Processing','Sent','Failed') DEFAULT 'Pending',
  `attempts` int(11) DEFAULT 0,
  `max_attempts` int(11) DEFAULT 3,
  `last_error` text DEFAULT NULL,
  `scheduled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `worker_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_email_templates`
--

CREATE TABLE `cims_email_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `category` varchar(50) DEFAULT 'General',
  `trigger_event` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sending_method` varchar(20) DEFAULT 'Automatic'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_jobs`
--

CREATE TABLE `cims_jobs` (
  `id` int(11) NOT NULL,
  `job_id` varchar(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `openings` int(11) DEFAULT 1,
  `applications` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'Open',
  `date` varchar(20) NOT NULL,
  `author` varchar(100) NOT NULL,
  `recruiter` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `job_type` varchar(50) DEFAULT 'Full Time',
  `work_mode` varchar(50) DEFAULT 'Hybrid',
  `min_exp` int(11) DEFAULT 0,
  `max_exp` int(11) DEFAULT 0,
  `min_salary` int(11) DEFAULT 0,
  `max_salary` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `target_date` varchar(50) DEFAULT '',
  `priority` varchar(20) DEFAULT 'Medium',
  `internal_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_job_openings`
--

CREATE TABLE `cims_job_openings` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Open',
  `createdBy` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_permissions`
--

CREATE TABLE `cims_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `module_name` varchar(50) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_add` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_approve` tinyint(1) DEFAULT 0,
  `can_export` tinyint(1) DEFAULT 0,
  `scope` varchar(50) DEFAULT 'All'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_recruiters`
--

CREATE TABLE `cims_recruiters` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `createdAt` datetime DEFAULT current_timestamp(),
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_recruitment_settings`
--

CREATE TABLE `cims_recruitment_settings` (
  `id` int(11) NOT NULL,
  `notice_period` int(11) DEFAULT 30,
  `max_rounds` int(11) DEFAULT 4,
  `auto_duplicate_check` tinyint(1) DEFAULT 1,
  `blacklist_approval` tinyint(1) DEFAULT 1,
  `offer_expiry_days` int(11) DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_login_attempts`
--

CREATE TABLE `cims_login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `attempt_time` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ip_attempt` (`ip_address`, `attempt_time`),
  KEY `idx_email_attempt` (`email`, `attempt_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_rejection_reasons`
--

CREATE TABLE `cims_rejection_reasons` (
  `id` int(11) NOT NULL,
  `reason_text` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_revoked_tokens`
--

CREATE TABLE `cims_revoked_tokens` (
  `id` int(11) NOT NULL,
  `token_signature` varchar(255) NOT NULL,
  `revoked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_roles`
--

CREATE TABLE `cims_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_system_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_smtp_config`
--

CREATE TABLE `cims_smtp_config` (
  `id` int(11) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `encryption` varchar(20) DEFAULT 'tls',
  `from_name` varchar(100) NOT NULL,
  `from_email` varchar(100) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `worker_enabled` tinyint(1) DEFAULT 1,
  `last_worker_run` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cims_users`
--

CREATE TABLE `cims_users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `password_hashed` varchar(255) NOT NULL,
  `notification_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_preferences`)),
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `last_password_change` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cims_applications`
--
ALTER TABLE `cims_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `idx_applications_stage` (`stage`),
  ADD KEY `idx_applications_candidate_id` (`candidate_id`);

--
-- Indexes for table `cims_audit_logs`
--
ALTER TABLE `cims_audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_blacklist_reasons`
--
ALTER TABLE `cims_blacklist_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_candidates`
--
ALTER TABLE `cims_candidates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_candidate_documents`
--
ALTER TABLE `cims_candidate_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_candidate_documents_candidate_id` (`candidate_id`);

--
-- Indexes for table `cims_candidate_history`
--
ALTER TABLE `cims_candidate_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `idx_candidate_history_candidate_id` (`candidate_id`);

--
-- Indexes for table `cims_candidate_interviews`
--
ALTER TABLE `cims_candidate_interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `idx_interview_date` (`interviewDate`);

--
-- Indexes for table `cims_candidate_notes`
--
ALTER TABLE `cims_candidate_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_candidate_notes_candidate_id` (`candidate_id`);

--
-- Indexes for table `cims_candidate_offers`
--
ALTER TABLE `cims_candidate_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `cims_candidate_rejections`
--
ALTER TABLE `cims_candidate_rejections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `idx_candidate_rejections_candidate_id` (`candidate_id`);

--
-- Indexes for table `cims_company_settings`
--
ALTER TABLE `cims_company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_departments`
--
ALTER TABLE `cims_departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `cims_email_logs`
--
ALTER TABLE `cims_email_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_hash` (`unique_hash`);

--
-- Indexes for table `cims_email_queue`
--
ALTER TABLE `cims_email_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_unique_hash` (`unique_hash`);

--
-- Indexes for table `cims_email_templates`
--
ALTER TABLE `cims_email_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_jobs`
--
ALTER TABLE `cims_jobs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_job_openings`
--
ALTER TABLE `cims_job_openings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `createdBy` (`createdBy`);

--
-- Indexes for table `cims_permissions`
--
ALTER TABLE `cims_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_module` (`role_id`,`module_name`);

--
-- Indexes for table `cims_recruiters`
--
ALTER TABLE `cims_recruiters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- Indexes for table `cims_recruitment_settings`
--
ALTER TABLE `cims_recruitment_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_rejection_reasons`
--
ALTER TABLE `cims_rejection_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_revoked_tokens`
--
ALTER TABLE `cims_revoked_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_signature` (`token_signature`);

--
-- Indexes for table `cims_roles`
--
ALTER TABLE `cims_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `cims_smtp_config`
--
ALTER TABLE `cims_smtp_config`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cims_users`
--
ALTER TABLE `cims_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cims_applications`
--
ALTER TABLE `cims_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_audit_logs`
--
ALTER TABLE `cims_audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_blacklist_reasons`
--
ALTER TABLE `cims_blacklist_reasons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_documents`
--
ALTER TABLE `cims_candidate_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_history`
--
ALTER TABLE `cims_candidate_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_interviews`
--
ALTER TABLE `cims_candidate_interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_notes`
--
ALTER TABLE `cims_candidate_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_offers`
--
ALTER TABLE `cims_candidate_offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_candidate_rejections`
--
ALTER TABLE `cims_candidate_rejections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_company_settings`
--
ALTER TABLE `cims_company_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_departments`
--
ALTER TABLE `cims_departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_email_logs`
--
ALTER TABLE `cims_email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_email_queue`
--
ALTER TABLE `cims_email_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_email_templates`
--
ALTER TABLE `cims_email_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_jobs`
--
ALTER TABLE `cims_jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_job_openings`
--
ALTER TABLE `cims_job_openings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_permissions`
--
ALTER TABLE `cims_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_recruiters`
--
ALTER TABLE `cims_recruiters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_recruitment_settings`
--
ALTER TABLE `cims_recruitment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_rejection_reasons`
--
ALTER TABLE `cims_rejection_reasons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_revoked_tokens`
--
ALTER TABLE `cims_revoked_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_roles`
--
ALTER TABLE `cims_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_smtp_config`
--
ALTER TABLE `cims_smtp_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cims_users`
--
ALTER TABLE `cims_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cims_applications`
--
ALTER TABLE `cims_applications`
  ADD CONSTRAINT `cims_applications_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cims_applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `cims_job_openings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cims_candidate_documents`
--
ALTER TABLE `cims_candidate_documents`
  ADD CONSTRAINT `cims_candidate_documents_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cims_candidate_history`
--
ALTER TABLE `cims_candidate_history`
  ADD CONSTRAINT `cims_candidate_history_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cims_candidate_history_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `cims_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cims_candidate_interviews`
--
ALTER TABLE `cims_candidate_interviews`
  ADD CONSTRAINT `cims_candidate_interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cims_candidate_notes`
--
ALTER TABLE `cims_candidate_notes`
  ADD CONSTRAINT `cims_candidate_notes_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cims_candidate_offers`
--
ALTER TABLE `cims_candidate_offers`
  ADD CONSTRAINT `cims_candidate_offers_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cims_candidate_rejections`
--
ALTER TABLE `cims_candidate_rejections`
  ADD CONSTRAINT `cims_candidate_rejections_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cims_candidate_rejections_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cims_job_openings`
--
ALTER TABLE `cims_job_openings`
  ADD CONSTRAINT `cims_job_openings_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `cims_users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
