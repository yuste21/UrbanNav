import { Router } from "express";
import { getAllMultas, leerMultasRadares } from "../controllers/MultaController.js";

const routerMultas = Router()

routerMultas.get('/', getAllMultas)
routerMultas.post('/', leerMultasRadares)

export default routerMultas