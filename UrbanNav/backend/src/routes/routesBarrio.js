import { Router } from "express";
import { leer_delimitaciones, leer_nombres, getAllBarrios, 
        getEstacionamientos, getAccidentes, getTrafico, getRadares } from "../controllers/BarrioController.js";

const routerBarrio = Router()

routerBarrio.get('/', getAllBarrios)
routerBarrio.post('/', leer_delimitaciones)
routerBarrio.put('/', leer_nombres)
routerBarrio.get('/estacionamientos', getEstacionamientos)
routerBarrio.get('/accidentes', getAccidentes)
routerBarrio.get('/trafico', getTrafico)
routerBarrio.get('/radares', getRadares)


export default routerBarrio