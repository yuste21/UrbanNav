import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { URIsAccidentes } from "../../accidentes/URIsAccidentes"
import { URIsTrafico } from "../../trafico/URIsTrafico"

export const initialFilter = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: ''
}

/**
 * Cambios respecto Flujo.js
 * Antiguo                          => Nuevo
 * setData()                        => setData(zonaPrincipal)
 * setBarrio() | setEstacion()      => setSubzonas(subzonas)
 * setCentro()                      => setCentro(centro) |||| Ya no hay .lat y .lon de la estacion
 * estacion | codigo                => codigo
 * entidad.barrios | entidad.aforos => entidad.subzonas
 */
export const initialDataFlujo = {
    zonaPrincipal: [],
    subzonas: [],       //Zona podra ser un barrio o una estacion dependiendo de si es flujo de accidente o trafico
    nombre: '',
    codigo: -1,
    delimitaciones: [],
    centro: []
}
const initialState = {
    dataFlujo: initialDataFlujo,
    filtro: initialFilter,
    loading: false
}

//Consultas trafico
export const getFlujoTraficoEstacionFecha = createAsyncThunk('flujo/trafico/estacion/fecha', async (req, res) => {
    const { filtro, entidad } = req
    return axios
        .get(`${URIsTrafico.chartFechaEstacion}?fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}&estacion=${entidad.estacion}`)
        .then((response) => response.data)
})

export const getFlujoTraficoEstacionHora = createAsyncThunk('flujo/trafico/estacion/hora', async (req, res) => {
    const { filtro, entidad } = req
    return axios
        .get(`${URIsTrafico.chartHoraEstacion}?hora1=${filtro.hora1}&hora2=${filtro.hora2}&estacion=${entidad.estacion}`)
        .then((response) => response.data)
})

export const getFlujoTraficoDistritoFecha = createAsyncThunk('flujo/trafico/distrito/fecha', async (req, res) => {
    const { filtro, entidad } = req 
    return axios
        .get(`${URIsTrafico.chartFechaDistrito}?fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}&codigo=${entidad.codigo}`)
        .then((response) => response.data)
})

export const getFlujoTraficoDistritoHora = createAsyncThunk('flujo/trafico/distrito/hora', async (req, res) => {
    const { filtro, entidad } = req
    return axios
        .get(`${URIsTrafico.chartHoraDistrito}?hora1=${filtro.hora1}&hora2=${filtro.hora2}&codigo=${entidad.codigo}`)
        .then((response) => response.data)
})

//Consultas accidentes
export const getFlujoAccidenteDistritoFecha = createAsyncThunk('flujo/accidente/distrito/fecha', async (req, res) => {
    const { filtro, entidad } = req
    return axios
        .get(`${URIsAccidentes.chart_fecha_distrito}?fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}&id=${entidad.id}`)
        .then((response) => response.data)
})

export const getFlujoAccidenteDistritoHora = createAsyncThunk('flujo/accidente/distrito/hora', async (req, res) => {
    const { filtro, entidad } = req
    return axios
        .get(`${URIsAccidentes.chart_hora_distrito}?hora1=${filtro.hora1}&hora2=${filtro.hora2}&id=${entidad.id}`)
        .then((response) => response.data)
})

export const getFlujoAccidenteBarrioFecha = createAsyncThunk('flujo/accidente/barrio/fecha', async (req, res) => {
    const {filtro, entidad} = req
    return axios
        .get(`${URIsAccidentes.chart_fecha_barrio}?fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}&id=${entidad.id}`)
        .then((response) => response.data)
})

export const getFlujoAccidenteBarrioHora = createAsyncThunk('flujo/accidente/barrio/hora', async (req, res) => {
    const {filtro, entidad} = req
    return axios
        .get(`${URIsAccidentes.chart_hora_barrio}?hora1=${filtro.hora1}&hora2=${filtro.hora2}&id=${entidad.id}`)
        .then((response) => response.data)
})

