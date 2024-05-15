import express from 'express'
import { getAllAccidentes, getZonas, getZona_concreta, leerCSV_coches, leerCSV_bicis, 
         getSexo, getClima, getTipoAccidente, getTipoPersona, getTipoVehiculo, getLesividad,
         getChartFechaDistrito, getChartHoraDistrito, getChartFechaBarrio, getChartHoraBarrio,

        //Filtro individual
        buscarFechaConcreta, buscarEntreFechas, buscarPorHoraConcreta, buscarEntreHoras, buscarPorEdad, 
        buscarPorVehiculo, buscarPorDrogas, buscarPorAlcohol, buscarPorLesionGravedad, 
        buscarPorSexo, buscarPorAccidente, buscarPorClima, buscarPorRadio, 

        //Filtro con 2 atributos
        //Fecha Concreta+   
        buscarPorFechaConcretaAccidente, buscarPorFechaConcretaAlcohol, buscarPorFechaConcretaClima, buscarPorFechaConcretaDrogas, 
        buscarPorFechaConcretaEdad, buscarPorFechaConcretaSexo, buscarPorFechaConcretaHoraConcreta, buscarPorFechaConcretaEntreHoras, 
        buscarPorFechaConcretaVehiculo, buscarPorFechaConcretaLesion, buscarPorFechaConcretaRadio,
    
        //Entre Fechas+
        buscarPorEntreFechasAccidente, buscarPorEntreFechasAlcohol, buscarPorEntreFechasClima, buscarPorEntreFechasDrogas, 
        buscarPorEntreFechasEdad, buscarPorEntreFechasLesion, buscarPorEntreFechasRadio, buscarPorEntreFechasSexo, 
        buscarPorEntreFechasVehiculo, buscarPorEntreFechasEntreHoras, buscarPorEntreFechasHoraConcreta,

        //Hora Concreta+
        buscarPorHoraConcretaAccidente, buscarPorHoraConcretaAlcohol, buscarPorHoraConcretaClima, buscarPorHoraConcretaDrogas, 
        buscarPorHoraConcretaEdad, buscarPorHoraConcretaLesion, buscarPorHoraConcretaSexo, buscarPorHoraConcretaVehiculo, buscarPorHoraConcretaRadio,

        //Entre Horas+
        buscarPorEntreHorasAccidente, buscarPorEntreHorasAlcohol, buscarPorEntreHorasClima, buscarPorEntreHorasDrogas,
        buscarPorEntreHorasEdad, buscarPorEntreHorasLesion, buscarPorEntreHorasRadio, buscarPorEntreHorasSexo, 
        buscarPorEntreHorasVehiculo,

        //Edad+
        buscarPorEdadAccidente, buscarPorEdadAlcohol, buscarPorEdadClima, buscarPorEdadDrogas,
        buscarPorEdadLesion, buscarPorEdadSexo, buscarPorEdadVehiculo, buscarPorEdadRadio,

        //Vehiculo+
        buscarPorVehiculoAccidente, buscarPorVehiculoAlcohol, buscarPorVehiculoClima, buscarPorVehiculoDrogas, buscarPorVehiculoLesion,
        buscarPorVehiculoRadio, buscarPorVehiculoSexo, 

        //Drogas+
        buscarPorDrogasAccidente, buscarPorDrogasAlcohol, buscarPorDrogasClima, buscarPorDrogasLesion, buscarPorDrogasRadio,
        buscarPorDrogasSexo,
        
        //Alcohol+
        buscarPorAlcoholAccidente, buscarPorAlcoholClima, buscarPorAlcoholLesion, buscarPorAlcoholRadio, buscarPorAlcoholSexo,

        //Lesion+
        buscarPorLesionAccidente, buscarPorLesionClima, buscarPorLesionRadio, buscarPorLesionSexo,

        //Sexo+
        buscarPorSexoAccidente, buscarPorSexoClima, buscarPorSexoRadio,

        //Accidente+
        buscarPorAccidenteClima, buscarPorAccidenteRadio,

        //Clima+
        buscarPorClimaRadio,

        //Filtro con 3 atributos
        //Fecha Concreta + Hora Concreta +
        buscarPorFechaConcretaHoraConcretaAccidente, buscarPorFechaConcretaHoraConcretaAlcohol, buscarPorFechaConcretaHoraConcretaClima,
        buscarPorFechaConcretaHoraConcretaDrogas, buscarPorFechaConcretaHoraConcretaEdad, buscarPorFechaConcretaHoraConcretaLesion,
        buscarPorFechaConcretaHoraConcretaRadio, buscarPorFechaConcretaHoraConcretaSexo, buscarPorFechaConcretaHoraConcretaVehiculo,
        
        //Fecha Concreta + Entre Horas +
        buscarPorFechaConcretaEntreHorasAccidente, buscarPorFechaConcretaEntreHorasAlcohol, buscarPorFechaConcretaEntreHorasClima,
        buscarPorFechaConcretaEntreHorasDrogas, buscarPorFechaConcretaEntreHorasEdad, buscarPorFechaConcretaEntreHorasLesion,
        buscarPorFechaConcretaEntreHorasRadio, buscarPorFechaConcretaEntreHorasSexo, buscarPorFechaConcretaEntreHorasVehiculo,
        
        //Entre Fechas + Hora Concreta +
        buscarEntreFechasHoraConcretaAccidente, buscarEntreFechasHoraConcretaAlcohol, buscarEntreFechasHoraConcretaClima,
        buscarEntreFechasHoraConcretaDrogas, buscarEntreFechasHoraConcretaEdad, buscarEntreFechasHoraConcretaLesion,
        buscarEntreFechasHoraConcretaRadio, buscarEntreFechasHoraConcretaSexo, buscarEntreFechasHoraConcretaVehiculo,
        buscarEntreFechasEntreHorasAccidente,
        buscarEntreFechasEntreHorasAlcohol,
        buscarEntreFechasEntreHorasClima,
        buscarEntreFechasEntreHorasDrogas,
        buscarEntreFechasEntreHorasEdad,
        buscarEntreFechasEntreHorasLesion,
        buscarEntreFechasEntreHorasRadio,
        buscarEntreFechasEntreHorasSexo,
        buscarEntreFechasEntreHorasVehiculo, 
    
    } from '../controllers/AccidenteController.js' 

        

