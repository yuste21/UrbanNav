import { Tipo_EstacionamientoModel, ColorModel, EstacionamientoModel } from '../models/EstacionamientoModel.js';
import axios from 'axios'
import proj4 from "proj4";
import csvParser from 'csv-parser'
import { UTMtoGPS } from "./AccidenteController.js";
import { Op } from "sequelize";

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'
import { DistritoModel } from '../models/DistritoModel.js';
import { BarrioModel } from '../models/DistritoModel.js';
import { encontrarZona } from './DistritoController.js';


/*
SER                 = 32.111
Reducida            = 11.983
Motos               = 1.312 - Con barrios es 1310
Carga y Descarga    = 2.820 - Cpn barrios es 2819
Total               = 48.227
*/

export const getTipoEstacionamiento = async(req, res) => {
    try {
        const tipo_estacionamiento = await Tipo_EstacionamientoModel.findAll()

        res.json(tipo_estacionamiento)
    } catch (error) {
        console.log('Error en la consulta getTipoEstacionamiento: ', error)
        res.status(500).json({ message: 'Error en la consulta getTipoEstacionamiento' })
    }
}

export const getColor = async(req, res) => {
    try {
        const color = await ColorModel.findAll()

        res.json(color)
    } catch (error) {
        console.log('Error en la consulta getColor: ', error)
        res.status(500).json({ message: 'Error en la consulta getColor' })
    }
}

export const getAllEstacionamientos = async(req, res) => {
    try {
        const estacionamientos = await EstacionamientoModel.findAll({
            include: [
                { model: Tipo_EstacionamientoModel },
                { model: ColorModel }
            ]
        })

        //const estacionamientos = await EstacionamientoModel.findAll()

        console.log(estacionamientos.length)

        res.json(estacionamientos)
    } catch (error) {
        console.log('Error en la consulta getAllEstacionamientos: ', error)
        res.status(500).json({ message: 'Error en la consulta getAllEstacionamientos' })
    }
}

//--------------------------------------------------------------------------------------------------//
//Leer csv Servicio de Estacionamiento Regulado (SER). 
/* Formato:
{
  gis_x: '440840,45',
  gis_y: '4474984,54',
  distrito: '01  CENTRO',
  barrio: '01-04 JUSTICIA',
  calle: 'SAN GREGORIO, CALLE, DE',
  num_finca: '5',
  color: '077214010 Verde',
  bateria_linea: 'L�nea',
  num_plazas: '7'
}
*/
export const leerCSV_ser = async(req, res) => {
    try {
        var contadorFallos = 0
        const barrios = await BarrioModel.findAll()
        var i = 0

        let batchCount = 0; // Contador de lotes
        const batchSize = 50; // Tamaño del lote

        //Leemos csv de los estacionamientos SER
        // Lectura del csv desde la web
        
        //const urlCSV = 'https://datos.madrid.es/egob/catalogo/218228-16-SER-calles.csv'
        //const response = await axios.get(urlCSV, { responseType: 'stream' })

        //response.data.pipe(csvParser({ separator: ';' }))
        
        //---------------------------------------------------------------------------------------
       // Ruta al archivo CSV en directorio local
        const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Estacionamiento(SER)/estacionamiento.csv';

       // Leer el archivo CSV localmente
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                //console.log(row)
                i++
                if(i > 27370) {
                    const { latitude, longitude } = UTMtoGPS(parseFloat(row.gis_x), parseFloat(row.gis_y))

                    //console.log('Calle = ' + row.calle)

                    var tipo
                    if(row.bateria_linea.startsWith('L')) {
                        tipo = 1
                    } else {
                        tipo = 2
                    }
                    //console.log('Tipo = ' + tipo)

                    
                    var color = row.color.split(' ')[1]
                    var idColor
                    
                    switch(color) {
                        case 'Verde':
                            idColor = 1
                            break
                        case 'Naranja':
                            idColor = 3
                            break
                        case 'Azul': 
                            idColor = 2 
                            break
                        case 'Rojo':
                            idColor = 4
                            break
                        default:
                            idColor = 8
                    }

                    
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if (row.plazas !== '' && barrio !== null) { // Verifica si no es una cadena vacía y si es un número válido
                        await EstacionamientoModel.create({
                            'lat': latitude,
                            'lon': longitude,
                            'barrioId': barrio.id,
                            'coloreId': idColor,
                            'tipoEstacionamientoId': tipo,
                            'plazas': parseInt(row.num_plazas) // Convierte el valor a un entero antes de insertarlo
                        });
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
                    
                }
                
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos SER completo.');
                res.json({mensaje: 'Estacionamientos SER creados correctamente', contadorFallos, i})
            })

            
    } catch (error) {
        console.error('Error al leerCSV de los estacionamientos SER:', error.message);
        res.status(500).json({ error: 'Error al leerCSV estacionamientos SER.' });
    }
}

