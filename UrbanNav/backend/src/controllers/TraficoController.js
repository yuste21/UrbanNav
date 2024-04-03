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
function getEstaciones(trafico) {
    var estaciones = []

    trafico.forEach(data => {
        var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
        var aforo = data.hor1 + data.hor2 + data.hor3 + data.hor4 + data.hor5 + data.hor6 + data.hor7 + data.hor8 + data.hor9 + data.hor10 + data.hor11 + data.hor12
        if(encontrado === undefined) {
            estaciones.push({ 
                estacion: data.estacion, 
                nombre: data.nombre, 
                media: aforo, 
                total: aforo, 
                muestras: 1, 
                lat: data.lat, 
                lon: data.lon,
                sentido: data.orient
            })
        } else {
            encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
            encontrado.media = parseFloat(encontrado.media.toFixed(2))
            encontrado.muestras++
            encontrado.total += aforo
        }
    })

    var media = 0
    var i = 0
    estaciones.forEach(estacion => {
        media = (media * i + estacion.media) / (i+1)
        i++
    })
    media = parseFloat(media.toFixed(2))

    var inferior = 0
    var superior = 0
    estaciones.forEach(estacion => {
        if(estacion.media < media) {
            inferior++
        } else {
            superior++
        }
    })

    console.log('Inferior: ' + inferior + ' | Superior: ' + superior)

    return({ estaciones, media })
}

export const getAllTrafico = async(req, res) => {
    try {
        const trafico = await TraficoModel.findAll()
        
        const { estaciones, media } = getEstaciones(trafico)

        console.log(trafico.length)
        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getAllTrafico', error.message)
        res.status(500).json({ error: 'Error en la consulta getAllTrafico'})
    }
}

export const getChartFecha = async(req, res) => {
    try {
        const { fecha1, fecha2, estacion } = req.query
        var fechaInicio
        var fechaFin

        if(fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                estacion: estacion
            }
        })

        var trafico_ordenado = trafico.sort((a, b) => {
            const date1 = new Date(a.fecha)
            const date2 = new Date(b.fecha)

            return date1  - date2
        }) 

        var trafico_definitivo = []
        var nombre, num_estacion
        trafico_ordenado.forEach((el) => {
            var aux = trafico_ordenado.filter(ol => ol.fecha === el.fecha)
            var encontrado = trafico_definitivo.find(ol => ol.fecha === aux[0].fecha) 
            if(!encontrado) {
                console.log('Encontrado = ' + JSON.stringify(aux))
                var suma = aux.reduce((total, ol) => total + (ol.hor1 + ol.hor2 + ol.hor3 + ol.hor4 + ol.hor5 + ol.hor6 + ol.hor7 + ol.hor8 + ol.hor9 + ol.hor10 + ol.hor11 + ol.hor12), 0)
                
                trafico_definitivo.push({
                    aforo: suma,
                    fecha: aux[0].fecha
                })

            }
        })

        num_estacion = estacion
        nombre = trafico_ordenado[0].nombre

        res.json({ trafico: trafico_definitivo, num_estacion, nombre })
    } catch (error) {
        console.log('Error en la consulta getChartFecha', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartFecha'})
    }
}

