import {
    AccidenteModel, Tipo_AccidenteModel, Tipo_PersonaModel, Tipo_VehiculoModel,
    SexoModel, ClimaModel, LesividadModel
} from '../models/AccidenteModel.js'
import axios from 'axios'
import proj4 from 'proj4'   //Convertir coordenadas UTM en geograficas
import csvParser from 'csv-parser'  //Leer archivo csv
import { Sequelize, Op, where } from 'sequelize'

//Para leer desde el directorio local
import fs from 'fs'
import path, { parse } from 'path'
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
        
        const accidentes = await AccidenteModel.findAll({
            include: [
                { model: SexoModel },
                { model: Tipo_AccidenteModel },
                { model: Tipo_PersonaModel },
                { model: Tipo_VehiculoModel },
                { model: LesividadModel },
                { model: ClimaModel }
            ]
        });
        
        //const accidentes = await AccidenteModel.findAll()
        
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


            const PESOS = {
                lesion: 0.4,
                tipo_accidente: 0.3,
                clima: 0.2,
                edad: 0.1
            }
            const FACTOR_RIESGO = 3
            const normalizacionPonderacion = (value, max, weight) => (value / max) * 100 * weight

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

                        // Normalizar y ponderar cada característica
                        const lesividad = 
                            normalizacionPonderacion(lesion, 6, PESOS.lesion) +
                            normalizacionPonderacion(tipo_accidente, 5, PESOS.tipo_accidente) +
                            normalizacionPonderacion(clima, 5, PESOS.clima) +
                            normalizacionPonderacion(edad, 5, PESOS.edad);

                        lesividad_barrio += lesividad;
                    })
                    lesividad_distrito += lesividad_barrio
                    lesividad_barrio = parseFloat((lesividad_barrio / barrio.accidentes.length).toFixed(2))
                    var riesgo = parseFloat((lesividad_barrio + barrio.accidentes.length * FACTOR_RIESGO).toFixed(2))
                    riesgoBarrio += riesgo
                    accidentes_distrito += barrio.accidentes.length
                    barrios.push(
                        { 
                            id: barrio.id,
                            distritoId: barrio.distritoId,
                            nombre: barrio.nombre,
                            n_accidentes: barrio.accidentes.length,
                            lesividad_media: lesividad_barrio,
                            riesgo: riesgo,
                            delimitaciones: barrio.delimitaciones,
                            accidentes: barrio.accidentes
                        }
                    )
                })
                var riesgo
                if (accidentes_distrito > 0) {
                    lesividad_distrito = parseFloat((lesividad_distrito / accidentes_distrito).toFixed(2))
                    riesgo = parseFloat((lesividad_distrito + accidentes_distrito * FACTOR_RIESGO).toFixed(2))
                } else {
                    lesividad_distrito = 0
                    riesgo = 0
                }
                
                riesgoDistrito += riesgo
                distritos.push(
                    { 
                        id: distrito.id,
                        nombre: distrito.nombre, 
                        n_accidentes: accidentes_distrito,
                        lesividad_media: lesividad_distrito,
                        riesgo: riesgo,
                        delimitaciones: distrito.delimitaciones,
                        barrios: distrito.barrios
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

    } else if (data === 'fecha') {
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

        barrioChart.accidentes.sort((a, b) => {
            let fechaA = new Date(a.fecha)
            let fechaB = new Date(b.fecha)

            return fechaA - fechaB
        })
    } else {    //data === 'hora'
        console.log('param2 = ' + param2)
        barrio.accidentes.forEach((accidente) => {
            var encontrado = barrioChart.accidentes.find(el => el[data].split(':')[0] === accidente[data].split(':')[0])
            if(encontrado) {
                encontrado.total++
                //encontrado.lesividadMedia ??
            } else {
                barrioChart.accidentes.push({
                    [data]: param1.split(':')[0] === accidente[data].split(':')[0] ? param1 : `${accidente[data].split(':')[0]}:00`,
                    total: 1,
                    //lesividadMedia ??
                })
            }
        })

        let accidentes = barrioChart.accidentes

        // Convertimos las horas a enteros para facilitar la comparación
        accidentes.forEach(accidente => {
            let [horas, minutos] = accidente.hora.split(":").map(Number);
            accidente.hora_entera = horas * 100 + minutos;
        });

        // Convertir la hora inicial a un entero
        let [horasInicial, minutosInicial] = param1.split(":").map(Number);
        let horaInicialEntera = horasInicial * 100 + minutosInicial;

        // Ordenar las horas considerando el orden cíclico de 24 horas a partir de la hora inicial
        accidentes.sort((a, b) => {
            let aDiff = (a.hora_entera - horaInicialEntera + 2400) % 2400;
            let bDiff = (b.hora_entera - horaInicialEntera + 2400) % 2400;
            return aDiff - bDiff;
        });

        // Remover el atributo 'hora_entera' que solo se usó para la ordenación
        accidentes.forEach(accidente => {
            delete accidente.hora_entera;
        });
    }

    return barrioChart
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
            const barrioChart = getChartBarrio(fechaInicio, fechaFin, 'fecha', barrio)
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

        var min = hora1
        var max = hora2

        min = min.split(':')
        max = max.split(':')

        var horaMin = new Date()
        horaMin.setHours(parseInt(min[0]), parseInt(min[1]), 0)

        var horaMax = new Date()
        horaMax.setHours(parseInt(max[0]), parseInt(max[1]), 0)

        var distritoBD
        if (horaMin > horaMax) {
            distritoBD = await DistritoModel.findByPk(id, {
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
        } else {
            distritoBD = await DistritoModel.findByPk(id, {
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
                                        [Op.between]: [hora1, hora2]
                                    }
                                }
                            }
                        ]
                    }
                ]
            })
        }

        var barrios = []
        distritoBD.barrios.forEach((barrio) => {
            const barrioChart = getChartBarrio(hora1, hora2, 'hora', barrio)
            barrios.push(barrioChart)
        })

        var distrito = []
        barrios.forEach((barrio) => {
            //console.log(JSON.stringify(barrio))
            barrio.accidentes.forEach((accidente) => {
                let accidenteDistrito = distrito.find(el => el.hora === accidente.hora)
                if (accidenteDistrito) {
                    accidenteDistrito.total += accidente.total
                } else {
                    distrito.push({
                        hora: accidente.hora,
                        total: accidente.total
                    })
                }
            })
        })


        // Convertimos las horas a enteros para facilitar la comparación
        distrito.forEach(accidente => {
            let [horas, minutos] = accidente.hora.split(":").map(Number);
            accidente.hora_entera = horas * 100 + minutos;
        });

        // Convertir la hora inicial a un entero
        let [horasInicial, minutosInicial] = hora1.split(":").map(Number);
        let horaInicialEntera = horasInicial * 100 + minutosInicial;

        // Ordenar las horas considerando el orden cíclico de 24 horas a partir de la hora inicial
        distrito.sort((a, b) => {
            let aDiff = (a.hora_entera - horaInicialEntera + 2400) % 2400;
            let bDiff = (b.hora_entera - horaInicialEntera + 2400) % 2400;
            return aDiff - bDiff;
        });

        // Remover el atributo 'hora_entera' que solo se usó para la ordenación
        distrito.forEach(accidente => {
            delete accidente.hora_entera;
        });

        var centro = calcularPuntoMedio(distritoBD.delimitaciones)

        res.json({ distrito, barrios, nombre: distritoBD.nombre, codigo: distritoBD.id, delimitaciones: distritoBD.delimitaciones, centro })

        //res.json(distritoBD.barrios[1])
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

        const barrio = getChartBarrio(fechaInicio, fechaFin, 'fecha', barrioBD)

        const centro = calcularPuntoMedio(barrio.delimitaciones)

        res.json({ barrio: barrio.accidentes, centro, nombre: barrio.nombre, delimitaciones: barrio.delimitaciones, codigo: barrio.id })
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

        const barrio = getChartBarrio(hora1, hora2, 'hora', barrioBD)

        const centro = calcularPuntoMedio(barrio.delimitaciones)

        res.json({ barrio: barrio.accidentes, centro, nombre: barrio.nombre, delimitaciones: barrio.delimitaciones, codigo: barrio.id })
    } catch (error) {
        console.log('Error en la consulta getChartHoraBarrio: ', error)
        res.status(500).json({ message: 'Error en la consulta getChartHoraBarrio' })
    }
}


