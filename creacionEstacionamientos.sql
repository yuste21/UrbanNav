DROP TABLE urban_nav.estacionamientos;

USE urban_nav;

CREATE TABLE `estacionamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `plazas` int DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `coloreId` int NOT NULL,
  `barrioId` int NOT NULL,
  `tipoEstacionamientoId` int NOT NULL,
  PRIMARY KEY (`id`,`coloreId`,`barrioId`,`tipoEstacionamientoId`),
  KEY `fk_estacionamientos_color1_idx` (`coloreId`),
  KEY `fk_estacionamientos_barrio1_idx` (`barrioId`),
  KEY `fk_estacionamientos_tipo_estacionamiento1_idx` (`tipoEstacionamientoId`),
  CONSTRAINT `fk_estacionamientos_barrio1` FOREIGN KEY (`barrioId`) REFERENCES `barrios` (`id`),
  CONSTRAINT `fk_estacionamientos_color1` FOREIGN KEY (`coloreId`) REFERENCES `colores` (`id`),
  CONSTRAINT `fk_estacionamientos_tipo_estacionamiento1` FOREIGN KEY (`tipoEstacionamientoId`) REFERENCES `tipo_estacionamientos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79472 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