export const dataFlujoSlice = createSlice({
    name: 'flujo',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload
            return {
                ...state,
                filtro: {
                    ...state.filtro,
                    [name]: value
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            //--- Accidente ---//
            .addCase(getFlujoAccidenteDistritoFecha.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoAccidenteDistritoFecha.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.distrito
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = action.payload.barrios

                state.loading = false
            })
            .addCase(getFlujoAccidenteDistritoFecha.rejected, (state, action) => {
                console.error("Error al obtener flujo accidentes por distrito y fecha: ", action.error)
                state.loading = false
            })
            
            //---
            
            .addCase(getFlujoAccidenteDistritoHora.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoAccidenteDistritoHora.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.distrito
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = action.payload.barrios

                state.loading = false
            })
            .addCase(getFlujoAccidenteDistritoHora.rejected, (state, action) => {
                console.error("Error al obtener flujo accidentes por distrito y hora: ", action.error)
                state.loading = false
            })
            
            //---

            .addCase(getFlujoAccidenteBarrioFecha.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoAccidenteBarrioFecha.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.barrio
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = []
                state.loading = false
            })
            .addCase(getFlujoAccidenteBarrioFecha.rejected, (state, action) => {
                console.error("Error al obtener flujo accidentes por barrio y fecha: ", action.error)
                state.loading = false
            })
            
            //---
            
            .addCase(getFlujoAccidenteBarrioHora.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoAccidenteBarrioHora.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.barrio
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = []
                state.loading = false
            })
            .addCase(getFlujoAccidenteBarrioHora.rejected, (state, action) => {
                console.error("Error al obtener flujo accidentes por barrio y hora: ", action.error)
                state.loading = false
            })
            
            //--- Trafico ---//
            
            .addCase(getFlujoTraficoDistritoFecha.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoTraficoDistritoFecha.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.trafico
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = action.payload.aforos

                state.loading = false
            })
            .addCase(getFlujoTraficoDistritoFecha.rejected, (state, action) => {
                console.error("Error al obtener flujo trafico distrito fecha: ", action.error)
                state.loading = false
            })

            //---
            
            .addCase(getFlujoTraficoDistritoHora.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoTraficoDistritoHora.fulfilled, (state, action) => {
                state.dataFlujo.centro = action.payload.centro
                state.dataFlujo.zonaPrincipal = action.payload.trafico
                state.dataFlujo.delimitaciones = action.payload.delimitaciones
                state.dataFlujo.codigo = action.payload.codigo
                state.dataFlujo.nombre = action.payload.nombre
                state.dataFlujo.subzonas = action.payload.aforos

                state.loading = false
            })
            .addCase(getFlujoTraficoDistritoHora.rejected, (state, action) => {
                console.error("Error al obtener flujo trafico distrito hora: ", action.error)
                state.loading = false
            })

            //---

            .addCase(getFlujoTraficoEstacionFecha.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoTraficoEstacionFecha.fulfilled, (state, action) => {
                state.dataFlujo.centro = [action.payload.lat, action.payload.lon]
                state.dataFlujo.zonaPrincipal = action.payload.trafico
                state.dataFlujo.subzonas = []
                state.dataFlujo.codigo = action.payload.num_estacion
                state.dataFlujo.nombre = action.payload.nombre

                state.loading = false
            })
            .addCase(getFlujoTraficoEstacionFecha.rejected, (state, action) => {
                console.error("Error al obtener flujo trafico estacion fecha: ", action.error)
                state.loading = false
            })

            //---

            .addCase(getFlujoTraficoEstacionHora.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getFlujoTraficoEstacionHora.fulfilled, (state, action) => {
                state.dataFlujo.centro = [action.payload.lat, action.payload.lon]
                state.dataFlujo.zonaPrincipal = action.payload.trafico
                state.dataFlujo.subzonas = []
                state.dataFlujo.codigo = action.payload.num_estacion
                state.dataFlujo.nombre = action.payload.nombre

                state.loading = false
            })
            .addCase(getFlujoTraficoEstacionHora.rejected, (state, action) => {
                console.error("Error al obtener flujo trafico estacion hora: ", action.error)
                state.loading = false
            })
    }
})

export const { handleChange } = dataFlujoSlice.actions

export default dataFlujoSlice.reducer