export const getChatHora = async(req, res) => {
    try {
        const { hora1, hora2, estacion } = req.query

        var min = hora1
        var max = hora2

        min = min.split(':')
        max = max.split(':')

        var horaMin = new Date()
        horaMin.setHours(parseInt(min[0]), parseInt(min[1]), 0)

        var horaMax = new Date()
        horaMax.setHours(parseInt(max[0]), parseInt(max[1]), 0)

        var limiteMañana = new Date()
        limiteMañana.setHours(12, 0, 0)

        var trafico = []

        if(horaMax <= limiteMañana && horaMin < horaMax) {
            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1-' },
                        { fsen: '2-' }
                    ],
                    estacion: estacion
                }
            })
        } else if(horaMin > limiteMañana && horaMin < horaMax ) {
            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1=' },
                        { fsen: '2=' }
                    ],
                    estacion: estacion
                }
            })
        } else {
            trafico = await TraficoModel.findAll({
                where: {
                    estacion: estacion
                }
            })
        }

        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()

        var trafico_desordenado = []
        /*  horaMin = 22:00
            horaMax = 4:00
        Tengo que crear un array con este formato:
        trafico_desordenado = [
            {hora: 2:00, aforo: 200},
            {hora: 23:00, aforo: 400},
            {hora: 1:00, aforo: 100}
        ]

        Y ordenarlo:
        trafico_ordenado = [
            {hora: 23:00, aforo: 400},
            {hora: 1:00, aforo: 100},
            {hora: 2:00, aforo: 200}
        ]


        El formato de trafico es:
        trafico = [
            {
                "id": 2618,
                "fecha": "2023-11-01",
                "estacion": 1,
                "fsen": "1-",
                "orient": "S-N",
                "hor1": 941,
                "hor2": 745,
                "hor3": 732,
                "hor4": 624,
                "hor5": 595,
                "hor6": 544,
                "hor7": 375,
                "hor8": 388,
                "hor9": 480,
                "hor10": 640,
                "hor11": 893,
                "hor12": 1006,
                "lat": 40.4319,
                "lon": -3.68911,
                "nombre": "Paseo de la Castellana"
            },
            {
                "id": 2619,
                "fecha": "2023-11-01",
                "estacion": 1,
                "fsen": "1=",
                "orient": "S-N",
                "hor1": 1294,
                "hor2": 1230,
                "hor3": 981,
                "hor4": 1070,
                "hor5": 1244,
                "hor6": 1228,
                "hor7": 1233,
                "hor8": 1195,
                "hor9": 932,
                "hor10": 799,
                "hor11": 639,
                "hor12": 450,
                "lat": 40.4319,
                "lon": -3.68911,
                "nombre": "Paseo de la Castellana"
            }
        ]
        */

        console.log(JSON.stringify(trafico))

        //Al igual que en getTraficoEntreHoras obtengo el dataValues de cada objeto y compruebo la franja y hora        trafico.forEach(data => {
        trafico.forEach(data => {
            var dataValues = data.dataValues
            //Uso la variable i para iterar sobre los valores de las horas
            //Y juego con su valor y los string para crear las keys: '1:00', '2:00',...
            var i
            if(dataValues['fsen'].substring(1) === '-') {
                i = 1
            } else {
                i = 13
            }

            for(const key in dataValues) {
                var hora = parseInt(key.substring(3))
                if(hora === (i % 12) || (hora === 12 && i === 24)) {    //Hemos llegado a los key de las horas
                    if((horaMin < horaMax && horaMin <= i && i <= horaMax) || (horaMax < horaMin && (horaMin <= i || i <= horaMax))) {
                        var encontrado = trafico_desordenado.find(el => el.hora === `${i}:00`)
                        console.log(trafico_desordenado)
                        if(encontrado === undefined) {
                            trafico_desordenado.push({ hora: `${i}:00`, aforo: dataValues[key] })
                        } else {
                            var aux = trafico_desordenado.find(el => el.hora === `${i}:00`)
                            aux.aforo += dataValues[key]
                        }                                 
                    } 
                    i++ 
                }
            }
        })

        var num_estacion = estacion
        var nombre = trafico_desordenado[0].nombre

        res.json({ trafico_desordenado, estacion: num_estacion, nombre: nombre })
    } catch (error) {
        console.log('Error en la consulta getChatHora', error.message)
        res.status(500).json({ error: 'Error en la consulta getChatHora'})
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

        const { estaciones, media } = getEstaciones(trafico)
        
        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMes', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMes'})
    }
}

export const getTraficoPorSentido = async(req, res) => {
    try {
        const { sentido } = req.query

        const trafico = await TraficoModel.findAll({
            where: {
                orient: sentido
            }
        })

        const { estaciones, media } = getEstaciones(trafico)
        
        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorSentido'})
    }
}

/**
 * Significado de franja segun su valor:
 * - '-'    -> Buscamos en franja de mañana && horaMin < horaMax (1:00 - 12:00)
 * - '='    -> Buscamos en franja de tarde && horaMin < horaMax (13:00 - 24:00)
 * - ''     -> Buscamos en todas las franjas && horaMin < horaMax
 * - '/'    -> Buscamos en todas las franjas && horaMax < horaMin
 * 
 * Si horaMin < horaMax --> Buscamos dentro del intervalo. horaMin <= horaX <= horaMax
 * Si horaMax < horaMin --> Buscamos fuera del intervalo.  horaX <= horaMin && horaMax <= horaX
 */

