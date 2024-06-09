import RadarModel from "../models/RadarModel.js";

import axios from 'axios'
import proj4 from "proj4";
import csvParser from 'csv-parser'

//Para leer desde el directorio local
import fs from 'fs'
import path, { parse } from 'path'
import { BarrioModel, DistritoModel } from "../models/DistritoModel.js";
import { encontrarZona } from "../controllers/DistritoController.js"
import { Calificacion_MultaModel, MultaModel } from "../models/MultaModel.js";
import { Op, Sequelize, where } from "sequelize";

export const getAllRadares = async(req, res) => {
    try {
     const radares = await RadarModel.findAll({
        include: [
            {
                model: MultaModel,
                as: 'multas',
                include: [
                    {
                        model: Calificacion_MultaModel,
                        as: 'calificacione'
                    }
                ]
            }
        ]
     })

     /*let radaresMultas = []

     radares.forEach((radar) => {
        radaresMultas.push({
            'radar': radar.id,
            'multas': radar.multas.length
        })
     })*/
     
     res.json(radares[0])
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getAllRadares' })
        console.log('Error en la consulta getAllRadares: ', error)
    }
}

// export const filtro = async (req, res) => {
//     try {
//         const { puntosMin, puntosMax, calificacion, costeMin, costeMax } = req.query

//         let whereConditions = {}

//         if (puntosMin !== '' && puntosMax !== '') {
//             if (puntosMin === puntosMax) {
//                 whereConditions.puntos = puntosMax
//             } else {
//                 whereConditions.puntos = {
//                     [Op.between]: [puntosMin, puntosMax]
//                 }
//             }
//         } else if (puntosMin !== '') {
//             whereConditions.puntos = {
//                 [Op.gte]: puntosMin
//             }
//         } else if (puntosMax !== '') {
//             whereConditions.puntos = {
//                 [Op.lte]: puntosMax
//             }
//         }

//         if (costeMin !== '' && costeMax !== '') {
//             console.log('Entre costes = ' + costeMin + ' | ' + costeMax)
//             if (costeMin === costeMax) {
//                 whereConditions.puntos = costeMax
//             } else {
//                 whereConditions.puntos = {
//                     [Op.between]: [costeMin, costeMax]
//                 }
//             }
//         } else if (costeMin !== '') {
//             console.log('Coste min = ' + costeMin)
//             whereConditions.puntos = {
//                 [Op.gte]: costeMin
//             }
//         } else if (costeMax !== '') {
//             console.log('Coste max = ' + costeMax)
//             whereConditions.puntos = {
//                 [Op.lte]: costeMax
//             }
//         }

//         const includeOptions = [
//             {
//                 model: MultaModel,
//                 as: 'multas',
//                 include: [
//                     {
//                         model: Calificacion_MultaModel,
//                         as: 'calificacione',
//                         where: {}
//                     }
//                 ],
//                 where: whereConditions
//             }
//         ];

//         if (calificacion !== '') {
//             includeOptions[0].include[0].where.calificacion_multa = calificacion;
//         }

//         const radares = await RadarModel.findAll({
//             include: includeOptions,
//             attributes: {
//                 include: [
//                     [Sequelize.literal(`(
//                         SELECT COUNT(*)
//                         FROM multas AS multa
//                         WHERE
//                             multa.radarId = radares.id
//                     )`), 'totalMultas']
//                 ]
//             }
//         });
     

//         res.json(radares)
//     } catch (error) {
//         res.status(500).json({ message: 'Error en la consulta filtro radares' })
//         console.log('Error en la consulta filtro radares: ', error)
//     }   
// }

