const url = process.env.REACT_APP_URL_BACKEND

const base = `${url}/multas`
//const base = 'http://localhost:8000/multas/'

export const URIsMultas = {
    filtro: `${base}/filtro`,
    inicio: `${base}/inicio`
}