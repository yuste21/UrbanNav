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
    plazas: 0,
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
        .get(`${URIsEstacionamientos.filtro}?color=${filtro.color}&tipo=${filtro.tipo}&plazas=${filtro.plazas}`)
        .then((response) => response.data)
})

export const estacionamientoSlice = createSlice({
    name: 'estacionamientos',
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
                if (action.payload.estacionamientos.length > 500) {
                    state.dataEstacionamientos.distritos = action.payload.distritos
                    state.dataEstacionamientos.barrios = action.payload.barrios
                } else {
                    state.dataEstacionamientos.distritos = []
                    state.dataEstacionamientos.barrios = []
                }
                state.dataEstacionamientos.estacionamientos = action.payload.estacionamientos
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