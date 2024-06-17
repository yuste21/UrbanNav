import { configureStore } from "@reduxjs/toolkit";
import dataRadarSlice from "../features/radar/dataRadarSlice";
import dataAccidenteSlice from "../features/accidente/dataAccidenteSlice";
import dataEstacionamientoSlice from "../features/estacionamiento/dataEstacionamientoSlice";
import dataTraficoSlice from "../features/trafico/dataTraficoSlice";
import dataFlujoSlice from "../features/flujo/dataFlujoSlice";
import dataMultaSlice from "../features/radar/dataMultaSlice";
import helpSlice from "../features/help/helpSlice";

const rootReducer = {
    trafico: dataTraficoSlice,
    radares: dataRadarSlice,
    accidentes: dataAccidenteSlice,
    estacionamientos: dataEstacionamientoSlice,
    flujo: dataFlujoSlice,
    multas: dataMultaSlice,
    help: helpSlice
}


export const store = configureStore({
    reducer: rootReducer
})

