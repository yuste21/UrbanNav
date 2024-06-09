DROP TABLE urban_nav.accidentes;

USE urban_nav;

CREATE TABLE `accidentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `localizacion` varchar(255) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `alcohol` tinyint DEFAULT NULL,
  `drogas` tinyint DEFAULT NULL,
  `climaId` int NOT NULL,
  `sexoId` int NOT NULL,
  `lesividadeCodigo` int NOT NULL,
  `tipoAccidenteId` int NOT NULL,
  `tipoPersonaId` int NOT NULL,
  `tipoVehiculoId` int NOT NULL,
  `barrioId` int NOT NULL,
  PRIMARY KEY (`id`,`climaId`,`sexoId`,`lesividadeCodigo`,`tipoAccidenteId`,`tipoPersonaId`,`tipoVehiculoId`,`barrioId`),
  KEY `fk_accidentes_clima1_idx` (`climaId`),
  KEY `fk_accidentes_sexo1_idx` (`sexoId`),
  KEY `fk_accidentes_lesividad1_idx` (`lesividadeCodigo`),
  KEY `fk_accidentes_tipo_accidente1_idx` (`tipoAccidenteId`),
  KEY `fk_accidentes_tipo_persona1_idx` (`tipoPersonaId`),
  KEY `fk_accidentes_tipo_vehiculo1_idx` (`tipoVehiculoId`),
  KEY `fk_accidentes_barrio1_idx` (`barrioId`),
  CONSTRAINT `fk_accidentes_barrio1` FOREIGN KEY (`barrioId`) REFERENCES `barrios` (`id`),
  CONSTRAINT `fk_accidentes_clima1` FOREIGN KEY (`climaId`) REFERENCES `climas` (`id`),
  CONSTRAINT `fk_accidentes_lesividad1` FOREIGN KEY (`lesividadeCodigo`) REFERENCES `lesividades` (`codigo`),
  CONSTRAINT `fk_accidentes_sexo1` FOREIGN KEY (`sexoId`) REFERENCES `sexos` (`id`),
  CONSTRAINT `fk_accidentes_tipo_accidente1` FOREIGN KEY (`tipoAccidenteId`) REFERENCES `tipo_accidentes` (`id`),
  CONSTRAINT `fk_accidentes_tipo_persona1` FOREIGN KEY (`tipoPersonaId`) REFERENCES `tipo_personas` (`id`),
  CONSTRAINT `fk_accidentes_tipo_vehiculo1` FOREIGN KEY (`tipoVehiculoId`) REFERENCES `tipo_vehiculos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=104092 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
