import {
    AccidenteModel, Tipo_AccidenteModel, Tipo_PersonaModel, Tipo_VehiculoModel,
    SexoModel, ClimaModel, LesividadModel
} from '../models/AccidenteModel.js'
import axios from 'axios'
import proj4 from 'proj4'   //Convertir coordenadas UTM en geograficas
import csvParser from 'csv-parser'  //Leer archivo csv
import { Sequelize, Op } from 'sequelize'

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'
import { BarrioModel, DistritoModel } from '../models/DistritoModel.js'
import { calcularPuntoMedio, encontrarZona } from './DistritoController.js'

import moment from 'moment'
/*
Coches = 48830 | Con la asociacion de los barrios se queda en 48808
Bicis = 906 | 897
Total = 49736 | 49705
*/

export const getSexo = async (req, res) => {
    try {
        const sexo = await SexoModel.findAll()

        res.json(sexo)
    } catch (error) {
        console.log('Error en la consulta getSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta getSexo' })
    }
}

export const getTipoPersona = async (req, res) => {
    try {
        const tipo_persona = await Tipo_PersonaModel.findAll()

        res.json(tipo_persona)
    } catch (error) {
        console.log('Error en la consulta getTipoPersona: ', error)
        res.status(500).json({ message: 'Error en la consulta getTipoPersona' })
    }
}

export const getTipoAccidente = async (req, res) => {
    try {
        const tipo_accidente = await Tipo_AccidenteModel.findAll()

        res.json(tipo_accidente)
    } catch (error) {
        console.log('Error en la consulta getTipoAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta getTipoAccidente' })
    }
}

export const getTipoVehiculo = async (req, res) => {
    try {
        const tipo_vehiculo = await Tipo_VehiculoModel.findAll()

        res.json(tipo_vehiculo)
    } catch (error) {
        console.log('Error en la consulta getTipoVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta getTipoVehiculo' })
    }
}

export const getClima = async (req, res) => {
    try {
        const clima = await ClimaModel.findAll()

        res.json(clima)
    } catch (error) {
        console.log('Error en la consulta getClima: ', error)
        res.status(500).json({ message: 'Error en la consulta getClima' })
    }
}

export const getLesividad = async (req, res) => {
    try {
        const lesividad = await LesividadModel.findAll()

        res.json(lesividad)
    } catch (error) {
        console.log('Error en la consulta getLesividad: ', error)
        res.status(500).json({ message: 'Error en la consulta getLesividad' })
    }
}

export const getAllAccidentes = async (req, res) => {
    try {
        /*
        const accidentes = await AccidenteModel.findAll({
            include: [
                { model: SexoModel },
                { model: Tipo_AccidenteModel },
                { model: Tipo_PersonaModel },
                { model: Tipo_VehiculoModel },
                { model: LesividadModel },
                { model: ClimaModel }
            ]
        });*/
        const accidentes = await AccidenteModel.findAll()

        console.log(accidentes.length)
        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta getAllAccidentes: ', error)
        res.status(500).json({ message: 'Error al obtener los accidentes' })
    }
}

/**
 * agrupaciones = [
 *      { zona: array de 4 posiciones donde cada una representa una esquina de la zona en coordenadas,
 *        lesividad: lesividad media,
 *        num_accidentes: total de accidentes dentro de la zona seleccionada,
 *        riesgo: total de accidentes * lesividad media -> En base a esto asociamos el color del peligro de la zona,
 *        
 *      }
 * ]
 */


export const getZonas = async (req, res) => {
    try {

        var accidentes
        accidentes = req.body
        if (accidentes.length === 0) {
            accidentes = await AccidenteModel.findAll()
        }

        //Inicializamos la lista de agrupaciones
        const limite1 = [40.56698051912112, -3.8418246248843606]
        const limite2 = [40.31509361515658, -3.5218478307903602]
        const limite = 0.02     //Las zonas estan delimitadas por este maximo de diferencia en lat y lon
        var agrupaciones_aux = []
        var actual = [40.56698051912112, -3.8418246248843606]

        while (actual[0] > limite2[0]) {
            while (actual[1] < limite2[1]) {
                agrupaciones_aux.push({
                    zona: [[actual[0], actual[1]], [actual[0] + limite, actual[1]],
                    [actual[0] + limite, actual[1] + limite], [actual[0], actual[1] + limite]],
                    lesividad: 0, num_accidentes: 0, riesgo: 0
                })
                actual[1] += limite
            }
            actual[1] = limite1[1]
            actual[0] -= limite
        }

        //Rellenamos la lista de agrupaciones calculando la media de lesion de cada zona
        var diferencia_x
        var diferencia_y
        var dentro
        var i
        accidentes.map((accidente) => {
            agrupaciones_aux.map((agrupacion) => {
                dentro = true
                i = 0
                while (dentro && i < agrupacion.zona.length) {
                    diferencia_x = Math.abs(agrupacion.zona[i][0] - accidente.lat)
                    diferencia_y = Math.abs(agrupacion.zona[i][1] - accidente.lon)
                    if (diferencia_x > limite || diferencia_y > limite) {
                        dentro = false
                    }
                    i++
                }

                //Hemos encontrado la zona correspondiente al accidente
                if (dentro) {
                    var lesion
                    //Calculamos la gravedad de la lesion y la añadimos a la media
                    if (accidente.lesividad === 1 || accidente.lesividad === 2 || accidente.lesividad === 5 ||
                        accidente.lesividad === 6 || accidente.lesividad === 7) {

                        lesion = 2
                    } else if (accidente.lesividad === 3) {
                        lesion = 3
                    } else if (accidente.lesividad === 4) {
                        lesion = 5
                    } else {
                        lesion = 1
                    }

                    agrupacion.lesividad = (agrupacion.lesividad * agrupacion.num_accidentes + lesion) / (agrupacion.num_accidentes + 1)
                    agrupacion.num_accidentes++
                }
            })
        })

        //Sacamos de la lista de agrupacion las zonas que no tienen ningun accidente
        //y calculamos el riesgo medio
        var agrupaciones = []
        var riesgoMedio = 0
        for (let i = 0; i < agrupaciones_aux.length; i++) {
            if (agrupaciones_aux[i].num_accidentes !== 0) {
                agrupaciones_aux[i].riesgo = parseFloat((agrupaciones_aux[i].num_accidentes * agrupaciones_aux[i].lesividad).toFixed(2))
                agrupaciones.push(agrupaciones_aux[i])
                riesgoMedio += agrupaciones_aux[i].riesgo
            }
        }

        riesgoMedio = riesgoMedio / agrupaciones.length

        res.json({ agrupaciones, riesgoMedio })
    } catch (error) {
        console.log('Error en la consulta getZonas: ', error)
        res.status(500).json({ message: 'Error al obtener getZonas' })
    }
}

export const getZona_concreta = async (req, res) => {
    try {
        const { accidentes, zona } = req.body

        var accidentes_dentro = []
        var dentro, i, diferencia_x, diferencia_y
        const limite = 0.02     //El mismo limite que en el metodo getZonas ya que este delimita el tamaño de la zona
        accidentes.map((accidente) => {
            dentro = true
            i = 0
            while (dentro && i < zona.length) {
                diferencia_x = Math.abs(zona[i][0] - accidente.lat)
                diferencia_y = Math.abs(zona[i][1] - accidente.lon)
                if (diferencia_x > limite || diferencia_y > limite) {
                    dentro = false
                }
                i++
            }

            if (dentro) {
                accidentes_dentro.push(accidente)
            }
        })


        res.json(accidentes_dentro)
    } catch (error) {
        console.log('Error en la consulta getZona_concreta: ', error)
        res.status(500).json({ message: 'Error al obtener getZona_concreta' })
    }
}

