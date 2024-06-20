import { TraficoModel, OrientacionModel } from '../models/TraficoModel.js'
import axios from 'axios' 
import proj4 from 'proj4'   //Convertir coordenadas UTM en geograficas
import csvParser from 'csv-parser'  //Leer archivo csv
import { Sequelize, Op, fn, col, where } from 'sequelize'
import { BarrioModel, DistritoModel } from '../models/DistritoModel.js'
import { calcularPuntoMedio } from './DistritoController.js'
import moment from 'moment'

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'


import { startOfMonth, endOfMonth, endOfISOWeekYear } from 'date-fns'
import { encontrarZona } from './DistritoController.js'
import EstacionamientoModel from '../models/EstacionamientoModel.js'

/**
 * Este metodo devuelve una lista de objetos en la que cada elemento es una estación con los siguientes atributos:
 * - estacion --> nº de la estación
 * - nombre --> nombre de la calle o avenida donde se encuentra la estación 
 * - total --> total de vehiculos registrados que han pasado por la estación
 * - muestras --> total de muestras tomadas (una muestra es media jornada de un dia, 12 horas)
 * - media --> división del total entre las muestras
 */

export const getOrientacion = async(req, res) => {
    try {
        const orientacion = await OrientacionModel.findAll()

        res.json(orientacion)
    } catch (error) {
        console.log('Error en la consulta getOrientacion', error.message)
        res.status(500).json({ error: 'Error en la consulta getOrientacion'})
    }
}

/**
 * En este metodo uso la funcion getEstaciones creada en TraficoController
 * Y calculo el aforo de cada estacion (media, total y muestras) y lo almaceno en los barrios y los distritos 
 * Para hacer menos costoso el metodo en getTraficoInicio llamare a traficoAux con orientacion = false y asi juntar los sentidos
 */