const routerAccidente = express.Router()

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
routerAccidente.get('/fecha/concreta', buscarFechaConcreta)
routerAccidente.get('/fecha/entre', buscarEntreFechas)
//routerAccidente.get('/fecha/mes', buscarPorMes)
routerAccidente.get('/hora/concreta', buscarPorHoraConcreta)
routerAccidente.get('/hora/entre', buscarEntreHoras)
routerAccidente.get('/edad', buscarPorEdad)
routerAccidente.get('/vehiculo', buscarPorVehiculo)
routerAccidente.get('/drogas', buscarPorDrogas)
routerAccidente.get('/alcohol', buscarPorAlcohol)
routerAccidente.get('/lesion/gravedad', buscarPorLesionGravedad)
routerAccidente.get('/sexo', buscarPorSexo)
routerAccidente.get('/accidente', buscarPorAccidente)
routerAccidente.get('/clima', buscarPorClima)
routerAccidente.get('/radio', buscarPorRadio)

//Filtros 2 atributos
//Filtro Fecha Concreta+
routerAccidente.get('/fecha/concreta/hora/concreta', buscarPorFechaConcretaHoraConcreta)
routerAccidente.get('/fecha/concreta/hora/entre', buscarPorFechaConcretaEntreHoras)
routerAccidente.get('/fecha/concreta/edad', buscarPorFechaConcretaEdad)
routerAccidente.get('/fecha/concreta/vehiculo', buscarPorFechaConcretaVehiculo)
routerAccidente.get('/fecha/concreta/drogas', buscarPorFechaConcretaDrogas)
routerAccidente.get('/fecha/concreta/alcohol', buscarPorFechaConcretaAlcohol)
routerAccidente.get('/fecha/concreta/lesion', buscarPorFechaConcretaLesion)
routerAccidente.get('/fecha/concreta/sexo', buscarPorFechaConcretaSexo)
routerAccidente.get('/fecha/concreta/accidente', buscarPorFechaConcretaAccidente)
routerAccidente.get('/fecha/concreta/clima', buscarPorFechaConcretaClima)
routerAccidente.get('/fecha/concreta/radio', buscarPorFechaConcretaRadio)