//--------------------------------------------------------------------------------------------------//
// Leer csv Accidentes COCHE 
/* Formato:
{
  'num_expediente': '2023S000162',
  fecha: '03/01/2023',
  hora: '22:20:00',
  localizacion: 'CALL. BRAVO MURILLO / CALL. HERNANI',
  numero: '116',
  cod_distrito: '6',
  distrito: 'TETUÁN',
  tipo_accidente: 'Colisión fronto-lateral',
  'estado_meteorológico': 'Despejado',
  tipo_vehiculo: 'Furgoneta',
  tipo_persona: 'Conductor',
  rango_edad: 'De 30 a 34 años',
  sexo: 'Hombre',
  cod_lesividad: '14',
  lesividad: 'Sin asistencia sanitaria',
  coordenada_x_utm: '440328.270',
  coordenada_y_utm: '4477759.449',
  positiva_alcohol: 'N',
  positiva_droga: 'NULL'
}
*/
//No llega a insertar 10.000 filas
export const leerCSV_coches = async (req, res) => {
    try {
        let batchCount = 0; // Contador de lotes
        const batchSize = 50; // Tamaño del lote

        const barrios = await BarrioModel.findAll()
        var i = 0
        var contadorFalloBarrio = 0

        //Leemos csv de los accidentes coche 
        // Lectura del csv desde la web

        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300228-26-accidentes-trafico-detalle.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))

            //----------------------------------------------------------------------------------------------
            // Ruta al archivo CSV en tu directorio local
            //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/2023_Accidentalidad.csv';

            // Leer el archivo CSV localmente
            //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
            //fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                i++
                if(i > 16207) {
                    // Procesar cada fila del CSV
                    //console.log(row)

                    var edad
                    if (row.rango_edad.includes('Más de') || row.rango_edad.includes('Menor de')) {
                        edad = parseInt(row.rango_edad.split(' ')[2])
                    } else if (row.rango_edad === 'Desconocido') {
                        edad = -1
                    } else {
                        edad = parseInt(row.rango_edad.split(' ')[1])
                    }
                    //console.log('Edad: ' + edad)

                    var partesFecha = row.fecha.split('/')
                    var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]

                    //console.log('Coordenadas UTM:', parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm));
                    const { latitude, longitude } = UTMtoGPS(parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm))
                    //console.log('Lat / Lon: ' + latitude + ' / ' + longitude)

                    const lesividad = row.cod_lesividad === 'NULL' ? 77 : row.cod_lesividad

                    //console.log('Clima1: ' + row['estado_meteorológico'])

                    var alcohol
                    if (row.positiva_alcohol === 'S') {
                        alcohol = true
                    } else {
                        alcohol = false
                    }

                    var drogas
                    if (row.positiva_droga === '1') {
                        drogas = true
                    } else {
                        drogas = false
                    }

                    var clima
                    if (row['estado_meteorológico'] === 'NULL' || row['estado_meteorológico'] === 'Se desconoce') {
                        clima = 6
                    } else {
                        
                        switch (row['estado_meteorológico']) {
                            case 'Despejado':
                                clima = 1
                                break
                            case 'Nublado':
                                clima = 2
                                break
                            case 'Lluvia débil':
                                clima = 3
                                break
                            case 'LLuvia intensa':
                                clima = 4
                                break
                            case 'Granizando':
                                clima = 5
                            default:
                                console.log('CLIMA = ' + row['estado_meteorológico'])
                        }

                    }

                    var tipo_vehiculo
                    if (row.tipo_vehiculo === 'NULL') {
                        tipo_vehiculo = 16
                    } else {
                        
                        switch (row.tipo_vehiculo) {
                            case 'Todo terreno':
                                tipo_vehiculo = 1
                                break
                            case 'Turismo':
                                tipo_vehiculo = 2
                                break
                            case 'Motocicleta hasta 125cc':
                                tipo_vehiculo = 3
                                break
                            case 'Furgoneta':
                                tipo_vehiculo = 4
                                break
                            case 'Vehículo articulado':
                                tipo_vehiculo = 5
                                break
                            case 'Autobús':
                                tipo_vehiculo = 6
                                break
                            case 'Camión rígido':
                                tipo_vehiculo = 7
                                break
                            case 'Ciclomotor':
                                tipo_vehiculo = 8
                                break
                            case 'Tractocamión':
                                tipo_vehiculo = 9
                                break
                            case 'Motocicleta > 125cc':
                                tipo_vehiculo = 10
                                break
                            case 'Bicicleta':
                                tipo_vehiculo = 11
                                break
                            case 'Otros vehículos con motor':
                                tipo_vehiculo = 12
                                break
                            case 'Bicileta EPAC':
                                tipo_vehiculo = 13
                                break
                            case 'Maquinaria de obras':
                                tipo_vehiculo = 14
                                break
                            default:
                                tipo_vehiculo = 15
                        }

                    }

                    var persona 
                    switch(row.tipo_persona) {
                        case 'Conductor':
                            persona = 1
                            break
                        case 'Pasajero':
                            persona = 2
                            break
                        case 'Peatón':
                            persona = 3
                            break
                        default:
                            persona = 4
                    }


                    var tipo_accidente
                    switch(row.tipo_accidente) {
                        case 'Otro':
                            tipo_accidente = 8
                            break
                        case 'Colisión múltiple':
                            tipo_accidente = 2
                            break
                        case 'Alcance':
                            tipo_accidente = 3
                            break
                        case 'Choque contra obstáculo fijo':
                            tipo_accidente = 4
                            break
                        case 'Atropello a persona':
                            tipo_accidente = 5
                            break
                        case 'Vuelco':
                            tipo_accidente = 6
                            break
                        case 'Caída':
                            tipo_accidente = 7
                            break
                        default:
                            tipo_accidente = 1
                    }

                    var sexo 
                    switch(row.sexo) {
                        case 'Mujer':
                            sexo = 1
                            break
                        case 'Hombre':
                            sexo = 2
                            break
                        default:
                            sexo = 3
                    }

                    if (latitude !== -1 && longitude !== -1) {
                        
                        var barrio = encontrarZona(latitude, longitude, barrios)
                        if(barrio !== null) {
                            await AccidenteModel.create({
                                'fecha': nuevaFecha,
                                'hora': row.hora,
                                'localizacion': row.localizacion,
                                'tipoAccidenteId': tipo_accidente,
                                'climaId': clima,
                                'tipoVehiculoId': tipo_vehiculo,
                                'tipoPersonaId': persona,
                                'sexoId': sexo,
                                'lesividadeCodigo': lesividad,
                                'edad': edad,
                                'lat': latitude,
                                'lon': longitude,
                                'alcohol': alcohol,
                                'drogas': drogas,
                                'barrioId': barrio.id
                            })
                        }
                    } else {
                        contadorFalloBarrio++
                        console.log('FALLO BARRIO = ' + latitude + ' ' + longitude)
                    }
                }

                

                // Incrementar el contador de lotes
                batchCount++;

                // Si hemos alcanzado el tamaño del lote, hacemos una pausa
                if (batchCount === batchSize) {
                    // Agregar una espera de 10 segundos entre lotes
                    await new Promise(resolve => setTimeout(resolve, 40000));

                    // Reiniciar el contador de lotes
                    batchCount = 0;
                }

                // Agregar una espera de 100 milisegundos entre cada iteración
                await new Promise(resolve => setTimeout(resolve, 10000));

            })
            .on('end', () => {
                console.log('Procesamiento del CSV de accidentes completo.');
                console.log('Total fallos barrio = ' + contadorFalloBarrio)
                res.json('Accidentes creados correctamente')
            });

    } catch (error) {
        console.error('Error al leerCSV de los accidentes de COCHES:', error.message);
        res.status(500).json({ error: 'Error al leerCSV de los accidentes de COCHES.' });
    }
}