export const getTraficoEntreHoras = async(req, res) => {
    try {
        var { min, max } = req.query

        min = min.split(':')
        max = max.split(':')

        var franja = ''
        var horaMin = new Date()
        horaMin.setHours(parseInt(min[0]), parseInt(min[1]), 0)

        var horaMax = new Date()
        horaMax.setHours(parseInt(max[0]), parseInt(max[1]), 0)

        var limiteMañana = new Date()
        limiteMañana.setHours(12, 0, 0)

        var trafico = []

        if(horaMax <= limiteMañana && horaMin < horaMax) {
            franja = '-'

            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1-' },
                        { fsen: '2-' }
                    ]
                }
            })
        } else if(horaMin > limiteMañana && horaMin < horaMax ) {
            franja = '='

            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1=' },
                        { fsen: '2=' }
                    ]
                }
            })
        } else {
            if(horaMin > horaMax) {
                franja = '/'
            }
            trafico = await TraficoModel.findAll()
        }

        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()
        if(12 < horaMin) {
            if(horaMin === 24) {
                horaMin = 12
            } else {
                horaMin = horaMin % 12
            }
        }
        if(12 < horaMax) {
            if(horaMax === 24) {
                horaMax = 12
            } else {
                horaMax = horaMax % 12
            }
        }
        
        var estaciones = []

        trafico.forEach(data => {
            
            var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
            var dataValues = data.dataValues
            var aforo = 0
            
            if(franja === '') {             //horaMin < horaMax
                if(data.fsen.substring(1) === '-') {    //Franja de mañana
                    for(const key in dataValues) {
                        const hora = parseInt(key.substring(3))
                        if(horaMin <= hora) {
                            aforo += dataValues[key]
                        }
                    }
                } else {                                //Franja de tarde
                    for(const key in dataValues) {
                        const hora = parseInt(key.substring(3))
                        if(hora <= horaMax) {
                            aforo += dataValues[key]
                        }
                    }
                }
            } else if(franja === '/') {     //horaMin > horaMax
                if(data.fsen.substring(1) === '-') {    //Franja de mañana
                    for(const key in dataValues) {
                        const hora = parseInt(key.substring(3))
                        if(hora <= horaMin) {
                            aforo += dataValues[key]
                        }
                    }
                } else {                                //Franja de tarde
                    for(const key in dataValues) {
                        const hora = parseInt(key.substring(3))
                        if(horaMax <= hora) {
                            aforo += dataValues[key]
                        }
                    }
                }
            } else {                        //horaMin < horaMax && ya hemos filtrado por la franja. No hace falta comprobar fsen
                for(const key in dataValues) {
                    const hora = parseInt(key.substring(3))
                    if(horaMin <= hora && hora <= horaMax) {
                        aforo += dataValues[key]
                    }
                }
            }
            
            if(encontrado === undefined) {
                estaciones.push({ 
                    estacion: data.estacion, 
                    nombre: data.nombre, 
                    media: aforo, 
                    total: aforo, 
                    muestras: 1, 
                    lat: data.lat, 
                    lon: data.lon,
                    sentido: data.orient
                })
            } else {
                encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
                encontrado.media = parseFloat(encontrado.media.toFixed(2))
                encontrado.muestras++
                encontrado.total += aforo
            }
        })
        
        var media = 0
        var i = 0
        estaciones.forEach(estacion => {
            media = (media * i + estacion.media) / (i+1)
            i++
        })
        media = parseFloat(media.toFixed(2))

        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getTraficoEntreHoras', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoEntreHoras'})
    }
}

export const getTraficoPorFecha = async(req, res) => {
    try {
        const { fecha } = req.query

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: fecha
            }
        })

        const { estaciones, media } = getEstaciones(trafico)

        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorFecha', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorFecha'})
    }
}

export const getTraficoEntreFechas = async(req, res) => {
    try {
        const { fecha1, fecha2 } = req.query
        var fechaInicio
        var fechaFin

        if(fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            }
        })

        const { estaciones, media } = getEstaciones(trafico)
        
        res.json({ estaciones, media })

    } catch (error) {
        console.log('Error en la consulta getTraficoEntreFechas', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoEntreFechas'})
    }
}

