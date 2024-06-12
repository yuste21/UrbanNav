import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { URIsDistritos } from "../../distritos/URIsDistritos";
import { URIsEstacionamientos } from "../../estacionamientos/URIsEstacionamientos";

export const initialFilter = {
    color: '',
    tipo: '',
    zonas: {
        activo: false,
        nombre: '',
        tipo: 'previos'
    },
    plazas1: '',
    plazas2: '',
    error: {
        plazas: ''
    },
    filtrado: false
}

const initialState = {
    dataEstacionamientos: {
        distritos: [],
        barrios: [],
        estacionamientos: []
    },
    filtro: initialFilter,
    loading: false
}

export const getDataEstacionamientosInicio = createAsyncThunk('estacionamientos/getEstacionamientosInicio', async () => {
    return axios
        .get(`${URIsDistritos.getEstacionamientosInicio}`)
        .then((response) => response.data)
})

export const getDataEstacionamientosFiltro = createAsyncThunk('estacionamientos/getEstacionamientosFiltro', async (req, res) => {
    const filtro = req.filtro
    return axios 
        .get(`${URIsEstacionamientos.filtro}?color=${filtro.color}&tipo=${filtro.tipo}` +
            `&plazas1=${filtro.plazas1}&plazas2=${filtro.plazas2}`)
        .then((response) => response.data)
})

export const estacionamientoSlice = createSlice({
    name: 'estacionamientos',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload

            let error = { ...state.filtro.error }
            if (name === 'plazas1') {
                error.plazas = state.filtro.plazas2 !== '' && parseInt(value) > parseInt(state.filtro.plazas2)
                                ? 'El mínimo de plazas no puede ser mayor al máximo'
                                : ''
            } else if (name === 'plazas2') {
                error.plazas = state.filtro.plazas1 !== '' && parseInt(value) < parseInt(state.filtro.plazas1)
                ? 'El máximo de plazas no puede ser menor al mínimo'
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
        asignarEstacionamientos: (state, action) => {
            state.loading = true
            const tipo = action.payload.tipo
            const nombre = action.payload.nombre
            var est = []
            var activo
            if(tipo === 'distrito') {
                const distrito = action.payload.estacionamientos
                
                for(const barrio of distrito.barrios) {
                    est = est.concat(barrio.estacionamientos)
                }
                activo = true
                state.filtro.filtrado = true
            } else {
                if(tipo === 'barrio') {
                    activo = true
                    state.filtro.filtrado = true
                } else {
                    activo = false
                    state.filtro.filtrado = false
                }
                est = action.payload.estacionamientos
            }
            state.dataEstacionamientos.estacionamientos = est;
            state.filtro.zonas.activo = activo;
            state.filtro.zonas.nombre = nombre
            state.filtro.zonas.tipo = tipo
            state.loading = false
            state.filtro.zonas.tipo = tipo
            return undefined;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDataEstacionamientosInicio.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getDataEstacionamientosInicio.fulfilled, (state, action) => {
                state.dataEstacionamientos.distritos = action.payload.distritos
                state.dataEstacionamientos.barrios = action.payload.barrios
                state.dataEstacionamientos.estacionamientos = action.payload.estacionamientos
                state.loading = false
            })
            .addCase(getDataEstacionamientosInicio.rejected, (state, action) => {
                console.error('Error al obtener estacionamientos inicio: ', action.error)
                state.loading = false
            })
            //---
            .addCase(getDataEstacionamientosFiltro.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getDataEstacionamientosFiltro.fulfilled, (state, action) => {
                state.dataEstacionamientos.distritos = action.payload.distritos
                state.dataEstacionamientos.barrios = action.payload.barrios
                state.dataEstacionamientos.estacionamientos = action.payload.estacionamientos
                console.log('Length = ' + action.payload.estacionamientos.length)
                state.loading = false
            })
            .addCase(getDataEstacionamientosFiltro.rejected, (state, action) => {
                console.error('Error al obtener estacionamientos filtro: ', action.error)
                state.loading = false
            })

    }
})

export const { asignarEstacionamientos, handleChange, vaciarFiltro, activarFiltro } = estacionamientoSlice.actions

export default estacionamientoSlice.reducer