import express from 'express'
import { getAllAccidentes, getZonas, getZona_concreta, leerCSV_coches, leerCSV_bicis,

        //Filtro individual
        buscarFechaConcreta, buscarEntreFechas, buscarPorHora, buscarEntreHoras, buscarPorEdad, 
        buscarPorVehiculo, buscarPorDistrito, buscarPorDrogas, buscarPorAlcohol, buscarPorLesionGravedad, 
        buscarPorSexo, buscarPorAccidente, buscarPorClima, buscarPorRadio, 

        //Fecha+   
        buscarPorFechaAccidente, buscarPorFechaAlcohol, buscarPorFechaClima, buscarPorFechaDistrito, buscarPorFechaDrogas, 
        buscarPorFechaEdad, buscarPorFechaHora, buscarPorFechaVehiculo, buscarPorFechaLesion, buscarPorFechaSexo, 
    
        //Hora+
        buscarPorHoraAccidente, buscarPorHoraAlcohol, buscarPorHoraClima, buscarPorHoraDistrito, buscarPorHoraDrogas, 
        buscarPorHoraEdad, buscarPorHoraLesion, buscarPorHoraSexo, buscarPorHoraVehiculo,

        //Edad+
        buscarPorEdadAccidente, buscarPorEdadAlcohol, buscarPorEdadClima, buscarPorEdadDistrito, buscarPorEdadDrogas,
        buscarPorEdadLesion, buscarPorEdadSexo, buscarPorEdadVehiculo

    
    } from '../controllers/AccidenteController.js' 

        

const routerAccidente = express.Router()

//Leer CSV
routerAccidente.post('/coches', leerCSV_coches)
routerAccidente.post('/bicis', leerCSV_bicis)

//Filtro 1 + getZonas + getAll
routerAccidente.get('/', getAllAccidentes)
routerAccidente.post('/zonas', getZonas)
routerAccidente.post('/zona', getZona_concreta)
routerAccidente.get('/fecha/concreta', buscarFechaConcreta)
routerAccidente.get('/fecha/entre', buscarEntreFechas)
//routerAccidente.get('/fecha/mes', buscarPorMes)
routerAccidente.get('/hora/concreta', buscarPorHora)
routerAccidente.get('/hora/entre', buscarEntreHoras)
routerAccidente.get('/edad', buscarPorEdad)
routerAccidente.get('/vehiculo', buscarPorVehiculo)
routerAccidente.get('/distrito', buscarPorDistrito)
routerAccidente.get('/drogas', buscarPorDrogas)
routerAccidente.get('/alcohol', buscarPorAlcohol)
routerAccidente.get('/lesion/gravedad', buscarPorLesionGravedad)
routerAccidente.get('/sexo', buscarPorSexo)
routerAccidente.get('/accidente', buscarPorAccidente)
routerAccidente.get('/clima', buscarPorClima)
routerAccidente.get('/radio', buscarPorRadio)

//Filtro Fecha+
routerAccidente.get('/fecha/hora', buscarPorFechaHora)
routerAccidente.get('/fecha/edad', buscarPorFechaEdad)
routerAccidente.get('/fecha/vehiculo', buscarPorFechaVehiculo)
routerAccidente.get('/fecha/distrito', buscarPorFechaDistrito)
routerAccidente.get('/fecha/drogas', buscarPorFechaDrogas)
routerAccidente.get('/fecha/alcohol', buscarPorFechaAlcohol)
routerAccidente.get('/fecha/lesion', buscarPorFechaLesion)
routerAccidente.get('/fecha/sexo', buscarPorFechaSexo)
routerAccidente.get('/fecha/accidente', buscarPorFechaAccidente)
routerAccidente.get('/fecha/clima', buscarPorFechaClima)

//Filtro Hora+
routerAccidente.get('/hora/edad', buscarPorHoraEdad)
routerAccidente.get('/hora/vehiculo', buscarPorHoraVehiculo)
routerAccidente.get('/hora/distrito', buscarPorHoraDistrito)
routerAccidente.get('/hora/drogas', buscarPorHoraDrogas)
routerAccidente.get('/hora/alcohol', buscarPorHoraAlcohol)
routerAccidente.get('/hora/lesion', buscarPorHoraLesion)
routerAccidente.get('/hora/sexo', buscarPorHoraSexo)
routerAccidente.get('/hora/accidente', buscarPorHoraAccidente)
routerAccidente.get('/hora/clima', buscarPorHoraClima)

//Filtro Edad+
routerAccidente.get('/edad/vehiculo', buscarPorEdadVehiculo)
routerAccidente.get('/edad/distrito', buscarPorEdadDistrito)
routerAccidente.get('/edad/drogas', buscarPorEdadDrogas)
routerAccidente.get('/edad/alcohol', buscarPorEdadAlcohol)
routerAccidente.get('/edad/lesion', buscarPorEdadLesion)
routerAccidente.get('/edad/sexo', buscarPorEdadSexo)
routerAccidente.get('/edad/accidente', buscarPorEdadAccidente)
routerAccidente.get('/edad/clima', buscarPorEdadClima)

export default routerAccidente