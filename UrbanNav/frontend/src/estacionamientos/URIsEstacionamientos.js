const url = process.env.REACT_APP_URL_BACKEND

const base = `${url}/estacionamientos/`
//const base = 'http://localhost:8000/estacionamientos/'

export const URIsEstacionamientos = {
    base: base,
    barrio: `${base}/barrio`,
    distrito: `${base}/distrito`,
    filtro: `${base}/filtro`,
    zonas: `${base}/zonas`
}