export async function traficoAux(traficoId, orientacion, horaMin, horaMax) {
    return new Promise(async (resolve, reject) => {
        try {
            const distritos_bd = await DistritoModel.findAll({
                include: [{
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [{
                        model: TraficoModel,
                        as: 'aforos',
                        where: {
                            id: {
                                [Op.in]: traficoId
                            }
                        },
                        required: true,
                        include: [{
                            model: OrientacionModel,
                            as: 'orientacione'
                        }]
                    }]
                }]
            })

            var estaciones_trafico = []
            var distritos = []
            var barrios = []
            var inicio = 0
            var fin = 0
            var media_total = 0
            distritos_bd.forEach((distrito) => {
                var media_distrito = 0
                distrito.barrios.forEach((barrio) => {
                    const { estaciones, media } = getEstaciones(barrio.aforos, orientacion, horaMin, horaMax)
                    estaciones_trafico = estaciones_trafico.concat(estaciones)
                    var centro = calcularPuntoMedio(barrio.delimitaciones)
                    barrios.push({
                        id: barrio.id,
                        nombre: barrio.nombre,
                        delimitaciones: barrio.delimitaciones,
                        estaciones: estaciones,
                        media: parseFloat(media.toFixed(0)),
                        centro: centro
                    })
                    media_total += media
                    media_distrito += media
                    fin++
                })
                media_distrito = media_distrito / distrito.barrios.length
                media_distrito = parseFloat(media_distrito.toFixed(0))
                var centro = calcularPuntoMedio(distrito.delimitaciones)
                distritos.push({
                    codigo: distrito.codigo,
                    nombre: distrito.nombre,
                    delimitaciones: distrito.delimitaciones,
                    barrios: barrios.slice(inicio, fin),
                    media: media_distrito,
                    centro: centro
                })
                inicio = fin
            })
        
            //En total son 59 muestras
            media_total = media_total / 59
        
            media_total = parseFloat(media_total.toFixed(0))
        
            var distritos_ordenados = distritos.sort((a, b) => b.media - a.media)
            var barrios_ordenados = barrios.sort((a, b) => b.media - a.media)
            var estaciones_ordenadas = estaciones_trafico.sort((a, b) => b.media - a.media)
            
            resolve({ distritos: distritos_ordenados, barrios: barrios_ordenados, estaciones_trafico: estaciones_ordenadas, media_total })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Este metodo junta el trafico de ambos sentidos de la estacion o lo separa en 
 * funcion del valor del parametro orientacion.
 * estructura de estaciones:
 * estaciones = {
 *      estacion: nº de la estacion
 *      nombre: nombre de la estacion
 *      media: trafico medio de la estacion | media = total / muestras 
 *      total: total del trafico
 *      muestras: nº de dias que se han hecho las mediciones
 *      lat | lon: coordenadas de la estacion
 *      sentido: orientacion individual: Norte-Sur, Sur-Norte, Este-Oeste u Oeste-Este | ambas orientaciones: Norte + Sur o Este + Oeste 
 * } 
 */
export function getEstaciones(trafico, orientacion, horaMin, horaMax) {
    try {
        var estaciones = []

        trafico.forEach(data => {
            var sentido
            if(orientacion === 'true') {    //Separo las orientaciones
                var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion && 
                                                estacion.sentido === data.orientacione.orientacion)
                sentido = data.orientacione.orientacion

            } else {
                var encontrado = estaciones.find(estacion => estacion.estacion === data.estacion)
                sentido = data.orientacione.orientacion.split('-')[0] + ' + ' + data.orientacione.orientacion.split('-')[1]
            }
            var aforo = 0
            if(horaMax === null && horaMin === null) {
                aforo = data.trafico.reduce((total, traficoActual) => total + traficoActual, 0)
            } else if(horaMax === null) {   //Hora concreta
                aforo = data.trafico[(horaMin-1)]
            } else {    //Entre horas
                for(let i = (horaMin-1); i < horaMax; i++) {
                    aforo += data.trafico[i]
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
                    sentido: sentido
                })
            } else {
                encontrado.media = (encontrado.media * encontrado.muestras + aforo) / (encontrado.muestras+1) 
                encontrado.media = parseFloat(encontrado.media.toFixed(2))  //Redondeo la media a 2 decimales
                encontrado.muestras++
                encontrado.total += aforo
            }
        })

        //Media general entre todas las estaciones
        var media = 0
        var i = 0
        estaciones.forEach(estacion => {
            media = (media * i + estacion.media) / (i+1)
            i++
        })
        media = parseFloat(media.toFixed(2))

        return({ estaciones, media })
    } catch (error) {
        console.log('Error: ' + error)
    }
}

//Devuelve el trafico de cada estacion separamos los datos por el sentido dependiendo del query
export const getAllTrafico = async(req, res) => {
    try {
        const { orientacion } = req.query
        const trafico = await TraficoModel.findAll({})

        const traficoId = trafico.map(el => el.id)
        var fechaMin = trafico.reduce((min, el) => new Date(el.fecha) < min ? new Date(el.fecha) : min, new Date(trafico[0].fecha));
        const añoMin = fechaMin.getFullYear();
        const mesMin = fechaMin.getMonth() + 1; // getMonth() devuelve un índice basado en 0, por lo que se suma 1
        const diaMin = fechaMin.getDate();
        fechaMin = `${añoMin}-${mesMin.toString().padStart(2, '0')}-${diaMin.toString().padStart(2, '0')}`;
        
        var fechaMax = trafico.reduce((max, el) => new Date(el.fecha) > max ? new Date(el.fecha) : max, new Date(trafico[0].fecha));
        const añoMax = fechaMax.getFullYear();
        const mesMax = fechaMax.getMonth() + 1; // getMonth() devuelve un índice basado en 0, por lo que se suma 1
        const diaMax = fechaMax.getDate();
        fechaMax = `${añoMax}-${mesMax.toString().padStart(2, '0')}-${diaMax.toString().padStart(2, '0')}`;

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, null, null)

        
        res.json({ distritos, barrios, estaciones_trafico, media_total, fechaMin, fechaMax })
    } catch (error) {
        console.log('Error en la consulta getAllTrafico', error.message)
        res.status(500).json({ error: 'Error en la consulta getAllTrafico'})
    }
}


export const getChartFechaEstacion = async(req, res) => {
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
            include: [{ model: OrientacionModel, as: 'orientacione' }],
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

        //En trafico_definitivo almaceno en cada posicion el trafico total regitrado el mismo dia
        var trafico_definitivo = []
        var nombre, num_estacion
        trafico_ordenado.forEach((el) => {
            var aux = trafico_ordenado.filter(ol => ol.fecha === el.fecha)
            var encontrado = trafico_definitivo.find(ol => ol.fecha === aux[0].fecha) 
            if(!encontrado) {
                var suma = 0
                aux.forEach((ol) => {
                    var aforo = ol.trafico.reduce((total, traficoActual) => total + traficoActual, 0)
                    suma += aforo
                })                
                
                trafico_definitivo.push({
                    aforo: suma,
                    fecha: aux[0].fecha
                })

            }
        })

        num_estacion = estacion
        nombre = trafico_ordenado[0].nombre

        res.json({ trafico: trafico_definitivo, num_estacion, nombre, lat: trafico[0].lat, lon: trafico[0].lon })
    } catch (error) {
        console.log('Error en la consulta getChartFechaEstacion', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartFechaEstacion'})
    }
}

export const getChartHoraEstacion = async(req, res) => {
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

        var trafico = []

        trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                estacion: estacion
            }
        })

        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()

        var trafico_desordenado = []
        /*  horaMin = 23:00
            horaMax = 3:00
        Tengo que crear un array con este formato:
        trafico_desordenado = [
            {hora: 1:00, aforo: 100}
            {hora: 2:00, aforo: 200},
            {hora: 23:00, aforo: 400},
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
                "orientacione": "S-N",
                "trafico": [1,2,3,4,...,24]
                "lat": 40.4319,
                "lon": -3.68911,
                "nombre": "Paseo de la Castellana"
            }
        ]
        */

        
        trafico.forEach(data => {
            //Uso la variable i para iterar sobre los valores de las horas
            //Y juego con su valor y los string para crear las keys: '1:00', '2:00',...
            for(let i = 0; i < data.trafico.length; i++) {
                if((horaMin < horaMax && horaMin <= (i+1) && (i+1) <= horaMax) || (horaMax < horaMin && (horaMin <= (i+1) || (i+1) <= horaMax))) {
                    var hora = i+1
                    if(hora < 10) {
                        hora = `0${i+1}`
                    }
                    var encontrado = trafico_desordenado.find(el => el.hora === `${hora}:00`)
                    if(encontrado) {
                        encontrado.aforo += data.trafico[i]
                    } else {
                        trafico_desordenado.push({ hora: `${hora}:00`, aforo: data.trafico[i] })
                    }
                }
            }
        })

        var num_estacion = estacion
        var nombre = trafico_desordenado[0].nombre

        //Recorro el array de manera circular inicializando el indice en la posicion de la horaMin
        var trafico_ordenado = []
        if(horaMin < 10) {
            horaMin = `0${horaMin}`
        }
        var idx = trafico_desordenado.findIndex((el) => el.hora === `${horaMin}:00`);

        for(let i = 0; i < trafico_desordenado.length; i++) {
            trafico_ordenado[i] = trafico_desordenado[idx]
            idx = (idx + 1) % trafico_desordenado.length
        }

        res.json({ trafico: trafico_ordenado, estacion: num_estacion, nombre, lat: trafico[0].lat, lon: trafico[0].lon })
    } catch (error) {
        console.log('Error en la consulta getChartHoraEstacion', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartHoraEstacion'})
    }
}

