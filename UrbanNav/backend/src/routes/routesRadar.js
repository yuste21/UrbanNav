import { getAllRadares, filtro, leerCSV_radar } from "../controllers/RadarController.js";
import { Router } from 'express';

const routerRadar = Router()

routerRadar.get('/', getAllRadares)
routerRadar.get('/filtro', filtro)
routerRadar.post('/', leerCSV_radar)

export default routerRadar