//BUSCAR LESION
/* Lesiones:
    - Leve: 1, 2, 5, 6, 7
    - Grave: 3
    - Fallecido: 4
    - Sin asistencia sanitaria: 14
*/

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


export const filtro = async (req, res) => {
    try {
        const { fecha1, fecha2, hora1, hora2, edad1, edad2, vehiculo, drogas, alcohol, 
                lesion, persona, sexo, accidente, clima, radio, lat, lon 
        } = req.query
        //const { drogas, alcohol, vehiculo, sexo, clima } = req.query
        let whereConditions = {}

        if (fecha1 !== '' && fecha2 !== '') {
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
                [Op.lte]: fecha2
            }
        }

        if (hora1 !== '' && hora2 !== '') {
            if (hora1 === hora2) {
                whereConditions.hora = hora1    
            } else {
                whereConditions.hora = {
                    [Op.between]: [hora1, hora2]
                }   
            }
        } else if (hora1 !== '') {
            whereConditions.hora = {
                [Op.gte]: hora1
            }
        } else if (hora2 !== '') {
            whereConditions.hora = {
                [Op.lte]: hora2
            }
        }

        if (edad1 !== '' && edad2 !== '') {
            if (edad1 === edad2) {
                whereConditions.edad = edad1
            } else {

                whereConditions.edad = {
                    [Op.between]: [edad1, edad2]
                }
            }
        } else if (edad1 !== '') {
            whereConditions.edad = {
                [Op.gte]: edad1
            }
        } else if (edad2 !== '') {
            whereConditions.edad = {
                [Op.lte]: edad2
            }
        }

        if (vehiculo !== '') {
            whereConditions['$tipo_vehiculo.tipo_vehiculo$'] = vehiculo
        }

        if (accidente !== '') {
            whereConditions['$tipo_accidente.tipo_accidente$'] = accidente
        }

        if (sexo !== '') {
            whereConditions['$sexo.sexo$'] = sexo
        }

        if (clima !== '') {
            whereConditions['$clima.clima$'] = clima
        }

        if (persona !== '') {
            whereConditions['$tipo_persona.tipo_persona$'] = persona
        }

        if (drogas !== '') {
            whereConditions.drogas = drogas
        }

        if (alcohol !== '') {
            whereConditions.alcohol = alcohol
        }

        if (lesion !== '') {
            if (lesion === 'Leve') {
                whereConditions.lesividadeCodigo = {
                    [Op.in]: [1, 2, 5, 6, 7]
                }

                
            } else {
                var codigo
                if (lesion === 'Grave') {
                    codigo = 3
                } else if (lesion === 'Fallecido') {
                    codigo = 4
                } else {    //Sin asistencia
                    codigo = 14
                }
    
                whereConditions.lesividadeCodigo = codigo
            }
        }

        const accidentesBD = await AccidenteModel.findAll({
            include: [
                {
                    model: Tipo_VehiculoModel, as: 'tipo_vehiculo'
                },
                {
                    model: ClimaModel, as: 'clima'
                },
                {
                    model: SexoModel, as: 'sexo'
                },
                {
                    model: Tipo_AccidenteModel, as: 'tipo_accidente'
                },
                {
                    model: Tipo_VehiculoModel, as: 'tipo_vehiculo'
                },
                {
                    model: Tipo_PersonaModel, as: 'tipo_persona'
                }
            ],
            where: whereConditions
        })

        var accidentesId
        
        if (radio > 0 ) {
            let accidentesFiltrados = accidentesBD.filter(accidente => calcularDistancia(accidente.lat, accidente.lon, lat, lon) <= radio)
            accidentesId = accidentesFiltrados.map(el => el.id)
        } else {
            accidentesId = accidentesBD.map(el => el.id)
        }

        //const accidentesId = accidentesBD.map(el => el.id)

        const { distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes } = await accidentesAux(accidentesId)

        res.json({ distritos, barrios, riesgoDistrito, riesgoBarrio, accidentes })
    } catch (error) {
        console.log('Error en la consulta filtro: ', error)
        res.status(500).json({ message: 'Error en la consulta filtro' })
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