export const getChartFechaDistrito = async(req, res) => {
    try {
        const { fecha1, fecha2, codigo } = req.query
        var fechaInicio
        var fechaFin

        if(fecha1 <= fecha2) {
            fechaInicio = moment(fecha1, 'YYYY-MM-DD')
            fechaFin = moment(fecha2, 'YYYY-MM-DD')
        } else {
            fechaInicio = moment(fecha2, 'YYYY-MM-DD')
            fechaFin = moment(fecha1, 'YYYY-MM-DD')
        }

        const distritoBD = await DistritoModel.findAll({
            where: {
                codigo: codigo
            },
            required: true,
            include: [{
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [{
                            model: TraficoModel,
                            as: 'aforos',
                            where: {
                                fecha: {
                                    [Op.between]: [fechaInicio, fechaFin]
                                }
                            },
                            
                        }]
                }],
        })
        
        /**
         * CAMBIAR EL CODIGO DE aforos:
         * CREAR UNA LISTA CON ESTA ESTRUCTURA:
         * aforos = [
         *      {
         *          estacion: 2,
         *          lat,
         *          lon,
         *          nombre,
         *          trafico: [
         *              {
         *                  aforo: 100,
         *                  fecha: 2023-11-11
         *              },
         *              {
         *                  aforo: 78,
         *                  fecha: 2023-11-12
         *              }, ...
         *              ] 
         *      },
         *      {
         *          estacion: 3,
         *          lat,
         *          lon,
         *          nombre,
         *          trafico: [
         *              {
         *                  aforo: 45,
         *                  fecha: 2023-11-11
         *              },
         *              {
         *                  aforo: 150,
         *                  fecha: 2023-11-12
         *              },...
         *              ]
         *      },...
         * ]
         */

        //En aforos almaceno los datos de cada estacion por separado
        var aforos = []
        distritoBD[0].barrios.forEach((barrio) => {
            barrio.aforos.forEach((estacion) => {
                var encontrado = aforos.find(el => el.estacion === estacion.estacion)
                var aforo = estacion.trafico.reduce((total, traficoActual) => total + traficoActual, 0)
                if(encontrado) {
                    var encontrado2 = encontrado.trafico.find(el => el.fecha === estacion.fecha)
                    if(encontrado2) {
                        encontrado2.aforo += aforo
                    } else {
                        encontrado.trafico.push({
                            aforo: aforo,
                            fecha: estacion.fecha
                        })
                    }
                } else {
                    var trafico = []
                    trafico.push({
                        aforo: aforo,
                        fecha: estacion.fecha
                    })
                    aforos.push({
                        estacion: estacion.estacion,
                        lat: estacion.lat,
                        lon: estacion.lon,
                        nombre: estacion.nombre,
                        trafico: trafico
                    })
                }
            })
        })

        var distrito = []
        var diferenciaDias = fechaFin.diff(fechaInicio, 'days')
        var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
        for(let i = 0; i < (diferenciaDias + 1); i++) {
            var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
            fechaActual.add(i, 'days')
            var aforoDistrito = 0
            aforos.forEach((estacion) => {
                var encontrado = estacion.trafico.find(el => fechaActual.isSame(el.fecha, 'day'))
                if(encontrado) {
                    aforoDistrito += encontrado.aforo
                }
            })
            
            distrito.push({
                fecha: fechaActual.format('YYYY-MM-DD'),
                aforo: aforoDistrito
            })
        }
        //Los aforos de distrito ya estan ordenados por la fecha

        //Ahora ordeno el trafico de los aforos
        /*aforos.forEach((aforo) => {
            aforo.trafico = aforo.trafico.sort((a, b) => {
                var dateA = new Date(a.fecha)
                var dateB = new Date(b.fecha)

                return dateA - dateB
            })
        })*/

        var centro = calcularPuntoMedio(distritoBD[0].delimitaciones)
        res.json({ trafico: distrito, aforos, nombre: distritoBD[0].nombre, codigo: distritoBD[0].codigo, delimitaciones: distritoBD[0].delimitaciones, centro })
    } catch (error) {
        console.log('Error en la consulta getChartFechaDistrito', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartFechaDistrito'})
    }
}

export const getChartHoraDistrito = async(req, res) => {
    try {
        const { hora1, hora2, codigo } = req.query

        var min = hora1
        var max = hora2

        min = min.split(':')
        max = max.split(':')

        var horaMin = new Date()
        horaMin.setHours(parseInt(min[0]), parseInt(min[1]), 0)

        var horaMax = new Date()
        horaMax.setHours(parseInt(max[0]), parseInt(max[1]), 0)

        const distritoBD = await DistritoModel.findAll({
            where: {
                codigo: codigo
            },
            required: true,
            include: [{
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [{
                            model: TraficoModel,
                            as: 'aforos',
                            
                        }]
                }],
        })

        /**
         * Relleno el array de aforos. Inicialmente estara desordenado. Por ejemplo:
         * Si horaMin = 23:00 y horaMax = 2:00
         * aforos = [
         *          {
         *              estacion: 1,
         *              trafico: [
         *                  {
         *                      hora: 01:00,
         *                      aforo: 143
         *                  },
         *                  {
         *                      hora: 02:00,
         *                      aforo: 122
         *                  },...
         *              ]
         *          },...
         *      ]
         */
        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()
        var aforos = []
        distritoBD[0].barrios.forEach((barrio) => {
            barrio.aforos.forEach((estacion) => {
                var encontrado = aforos.find(el => el.estacion === estacion.estacion)
                if (!encontrado) {
                    encontrado = {
                        estacion: estacion.estacion,
                        lat: estacion.lat,
                        lon: estacion.lon,
                        nombre: estacion.nombre,
                        trafico: []
                    };
                    aforos.push(encontrado);
                }
                for(let i = 0; i < estacion.trafico.length; i++) {
                    if((horaMin < horaMax && horaMin <= (i+1) && (i+1) <= horaMax) || (horaMax < horaMin && (horaMin <= (i+1) || (i+1) <= horaMax))) {
                        var hora = (i + 1) < 10 ? `0${i+1}:00` : `${i+1}:00`
                        var encontrado2 = encontrado.trafico.find(el => el.hora === hora)
                        if(encontrado2) {
                            encontrado2.aforo += estacion.trafico[i]
                        } else {
                            encontrado.trafico.push({
                                aforo: estacion.trafico[i],
                                hora: hora
                            })
                        }          
                    }
                }
            })
        })


        //Relleno el array del distrito (este si estara ordenado desde el principio)
        var distrito = []
        horaMax = (horaMax+1) % 25 === 0 ? 1 : (horaMax+1)
        for(let horaActual = horaMin; horaActual !== horaMax; horaActual++) {
            horaActual = horaActual % 25
            horaActual = horaActual === 0 ? 1 : horaActual
            var horaString = horaActual < 10 ? `0${horaActual}:00` : `${horaActual}:00`
            var aforoDistrito = 0
            aforos.forEach((estacion) => {
                var encontrado = estacion.trafico.find(el => el.hora === horaString)
                if(encontrado) {
                    aforoDistrito += encontrado.aforo
                }
            })

            distrito.push({
                hora: horaString,
                aforo: aforoDistrito
            })
        }

        //Ordeno el trafico de cada estacion
        if(horaMin < 10) {
            horaMin = `0${horaMin}:00`
        } else {
            horaMin = `${horaMin}:00`
        }
        var aforos_ordenado = []
        aforos.forEach((estacion) => {
            var trafico_ordenado = []
            
            var idx = estacion.trafico.findIndex((el) => el.hora === horaMin)
            for(let i = 0; i < estacion.trafico.length; i++) {
                trafico_ordenado[i] = estacion.trafico[idx]
                idx = (idx + 1) % estacion.trafico.length
            }
            aforos_ordenado.push({
                estacion: estacion.estacion,
                lat: estacion.lat,
                lon: estacion.lon,
                nombre: estacion.nombre,
                trafico: trafico_ordenado,
            })
        })

        var centro = calcularPuntoMedio(distritoBD[0].delimitaciones)
        res.json({ trafico: distrito, aforos: aforos_ordenado, nombre: distritoBD[0].nombre, codigo: distritoBD[0].codigo, delimitaciones: distritoBD[0].delimitaciones, centro })
    } catch (error) {
        console.log('Error en la consulta getChartHoraDistrito', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartHoraDistrito'})
    }
}

export const getChartFechaBarrio = async (req, res) => {
    try {
        const { fecha1, fecha2, id } = req.query

        console.log('Llega al controler: fecha1 | fecha2 | id = ' + fecha1 + ' | ' + fecha2 + ' | ' + id)

        var fechaInicio
        var fechaFin

        if(fecha1 <= fecha2) {
            fechaInicio = moment(fecha1, 'YYYY-MM-DD')
            fechaFin = moment(fecha2, 'YYYY-MM-DD')
        } else {
            fechaInicio = moment(fecha2, 'YYYY-MM-DD')
            fechaFin = moment(fecha1, 'YYYY-MM-DD')
        }

        const barrioBD = await BarrioModel.findByPk(id, {
            include: [
                {
                    model: TraficoModel,
                    as: 'aforos',
                    where: {
                        fecha: {
                            [Op.between]: [fechaInicio, fechaFin]
                        }
                    }
                }
            ]
        })

        var aforos = []
        barrioBD.aforos.forEach((estacion) => {
            var encontrado = aforos.find(aforo => aforo.estacion === estacion.estacion)
            var aforo = estacion.trafico.reduce((total, traficoActual) => total + traficoActual, 0)
            if(encontrado) {
                var encontrado2 = encontrado.trafico.find(el => el.fecha === estacion.fecha)
                if(encontrado2) {
                    encontrado2.aforo += aforo
                } else {
                    encontrado.trafico.push({
                        aforo: aforo,
                        fecha: estacion.fecha
                    })
                }
            } else {
                var trafico = []
                trafico.push({
                    aforo: aforo,
                    fecha: estacion.fecha
                })
                aforos.push({
                    estacion: estacion.estacion,
                    lat: estacion.lat,
                    lon: estacion.lon,
                    nombre: estacion.nombre,
                    trafico: trafico
                })
            }
        })

        var barrio = []
        var diferenciaDias = fechaFin.diff(fechaInicio, 'days')
        var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
        for(let i = 0; i < (diferenciaDias + 1); i++) {
            var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
            fechaActual.add(i, 'days')
            var aforoBarrio = 0
            aforos.forEach((estacion) => {
                var encontrado = estacion.trafico.find(el => fechaActual.isSame(el.fecha, 'day'))
                if(encontrado) {
                    aforoBarrio += encontrado.aforo
                }
            })
            
            barrio.push({
                fecha: fechaActual.format('YYYY-MM-DD'),
                aforo: aforoBarrio
            })
        }

        var centro = calcularPuntoMedio(barrioBD.delimitaciones)
        res.json({ trafico: barrio, aforos, nombre: barrioBD.nombre, codigo: barrioBD.id, delimitaciones: barrioBD.delimitaciones, centro })

    } catch (error) {
        console.log('Error en la consulta getChartFechaBarrio', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartFechaBarrio'})
    }
}

export const getChartHoraBarrio = async (req, res) => {
    try {
        const { hora1, hora2, id } = req.query

        var min = hora1
        var max = hora2

        min = min.split(':')
        max = max.split(':')

        var horaMin = new Date()
        horaMin.setHours(parseInt(min[0]), parseInt(min[1]), 0)

        var horaMax = new Date()
        horaMax.setHours(parseInt(max[0]), parseInt(max[1]), 0)

        const barrioBD = await BarrioModel.findByPk(id, {
            include: [
                {
                    model: TraficoModel,
                    as: 'aforos'
                }
            ]
        })

        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()
        var aforos = []
        barrioBD.aforos.forEach((estacion) => {
            var encontrado = aforos.find(el => el.estacion === estacion.estacion)
            if (!encontrado) {
                encontrado = {
                    estacion: estacion.estacion,
                    lat: estacion.lat,
                    lon: estacion.lon,
                    nombre: estacion.nombre,
                    trafico: []
                };
                aforos.push(encontrado);
            }
            for(let i = 0; i < estacion.trafico.length; i++) {
                if((horaMin < horaMax && horaMin <= (i+1) && (i+1) <= horaMax) || (horaMax < horaMin && (horaMin <= (i+1) || (i+1) <= horaMax))) {
                    var hora = (i + 1) < 10 ? `0${i+1}:00` : `${i+1}:00`
                    var encontrado2 = encontrado.trafico.find(el => el.hora === hora)
                    if(encontrado2) {
                        encontrado2.aforo += estacion.trafico[i]
                    } else {
                        encontrado.trafico.push({
                            aforo: estacion.trafico[i],
                            hora: hora
                        })
                    }          
                }
            }
        })

        var barrio = []
        horaMax = (horaMax+1) % 25 === 0 ? 1 : (horaMax+1)
        for(let horaActual = horaMin; horaActual !== horaMax; horaActual++) {
            horaActual = horaActual % 25
            horaActual = horaActual === 0 ? 1 : horaActual
            var horaString = horaActual < 10 ? `0${horaActual}:00` : `${horaActual}:00`
            var aforoBarrio = 0
            aforos.forEach((estacion) => {
                var encontrado = estacion.trafico.find(el => el.hora === horaString)
                if(encontrado) {
                    aforoBarrio += encontrado.aforo
                }
            })

            barrio.push({
                hora: horaString,
                aforo: aforoBarrio
            })
        }

        //Ordeno el trafico de cada estacion
        if(horaMin < 10) {
            horaMin = `0${horaMin}:00`
        } else {
            horaMin = `${horaMin}:00`
        }
        var aforos_ordenado = []
        aforos.forEach((estacion) => {
            var trafico_ordenado = []
            
            var idx = estacion.trafico.findIndex((el) => el.hora === horaMin)
            for(let i = 0; i < estacion.trafico.length; i++) {
                trafico_ordenado[i] = estacion.trafico[idx]
                idx = (idx + 1) % estacion.trafico.length
            }
            aforos_ordenado.push({
                estacion: estacion.estacion,
                lat: estacion.lat,
                lon: estacion.lon,
                nombre: estacion.nombre,
                trafico: trafico_ordenado,
            })
        })

        var centro = calcularPuntoMedio(barrioBD.delimitaciones)
        res.json({ trafico: barrio, aforos: aforos_ordenado, nombre: barrioBD.nombre, codigo: barrioBD.id, delimitaciones: barrioBD.delimitaciones, centro })
    } catch (error) {
        console.log('Error en la consulta getChartHoraBarrio', error.message)
        res.status(500).json({ error: 'Error en la consulta getChartHoraBarrio'})
    }
}

export const filtro = async (req, res) => {
    try {
        const { month, year, sentido, hora1, hora2, fecha1, fecha2 } = req.query

        let whereConditions = {}

        if (month !== '' && year !== '') {
            const fecha = new Date(year, month - 1, 1)
            const fechaInicial = startOfMonth(fecha)
            const fechaFinal = endOfMonth(fecha)

            whereConditions.fecha = {
                [Op.between]: [fechaInicial, fechaFinal]
            }
        } else if (fecha1 !== '' && fecha2 !== '') {
            if (fecha1 === fecha2) {
                whereConditions.fecha = fecha1
            } else {
                whereConditions.fecha = {
                    [Op.between]: [fecha1, fecha2]
                }
            }
        } else if (fecha1 !== '') {
            whereConditions.fecha = {
                [Op.gte]: fecha1
            }
        } else if (fecha2 !== '') {
            whereConditions.fecha = {
                [Op.lte]:  fecha2
            }
        }

        var orientacion
        if (sentido !== '') {
            whereConditions['$orientacione.orientacion$'] = sentido
            orientacion = 'true'
        } else {
            orientacion = 'false'
        }

        // if (hora1 !== '' && hora2 !== '') {
        //     if (hora1 === hora2) {
        //         whereConditions.hora = hora1
        //     } else {
        //         whereConditions.hora = {
        //             [Op.between]: [hora1, hora2]
        //         }
        //     }
        // } else if (hora1 !== '') {
        //     whereConditions.hora = {
        //         [Op.gte]: hora1
        //     }
        // } else if (hora2 !== '') {
        //     whereConditions.hora = {
        //         [Op.lte]: hora2
        //     }
        // }

        let horaMin, horaMax
        if (hora1 !== '' && hora2 !== '') {
            if (hora1 < horaMax) {
            horaMin = hora1
            horaMax = hora2
            console.log('1 | horaMin = ' + horaMin + ' | horaMax = ' + horaMax)
            } else {
                horaMin = hora2
                horaMax = hora1
                console.log('2 | horaMin = ' + horaMin + ' | horaMax = ' + horaMax)
            }
        } else {
            horaMin = null
            horaMax = null
        }

        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: whereConditions,
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaMin, horaMax)
        
        console.log('Orientacion = ' + sentido)

        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta filtro', error.message)
        res.status(500).json({ error: 'Error en la consulta filtro'})
    }
}

//BUSCAR POR MES (Y AÑO)
export const getTraficoPorMes = async(req, res) => {
    try {
        const { month, year, orientacion } = req.query

        const fecha = new Date(year, month - 1, 1)
        const fechaInicial = startOfMonth(fecha)
        const fechaFinal = endOfMonth(fecha)

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicial, fechaFinal]
                }
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, null, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMes', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMes'})
    }
}

