import AccidenteModel from "../models/AccidenteModel.js";
import axios from 'axios' 
import proj4 from 'proj4'   //Convertir coordenadas UTM en geograficas
import csvParser from 'csv-parser'  //Leer archivo csv
import { Sequelize, Op, fn, col } from 'sequelize'

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'

/*
Coches = 48830
Bicis = 906
Total = 49736
*/
export const getAllAccidentes = async(req, res) => {
    try {
        const accidentes = await AccidenteModel.findAll()

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta getAllAccidentes: ', error)
        res.status(500).json({ message: 'Error al obtener los accidentes' })
    }
}

export const getZonas = async(req, res) => {
    try {
        const accidentes = await AccidenteModel.findAll()

        //Inicializamos la lista de agrupaciones
        const limite1 = [40.56698051912112, -3.8418246248843606]
        const limite2 = [40.31509361515658, -3.5218478307903602]
        const limite = 0.02     //Las zonas estan delimitadas por este maximo de diferencia en lat y lon
        var agrupaciones_aux = []
        var actual = [40.56698051912112, -3.8418246248843606]

        while(actual[0] > limite2[0]) {
            while(actual[1] < limite2[1]) {
                agrupaciones_aux.push({zona:[[actual[0], actual[1]], [actual[0] + limite, actual[1]], 
                                        [actual[0] + limite, actual[1] + limite], [actual[0], actual[1] + limite]], 
                                        lesividad: 0, accidentes: 0, balance: 0}) 
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
                while(dentro && i < agrupacion.zona.length) {
                    diferencia_x = Math.abs(agrupacion.zona[i][0] - accidente.lat)
                    diferencia_y = Math.abs(agrupacion.zona[i][1] - accidente.lon)
                    if(diferencia_x > limite || diferencia_y > limite) {
                        dentro = false
                    }
                    i++
                }

                //Hemos encontrado la zona correspondiente al accidente
                if(dentro) {   
                    var lesion
                    //Calculamos la gravedad de la lesion y la añadimos a la media
                    if(accidente.lesividad === 1 || accidente.lesividad === 2 || accidente.lesividad === 5 || 
                        accidente.lesividad === 6 || accidente.lesividad === 7) {

                        lesion = 2
                    } else if(accidente.lesividad === 3) {
                        lesion = 3
                    } else if(accidente.lesividad === 4) {
                        lesion = 5
                    } else {
                        lesion = 1
                    }
                
                    agrupacion.lesividad = (agrupacion.lesividad * agrupacion.accidentes + lesion)/(agrupacion.accidentes+1)
                    agrupacion.accidentes++
                }
            })
        })
        //Sacamos de la lista de agrupacion las zonas que no tienen ningun accidente
        
        var agrupaciones = []
        for(let i = 0; i < agrupaciones_aux.length; i++) {
            if(agrupaciones_aux[i].accidentes !== 0) {
                agrupaciones_aux[i].balance = agrupaciones_aux[i].accidentes * agrupaciones_aux[i].lesividad
                agrupaciones.push(agrupaciones_aux[i])
            }
        }
        
        res.json(agrupaciones)
    } catch (error) {
        console.log('Error en la consulta getZonas: ', error)
        res.status(500).json({ message: 'Error al obtener getZonas' })
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
        //Leemos csv de los accidentes coche 
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300228-26-accidentes-trafico-detalle.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        //Parsear el contenido del CSV y procesar cada fila
        response.data.pipe(csvParser({ separator: ';' }))
        */
       // Ruta al archivo CSV en tu directorio local
       const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/2023_Accidentalidad.csv';

       // Leer el archivo CSV localmente
       const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

       let batchCount = 0; // Contador de lotes
       const batchSize = 100; // Tamaño del lote

       fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                // Procesar cada fila del CSV
                console.log(row)
                
                var edad
                if(row.rango_edad.includes('Más de') || row.rango_edad.includes('Menor de')) {
                    edad = parseInt(row.rango_edad.split(' ')[2])
                } else if(row.rango_edad === 'Desconocido') {
                    edad = -1
                } else {
                    edad = parseInt(row.rango_edad.split(' ')[1])
                }
                //console.log('Edad: ' + edad)

                var partesFecha = row.fecha.split('/')
                var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]
                
                //console.log('Coordenadas UTM:', parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm));
                const { latitude, longitude} = UTMtoGPS(parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm))
                //console.log('Lat / Lon: ' + latitude + ' / ' + longitude)
                
                const lesividad = row.cod_lesividad === 'NULL' ? 0 : row.cod_lesividad

                //console.log('Clima1: ' + row['estado_meteorológico'])

                var alcohol
                if(row.positiva_alcohol === 'S') {
                    alcohol = true
                } else {
                    alcohol = false
                } 

                var drogas
                if(row.positiva_droga === '1') {
                    drogas = true
                } else {
                    drogas = false
                }
                
                var clima
                if(row['estado_meteorológico'] === 'NULL') {
                    clima = 'Se desconoce'
                } else {
                    clima = row['estado_meteorológico']
                }

                await AccidenteModel.create({
                    'fecha': nuevaFecha,
                    'hora': row.hora,
                    'localizacion': row.localizacion,
                    'distrito': row.distrito,
                    'accidente': row.tipo_accidente,
                    'clima': clima,
                    'vehiculo': row.tipo_vehiculo,
                    'persona': row.tipo_persona,
                    'sexo': row.sexo,
                    'lesividad': lesividad,
                    'edad': edad,
                    'lat': latitude,
                    'lon': longitude,
                    'alcohol': alcohol,
                    'drogas': drogas 
                })
                
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
export const leerCSV_bicis = async(req, res) => {
    try {
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
                if(row.rango_edad.includes('Más de') || row.rango_edad.includes('Menor de')) {
                    edad = parseInt(row.rango_edad.split(' ')[2])
                } else if(row.rango_edad === 'Desconocido') {
                    edad = -1
                } else {
                    edad = parseInt(row.rango_edad.split(' ')[1])
                }
                //console.log('Edad: ' + edad)

                var partesFecha = row.fecha.split('/')
                var nuevaFecha = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0]
                
                //console.log('Coordenadas UTM:', parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm));
                const { latitude, longitude} = UTMtoGPS(parseFloat(row.coordenada_x_utm), parseFloat(row.coordenada_y_utm))
                //console.log('Lat / Lon: ' + latitude + ' / ' + longitude)
                
                const lesividad = row.cod_lesividad === 'NULL' ? 0 : row.cod_lesividad

                //console.log('Clima1: ' + row['estado_meteorológico'])

                var alcohol
                if(row.positiva_alcohol === 'S') {
                    alcohol = true
                } else {
                    alcohol = false
                }

                var drogas
                if(row.positiva_droga === '1') {
                    drogas = true
                } else {
                    drogas = false
                }
                
                var clima
                if(row['estado_meteorológico'] === 'NULL') {
                    clima = 'Se desconoce'
                } else {
                    clima = row['estado_meteorológico']
                }

                await AccidenteModel.create({
                    'fecha': nuevaFecha,
                    'hora': row.hora,
                    'localizacion': row.localizacion,
                    'distrito': row.distrito,
                    'accidente': row.tipo_accidente,
                    'clima': clima,
                    'vehiculo': row.tipo_vehiculo,
                    'persona': row.tipo_persona,
                    'sexo': row.sexo,
                    'lesividad': lesividad,
                    'edad': edad,
                    'lat': latitude,
                    'lon': longitude,
                    'alcohol': alcohol,
                    'drogas': drogas 
                })
                
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

//BUSCAR POR FECHA
//- Buscar por fecha concreta
export const buscarFechaConcreta = async (req, res) => {
    try {
        //const fecha = new Date(req.body.fecha)
        const fecha = req.query.fecha
        const accidentes = await AccidenteModel.findAll({
            where: { fecha: fecha }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarFechaConcreta: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarFechaConcreta' })
    }
}

//- Buscar entre 2 fechas
export const buscarEntreFechas = async (req, res) => {
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

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            }
        })

        res.json(accidentes)

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

//BUSCAR POR HORA
//- Buscar por hora concreta
export const buscarPorHora = async(req, res) => {
    try {
        const hora = req.query.hora

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorHora: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHora' })
    }
}

//- Buscar entre horas
export const buscarEntreHoras = async(req, res) => {
    try {
        const { hora1, hora2 } = req.query

        var horaInicio
        var horaFin
    
        if(hora1 <= hora2) {
            horaInicio = hora1
            horaFin = hora2
        } else {
            horaInicio = hora2
            horaFin = hora1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: {
                    [Op.between]: [horaInicio, horaFin]
                }
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarEntreHoras: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarEntreHoras' })
    }
}


//BUSCAR POR RANGO DE EDAD
//En el front debo encargarme de que las edades a elegir sean las de los rangos. No me puede llegar una edad cualquiera
export const buscarPorEdad = async(req, res) => {
    try {
        const { edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdad' })
    }
}

//BUSCAR POR TIPO DE VEHICULO
export const buscarPorVehiculo = async(req, res) => {
    try {
        const vehiculo = req.query.vehiculo

        const accidentes = await AccidenteModel.findAll({
            where: {
                vehiculo: {
                    [Sequelize.Op.like]: '%' + vehiculo + '%'
                }
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorVehiculo' })
    }
}

//BUSCAR POR DISTRITO
export const buscarPorDistrito = async(req, res) => {
    try {
        const distrito = req.query.distrito

        const accidentes = await AccidenteModel.findAll({
            where: {
                distrito: distrito
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorDistrito: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorDistrito' })
    }
}

//BUSCAR POR DROGAS
export const buscarPorDrogas = async (req, res) => {
    try {
        //positivo = 1 -> positivo en drogas | positivo = 0 -> negativo en drogas
        const positivo = req.query.drogas

        const accidentes = await AccidenteModel.findAll({
            where: {
                drogas: positivo
            }
        })

        res.json(accidentes)

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

        const accidentes = await AccidenteModel.findAll({
            where: {
                alcohol: positivo
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAlcohol' })
    }
}

//BUSCAR POR LESION
/* Lesiones:
    - LEVE: 1, 2, 5, 6, 7
    - GRAVE: 3
    - FALLECIDO: 4
    - Sin asistencia sanitaria: 14
*/
export const buscarPorLesionGravedad = async(req, res) => {
    try {
        const lesion = req.query.lesion

        if(lesion === 'LEVE') {

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    }
                }
            })

            res.json(accidentes)
        } else {
            var codigo
            if(lesion === 'GRAVE') {
                codigo = 3
            } else if(lesion === 'FALLECIDO') {
                 codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: codigo
                }
            })

            res.json(accidentes)
        }
    } catch (error) {
        console.log('Error en la consulta buscarPorLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorLesion' })
    }
}

//BUSCAR POR SEXO
export const buscarPorSexo = async(req, res) => {
    try {
        const sexo = req.query.sexo

        const accidentes = await AccidenteModel.findAll({
            where: {
                sexo: sexo
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorSexo' })
    }
}

//BUSCAR POR TIPO DE ACCIDENTE
export const buscarPorAccidente = async(req, res) => {
    try {
        const accidente = req.query.accidente

        const accidentes = await AccidenteModel.findAll({
            where: {
                accidente: {
                    [Sequelize.Op.like]: '%' + accidente + '%'
                }
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorAccidente' })
    }
}

//BUSCAR POR CLIMA
export const buscarPorClima = async(req, res) => {
    try {
        const clima = req.query.clima

        const accidentes = await AccidenteModel.findAll({
            where: {
                clima: {
                    [Sequelize.Op.like]: '%' + clima + '%'
                }
            }
        })

        res.json(accidentes)

    } catch (error) {
        console.log('Error en la consulta buscarPorClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorClima' })
    }
}
//--------------------------------------------------------------------------
//FECHA + 1
//BUSCAR POR FECHA Y HORA
export const buscarPorFechaHora = async(req, res) => {
    try {
        const { fecha, hora } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                hora: hora
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaHora: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaHora' })
    }
}

//BUSCAR POR FECHA Y EDAD
export const buscarPorFechaEdad = async(req, res) => {
    try {
        const { fecha, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })
        
        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaEdad: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaEdad' })
    }
}

//BUSCAR POR FECHA Y VEHICULO
export const buscarPorFechaVehiculo = async(req, res) => {
    try {
        const { fecha, vehiculo } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                vehiculo: vehiculo
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaVehiculo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaVehiculo' })
    }
}

//BUSCAR POR FECHA Y DISTRITO
export const buscarPorFechaDistrito = async(req, res) => {
    try {
        const { fecha, distrito } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                distrito: distrito
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaDistrito: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaDistrito' })
    }
}

//BUSCAR POR FECHA Y DROGAS
export const buscarPorFechaDrogas = async(req, res) => {
    try {
        const { fecha, drogas } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                drogas: drogas
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaDrogas' })
    }
}

//BUSCAR POR FECHA Y ALCOHOL
export const buscarPorFechaAlcohol = async(req, res) => {
    try {
        const { fecha, alcohol } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                alcohol: alcohol
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaAlcohol' })
    }
}

//BUSCAR POR FECHA Y LESION
export const buscarPorFechaLesion = async(req, res) => {
    try {
        const { fecha, lesion } = req.query

        if(lesion === 'LEVE') {

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    fecha: fecha
                }
            })

            res.json(accidentes)
        } else {
            var codigo
            if(lesion === 'GRAVE') {
                codigo = 3
            } else if(lesion === 'FALLECIDO') {
                 codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: codigo,
                    fecha: fecha
                }
            })

            res.json(accidentes)
        }

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaLesion' })
    }
}

//BUSCAR POR FECHA Y SEXO
export const buscarPorFechaSexo = async(req, res) => {
    try {
        const { fecha, sexo } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                sexo: sexo
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaSexo' })
    }
}

//BUSCAR POR FECHA Y ACCIDENTE 
export const buscarPorFechaAccidente = async(req, res) => {
    try {
        const { fecha, accidente } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                accidente: {
                    [Sequelize.Op.like]: '%' + accidente + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaAccidente' })
    }
}

//BUSCAR POR FECHA Y CLIMA
export const buscarPorFechaClima = async(req, res) => {
    try {
        const { fecha, clima } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                fecha: fecha,
                clima: {
                    [Sequelize.Op.like]: '%' + clima + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorFechaClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorFechaClima' })
    }
}

//--------------------------------------------------------------------------
//HORA+
//BUSCAR POR HORA Y EDAD
export const buscarPorHoraEdad = async(req, res) => {
    try {
        const { hora, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraEdad: ', error })
        console.log('Error en la consulta buscarPorHoraEdad: ', error)
    }
}

//BUSCAR POR HORA Y VEHICULO
export const buscarPorHoraVehiculo = async(req, res) => {
    try {
        const { hora, vehiculo } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                vehiculo: vehiculo
            }
        })

        res.json(accidentes)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraVehiculo: ', error })
        console.log('Error en la consulta buscarPorHoraVehiculo: ', error)
    }
}

//BUSCAR POR HORA Y DISTRITO
export const buscarPorHoraDistrito = async(req, res) => {
    try {
        const { hora, distrito } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                distrito: distrito
            }
        })

        res.json(accidentes)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraDistrito: ', error })
        console.log('Error en la consulta buscarPorHoraDistrito: ', error)
    }
}

//BUSCAR POR HORA Y DROGAS
export const buscarPorHoraDrogas = async(req, res) => {
    try {
        const { hora, drogas } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                drogas: drogas
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraDrogas' })
    }
}

//BUSCAR POR HORA Y ALCOHOL
export const buscarPorHoraAlcohol = async(req, res) => {
    try {
        const { hora, alcohol } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                alcohol: alcohol
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscbuscarPorHoraAlcohol' })
    }
}

//BUSCAR POR HORA Y LESION
export const buscarPorHoraLesion = async(req, res) => {
    try {
        const { hora, lesion } = req.query

        if(lesion === 'LEVE') {

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    hora: hora
                }
            })

            res.json(accidentes)
        } else {
            var codigo
            if(lesion === 'GRAVE') {
                codigo = 3
            } else if(lesion === 'FALLECIDO') {
                 codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: codigo,
                    hora: hora
                }
            })

            res.json(accidentes)
        }

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraLesion' })
    }
}

