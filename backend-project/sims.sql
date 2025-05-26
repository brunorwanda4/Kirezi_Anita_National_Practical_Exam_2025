DROP DATABASE IF EXISTS sims;
CREATE DATABASE IF NOT EXISTS sims;
USE sims;

-- Spare Part Table (updated)
CREATE TABLE `spare_parts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE `stock_in` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `spare_part_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `date` DATE NOT NULL DEFAULT CURRENT_DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts` (`id`) ON DELETE CASCADE
);

CREATE TABLE `stock_out` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `spare_part_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  `date` DATE NOT NULL DEFAULT CURRENT_DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts` (`id`) ON DELETE CASCADE
);

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