//BUSCAR POR SENTIDO
export const getTraficoPorSentido = async(req, res) => {
    try {
        const { sentido } = req.query
        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', null, null)
        
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorSentido'})
    }
}

//BUSCAR ENTRE HORAS
export const getTraficoEntreHoras = async(req, res) => {
    try {
        var { hora1, hora2 } = req.query

        console.log('Hora1 = ' + hora1)
        hora1 = hora1.split(':')
        hora2 = hora2.split(':')

        var horaMin = new Date()
        var horaMax = new Date()
        if(hora1 < hora2) {
            horaMin.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
            horaMax.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
        } else {
            horaMin.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
            horaMax.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
        }   
        

        horaMin = horaMin.getHours()
        horaMax = horaMax.getHours()
        
        const trafico = await TraficoModel.findAll({
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'false', horaMin, horaMax)

        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoEntreHoras', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoEntreHoras'})
    }
}

//BUSCAR POR FECHA CONCRETA
export const getTraficoPorFechaConcreta = async(req, res) => {
    try {
        const { fecha, orientacion } = req.query

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: fecha
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, null, null)
        
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorFechaConcreta', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorFechaConcreta'})
    }
}

//BUSCAR ENTRE FECHAS
export const getTraficoEntreFechas = async(req, res) => {
    try {
        const { fecha1, fecha2, orientacion } = req.query
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
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, null, null)
        
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoEntreFechas', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoEntreFechas'})
    }
}

