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
    descuento: '',
    error: {
        coste: '',
        puntos: '',
        hora: ''
    },
    filtrado: false
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
        .get(`${URIsRadares.filtro}?puntosMin=${filtro.puntosMin}&puntosMax=${filtro.puntosMax}` +
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
            const radaresPayload = action.payload.radares

            let radares = []

            radaresPayload.forEach((radar) => {
                radares.push({
                    radar: radar,
                    multas: radar.multas.length
                })
            })

            return {
                ...state,
                dataRadares: {
                    ...state.dataRadares,
                    radares: radares
                }
            }
        },
        getRadaresPrev: (state, action) => {
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

            let error = { ...state.filtro.error }
            
            if (name === 'costeMin') {
                error.coste = state.filtro.costeMax !== '' && parseInt(value) > parseInt(state.filtro.costeMax) && value !== ''
                            ? 'El coste mínimo no puede ser mayor al máximo' :
                            parseInt(value) < 0 || parseInt(state.filtro.costeMax) < 0 ? 'El coste debe ser mayor o igual a 0' 
                            : ''
            } else if (name === 'costeMax') {
                error.coste = state.filtro.costeMin !== '' && parseInt(value) < parseInt(state.filtro.costeMin) && value !== ''
                            ? 'El coste máximo no puede ser inferior al mínimo' :
                            parseInt(value) < 0 || parseInt(state.filtro.costeMin) < 0 ? 'El coste debe ser mayor o igual a 0' 
                            : ''
            } else if (name === 'puntosMin') {
                error.puntos = state.filtro.puntosMax !== '' && parseInt(value) > parseInt(state.filtro.puntosMax) && value !== ''
                            ? 'El mínimo de puntos no puede ser mayor al máximo' :
                            parseInt(value) < 0 || parseInt(state.filtro.puntosMax) < 0 ? 'El número de puntos debe ser mayor o igual a 0' :
                            parseInt(value) > 15 || parseInt(state.filtro.puntosMax) > 15 ? 'El número de puntos debe ser menor de 16'
                            : ''
            } else if (name === 'puntosMax') {
                error.puntos = state.filtro.puntosMin !== '' && parseInt(value) < parseInt(state.filtro.puntosMin) && value !== ''
                            ? 'El máximo de puntos no puede ser inferior al mínimo' :
                            parseInt(value) < 0 || parseInt(state.filtro.puntosMin) < 0 ? 'El número de puntos debe ser mayor o igual a 0' :
                            parseInt(value) > 15 || parseInt(state.filtro.puntosMin) > 15 ? 'El número de puntos debe ser menor de 16'
                            : ''
            } else if (name === 'horaMin') {
                const tiempoMin = new Date(`1970-01-01T${value}Z`);
                const tiempoMax = new Date(`1970-01-01T${state.filtro.horaMax}Z`);
                
                console.log('Min = ' + tiempoMin)
                console.log('Max = ' + tiempoMax)

                error.hora = state.filtro.horaMax !== '' && tiempoMin > tiempoMax && value !== ''
                            ? 'La hora de inicio no puede ser posterior a la de fin'
                            : ''
            } else if (name === 'horaMax') {
                const tiempoMin = new Date(`1970-01-01T${state.filtro.horaMin}Z`);
                const tiempoMax = new Date(`1970-01-01T${value}Z`);

                console.log('Min = ' + tiempoMin)
                console.log('Max = ' + tiempoMax)

                error.hora = state.filtro.horaMin !== '' && tiempoMax < tiempoMin && value !== ''
                            ? 'La hora de fin no puede ser anterior a la de inicio'
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

export const { getRadares, getRadaresPrev, handleChange, vaciarFiltro, activarFiltro } = dataRadarSlice.actions

export default dataRadarSlice.reducer