// Leer csv Accidentes BICIS
/* Formato
{
  'num_expediente': '2023S024922',
  fecha: '09/07/2023',
  hora: '13:02:00',
  localizacion: 'CALL. NUESTRA SEÑORA DE VALVERDE / GTA. FUENTE DE LA CARRA',
  numero: '145',
  cod_distrito: '8',
  distrito: 'FUENCARRAL-EL PARDO',
  tipo_accidente: 'Colisión múltiple',
  'estado_meteorológico': 'Despejado',
  tipo_vehiculo: 'Bicicleta',
  tipo_persona: 'Conductor',
  rango_edad: 'De 60 a 64 años',
  sexo: 'Hombre',
  cod_lesividad: '7',
  lesividad: 'Asistencia sanitaria sólo en el lugar del accidente',
  coordenada_x_utm: '441842.996',
  coordenada_y_utm: '4483394.358',
  positiva_alcohol: 'N',
  positiva_droga: 'NULL'
}
*/
export const leerCSV_bicis = async (req, res) => {
    try {
        const barrios = await BarrioModel.findAll()
        var contadorFalloBarrio = 0

        //Leemos csv de los accidentes bici 
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300110-26-accidentes-bicicleta.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))
        */
        // Ruta al archivo CSV en tu directorio local
        const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Accidentes bicis/accidentes_bicicletas_2023.csv';

        // Leer el archivo CSV localmente
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

        fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                // Procesar cada fila del CSV
                console.log(row)

                var edad
                if (row.rango_edad.includes('Más de') || row.rango_edad.includes('Menor de')) {
                    edad = parseInt(row.rango_edad.split(' ')[2])
                } else if (row.rango_edad === 'Desconocido') {
                    edad = -1
                } else {
                    edad = parseInt(row.rango_edad.split(' ')[1])
                }
                //console.log('Edad: ' + edad)

                var partesFecha = row.fecha.split('/')
                var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]

                //console.log('Coordenadas UTM:', parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm));
                const { latitude, longitude } = UTMtoGPS(parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm))
                //console.log('Lat / Lon: ' + latitude + ' / ' + longitude)

                const lesividad = row.cod_lesividad === 'NULL' ? 77 : row.cod_lesividad

                //console.log('Clima1: ' + row['estado_meteorológico'])

                var alcohol
                if (row.positiva_alcohol === 'S') {
                    alcohol = true
                } else {
                    alcohol = false
                }

                var drogas
                if (row.positiva_droga === '1') {
                    drogas = true
                } else {
                    drogas = false
                }

                var clima
                if (row['estado_meteorológico'] === 'NULL' || row['estado_meteorológico'] === 'Se desconoce') {
                    clima = 6
                } else {
                    
                    switch (row['estado_meteorológico']) {
                        case 'Despejado':
                            clima = 1
                            break
                        case 'Nublado':
                            clima = 2
                            break
                        case 'Lluvia débil':
                            clima = 3
                            break
                        case 'LLuvia intensa':
                            clima = 4
                            break
                        case 'Granizando':
                            clima = 5
                        default:
                            console.log('CLIMA = ' + row['estado_meteorológico'])
                    }

                }

                var tipo_vehiculo
                if (row.tipo_vehiculo === 'NULL') {
                    tipo_vehiculo = 16
                } else {
                    
                    switch (row.tipo_vehiculo) {
                        case 'Todo terreno':
                            tipo_vehiculo = 1
                            break
                        case 'Turismo':
                            tipo_vehiculo = 2
                            break
                        case 'Motocicleta hasta 125cc':
                            tipo_vehiculo = 3
                            break
                        case 'Furgoneta':
                            tipo_vehiculo = 4
                            break
                        case 'Vehículo articulado':
                            tipo_vehiculo = 5
                            break
                        case 'Autobús':
                            tipo_vehiculo = 6
                            break
                        case 'Camión rígido':
                            tipo_vehiculo = 7
                            break
                        case 'Ciclomotor':
                            tipo_vehiculo = 8
                            break
                        case 'Tractocamión':
                            tipo_vehiculo = 9
                            break
                        case 'Motocicleta > 125cc':
                            tipo_vehiculo = 10
                            break
                        case 'Bicicleta':
                            tipo_vehiculo = 11
                            break
                        case 'Otros vehículos con motor':
                            tipo_vehiculo = 12
                            break
                        case 'Bicileta EPAC':
                            tipo_vehiculo = 13
                            break
                        case 'Maquinaria de obras':
                            tipo_vehiculo = 14
                            break
                        default:
                            tipo_vehiculo = 15
                    }

                }

                var persona 
                switch(row.tipo_persona) {
                    case 'Conductor':
                        persona = 1
                        break
                    case 'Pasajero':
                        persona = 2
                        break
                    case 'Peatón':
                        persona = 3
                        break
                    default:
                        persona = 4
                }


                var tipo_accidente
                switch(row.tipo_accidente) {
                    case 'Colisión doble':
                        tipo_accidente = 1
                        break
                    case 'Colisión múltiple':
                        tipo_accidente = 2
                        break
                    case 'Alcance':
                        tipo_accidente = 3
                        break
                    case 'Choque contra obstáculo fijo':
                        tipo_accidente = 4
                        break
                    case 'Atropello a persona':
                        tipo_accidente = 5
                        break
                    case 'Vuelco':
                        tipo_accidente = 6
                        break
                    case 'Caída':
                        tipo_accidente = 7
                        break
                    default:
                        tipo_accidente = 8
                }

                var sexo 
                switch(row.sexo) {
                    case 'Mujer':
                        sexo = 1
                        break
                    case 'Hombre':
                        sexo = 2
                        break
                    default:
                        sexo = 3
                }

                if (latitude !== -1 && longitude !== -1) {
                    
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if(barrio !== null) {
                        await AccidenteModel.create({
                            'fecha': nuevaFecha,
                            'hora': row.hora,
                            'localizacion': row.localizacion,
                            'tipoAccidenteId': tipo_accidente,
                            'climaId': clima,
                            'tipoVehiculoId': tipo_vehiculo,
                            'tipoPersonaId': persona,
                            'sexoId': sexo,
                            'lesividadeCodigo': lesividad,
                            'edad': edad,
                            'lat': latitude,
                            'lon': longitude,
                            'alcohol': alcohol,
                            'drogas': drogas,
                            'barrioId': barrio.id
                        })
                    }
                } else {
                    contadorFalloBarrio++
                    console.log('FALLO BARRIO = ' + latitude + ' ' + longitude)
                }

                // Agregar una espera de 100 milisegundos entre cada iteración
                await new Promise(resolve => setTimeout(resolve, 10000));

            })
            .on('end', () => {
                console.log('Procesamiento del CSV de accidentes completo.');
                res.json('Accidentes creados correctamente')
            });
    } catch (error) {
        console.error('Error al leerCSV de los accidentes de BICIS:', error.message);
        res.status(500).json({ error: 'Error al leerCSV de los accidentes de BICIS.' });
    }
}

//--------------------------------------------------------------------------------------------------//

