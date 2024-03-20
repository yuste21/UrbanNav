DROP TABLE urban_nav.aforos;

USE urban_nav;
CREATE TABLE `aforos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `estacion` int DEFAULT NULL,
  `fsen` varchar(45) DEFAULT NULL,
  `orient` varchar(45) DEFAULT NULL,
  `hor1` int DEFAULT NULL,
  `hor2` int DEFAULT NULL,
  `hor3` int DEFAULT NULL,
  `hor4` int DEFAULT NULL,
  `hor5` int DEFAULT NULL,
  `hor6` int DEFAULT NULL,
  `hor7` int DEFAULT NULL,
  `hor8` int DEFAULT NULL,
  `hor9` int DEFAULT NULL,
  `hor10` int DEFAULT NULL,
  `hor11` int DEFAULT NULL,
  `hor12` int DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2618 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
