const url = process.env.REACT_APP_URL_BACKEND

const base = `${url}/barrios/`
//const base = 'http://localhost:8000/barrios/'

export const URIsBarrios = {
    getAll: base,
    getAccidentes: `${base}/accidentes`,
    getEstacionamientos: `${base}/estacionamientos`,
    getTrafico: `${base}/trafico`,
    getRadares: `${base}/radares`
}