export async function accidentesAux(accidentesId) {
    return new Promise(async (resolve, reject) => {
        try {
            const distritos_bd = await DistritoModel.findAll({
                include: [{
                  model: BarrioModel,
                  as: 'barrios',
                  include: [{
                    model: AccidenteModel,
                    as: 'accidentes',
                    where: {
                        id: {
                            [Op.in]: accidentesId
                        }
                    },
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

            /**
            * Ahora creo 2 listas (una con los distritos y otra con los barrios)
            * - En cada una meto la zona con las delimitaciones, los accidentes y la lesividad media de esa zona
            */
            var accidentes = []     
            var distritos = []
            var barrios = []
            var riesgoDistrito = 0  //Riesgo medio entre todos los distritos
            var riesgoBarrio = 0    //Riesgo medio entre todos los barrios
            distritos_bd.forEach((distrito) => {
                var lesividad_distrito = 0
                var accidentes_distrito = 0
                distrito.barrios.forEach((barrio) => {
                    var lesividad_barrio = 0
                    barrio.accidentes.forEach((accidente) => {
                        accidentes.push(accidente)
                        var lesion
                        switch (accidente.lesividad) {
                            case 1:
                            case 5:
                            case 6:
                            case 7:
                                lesion = 2  //LEVE
                                break
                            case 2:
                                lesion = 3  //INTERMEDIA
                                break
                            case 3:
                                lesion = 4  //GRAVE
                                break
                            case 4:
                                lesion = 6  //FALLECIDO
                                break
                            default:
                                lesion = 1  //NINGUNA
                                break
                        }

                        var tipo_accidente
                        switch(accidente.tipo_accidente.tipo_accidente) {
                            case 'caída':
                                if (accidente.tipo_vehiculo.tipo_vehiculo === 'motocicleta') {
                                    tipo_accidente = 3
                                } else {
                                    tipo_accidente = 1
                                }
                                break
                            case 'colisión doble':
                                tipo_accidente = 2
                                break
                            case 'colisión múltiple':
                            case 'alcance':
                            case 'choque contra obstáculo fijo':
                                tipo_accidente = 3
                                break
                            case 'vuelco':
                                tipo_accidente = 4
                                break
                            case 'atropello a persona':
                                tipo_accidente = 5
                                break
                            default:
                                tipo_accidente = 1
                                break
                        }
                        
                        var clima
                        switch(accidente.clima.clima) {
                            case 'Despejado':
                            case 'Se desconoce':
                                clima = 0
                                break
                            case 'Nublado':
                                clima = 1
                                break
                            case 'Lluvia débil':
                                clima = 2
                                break
                            case 'Lluvia intensa':
                                if(accidente.tipo_vehiculo.tipo_vehiculo === 'motocicleta') {
                                    clima = 4
                                } else {
                                    clima = 3
                                }
                                break
                            case 'Granizando':
                                if(accidente.tipo_vehiculo.tipo_vehiculo === 'motocicleta') {
                                    clima = 5
                                } else {
                                    clima = 4
                                }
                                break
                        }
                        
                        var edad
                        if(edad < 18) {
                            edad = 3
                        } else if(edad > 55) {
                            edad = 5
                        } else {
                            edad = 2
                        }

                        lesividad_barrio += lesion + tipo_accidente + clima + edad
                    })
                    lesividad_barrio = lesividad_barrio / barrio.accidentes.length
                    var riesgo = barrio.accidentes.length * lesividad_barrio
                    var riesgo_fix = parseFloat((riesgo).toFixed(2))
                    riesgoBarrio += riesgo
                    accidentes_distrito += barrio.accidentes.length
                    lesividad_distrito += lesividad_barrio
                    barrios.push(
                        { 
                            id: barrio.id,
                            distritoId: barrio.distritoId,
                            nombre: barrio.nombre,
                            n_accidentes: barrio.accidentes.length,
                            lesividad_media: lesividad_barrio,
                            riesgo: riesgo_fix,
                            delimitaciones: barrio.delimitaciones
                        }
                    )
                })
                lesividad_distrito = lesividad_distrito / accidentes_distrito
                var riesgo = accidentes_distrito * lesividad_distrito
                var riesgo_fixed = parseFloat((riesgo).toFixed(2))
                riesgoDistrito += riesgo
                distritos.push(
                    { 
                        id: distrito.id,
                        nombre: distrito.nombre, 
                        n_accidentes: accidentes_distrito,
                        lesividad_media: lesividad_distrito,
                        riesgo: riesgo_fixed,
                        delimitaciones: distrito.delimitaciones
                    }
                )
            })

            riesgoDistrito = riesgoDistrito / distritos.length
            riesgoBarrio = riesgoBarrio / barrios.length

            resolve({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } catch (error) {
            reject(error)
        }
    })
}

//---------------------------------Filtros Flujo-------------------------------------------------//
function getChartBarrio(param1, param2, data, barrio) {
    var barrioChart = {}
    barrioChart.nombre = barrio.nombre
    barrioChart.delimitaciones = barrio.delimitaciones
    barrioChart.accidentes = []
    
    if(data === 'fecha+hora') {

    } else {
        barrio.accidentes.forEach((accidente) => {
            var encontrado = barrioChart.accidentes.find(el => el[data] === accidente[data])
            if(encontrado) {
                encontrado.total++
                //encontrado.lesividadMedia ??
            } else {
                barrioChart.accidentes.push({
                    [data]: accidente[data],
                    total: 1,
                    //lesividadMedia ??
                })
            }
        })
    }

    return { barrioChart }
}

export const getChartFechaDistrito = async(req, res) => {
    try {
        const { fecha1, fecha2, id } = req.query
        var fechaInicio
        var fechaFin

        if(fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        console.log('id = ' + id)
        const distritoBD = await DistritoModel.findByPk(id, {
            include: [
                {
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [
                        {
                            model: AccidenteModel,
                            as: 'accidentes',
                            where: {
                                fecha: {
                                    [Op.between]: [fechaInicio, fechaFin]
                                }
                            }
                        }
                    ]
                }
            ]
        })

        /**
         * Estructura de datos:
         * barrios = [
         *      {
         *          nombre: Embajadores,
         *          delimitaciones: [...],
         *          accidentes: [
         *              {
         *                  fecha: 2023-11-20
         *                  total: 30
         *                  lesividadMedia: 2.4
         *              },
         *              {
         *                  fecha: 2023-11-21,
         *                  total: 43,
         *                  lesividadMedia: 1.7
         *              },...
         *          ]
         *      },
         *      {
         *          nombre: Atocha, 
         *          delimitaciones: [...],
         *          accidentes: [
         *              {
         *                  fecha: 2023-11-20
         *                  total: 23,
         *                  lesividadMedia: 2.2
         *              },...
         *          ]
         *      },...
         * ]
         * ---------------------------------------------
         * distrito = [
         *      {
         *          fecha: 2023-11-20,
         *          total: 200
         *      },
         *      {
         *          fecha: 2023-11-21,
         *          total: 231
         *      },...
         * ]
         */

        var barrios = []
        distritoBD.barrios.forEach((barrio) => {
            const { barrioChart } = getChartBarrio(fechaInicio, fechaFin, 'fecha', barrio)
            barrios.push(barrioChart)
        })

        var distrito = []
        fechaInicio = moment(fechaInicio, 'YYYY-MM-DD')
        fechaFin = moment(fechaFin, 'YYYY-MM-DD')
        var diferenciaDias = fechaFin.diff(fechaInicio, 'days')
        var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
        for(let i = 0; i < (diferenciaDias + 1); i++) {
            var fechaActual = moment(fechaInicio, 'YYYY-MM-DD')
            fechaActual.add(i, 'days')
            var totalDistrito = 0
            barrios.forEach((barrio) => {
                var encontrado = barrio.accidentes.find(el => fechaActual.isSame(el.fecha, 'day'))
                if(encontrado) {
                    totalDistrito += encontrado.total
                }
            })
            
            distrito.push({
                fecha: fechaActual.format('YYYY-MM-DD'),
                total: totalDistrito
            })
        }

        var centro = calcularPuntoMedio(distritoBD.delimitaciones)

        res.json({ distrito, barrios, nombre: distritoBD.nombre, codigo: distritoBD.id, delimitaciones: distritoBD.delimitaciones, centro })
    } catch (error) {
        console.log('Error en la consulta getChartFechaDistrito: ', error)
        res.status(500).json({ message: 'Error en la consulta getChartFechaDistrito' })
    }
}

export const getChartHoraDistrito = async(req, res) => {
    try {
        const { hora1, hora2, id } = req.query
        
        const distritoBD = await DistritoModel.findByPk({id,
            include: [
                {
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [
                        {
                            model: AccidenteModel,
                            as: 'accidentes',
                            where: {
                                hora: {
                                    [Op.or]: [
                                        {
                                            [Op.between]: [hora1, '23:59:59']
                                        },
                                        {
                                            [Op.between]: ['00:00:00', hora2]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        })

        var distrito = []
        distritoBD[0].barrios.forEach((barrio) => {
            const { barrioChart } = getChartBarrio(hora1, hora2, 'hora', barrio)
            distrito.push(barrioChart)
        })

        res.json(distrito)
    } catch (error) {
        console.log('Error en la consulta getChartHoraDistrito: ', error)
        res.status(500).json({ message: 'Error en la consulta getChartHoraDistrito' })
    }
}

export const getChartFechaBarrio = async(req, res) => {
    try {
        const { fecha1, fecha2, id } = req.query

        var fechaInicio, fechaFin
        if(fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const barrioBD = await BarrioModel.findByPk(id, {
            include: [
                {
                    model: AccidenteModel,
                    as: 'accidentes',
                    where: {
                        fecha: {
                            [Op.between]: [fechaInicio, fechaFin]
                        }
                    }
                }
            ]
        })

        const { barrio } = getChartBarrio(fechaInicio, fechaFin, 'fecha', barrioBD)

        res.json(barrio)
    } catch (error) {
        console.log('Error en la consulta getChartFechaBarrio: ', error)
        res.status(500).json({ message: 'Error en la consulta getChartFechaBarrio' })
    }
}

export const getChartHoraBarrio = async(req, res) => {
    try {
        const { hora1, hora2, id } = req.query

        const barrioBD = await BarrioModel.findByPk(id, {
            include: [
                {
                    model: AccidenteModel,
                    as: 'accidentes',
                    where: {
                        hora: {
                            [Op.or]: [
                                {
                                    [Op.between]: [hora1, '23:59:59']
                                },
                                {
                                    [Op.between]: ['00:00:00', hora2]
                                }
                            ]
                        }
                    }
                }
            ]
        })

        const { barrio } = getChartBarrio(hora1, hora2, 'hora', barrioBD)

        res.json(barrio)
    } catch (error) {
        console.log('Error en la consulta getChartHoraBarrio: ', error)
        res.status(500).json({ message: 'Error en la consulta getChartHoraBarrio' })
    }
}

//-------------------------FILTRO CON 1 ATRIBUTO-------------------------------------------------//
//BUSCAR POR FECHA CONCRETA
export const buscarFechaConcreta = async (req, res) => {
    try {
        //const fecha = new Date(req.body.fecha)
        const fecha = req.query.fecha
        const accidentesBD = await AccidenteModel.findAll({
            where: { fecha: fecha },
            attributes: ['id']
        })
        
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarFechaConcreta: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarFechaConcreta' })
    }
}

//BUSCAR ENTRE FECHAS
export const buscarEntreFechas = async (req, res) => {
    try {
        const { fecha1, fecha2 } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechas' })
    }
}

//- Buscar por mes
/* NO FUNCIONA
export const buscarPorMes = async (req, res) => {
    try {
        const { mes } = req.body

        const accidentes = await AccidenteModel.findAll({
            where: sequelize.where(fn('MONTH', col('fecha')), mes) // Compara el mes extraído de la fecha con el mes buscado
        });

        console.log('Tam = ' + accidentes.length)

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorMes: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorMes' })
    }
}
*/

//BUSCAR POR HORA CONCRETA
export const buscarPorHoraConcreta = async (req, res) => {
    try {
        const hora = req.query.hora

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: hora
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcreta: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcreta' })
    }
}

//BUSCAR ENTRE HORAS
export const buscarEntreHoras = async (req, res) => {
    try {
        const { hora1, hora2 } = req.query

        var horaInicio
        var horaFin

        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                }
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreHoras: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreHoras' })
    }
}


//BUSCAR POR RANGO DE EDAD
//En el front debo encargarme de que las edades a elegir sean las de los rangos. No me puede llegar una edad cualquiera
export const buscarPorEdad = async (req, res) => {
    try {
        const { edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdad' })
    }
}

//BUSCAR POR TIPO DE VEHICULO
export const buscarPorVehiculo = async (req, res) => {
    try {
        const vehiculo = req.query.vehiculo

        const accidentesBD = await AccidenteModel.findAll({
            include: [{
                model: Tipo_VehiculoModel,
                as: 'tipo_vehiculo'
            }],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculo' })
    }
}


//BUSCAR POR DROGAS
export const buscarPorDrogas = async (req, res) => {
    try {
        //positivo = 1 -> positivo en drogas | positivo = 0 -> negativo en drogas
        const positivo = req.query.drogas

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                drogas: positivo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        console.log('LLEGO AAAA')

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogas' })
    }
}

//BUSCAR POR ALCOHOL
export const buscarPorAlcohol = async (req, res) => {
    try {
        //positivo = 1 -> positivo en alcohol | positivo = 0 -> negativo en alcohol
        const positivo = req.query.alcohol

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                alcohol: positivo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcohol' })
    }
}

//BUSCAR POR LESION
/* Lesiones:
    - Leve: 1, 2, 5, 6, 7
    - Grave: 3
    - Fallecido: 4
    - Sin asistencia sanitaria: 14
*/
export const buscarPorLesionGravedad = async (req, res) => {
    try {
        const lesion = req.query.lesion

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesion' })
    }
}

//BUSCAR POR SEXO
export const buscarPorSexo = async (req, res) => {
    try {
        const sexo = req.query.sexo

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorSexo' })
    }
}

//BUSCAR POR TIPO DE ACCIDENTE
export const buscarPorAccidente = async (req, res) => {
    try {
        const accidente = req.query.accidente

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAccidente' })
    }
}

//BUSCAR POR CLIMA
export const buscarPorClima = async (req, res) => {
    try {
        const clima = req.query.clima

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$clima.clima$': clima
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorClima' })
    }
}

//BUSCAR POR RADIO DE PROXIMIDAD
export const buscarPorRadio = async (req, res) => {
    try {
        const { radio, lat, lon } = req.query

        console.log('RADIOO = ' + radio)

        const allAccidentes = await AccidenteModel.findAll()

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorRadio' })
    }
}

// Función para calcular la distancia entre dos puntos geográficos en kilómetros
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const radioTierra = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = radioTierra * c;
    return distancia;
}

// Función auxiliar para convertir grados a radianes
function toRadians(grados) {
    return grados * Math.PI / 180;
}
//-------------------------FILTRO CON 2 ATRIBUTOS-------------------------------------------------//
//FECHA CONCRETA+
//BUSCAR POR FECHA CONCRETA Y HORA CONCRETA
export const buscarPorFechaConcretaHoraConcreta = async (req, res) => {
    try {
        const { fecha, hora } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcreta: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcreta' })
    }
}

//BUSCAR POR FECHA CONCRETA Y HORA ENTRE
export const buscarPorFechaConcretaEntreHoras = async(req, res) => {
    try {
        const { fecha, hora1, hora2 } = req.query

        var horaInicio
        var horaFin

        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                fecha: fecha
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHoras: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHoras' })
    }
}

//BUSCAR POR FECHA Y EDAD
export const buscarPorFechaConcretaEdad = async (req, res) => {
    try {
        const { fecha, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEdad' })
    }
}

//BUSCAR POR FECHA Y VEHICULO
export const buscarPorFechaConcretaVehiculo = async (req, res) => {
    try {
        const { fecha, vehiculo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                fecha: fecha
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaVehiculo' })
    }
}


//BUSCAR POR FECHA Y DROGAS
export const buscarPorFechaConcretaDrogas = async (req, res) => {
    try {
        const { fecha, drogas } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                drogas: drogas
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaDrogas' })
    }
}

//BUSCAR POR FECHA Y ALCOHOL
export const buscarPorFechaConcretaAlcohol = async (req, res) => {
    try {
        const { fecha, alcohol } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                alcohol: alcohol
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaAlcohol' })
    }
}

//BUSCAR POR FECHA Y LESION
export const buscarPorFechaConcretaLesion = async (req, res) => {
    try {
        const { fecha, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: fecha
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: fecha
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaLesion' })
    }
}

//BUSCAR POR FECHA Y SEXO
export const buscarPorFechaConcretaSexo = async (req, res) => {
    try {
        const { fecha, sexo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                fecha: fecha,
                sexo: sexo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaSexo' })
    }
}

//BUSCAR POR FECHA Y ACCIDENTE 
export const buscarPorFechaConcretaAccidente = async (req, res) => {
    try {
        const { fecha, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                fecha: fecha,
                accidente: {
                    [Sequelize.Op.like]: '%' + accidente + '%'
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaAccidente' })
    }
}

//BUSCAR POR FECHA Y CLIMA
export const buscarPorFechaConcretaClima = async (req, res) => {
    try {
        const { fecha, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$clima.clima$': clima,
                fecha: fecha
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaClima' })
    }
}

export const buscarPorFechaConcretaRadio = async(req, res) => {
    try {
        const { fecha, radio, lat, lon } = req.query
        
        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaRadio' })
    }
}

//--------------------------------------------------------------------------
//ENTRE FECHAS + 
//BUSCAR POR ENTRE FECHAS Y HORA CONCRETA
export const buscarPorEntreFechasHoraConcreta = async(req, res) => {
    try {
        const { hora, fecha1, fecha2 } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }
        
        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: hora,
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasHoraConcreta: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasHoraConcreta' })
    }
}

//BUSCAR POR ENTRE FECHAS Y ENTRE HORAS
export const buscarPorEntreFechasEntreHoras = async(req, res) => {
    try {
        const { hora1, hora2, fecha1, fecha2 } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }
        
        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasEntreHoras: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasEntreHoras' })
    }
}

//BUSCAR POR ENTRE FECHAS Y EDAD
export const buscarPorEntreFechasEdad = async(req, res) => {
    try {
        const { edad1, edad2, fecha1, fecha2 } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var edadMin
        var edadMax
        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }
        
        const accidentesBD = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasEdad' })
    }
}

//BUSCAR POR ENTRE FECHAS Y VEHICULO
export const buscarPorEntreFechasVehiculo = async(req, res) => {
    try {
        const { fecha1, fecha2, vehiculo } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasVehiculo' })
    }
}

//BUSCAR POR ENTRE FECHAS Y DROGAS
export const buscarPorEntreFechasDrogas = async(req, res) => {
    try {
        const { fecha1, fecha2, drogas } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                drogas: drogas
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasDrogas' })
    }
}

//BUSCAR ENTRE FECHAS Y ALCOHOL
export const buscarPorEntreFechasAlcohol = async(req, res) => {
    try {
        const { fecha1, fecha2, alcohol } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                alcohol: alcohol
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasVehiculo' })
    }
}

//BUSCAR ENTRE FECHAS Y LESION
export const buscarPorEntreFechasLesion = async(req, res) => {
    try {
        const { fecha1, fecha2, lesion } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasLesion' })
    }
}

//BUSCAR ENTRE FECHAS Y SEXO
export const buscarPorEntreFechasSexo = async(req, res) => {
    try {
        const { fecha1, fecha2, sexo } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                '$sexo.sexo$': sexo,
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasSexo' })
    }
}

//BUSCAR ENTRE FECHAS Y ACCIDENTE
export const buscarPorEntreFechasAccidente = async(req, res) => {
    try {
        const { fecha1, fecha2, accidente } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                '$tipo_accidente.tipo_accidente$': accidente,
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasAccidente' })
    }
}

//BUSCAR ENTRE FECHAS Y CLIMA
export const buscarPorEntreFechasClima = async(req, res) => {
    try {
        const { fecha1, fecha2, clima } = req.query

        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$clima.clima$': clima,
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasClima' })
    }
}

//BUSCAR ENTRE FECHAS Y RADIO
export const buscarPorEntreFechasRadio = async(req, res) => {
    try {
        const { fecha1, fecha2, radio, lat, lon } = req.query
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreFechasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreFechasVehiculo' })
    }
}

//--------------------------------------------------------------------------
//HORA CONCRETA +
//BUSCAR POR HORA Y EDAD
export const buscarPorHoraConcretaEdad = async (req, res) => {
    try {
        const { hora, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: hora,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaEdad: ', error })
        console.log('Error en la consulta buscarPorHoraConcretaEdad: ', error)
    }
}

//BUSCAR POR HORA Y VEHICULO
export const buscarPorHoraConcretaVehiculo = async (req, res) => {
    try {
        const { hora, vehiculo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                hora: hora,
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaVehiculo: ', error })
        console.log('Error en la consulta buscarPorHoraConcretaVehiculo: ', error)
    }
}


//BUSCAR POR HORA Y DROGAS
export const buscarPorHoraConcretaDrogas = async (req, res) => {
    try {
        const { hora, drogas } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: hora,
                drogas: drogas
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaDrogas' })
    }
}

//BUSCAR POR HORA Y ALCOHOL
export const buscarPorHoraConcretaAlcohol = async (req, res) => {
    try {
        const { hora, alcohol } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: hora,
                alcohol: alcohol
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscbuscarPorHoraConcretaAlcohol' })
    }
}

//BUSCAR POR HORA Y LESION
export const buscarPorHoraConcretaLesion = async (req, res) => {
    try {
        const { hora, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaLesion' })
    }
}

//BUSCAR POR HORA Y SEXO
export const buscarPorHoraConcretaSexo = async (req, res) => {
    try {
        const { hora, sexo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                hora: hora,
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaSexo' })
    }
}

//BUSCAR POR HORA Y ACCIDENTE 
export const buscarPorHoraConcretaAccidente = async (req, res) => {
    try {
        const { hora, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                hora: hora,
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaAccidente' })
    }
}

//BUSCAR POR HORA Y CLIMA
export const buscarPorHoraConcretaClima = async (req, res) => {
    try {
        const { hora, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                hora: hora,
                '$clima.clima$': clima
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaClima' })
    }
}

export const buscarPorHoraConcretaRadio = async(req, res) => {
    try {
        const { hora, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                hora: hora
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraConcretaRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraConcretaRadio' })
    }
}

//--------------------------------------------------------------------------
//ENTRE HORAS +
//BUSCAR POR ENTRE HORAS Y EDAD
export const buscarPorEntreHorasEdad = async(req, res) => {
    try {
        const { hora1, hora2, edad1, edad2 } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        var edadMin
        var edadMax
        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasEdad' })
    }
}

//BUSCAR POR ENTRE HORAS Y VEHICULO
export const buscarPorEntreHorasVehiculo = async(req, res) => {
    try {
        const { hora1, hora2, vehiculo } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasVehiculo' })
    }
}

//BUSCAR POR ENTRE HORAS Y DROGAS
export const buscarPorEntreHorasDrogas = async(req, res) => {
    try {
        const { hora1, hora2, drogas } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                drogas: drogas
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasDrogas' })
    }
}

//BUSCAR POR ENTRE HORAS Y ALCOHOL
export const buscarPorEntreHorasAlcohol = async(req, res) => {
    try {
        const { hora1, hora2, alcohol } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                alcohol: alcohol
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasAlcohol' })
    }
}

//BUSCAR POR ENTRE HORAS Y LESION
export const buscarPorEntreHorasLesion = async(req, res) => {
    try {
        const { hora1, hora2, lesion } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasLesion' })
    }
}

//BUSCAR POR ENTRE HORAS Y SEXO
export const buscarPorEntreHorasSexo = async(req, res) => {
    try {
        const { hora1, hora2, sexo } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasSexo' })
    }
}

//BUSCAR POR ENTRE HORAS Y ACCIDENTE
export const buscarPorEntreHorasAccidente = async(req, res) => {
    try {
        const { hora1, hora2, accidente } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasAccidente' })
    }
}

//BUSCAR POR ENTRE HORAS Y CLIMA
export const buscarPorEntreHorasClima = async(req, res) => {
    try {
        const { hora1, hora2, clima } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$clima.clima$': clima
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })

    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasClima' })
    }
}

//BUSCAR POR ENTRE HORAS Y RADIO
export const buscarPorEntreHorasRadio = async(req, res) => {
    try {
        const { hora1, hora2, radio, lat, lon } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                }
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEntreHorasRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEntreHorasRadio' })
    }
}

//--------------------------------------------------------------------------
//EDAD+
//BUSCAR POR EDAD Y VEHICULO
export const buscarPorEdadVehiculo = async (req, res) => {
    try {
        const { vehiculo, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadVehiculo: ', error })
        console.log('Error en la consulta buscarPorEdadVehiculo: ', error)
    }
}


//BUSCAR POR EDAD Y DROGAS
export const buscarPorEdadDrogas = async (req, res) => {
    try {
        const { drogas, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                drogas: drogas,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadDrogas' })
    }
}

//BUSCAR POR EDAD Y ALCOHOL
export const buscarPorEdadAlcohol = async (req, res) => {
    try {
        const { alcohol, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                alcohol: alcohol,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadAlcohol' })
    }
}

//BUSCAR POR EDAD Y LESION
export const buscarPorEdadLesion = async (req, res) => {
    try {
        const { lesion, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    edad: {
                        [Op.between]: [edadMin, edadMax]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    edad: {
                        [Op.between]: [edadMin, edadMax]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadLesion' })
    }
}

//BUSCAR POR EDAD Y SEXO
export const buscarPorEdadSexo = async (req, res) => {
    try {
        const { sexo, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadSexo' })
    }
}

//BUSCAR POR EDAD Y ACCIDENTE 
export const buscarPorEdadAccidente = async (req, res) => {
    try {
        const { accidente, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadAccidente' })
    }
}

//BUSCAR POR EDAD Y CLIMA
export const buscarPorEdadClima = async (req, res) => {
    try {
        const { clima, edad1, edad2 } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }


        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                '$clima.clima$': clima
            },
            attributes: ['id']
        })
        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadClima' })
    }
}

export const buscarPorEdadRadio = async (req, res) => {
    try {
        const { edad1, edad2, radio, lat, lon } = req.query

        var edadMin
        var edadMax

        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadRadio' })
    }
}
//--------------------------------------------------------------------------
//VEHICULO+
//BUSCAR POR VEHICULO Y DROGAS
export const buscarPorVehiculoDrogas = async (req, res) => {
    try {
        const { vehiculo, drogas } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                drogas: drogas
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoDrogas' })
    }
}

//BUSCAR POR VEHICULO Y ALCOHOL
export const buscarPorVehiculoAlcohol = async (req, res) => {
    try {
        const { vehiculo, alcohol } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                alcohol: alcohol
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoAlcohol' })
    }
}

//BUSCAR POR VEHICULO Y LESION
export const buscarPorVehiculoLesion = async (req, res) => {
    try {
        const { vehiculo, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: Tipo_VehiculoModel,
                        as: 'tipo_vehiculo'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$tipo_vehiculo.tipo_vehiculo$': vehiculo
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: Tipo_VehiculoModel,
                        as: 'tipo_vehiculo'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$tipo_vehiculo.tipo_vehiculo$': vehiculo
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoLesion' })
    }
}

//BUSCAR POR VEHICULO Y SEXO
export const buscarPorVehiculoSexo = async (req, res) => {
    try {
        const { vehiculo, sexo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }, 
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                '$sexo.sexo$': sexo
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoSexo' })
    }
}

//BUSCAR POR VEHICULO Y DROGAS
export const buscarPorVehiculoAccidente = async (req, res) => {
    try {
        const { vehiculo, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                },
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoAccidente' })
    }
}

//BUSCAR POR VEHICULO Y CLIMA
export const buscarPorVehiculoClima = async (req, res) => {
    try {
        const { vehiculo, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                },
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo,
                '$clima.clima$': clima
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoClima' })
    }
}

//BUSCAR POR VEHICULO Y RADIO
export const buscarPorVehiculoRadio = async (req, res) => {
    try {
        const { vehiculo, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculoRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculoRadio' })
    }
}
//--------------------------------------------------------------------------
//DROGAS+
//BUSCAR POR DROGAS Y ALCOHOL
export const buscarPorDrogasAlcohol = async (req, res) => {
    try {
        const { drogas, alcohol } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                drogas: drogas,
                alcohol: alcohol
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasAlcohol' })
    }
}

//BUSCAR POR DROGAS Y LESION
export const buscarPorDrogasLesion = async (req, res) => {
    try {
        const { drogas, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    drogas: drogas
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    drogas: drogas
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasLesion' })
    }
}

//BUSCAR POR DROGAS Y SEXO
export const buscarPorDrogasSexo = async (req, res) => {
    try {
        const { drogas, sexo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                drogas: drogas,
                '$sexo.sexo$': sexo
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasSexo' })
    }
}

//BUSCAR POR DROGAS Y ACCIDENTE
export const buscarPorDrogasAccidente = async (req, res) => {
    try {
        const { drogas, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                drogas: drogas,
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasAccidente' })
    }
}

//BUSCAR POR DROGAS Y CLIMA
export const buscarPorDrogasClima = async (req, res) => {
    try {
        const { drogas, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                drogas: drogas,
                '$clima.clima$': clima
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasClima' })
    }
}

//BUSCAR POR DROGAS Y RADIO
export const buscarPorDrogasRadio = async (req, res) => {
    try {
        const { drogas, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                drogas: drogas
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasRadio' })
    }
}
//--------------------------------------------------------------------------
//ALCOHOL+
//BUSCAR POR ALCOHOL Y LESION
export const buscarPorAlcoholLesion = async (req, res) => {
    try {
        const { alcohol, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    alcohol: alcohol
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    alcohol: alcohol
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorAlcoholLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcoholLesion' })
    }
}

//BUSCAR POR ALCOHOL Y SEXO
export const buscarPorAlcoholSexo = async (req, res) => {
    try {
        const { alcohol, sexo } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                alcohol: alcohol,
                '$sexo.sexo$': sexo
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAlcoholSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcoholSexo' })
    }
}

//BUSCAR POR ALCOHOL Y ACCIDENTE
export const buscarPorAlcoholAccidente = async (req, res) => {
    try {
        const { alcohol, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                alcohol: alcohol,
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAlcoholAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcoholAccidente' })
    }
}

//BUSCAR POR ALCOHOL Y CLIMA
export const buscarPorAlcoholClima = async (req, res) => {
    try {
        const { alcohol, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                alcohol: alcohol,
                '$clima.clima$': clima
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAlcoholClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcoholClima' })
    }
}

//BUSCAR POR ALCOHOL Y RADIO
export const buscarPorAlcoholRadio = async (req, res) => {
    try {
        const { alcohol, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                alcohol: alcohol
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorDrogasRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDrogasRadio' })
    }
}
//--------------------------------------------------------------------------
//LESION+
//BUSCAR POR LESION
export const buscarPorLesionSexo = async (req, res) => {
    try {
        const { lesion, sexo } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }, 
                    {
                        model: SexoModel,
                        as: 'sexo'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$sexo.sexo$': sexo
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: SexoModel,
                        as: 'sexo'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$sexo.sexo$': sexo
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesionSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesionSexo' })
    }
}

//BUSCAR POR LESION Y ACCIDENTE
export const buscarPorLesionAccidente = async (req, res) => {
    try {
        const { lesion, accidente } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: Tipo_AccidenteModel,
                        as: 'tipo_accidente'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$tipo_accidente.tipo_accidente$': accidente
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: Tipo_AccidenteModel,
                        as: 'tipo_accidente'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$tipo_accidente.tipo_accidente$': accidente
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesionAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesionAccidente' })
    }
}

//BUSCAR POR LESION Y CLIMA
export const buscarPorLesionClima = async (req, res) => {
    try {
        const { lesion, clima } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: ClimaModel,
                        as: 'clima'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$clima.clima$': clima
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    },
                    {
                        model: ClimaModel,
                        as: 'clima'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    '$clima.clima$' : clima
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesionClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesionClima' })
    }
}

//BUSCAR POR LESION Y RADIO
export const buscarPorLesionRadio = async (req, res) => {
    try {
        const { lesion, radio, lat, lon } = req.query

        if (lesion === 'Leve') {

            const allAccidentes = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    }
                }
            })
            let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
            const accidentesId = accidentesFiltrados.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const allAccidentes = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    }
                }
            })
            let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
            const accidentesId = accidentesFiltrados.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesionRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesionRadio' })
    }
}
//--------------------------------------------------------------------------
//SEXO+
//BUSCAR POR SEXO Y ACCIDENTE
export const buscarPorSexoAccidente = async (req, res) => {
    try {
        const { sexo, accidente } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }, 
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                '$sexo.sexo$': sexo,
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorSexoAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorSexoAccidente' })
    }
}

//BUSCAR POR SEXO Y CLIMA
export const buscarPorSexoClima = async (req, res) => {
    try {
        const { sexo, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }, 
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$sexo.sexo$': sexo,
                '$clima.clima$': clima
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorSexoClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorSexoClima' })
    }
}

//BUSCAR POR SEXO Y RADIO
export const buscarPorSexoRadio = async (req, res) => {
    try {
        const { sexo, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                '$sexo.sexo$': sexo
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorLesionRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesionRadio' })
    }
}
//--------------------------------------------------------------------------
//ACCIDENTE+
//BUSCAR POR ACCIDENTE Y CLIMA
export const buscarPorAccidenteClima = async (req, res) => {
    try {
        const { accidente, clima } = req.query

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                },
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$tipo_accidente.tipo_accidente$': accidente,
                '$clima.clima$': clima
            }
        })

        const accidentesId = accidentesBD.map(el => el.id)
        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAccidenteClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAccidenteClima' })
    }
}

//BUSCAR POR ACCIDENTE Y RADIO
export const buscarPorAccidenteRadio = async (req, res) => {
    try {
        const { accidente, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorAccidenteRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAccidenteRadio' })
    }
}
//--------------------------------------------------------------------------
//CLIMA+
//BUSCAR POR CLIMA Y RADIO
export const buscarPorClimaRadio = async (req, res) => {
    try {
        const { clima, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                '$clima.clima$': clima
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorClimaRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorClimaRadio' })
    }
}
//-------------------------FILTRO CON 3 ATRIBUTOS-------------------------------------------------//
//FECHA CONCRETA + HORA CONCRETA +
//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + EDAD
export const buscarPorFechaConcretaHoraConcretaEdad = async (req, res) => {
    try {
        const { fecha, hora, edad1, edad2 } = req.query
        var edadMin
        var edadMax
        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaEdad' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + VEHICULO
export const buscarPorFechaConcretaHoraConcretaVehiculo = async (req, res) => {
    try {
        const { fecha, hora, vehiculo } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                fecha: fecha,
                hora: hora,
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaVehiculo' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + DROGAS
export const buscarPorFechaConcretaHoraConcretaDrogas = async (req, res) => {
    try {
        const { fecha, hora, drogas } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora,
                drogas: drogas
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaDrogas' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + ALCOHOL
export const buscarPorFechaConcretaHoraConcretaAlcohol = async (req, res) => {
    try {
        const { fecha, hora, alcohol } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora,
                alcohol: alcohol
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaAlcohol' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + LESION
export const buscarPorFechaConcretaHoraConcretaLesion = async (req, res) => {
    try {
        const { fecha, hora, lesion } = req.query

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: fecha,
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: fecha,
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaLesion' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + SEXO
export const buscarPorFechaConcretaHoraConcretaSexo = async (req, res) => {
    try {
        const { fecha, hora, sexo } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                fecha: fecha,
                hora: hora,
                '$sexo.sexo$': sexo
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaSexo' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + ACCIDENTE
export const buscarPorFechaConcretaHoraConcretaAccidente = async (req, res) => {
    try {
        const { fecha, hora, accidente } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                fecha: fecha,
                hora: hora,
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaAccidente' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + CLIMA
export const buscarPorFechaConcretaHoraConcretaClima = async (req, res) => {
    try {
        const { fecha, hora, clima } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                fecha: fecha,
                hora: hora,
                '$clima.clima$': clima
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaClima' })
    }
}

//BUSCAR POR FECHA CONCRETA + HORA CONCRETA + RADIO
export const buscarPorFechaConcretaHoraConcretaRadio = async (req, res) => {
    try {
        const { fecha, hora, radio, lat, lon } = req.query

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaHoraConcretaRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaHoraConcretaRadio' })
    }
}

//--------------------------------------------------------------------------
//FECHA CONCRETA + ENTRE HORAS +
//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + EDAD
export const buscarPorFechaConcretaEntreHorasEdad = async (req, res) => {
    try {
        const { fecha, hora1, hora2, edad1, edad2 } = req.query
        var edadMin
        var edadMax
        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasEdad' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + VEHICULO
export const buscarPorFechaConcretaEntreHorasVehiculo = async (req, res) => {
    try {
        const { fecha, hora1, hora2, vehiculo } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasVehiculo' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + DROGAS
export const buscarPorFechaConcretaEntreHorasDrogas = async (req, res) => {
    try {
        const { fecha, hora1, hora2, drogas } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                drogas: drogas
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasDrogas' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + ALCOHOL
export const buscarPorFechaConcretaEntreHorasAlcohol = async (req, res) => {
    try {
        const { fecha, hora1, hora2, alcohol } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                alcohol: alcohol
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasAlcohol' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + LESION
export const buscarPorFechaConcretaEntreHorasLesion = async (req, res) => {
    try {
        const { fecha, hora1, hora2, lesion } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: fecha,
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: fecha,
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasLesion' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + SEXO
export const buscarPorFechaConcretaEntreHorasSexo = async (req, res) => {
    try {
        const { fecha, hora1, hora2, sexo } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$sexo.sexo$': sexo
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasSexo' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + ACCIDENTE
export const buscarPorFechaConcretaEntreHorasAccidente = async (req, res) => {
    try {
        const { fecha, hora1, hora2, accidente } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_accidente.tipo_accidente$': accidente
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasAccidente' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + CLIMA
export const buscarPorFechaConcretaEntreHorasClima = async (req, res) => {
    try {
        const { fecha, hora1, hora2, clima } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$clima.clima$': clima
            }
        })

        const accidentesId = allAccidentes.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasClima' })
    }
}

//BUSCAR POR FECHA CONCRETA + ENTRE HORAS + RADIO
export const buscarPorFechaConcretaEntreHorasRadio = async (req, res) => {
    try {
        const { fecha, hora1, hora2, radio, lat, lon } = req.query

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
            }
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = accidentesAux(accidentesId)
        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaConcretaEntreHorasRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaConcretaEntreHorasRadio' })
    }
}

//--------------------------------------------------------------------------
//ENTRE FECHAS + HORA CONCRETA +
//BUSCAR ENTRE FECHAS + HORA CONCRETA + EDAD
export const buscarEntreFechasHoraConcretaEdad = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, edad1, edad2 } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var edadMin
        var edadMax
        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaEdad' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + VEHICULO
export const buscarEntreFechasHoraConcretaVehiculo = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, vehiculo } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaVehiculo' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + DROGAS
export const buscarEntreFechasHoraConcretaDrogas = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, drogas } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                drogas: drogas
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaDrogas' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + ALCOHOL
export const buscarEntreFechasHoraConcretaAlcohol = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, alcohol } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                alcohol: alcohol
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaAlcohol' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + LESION
export const buscarEntreFechasHoraConcretaLesion = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, lesion } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    hora: hora
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaLesion' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + SEXO
export const buscarEntreFechasHoraConcretaSexo = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, sexo } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaSexo' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + ACCIDENTE
export const buscarEntreFechasHoraConcretaAccidente = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, accidente } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaAccidente' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + CLIMA
export const buscarEntreFechasHoraConcretaClima = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, clima } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: ClimaModel,
                    as: 'clima'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora,
                '$clima.clima$': clima
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaClima' })
    }
}

//BUSCAR ENTRE FECHAS + HORA CONCRETA + RADIO
export const buscarEntreFechasHoraConcretaRadio = async (req, res) => {
    try {
        const { fecha1, fecha2, hora, radio, lat, lon } = req.query
        var fechaInicio
        var fechaFin

        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        const allAccidentes = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: hora
            },
            attributes: ['id']
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasHoraConcretaRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasHoraConcretaRadio' })
    }
}

//--------------------------------------------------------------------------
//ENTRE FECHAS + ENTRE HORAS +
//BUSCAR ENTRE FECHAS + ENTRE HORAS + EDAD
export const buscarEntreFechasEntreHorasEdad = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, edad1, edad2 } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        var edadMin
        var edadMax
        if (edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasEdad' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + VEHICULO
export const buscarEntreFechasEntreHorasVehiculo = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, vehiculo } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel,
                    as: 'tipo_vehiculo'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_vehiculo.tipo_vehiculo$': vehiculo
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasVehiculo' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + DROGAS
export const buscarEntreFechasEntreHorasDrogas = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, drogas } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                drogas: drogas
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasDrogas' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + ALCOHOL
export const buscarEntreFechasEntreHorasAlcohol = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, alcohol } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                alcohol: alcohol
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasAlcohol' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + LESION
export const buscarEntreFechasEntreHorasLesion = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, lesion } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        if (lesion === 'Leve') {

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        } else {
            var codigo
            if (lesion === 'Grave') {
                codigo = 3
            } else if (lesion === 'Fallecido') {
                codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentesBD = await AccidenteModel.findAll({
                include: [
                    {
                        model: LesividadModel,
                        as: 'lesividade'
                    }
                ],
                where: {
                    lesividadeCodigo: codigo,
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    hora: {
                        [Op.between]: [horaInicio, horaFin]
                    }
                },
                attributes: ['id']
            })
            const accidentesId = accidentesBD.map(el => el.id)
    
            const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)
    
            res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
        }
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasLesion' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + SEXO
export const buscarEntreFechasEntreHorasSexo = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, sexo } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: SexoModel,
                    as: 'sexo'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$sexo.sexo$': sexo
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasSexo' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + ACCIDENTE
export const buscarEntreFechasEntreHorasAccidente = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, accidente } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_AccidenteModel,
                    as: 'tipo_accidente'
                }
            ],
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$tipo_accidente.tipo_accidente$': accidente
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasAccidente' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + CLIMA
export const buscarEntreFechasEntreHorasClima = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, clima } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
                '$clima.clima$': clima
            },
            attributes: ['id']
        })

        const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasClima' })
    }
}

//BUSCAR ENTRE FECHAS + ENTRE HORAS + RADIO
export const buscarEntreFechasEntreHorasRadio = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, radio, lat, lon } = req.query
        
        var fechaInicio
        var fechaFin
        if (fecha1 <= fecha2) {
            fechaInicio = fecha1
            fechaFin = fecha2
        } else {
            fechaInicio = fecha2
            fechaFin = fecha1
        }

        var horaInicio
        var horaFin
        if (hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentesBD = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                },
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                },
            },
            attributes: ['id']
        })

        let accidentesFiltrados = allAccidentes.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
        const accidentesId = accidentesFiltrados.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta buscarEntreFechasEntreHorasRadio: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreFechasEntreHorasRadio' })
    }
}

//----------------------------------------------------------------------------------------------------//

//Obtener coordenadas geograficas a partir de las coordenadas UTM de Madrid
//Las coordenadas UTM se forman a partir de:
/*
- x: Coordenada del este (easting). Distancia en metros desde el meridiano central de la zona UTM hasta el punto en cuestion. 
     En este caso, tratamos el meridiano central de la zona 30 UTM
- y: Coordenada del norte (northing). Distancia en metros desde el ecuador hasta el punto en cuestion. Norte del ecuador
- Hemisferio: Madrid se encuentra en el hemisferio norte del globo.
- Huso: El huso UTM 30 es uno de los 60 husos UTM que dividen la Tierra en franjas de 6 grados de longitud. 
        El huso 30 abarca longitudes entre 6° Oeste y 0°, siendo el meridiano central de esta zona el meridiano 3° Oeste.

Usamos la biblioteca proj4js para convertir las coordenadas UTM a latitud y longitud en Javascript.

*/

export function UTMtoGPS(x, y) {
    // Definir la proyección UTM correspondiente
    proj4.defs('EPSG:326' + 30, '+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');

    if (isFinite(x) && isFinite(y)) {
        // Convertir coordenadas UTM a latitud y longitud
        const [longitude, latitude] = proj4('EPSG:326' + 30, 'EPSG:4326', [x, y]);

        //console.log('UTM to GPS lat / lon = ' + latitude + ' / ' + longitude)
        return { latitude, longitude }
    } else {
        return { latitude: 1, longitude: -1 }
    }
}