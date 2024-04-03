import { Router } from "express"; 
import { leerCSV, 
        getAllTrafico, getChartFecha, getChatHora, getTraficoPorMes, getTraficoPorSentido, getTraficoEntreHoras, 
        getTraficoPorFecha, getTraficoEntreFechas, getTraficoPorHora } from "../controllers/TraficoController.js";


const routerTrafico = Router()

routerTrafico.post('/', leerCSV)
routerTrafico.get('/', getAllTrafico)
routerTrafico.get('/chart/fecha', getChartFecha)
routerTrafico.get('/chart/hora', getChatHora)
routerTrafico.get('/mes', getTraficoPorMes)
routerTrafico.get('/sentido', getTraficoPorSentido)
routerTrafico.get('/hora/concreta', getTraficoPorHora)
routerTrafico.get('/hora/entre', getTraficoEntreHoras)
routerTrafico.get('/fecha/concreta', getTraficoPorFecha)
routerTrafico.get('/fecha/entre', getTraficoEntreFechas)

export default routerTrafico