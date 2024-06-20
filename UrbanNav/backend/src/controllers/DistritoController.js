import proj4 from "proj4";
import { UTMtoGPS } from "./AccidenteController.js";
import { BarrioModel, DistritoModel } from "../models/DistritoModel.js";
import { booleanPointInPolygon, point, polygon } from '@turf/turf'
import { getAcc, getEst, getRad } from "./BarrioController.js";
import { AccidenteModel, ClimaModel, LesividadModel, SexoModel, Tipo_AccidenteModel, Tipo_PersonaModel, Tipo_VehiculoModel } from "../models/AccidenteModel.js";
import { Op } from "sequelize";
import EstacionamientoModel, { ColorModel, Tipo_EstacionamientoModel } from "../models/EstacionamientoModel.js";
import { OrientacionModel, TraficoModel } from "../models/TraficoModel.js";
import { getEstaciones, traficoAux } from "./TraficoController.js";
import RadarModel from "../models/RadarModel.js";
import { MultaModel, Calificacion_MultaModel } from "../models/MultaModel.js";
import { accidentesAux } from "./AccidenteController.js";

export const getAllDistritos = async(req, res) => {
    try {
        const distritos = await DistritoModel.findAll()

        res.json(distritos)
    } catch (error) {
        console.log('Error en la consulta getAllDistritos: ', error)
        res.status(500).json({ message: 'Error en la consulta getAllDistritos' })
    }
}

export function calcularPuntoMedio(coordenadas) {
    if (coordenadas.length === 0) {
        return null;
    }

    // Sumar todas las coordenadas
    const sumaCoordenadas = coordenadas.reduce((acumulador, coordenada) => {
        return [acumulador[0] + coordenada[0], acumulador[1] + coordenada[1]];
    }, [0, 0]);

    // Calcular el promedio dividiendo la suma por la cantidad de coordenadas
    const puntoMedio = [
        sumaCoordenadas[0] / coordenadas.length,
        sumaCoordenadas[1] / coordenadas.length
    ];

    return puntoMedio;
}


export function encontrarZona(lat, lng, zonas) {
    const punto = point([lat, lng])
    for (const zona of zonas) {
        const pol = polygon([zona.delimitaciones])
        if(booleanPointInPolygon(punto, pol)) {
            return zona
        }
    }
    return null; // La ubicación no está dentro de ninguna zona
}

export const leer_delimitaciones = (req, res) => {
    try {
        // URL del archivo JSON
        const url = "https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Distritos/Geojson/Distritos.json";

        // Realizar la solicitud HTTP para obtener el contenido del archivo JSON
        fetch(url)
            .then((response) => {
                // Verificar si la respuesta es exitosa (código de estado 200)
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json()
            })
            .then((data) => {
                const datos = data.features
                var coordenadas
                datos.forEach(async (el) => {
                    coordenadas = []
                    el.geometry.coordinates.forEach((coordenada)=> {
                        res = UTMtoGPS(coordenada[0], coordenada[1])
                        coordenadas.push([res.latitude, res.longitude])
                    })

                    
                    await DistritoModel.create({
                        'codigo': (el.id+1),
                        'nombre': '',
                        delimitaciones: coordenadas
                    })
                })

                res.json('Distritos creados correctamente')
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

//---------------------------------ACCIDENTES---------------------------------

export const getAccidentesInicio = async(req, res) => {
    try {
        /**
         * En esta consulta:
         * - Ordeno los accidentes de manera descendente
         * - Obtengo los primeros barrios que tienen 10 de estos accidentes como minimo 
         * - Obtengo los distritos a los que pertenecen los barrios
         */
        const distritos_bd = await DistritoModel.findAll({
            include: [{
              model: BarrioModel,
              as: 'barrios',
              include: [{
                model: AccidenteModel,
                as: 'accidentes',
                order: [['fecha', 'DESC']],
                limit: 10,
                include: [
                    {
                        model: SexoModel,
                        as: 'sexo'
                    },
                    {
                        model: ClimaModel,
                        as: 'clima'
                    },
                    {
                        model: Tipo_AccidenteModel,
                        as: 'tipo_accidente'
                    },
                    {
                        model: Tipo_PersonaModel,
                        as: 'tipo_persona'
                    },
                    {
                        model: Tipo_VehiculoModel,
                        as: 'tipo_vehiculo'
                    },
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ]
              }]
            }]
          });

        var accidentesId = []
        distritos_bd.forEach((distrito) => {
            distrito.barrios.forEach((barrio) => {
                var aux = barrio.accidentes.map(el => el.id)
                accidentesId = accidentesId.concat(aux)
            })
        })

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getAccidentes de distrito' })
        console.log('Error en la consulta getAccidentes de distrito: ', error)
    }
}

export const prueba = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta prueba de distrito' })
        console.log('Error en la consulta getAccidentes de distrito: ', error)
    }
}


//---------------------------------TRAFICO---------------------------------

export const getTraficoInicio = async(req, res) => {
    try {
        const startDate = new Date('2023-12-01')
        const endDate = new Date('2023-12-31')

        // Encuentra la fecha mínima dentro del rango
        const traficoMin = await TraficoModel.findOne({
            order: [['fecha', 'ASC']],
            attributes: ['fecha'],
            limit: 1
        });

        // Encuentra la fecha máxima dentro del rango
        const traficoMax = await TraficoModel.findOne({
            order: [['fecha', 'DESC']],
            attributes: ['fecha'],
            limit: 1
        });

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                },
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'false', null, null)

        res.json({ distritos, barrios, estaciones_trafico, media_total, fechaMin: traficoMin.fecha, fechaMax: traficoMax.fecha, fechaInicioMin: '2023-12-01', fechaInicioMax: '2023-12-31' })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getTraficoInicio de distrito' })
        console.log('Error en la consulta getTraficoInicio de distrito: ', error)
    }
}