//Leer csv Plazas de estacionamientos para personas de movilidad reducida
/* Formato:
{
  'Gis_X': '441084,5000000000',
  Gis_Y: '4472781,1200000000',
  'Fecha de Alta': '04/11/1997',
  Distrito: '02  ARGANZUELA',
  Barrio: '02-06 PALOS DE MOGUER',
  Calle: 'PEDRO UNANUE, CALLE, DE',
  'Nº Finca': '20',
  'Tipo de Reserva': 'PMR',
  'Línea / Batería': 'Línea',
  'Número de Plazas': '1',
  Longitud: '-3.694304469',
  'Texto Cajetines': '',
  Latitud: '40.403558194',
  dir: 'PEDRO UNANUE, CALLE, DE20'
}
*/
export const leerCSV_reducida = async(req, res) => {
    try {
        var contadorFallos = 0
        const barrios = await BarrioModel.findAll()

        const estacionamientos = await EstacionamientoModel.findAll()
        var encontrado
        var i = 0

        let batchCount = 0; // Contador de lotes
        const batchSize = 50; // Tamaño del lote

        //Leemos csv de los estacionamientos Movilidad reducida
        // Lectura del csv desde la web
        
        const urlCSV2 = 'https://datos.madrid.es/egob/catalogo/208083-1-estacionamiento-pmr.csv'
        const response2 = await axios.get(urlCSV2, { responseType: 'stream' })

        response2.data.pipe(csvParser({ separator: ';' }))

        //---------------------------------------------------------------------------------------
        // Ruta al archivo CSV en tu directorio local
        //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Estacionamiento movilidad reducida/estacionamiento_movilidad_reducida.csv';

        // Leer el archivo CSV localmente
        //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        //fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                //console.log(row)                
                i++
                if(i > 0) {
                    var tipo
                    switch(row['Línea / Batería']) {
                        case 'Línea':
                            tipo = 1
                            break
                        case 'Batería':
                            tipo = 2
                            break
                        default:
                            tipo = 3
                    }

                    //console.log('Tipo = ' + tipo)
                    var plazas = parseInt(row['Número de Plazas'])

                    var latitude = parseFloat(row.Latitud)
                    var longitude = parseFloat(row.Longitud)
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if (row.plazas !== '' && barrio !== null && !isNaN(plazas)) { // Verifica si no es una cadena vacía y si es un número válido
                        await EstacionamientoModel.create({
                            'lat': latitude,
                            'lon': longitude,
                            'barrioId': barrio.id,
                            'coloreId': 5,
                            'tipoEstacionamientoId': tipo,
                            'plazas': parseInt(row['Número de Plazas']) // Convierte el valor a un entero antes de insertarlo
                        });
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
                }
                
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos MOVILIDAD REDUCIDA completo.');
                res.json('Estacionamientos MOVILIDAD REDUCIDA creados correctamente')
            })
    } catch (error) {
        console.error('Error al leerCSV de los estacionamientos MOVILIDAD REDUCIDA:', error.message);
        res.status(500).json({ error: 'Error al leerCSV estacionamientos MOVILIDAD REDUCIDA.' });
    }
}


