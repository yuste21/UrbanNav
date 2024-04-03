import { useState, useEffect } from "react"
import axios from "axios"
import { URIsTrafico } from "./URIsTrafico"
import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import MapTrafico from "./MapTrafico"
import FormTrafico from "./FormTrafico"

function Trafico () {
    const [filtro, setFiltro] = useState({})
    const [estaciones, setEstaciones] = useState([])
    const [media, setMedia] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getAll = async () => {
            setLoading(true)
            const data = (await axios.get(URIsTrafico.base)).data
            setEstaciones(data.estaciones)
            setMedia(data.media)
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

            if(data.mes !== '') {
                const [year, month] = data.mes.split('-')
                var numeroMonth = parseInt(month, 10)
                res = (await axios.get(`${URIsTrafico.mes}?month=${numeroMonth}&year=${year}`)).data
            } else if(data.fecha1 !== '' && data.fecha2 !== '') {
                res = (await axios.get(`${URIsTrafico.fechaEntre}?fecha1=${data.fecha1}&fecha2=${data.fecha2}`)).data
            } else if(data.fecha1 !== '') {
                res = (await axios.get(`${URIsTrafico.fechaConcreta}?fecha=${data.fecha1}`)).data
            } else if(data.hora1 !== '' && data.hora2 !== '') {
                res = (await axios.get(`${URIsTrafico.horaEntre}?min=${data.hora1}&max=${data.hora2}`)).data
            } else if(data.hora1 !== '') {
                res = (await axios.get(`${URIsTrafico.horaConcreta}?horaQuery=${data.hora1}`)).data
            } else if(data.sentido !== '') {
                res = (await axios.get(`${URIsTrafico.sentido}?sentido=${data.sentido}`)).data
            }
            setMedia(res.media)
            setEstaciones(res.estaciones)
            setLoading(false)
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
                    if(filtro[key] === 'N-S') {
                        valor = 'Norte - Sur, '
                    } else if(filtro[key] === 'S-N') {
                        valor = 'Sur - Norte'
                    } else if(filtro[key] === 'E-O') {
                        valor = 'Este - Oeste, '
                    } else {
                        valor = 'Oeste - Este, '
                    }
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
        <div>
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ?
                    <Loader/>
                :
                    <>
                        <div className="row">
                            {JSON.stringify(filtro) !== '{}' && filtroString(filtro) !== '' &&
                                <div className="col">
                                    <h4>Filtrado por {filtroString(filtro)}</h4>
                                </div>
                            }
                            <div className="col">
                                <h4>Trafico Medio: {media}</h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-7">
                                <MapTrafico estaciones={estaciones} 
                                            media={media} 
                                            filtro={filtro}
                                            handle
                                />
                            </div>
                            <div className="col-5">
                                <FormTrafico handleFilter={handleFilter} />
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Trafico