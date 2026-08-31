-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Database: cims
-- ------------------------------------------------------
-- Production Database Schema - Unified CIMS Structure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cims_users`
--
DROP TABLE IF EXISTS `cims_users`;
CREATE TABLE `cims_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `password_hashed` varchar(255) NOT NULL,
  `notification_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_preferences`)),
  `role_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_roles`
--
DROP TABLE IF EXISTS `cims_roles`;
CREATE TABLE `cims_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default roles
INSERT INTO `cims_roles` (`id`, `role_name`, `description`) VALUES 
(1, 'Administrator', 'Full system control'),
(2, 'HR Manager', 'Recruitment management, review and approval'),
(3, 'Recruiter', 'Day-to-day recruitment operations'),
(4, 'Hiring Manager', 'Candidate evaluation and hiring decision support');

--
-- Table structure for table `cims_permissions`
--
DROP TABLE IF EXISTS `cims_permissions`;
CREATE TABLE `cims_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `module_name` varchar(50) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_add` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_approve` tinyint(1) DEFAULT 0,
  `can_export` tinyint(1) DEFAULT 0,
  `scope` varchar(50) DEFAULT 'All', -- All, Assigned, Limited
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_module` (`role_id`,`module_name`),
  CONSTRAINT `fk_permission_role` FOREIGN KEY (`role_id`) REFERENCES `cims_roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidates`
--
DROP TABLE IF EXISTS `cims_candidates`;
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
  `assigned_recruiter_id` int(11) DEFAULT NULL,
  `assigned_hiring_manager_id` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_candidate` (`email`,`phone`),
  CONSTRAINT `fk_assigned_recruiter` FOREIGN KEY (`assigned_recruiter_id`) REFERENCES `cims_users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assigned_hm` FOREIGN KEY (`assigned_hiring_manager_id`) REFERENCES `cims_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_job_openings`
--
DROP TABLE IF EXISTS `cims_job_openings`;
CREATE TABLE `cims_job_openings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Open',
  `createdBy` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `cims_job_openings_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `cims_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_applications`
--
DROP TABLE IF EXISTS `cims_applications`;
CREATE TABLE `cims_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidate_id` varchar(50) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `role_applied` varchar(255) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `stage` varchar(100) DEFAULT 'New Applicant',
  `recruiter` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `stageReason` text DEFAULT NULL,
  `appliedAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `idx_applications_stage` (`stage`),
  KEY `idx_applications_candidate_id` (`candidate_id`),
  CONSTRAINT `cims_applications_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cims_applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `cims_job_openings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_blacklist_reasons`
--
DROP TABLE IF EXISTS `cims_blacklist_reasons`;
CREATE TABLE `cims_blacklist_reasons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reason_text` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_documents`
--
DROP TABLE IF EXISTS `cims_candidate_documents`;
CREATE TABLE `cims_candidate_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidate_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `uploadedBy` varchar(255) DEFAULT 'System',
  `uploadedAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_candidate_documents_candidate_id` (`candidate_id`),
  CONSTRAINT `cims_candidate_documents_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_history`
--
DROP TABLE IF EXISTS `cims_candidate_history`;
CREATE TABLE `cims_candidate_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidate_id` varchar(50) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `idx_candidate_history_candidate_id` (`candidate_id`),
  CONSTRAINT `cims_candidate_history_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cims_candidate_history_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `cims_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_interviews`
--
DROP TABLE IF EXISTS `cims_candidate_interviews`;
CREATE TABLE `cims_candidate_interviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `interviewDate` datetime NOT NULL,
  `feedback` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `idx_interview_date` (`interviewDate`),
  CONSTRAINT `cims_candidate_interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_notes`
