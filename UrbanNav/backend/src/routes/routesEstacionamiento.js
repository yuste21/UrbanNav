import {  getTipoEstacionamiento, getColor, getAllEstacionamientos,
         leerCSV_ser, leerCSV_reducida, leerCSV_motos, leerCSV_carga, 
         filtro, zonas } from "../controllers/EstacionamientoController.js";
import { Router } from 'express'

const routerEstacionamiento = Router()

routerEstacionamiento.get('/', getAllEstacionamientos)
routerEstacionamiento.get('/modelo/color', getColor)
routerEstacionamiento.get('/modelo/tipoEstacionamiento', getTipoEstacionamiento)
routerEstacionamiento.get('/filtro', filtro)
routerEstacionamiento.post('/zonas', zonas)
routerEstacionamiento.post('/ser', leerCSV_ser)
routerEstacionamiento.post('/reducida', leerCSV_reducida)
routerEstacionamiento.post('/motos', leerCSV_motos)
routerEstacionamiento.post('/carga', leerCSV_carga)

export default routerEstacionamiento