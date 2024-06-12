import { Router } from "express"; 
import { leerCSV, getOrientacion,
        getAllTrafico, filtro,

        //Filtro Chart
        getChartFechaEstacion, getChartHoraEstacion, getChartFechaDistrito, getChartHoraDistrito,


} from "../controllers/TraficoController.js";


const routerTrafico = Router()

routerTrafico.post('/', leerCSV)
routerTrafico.get('/modelo/orientacion', getOrientacion)

routerTrafico.get('/filtro', filtro)

//Filtro individual + getAll
routerTrafico.get('/', getAllTrafico)
routerTrafico.get('/chart/fecha/estacion', getChartFechaEstacion)
routerTrafico.get('/chart/hora/estacion', getChartHoraEstacion)
routerTrafico.get('/chart/fecha/distrito', getChartFechaDistrito)
routerTrafico.get('/chart/hora/distrito', getChartHoraDistrito)

export default routerTrafico