//BUSCAR POR HORA CONCRETA
export const getTraficoPorHoraConcreta = async(req, res) => {
    try {
        const { hora, orientacion } = req.query

        var split = hora.split(':')

        var horaDate = new Date()
        horaDate.setHours(split[0], split[1], 0)
        horaDate = horaDate.getHours()

        const trafico = await TraficoModel.findAll({
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaDate, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorHora', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorHora'})
    }
}
//------------------------------FILTRO CON 2 ATRIBUTOS-----------------------------------------------//
//MES (Y AÑO) +
//BUSCAR POR MES + SENTIDO
export const getTraficoPorMesSentido = async(req, res) => {
    try {
        const { month, year, sentido } = req.query
        
        const fecha = new Date(year, month - 1, 1)
        const fechaInicial = startOfMonth(fecha)
        const fechaFinal = endOfMonth(fecha)

        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido,
                fecha: {
                    [Op.between]: [fechaInicial, fechaFinal]
                }
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', null, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMesSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMesSentido'})
    }
}

//BUSCAR POR MES + HORA CONCRETA
export const getTraficoPorMesHoraConcreta = async(req, res) => {
    try {
        const { month, year, orientacion, hora } = req.query

        var split = hora.split(':')
        var horaDate = new Date()
        horaDate.setHours(split[0], split[1], 0)
        horaDate = horaDate.getHours()

        const fecha = new Date(year, month - 1, 1)
        const fechaInicial = startOfMonth(fecha)
        const fechaFinal = endOfMonth(fecha)

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicial, fechaFinal]
                }
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaDate, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMesHoraConcreta', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMesHoraConcreta'})
    }
}

