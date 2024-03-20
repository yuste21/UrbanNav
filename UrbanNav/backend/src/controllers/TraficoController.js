import TraficoModel from "../models/TraficoModel.js";
import axios from 'axios' 
import proj4 from 'proj4'   //Convertir coordenadas UTM en geograficas
import csvParser from 'csv-parser'  //Leer archivo csv
import { Sequelize, Op, fn, col } from 'sequelize'

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'


import { startOfMonth, endOfMonth, endOfISOWeekYear } from 'date-fns'

/**
 * Este metodo devuelve una lista de objetos en la que cada elemento es una estación con los siguientes atributos:
 * - estacion --> nº de la estación
 * - nombre --> nombre de la calle o avenida donde se encuentra la estación 
 * - total --> total de vehiculos registrados que han pasado por la estación
 * - muestras --> total de muestras tomadas (una muestra es media jornada de un dia, 12 horas)
 * - media --> división del total entre las muestras
 */
export const getAllTrafico = async(req, res) => {
    try {
        const trafico = await TraficoModel.findAll()
        console.log(trafico.length)
        
        var estaciones = []

        trafico.forEach(data => {
            var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
            var aforo = data.hor1 + data.hor2 + data.hor3 + data.hor4 + data.hor5 + data.hor6 + data.hor7 + data.hor8 + data.hor9 + data.hor10 + data.hor11 + data.hor12
            if(encontrado === undefined) {
                estaciones.push({ estacion: data.estacion, nombre: data.nombre, media: aforo, total: aforo, muestras: 1, lat: data.lat, lon: data.lon })
            } else {
                encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
                encontrado.muestras++
                encontrado.total += aforo
            }
        })

        res.json(estaciones)
    } catch (error) {
        console.log('Error en la consulta getAllTrafico', error.message)
        res.status(500).json({ error: 'Error en la consulta getAllTrafico'})
    }
}

/**
 * Metodo similar al anterior pero devuelve datos del trafico de un mes concreto de un año concreto
 */
export const getTraficoPorMes = async(req, res) => {
    try {
        const { month, year } = req.query

        const fecha = new Date(year, month - 1, 1)
        const fechaInicial = startOfMonth(fecha)
        const fechaFinal = endOfMonth(fecha)

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicial, fechaFinal]
                }
            }
        })

        var estaciones = []
        var coordenadas = []
        trafico.forEach(data => {
            var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
            var aforo = data.hor1 + data.hor2 + data.hor3 + data.hor4 + data.hor5 + data.hor6 + data.hor7 + data.hor8 + data.hor9 + data.hor10 + data.hor11 + data.hor12
            if(encontrado === undefined) {
                //media = media de todos los datos tomados de esa estacion
                //total = total de aforo registrado en esa estacion
                //muestras = el total de muestras de datos que han contribuido a esta media
                estaciones.push({ estacion: data.estacion, nombre: data.nombre, media: aforo, total: aforo, muestras: 1, lat: data.lat, lon: data.lon })

                coordenadas.push([data.lat, data.lon])
            } else {
                encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
                encontrado.muestras++
                encontrado.total += aforo
            }
        })
        
        res.json(estaciones)
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMes', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMes'})
    }
}

/**
 * Lectura del csv del trafico de noviembre de 2023. A pesar de que el total de lineas en el csv sean 7080 en la bd se almacenan 6540 porque
 * hay lineas que almacenan 0 trafico durante todo el dia (por razones desconocidas). Esas lineas no las almacenamos en la BD
 */