//Leer csv Reservas de motos
/* Formato:
{
  Gis_X: '441631,4100000000',
  Gis_Y: '4475641,1400000000',
  'Fecha de Alta': '25/09/2010',
  Distrito: '04  SALAMANCA',
  Barrio: '04-06 CASTELLANA',
  Calle: 'MARQUES DE VILLAMAGNA, CALLE, DEL',
  'N� Finca': '8',
  'Tipo de Reserva': 'Moto',
  'L�nea / Bater�a': 'L�nea',
  'N�mero de Plazas': '11',
  Longitud: '-3,6881222550',
  'Texto Cajetines': 'Laborables de lunes a viernes de 08:00 a 20:00 ',
  Latitud: '40,4293611760'
}
*/
//Error al leerCSV de los estacionamientos MOTOS: Request failed with status code 403
//Parece que el acceso esta siendo denegado
export const leerCSV_motos = async(req, res) => {
    try {
        var contadorFallos = 0
        const barrios = await BarrioModel.findAll()

        const estacionamientos = await EstacionamientoModel.findAll()
        var encontrado
        var i = 0

        let batchCount = 0; // Contador de lotes
        const batchSize = 50; // Tamaño del lote

        //Leemos csv de los estacionamientos MOTOS
        // Lectura del csv desde la web
        
        const urlCSV3 = 'https://datos.madrid.es/egob/catalogo/205062-5-reservas-moto.csv'
        const response3 = await axios.get(urlCSV3, { responseType: 'stream' })

        response3.data.pipe(csvParser({ separator: ';' }))
        
        //---------------------------------------------------------------------------------------
        // Ruta al archivo CSV en tu directorio local
        //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Reservas moto/reservas_moto.csv';

        // Leer el archivo CSV localmente
        //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        //fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                //console.log(row)                
                i++
                if(i > 0) {
                    //Como no se codifican bien los caracteres con tilde tengo que hacer esto
                    // Buscar la clave que comienza con 'L'
                    const lineaBateriaKey = Object.keys(row).find(key => key.startsWith('L'));

                    // Obtener el valor de 'Línea / Batería'
                    const lineaBateriaValue = row[lineaBateriaKey];
                    var tipo
                    if(lineaBateriaValue === '') {
                        tipo = 3
                    } else if(lineaBateriaValue.startsWith('L')){
                        tipo = 1
                    } else {
                        tipo = 2
                    }
                    //console.log('Tipo = ' + tipo)

                    const lineaPlazasKey = Object.keys(row).find(key => key.endsWith('Plazas'))

                    // Obtener el valor de 'Número de Plazas'
                    const plazas = row[lineaPlazasKey];

                    //console.log('Plazas = ' + plazas)

                    //Como la Latitud y Longitud son cadenas de caracteres y 
                    //vienen con , en lugar de . debo de cambiar el formato y hacer parseFloat
                    var cadLat = row.Latitud.replace(',', '.')
                    var latitude = parseFloat(cadLat)

                    var cadLon = row.Longitud.replace(',', '.')
                    var longitude = parseFloat(cadLon)

                    var barrio = encontrarZona(latitude, longitude, barrios)

                    if (plazas !== '' && barrio !== null) { // Verifica si no es una cadena vacía y si es un número válido
                        await EstacionamientoModel.create({
                            'lat': latitude,
                            'lon': longitude,
                            'barrioId': barrio.id,
                            'coloreId': 6,
                            'tipoEstacionamientoId': tipo,
                            'plazas': parseInt(plazas) // Convierte el valor a un entero antes de insertarlo
                        });
                    
                        // Agregar una espera de 100 milisegundos entre cada iteración
                        await new Promise(resolve => setTimeout(resolve, 10000));
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
                }
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos MOTOS completo.');
                res.json('Estacionamientos MOTOS creados correctamente')
            })
    } catch (error) {
        console.error('Error al leerCSV de los estacionamientos MOTOS:', error.message);
        res.status(500).json({ error: 'Error al leerCSV estacionamientos MOTOS.' });
    }
}


