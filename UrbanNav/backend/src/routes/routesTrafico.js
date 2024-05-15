import { Router } from "express"; 
import { leerCSV, getOrientacion,
        getAllTrafico, 

        //Filtro Chart
        getChartFechaEstacion, getChartHoraEstacion, getChartFechaDistrito, getChartHoraDistrito,

        //Filtro individual
        getTraficoPorMes, getTraficoPorSentido, getTraficoEntreHoras, 
        getTraficoPorFechaConcreta, getTraficoEntreFechas, getTraficoPorHoraConcreta, 

        //Filtro 2 atributos
        getTraficoPorEntreFechasEntreHoras, getTraficoPorEntreFechasHoraConcreta, getTraficoPorEntreFechasSentido,
        getTraficoPorFechaConcretaSentido, getTraficoPorFechaConcretaEntreHoras, getTraficoPorFechaConcretaHoraConcreta,
        getTraficoPorMesHoraConcreta, getTraficoPorMesSentido, getTraficoPorMesEntreHoras,
        getTraficoPorEntreHorasSentido, getTraficoPorHoraConcretaSentido

} from "../controllers/TraficoController.js";


const routerTrafico = Router()

routerTrafico.post('/', leerCSV)
routerTrafico.get('/modelo/orientacion', getOrientacion)

//Filtro individual + getAll
routerTrafico.get('/', getAllTrafico)
routerTrafico.get('/chart/fecha/estacion', getChartFechaEstacion)
routerTrafico.get('/chart/hora/estacion', getChartHoraEstacion)
routerTrafico.get('/chart/fecha/distrito', getChartFechaDistrito)
routerTrafico.get('/chart/hora/distrito', getChartHoraDistrito)
routerTrafico.get('/mes', getTraficoPorMes)
routerTrafico.get('/sentido', getTraficoPorSentido)
routerTrafico.get('/hora/concreta', getTraficoPorHoraConcreta)
routerTrafico.get('/hora/entre', getTraficoEntreHoras)
routerTrafico.get('/fecha/concreta', getTraficoPorFechaConcreta)
routerTrafico.get('/fecha/entre', getTraficoEntreFechas)

//Filtros 2 atributos
routerTrafico.get('/fecha/entre/hora/entre', getTraficoPorEntreFechasEntreHoras)
routerTrafico.get('/fecha/entre/hora/concreta', getTraficoPorEntreFechasHoraConcreta)
routerTrafico.get('/fecha/entre/sentido', getTraficoPorEntreFechasSentido)
routerTrafico.get('/hora/entre/sentido', getTraficoPorEntreHorasSentido)
routerTrafico.get('/fecha/concreta/hora/entre', getTraficoPorFechaConcretaEntreHoras)
routerTrafico.get('/fecha/concreta/hora/concreta', getTraficoPorFechaConcretaHoraConcreta)
routerTrafico.get('/fecha/concreta/sentido', getTraficoPorFechaConcretaSentido)
routerTrafico.get('/hora/concreta/sentido', getTraficoPorHoraConcretaSentido)
routerTrafico.get('/mes/hora/entre', getTraficoPorMesEntreHoras)
routerTrafico.get('/mes/hora/concreta', getTraficoPorMesHoraConcreta)
routerTrafico.get('/mes/sentido', getTraficoPorMesSentido)

export default routerTrafico