export const getTraficoPorHora = async(req, res) => {
    try {
        const { horaQuery } = req.query

        var split = horaQuery.split(':')

        var hora = new Date()
        hora.setHours(split[0], split[1], 0)
        
        var limiteMañana = new Date()
        limiteMañana.setHours(12, 0, 0)

        var trafico = []
        if(hora <= limiteMañana) {
            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1-' },
                        { fsen: '2-' }
                    ]
                }
            })
        } else {
            trafico = await TraficoModel.findAll({
                where: {
                    [Op.or]: [
                        { fsen: '1=' },
                        { fsen: '2=' }
                    ]
                }
            })
        }

        hora = hora.getHours()
        if(hora > 12) {
            if(hora === 24) {
                hora = 12
            } else {
                hora = hora % 12
            }
        }

        var estaciones = []

        trafico.forEach(data => {
            var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
            var aforo
            
            switch (hora) {
                case 1:
                    aforo = data.hor1;
                    break;
                case 2:
                    aforo = data.hor2;
                    break;
                case 3:
                    aforo = data.hor3;
                    break;
                case 4:
                    aforo = data.hor4;
                    break;
                case 5:
                    aforo = data.hor5;
                    break;
                case 6:
                    aforo = data.hor6;
                    break;
                case 7:
                    aforo = data.hor7;
                    break;
                case 8:
                    aforo = data.hor8;
                    break;
                case 9:
                    aforo = data.hor9;
                    break;
                case 10:
                    aforo = data.hor10;
                    break;
                case 11:
                    aforo = data.hor11;
                    break;
                case 12:
                    aforo = data.hor12;
                    break;
            }
            
            if(encontrado === undefined) {
                estaciones.push({ 
                    estacion: data.estacion, 
                    nombre: data.nombre, 
                    media: aforo, 
                    total: aforo, 
                    muestras: 1, 
                    lat: data.lat, 
                    lon: data.lon,
                    sentido: data.orient
                })
            } else {
                encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
                encontrado.media = parseFloat(encontrado.media.toFixed(2))
                encontrado.muestras++
                encontrado.total += aforo
            }
        })

        var media = 0
        var i = 0
        estaciones.forEach(estacion => {
            media = (media * i + estacion.media) / (i+1)
            i++
        })
        media = parseFloat(media.toFixed(2))

        res.json({ estaciones, media })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorHora', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorHora'})
    }
}

/**
 * Lectura del csv del trafico de noviembre de 2023. A pesar de que el total de lineas en el csv sean 7080 en la bd se almacenan 6540 porque
 * hay lineas que almacenan 0 trafico durante todo el dia (por razones desconocidas). Esas lineas no las almacenamos en la BD
 */
export const leerCSV = async(req, res) => {
    try {
        //Leemos csv de la ubicacion de las estaciones permanentes y almacenamos los datos en una lista 
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

        let batchCount = 0; // Contador de lotes
        const batchSize = 100; // Tamaño del lote
        var estaciones = []
        //Ya que no puedo acceder al campo 'Estación' voy a tener que usar 2 iteradores para almacenar el numero de la estacion
        var cod_estacion = 1
        var par = 1

        // Lectura del csv desde la web
        
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300233-70-aforo-trafico-permanentes.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))
        
        //--------------------------------------------------------------------------------------------
        // Ruta al archivo CSV en tu directorio local
        //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/AforoPermanente/UbicacionEstacionesPermanentesSentidos.csv';

        // Leer el archivo CSV localmente
        //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        //fileStream.pipe(csvParser({ separator: ';' }))

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
        
        //Leemos csv del trafico y almacenamos los datos en la bd
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

        // Lectura del csv desde la web 
        const urlCSV2 = 'https://datos.madrid.es/egob/catalogo/300233-147-aforo-trafico-permanentes.csv'
        const response2 = await axios.get(urlCSV2, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        const csvStream = response2.data.pipe(csvParser(csvParserOptions))
        
        // Ruta al archivo CSV en tu directorio local
        //const filePath2 = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/AforoPermanente/AforoPermanenteNoviembre2023.csv';

        // Leer el archivo CSV localmente
        //const fileStream2 = fs.createReadStream(filePath2, { encoding: 'utf-8' });       
        //fileStream2.pipe(csvParser(csvParserOptions))
        csvStream.on('data', async (row) => {
                // Procesar cada fila del CSV
                if (!stopReading) {
                    //console.log(row);
                    // Condición para detener la lectura del CSV
                    if (row.FEST === '') {
                        stopReading = true; 
                        csvStream.destroy(); 
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
                res.json('Procesamiento del CSV de aforos de trafico completado')
                //console.log(estaciones)
            });
    } catch (error) {
        console.error('Error al leerCSV de las estaciones de trafico y/o aforos:', error.message);
        res.status(500).json({ error: 'Error al leerCSV de las estaciones de trafico y/o aforos.' });
    }
}