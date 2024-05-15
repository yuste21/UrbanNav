-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema urban_nav
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema urban_nav
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `urban_nav` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `urban_nav` ;

-- -----------------------------------------------------
-- Table `urban_nav`.`distritos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`distritos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` INT NULL DEFAULT NULL,
  `nombre` VARCHAR(45) NULL DEFAULT NULL,
  `delimitaciones` JSON NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 65
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`barrios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`barrios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(245) NULL DEFAULT NULL,
  `delimitaciones` JSON NULL DEFAULT NULL,
  `distritoId` INT NOT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`, `distritoId`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_barrio_distrito1_idx` (`distritoId` ASC) VISIBLE,
  CONSTRAINT `fk_barrio_distrito1`
    FOREIGN KEY (`distritoId`)
    REFERENCES `urban_nav`.`distritos` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 526
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`climas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`climas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `clima` ENUM('Despejado', 'Lluvia débil', 'Lluvia intensa', 'Nublado', 'Granizando', 'Se desconoce') NOT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`lesividades`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`lesividades` (
  `codigo` INT NOT NULL AUTO_INCREMENT,
  `tipo_lesion` ENUM('Atención en urgencias sin posterior ingreso', 'Ingreso inferior o igual a 24 horas', 'Ingreso superior a 24 horas', 'Fallecido 24 horas', 'Asistencia sanitaria ambulatoria con posterioridad', 'Asistencia sanitaria inmediata en centro de salud o mutua', 'Asistencia sanitaria sólo en el lugar del accidente', 'Sin asistencia sanitaria', 'Se desconoce') NULL DEFAULT NULL,
  `gravedad` ENUM('Ninguna', 'Leve', 'Grave', 'Fallecido') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  UNIQUE INDEX `id_UNIQUE` (`codigo` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 78
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`sexos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`sexos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sexo` ENUM('Hombre', 'Mujer', 'Desconocido') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`tipo_accidentes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`tipo_accidentes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_accidente` ENUM('colisión doble', 'colisión múltiple', 'alcance', 'choque contra obstáculo fijo', 'atropello a persona', 'vuelco', 'caída', 'otro') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`tipo_personas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`tipo_personas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_persona` ENUM('Conductor', 'Pasajero', 'Peatón', 'Testigo') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`tipo_vehiculos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`tipo_vehiculos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_vehiculo` ENUM('todo terreno', 'turismo', 'motocicleta hasta 125cc', 'furgoneta', 'vehículo articulado', 'autobús', 'camión rígido', 'ciclomotor', 'tractocamión', 'motocicleta más de 125cc', 'bicicleta', 'otros vehículos con motor', 'bicicleta EPAC', 'maquinaria de obras', 'VMU eléctrico', 'Se desconoce') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`accidentes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`accidentes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lat` FLOAT NULL DEFAULT NULL,
  `lon` FLOAT NULL DEFAULT NULL,
  `fecha` DATE NULL DEFAULT NULL,
  `hora` TIME NULL DEFAULT NULL,
  `localizacion` VARCHAR(255) NULL DEFAULT NULL,
  `edad` INT NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  `alcohol` TINYINT NULL DEFAULT NULL,
  `drogas` TINYINT NULL DEFAULT NULL,
  `climaId` INT NOT NULL,
  `sexoId` INT NOT NULL,
  `lesividadeCodigo` INT NOT NULL,
  `tipoAccidenteId` INT NOT NULL,
  `tipoPersonaId` INT NOT NULL,
  `tipoVehiculoId` INT NOT NULL,
  `barrioId` INT NOT NULL,
  PRIMARY KEY (`id`, `climaId`, `sexoId`, `lesividadeCodigo`, `tipoAccidenteId`, `tipoPersonaId`, `tipoVehiculoId`, `barrioId`),
  INDEX `fk_accidentes_clima1_idx` (`climaId` ASC) VISIBLE,
  INDEX `fk_accidentes_sexo1_idx` (`sexoId` ASC) VISIBLE,
  INDEX `fk_accidentes_lesividad1_idx` (`lesividadeCodigo` ASC) VISIBLE,
  INDEX `fk_accidentes_tipo_accidente1_idx` (`tipoAccidenteId` ASC) VISIBLE,
  INDEX `fk_accidentes_tipo_persona1_idx` (`tipoPersonaId` ASC) VISIBLE,
  INDEX `fk_accidentes_tipo_vehiculo1_idx` (`tipoVehiculoId` ASC) VISIBLE,
  INDEX `fk_accidentes_barrio1_idx` (`barrioId` ASC) VISIBLE,
  CONSTRAINT `fk_accidentes_barrio1`
    FOREIGN KEY (`barrioId`)
    REFERENCES `urban_nav`.`barrios` (`id`),
  CONSTRAINT `fk_accidentes_clima1`
    FOREIGN KEY (`climaId`)
    REFERENCES `urban_nav`.`climas` (`id`),
  CONSTRAINT `fk_accidentes_lesividad1`
    FOREIGN KEY (`lesividadeCodigo`)
    REFERENCES `urban_nav`.`lesividades` (`codigo`),
  CONSTRAINT `fk_accidentes_sexo1`
    FOREIGN KEY (`sexoId`)
    REFERENCES `urban_nav`.`sexos` (`id`),
  CONSTRAINT `fk_accidentes_tipo_accidente1`
    FOREIGN KEY (`tipoAccidenteId`)
    REFERENCES `urban_nav`.`tipo_accidentes` (`id`),
  CONSTRAINT `fk_accidentes_tipo_persona1`
    FOREIGN KEY (`tipoPersonaId`)
    REFERENCES `urban_nav`.`tipo_personas` (`id`),
  CONSTRAINT `fk_accidentes_tipo_vehiculo1`
    FOREIGN KEY (`tipoVehiculoId`)
    REFERENCES `urban_nav`.`tipo_vehiculos` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 153797
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`orientaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`orientaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orientacion` ENUM('Norte-Sur', 'Sur-Norte', 'Este-Oeste', 'Oeste-Este') NOT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`aforos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`aforos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NULL DEFAULT NULL,
  `estacion` INT NULL DEFAULT NULL,
  `lat` FLOAT NULL DEFAULT NULL,
  `lon` FLOAT NULL DEFAULT NULL,
  `nombre` VARCHAR(150) NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  `trafico` JSON NULL DEFAULT NULL,
  `orientacioneId` INT NOT NULL,
  `barrioId` INT NOT NULL,
  PRIMARY KEY (`id`, `orientacioneId`, `barrioId`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_aforos_orientacion1_idx` (`orientacioneId` ASC) VISIBLE,
  INDEX `fk_aforos_barrio1_idx` (`barrioId` ASC) VISIBLE,
  CONSTRAINT `fk_aforos_barrio1`
    FOREIGN KEY (`barrioId`)
    REFERENCES `urban_nav`.`barrios` (`id`),
  CONSTRAINT `fk_aforos_orientacion1`
    FOREIGN KEY (`orientacioneId`)
    REFERENCES `urban_nav`.`orientaciones` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 15807
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`calificaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`calificaciones` (
  `id` INT NOT NULL,
  `calificacion_multa` ENUM('LEVE', 'GRAVE', 'MUY GRAVE') NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`colores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`colores` (
  `id` INT NOT NULL,
  `color` ENUM('Verde', 'Azul', 'Naranja', 'Rojo', 'Amarillo', 'Negro', 'Morado', 'Azul marino') NOT NULL,
  `significado` ENUM('Residencial', 'Rotacional', 'Larga estancia', 'Ámbito sanitario', 'Minusválidos', 'Reserva motos', 'Carga y descarga', 'Alta rotación') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`tipo_estacionamientos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`tipo_estacionamientos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_estacionamiento` ENUM('Línea', 'Batería', 'Desconocido') NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`estacionamientos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`estacionamientos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lat` FLOAT NULL DEFAULT NULL,
  `lon` FLOAT NULL DEFAULT NULL,
  `plazas` INT NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  `coloreId` INT NOT NULL,
  `barrioId` INT NOT NULL,
  `tipoEstacionamientoId` INT NOT NULL,
  PRIMARY KEY (`id`, `coloreId`, `barrioId`, `tipoEstacionamientoId`),
  INDEX `fk_estacionamientos_color1_idx` (`coloreId` ASC) VISIBLE,
  INDEX `fk_estacionamientos_barrio1_idx` (`barrioId` ASC) VISIBLE,
  INDEX `fk_estacionamientos_tipo_estacionamiento1_idx` (`tipoEstacionamientoId` ASC) VISIBLE,
  CONSTRAINT `fk_estacionamientos_barrio1`
    FOREIGN KEY (`barrioId`)
    REFERENCES `urban_nav`.`barrios` (`id`),
  CONSTRAINT `fk_estacionamientos_color1`
    FOREIGN KEY (`coloreId`)
    REFERENCES `urban_nav`.`colores` (`id`),
  CONSTRAINT `fk_estacionamientos_tipo_estacionamiento1`
    FOREIGN KEY (`tipoEstacionamientoId`)
    REFERENCES `urban_nav`.`tipo_estacionamientos` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 127696
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`radares`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`radares` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lat` FLOAT NULL DEFAULT NULL,
  `lon` FLOAT NULL DEFAULT NULL,
  `sentido` VARCHAR(255) NULL DEFAULT NULL,
  `tipo` VARCHAR(255) NULL DEFAULT NULL,
  `createdAt` DATE NULL DEFAULT NULL,
  `updatedAt` DATE NULL DEFAULT NULL,
  `barrioId` INT NOT NULL,
  `numero` INT NULL DEFAULT NULL,
  `ubicacion` VARCHAR(235) NULL DEFAULT NULL,
  `pk` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`, `barrioId`),
  INDEX `fk_radares_barrio1_idx` (`barrioId` ASC) VISIBLE,
  CONSTRAINT `fk_radares_barrio1`
    FOREIGN KEY (`barrioId`)
    REFERENCES `urban_nav`.`barrios` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 87
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `urban_nav`.`multas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `urban_nav`.`multas` (
  `id` INT NOT NULL,
  `lat` FLOAT NULL DEFAULT NULL,
  `lon` FLOAT NULL DEFAULT NULL,
  `mes` INT NULL DEFAULT NULL,
  `año` INT NULL DEFAULT NULL,
  `hora` TIME NULL DEFAULT NULL,
  `coste` DOUBLE NULL DEFAULT NULL,
  `puntos` INT NULL DEFAULT NULL,
  `denunciante` VARCHAR(255) NULL DEFAULT NULL,
  `infraccion` VARCHAR(255) NULL DEFAULT NULL,
  `vel_limite` INT NULL DEFAULT NULL,
  `vel_circula` INT NULL DEFAULT NULL,
  `barrios_id` INT NOT NULL,
  `radares_id` INT NOT NULL,
  `calificaciones_id` INT NOT NULL,
  PRIMARY KEY (`id`, `barrios_id`, `calificaciones_id`),
  INDEX `fk_multas_barrios1_idx` (`barrios_id` ASC) VISIBLE,
  INDEX `fk_multas_radares1_idx` (`radares_id` ASC) VISIBLE,
  INDEX `fk_multas_calificaciones1_idx` (`calificaciones_id` ASC) VISIBLE,
  CONSTRAINT `fk_multas_barrios1`
    FOREIGN KEY (`barrios_id`)
    REFERENCES `urban_nav`.`barrios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_multas_radares1`
    FOREIGN KEY (`radares_id`)
    REFERENCES `urban_nav`.`radares` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_multas_calificaciones1`
    FOREIGN KEY (`calificaciones_id`)
    REFERENCES `urban_nav`.`calificaciones` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
