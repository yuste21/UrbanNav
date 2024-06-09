const baseURI = 'http://localhost:8000/trafico'

export const URIsTrafico = {
    //Individuales
    getAll: `${baseURI}/`,
    filtro: `${baseURI}/filtro`,
    mes: `${baseURI}/mes`,
    sentido: `${baseURI}/sentido`,
    horaConcreta: `${baseURI}/hora/concreta`,
    entreHoras: `${baseURI}/hora/entre`,
    fechaConcreta: `${baseURI}/fecha/concreta`,
    entreFechas: `${baseURI}/fecha/entre`,
    chartFechaEstacion: `${baseURI}/chart/fecha/estacion`,
    chartHoraEstacion: `${baseURI}/chart/hora/estacion`,
    chartFechaDistrito: `${baseURI}/chart/fecha/distrito`,
    chartHoraDistrito: `${baseURI}/chart/hora/distrito`,

    //Entre Fechas+
    entreFechas_entreHoras: `${baseURI}/fecha/entre/hora/entre`,
    entreFechas_horaConcreta: `${baseURI}/fecha/entre/hora/concreta`,
    entreFechas_sentido: `${baseURI}/fecha/entre/sentido`,

    //Fecha Concreta+
    fechaConcreta_entreHoras: `${baseURI}/fecha/concreta/hora/entre`,
    fechaConcreta_horaConcreta: `${baseURI}/fecha/concreta/hora/concreta`,
    fechaConcreta_sentido: `${baseURI}/fecha/concreta/sentido`,

    //Mes+
    mes_entreHoras: `${baseURI}/mes/hora/entre`,
    mes_horaConcreta: `${baseURI}/mes/hora/concreta`,
    mes_sentido: `${baseURI}/mes/sentido`,

    //Entre Horas+
    entreHoras_sentido: `${baseURI}/hora/entre/sentido`,

    //Hora Concreta+
    horaConcreta_sentido: `${baseURI}/hora/concreta/sentido`
}