import { URIsAccidentes } from "./URIsAccidentes";
import MapAccidentes from "./MapAccidentes";
import NavbarPage from "../navbar/navbar";
import ChartAccidente from "./ChartAccidentes";
import FormAccidentes from "./FormAccidentes";
import { useState, useEffect } from "react";
import axios from 'axios'
import Loader from "../loader/Loader";
import { center } from "../MapFunctions";

function Accidentes () {
    const [accidentes, setAccidentes] = useState([])
    const [datosAgrupados, setDatosAgrupados] = useState([])
    const [agrupacion, setAgrupacion] = useState('')
    const [filtro, setFiltro] = useState({})
    const [loading, setLoading] = useState(false)
    const [riesgoMedio, setRiesgoMedio] = useState(-1)

    //Draggable Marker
    const [markerPosition, setMarkerPosition] = useState(center)

    //ZONAS
    const [zonas, setZonas] = useState([])
    useEffect(() => {
        if(zonas && zonas.length === 0 && (JSON.stringify(filtro) === '{}' || accidentes.length > 1000)) {
            cargarZonas([])
        }
    }, [zonas, filtro])

    const cargarZonas = async (res) => {
        setLoading(true)
        const data = await (await axios.post(`${URIsAccidentes.zonas}`, res)).data
        if(res.length === 0) {
            const accidentes = (await axios.get(URIsAccidentes.base)).data
            setAccidentes(accidentes)
        } else {
            setAccidentes(res)
        }
        setZonas(data.agrupaciones)
        setRiesgoMedio(data.riesgoMedio)
        setLoading(false)
    }

    //CHART
    const obtenerDatosGrafica = (agrupacion) => {
        setAgrupacion(agrupacion)
        const datosAgrupados = accidentes.reduce((acc, curr) => {
            const categoria = curr[agrupacion]
            acc[categoria] = acc[categoria] ? acc[categoria] + 1 : 1
            return acc
        }, {})

        var datos = Object.keys(datosAgrupados).map((categoria) => ({
            categoria: categoria,
            cantidad: datosAgrupados[categoria]
        }))
        setDatosAgrupados(datos)
    }

    //FILTRO
    const handleFilter = async(data) => {
        setFiltro(data)

        var res 
        //...   

        if(JSON.stringify(data) !== '{}') {
            setLoading(true)

            //Se desactiva el Draggable Marker --> vuelvo a cargar las zonas
            //Compruebo en el if si todos los valores de las claves estan vacios y si radio esta desactivado
            if((Object.values(data)).every(valor => valor === '' || typeof valor === 'object') && !data.radio.activo) {
                cargarZonas()
            } else {
                //Se activa el Draggable Marker
                if(data.radio.activo && data.radio.distancia === 0) {
                    res = []
                } 
                //Fecha+
                else if (data.fecha1 !== '' && data.hora1 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_hora}?fecha=${data.fecha1}&hora=${data.hora1}`)).data;
                } else if (data.fecha1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_edad}?fecha=${data.fecha1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_vehiculo}?fecha=${data.fecha1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' && data.distrito !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_distrito}?fecha=${data.fecha1}&distrito=${data.distrito}`)).data;
                } else if (data.fecha1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_drogas}?fecha=${data.fecha1}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_alcohol}?fecha=${data.fecha1}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_lesion}?fecha=${data.fecha1}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_sexo}?fecha=${data.fecha1}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_accidente}?fecha=${data.fecha1}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.fecha_clima}?fecha=${data.fecha1}&clima=${data.clima}`)).data;
                }
                //Hora+
                else if (data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_edad}?hora=${data.hora1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_vehiculo}?hora=${data.hora1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.hora1 !== '' && data.distrito !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_distrito}?hora=${data.hora1}&distrito=${data.distrito}`)).data;
                } else if (data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_drogas}?hora=${data.hora1}&drogas=${data.drogas}`)).data;
                } else if (data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_alcohol}?hora=${data.hora1}&alcohol=${data.alcohol}`)).data;
                } else if (data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_lesion}?hora=${data.hora1}&lesion=${data.lesion}`)).data;
                } else if (data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_sexo}?hora=${data.hora1}&sexo=${data.sexo}`)).data;
                } else if (data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_accidente}?hora=${data.hora1}&accidente=${data.accidente}`)).data;
                } else if (data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.hora_clima}?hora=${data.hora1}&clima=${data.clima}`)).data;
                }
                
                //Edad+
                else if (data.edad1 !== '' && data.edad2 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_vehiculo}?edad1=${data.edad1}&edad2=${data.edad2}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.distrito !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_distrito}?edad1=${data.edad1}&edad2=${data.edad2}&distrito=${data.distrito}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_drogas}?edad1=${data.edad1}&edad2=${data.edad2}&drogas=${data.drogas}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_alcohol}?edad1=${data.edad1}&edad2=${data.edad2}&alcohol=${data.alcohol}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_lesion}?edad1=${data.edad1}&edad2=${data.edad2}&lesion=${data.lesion}`)).data;
                } 

                //...

                //Individuales
                else if (data.fecha1 !== '') {    
                    if (data.fecha2 !== '') {      // Entre fechas
                        res = (await axios.get(`${URIsAccidentes.fecha_entre}?fecha1=${data.fecha1}&fecha2=${data.fecha2}`)).data;
                    } else {                        // Fecha concreta
                        res = (await axios.get(`${URIsAccidentes.fecha_concreta}?fecha=${data.fecha1}`)).data;
                    }
                } else if (data.hora1 !== '') {         
                    if (data.hora2 !== '') {       // Entre horas
                        res = (await axios.get(`${URIsAccidentes.hora_entre}?hora1=${data.hora1}&hora2=${data.hora2}`)).data;
                    } else {                        // Hora concreta
                        res = (await axios.get(`${URIsAccidentes.hora_concreta}?hora=${data.hora1}`)).data;
                    }
                } else if (data.edad1 !== '' && data.edad2 !== '') { // Edad
                    res = (await axios.get(`${URIsAccidentes.edad}?edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.vehiculo !== '') { // Vehículo
                    res = (await axios.get(`${URIsAccidentes.vehiculo}?vehiculo=${data.vehiculo}`)).data;
                } else if (data.distrito !== '') { // Distrito
                    res = (await axios.get(`${URIsAccidentes.distrito}?distrito=${data.distrito}`)).data;
                } else if (data.drogas !== '') { // Drogas
                    res = (await axios.get(`${URIsAccidentes.drogas}?drogas=${data.drogas}`)).data;
                } else if (data.alcohol !== '') { // Alcohol
                    res = (await axios.get(`${URIsAccidentes.alcohol}?alcohol=${data.alcohol}`)).data;
                } else if (data.lesion !== '') { // Lesión
                    res = (await axios.get(`${URIsAccidentes.lesion}?lesion=${data.lesion}`)).data;
                } else if (data.sexo !== '') { // Sexo
                    res = (await axios.get(`${URIsAccidentes.sexo}?sexo=${data.sexo}`)).data;
                } else if (data.accidente !== '') { // Tipo de accidente
                    res = (await axios.get(`${URIsAccidentes.accidente}?accidente=${data.accidente}`)).data;
                } else if (data.clima !== '') { // Clima
                    res = (await axios.get(`${URIsAccidentes.clima}?clima=${data.clima}`)).data;
                } else if (data.radio.distancia > 0) {
                    res = (await axios.get(`${URIsAccidentes.radio}?radio=${data.radio.distancia}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                }
                
                console.log('Sin zona_concreta = ' + res.length)

                if(data.zona.length !== 0) {
                    res = (await axios.post(`${URIsAccidentes.zona_concreta}`, { accidentes: res, zona: data.zona })).data
                    console.log('Con zona_concreta = ' + res.length)
                }

                if(res.length > 500) {
                    cargarZonas(res)
                } else {
                    setZonas([])
                }

                setAccidentes(res)
                setDatosAgrupados([])
                setAgrupacion('')
                setLoading(false)
            }

            
        } else {
            cargarZonas([])
        }

        
    } 

    const filtroString = (filtro) => {
        let resultado = ''
        for(let key in filtro) {
            if(filtro[key]) {
                let valor
                let clave
                if(key !== 'radio') {   //Ignoro el atributo radio
                    if(filtro[key] === '1') {
                        clave = key + ': '
                        valor = 'positivo, '
                    } else if(filtro[key] === '0') {
                        clave = key + ': '
                        valor = 'negativo, '
                    } else if(key === 'zona' && filtro[key].length === 0) {
                        clave = ''
                        valor = ''
                        valor = filtro[key]
                    } else if(key === 'zona') {
                        clave = 'zona concreta, '
                        valor = ''
                    } else if(key === 'hora1' && filtro.hora2 === '') {
                        clave = 'Hora concreta: '
                        valor = `${filtro.hora1.split(':')[0]}:00, `
                    } else if(key === 'hora2') {
                        clave = 'Franja horaria: '
                        valor = `${filtro.hora1} - ${filtro.hora2}, `
                    } else if(key === 'fecha1' && filtro.fecha2 === '') {
                        clave = 'Fecha concreta: '
                        valor = filtro.fecha1 + ', '
                    } else if(key === 'fecha2') {
                        clave = 'Entre fechas: '
                        valor = `desde el ${filtro.fecha1} hasta el ${filtro.fecha2}, `
                    } else if(key === 'hora1') {
                        clave = ''
                        valor = ''
                    } else if(key === 'fecha1') {
                        clave = ''
                        valor = ''
                    } else {
                        clave = key + ': '
                        valor = filtro[key] + ', '
                    }
                    resultado += clave + valor
                }
            }
        }

        if(resultado.length > 0) {
            resultado = resultado.slice(0, -2)
        }

        return resultado
    }

    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ? 
                    <Loader></Loader>
                    :
                    <>
                        {JSON.stringify(filtro) !== '{}' && filtroString(filtro) !== '' &&
                            <div className="row">
                                <h4>Filtrado por {filtroString(filtro)}</h4>
                            </div>
                        }
                        <div className="row">
                            <MapAccidentes zonas={zonas} 
                                           riesgoMedio={riesgoMedio}
                                           accidentes={accidentes} 
                                           filtro={filtro} 
                                           markerPosition={markerPosition} 
                                           setMarkerPosition={setMarkerPosition}
                                           handleFilter={handleFilter}
                            />
                        </div>
                        <div className="row">
                            <div className="col">
                                <h3>Accidentes: {accidentes.length}</h3> <br/>
                                <ChartAccidente accidentes={accidentes} 
                                                datosAgrupados={datosAgrupados} 
                                                agrupacion={agrupacion} 
                                                obtenerDatosGrafica={obtenerDatosGrafica} 
                                />
                            </div>
                            {/*Filtro*/}
                            <div className="col">
                                <FormAccidentes handleFilter={handleFilter} 
                                                markerPosition={markerPosition}
                                                filtro={filtro}
                                />
                            </div>
                        </div>
                        <br/>
                    </>
                }
            </div>
        </div>
    )
}

export default Accidentes