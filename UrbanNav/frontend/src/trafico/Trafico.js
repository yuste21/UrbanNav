import { useState, useEffect } from "react"
import axios from "axios"
import { URIsTrafico } from "./URIsTrafico"
import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import MapTrafico from "./MapTrafico"
import FormTrafico from "./FormTrafico"
import BarChartTrafico from "./BarChartTrafico"
import { URIsDistritos } from "../distritos/URIsDistritos"

function Trafico () {
    const [filtro, setFiltro] = useState({})
    const [estaciones, setEstaciones] = useState([])
    const [distritos, setDistritos] = useState([])
    const [barrios, setBarrios] = useState([])
    const [media, setMedia] = useState()
    const [loading, setLoading] = useState(false)
    const [fechaMin, setFechaMin] = useState(null)
    const [fechaMax, setFechaMax] = useState(null)

    //BarChart Zonas mas concurridas
    const [showBarChart, setShowBarChart] = useState(false)
    const [selectedBar, setSelectedBar] = useState(null)
    const [activatedOverlay, setActivatedOverlay] = useState('Estaciones')

    //PROVISIONAL
    const orientacion = 'true'

    useEffect(() => {
        const getAll = async () => {
            setLoading(true)
            const data = (await axios.get(URIsDistritos.getTraficoInicio)).data
            setEstaciones(data.estaciones_trafico)
            setMedia(data.media_total)
            setDistritos(data.distritos)
            setBarrios(data.barrios)
            setLoading(false)
        }
        
        if(JSON.stringify(filtro) === '{}') {
            getAll()
        }
        
    }, [filtro])

    const handleFilter = async (data) => {
        setFiltro(data)

        var res

        if(JSON.stringify(data) !== '{}') {
            setLoading(true)
            if(data) {  //Se ha filtrado por algun atributo
                //El getAll tiene mas prioridad
                if(data.getAll === true) {
                    res = (await axios.get(`${URIsTrafico.getAll}?orientacion=${orientacion}`)).data
                    setFechaMin(res.fechaMin)
                    setFechaMax(res.fechaMax)
                }

                //Entre Fechas+
                else if(data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.hora2 !== '') {
                    res = (await axios.get(`${URIsTrafico.entreFechas_entreHoras}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&orientacion=${orientacion}&hora1=${data.hora1}&hora2=${data.hora2}`)).data
                } else if(data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '') {
                    console.log('Entro Filtrooo')
                    res = (await axios.get(`${URIsTrafico.entreFechas_horaConcreta}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&orientacion=${orientacion}&hora=${data.hora1}`)).data
                } else if(data.fecha1 !== '' && data.fecha2 !== '' && data.sentido !== '') {
                    res = (await axios.get(`${URIsTrafico.entreFechas_sentido}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&sentido=${data.sentido}`)).data
                }

                //Fecha Concreta+
                else if(data.fecha1 !== '' && data.hora1 !== '' && data.hora2 !== '') {
                    res = (await axios.get(`${URIsTrafico.fechaConcreta_entreHoras}?fecha=${data.fecha1}&orientacion=${orientacion}&hora1=${data.hora1}&hora2=${data.hora2}`)).data
                } else if(data.fecha1 !== '' && data.hora1 !== '') {
                    res = (await axios.get(`${URIsTrafico.fechaConcreta_horaConcreta}?fecha=${data.fecha1}&orientacion=${orientacion}&hora=${data.hora1}`)).data
                } else if(data.fecha1 !== '' && data.sentido !== '') {
                    res = (await axios.get(`${URIsTrafico.fechaConcreta_sentido}?fecha=${data.fecha1}&sentido=${data.sentido}`)).data
                }

                //Mes+
                else if(data.mes !== '' && data.hora1 !== '' && data.hora2 !== '') {
                    const [year, month] = data.mes.split('-')
                    var numeroMonth = parseInt(month, 10)
                    res = (await axios.get(`${URIsTrafico.mes_entreHoras}?month=${numeroMonth}&year=${year}&orientacion=${orientacion}&hora1=${data.hora1}&hora2=${data.hora2}`)).data  
                } else if(data.mes !== '' && data.hora1 !== '') {
                    const [year, month] = data.mes.split('-')
                    var numeroMonth = parseInt(month, 10)
                    res = (await axios.get(`${URIsTrafico.mes_horaConcreta}?month=${numeroMonth}&year=${year}&orientacion=${orientacion}&hora=${data.hora1}`)).data  
                } else if(data.mes !== '' && data.sentido !== '') {
                    const [year, month] = data.mes.split('-')
                    var numeroMonth = parseInt(month, 10)
                    res = (await axios.get(`${URIsTrafico.mes_sentido}?month=${numeroMonth}&year=${year}&sentido=${data.sentido}`)).data  
                }

                //Entre Horas+
                else if(data.hora1 !== '' && data.hora2 !== '' && data.sentido !== '') {
                    res = (await axios.get(`${URIsTrafico.entreHoras_sentido}?hora1=${data.hora1}&hora2=${data.hora2}&sentido=${data.sentido}`)).data  
                }

                //Hora Concreta+
                else if(data.hora1 !== '' && data.sentido !== '') {
                    res = (await axios.get(`${URIsTrafico.horaConcreta_sentido}?hora=${data.hora1}&sentido=${data.sentido}`)).data  
                } 

                //Filtros individuales
                else if(data.mes !== '') {
                    const [year, month] = data.mes.split('-')
                    var numeroMonth = parseInt(month, 10)
                    res = (await axios.get(`${URIsTrafico.mes}?month=${numeroMonth}&year=${year}&orientacion=${orientacion}`)).data
                } else if(data.fecha1 !== '' && data.fecha2 !== '') {
                    res = (await axios.get(`${URIsTrafico.entreFechas}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&orientacion=${orientacion}`)).data
                } else if(data.fecha1 !== '') {
                    res = (await axios.get(`${URIsTrafico.fechaConcreta}?fecha=${data.fecha1}&orientacion=${orientacion}`)).data
                } else if(data.hora1 !== '' && data.hora2 !== '') {
                    res = (await axios.get(`${URIsTrafico.entreHoras}?min=${data.hora1}&max=${data.hora2}&orientacion=${orientacion}`)).data
                } else if(data.hora1 !== '') {
                    res = (await axios.get(`${URIsTrafico.horaConcreta}?hora=${data.hora1}&orientacion=${orientacion}`)).data
                } else if(data.sentido !== '') {
                    res = (await axios.get(`${URIsTrafico.sentido}?sentido=${data.sentido}`)).data
                }
            setMedia(res.media_total)
            setEstaciones(res.estaciones_trafico)
            setDistritos(res.distritos)
            setBarrios(res.barrios)
            setLoading(false)
            }
        }
    }

    const filtroString = (filtro) => {
        let resultado = ''
        for(let key in filtro) {
            if(filtro[key]) {
                let valor
                let clave
                if(key === 'sentido') {
                    clave = 'sentido: '
                    console.log(filtro[key])
                    if(filtro[key] === 'Norte-Sur') {
                        valor = 'Norte - Sur, '
                    } else if(filtro[key] === 'Sur-Norte') {
                        valor = 'Sur - Norte'
                    } else if(filtro[key] === 'Este-Oeste') {
                        valor = 'Este - Oeste, '
                    } else {
                        valor = 'Oeste - Este, '
                    }
                } else if(key === 'getAll') {
                    clave = 'Mostrando todo el trafico'
                    valor = '  '
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
                    valor = `${filtro.fecha1} - ${filtro.fecha2}, `
                } else if(key === 'hora1') {
                    clave = ''
                    valor = ''
                } else {
                    clave = key + ': '
                    valor = filtro[key] + ', '
                }
                resultado += clave + valor
            }
        }

        if(resultado.length > 0) {
            resultado = resultado.slice(0, -2)
        }

        return resultado
    }

    return(
        <div className="padre">
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ?
                    <Loader/>
                :
                    <>
                        <div className="row">
                            {JSON.stringify(filtro) !== '{}' && filtroString(filtro) !== '' &&
                                <div className="col">
                                    {filtro.getAll === false &&
                                        <h4>Filtrado por </h4>
                                    }
                                    <h4>{filtroString(filtro)}</h4>
                                    {filtro.getAll === true &&
                                        <h4> desde {fechaMin} hasta {fechaMax}</h4>
                                    }
                                </div>
                            }
                            <div className="col">
                                <h4>Trafico Medio: {media}</h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-xl-7">
                                <MapTrafico activatedOverlay={activatedOverlay}
                                            setActivatedOverlay={setActivatedOverlay}
                                            selectedBar={selectedBar}
                                            setSelectedBar={setSelectedBar}
                                            showBarChart={showBarChart}
                                            setShowBarChart={setShowBarChart}
                                            setLoading={setLoading}
                                            estaciones={estaciones} 
                                            media={media} 
                                            distritos={distritos}
                                            barrios={barrios}
                                />
                            </div>
                            <div className="col-md-12 col-xl-5">
                            {showBarChart ? 
                                <BarChartTrafico data={activatedOverlay.split(' ').includes('Distritos') ? distritos 
                                                     : activatedOverlay.split(' ').includes('Barrios') ? barrios : estaciones}
                                                 setSelectedBar={setSelectedBar}
                                                 activatedOverlay={activatedOverlay}
                                />
                            :
                                
                                <FormTrafico handleFilter={handleFilter} />
                            }
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Trafico