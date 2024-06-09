// uris.js
const baseURI = 'http://localhost:8000/accidentes/';

export const URIsAccidentes = {
    //Chart
    chart_fecha_distrito: `${baseURI}/chart/fecha/distrito`,
    chart_hora_distrito: `${baseURI}/chart/hora/distrito`,
    chart_fecha_barrio: `${baseURI}/chart/fecha/barrio`,
    chart_hora_barrio: `${baseURI}/chart/hora/barrio`,

    //Filtro
    filtro: `${baseURI}/filtro`,
    
    //Individuales
    base: `${baseURI}`,
    zonas: `${baseURI}/zonas`,
    sexo: `${baseURI}/sexo`,
    alcohol: `${baseURI}/alcohol`,
    drogas: `${baseURI}/drogas`,
    lesion: `${baseURI}/lesion/gravedad`,
    vehiculo: `${baseURI}/vehiculo`,
    accidente: `${baseURI}/accidente`,
    clima: `${baseURI}/clima`,
    hora_concreta: `${baseURI}/hora/concreta`,
    fecha_concreta: `${baseURI}/fecha/concreta`,
    fecha_entre: `${baseURI}/fecha/entre`,
    hora_entre: `${baseURI}/hora/entre`,
    radio: `${baseURI}/radio`,
    zona_concreta: `${baseURI}/zona`,
    edad: `${baseURI}/edad`,
};