//Filtro Entre Fechas+
routerAccidente.get('/fecha/entre/accidente', buscarPorEntreFechasAccidente)
routerAccidente.get('/fecha/entre/alcohol', buscarPorEntreFechasAlcohol)
routerAccidente.get('/fecha/entre/clima', buscarPorEntreFechasClima)
routerAccidente.get('/fecha/entre/drogas', buscarPorEntreFechasDrogas)
routerAccidente.get('/fecha/entre/edad', buscarPorEntreFechasEdad)
routerAccidente.get('/fecha/entre/hora/entre', buscarPorEntreFechasEntreHoras)
routerAccidente.get('/fecha/entre/hora/concreta', buscarPorEntreFechasHoraConcreta)
routerAccidente.get('/fecha/entre/lesion', buscarPorEntreFechasLesion)
routerAccidente.get('/fecha/entre/radio', buscarPorEntreFechasRadio)
routerAccidente.get('/fecha/entre/sexo', buscarPorEntreFechasSexo)
routerAccidente.get('/fecha/entre/vehiculo', buscarPorEntreFechasVehiculo)

//Filtro Hora Concreta+
routerAccidente.get('/hora/concreta/edad', buscarPorHoraConcretaEdad)
routerAccidente.get('/hora/concreta/vehiculo', buscarPorHoraConcretaVehiculo)
routerAccidente.get('/hora/concreta/drogas', buscarPorHoraConcretaDrogas)
routerAccidente.get('/hora/concreta/alcohol', buscarPorHoraConcretaAlcohol)
routerAccidente.get('/hora/concreta/lesion', buscarPorHoraConcretaLesion)
routerAccidente.get('/hora/concreta/sexo', buscarPorHoraConcretaSexo)
routerAccidente.get('/hora/concreta/accidente', buscarPorHoraConcretaAccidente)
routerAccidente.get('/hora/concreta/clima', buscarPorHoraConcretaClima)
routerAccidente.get('hora/concreta/radio', buscarPorHoraConcretaRadio)

//Filtro Entre Horas+
routerAccidente.get('/hora/entre/accidente', buscarPorEntreHorasAccidente)
routerAccidente.get('/hora/entre/alcohol', buscarPorEntreHorasAlcohol)
routerAccidente.get('/hora/entre/clima', buscarPorEntreHorasClima)
routerAccidente.get('/hora/entre/drogas', buscarPorEntreHorasDrogas)
routerAccidente.get('/hora/entre/edad', buscarPorEntreHorasEdad)
routerAccidente.get('/hora/entre/lesion', buscarPorEntreHorasLesion)
routerAccidente.get('/hora/entre/radio', buscarPorEntreHorasRadio)
routerAccidente.get('/hora/entre/sexo', buscarPorEntreHorasSexo)
routerAccidente.get('/hora/entre/vehiculo', buscarPorEntreHorasVehiculo)