//BUSCAR POR HORA Y SEXO
export const buscarPorHoraSexo = async(req, res) => {
    try {
        const { hora, sexo } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                sexo: sexo
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraSexo' })
    }
}

//BUSCAR POR HORA Y ACCIDENTE 
export const buscarPorHoraAccidente = async(req, res) => {
    try {
        const { hora, accidente } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                accidente: {
                    [Sequelize.Op.like]: '%' + accidente + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraAccidente' })
    }
}

//BUSCAR POR HORA Y CLIMA
export const buscarPorHoraClima = async(req, res) => {
    try {
        const { hora, clima } = req.query

        const accidentes = await AccidenteModel.findAll({
            where: {
                hora: hora,
                clima: {
                    [Sequelize.Op.like]: '%' + clima + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorHoraClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorHoraClima' })
    }
}

//--------------------------------------------------------------------------
//EDAD+
//BUSCAR POR EDAD Y VEHICULO
export const buscarPorEdadVehiculo = async(req, res) => {
    try {
        const { vehiculo, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                vehiculo: vehiculo,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadVehiculo: ', error })
        console.log('Error en la consulta buscarPorEdadVehiculo: ', error)
    }
}

//BUSCAR POR EDAD Y DISTRITO
export const buscarPorEdadDistrito = async(req, res) => {
    try {
        const { distrito, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                distrito: distrito,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadDistrito: ', error })
        console.log('Error en la consulta buscarPorEdadDistrito: ', error)
    }
}

//BUSCAR POR EDAD Y DROGAS
export const buscarPorEdadDrogas = async(req, res) => {
    try {
        const { drogas, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                drogas: drogas,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadDrogas: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadDrogas' })
    }
}

//BUSCAR POR EDAD Y ALCOHOL
export const buscarPorEdadAlcohol = async(req, res) => {
    try {
        const { alcohol, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                alcohol: alcohol,
                edad: {
                    [Op.between]: [edadMin, edadMax]
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadAlcohol: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadAlcohol' })
    }
}

//BUSCAR POR EDAD Y LESION
export const buscarPorEdadLesion = async(req, res) => {
    try {
        const { lesion, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        if(lesion === 'LEVE') {

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: {
                        [Op.in]: [1, 2, 5, 6, 7],
                    },
                    edad: {
                        [Op.between]: [edadMin, edadMax]
                    }
                }
            })

            res.json(accidentes)
        } else {
            var codigo
            if(lesion === 'GRAVE') {
                codigo = 3
            } else if(lesion === 'FALLECIDO') {
                 codigo = 4
            } else {    //Sin asistencia
                codigo = 14
            }

            const accidentes = await AccidenteModel.findAll({
                where: {
                    lesividad: codigo,
                    edad: {
                        [Op.between]: [edadMin, edadMax]
                    }
                }
            })

            res.json(accidentes)
        }

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadLesion: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadLesion' })
    }
}

//BUSCAR POR EDAD Y SEXO
export const buscarPorEdadSexo = async(req, res) => {
    try {
        const { sexo, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                sexo: sexo
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadSexo: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadSexo' })
    }
}

//BUSCAR POR EDAD Y ACCIDENTE 
export const buscarPorEdadAccidente = async(req, res) => {
    try {
        const { accidente, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }

        const accidentes = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                accidente: {
                    [Sequelize.Op.like]: '%' + accidente + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadAccidente: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadAccidente' })
    }
}

//BUSCAR POR EDAD Y CLIMA
export const buscarPorEdadClima = async(req, res) => {
    try {
        const { clima, edad1, edad2 } = req.query

        var edadMin
        var edadMax 

        if(edad1 <= edad2) {
            edadMin = edad1
            edadMax = edad2
        } else {
            edadMin = edad2
            edadMax = edad1
        }


        const accidentes = await AccidenteModel.findAll({
            where: {
                edad: {
                    [Op.between]: [edadMin, edadMax]
                },
                clima: {
                    [Sequelize.Op.like]: '%' + clima + '%'
                }
            }
        })

        res.json(accidentes)
    } catch (error) {
        console.log('Error en la consulta buscarPorEdadClima: ', error)
        res.status(500).json({ message: 'Error en la consulta buscarPorEdadClima' })
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

    // Convertir coordenadas UTM a latitud y longitud
    const [longitude, latitude] = proj4('EPSG:326' + 30, 'EPSG:4326', [x, y]);

    console.log('UTM to GPS lat / lon = ' + latitude + ' / ' + longitude)

    return { latitude, longitude }
}