//Leer csv Carga y Descarga 
/* Formato:
{
  'Gis_X': '438870,52',
  Gis_Y: '4473757,88',
  'Fecha de Alta': '29/09/2022',
  Distrito: '02  ARGANZUELA',
  Barrio: '02-01 IMPERIAL',
  Calle: 'LINNEO, CALLE, DE',
  'Nº Finca': '17',
  'Tipo de Reserva': 'CargayDescarga 360',
  'Línea / Batería': 'Línea',
  'Número de Plazas': '2',
  'Longitud Reserva': '11,2',
  'Texto Cajetines': 'LAB. DE 9 A 20 H. EXCEPTO CARGA Y DESCARGA MÁXIMO 45 MINUTOS',
  Longitud: '-3,720487667',
  Latitud: '40,41219714'
}
*/
export const leerCSV_carga = async(req, res) => {
    try {
        var contadorFallos = 0
        const barrios = await BarrioModel.findAll()

        const estacionamientos = await EstacionamientoModel.findAll()
        var encontrado
        var i = 0

        let batchCount = 0; // Contador de lotes
        const batchSize = 50; // Tamaño del lote

        //Leemos csv de los estacionamientos de carga
        // Lectura del csv desde la web
        
        const urlCSV4 = 'https://datos.madrid.es/egob/catalogo/208072-16-carga-descarga.csv'
        const response4 = await axios.get(urlCSV4, { responseType: 'stream' })

        response4.data.pipe(csvParser({ separator: ';' }))
        
        //---------------------------------------------------------------------------------------
        // Ruta al archivo CSV en tu directorio local
        //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Carga_descarga_2023.csv';

        // Leer el archivo CSV localmente
        //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        //fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                i++
                if(i > 0) {
                    var tipo
                    switch(row['Línea / Batería']) {
                        case 'Línea':
                            tipo = 1
                            break
                        case 'Batería':
                            tipo = 2
                            break
                        default:
                            tipo = 3
                    }
                    //console.log('Tipo = ' + tipo)
                    
                    //Como la Latitud y Longitud son cadenas de caracteres y 
                    //vienen con , en lugar de . debo de cambiar el formato y hacer parseFloat
                    var cadLat = row.Latitud.replace(',', '.')
                    var latitude = parseFloat(cadLat)

                    var cadLon = row.Longitud.replace(',', '.')
                    var longitude = parseFloat(cadLon)

                    //console.log('Plazas = ' + row['Número de Plazas'])
                    
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if (row.plazas !== '' && row.Barrio !== null) { // Verifica si no es una cadena vacía y si es un número válido
                        await EstacionamientoModel.create({
                            'lat':latitude,
                            'lon': longitude,
                            'barrioId': barrio.id,
                            'coloreId': 7,
                            'tipoEstacionamientoId': tipo,
                            'plazas': parseInt(row['Número de Plazas']) // Convierte el valor a un entero antes de insertarlo
                        });
                    
                        // Agregar una espera de 100 milisegundos entre cada iteración
                        await new Promise(resolve => setTimeout(resolve, 10000));
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
                }
                
                
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos CARGA y DESCARGA completo.');
                res.json('Estacionamientos CARGA y DESCARGA creados correctamente')
            })
    } catch (error) {
        console.error('Error al leerCSV de los estacionamientos CARGA y DESCARGA:', error.message);
        res.status(500).json({ error: 'Error al leerCSV estacionamientos CARGA y DESCARGA.' });
    }
}

