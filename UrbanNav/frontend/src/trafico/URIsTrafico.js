const url = process.env.REACT_APP_URL_BACKEND

const base = `${url}/trafico`
//const base = 'http://localhost:8000/trafico/'

export const URIsTrafico = {
    //Individuales
    getAll: `${base}/`,
    filtro: `${base}/filtro`,
    chartFechaEstacion: `${base}/chart/fecha/estacion`,
    chartHoraEstacion: `${base}/chart/hora/estacion`,
    chartFechaDistrito: `${base}/chart/fecha/distrito`,
    chartHoraDistrito: `${base}/chart/hora/distrito`,

}