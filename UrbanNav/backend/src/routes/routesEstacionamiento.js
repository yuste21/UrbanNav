import { getAllEstacionamientos, leerCSV_ser, leerCSV_reducida, leerCSV_motos, leerCSV_carga, 
         buscarPorBarrio, buscarPorDistrito, buscarPorTipo, buscarPorColor, zonas } from "../controllers/EstacionamientoController.js";
import { Router } from 'express'

const routerEstacionamiento = Router()

routerEstacionamiento.get('/', getAllEstacionamientos)
routerEstacionamiento.get('/barrio', buscarPorBarrio)
routerEstacionamiento.get('/distrito', buscarPorDistrito)
routerEstacionamiento.get('/tipo', buscarPorTipo)
routerEstacionamiento.get('/color', buscarPorColor)
routerEstacionamiento.post('/zonas', zonas)
routerEstacionamiento.post('/ser', leerCSV_ser)
routerEstacionamiento.post('/reducida', leerCSV_reducida)
routerEstacionamiento.post('/motos', leerCSV_motos)
routerEstacionamiento.post('/carga', leerCSV_carga)

export default routerEstacionamiento