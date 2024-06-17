import { createAsyncThunk, createSlice, formatProdErrorMessage } from "@reduxjs/toolkit"
import axios from "axios"
import { URIsDistritos } from "../../distritos/URIsDistritos"
import { URIsTrafico } from "../../trafico/URIsTrafico"

export const initialFilter = {
    mes: '',
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    sentido: '',
    error: {
        fecha: '',
        hora: '', 
        mes: ''
    },
    getAll: false,
    filtrado: false
}

const initialState = {
    dataTrafico: {
        distritos: [],
        barrios: [],
        estaciones: [],
        media: 0,
        fechaMin: '',
        fechaMax: ''
    },
    filtro: initialFilter,
    loading: false
}

export const getDataTraficoInicio = createAsyncThunk('trafico/getTraficoInicio', async () => {
    return axios
        .get(`${URIsDistritos.getTraficoInicio}`)
        .then((response) => response.data)
})

export const getAllDataTrafico = createAsyncThunk('trafico/getAllDataTrafico', async (req, res) => {
    const orientacion = req
    return axios
        .get(`${URIsTrafico.getAll}?orientacion=${orientacion}`)
        .then((response) => response.data)
})

export const getDataTraficoFiltro = createAsyncThunk('trafico/getDataTraficoFiltro', async (req, res) => {
    const { orientacion, numeroMonth, year, filtro } = req
    return axios
        .get(`${URIsTrafico.filtro}?orientacion=${orientacion}&` +
                                   `month=${numeroMonth}&year=${year}&` + 
                                   `sentido=${filtro.sentido}&` +
                                   `hora1=${filtro.hora1}&hora2=${filtro.hora2}&` +
                                   `fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}`)
        .then((response) => response.data)
})

export const dataTraficoSlice = createSlice({
    name: 'trafico',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload

            let error = { ...state.filtro.error }

            if (name === 'fecha1') {
                const fechaMin = new Date(value)
                const fechaMax = new Date(state.filtro.fecha2)

                error.fecha = state.filtro.fecha2 !== '' && fechaMin > fechaMax && value !== ''
                            ? 'La fecha de inicio no puede ser posterior a la de fin'
                            : ''
                error.mes = state.filtro.mes !== '' && value !== ''
                            ? 'No se puede introducir mes y fecha al mismo tiempo'
                            : ''
            } else if (name === 'fecha2') {
                const fechaMin = new Date(state.filtro.fecha1)
                const fechaMax = new Date(value)

                error.fecha = state.filtro.fecha1 !== '' && fechaMax < fechaMin && value !== ''
                            ? 'La fecha de fin no puede ser anterior a la de inicio'
                            : ''
                error.mes = state.filtro.mes !== '' && value !== ''
                            ? 'No se puede introducir mes y fecha al mismo tiempo'
                            : ''
            } else if (name === 'hora1') {
                const tiempoMin = new Date(`1970-01-01T${value}Z`);
                const tiempoMax = new Date(`1970-01-01T${state.filtro.hora2}Z`);

                error.hora = state.filtro.hora2 !== '' && tiempoMin > tiempoMax && value !== ''
                    ? 'La hora de inicio no puede ser posterior a la de fin'
                    : ''
            } else if (name === 'hora2') {
                const tiempoMin = new Date(`1970-01-01T${state.filtro.hora1}Z`);
                const tiempoMax = new Date(`1970-01-01T${value}Z`);

                error.hora = state.filtro.hora1 !== '' && tiempoMax < tiempoMin && value !== ''
                    ? 'La hora de fin no puede ser anterior a la de inicio'
                    : ''
            } else if (name === 'mes') {
                error.mes = (state.filtro.fecha1 !== '' || state.filtro.fecha2) && value !== ''
                            ? 'No se puede introducir mes y fecha al mismo tiempo'
                            : ''
            }

            return {
                ...state,
                filtro: {
                    ...state.filtro,
                    error: error,
                    [name]: value
                }
            }
        },
        vaciarFiltro: (state, action) => {
            return { 
                ...state,
                filtro: initialFilter 
            }
        },
        activarFiltro: (state, action) => {
            return {
                ...state,
                filtro: {
                    ...state.filtro,
                    filtrado: true
                }
            }
        },
        getAll: (state, action) => {
            return {
                ...state,
                filtro: {
                    ...initialFilter,
                    getAll: true
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getDataTraficoInicio.pending, (state, action) => {
            state.loading = true
        })
        .addCase(getDataTraficoInicio.fulfilled, (state, action) => {
            state.dataTrafico.distritos = action.payload.distritos
            state.dataTrafico.barrios = action.payload.barrios
            state.dataTrafico.media = action.payload.media_total
            state.dataTrafico.estaciones = action.payload.estaciones_trafico
            state.loading = false
        })
        .addCase(getDataTraficoInicio.rejected, (state, action) => {
            console.error("Error al obtener trafico inicio: ", action.error)
            state.loading = false
        })
        .addCase(getDataTraficoFiltro.pending, (state, action) => {
            state.loading = true
        })
        .addCase(getDataTraficoFiltro.fulfilled, (state, action) => {
            state.dataTrafico.distritos = action.payload.distritos
            state.dataTrafico.barrios = action.payload.barrios
            state.dataTrafico.media = action.payload.media_total
            state.dataTrafico.estaciones = action.payload.estaciones_trafico
            
            state.filtro.filtrado = true
            state.loading = false
        })
        .addCase(getDataTraficoFiltro.rejected, (state, action) => {
            console.error("Error al obtener trafico filtro: ", action.error)
            state.loading = false
        })
        .addCase(getAllDataTrafico.pending, (state, action) => {
            state.loading = true
        })
        .addCase(getAllDataTrafico.fulfilled, (state, action) => {
            state.dataTrafico.distritos = action.payload.distritos
            state.dataTrafico.barrios = action.payload.barrios
            state.dataTrafico.media = action.payload.media_total
            state.dataTrafico.estaciones = action.payload.estaciones_trafico
            state.dataTrafico.fechaMin = action.payload.fechaMin
            state.dataTrafico.fechaMax = action.payload.fechaMax

            state.filtro.filtrado = true
            state.loading = false
        })
        .addCase(getAllDataTrafico.rejected, (state, action) => {
            console.error("Error al obtener trafico all data: ", action.error)
            state.loading = false
        })
    }
})

export const { handleChange, vaciarFiltro, activarFiltro, getAll } = dataTraficoSlice.actions

export default dataTraficoSlice.reducer