//Filtro Edad+
routerAccidente.get('/edad/vehiculo', buscarPorEdadVehiculo)
routerAccidente.get('/edad/drogas', buscarPorEdadDrogas)
routerAccidente.get('/edad/alcohol', buscarPorEdadAlcohol)
routerAccidente.get('/edad/lesion', buscarPorEdadLesion)
routerAccidente.get('/edad/sexo', buscarPorEdadSexo)
routerAccidente.get('/edad/accidente', buscarPorEdadAccidente)
routerAccidente.get('/edad/clima', buscarPorEdadClima)
routerAccidente.get('edad/radio', buscarPorEdadRadio)

//Filtro Vehiculo+
routerAccidente.get('/vehiculo/accidente', buscarPorVehiculoAccidente)
routerAccidente.get('/vehiculo/alcohol', buscarPorVehiculoAlcohol)
routerAccidente.get('/vehiculo/clima', buscarPorVehiculoClima)
routerAccidente.get('/vehiculo/drogas', buscarPorVehiculoDrogas)
routerAccidente.get('/vehiculo/lesion', buscarPorVehiculoLesion)
routerAccidente.get('/vehiculo/radio', buscarPorVehiculoRadio)
routerAccidente.get('/vehiculo/sexo', buscarPorVehiculoSexo)

//Filtro Drogas+
routerAccidente.get('/drogas/accidente', buscarPorDrogasAccidente)
routerAccidente.get('/drogas/alcohol', buscarPorDrogasAlcohol)
routerAccidente.get('/drogas/clima', buscarPorDrogasClima)
routerAccidente.get('/drogas/lesion', buscarPorDrogasLesion)
routerAccidente.get('/drogas/radio', buscarPorDrogasRadio)
routerAccidente.get('/drogas/sexo', buscarPorDrogasSexo)

//Filtro Alcohol+
routerAccidente.get('/alcohol/accidente', buscarPorAlcoholAccidente)
routerAccidente.get('/alcohol/clima', buscarPorAlcoholClima)
routerAccidente.get('/alcohol/lesion', buscarPorAlcoholLesion)
routerAccidente.get('/alcohol/radio', buscarPorAlcoholRadio)
routerAccidente.get('/alcohol/sexo', buscarPorAlcoholSexo)

//Filtro Lesion+
routerAccidente.get('/lesion/accidente', buscarPorLesionAccidente)
routerAccidente.get('/lesion/clima', buscarPorLesionClima)
routerAccidente.get('/lesion/radio', buscarPorLesionRadio)
routerAccidente.get('/lesion/sexo', buscarPorLesionSexo)

//Filtro Sexo+
routerAccidente.get('/sexo/accidente', buscarPorSexoAccidente)
routerAccidente.get('/sexo/clima', buscarPorSexoClima)
routerAccidente.get('/sexo/radio', buscarPorSexoRadio)

//Filtro Accidente+
routerAccidente.get('/accidente/clima', buscarPorAccidenteClima)
routerAccidente.get('/accidente/radio', buscarPorAccidenteRadio)

//Filtro Clima+
routerAccidente.get('/clima/radio', buscarPorClimaRadio)

//Filtro 3 atributos
//Filtro Fecha Concreta + Hora Concreta +
routerAccidente.get('/fecha/concreta/hora/concreta/accidente', buscarPorFechaConcretaHoraConcretaAccidente)
routerAccidente.get('/fecha/concreta/hora/concreta/alcohol', buscarPorFechaConcretaHoraConcretaAlcohol)
routerAccidente.get('/fecha/concreta/hora/concreta/clima', buscarPorFechaConcretaHoraConcretaClima)
routerAccidente.get('/fecha/concreta/hora/concreta/drogas', buscarPorFechaConcretaHoraConcretaDrogas)
routerAccidente.get('/fecha/concreta/hora/concreta/edad', buscarPorFechaConcretaHoraConcretaEdad)
routerAccidente.get('/fecha/concreta/hora/concreta/lesion', buscarPorFechaConcretaHoraConcretaLesion)
routerAccidente.get('/fecha/concreta/hora/concreta/radio', buscarPorFechaConcretaHoraConcretaRadio)
routerAccidente.get('/fecha/concreta/hora/concreta/sexo', buscarPorFechaConcretaHoraConcretaSexo)
routerAccidente.get('/fecha/concreta/hora/concreta/vehiculo', buscarPorFechaConcretaHoraConcretaVehiculo)