export const filtro = async (req, res) => {
    try {
        const { puntosMin, puntosMax, calificacion, costeMin, costeMax, horaMin, horaMax, descuento } = req.query

        let whereConditions = {}

        if (puntosMin !== '' && puntosMax !== '') {
            if (puntosMin === puntosMax) {
                whereConditions.puntos = puntosMax
            } else {
                whereConditions.puntos = {
                    [Op.between]: [puntosMin, puntosMax]
                }
            }
        } else if (puntosMin !== '') {
            whereConditions.puntos = {
                [Op.gte]: puntosMin
            }
        } else if (puntosMax !== '') {
            whereConditions.puntos = {
                [Op.lte]: puntosMax
            }
        }

        if (costeMin !== '' && costeMax !== '') {
            if (costeMin === costeMax) {
                whereConditions.coste = costeMax
            } else {
                whereConditions.coste = {
                    [Op.between]: [costeMin, costeMax]
                }
            }
        } else if (costeMin !== '') {
            whereConditions.coste = {
                [Op.gte]: costeMin
            }
        } else if (costeMax !== '') {
            whereConditions.coste = {
                [Op.lte]: costeMax
            }
        }

        if (horaMin !== '' && horaMax !== '') {
            if (horaMin === horaMax) {
                whereConditions.hora = horaMin
            } else {
                whereConditions.hora = {
                    [Op.between]: [horaMin, horaMax]
                }
            }
        } else if (horaMin !== '') {
            whereConditions.hora = {
                [Op.gte]: horaMin
            }
        } else if (horaMax !== '') {
            whereConditions.hora = {
                [Op.lte]: horaMax
            }
        }

        if (descuento !== '') {
            whereConditions.descuento = descuento
        }

        const includeOptions = [
            {
                model: MultaModel,
                as: 'multas',
                required: false,
                include: [
                    {
                        model: Calificacion_MultaModel,
                        as: 'calificacione',
                        where: {}
                    }
                ],
                where: whereConditions
            }
        ];

        if (calificacion !== '') {
            includeOptions[0].include[0].where.calificacion_multa = calificacion;
        }

        // const radaresBD = await RadarModel.findAll({
        //     include: includeOptions
        // });
     
        // var radares = []
        // var radaresId = []

        // radaresBD.forEach((radar) => {
        //     radaresId.push(radar.id)
        //     radares.push({
        //         'radar': radar,
        //         'multas': radar.multas.length
        //     })
        // })

        const distritos = await DistritoModel.findAll({
            include: [{
                model: BarrioModel,
                as: 'barrios',
                include: [{
                    model: RadarModel,
                    as: 'radares',
                    include: includeOptions
                }]
            }]
        })

        var barrios = []
        var radares = []
        distritos.forEach((distrito) => {
            barrios = barrios.concat(distrito.barrios)
            distrito.barrios.forEach((barrio) => {
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
        res.status(500).json({ message: 'Error en la consulta filtro radares' })
        console.log('Error en la consulta filtro radares: ', error)
    }   
}


/**
 * Estructura radares.csv:
 * {
  '"Nº\nRADAR"': '29',
  Ubicacion: 'A-5 PK 4+000, SENTIDO ENTRADA',
  'Carretara o vial': 'A5',
  'UBICACIÓN\nCalle 30': '',
  PK: 'P.K. 5+750 ----- P.K  4+000',
  Sentido: 'Entrada',
  Tipo: 'Entrada, radar de tramo',
  'X (WGS84)': '436722.693562517',
  'Y (WGS84)': '4473225.55366121',
  Longitud: '-3.74574755307117',
  Latitud: '40.4072412609861',
  Coordenadas: 'DGGVC'
 * }
 */

export const leerCSV_radar = async(req, res) => {
    try {
        const barrios = await BarrioModel.findAll()

        //Leemos csv de los radares
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300049-0-radares-fijos-moviles.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        response.data.pipe(csvParser({ separator: ';' }))
        */

        const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/radares.csv';

        // Leer el archivo CSV localmente
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        var n_radar = 1
        fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                //console.log(row)
                //console.log('Ubicacion = ' + row.Ubicacion)
                //console.log('PK = ' + row.PK)
                
                if(row.Latitud !== '') {
                    var latitude = parseFloat(row.Latitud)
                    var longitude = parseFloat(row.Longitud)
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if(barrio !== null) {
                        await RadarModel.create({
                            'lat': parseFloat(row.Latitud),
                            'lon': parseFloat(row.Longitud),
                            'sentido': row.Sentido,
                            'tipo': row.Tipo,
                            'barrioId': barrio.id,
                            'numero': n_radar,
                            'ubicacion': row.Ubicacion,
                            'pk': row.PK
                        })
                    }
                }
                
               n_radar++
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos completo.');
                res.json('Estacionamientos creados correctamente')
            })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta leerCSV_radar' })
        console.log('Error en la consulta leerCSV_radar: ', error)
    }
}