//BUSCAR POR MES + ENTRE HORAS
export const getTraficoPorMesEntreHoras = async(req, res) => {
    try {
        var { month, year, orientacion, hora1, hora2 } = req.query

        hora1 = hora1.split(':')
        hora2 = hora2.split(':')
        var horaMin = new Date()
        var horaMax = new Date()
        if(hora1 < hora2) {
            horaMin.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
            horaMax.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
        } else {
            horaMin.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
            horaMax.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
        }   

        const fecha = new Date(year, month - 1, 1)
        const fechaInicial = startOfMonth(fecha)
        const fechaFinal = endOfMonth(fecha)

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicial, fechaFinal]
                }
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaMin, horaMax)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorMesEntreHoras', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorMesEntreHoras'})
    }
}

//--------------------------------------------------------------------------
//FECHA CONCRETA +
//BUSCAR POR FECHA CONCRETA + SENTIDO
export const getTraficoPorFechaConcretaSentido = async(req, res) => {
    try {
        const { fecha, sentido } = req.query

        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido,
                fecha: fecha
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', null, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorFechaConcretaSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorFechaConcretaSentido'})
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA
export const getTraficoPorFechaConcretaHoraConcreta = async(req, res) => {
    try {
        const { fecha, orientacion, hora } = req.query

        var split = hora.split(':')

        var horaDate = new Date()
        horaDate.setHours(split[0], split[1], 0)
        horaDate = horaDate.getHours()

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: fecha
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, hora, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorFechaConcretaHoraConcreta', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorFechaConcretaHoraConcreta'})
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS
export const getTraficoPorFechaConcretaEntreHoras = async(req, res) => {
    try {
        var { fecha, orientacion, hora1, hora2 } = req.query

        hora1 = hora1.split(':')
        hora2 = hora2.split(':')
        var horaMin = new Date()
        var horaMax = new Date()
        if(hora1 < hora2) {
            horaMin.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
            horaMax.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
        } else {
            horaMin.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
            horaMax.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
        }   

        const trafico = await TraficoModel.findAll({
            where: {
                fecha: fecha
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaMin, horaMax)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorFechaConcretaEntreHoras', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorFechaConcretaEntreHoras'})
    }
}