//Filtro Fecha Concreta + Entre Horas +
routerAccidente.get('/fecha/concreta/hora/entre/accidente', buscarPorFechaConcretaEntreHorasAccidente)
routerAccidente.get('/fecha/concreta/hora/entre/alcohol', buscarPorFechaConcretaEntreHorasAlcohol)
routerAccidente.get('/fecha/concreta/hora/entre/clima', buscarPorFechaConcretaEntreHorasClima)
routerAccidente.get('/fecha/concreta/hora/entre/drogas', buscarPorFechaConcretaEntreHorasDrogas)
routerAccidente.get('/fecha/concreta/hora/entre/edad', buscarPorFechaConcretaEntreHorasEdad)
routerAccidente.get('/fecha/concreta/hora/entre/lesion', buscarPorFechaConcretaEntreHorasLesion)
routerAccidente.get('/fecha/concreta/hora/entre/radio', buscarPorFechaConcretaEntreHorasRadio)
routerAccidente.get('/fecha/concreta/hora/entre/sexo', buscarPorFechaConcretaEntreHorasSexo)
routerAccidente.get('/fecha/concreta/hora/entre/vehiculo', buscarPorFechaConcretaEntreHorasVehiculo)

//Filtro Entre Fechas + Hora Concreta +
routerAccidente.get('/fecha/entre/hora/concreta/accidente', buscarEntreFechasHoraConcretaAccidente)
routerAccidente.get('/fecha/entre/hora/concreta/alcohol', buscarEntreFechasHoraConcretaAlcohol)
routerAccidente.get('/fecha/entre/hora/concreta/clima', buscarEntreFechasHoraConcretaClima)
routerAccidente.get('/fecha/entre/hora/concreta/drogas', buscarEntreFechasHoraConcretaDrogas)
routerAccidente.get('/fecha/entre/hora/concreta/edad', buscarEntreFechasHoraConcretaEdad)
routerAccidente.get('/fecha/entre/hora/concreta/lesion', buscarEntreFechasHoraConcretaLesion)
routerAccidente.get('/fecha/entre/hora/concreta/radio', buscarEntreFechasHoraConcretaRadio)
routerAccidente.get('/fecha/entre/hora/concreta/sexo', buscarEntreFechasHoraConcretaSexo)
routerAccidente.get('/fecha/entre/hora/concreta/vehiculo', buscarEntreFechasHoraConcretaVehiculo)

//Filtro Entre Fechas + Entre Horas +
routerAccidente.get('/fecha/entre/hora/entre/accidente', buscarEntreFechasEntreHorasAccidente)
routerAccidente.get('/fecha/entre/hora/entre/alcohol', buscarEntreFechasEntreHorasAlcohol)
routerAccidente.get('/fecha/entre/hora/entre/clima', buscarEntreFechasEntreHorasClima)
routerAccidente.get('/fecha/entre/hora/entre/drogas', buscarEntreFechasEntreHorasDrogas)
routerAccidente.get('/fecha/entre/hora/entre/edad', buscarEntreFechasEntreHorasEdad)
routerAccidente.get('/fecha/entre/hora/entre/lesion', buscarEntreFechasEntreHorasLesion)
routerAccidente.get('/fecha/entre/hora/entre/radio', buscarEntreFechasEntreHorasRadio)
routerAccidente.get('/fecha/entre/hora/entre/sexo', buscarEntreFechasEntreHorasSexo)
routerAccidente.get('/fecha/entre/hora/entre/vehiculo', buscarEntreFechasEntreHorasVehiculo)

export default routerAccidente