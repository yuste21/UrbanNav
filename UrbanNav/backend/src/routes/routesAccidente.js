import express from 'express'
import { getAllAccidentes, getZonas, getZona_concreta, leerCSV_coches, leerCSV_bicis, 
         getSexo, getClima, getTipoAccidente, getTipoPersona, getTipoVehiculo, getLesividad,
         getChartFechaDistrito, getChartHoraDistrito, getChartFechaBarrio, getChartHoraBarrio,

        filtro,


    } from '../controllers/AccidenteController.js' 

        

const routerAccidente = express.Router()

routerAccidente.get('/filtro', filtro)

//Leer CSV
routerAccidente.post('/coches', leerCSV_coches)
routerAccidente.post('/bicis', leerCSV_bicis)

//Get Chart
routerAccidente.get('/chart/fecha/distrito', getChartFechaDistrito)
routerAccidente.get('/chart/hora/distrito', getChartHoraDistrito)
routerAccidente.get('/chart/fecha/barrio', getChartFechaBarrio)
routerAccidente.get('/chart/hora/barrio', getChartHoraBarrio)

//Filtro individual + getZonas + getAll
routerAccidente.get('/', getAllAccidentes)
routerAccidente.get('/modelo/sexo', getSexo)
routerAccidente.get('/modelo/clima', getClima)
routerAccidente.get('/modelo/tipoAccidente', getTipoAccidente)
routerAccidente.get('/modelo/tipoPersona', getTipoPersona)
routerAccidente.get('/modelo/tipoVehiculo', getTipoVehiculo)
routerAccidente.get('/modelo/lesividad', getLesividad)

routerAccidente.post('/zonas', getZonas)
routerAccidente.post('/zona', getZona_concreta)

export default routerAccidente