//--------------------------------------------------------------------------
//ENTRE FECHAS +
//BUSCAR POR ENTRE FECHAS + SENTIDO
export const getTraficoPorEntreFechasSentido = async(req, res) => {
    try {
        const { fecha1, fecha2, sentido } = req.query

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
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido,
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', null, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorEntreFechasSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorEntreFechasSentido'})
    }
}

//BUSCAR POR ENTRE FECHAS + HORA CONCRETA
export const getTraficoPorEntreFechasHoraConcreta = async(req, res) => {
    try {
        const { fecha1, fecha2, orientacion, hora } = req.query

        var split = hora.split(':')
        var horaDate = new Date()
        horaDate.setHours(split[0], split[1], 0)
        horaDate = horaDate.getHours()

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
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaDate, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorEntreFechasHoraConcreta', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorEntreFechasHoraConcreta'})
    }
}

//BUSCAR POR ENTRE FECHAS + ENTRE HORAS
export const getTraficoPorEntreFechasEntreHoras = async(req, res) => {
    try {
        var { fecha1, fecha2, orientacion, hora1, hora2 } = req.query

        hora1 = hora1.split(':')
        hora2 = hora2.split(':')
        var horaMin = new Date()
        var horaMax = new Date()
        if(hora1 < hora2) {
            horaMin.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
            horaMax.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
        } else {
            horaMin.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
            horaMax.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
        }   

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
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, orientacion, horaMin, horaMax)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorEntreFechasEntreHoras', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorEntreFechasEntreHoras'})
    }
}

//--------------------------------------------------------------------------
//BUSCAR POR HORA CONCRETA + SENTIDO
export const getTraficoPorHoraConcretaSentido = async(req, res) => {
    try {
        const { hora, sentido } = req.query

        var split = hora.split(':')

        var horaDate = new Date()
        horaDate.setHours(split[0], split[1], 0)
        horaDate = horaDate.getHours()

        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', horaDate, null)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorHoraConcretaSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorHoraConcretaSentido'})
    }
}

//--------------------------------------------------------------------------
//BUSCAR POR ENTRE HORAS + SENTIDO
export const getTraficoPorEntreHorasSentido = async(req, res) => {
    try {
        var { hora1, hora2, sentido } = req.query

        hora1 = hora1.split(':')
        hora2 = hora2.split(':')
        var horaMin = new Date()
        var horaMax = new Date()
        if(hora1 < hora2) {
            horaMin.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
            horaMax.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
        } else {
            horaMin.setHours(parseInt(hora2[0]), parseInt(hora2[1]), 0)
            horaMax.setHours(parseInt(hora1[0]), parseInt(hora1[1]), 0)
        }   

        const trafico = await TraficoModel.findAll({
            include: [{ model: OrientacionModel, as: 'orientacione' }],
            where: {
                '$orientacione.orientacion$': sentido
            },
            attributes: ['id']
        })

        const traficoId = trafico.map(el => el.id)

        const { distritos, barrios, estaciones_trafico, media_total } = await traficoAux(traficoId, 'true', horaMin, horaMax)
        res.json({ distritos, barrios, estaciones_trafico, media_total })
    } catch (error) {
        console.log('Error en la consulta getTraficoPorEntreHorasSentido', error.message)
        res.status(500).json({ error: 'Error en la consulta getTraficoPorEntreHorasSentido'})
    }
}

/**
 * Lectura del csv del trafico de noviembre de 2023. A pesar de que el total de lineas en el csv sean 7080 en la bd se almacenan 6540 porque
 * hay lineas que almacenan 0 trafico durante todo el dia (por razones desconocidas). Esas lineas no las almacenamos en la BD
 */
