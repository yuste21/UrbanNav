import NavbarPage from "../navbar/navbar";
import MapEstacionamientos from "./MapEstacionamientos";
import FormEstacionamientos from "./FormEstacionamientos";
import { URIsEstacionamientos } from "./URIsEstacionamientos";
import { useEffect, useState } from "react";
import axios from 'axios'
import Loader from "../loader/Loader";

function Estacionamientos () {
    const [estacionamientos, setEstacionamientos] = useState({})
    const [filtro, setFiltro] = useState({})
    const [loading, setLoading] = useState(false)

    const [zonas, setZonas] = useState([])
    useEffect(() => {
        if(zonas.length === 0 && estacionamientos.length > 1000) {
            cargarZonas()
        }
    }, [filtro, zonas])

    const cargarZonas = async(res) => {
        const data = await (await axios.post(`${URIsEstacionamientos.zonas}`, res)).data
        setZonas(data)
    }

    useEffect(() => {
        handleFilter({})
    }, [])

    const handleFilter = async (data) => {
        let res 
        setFiltro(data)
        setLoading(true)

        if(Object.keys(data).length !== 0) {
            if(data.distrito !== '') {
                res = (await axios.get(`${URIsEstacionamientos.distrito}?distrito=${data.distrito}`)).data
            } else if(data.barrio !== '') {
                res = (await axios.get(`${URIsEstacionamientos.barrio}?barrio=${data.barrio}`)).data
            } else if(data.color !== '') {
                res = (await axios.get(`${URIsEstacionamientos.color}?color=${data.color}`)).data
            } else if(data.tipo !== '') {
                res = (await axios.get(`${URIsEstacionamientos.tipo}?tipo=${data.tipo}`)).data
            }
        } else {    
            //res = (await axios.get(`${URIsEstacionamientos.base}`)).data  
            res = (await axios.get(`${URIsEstacionamientos.color}?color=Naranja`)).data
        }
        if(res.length > 1000) {
            cargarZonas(res)
        } else {
            setZonas([])
        }

        setEstacionamientos(res)
        setLoading(false)
    }

    const filtroString = (filtro) => {
        let resultado = ''
        for(let key in filtro) {
            if(filtro[key]) {
                if(key !== 'zonas') {
                    resultado += `${key}: ${filtro[key]}, `
                } else {
                    resultado += 'zona especifica, '
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
                        {JSON.stringify(filtro) !== '{}' &&
                            <div className="row">
                                <h4>Filtrado por {filtroString(filtro)}</h4>
                            </div>
                        }
                        <div className="row">
                            <div className="col">
                                <MapEstacionamientos estacionamientos={estacionamientos} 
                                                     setEstacionamientos={setEstacionamientos} 
                                                     zonas={zonas}
                                                     setZonas={setZonas}
                                                     filtro={filtro}
                                                     setFiltro={setFiltro}
                                />
                            </div>
                            <div className="col">
                                <FormEstacionamientos handleFilter={handleFilter} />
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Estacionamientos