//---------------------------------ESTACIONAMIENTOS---------------------------------

export const getEstacionamientosInicio = async(req, res) => {
    try {
        /**
         * En esta consulta:
         * - Ordeno los accidentes de manera descendente
         * - Obtengo los primeros barrios que tienen 10 de estos accidentes como minimo 
         * - Obtengo los distritos a los que pertenecen los barrios
         */
        const distritosBD = await DistritoModel.findAll({
            include: [{
              model: BarrioModel,
              as: 'barrios',
              include: [{
                model: EstacionamientoModel,
                as: 'estacionamientos',
                limit: 10,
                include: [
                    {
                        model: ColorModel,
                        as: 'colore'
                    },
                    {
                        model: Tipo_EstacionamientoModel,
                        as: 'tipo_estacionamiento'
                    }
                ]
              }]
            }]
          });

          var distritos = []
          var estacionamientos = []
          var barrios = []
          distritosBD.forEach((distrito) => {
            var n_estacionamientos = 0
            barrios = barrios.concat(distrito.barrios)
            distrito.barrios.forEach((barrio) => {
                estacionamientos = estacionamientos.concat(barrio.estacionamientos)
                n_estacionamientos += barrio.estacionamientos.length
            })
            
            distritos.push({
                id: distrito.id,
                codigo: distrito.codigo,
                nombre: distrito.nombre,
                delimitaciones: distrito.delimitaciones,
                barrios: distrito.barrios,
                n_estacionamientos
            })
          })

        res.json({ distritos, barrios, estacionamientos })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getEstacionamientosInicio de distrito' })
        console.log('Error en la consulta getEstacionamientosInicio de distrito: ', error)
    }
}

//---------------------------------RADARES---------------------------------
export const getRadaresInicio = async(req, res) => {
    try {
        const distritos = await DistritoModel.findAll({
            include: [
                {
                    model: BarrioModel,
                    as: 'barrios',
                    include: [
                        {
                            model: RadarModel,
                            as: 'radares',
                            include: [
                                {
                                    model: MultaModel,
                                    as: 'multas',
                                    required: false,
                                    limit: 50,
                                    include: [
                                        {
                                            model: Calificacion_MultaModel,
                                            as: 'calificacione'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        var barrios = []
        var radares = []
        distritos.forEach((distrito) => {
            distrito.barrios.forEach((barrio) => {
                barrios.push(barrio)
                //radares = radares.concat(barrio.radares)
                barrio.radares.forEach((radar) => {
                    radares.push({
                        'radar': radar,
                        'multas': radar.multas.length
                    })
                })
            })
        })

        res.json({ distritos, barrios, radares })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getRadaresInicio de distrito' })
        console.log('Error en la consulta getRadaresInicio de distrito: ', error)
    }
}