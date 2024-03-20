DROP TABLE urban_nav.accidentes;

USE urban_nav;

CREATE TABLE `accidentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `localizacion` varchar(255) DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `distrito` varchar(255) DEFAULT NULL,
  `accidente` varchar(255) DEFAULT NULL,
  `vehiculo` varchar(255) DEFAULT NULL,
  `persona` varchar(255) DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  `clima` varchar(255) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `lesividad` int DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `alcohol` tinyint DEFAULT NULL,
  `drogas` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54363 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
