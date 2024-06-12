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
                error.hora = state.filtro.horaMax !== '' && value > state.filtro.horaMax 
                            ? 'La hora de inicio no puede ser posterior a la de fin'
                            : ''
            } else if (name === 'horaMax') {
                error.hora = state.filtro.horaMin !== '' && value < state.filtro.horaMin 
                            ? 'La hora de fin no puede ser anterior a la de inicio'
                            : ''
            } else if (name === 'puntosMin') {
                error.puntos = state.filtro.puntosMax !== '' && value > state.filtro.puntosMax
                            ? 'Los puntos mínimos no pueden ser mayores a los máximos'
                            : ''
            } else if (name === 'puntosMax') {
                error.puntos = state.filtro.puntosMin !== '' && value < state.filtro.puntosMin
                            ? 'Los puntos máximos no pueden ser menores a los mínimos'
                            : ''
            } else if (name === 'costeMin') {
                error.coste = state.filtro.costeMax !== '' && value > state.filtro.costeMax
                            ? 'El coste mínimo no puede ser mayor al máximo'
                            : ''
            } else if (name === 'costeMax') {
                error.coste = state.filtro.costeMin !== '' && value < state.filtro.costeMin
                            ? 'El coste máximo no puede ser menor al mínimo'
                            : ''
            } else if (name === 'mesMin') {
                error.mes = state.filtro.mesMax !== '' && value > state.filtro.mesMax
                            ? 'El mes inicial no puede ser posterior al final'
                            : ''
            } else if (name === 'mesMax') {
                error.mes = state.filtro.mesMin !== '' && value < state.filtro.mesMin
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