--
DROP TABLE IF EXISTS `cims_candidate_notes`;
CREATE TABLE `cims_candidate_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidate_id` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `createdBy` varchar(255) DEFAULT 'System',
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_candidate_notes_candidate_id` (`candidate_id`),
  CONSTRAINT `cims_candidate_notes_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_offers`
--
DROP TABLE IF EXISTS `cims_candidate_offers`;
CREATE TABLE `cims_candidate_offers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `offeredCtc` varchar(100) DEFAULT NULL,
  `offerDate` datetime DEFAULT NULL,
  `offerStatus` varchar(50) DEFAULT 'Pending',
  `acceptedDate` datetime DEFAULT NULL,
  `joiningDate` datetime DEFAULT NULL,
  `declinedReason` text DEFAULT NULL,
  `noJoinReason` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `cims_candidate_offers_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_candidate_rejections`
--
DROP TABLE IF EXISTS `cims_candidate_rejections`;
CREATE TABLE `cims_candidate_rejections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `candidate_id` varchar(50) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `recordedBy` varchar(255) DEFAULT NULL,
  `recordedAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `idx_candidate_rejections_candidate_id` (`candidate_id`),
  CONSTRAINT `cims_candidate_rejections_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `cims_candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cims_candidate_rejections_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `cims_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_company_settings`
--
DROP TABLE IF EXISTS `cims_company_settings`;
CREATE TABLE `cims_company_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `date_format` varchar(20) DEFAULT 'MM/DD/YYYY',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_departments`
--
DROP TABLE IF EXISTS `cims_departments`;
CREATE TABLE `cims_departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color_theme` varchar(255) DEFAULT 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-500/25',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_jobs`
--
DROP TABLE IF EXISTS `cims_jobs`;
CREATE TABLE `cims_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` varchar(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `openings` int(11) DEFAULT 1,
  `applications` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'Open',
  `date` varchar(20) NOT NULL,
  `author` varchar(100) NOT NULL,
  `job_type` varchar(50) DEFAULT 'Full Time',
  `work_mode` varchar(50) DEFAULT 'Hybrid',
  `min_exp` int(11) DEFAULT 0,
  `max_exp` int(11) DEFAULT 0,
  `min_salary` int(11) DEFAULT 0,
  `max_salary` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `target_date` varchar(50) DEFAULT '',
  `priority` varchar(20) DEFAULT 'Medium',
  `internal_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_recruitment_settings`
--
DROP TABLE IF EXISTS `cims_recruitment_settings`;
CREATE TABLE `cims_recruitment_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_period` int(11) DEFAULT 30,
  `max_rounds` int(11) DEFAULT 4,
  `auto_duplicate_check` tinyint(1) DEFAULT 1,
  `blacklist_approval` tinyint(1) DEFAULT 1,
  `offer_expiry_days` int(11) DEFAULT 7,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_rejection_reasons`
--
DROP TABLE IF EXISTS `cims_rejection_reasons`;
CREATE TABLE `cims_rejection_reasons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reason_text` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_recruiters`
--
DROP TABLE IF EXISTS `cims_recruiters`;
CREATE TABLE `cims_recruiters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_audit_logs`
--
DROP TABLE IF EXISTS `cims_audit_logs`;
CREATE TABLE `cims_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `log_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `cims_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_smtp_config`
--
DROP TABLE IF EXISTS `cims_smtp_config`;
CREATE TABLE `cims_smtp_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `host` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `encryption` varchar(10) DEFAULT 'tls',
  `from_name` varchar(255) NOT NULL,
  `from_email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default SMTP
INSERT INTO `cims_smtp_config` (`id`, `host`, `port`, `username`, `password`, `encryption`, `from_name`, `from_email`) VALUES
(1, 'smtp.gmail.com', 587, 'asghis@gmail.com', 'YOUR_16_CHARACTER_APP_PASSWORD', 'tls', 'CIMS Recruitment', 'asghis@gmail.com');

--
-- Table structure for table `cims_email_templates`
--
DROP TABLE IF EXISTS `cims_email_templates`;
CREATE TABLE `cims_email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `cims_email_logs`
--
DROP TABLE IF EXISTS `cims_email_logs`;
CREATE TABLE `cims_email_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `status` varchar(50) DEFAULT 'Sent',
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