export const leerCSV = async(req, res) => {
    try {
        //Leemos csv de las estaciones permanentes y almacenamos los datos en una lista 
        //Para cuando leamos el csv del trafico poder almacenar toda la info en la bd 
        /*Formato:
        {
        'Estación': '60',
        Nombre: 'Calle Camino de Vinateros',
        Latitud: '40,4109315826646',
        Longitud: '-3,65683389839975',
        Sentido: '2',
        'Orient.': 'O-E'
        }
        */
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300233-70-aforo-trafico-permanentes.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))
        */
       // Ruta al archivo CSV en tu directorio local
       const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/AforoPermanente/UbicacionEstacionesPermanentesSentidos.csv';

       // Leer el archivo CSV localmente
       const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

        let batchCount = 0; // Contador de lotes
        const batchSize = 100; // Tamaño del lote
        var estaciones = []
        //Ya que no puedo acceder al campo 'Estación' voy a tener que usar 2 iteradores para almacenar el numero de la estacion
        var cod_estacion = 1
        var par = 1
        fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                // Procesar cada fila del CSV
                //console.log(row)
                //console.log(row['Estación'])
                
                estaciones.push({estacion: cod_estacion, nombre: row.Nombre, lat: row.Latitud, lon: row.Longitud, sentido: row.Sentido, orient: row['Orient.']})
                cod_estacion += par%2 == 0 ? 1 : 0
                par++
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estaciones de trafico completado.');
                //console.log(estaciones)
            });
        
        //Leemos csv de las estaciones permanentes y almacenamos los datos en una lista 
        //Para cuando leamos el csv del trafico poder almacenar toda la info en la bd 
        /*Formato:
        {
        'FDIA': '30/11/2023',
        FEST: 'ES60',
        FSEN: '2=',
        HOR1: '600',
        HOR2: '691',
        HOR3: '610',
        HOR4: '655',
        HOR5: '754',
        HOR6: '702',
        HOR7: '667',
        HOR8: '621',
        HOR9: '460',
        HOR10: '306',
        HOR11: '204',
        HOR12: '135',
        '': ''
        }
        */
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300233-147-aforo-trafico-permanentes.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))
        */
       // Ruta al archivo CSV en tu directorio local
       const filePath2 = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/AforoPermanente/AforoPermanenteNoviembre2023.csv';

       // Leer el archivo CSV localmente
       const fileStream2 = fs.createReadStream(filePath2, { encoding: 'utf-8' });

        let batchCount2 = 0; // Contador de lotes
        const batchSize2 = 100; // Tamaño del lote

        //Al leer el csv y terminar de leer las filas de datos sigue cogiendo valores el row. Uso stopReading para dejar de leer el CSV 
        let stopReading = false

        //Me estaba dando error al obtener el atributo FDIA del row. Con esta configuracion del csv-parse se ha solucionado
        const csvParserOptions = {
            separator: ';', // Define el delimitador, por ejemplo, ';' para CSV con separador de punto y coma
            mapHeaders: ({ header }) => header.trim(), // Función para mapear y limpiar los encabezados si es necesario
            mapValues: ({ header, index, value }) => value.trim() // Función para mapear y limpiar los valores si es necesario
        };          
        fileStream2.pipe(csvParser(csvParserOptions))
            .on('data', async (row) => {
                // Procesar cada fila del CSV
                if (!stopReading) {
                    //console.log(row);
                    // Condición para detener la lectura del CSV
                    if (row.FEST === '') {
                        stopReading = true; 
                        fileStream.destroy(); 
                    }

                    let estacion = (row.FEST).slice(2)
                    if(estacion[0] === '0') {
                        estacion = estacion.slice(1)
                    }
                    
                    let est
                    if((row.FSEN.substring(0,1)) === '1') {
                        est = estaciones.find(estacionActual => estacionActual.estacion === parseInt(estacion) && estacionActual.sentido === '1')
                    } else {
                        est = estaciones.find(estacionActual => estacionActual.estacion === parseInt(estacion) && estacionActual.sentido === '2')
                    }
                    
                    if(est !== undefined) {
                        var partesFecha = row['FDIA'].split('/')
                        var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]

                        var cadLat = est.lat.replace(',', '.')
                        var cadLon = est.lon.replace(',', '.')

                        await TraficoModel.create({
                            'fecha': nuevaFecha,
                            'estacion': estacion,
                            'fsen': row.FSEN,
                            'orient': est.orient,
                            'hor1': row.HOR1,
                            'hor2': row.HOR2,
                            'hor3': row.HOR3,
                            'hor4': row.HOR4,
                            'hor5': row.HOR5,
                            'hor6': row.HOR6,
                            'hor7': row.HOR7,
                            'hor8': row.HOR8,
                            'hor9': row.HOR9,
                            'hor10': row.HOR10,
                            'hor11': row.HOR11,
                            'hor12': row.HOR12,
                            'lat': parseFloat(cadLat),
                            'lon': parseFloat(cadLon),
                            'nombre': est.nombre
                        })
                    }
                    
                }
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de aforos de trafico completado.');
                //console.log(estaciones)
            });
    } catch (error) {
        console.error('Error al leerCSV de las estaciones de trafico y/o aforos:', error.message);
        res.status(500).json({ error: 'Error al leerCSV de las estaciones de trafico y/o aforos.' });
    }
}