-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema red-face
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema red-face
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `red-face` DEFAULT CHARACTER SET utf8 ;
USE `red-face` ;

-- -----------------------------------------------------
-- Table `red-face`.`task`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `red-face`.`task` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `addTime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `startTime` TIMESTAMP NULL DEFAULT NULL,
  `endTime` TIMESTAMP NULL DEFAULT NULL,
  `taskName` VARCHAR(255) NULL DEFAULT NULL,
  `taskKey` VARCHAR(10) NULL DEFAULT NULL,
  `state` INT(3) NULL DEFAULT NULL,
  `serverHome` VARCHAR(255) NULL DEFAULT NULL,
  `configPath` VARCHAR(255) NULL DEFAULT NULL,
  `logPath` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1298
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
