DROP TABLE urban_nav.aforos;

USE urban_nav;

CREATE TABLE `aforos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `estacion` int DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `trafico` json DEFAULT NULL,
  `orientacioneId` int NOT NULL,
  `barrioId` int NOT NULL,
  PRIMARY KEY (`id`,`orientacioneId`,`barrioId`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_aforos_orientacion1_idx` (`orientacioneId`),
  KEY `fk_aforos_barrio1_idx` (`barrioId`),
  CONSTRAINT `fk_aforos_barrio1` FOREIGN KEY (`barrioId`) REFERENCES `barrios` (`id`),
  CONSTRAINT `fk_aforos_orientacion1` FOREIGN KEY (`orientacioneId`) REFERENCES `orientaciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
