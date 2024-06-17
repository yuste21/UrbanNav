import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { URIsDistritos } from "../../distritos/URIsDistritos"
import { URIsAccidentes } from "../../accidentes/URIsAccidentes"

const center = [40.41688189428294, -3.703318510771146]

export const initialError = {
    fecha: '',
    hora: '',
    edad: ''
}

export const initialFilter = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    edad1: '',
    edad2: '',
    vehiculo: '',
    drogas: '',
    alcohol: '',
    lesion: '',
    sexo: '',
    accidente: '',
    clima: '',
    persona: '',
    radio: {
        activo: false,
        distancia: 0,
        posicion: [center[0], center[1]],
        recordar: false
    },
    zonas: {
        activo: false,
        nombre: '',
        tipo: 'previos'
    },
    error: initialError,
    filtrado: false
}

const initialState = {
    dataAccidentes: {
        distritos: [],
        riesgoDistrito: -1,
        barrios: [],
        riesgoBarrio: -1,
        accidentes: []
    },
    filtro: initialFilter,
    loading: false
} 

export const getDataAccidentesInicio = createAsyncThunk('accidentes/getAccidentesInicio', async () => {
    return axios
        .get(`${URIsDistritos.getAccidentesInicio}`)
        .then((response) => response.data)
})

export const getDataAccidentesFiltro = createAsyncThunk('accidentes/getAccidentesFiltro', async (req, res) => {
    const filtro = req.filtro
    const radio = req.radio
    return axios
        .get(`${URIsAccidentes.filtro}?fecha1=${filtro.fecha1}&fecha2=${filtro.fecha2}` +
                                     `&hora1=${filtro.hora1}&hora2=${filtro.hora2}` +
                                     `&edad1=${filtro.edad1}&edad2=${filtro.edad2}` +
                                     `&vehiculo=${filtro.vehiculo}&drogas=${filtro.drogas}` +
                                     `&alcohol=${filtro.alcohol}&lesion=${filtro.lesion}` +
                                     `&sexo=${filtro.sexo}&accidente=${filtro.accidente}` +
                                     `&persona=${filtro.persona}&clima=${filtro.clima}` +
                                     `&radio=${radio}&lat=${filtro.radio.posicion[0]}&lon=${filtro.radio.posicion[1]}`)
        .then((response) => response.data)
})

export const dataAccidenteSlice = createSlice({
    name: 'accidentes',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload
            if (name === 'activo') {
                return {
                    ...state, 
                    filtro: {
                        ...state.filtro,
                        radio: {
                            ...state.filtro.radio,
                            activo: true
                        }
                    }
                }
            } else if (name === 'inactivo') {
                return {
                    ...state, 
                    filtro: {
                        ...state.filtro,
                        radio: {
                            ...state.filtro.radio,
                            activo: false,
                            distancia: 0
                        }
                    }
                }
            } else if (name == 'distancia') {
                return {
                    ...state,
                    filtro: {
                        ...state.filtro,
                        radio: {
                            ...state.filtro.radio,
                            distancia: value
                        }
                    }
                }

            } else if (name === 'posicion') {
                return {
                    ...state, 
                    filtro: {
                        ...state.filtro,
                        radio: {
                            ...state.filtro.radio,
                            posicion: value
                        }
                    }
                }
            } else {
                var error = { ...state.filtro.error }
                if (name === 'fecha1') {
                    error.fecha = state.filtro.fecha2 !== '' && value > state.filtro.fecha2 && value !== ''
                                    ? 'La fecha de inicio no puede ser posterior a la de fin'
                                    : ''
                } else if (name === 'fecha2') {
                    error.fecha = state.filtro.fecha1 !== '' && value < state.filtro.fecha1 && value !== ''
                        ? 'La fecha de fin no puede ser anterior a la de inicio'
                        : ''
                } else if (name === 'edad1') {
                    error.edad = state.filtro.edad2 !== '' && parseInt(value) > parseInt(state.filtro.edad2) && value !== ''
                        ? 'La edad de inicio no puede ser posterior a la de fin'
                        : ''
                } else if (name === 'edad2') {
                    error.edad = state.filtro.edad1 !== '' && parseInt(value) < parseInt(state.filtro.edad1) && value !== ''
                        ? 'La edad de fin no puede ser anterior a la de inicio'
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
                }
                return {
                    ...state,
                    filtro: {
                        ...state.filtro,
                        error: error,
                        [name]: value
                    }
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
                radio: {
                    ...state.radio,
                    recordar: true
                },
                filtro: {
                    ...state.filtro,
                    filtrado: true
                }
            }
        },
        olvidar: (state, action) => {
            return {
                ...state,
                radio: {
                    ...state.radio,
                    recordar: false
                }
            }
        },
        asignarAccidentes: (state, action) => {
            state.loading = true
            const tipo = action.payload.tipo
            const nombre = action.payload.nombre
            var acc = []
            var activo
            if(tipo === 'distrito') {
                const distrito = action.payload.accidentes
                
                for(const barrio of distrito.barrios) {
                    acc = acc.concat(barrio.accidentes)
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
                acc = action.payload.accidentes
            }
            state.dataAccidentes.accidentes = acc;
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
            .addCase(getDataAccidentesInicio.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getDataAccidentesInicio.fulfilled, (state, action) => {
                state.dataAccidentes.distritos = action.payload.distritos
                state.dataAccidentes.riesgoDistrito = action.payload.riesgoDistrito
                state.dataAccidentes.barrios = action.payload.barrios
                state.dataAccidentes.riesgoBarrio = action.payload.riesgoBarrio
                state.dataAccidentes.accidentes = action.payload.accidentes
                state.loading = false
            })
            .addCase(getDataAccidentesInicio.rejected, (state, action) => {
                console.error("Error al obtener accidentes inicio: ", action.error)
                state.loading = false
            })
            //---
            .addCase(getDataAccidentesFiltro.pending, (state, action) => {
                state.loading = true
            })
            .addCase(getDataAccidentesFiltro.fulfilled, (state, action) => {
                state.dataAccidentes.accidentes = action.payload.accidentes
                state.dataAccidentes.distritos = action.payload.distritos
                state.dataAccidentes.riesgoDistrito = action.payload.riesgoDistrito
                state.dataAccidentes.barrios = action.payload.barrios
                state.dataAccidentes.riesgoBarrio = action.payload.riesgoBarrio
                state.filtro.filtrado = true
                state.filtro.radio.recordar = true            
                state.loading = false
            })
            .addCase(getDataAccidentesFiltro.rejected, (state, action) => {
                console.error("Error al obtener accidentes filtro: ", action.error)
                state.loading = false
            })
    }
})

export const { handleChange, vaciarFiltro, activarFiltro, olvidar, asignarAccidentes } = dataAccidenteSlice.actions

export default dataAccidenteSlice.reducer