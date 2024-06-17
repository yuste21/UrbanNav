const base = 'https://urbannav-backend.onrender.com/distritos/'
//const base = 'http://localhost:8000/distritos/'

export const URIsDistritos = {
    getAll: base,
    getAccidentesInicio: `${base}/accidentes/inicio`,
    getAccidentes: `${base}/accidentes/`,
    getAccidentesPorDistrito: `${base}/accidentes`,

    getEstacionamientosInicio: `${base}/estacionamientos/inicio`,
    getEstacionamientos: `${base}/estacionamientos/`,
    getEstacionamientosPorDistrito: `${base}/estacionamientos`,
    
    getTraficoInicio: `${base}/trafico/inicio`,
    
    getRadaresInicio: `${base}/radares/inicio`,
    getRadaresPorDistrito: `${base}/radares/distrito`
}