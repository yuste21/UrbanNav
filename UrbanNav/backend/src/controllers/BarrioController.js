import { UTMtoGPS } from "./AccidenteController.js";
import { BarrioModel, DistritoModel } from "../models/DistritoModel.js";
import { calcularPuntoMedio, encontrarZona } from "./DistritoController.js";
import axios from "axios";
import csvParser from "csv-parser"; //Leer archivo csv
import { Op } from "sequelize";

//Para leer desde el directorio local
import fs from "fs";
import path from "path";

/**
 * Ejemplos de consultas con relaciones (Radares asociados a un barrio):
 * - Buscar por valor de un atributo
 *  const radaresActivos = await barrio.getRadares({
      where: {
        estado: 'activo', // Cambia esto según tus atributos de RadarModel
      },
    });

   - Buscar y ordenar por un atributo
    const radaresOrdenados = await barrio.getRadares({
      order: [['velocidadMaxima', 'DESC']], // Cambia esto según tus atributos de RadarModel
    });

   - Buscar y definir la cantidad maxima de filas que quieres obtener
    const primerosRadares = await barrio.getRadares({
      limit: 5, // Obtén los primeros 5 radares
    });

   - Buscar y obtener solo el valor de atributos concretos
    const radaresConNombres = await barrio.getRadares({
      attributes: ['nombre'], // Cambia esto según tus atributos de RadarModel
    });
 * 
 */

export const getAllBarrios = async (req, res) => {
  try {
    const barrio = await BarrioModel.findByPk(425);
    const radaresAsociados = await barrio.getRadares()

    res.json(radaresAsociados);
  } catch (error) {
    console.log("Error en la consulta getAllBarrios: ", error);
    res.status(500).json({ message: "Error en la consulta getAllBarrios" });
  }
};


export const leer_delimitaciones = async (req, res) => {
  try {
    const distritos = await DistritoModel.findAll();

    // URL del archivo JSON
    const url =
      "https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/Geojson/Barrios.json";

    // Realizar la solicitud HTTP para obtener el contenido del archivo JSON
    fetch(url)
      .then(async (response) => {
        // Verificar si la respuesta es exitosa (código de estado 200)
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const datos = data.features;

        // Iterar sobre los datos
        for (const el of datos) {
          const coordenadas = [];

          // Convertir las coordenadas UTM a latitud y longitud
          for (const coordenada of el.geometry.coordinates) {
            const res = UTMtoGPS(coordenada[0], coordenada[1]);
            coordenadas.push([res.latitude, res.longitude]);
          }

          const medio = calcularPuntoMedio(coordenadas);
          const distrito = encontrarZona(medio[0], medio[1], distritos);

          await BarrioModel.create({
            nombre: "",
            delimitaciones: coordenadas,
            distritoId: distrito.id,
          });
        }
      })
      .catch((error) => {
        // Manejar errores de la solicitud HTTP
        console.error("There was a problem with the fetch operation:", error);
      });
  } catch (error) {
    console.log("Error en la consulta leer_delimitaciones: ", error);
    res.status(500).json({ message: "Error al obtener leer_delimitaciones" });
  }
};


export const leer_nombres = async (req, res) => {
  try {
    const filePath = "C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/barrios/Barrios.csv";
    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    let i = 395;
    let promises = [];

    fileStream
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => {
        promises.push(updateBarrio(row.NOMBRE, i));
        i++;
      })
      .on("end", async () => {
        try {
          await Promise.all(promises);
          console.log("Procesamiento del CSV de barrios completo.");
          res.json("Barrios actualizados correctamente");
        } catch (error) {
          console.error("Error al actualizar los barrios:", error);
          res.status(500).json({ message: "Error al actualizar los barrios" });
        }
      });

    fileStream.on("error", (error) => {
      console.error("Error al leer el archivo CSV:", error);
      res.status(500).json({ message: "Error al leer el archivo CSV" });
    });
  } catch (error) {
    console.log("Error en la consulta leer_nombres: ", error);
    res.status(500).json({ message: "Error al obtener leer_nombres" });
  }
};

