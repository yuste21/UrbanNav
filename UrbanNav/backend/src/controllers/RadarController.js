import RadarModel from "../models/RadarModel.js";

import axios from 'axios'
import proj4 from "proj4";
import csvParser from 'csv-parser'

//Para leer desde el directorio local
import fs from 'fs'
import path from 'path'

export const getAllRadares = async(req, res) => {
    try {
     const radares = await RadarModel.findAll()
     
     res.json(radares)
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta getAllRadares' })
        console.log('Error en la consulta getAllRadares: ', error)
    }
}

export const leerCSV_radar = async(req, res) => {
    try {
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

        fileStream.pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                console.log(row)

                if(row.Latitud !== '') {
                    await RadarModel.create({
                        'lat': parseFloat(row.Latitud),
                        'lon': parseFloat(row.Longitud),
                        'sentido': row.Sentido,
                        'tipo': row.Tipo
                    })
                }
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