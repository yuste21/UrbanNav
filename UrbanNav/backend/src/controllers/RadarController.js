import RadarModel from "../models/RadarModel.js";

import axios from 'axios'
import proj4 from "proj4";
import csvParser from 'csv-parser'

//Para leer desde el directorio local
import fs from 'fs'
import path, { parse } from 'path'
import { BarrioModel } from "../models/DistritoModel.js";
import { encontrarZona } from "../controllers/DistritoController.js"

export const getAllRadares = async(req, res) => {
    try {
     const radares = await RadarModel.findAll()
     
     res.json(radares)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getAllRadares' })
        console.log('Error en la consulta getAllRadares: ', error)
    }
}

/**
 * Estructura radares.csv:
 * {
  '"Nº\nRADAR"': '29',
  Ubicacion: 'A-5 PK 4+000, SENTIDO ENTRADA',
  'Carretara o vial': 'A5',
  'UBICACIÓN\nCalle 30': '',
  PK: 'P.K. 5+750 ----- P.K  4+000',
  Sentido: 'Entrada',
  Tipo: 'Entrada, radar de tramo',
  'X (WGS84)': '436722.693562517',
  'Y (WGS84)': '4473225.55366121',
  Longitud: '-3.74574755307117',
  Latitud: '40.4072412609861',
  Coordenadas: 'DGGVC'
 * }
 */

export const leerCSV_radar = async(req, res) => {
    try {
        const barrios = await BarrioModel.findAll()

        //Leemos csv de los radares
        // Lectura del csv desde la web
        /*
        const urlCSV = 'https://datos.madrid.es/egob/catalogo/300049-0-radares-fijos-moviles.csv'
        const response = await axios.get(urlCSV, { responseType: 'stream' })

        response.data.pipe(csvParser({ separator: ';' }))
        */

        const filePath = 'C:/Users/Nombre/Desktop/Alvaro/UNI/4/TFG/Datos/radares.csv';

        // Leer el archivo CSV localmente
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        var n_radar = 1
        fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                //console.log(row)
                //console.log('Ubicacion = ' + row.Ubicacion)
                //console.log('PK = ' + row.PK)
                
                if(row.Latitud !== '') {
                    var latitude = parseFloat(row.Latitud)
                    var longitude = parseFloat(row.Longitud)
                    var barrio = encontrarZona(latitude, longitude, barrios)
                    if(barrio !== null) {
                        await RadarModel.create({
                            'lat': parseFloat(row.Latitud),
                            'lon': parseFloat(row.Longitud),
                            'sentido': row.Sentido,
                            'tipo': row.Tipo,
                            'barrioId': barrio.id,
                            'numero': n_radar,
                            'ubicacion': row.Ubicacion,
                            'pk': row.PK
                        })
                    }
                }
                
               n_radar++
            })
            .on('end', () => {
                console.log('Procesamiento del CSV de estacionamientos completo.');
                res.json('Estacionamientos creados correctamente')
            })
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta leerCSV_radar' })
        console.log('Error en la consulta leerCSV_radar: ', error)
    }
}