const updateBarrio = (nombre, id) => {
  return new Promise((resolve, reject) => {
    BarrioModel.update(
      { nombre: nombre },
      {
        where: { id: id }
      }
    )
      .then(() => {
        console.log(`Barrio con id ${id} actualizado`);
        resolve();
      })
      .catch((error) => {
        console.error(`Error al actualizar el barrio con id ${id}:`, error);
        reject(error);
      });
  });
};

//En el front llamare a estos metodos despues de haber aplicado el filtro y 
//esos datos filtrados son los que paso por el body (o sus ids)
export const getEstacionamientos = async(req, res) => {
  try {
    const { barrioId } = req.query
    var estacionamientosId = req.body

    const { barrio, estacionamientos} = await getEst(barrioId, estacionamientosId)
    
    res.json({ barrio, estacionamientos })
  } catch (error) {
    console.log("Error en la consulta getEstacionamientos: ", error);
    res.status(500).json({ message: "Error en la consulta getEstacionamientos" });
  }
}

export async function getEst(barrioId, estacionamientosId) {
  console.log('IDs recibidos:', estacionamientosId);
  console.log('Barrio ID:', barrioId);
  const barrio = await BarrioModel.findByPk(barrioId)
  if (!barrio) {
    throw new Error('Barrio no encontrado')
  }

  var estacionamientos
  if(estacionamientosId.length === 0) {
    estacionamientos = await barrio.getEstacionamientos()
  } else {
    estacionamientos = await barrio.getEstacionamientos({
      where: {
        id: {
          [Op.in]: estacionamientosId
        }
      }
    })
  }

  return { barrio, estacionamientos }
}

export const getAccidentes = async(req, res) => {
  try {
    const { barrioId } = req.query
    var accidentesId = req.body

    const { barrio, accidentes } = await getAcc(barrioId, accidentesId)

    res.json({ barrio, accidentes })
  } catch (error) {
    console.log("Error en la consulta getAccidentes: ", error);
    res.status(500).json({ message: "Error en la consulta getAccidentes" });
  }
}

export async function getAcc(barrioId, accidentesId) {
  console.log('IDs recibidos:', accidentesId);
  console.log('Barrio ID:', barrioId);
  const barrio = await BarrioModel.findByPk(barrioId)
  if (!barrio) {
    throw new Error('Barrio no encontrado')
  }

  var accidentes
  if(accidentesId.length === 0) {
    accidentes = await barrio.getAccidentes()
  } else {
    accidentes = await barrio.getAccidentes({
      where: {
        id: {
          [Op.in]: accidentesId
        }
      }
    })
  }

  return { barrio, accidentes }
}

export const getTrafico = async(req, res) => {
  try {
    const { barrioId } = req.query
    const trafico = req.body
    const id = parseInt(barrioId)
    const barrios = await BarrioModel.findAll()
    const barrio = await BarrioModel.findByPk(id)
    if (!barrio) {
      return res.status(404).json({ message: "Barrio no encontrado" });
    }

    var trafico_filtrado = []
    var media = 0
    trafico.forEach((el) => {
      var aux = encontrarZona(el.lat, el.lon, barrios)
      if(aux.id === id) {
        trafico_filtrado.push(el)
        media += el.media
      }
    })

    media = media / trafico_filtrado.length
    media = parseFloat(media.toFixed(2))

    res.json({ barrio, trafico_filtrado, media })
  } catch (error) {
    console.log("Error en la consulta getAccidentes: ", error);
    res.status(500).json({ message: "Error en la consulta getAccidentes" });
  }
}

export const getRadares = async(req, res) => {
  try {
    const { barrioId } = req.query
    const radaresId = req.body

    const { barrio, radares } = await getRad(barrioId, radaresId)

    res.json({ barrio, radares })

  } catch (error) {
    console.log("Error en la consulta getAccidentes: ", error);
    res.status(500).json({ message: "Error en la consulta getAccidentes" });
  }
}

export async function getRad(barrioId, radaresId) {
  console.log('IDs recibidos:', radaresId);
  console.log('Barrio ID:', barrioId);
  const barrio = await BarrioModel.findByPk(barrioId)
  if (!barrio) {
    throw new Error('Barrio no encontrado')
  }

  var radares
  if(radaresId.length === 0) {
    radares = await barrio.getRadares()
  } else {
    radares = await barrio.getRadares({
      where: {
        id: {
          [Op.in]: radaresId
        }
      }
    })
  }

  return { barrio, radares }
}