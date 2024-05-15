import axios from "axios";
import { MultaModel } from "../models/MultaModel.js";
import csvParser from "csv-parser";
import stream from 'stream'
import { UTMtoGPS } from "./AccidenteController.js";

export const getAllMultas = async(req, res) => {
    try {
        const multas = await MultaModel.findAll()

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

export const leerMultasRadares = async(req, res) => {
    try {
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/210104-371-multas-circulacion-detalle.csv'
        const response = await axios.get(urlCSV, { responseType: 'arraybuffer' })
        const data = new TextDecoder('utf-8').decode(response.data)

        // Convertir la cadena 'data' en un flujo legible
        const readableStream = new stream.Readable();
        readableStream.push(data); // Agregar los datos decodificados al flujo
        readableStream.push(null); // Indicar el final del flujo

        readableStream.pipe(csvParser({ separator: ';' }))
            .on('data', async(row) => {
                //console.log(row)

                //Hago esto para obtener la coordenada y
                let cleanRow = {}
                Object.keys(row).forEach(key => {
                    cleanRow[key.trim()] = row[key].trim()
                })

                // var calificacion = (row.CALIFICACION)
                var lugar = ('lugar = ' + cleanRow.LUGAR)

                // var hora, fecha, aux
                // fecha = new Date()
                // aux = (cleanRow.HORA).split('.')
                // fecha.setHours(aux[0], aux[1], 0, 0)
                // hora = `${fecha.getHours()}:${fecha.getMinutes()}`

                // var puntos = cleanRow.PUNTOS

                // var lat = cleanRow['COORDENADA-X']
                // var lon = cleanRow['COORDENADA-Y']
                // const { latitude, longitude } = UTMtoGPS(parseFloat(lat), parseFloat(lon))

                // console.log(cleanRow.IMP_BOL)
                // var coste = parseFloat(cleanRow.IMP_BOL)
                // console.log('Puntos = ' + puntos)
                var radar
                if((row.VEL_LIMITE).trim() !== '') {     //Asociamos a radar
                    console.log('ENTROOOOO')
                    console.log(row)
                    
                    if(lugar.includes('CASTELLANA')) {
                        radar = 61
                    } else if(lugar.includes('04,150')) {
                        radar = 83
                    } else if(lugar.includes('SM.CABEZA_N115')) {
                        radar = 78
                    } else if(lugar.includes('10,300')) {
                        radar = 67
                    } else if(lugar.includes('6,700')) {
                        radar = 63
                    } else if(lugar.includes('A5 KM 4.0 SALIDA')) {
                        radar = 79
                    } else if(lugar.includes('16,530')) {
                        radar = 72
                    } else if(lugar.includes('19,800')) {
                        radar = 80
                    } else if(lugar.includes('7,800')) {
                        radar = 65
                    } else if(lugar.includes('0,500')) {
                        radar = 59
                    } else if(lugar.includes('19,06')) {
                        radar = 76
                    } else if(lugar.includes('10,300')) {
                        radar = 67
                    } else if(lugar.includes('17,170')) {
                        radar = 81
                    } else if(lugar.includes('25,700')) {
                        radar = 85
                    } else if(lugar.includes('13,860')) {
                        radar = 70
                    } else {
                        radar = -1
                    }

                }
                if(radar !== -1 || (row.VEL_LIMITE).trim() === '') {
                    // await MultaModel.create({
                    //     'lat': latitude,
                    //     'lon': longitude,
                    //     'mes': cleanRow.MES,
                    //     'año': cleanRow.ANIO,
                    //     'hora': hora,
                    //     'coste': cleanRow[IMP_BOL]
                    // })
                }
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de multas completado')
                res.json('Multas creadas correctamente')
            })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta leerMultasRadares:' })
        console.log('Error en la consulta leerMultasRadares: ', error)
    }
}