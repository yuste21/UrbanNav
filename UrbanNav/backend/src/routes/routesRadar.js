import { getAllRadares, leerCSV_radar } from "../controllers/RadarController.js";
import { Router } from 'express';

const routerRadar = Router()

routerRadar.get('/', getAllRadares)
routerRadar.post('/', leerCSV_radar)

export default routerRadar