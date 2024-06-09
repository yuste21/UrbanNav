import axios from "axios";
import { Calificacion_MultaModel, MultaModel } from "../models/MultaModel.js";
import csvParser from "csv-parser";
import stream from 'stream'
import iconv from 'iconv-lite';
import fs from 'fs'
import { UTMtoGPS } from "./AccidenteController.js";
import { BarrioModel } from "../models/DistritoModel.js";
import { RadarModel } from "../models/RadarModel.js"
import { encontrarZona } from "./DistritoController.js";
import db from "../db.js";

export const getAllMultas = async(req, res) => {
    try {
        const multas = await MultaModel.findAll({
            include: [
                { model: BarrioModel, as: 'barrio' },
                { model: RadarModel, as: 'radare'},
                { model: Calificacion_MultaModel, as: 'calificacione' }
            ]
        })

        res.json(multas)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getAllMultas:' })
        console.log('Error en la consulta getAllMultas: ', error)
    }
}

/**
 * Formato csv multas:
 * {
  CALIFICACION: 'GRAVE     ',
  LUGAR: 'CARAB. ARAVACA - VILLAVICIOSA           ',
  MES: '12',
  ANIO: '2023',
  HORA: '11.48',
  IMP_BOL: ' 200.00',
  DESCUENTO: 'SI',
  ' PUNTOS': '4',
  DENUNCIANTE: 'MEDIOS DE CAPTACION DE IMAGEN ',
  'HECHO-BOL': 'REBASAR UN SEM�FORO EN FASE ROJA.                                                                                            ',        
  VEL_LIMITE: '   ',
  'VEL_CIRCULA ': '   ',
  'COORDENADA-X': '  434397.30',
  'COORDENADA-Y                                                                                                                                          ': ' 4472312.57'
}
 */

// export const leerMultasRadares = async(req, res) => {
//     try {
//         let batchCount = 0; // Contador de lotes
//         const batchSize = 50; // Tamaño del lote

//         //Lectura de la web
//         // const urlCSV = 'https://datos.madrid.es/egob/catalogo/210104-371-multas-circulacion-detalle.csv'
//         // const response = await axios.get(urlCSV, { responseType: 'arraybuffer' })
//         // const data = new TextDecoder('utf-8').decode(response.data)

//         // // Convertir la cadena 'data' en un flujo legible
//         // const readableStream = new stream.Readable();
//         // readableStream.push(data); // Agregar los datos decodificados al flujo
//         // readableStream.push(null); // Indicar el final del flujo

//         // readableStream.pipe(csvParser({ separator: ';' }))

//         //Lectura local (multas por partes)
//         const urlCSV = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Multas_Separado/Multas1.csv'
//         const response = fs.readFileSync(urlCSV);

//         const data = iconv.decode(response, 'latin1');
        
//         const barrios = await BarrioModel.findAll()

//         const readableStream = new stream.Readable();
//         readableStream.push(data); // Agregar los datos decodificados al flujo
//         readableStream.push(null); // Indicar el final del flujo
        
//         // Procesar el flujo del CSV como lo hacías antes
//         readableStream.pipe(csvParser({ separator: ';' }))
//             .on('data', async(row) => {
//                 //console.log(row)

//                 //Hago esto para obtener la coordenada y
//                 let cleanRow = {}
//                 Object.keys(row).forEach(key => {
//                     cleanRow[key.trim()] = row[key].trim()
//                 })

//                 var calificacionId
//                 var calificacion = (cleanRow.CALIFICACION);
//                 switch(calificacion) {
//                     case 'LEVE':
//                         calificacionId = 1
//                         break
//                     case 'GRAVE':
//                         calificacionId = 2
//                         break
//                     case 'MUY GRAVE':
//                         calificacionId = 3
//                         break
//                     default:
//                         calificacionId = 4
//                 }
                    
                    
//                 var lugar = (cleanRow.LUGAR);
                
//                 var mes, anio;
//                 mes = parseInt(cleanRow.MES);
//                 anio = parseInt(cleanRow.ANIO);
                
//                 var hora, fecha, aux;
//                 fecha = new Date();
//                 aux = (cleanRow.HORA).split('.');
//                 fecha.setHours(aux[0], aux[1], 0, 0);
//                 hora = `${fecha.getHours()}:${fecha.getMinutes()}`;
                
//                 var descuento = cleanRow.DESCUENTO === 'SI' ? true : false;
                
//                 var lat = cleanRow['COORDENADA-X'];
//                 var lon = cleanRow['COORDENADA-Y'];
//                 const { latitude, longitude } = UTMtoGPS(parseFloat(lat), parseFloat(lon));
                
//                 var coste = parseFloat(cleanRow.IMP_BOL);
                
//                 var puntos = parseInt(cleanRow.PUNTOS);
                
//                 var denunciante = cleanRow.DENUNCIANTE;
                
//                 var infraccion = cleanRow['HECHO-BOL'];
                
