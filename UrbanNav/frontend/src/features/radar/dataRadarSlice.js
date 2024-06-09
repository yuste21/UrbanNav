import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { URIsDistritos } from "../../distritos/URIsDistritos";
import { URIsRadares } from "../../radares/URIsRadares";

export const initialFilter = {
    costeMin: '',
    costeMax: '',
    puntosMin: '',
    puntosMax: '',
    calificacion: '',
    horaMin: '',
    horaMax: '',
    descuento: ''
}

const initialState = {
    dataRadares: {
        distritos: [],
        barrios: [],
        radares: [],
        filtrado: false
    },
    filtro: initialFilter,
    loading: false
}

export const getDataRadaresInicio = createAsyncThunk('radares/getRadaresInicio', async () => {
    return axios
        .get(`${URIsDistritos.getRadaresInicio}`)
        .then((response) => response.data)
})

export const getDataRadaresFiltro = createAsyncThunk('radares/getRadaresFiltro', async (req, res) => {
    const filtro = req
    return axios
        .get(`${URIsRadares.filtro}?puntosMin=${filtro.costeMin}&puntosMax=${filtro.costeMax}` +
                                  `&costeMin=${filtro.costeMin}&costeMax=${filtro.costeMax}` +
                                  `&horaMin=${filtro.horaMin}&horaMax=${filtro.horaMax}` +
                                  `&calificacion=${filtro.calificacion}&descuento=${filtro.descuento}`
        )
        .then((response) => response.data)
})

export const dataRadarSlice = createSlice({
    name: 'radares',
    initialState,
    reducers: {
        getRadares: (state, action) => {
            const radares = action.payload.radares
            return {
                ...state,
                dataRadares: {
                    ...state.dataRadares,
                    radares: radares
                }
            }
        },
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
        }
    },
    extraReducers: (builder) => {
        builder
          .addCase(getDataRadaresInicio.pending, (state, action) => {
            state.loading = true; // Puedes manejar el estado de carga aquí
          })
          .addCase(getDataRadaresInicio.fulfilled, (state, action) => {
            state.dataRadares.distritos = action.payload.distritos // Actualiza el estado con los radares obtenidos
            state.dataRadares.barrios = action.payload.barrios
            state.dataRadares.radares = action.payload.radares
            state.loading = false
          })
          .addCase(getDataRadaresInicio.rejected, (state, action) => {
            console.error("Error al obtener los radares:", action.error);
            state.loading = false
          })

          .addCase(getDataRadaresFiltro.pending, (state, action) => {
            state.loading = true; // Puedes manejar el estado de carga aquí
          })
          .addCase(getDataRadaresFiltro.fulfilled, (state, action) => {
            state.dataRadares.distritos = action.payload.distritos // Actualiza el estado con los radares obtenidos
            state.dataRadares.barrios = action.payload.barrios
            state.dataRadares.radares = action.payload.radares
            state.loading = false
          })
          .addCase(getDataRadaresFiltro.rejected, (state, action) => {
            console.error("Error al obtener los radares:", action.error);
            state.loading = false
          })
    },
})

export const { getRadares, handleChange, vaciarFiltro, activarFiltro } = dataRadarSlice.actions

export default dataRadarSlice.reducer