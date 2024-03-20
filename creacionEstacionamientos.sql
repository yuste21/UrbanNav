DROP TABLE urban_nav.estacionamientos;

USE urban_nav;

CREATE TABLE `estacionamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `distrito` varchar(255) DEFAULT NULL,
  `barrio` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `plazas` int DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31248 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
