import EstacionamientoModel from "../models/EstacionamientoModel.js";
import axios from 'axios'
import proj4 from "proj4";
import csvParser from 'csv-parser'
import { UTMtoGPS } from "./AccidenteController.js";

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'


/*
SER                 = 32.111
Reducida            = 11.983
Motos               = 1.312
Carga y Descarga    = 2.820
Total               = 48.227
*/
export const getAllEstacionamientos = async(req, res) => {
    try {
        const estacionamientos = await EstacionamientoModel.findAll()

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
        //Leemos csv de los estacionamientos SER
        // Lectura del csv desde la web
        
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/218228-16-SER-calles.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        response.data.pipe(csvParser({ separator: ';' }))
        
        //---------------------------------------------------------------------------------------
       // Ruta al archivo CSV en tu directorio local
       //const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/Estacionamiento(SER)/estacionamiento.csv';

       // Leer el archivo CSV localmente
       //const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
       //fileStream.pipe(csvParser({ separator: ';' }))

            .on('data', async (row) => {
                console.log(row)

                const { latitude, longitude } = UTMtoGPS(parseFloat(row.gis_x), parseFloat(row.gis_y))

                //console.log('Calle = ' + row.calle)

                var tipo
                if(row.bateria_linea.startsWith('L')) {
                    tipo = 'Línea'
                } else {
                    tipo = 'Batería'
                }
                //console.log('Tipo = ' + tipo)

                var cod_distrito = row.distrito.substring(0, 2)
                var distrito = row.distrito.slice(4)
                switch(cod_distrito) {
                    case '05':
                        distrito = 'CHAMARTÍN'
                        break
                    case '06':
                        distrito = 'TETUÁN'
                        break
                    case '07':
                        distrito = 'CHAMBERÍ'
                        break
                    default:

                }
                //console.log('Distrito = ' + distrito)

                var cod_barrio = row.barrio.substring(0,5)
                var barrio = row.barrio.slice(6)
                switch(cod_barrio) {
                    case '03-01':
                        barrio = 'PACÍFICO'
                        break
                    case '03-05':
                        barrio = 'JERÓNIMOS'
                        break
                    case '03-06':
                        barrio = 'NIÑO JESÚS'
                        break
                    case '05-03':
                        barrio = 'CIUDAD JARDÍN'
                        break
                    case '05-04':
                        barrio = 'HISPANOAMÉRICA'
                        break
                    case '07-05':
                        barrio = 'RÍOS ROSAS'
                        break
                    case '09-02':
                        barrio = 'ARGÜELES'
                        break
                    case '10-01':
                        barrio = 'CÁRMENES'
                        break
                    case '10-02':
                        barrio = 'PUERTA DEL ÁNGEL'
                        break
                    case '15-04':
                        barrio = 'CONCEPCIÓN'
                        break
                    default:

                }
                //console.log('Barrio = ' + barrio)

                var color = row.color.split(' ')[1]
                //console.log('Color = ' + color)

                //console.log('Plazas = ' + row.num_plazas)

                
                if (row.plazas !== '') { // Verifica si no es una cadena vacía y si es un número válido
                    await EstacionamientoModel.create({
                        'lat': latitude,
                        'lon': longitude,
                        'distrito': distrito,
                        'barrio': barrio,
                        'color': color,
                        'tipo': tipo,
                        'plazas': parseInt(row.num_plazas) // Convierte el valor a un entero antes de insertarlo
                    });
                
                    // Agregar una espera de 100 milisegundos entre cada iteración
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
                
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos SER completo.');
                res.json('Estacionamientos SER creados correctamente')
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
                console.log(row)                
                
                var tipo
                if(row['Línea / Batería'] === '') {
                    tipo = 'desconocido'
                } else {
                    tipo = row['Línea / Batería']
                }

                //console.log('Tipo = ' + tipo)
                
                var cod_distrito = row.Distrito.substring(0, 2)
                var distrito = row.Distrito.slice(4)
                switch(cod_distrito) {
                    case '05':
                        distrito = 'CHAMARTÍN'
                        break
                    case '06':
                        distrito = 'TETUÁN'
                        break
                    case '07':
                        distrito = 'CHAMBERÍ'
                        break
                    case '19':
                        distrito = 'VICÁLVARO'
                        break
                    default:

                }
                //console.log('Distrito = ' + distrito)
                
                var cod_barrio = row.Barrio.substring(0,5)
                var barrio = row.Barrio.slice(6)
                switch(cod_barrio) {
                    case '03-01':
                        barrio = 'PACÍFICO'
                        break
                    case '03-05':
                        barrio = 'JERÓNIMOS'
                        break
                    case '03-06':
                        barrio = 'NIÑO JESÚS'
                        break
                    case '05-03':
                        barrio = 'CIUDAD JARDÍN'
                        break
                    case '05-04':
                        barrio = 'HISPANOAMÉRICA'
                        break
                    case '07-05':
                        barrio = 'RÍOS ROSAS'
                        break
                    case '09-02':
                        barrio = 'ARGÜELES'
                        break
                    case '09-05':
                        barrio = 'VALDEMARÍN'
                        break
                    case '09-06':
                        barrio = 'EL PLANTÍO'
                        break
                    case '10-01':
                        barrio = 'CÁRMENES'
                        break
                    case '10-02':
                        barrio = 'PUERTA DEL ÁNGEL'
                        break
                    case '10-07':
                        barrio = 'ÁGUILAS'
                        break
                    case '11-02':
                        barrio = 'OPAÑEL'
                        break
                    case '12-03':
                        barrio = 'SAN FERMÍN'
                        break
                    case '12-05':
                        barrio = 'MOSCARDÓ'
                        break
                    case '12-06':
                        barrio = 'ZOFÍO'
                        break
                    case '13-01':
                        barrio = 'ENTREVÍAS'
                        break
                    case '14-05':
                        barrio = 'FONTARRÓN'
                        break
                    case '15-04':
                        barrio = 'CONCEPCIÓN'
                        break
                    case '16-05':
                        barrio = 'APÓSTOL SANTIAGO'
                        break
                    case '17-01':
                        barrio = 'CASCO HISTÓRICO DE VILLAVERDE'
                        break
                    case '17-02':
                        barrio = 'SAN CRISTÓBAL'
                        break
                    case '17-05':
                        barrio = 'LOS ÁNGELES'
                        break
                    case '18-01':
                        barrio = 'CASCO HISTÓRICO DE VALLECAS'
                        break
                    case '19-01':
                        barrio = 'CASCO HISTÓRICO DE VICÁLVARO'
                        break
                    case '20-02':
                        barrio = 'HELLÍN'
                        break
                    case '21-03':
                        barrio = 'CASCO HISTÓRICO DE BARAJAS'
                        break
                    case '21-04':
                        barrio = 'TIMÓN'
                        break
                    
                    default:

                }
                //console.log('Barrio = ' + barrio)
                
            
                //console.log('Plazas = ' + row.num_plazas)
                
                if (row.plazas !== '' && row.Barrio !== 'Sin Asignar' && row.Distrito !== 'Sin Asignar') { // Verifica si no es una cadena vacía y si es un número válido
                    await EstacionamientoModel.create({
                        'lat': parseFloat(row.Latitud),
                        'lon': parseFloat(row.Longitud),
                        'distrito': distrito,
                        'barrio': barrio,
                        'color': 'Amarillo',
                        'tipo': tipo,
                        'plazas': parseInt(row['Número de Plazas']) // Convierte el valor a un entero antes de insertarlo
                    });
                
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
                console.log(row)                
                
                //Como no se codifican bien los caracteres con tilde tengo que hacer esto
                // Buscar la clave que comienza con 'L'
                const lineaBateriaKey = Object.keys(row).find(key => key.startsWith('L'));

                // Obtener el valor de 'Línea / Batería'
                const lineaBateriaValue = row[lineaBateriaKey];
                var tipo
                if(lineaBateriaValue === '') {
                    tipo = 'desconocido'
                } else if(lineaBateriaValue.startsWith('L')){
                    tipo = 'Línea'
                } else {
                    tipo = 'Batería'
                }
                //console.log('Tipo = ' + tipo)
                
                var cod_distrito = row.Distrito.substring(0, 2)
                var distrito = row.Distrito.slice(4)
                switch(cod_distrito) {
                    case '05':
                        distrito = 'CHAMARTÍN'
                        break
                    case '06':
                        distrito = 'TETUÁN'
                        break
                    case '07':
                        distrito = 'CHAMBERÍ'
                        break
                    case '19':
                        distrito = 'VICÁLVARO'
                        break
                    default:

                }
                //console.log('Distrito = ' + distrito)
                
                var cod_barrio = row.Barrio.substring(0,5)
                var barrio = row.Barrio.slice(6)
                switch(cod_barrio) {
                    case '03-01':
                        barrio = 'PACÍFICO'
                        break
                    case '03-05':
                        barrio = 'JERÓNIMOS'
                        break
                    case '03-06':
                        barrio = 'NIÑO JESÚS'
                        break
                    case '05-03':
                        barrio = 'CIUDAD JARDÍN'
                        break
                    case '05-04':
                        barrio = 'HISPANOAMÉRICA'
                        break
                    case '07-05':
                        barrio = 'RÍOS ROSAS'
                        break
                    case '09-02':
                        barrio = 'ARGÜELES'
                        break
                    case '09-05':
                        barrio = 'VALDEMARÍN'
                        break
                    case '09-06':
                        barrio = 'EL PLANTÍO'
                        break
                    case '10-01':
                        barrio = 'CÁRMENES'
                        break
                    case '10-02':
                        barrio = 'PUERTA DEL ÁNGEL'
                        break
                    case '10-07':
                        barrio = 'ÁGUILAS'
                        break
                    case '11-02':
                        barrio = 'OPAÑEL'
                        break
                    case '12-03':
                        barrio = 'SAN FERMÍN'
                        break
                    case '12-05':
                        barrio = 'MOSCARDÓ'
                        break
                    case '12-06':
                        barrio = 'ZOFÍO'
                        break
                    case '13-01':
                        barrio = 'ENTREVÍAS'
                        break
                    case '14-05':
                        barrio = 'FONTARRÓN'
                        break
                    case '15-04':
                        barrio = 'CONCEPCIÓN'
                        break
                    case '16-05':
                        barrio = 'APÓSTOL SANTIAGO'
                        break
                    case '17-01':
                        barrio = 'CASCO HISTÓRICO DE VILLAVERDE'
                        break
                    case '17-02':
                        barrio = 'SAN CRISTÓBAL'
                        break
                    case '17-05':
                        barrio = 'LOS ÁNGELES'
                        break
                    case '18-01':
                        barrio = 'CASCO HISTÓRICO DE VALLECAS'
                        break
                    case '19-01':
                        barrio = 'CASCO HISTÓRICO DE VICÁLVARO'
                        break
                    case '20-02':
                        barrio = 'HELLÍN'
                        break
                    case '21-03':
                        barrio = 'CASCO HISTÓRICO DE BARAJAS'
                        break
                    case '21-04':
                        barrio = 'TIMÓN'
                        break
                    
                    default:

                }
                //console.log('Barrio = ' + barrio)
                

                const lineaPlazasKey = Object.keys(row).find(key => key.endsWith('Plazas'))

                // Obtener el valor de 'Número de Plazas'
                const plazas = row[lineaPlazasKey];

                //console.log('Plazas = ' + plazas)

                //Como la Latitud y Longitud son cadenas de caracteres y 
                //vienen con , en lugar de . debo de cambiar el formato y hacer parseFloat
                var cadLat = row.Latitud.replace(',', '.')
                var cadLon = row.Longitud.replace(',', '.')
                
                if (plazas !== '' && row.Barrio !== 'Sin Asignar' && row.Distrito !== 'Sin Asignar') { // Verifica si no es una cadena vacía y si es un número válido
                    await EstacionamientoModel.create({
                        'lat': parseFloat(cadLat),
                        'lon': parseFloat(cadLon),
                        'distrito': distrito,
                        'barrio': barrio,
                        'color': 'Negro',
                        'tipo': tipo,
                        'plazas': parseInt(plazas) // Convierte el valor a un entero antes de insertarlo
                    });
                
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
                var tipo
                if(row['Línea / Batería'] === '') {
                    tipo = 'desconocido'
                } else {
                    tipo = row['Línea / Batería']
                }

                //console.log('Tipo = ' + tipo)
                
                var cod_distrito = row.Distrito.substring(0, 2)
                var distrito = row.Distrito.slice(4)
                switch(cod_distrito) {
                    case '05':
                        distrito = 'CHAMARTÍN'
                        break
                    case '06':
                        distrito = 'TETUÁN'
                        break
                    case '07':
                        distrito = 'CHAMBERÍ'
                        break
                    case '19':
                        distrito = 'VICÁLVARO'
                        break
                    default:

                }
                //console.log('Distrito = ' + distrito)
                
                var cod_barrio = row.Barrio.substring(0,5)
                var barrio = row.Barrio.slice(6)
                switch(cod_barrio) {
                    case '03-01':
                        barrio = 'PACÍFICO'
                        break
                    case '03-05':
                        barrio = 'JERÓNIMOS'
                        break
                    case '03-06':
                        barrio = 'NIÑO JESÚS'
                        break
                    case '05-03':
                        barrio = 'CIUDAD JARDÍN'
                        break
                    case '05-04':
                        barrio = 'HISPANOAMÉRICA'
                        break
                    case '07-05':
                        barrio = 'RÍOS ROSAS'
                        break
                    case '09-02':
                        barrio = 'ARGÜELES'
                        break
                    case '09-05':
                        barrio = 'VALDEMARÍN'
                        break
                    case '09-06':
                        barrio = 'EL PLANTÍO'
                        break
                    case '10-01':
                        barrio = 'CÁRMENES'
                        break
                    case '10-02':
                        barrio = 'PUERTA DEL ÁNGEL'
                        break
                    case '10-07':
                        barrio = 'ÁGUILAS'
                        break
                    case '11-02':
                        barrio = 'OPAÑEL'
                        break
                    case '12-03':
                        barrio = 'SAN FERMÍN'
                        break
                    case '12-05':
                        barrio = 'MOSCARDÓ'
                        break
                    case '12-06':
                        barrio = 'ZOFÍO'
                        break
                    case '13-01':
                        barrio = 'ENTREVÍAS'
                        break
                    case '14-05':
                        barrio = 'FONTARRÓN'
                        break
                    case '15-04':
                        barrio = 'CONCEPCIÓN'
                        break
                    case '16-05':
                        barrio = 'APÓSTOL SANTIAGO'
                        break
                    case '17-01':
                        barrio = 'CASCO HISTÓRICO DE VILLAVERDE'
                        break
                    case '17-02':
                        barrio = 'SAN CRISTÓBAL'
                        break
                    case '17-05':
                        barrio = 'LOS ÁNGELES'
                        break
                    case '18-01':
                        barrio = 'CASCO HISTÓRICO DE VALLECAS'
                        break
                    case '19-01':
                        barrio = 'CASCO HISTÓRICO DE VICÁLVARO'
                        break
                    case '20-02':
                        barrio = 'HELLÍN'
                        break
                    case '21-03':
                        barrio = 'CASCO HISTÓRICO DE BARAJAS'
                        break
                    case '21-04':
                        barrio = 'TIMÓN'
                        break
                    
                    default:

                }
                //console.log('Barrio = ' + barrio)
                
                //Como la Latitud y Longitud son cadenas de caracteres y 
                //vienen con , en lugar de . debo de cambiar el formato y hacer parseFloat
                var cadLat = row.Latitud.replace(',', '.')
                var cadLon = row.Longitud.replace(',', '.')

                //console.log('Plazas = ' + row['Número de Plazas'])
                
                if (row.plazas !== '' && row.Barrio !== 'Sin Asignar' && row.Distrito !== 'Sin Asignar') { // Verifica si no es una cadena vacía y si es un número válido
                    await EstacionamientoModel.create({
                        'lat': parseFloat(cadLat),
                        'lon': parseFloat(cadLon),
                        'distrito': distrito,
                        'barrio': barrio,
                        'color': 'Morado',
                        'tipo': tipo,
                        'plazas': parseInt(row['Número de Plazas']) // Convierte el valor a un entero antes de insertarlo
                    });
                
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

//--------------------------------------------------------------------------------------------------//
//BUSCAR POR DISTRITO
export const buscarPorDistrito = async(req, res) => {
    try {
        const { distrito } = req.query

        const estacionamientos = await EstacionamientoModel.findAll({
            where: {
                distrito: distrito
            }
        })

        console.log(estacionamientos.length)
        res.json(estacionamientos)
    } catch (error) {
        console.error('Error en la consulta buscarPorDistrito: ', error);
        res.status(500).json({ message: ' Error en la consulta buscarPorDistrito' });
    }
}

//BUSCAR POR BARRIO
export const buscarPorBarrio = async(req, res) => {
    try {
        const { barrio } = req.query

        const estacionamientos = await EstacionamientoModel.findAll({
            where: {
                barrio: barrio
            }
        })

        res.json(estacionamientos)
    } catch (error) {
        console.error('Error en la consulta buscarPorBarrio: ', error);
        res.status(500).json({ message: ' Error en la consulta buscarPorBarrio' });
    }
}

//BUSCAR POR TIPO DE APARCAMIENTO
export const buscarPorTipo = async(req, res) => {
    try {
        const { tipo } = req.query

        const estacionamientos = await EstacionamientoModel.findAll({
            where: {
                tipo: tipo
            }
        })

        res.json(estacionamientos)
    } catch (error) {
        console.error('Error en la consulta buscarPorTipo: ', error);
        res.status(500).json({ message: ' Error en la consulta buscarPorTipo' });
    }
}

//BUSCAR POR COLOR
export const buscarPorColor = async(req, res) => {
    try {
        const { color } = req.query

        const estacionamientos = await EstacionamientoModel.findAll({
            where: {
                color: color
            }
        })

        console.log(estacionamientos.length)
        res.json(estacionamientos)
    } catch (error) {
        console.error('Error en la consulta buscarPorColor: ', error);
        res.status(500).json({ message: ' Error en la consulta buscarPorColor' });
    }
}