//                 //console.log('Calificacion = ' + calificacion);
//                 //console.log('CalificacionId = ' + calificacionId)
//                 //console.log('Lugar = ' + lugar);
//                 //console.log('Descuento = ' + descuento);
//                 //console.log('Latitude = ' + latitude + ' | Longitude = ' + longitude);
//                 //console.log('Costo = ' + coste);
//                 //console.log('Puntos = ' + puntos);
//                 //console.log('Denunciante = ' + denunciante);
//                 //console.log('Infraccion = ' + infraccion);

//                 var radar, vel_limite, vel_circula
//                 if ((row.VEL_LIMITE).trim() !== '') {     // Asociamos a radar

//                     if (lugar.includes('CASTELLANA')) {
//                         radar = 61;
//                     } else if (lugar.includes('04,150')) {
//                         radar = 83;
//                     } else if (lugar.includes('SM.CABEZA_N115')) {
//                         radar = 78;
//                     } else if (lugar.includes('10,300')) {
//                         radar = 67;
//                     } else if (lugar.includes('6,700')) {
//                         radar = 63;
//                     } else if (lugar.includes('A5 KM 4.0 SALIDA')) {
//                         radar = 79;
//                     } else if (lugar.includes('16,530')) {
//                         radar = 72;
//                     } else if (lugar.includes('19,800')) {
//                         radar = 80;
//                     } else if (lugar.includes('7,800')) {
//                         radar = 65;
//                     } else if (lugar.includes('0,500')) {
//                         radar = 59;
//                     } else if (lugar.includes('19,06')) {
//                         radar = 76;
//                     } else if (lugar.includes('10,300')) {
//                         radar = 67;
//                     } else if (lugar.includes('17,170')) {
//                         radar = 81;
//                     } else if (lugar.includes('25,700')) {
//                         radar = 85;
//                     } else if (lugar.includes('13,860')) {
//                         radar = 70;
//                     } else {
//                         radar = -1;
//                     }
//                     vel_limite = cleanRow.VEL_LIMITE
//                     vel_circula = cleanRow.VEL_CIRCULA
//                     //console.log('Radar = ' + radar);

//                 } else {
//                     radar = null
//                     vel_limite = null
//                     vel_circula = null
//                     //console.log('Sin radar');
//                 }

//                 if (latitude !== -1 && longitude !== -1) {
//                     var barrio = encontrarZona(latitude, longitude, barrios)
//                     if (barrio !== null) {
//                         await MultaModel.create({
//                             'lat': latitude,
//                             'lon': longitude,
//                             'mes': mes,
//                             'año': anio,
//                             'hora': hora,
//                             'coste': coste,
//                             'puntos': puntos,
//                             'denunciante': denunciante,
//                             'infraccion': infraccion,
//                             'vel_limite': vel_limite,
//                             'vel_circula': vel_circula,
//                             'descuento': descuento,
//                             'radarId': radar,
//                             'barrioId': barrio.id,
//                             'calificacionMultaId': calificacionId
//                         })
//                     }
//                 }

//                 // Incrementar el contador de lotes
//                 batchCount++;

//                 // Si hemos alcanzado el tamaño del lote, hacemos una pausa
//                 if (batchCount === batchSize) {
//                     // Agregar una espera de 10 segundos entre lotes
//                     await new Promise(resolve => setTimeout(resolve, 40000));

//                     // Reiniciar el contador de lotes
//                     batchCount = 0;
//                 }

//                 // Agregar una espera de 100 milisegundos entre cada iteración
//                 await new Promise(resolve => setTimeout(resolve, 10000));

//             })
//             .on('end', () => {
//                 console.log('Procesamiento del CSV de multas completado')
//                 res.json('Multas creadas correctamente')
//             })
//     } catch (error) {
//         res.status(500).json({ message: 'Error en la consulta leerMultasRadares:' })
//         console.log('Error en la consulta leerMultasRadares: ', error)
//     }
// }

