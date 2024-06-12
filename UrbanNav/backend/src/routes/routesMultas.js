import { Router } from "express";
import { getAllMultas, leerMultasRadares, filtro, getMultasInicio } from "../controllers/MultaController.js";

const routerMultas = Router()

routerMultas.get('/', getAllMultas)
routerMultas.get('/filtro', filtro)
routerMultas.get('/inicio', getMultasInicio)
routerMultas.post('/', leerMultasRadares)

export default routerMultas