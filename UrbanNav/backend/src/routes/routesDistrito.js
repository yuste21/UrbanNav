import express from 'express'
import { leer_delimitaciones, getAllDistritos, 
        getAccidentesInicio, 
        getEstacionamientosInicio, prueba,
        getRadaresInicio, 
        getTraficoInicio } from '../controllers/DistritoController.js'

const routerDistrito = express.Router()

routerDistrito.post('/delimitaciones', leer_delimitaciones)
routerDistrito.get('/', getAllDistritos)

routerDistrito.get('/accidentes/inicio', getAccidentesInicio)

routerDistrito.get('/estacionamientos/inicio', getEstacionamientosInicio)

routerDistrito.get('/trafico/inicio', getTraficoInicio)

routerDistrito.get('/radares/inicio', getRadaresInicio)

routerDistrito.get('/prueba', prueba)

export default routerDistrito