export const leerMultasRadares = async (req, res) => {
    try {
        const batchSize = 500;
        let multasBatch = [];

        //const urlCSV = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Multas_Separado/Multas1.csv'
        const urlCSV = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Multas12-2023detalle.csv'
        const response = fs.readFileSync(urlCSV);

        const data = iconv.decode(response, 'latin1');
        
        const barrios = await BarrioModel.findAll()
        const radares = await RadarModel.findAll()

        const readableStream = new stream.Readable();
        readableStream.push(data); // Agregar los datos decodificados al flujo
        readableStream.push(null); // Indicar el final del flujo
        
        readableStream.pipe(csvParser({ separator: ';' }))
            .on('data', (row) => {
                let cleanRow = {};
                Object.keys(row).forEach(key => {
                    cleanRow[key.trim()] = row[key].trim();
                });

                var lat = cleanRow['COORDENADA-X'];
                var lon = cleanRow['COORDENADA-Y'];
                const { latitude, longitude } = UTMtoGPS(parseFloat(lat), parseFloat(lon));

                var lugar = (cleanRow.LUGAR);   
                var denunciante = cleanRow.DENUNCIANTE;
                if ((row.VEL_LIMITE).trim() !== '') {     // Asociamos a radar

                    if (lugar.includes('CASTELLANA')) {
                        radar = 61;
                    } else if (lugar.includes('04,150')) {
                        radar = 83;
                    } else if (lugar.includes('SM.CABEZA_N115')) {
                        radar = 78;
                    } else if (lugar.includes('10,300')) {
                        radar = 67;
                    } else if (lugar.includes('6,700')) {
                        radar = 63;
                    } else if (lugar.includes('A5 KM 4.0 SALIDA')) {
                        radar = 79;
                    } else if (lugar.includes('16,530')) {
                        radar = 72;
                    } else if (lugar.includes('19,800')) {
                        radar = 80;
                    } else if (lugar.includes('7,800')) {
                        radar = 65;
                    } else if (lugar.includes('0,500')) {
                        radar = 59;
                    } else if (lugar.includes('19,06')) {
                        radar = 76;
                    } else if (lugar.includes('10,300')) {
                        radar = 67;
                    } else if (lugar.includes('17,170')) {
                        radar = 81;
                    } else if (lugar.includes('25,700')) {
                        radar = 85;
                    } else if (lugar.includes('13,860')) {
                        radar = 70;
                    } else {
                        radar = -1;
                    }
                    vel_limite = cleanRow.VEL_LIMITE
                    vel_circula = cleanRow.VEL_CIRCULA
                    //console.log('Radar = ' + radar);
                    if (radar !== -1) {
                        var radarPorId = radares.find(el => el.id === radar)
                        lat = radarPorId.lat
                        lon = radarPorId.lon
                        //console.log('Radar = ' + JSON.stringify(radarPorId))
                        //console.log('lat = ' + lat + ' | lon = ' + lon)
                        //console.log('Lugar = ' + lugar)
                        //console.log('------------------------------------------------------------------------------------------------')

                        //console.log(cleanRow)
                        var calificacionId
                        var calificacion = (cleanRow.CALIFICACION);
                        switch(calificacion) {
                            case 'LEVE':
                                calificacionId = 1
                                break
                            case 'GRAVE':
                                calificacionId = 2
                                break
                            case 'MUY GRAVE':
                                calificacionId = 3
                                break
                            default:
                                calificacionId = 4
                        }

                        var mes, anio;
                        mes = parseInt(cleanRow.MES);
                        anio = parseInt(cleanRow.ANIO);

                        var hora, fecha, aux;
                        fecha = new Date();
                        aux = (cleanRow.HORA).split('.');
                        fecha.setHours(aux[0], aux[1], 0, 0);
                        hora = `${fecha.getHours()}:${fecha.getMinutes()}`;

                        var descuento = cleanRow.DESCUENTO === 'SI' ? true : false;

                        var coste = parseFloat(cleanRow.IMP_BOL);

                        var puntos = parseInt(cleanRow.PUNTOS);

                        var infraccion = cleanRow['HECHO-BOL'];

                        var radar, vel_limite, vel_circula
                        
                        var barrio
                        if (lat !== -1 && lon !== -1) {
                            barrio = encontrarZona(lat, lon, barrios)
                            if (barrio !== null) {
                                barrio = barrio.id
                            } else {
                                barrio = null
                            }
                        } else {
                            barrio = null
                        }

                        let multa = {
                            'lat': lat,
                            'lon': lon,
                            'mes': mes,
                            'año': anio,
                            'hora': hora,
                            'coste': coste,
                            'puntos': puntos,
                            'denunciante': denunciante,
                            'infraccion': infraccion,
                            'vel_limite': vel_limite,
                            'vel_circula': vel_circula,
                            'descuento': descuento,
                            'radarId': radar,
                            'barrioId': barrio,
                            'calificacionMultaId': calificacionId
                        }

                        multasBatch.push(multa)

                        if (multasBatch.length === batchSize) {
                            insertarMultasEnLotes(multasBatch)
                            multasBatch = []
                        }
                    } else {
                        lat = -1
                        lon = -1
                    }
                } else {
                    radar = null
                    vel_limite = null
                    vel_circula = null
                    lat = latitude
                    lon = longitude
                }                    
                
            })
            .on('end', async () => {
                if (multasBatch.length > 0) {
                    await insertarMultasEnLotes(multasBatch);
                }
                console.log('Procesamiento del CSV de multas completado');
                res.json('Multas creadas correctamente');
            })
            .on('error', (error) => {
                console.log('Error durante el procesamiento del CSV: ', error);
                res.status(500).json({ message: 'Error durante el procesamiento del CSV' });
            });
                
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta leerMultasRadares:' });
        console.log('Error en la consulta leerMultasRadares: ', error);
    }
}

const insertarMultasEnLotes = async (multasBatch) => {
    try {
        await db.transaction(async (t) => {
            await MultaModel.bulkCreate(multasBatch, { transaction: t });
        });
    } catch (error) {
        console.log('Error al insertar el lote de multas: ', error);
    }
};