export const leerCSV = async(req, res) => {
    try {
        const barrios = await BarrioModel.findAll()
        var i = 0

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
        var estaciones = []     //Aqui almaceno los datos leidos en el primer csv (nombre, nº estacion, lat y lon, orientacion)
        var aforos = []         //Aqui almaceno los datos definitivos que subire a la bd
        let promises = []

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
                if(row.Sentido !== '' && row['Orient.'] !== '') {
                    estaciones.push({estacion: cod_estacion, nombre: row.Nombre, lat: row.Latitud, lon: row.Longitud, sentido: row.Sentido, orient: row['Orient.']})
                    console.log('Est = ' + cod_estacion + ' | Orient = ' + row['Orient.'])
                }
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

        //Me estaba dando error al obtener el atributo FDIA del row. Con esta configuracion del csv-parser se ha solucionado
        const csvParserOptions = {
            separator: ';', // Define el delimitador, por ejemplo, ';' para CSV con separador de punto y coma
            mapHeaders: ({ header }) => header.trim(), // Función para mapear y limpiar los encabezados si es necesario
            mapValues: ({ header, index, value }) => value.trim() // Función para mapear y limpiar los valores si es necesario
        }; 

        // Lectura del csv desde la web 
        const urlCSV2 = 'https://datos.madrid.es/egob/catalogo/300233-141-aforo-trafico-permanentes.csv'
        const response2 = await axios.get(urlCSV2, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        const csvStream = response2.data.pipe(csvParser(csvParserOptions))
        
        // Ruta al archivo CSV en tu directorio local
        //const filePath2 = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/AforoPermanente/AforoPermanenteNoviembre2023.csv';

        // Leer el archivo CSV localmente
        //const fileStream2 = fs.createReadStream(filePath2, { encoding: 'utf-8' });       
        //fileStream2.pipe(csvParser(csvParserOptions))
        csvStream.on('data', async (row) => {
                i++
                if(i > 0) {
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
                        
                        var sentido = row.FSEN.substring(0,1)


                        let est = estaciones.find(estacionActual => estacionActual.estacion === parseInt(estacion) && estacionActual.sentido === sentido)
                        if(est) {
                            var cadLat = est.lat.replace(',', '.')
                            var latitude = parseFloat(cadLat)

                            var cadLon = est.lon.replace(',', '.')
                            var longitude = parseFloat(cadLon)

                            var barrio = encontrarZona(latitude, longitude, barrios)
                            if(barrio !== null) {
                                var orientacion
                                switch(est.orient) {
                                    case 'N-S':
                                        orientacion = 1
                                        break
                                    case 'S-N':
                                        orientacion = 2
                                        break
                                    case 'E-O':
                                        orientacion = 3
                                        break
                                    default:
                                        orientacion = 4
                                }
                                
                                var traf = [parseInt(row.HOR1), parseInt(row.HOR2), parseInt(row.HOR3),
                                            parseInt(row.HOR4), parseInt(row.HOR5), parseInt(row.HOR6),
                                            parseInt(row.HOR7), parseInt(row.HOR8), parseInt(row.HOR9), 
                                            parseInt(row.HOR10), parseInt(row.HOR11), parseInt(row.HOR12)]
                                var partesFecha = row['FDIA'].split('/')
                                var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]

                                var encontrado = aforos.find(el => el.fecha === nuevaFecha && el.estacion === estacion && el.orientacion === orientacion)
                                if(encontrado) {
                                    if((row.FSEN.substring(1,2)) === '-') {     //Jornada de mañana (añado los datos al inicio de la lista trafico)
                                        encontrado.trafico.unshift(parseInt(row.HOR1), parseInt(row.HOR2), parseInt(row.HOR3),
                                                                    parseInt(row.HOR4), parseInt(row.HOR5), parseInt(row.HOR6),
                                                                    parseInt(row.HOR7), parseInt(row.HOR8), parseInt(row.HOR9), 
                                                                    parseInt(row.HOR10), parseInt(row.HOR11), parseInt(row.HOR12))
                                    } else {    //Jornada de tarde (añado los datos al final de la lista trafico)
                                        encontrado.trafico.push(parseInt(row.HOR1), parseInt(row.HOR2), parseInt(row.HOR3),
                                                                parseInt(row.HOR4), parseInt(row.HOR5), parseInt(row.HOR6),
                                                                parseInt(row.HOR7), parseInt(row.HOR8), parseInt(row.HOR9), 
                                                                parseInt(row.HOR10), parseInt(row.HOR11), parseInt(row.HOR12))
                                    }
                                    promises.push(createTrafico(encontrado))
                                } else {
                                    aforos.push({ fecha: nuevaFecha, estacion, orientacion, barrio: barrio.id, trafico: traf, latitude, longitude, nombre: est.nombre })
                                }
                            } 
                        } else{
                            console.log('UNDEFINED = ' + estacion)
                        }
                         
                    }
                }
                
            })
            .on('end', async() => {
                try {
                    await Promise.all(promises);
                    console.log("Procesamiento del CSV de aforos de trafico completo.");
                    res.json("Aforos creados correctamente");
                  } catch (error) {
                    console.error("Error al crear los aforos:", error);
                    res.status(500).json({ message: "Error al crear los aforos" });
                  }
            });
    } catch (error) {
        console.error('Error al leerCSV de las estaciones de trafico y/o aforos:', error.message);
        res.status(500).json({ error: 'Error al leerCSV de las estaciones de trafico y/o aforos.' });
    }
}

const createTrafico = (data) => {
    return new Promise((resolve, reject) => {
      TraficoModel.create({
        'fecha': data.fecha,
        'estacion': data.estacion,
        'lat': data.latitude,
        'lon': data.longitude,
        'nombre': data.nombre,
        'trafico': data.trafico,
        'barrioId': data.barrio,
        'orientacioneId': data.orientacion
      })
        .then(() => {
          console.log(`Datos de tráfico creados`);
          resolve();
        })
        .catch((error) => {
          console.error(`Error al crear datos de tráfico:`, error);
          reject(error);
        });
    });
  };