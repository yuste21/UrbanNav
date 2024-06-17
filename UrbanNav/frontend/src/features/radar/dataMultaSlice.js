import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from 'axios'
import { URIsMultas } from "../../radares/URIsMultas"

const initialError = {
    hora: '',
    mes: '',
    puntos: '',
    coste: ''
}

export const initialFilter = {
    costeMin: '',
    costeMax: '',
    puntosMin: '',
    puntosMax: '',
    horaMin: '',
    horaMax: '',
    mesMin: '',
    mesMax: '',
    denunciante: '',
    descuento: '',
    infraccion: '',
    calificacion: '',
    barrio: '',
    filtrado: false,
    error: initialError
}

const initialState = {
    multas: [],
    barrios: [],
    loading: false,
    filtro: initialFilter
}

export const getMultasInicio = createAsyncThunk('multas/getMultasInicio', async () => {
    return axios
        .get(`${URIsMultas.inicio}`)
        .then((response) => response.data)
})

export const getMultasFiltro = createAsyncThunk('multas/getMultasFiltro', async (req, res) => {
    const filtro = req
    return axios
        .get(`${URIsMultas.filtro}?puntosMin=${filtro.puntosMin}&puntosMax=${filtro.puntosMax}` +
             `&costeMin=${filtro.costeMin}&costeMax=${filtro.costeMax}&descuento=${filtro.descuento}` +
             `&mesMin=${filtro.mesMin}&mesMax=${filtro.mesMax}&infraccion=${filtro.infraccion}` +
             `&horaMin=${filtro.horaMin}&horaMax=${filtro.horaMax}&denunciante=${filtro.denunciante}` +
             `&calificacion=${filtro.calificacion}&barrio=${filtro.barrio}`
        )
        .then((response) => response.data)
})

export const dataMultaSlice = createSlice({
    name: 'multas',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload
            var error = { ...state.filtro.error }

            if (name === 'horaMin') {
                const tiempoMin = new Date(`1970-01-01T${value}Z`);
                const tiempoMax = new Date(`1970-01-01T${state.filtro.horaMax}Z`);

                error.hora = state.filtro.horaMax !== '' && tiempoMin > tiempoMax && value !== ''
                            ? 'La hora de inicio no puede ser posterior a la de fin'
                            : ''
            } else if (name === 'horaMax') {
                const tiempoMin = new Date(`1970-01-01T${state.filtro.horaMin}Z`);
                const tiempoMax = new Date(`1970-01-01T${value}Z`);

                error.hora = state.filtro.horaMin !== '' && tiempoMax < tiempoMin && value !== ''
                            ? 'La hora de fin no puede ser anterior a la de inicio'
                            : ''
            } else if (name === 'costeMin') {
                error.coste = state.filtro.costeMax !== '' && parseInt(value) > parseInt(state.filtro.costeMax) && value !== ''
                            ? 'El coste mínimo no puede ser mayor al máximo'
                            : ''
            } else if (name === 'costeMax') {
                error.coste = state.filtro.costeMin !== '' && parseInt(value) < parseInt(state.filtro.costeMin) && value !== ''
                            ? 'El coste máximo no puede ser inferior al mínimo'
                            : ''
            } else if (name === 'puntosMin') {
                error.puntos = state.filtro.puntosMax !== '' && parseInt(value) > parseInt(state.filtro.puntosMax) && value !== ''
                            ? 'El mínimo de puntos no puede ser mayor al máximo'
                            : ''
            } else if (name === 'puntosMax') {
                error.puntos = state.filtro.puntosMin !== '' && parseInt(value) < parseInt(state.filtro.puntosMin) && value !== ''
                            ? 'El máximo de puntos no puede ser inferior al mínimo'
                            : ''
            } else if (name === 'mesMin') {
                const mes1 = new Date(`${value}-01`);
                const mes2 = new Date(`${state.filtro.mesMax}-01`);
                
                error.mes = state.filtro.mesMax !== '' && mes1 > mes2 && value !== ''
                            ? 'El mes inicial no puede ser posterior al final'
                            : ''
            } else if (name === 'mesMax') {
                const mes1 = new Date(`${state.filtro.mesMin}-01`);
                const mes2 = new Date(`${value}-01`);

                error.mes = state.filtro.mesMin !== '' && mes2 < mes1 && value !== ''
                            ? 'El mes final no puede ser anterior al inicial'
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMultasInicio.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getMultasInicio.fulfilled, (state, action) => {
                state.multas = action.payload.multas
                state.barrios = action.payload.barrios
                state.loading = false
            })
            .addCase(getMultasInicio.rejected, (state, action) => {
                console.error("Error al obtener accidentes inicio: ", action.error)
                state.loading = false
            })

            .addCase(getMultasFiltro.pending, (state, action) => {
                state.loading = true
            })            
            .addCase(getMultasFiltro.fulfilled, (state, action) => {
                state.multas = action.payload.multas
                state.barrios = action.payload.barrios
                state.loading = false
            })
            .addCase(getMultasFiltro.rejected, (state, action) => {
                console.error("Error al obtener accidentes inicio: ", action.error)
                state.loading = false
            })
    }
})

export const { handleChange, vaciarFiltro, activarFiltro } = dataMultaSlice.actions

export default dataMultaSlice.reducer