//ZONAS
export const zonas = async(req, res) => {
    try {
        const estacionamientos = req.body
        console.log(estacionamientos.length)

        //Inicializamos la lista de agrupaciones (similar a los accidentes)
        const limite1 = [40.56698051912112, -3.8418246248843606]
        const limite2 = [40.31509361515658, -3.5218478307903602]

        var limite  //Las zonas estan delimitadas por este maximo de diferencia en lat y lon
        if(estacionamientos.length > 5000) {
            limite = 0.005
            console.log('Nº estacionamientos = ' + estacionamientos.length)
        } else if(estacionamientos.length > 2500) {
            limite = 0.01
        } else {
            limite = 0.05
        }
        
        var agrupaciones_aux = []
        var actual = [40.56698051912112, -3.8418246248843606]

        while(actual[0] > limite2[0]) {
            while(actual[1] < limite2[1]) {
                agrupaciones_aux.push({zona:[[actual[0], actual[1]], [actual[0] + limite, actual[1]], 
                                        [actual[0] + limite, actual[1] + limite], [actual[0], actual[1] + limite]], 
                                        estacionamientos: []}) 
                actual[1] += limite 
            }
            actual[1] = limite1[1]
            actual[0] -= limite
        }

        //Rellenamos la lista de agrupaciones_aux agregando a cada zona los estacionamientos que pertenezcan a ella
        var diferencia_x
        var diferencia_y
        var dentro
        var i
        estacionamientos.map((estacionamiento) => {
            agrupaciones_aux.map((agrupacion) => {
                dentro = true
                i = 0

                //Compruebo que el estacionamiento no se salga de ninguno de los 4 limites de la zona
                while(dentro && i < agrupacion.zona.length) {
                    diferencia_x = Math.abs(agrupacion.zona[i][0] - estacionamiento.lat)
                    diferencia_y = Math.abs(agrupacion.zona[i][1] - estacionamiento.lon)
                    if(diferencia_x > limite || diferencia_y > limite) {
                        dentro = false
                    }
                    i++
                }

                //Hemos encontrado la zona correspondiente al accidente
                if(dentro) {   
                    agrupacion.estacionamientos.push(estacionamiento)
                }
            })
        })

        //Metemos en agrupaciones solo las zonas que tengan estacionamientos
        var agrupaciones = []
        for(let i = 0; i < agrupaciones_aux.length; i++) {
            if(agrupaciones_aux[i].estacionamientos.length !== 0) {
                agrupaciones.push(agrupaciones_aux[i])
            }
        }
        
        console.log('Nº zonas = ' + agrupaciones.length)

        res.json(agrupaciones)
    } catch (error) {
        console.error('Error en la consulta zonas: ', error)
        res.status(500).json({ message: 'Error en la consulta zonas' })
    }
}

export async function estacionamientosAux(estacionamientosReq) {
    return new Promise(async (resolve, reject) => {
        try {
            const estacionamientosId = estacionamientosReq.map(el => el.id)

            const distritosBD = await DistritoModel.findAll({
                include: [{
                    model: BarrioModel,
                    as: 'barrios',
                    required: true,
                    include: [{
                        model: EstacionamientoModel,
                        as: 'estacionamientos',
                        where: {
                            id: {
                                [Op.in]: estacionamientosId
                            }
                        },
                        required: true,
                        include: [
                            {
                                model: Tipo_EstacionamientoModel,
                                as: 'tipo_estacionamiento'
                            },
                            {
                                model: ColorModel,
                                as: 'colore'
                            }
                        ]
                    }]
                }]
            })
    
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

            resolve({ distritos, barrios, estacionamientos })
        } catch (error) {
            reject(error)
        }
    })
}


export const filtro = async(req, res) => {
    try {
        const { tipo, color, plazas1, plazas2 } = req.query

        let whereConditions = {}

        if (tipo !== '') {
            whereConditions['$tipo_estacionamiento.tipo_estacionamiento$'] = tipo
        }

        if (color !== '') {
            whereConditions['$colore.color$'] = color
        }

        if (plazas1 !== '' && plazas2 !== '') {
            if (plazas1 === plazas2) {
                whereConditions.plazas = plazas1
            } else {
                whereConditions.plazas = {
                    [Op.between]: [plazas1, plazas2]
                }
            }
            
        } else if (plazas1 !== '') {
            whereConditions.plazas = {
                [Op.gte]: plazas1
            }
        } else if (plazas2 !== '') {
            whereConditions.plazas = {
                [Op.lte]: plazas2
            }
        }

        const estacionamientosBD = await EstacionamientoModel.findAll({
            include: [
                { 
                    model: Tipo_EstacionamientoModel, 
                    as: 'tipo_estacionamiento' 
                },
                {
                    model: ColorModel,
                    as: 'colore'
                }
            ],
            where: whereConditions
        })

        const { distritos, barrios, estacionamientos } = await estacionamientosAux(estacionamientosBD)
        
        res.json({ distritos, barrios, estacionamientos })
    } catch (error) {
        console.error('Error en la consulta buscarPorTipo: ', error);
        res.status(500).json({ message: ' Error en la consulta buscarPorTipo' });
    }
}
