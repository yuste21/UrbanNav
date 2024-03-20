import { Router } from "express"; 
import { leerCSV, getAllTrafico, getTraficoPorMes } from "../controllers/TraficoController.js";


const routerTrafico = Router()

routerTrafico.post('/', leerCSV)
routerTrafico.get('/', getAllTrafico)
routerTrafico.get('/mes', getTraficoPorMes)

export default routerTrafico