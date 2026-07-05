-- Create database
CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;

-- Users table
CREATE TABLE IF NOT EXISTS `Users` (
    `id` CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'employee') DEFAULT 'employee',
    `department` VARCHAR(255),
    `designation` VARCHAR(255),
    `isActive` BOOLEAN DEFAULT TRUE,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (`email`),
    INDEX idx_users_role (`role`)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS `Tasks` (
    `id` CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `status` ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    `startDate` TIMESTAMP NOT NULL,
    `dueDate` TIMESTAMP NOT NULL,
    `fileAttachment` VARCHAR(255),
    `assignedToId` CHAR(36) NOT NULL,
    `assignedById` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`assignedToId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assignedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    INDEX idx_tasks_assigned_to (`assignedToId`),
    INDEX idx_tasks_status (`status`),
    INDEX idx_tasks_due_date (`dueDate`)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS `Notifications` (
    `id` CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    `message` TEXT NOT NULL,
    `type` ENUM('task_assigned', 'task_due', 'task_completed') NOT NULL,
    `isRead` BOOLEAN DEFAULT FALSE,
    `userId` CHAR(36) NOT NULL,
    `taskId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`taskId`) REFERENCES `Tasks`(`id`) ON DELETE CASCADE,
    INDEX idx_notifications_user (`userId`),
    INDEX idx_notifications_is_read (`isRead`)
);
