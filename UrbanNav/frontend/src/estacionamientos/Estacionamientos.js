import NavbarPage from "../navbar/navbar";
import MapEstacionamientos from "./MapEstacionamientos";
import FormEstacionamientos from "./FormEstacionamientos";
import { URIsEstacionamientos } from "./URIsEstacionamientos";
import { useEffect, useState } from "react";
import axios from 'axios'
import Loader from "../loader/Loader";
import { URIsDistritos } from "../distritos/URIsDistritos";

function Estacionamientos () {
    const [estacionamientos, setEstacionamientos] = useState({})
    const [filtro, setFiltro] = useState({})
    const [loading, setLoading] = useState(false)

    const [distritos, setDistritos] = useState([])
    const [barrios, setBarrios] = useState([])
    useEffect(() => {
        cargarZonas()
    }, [])

    const cargarZonas = async() => {
        // if(res.length === 0) {
        //     setLoading(true)
        //     const data = (await axios.get(`${URIsDistritos.getEstacionamientosInicio}`)).data
        //     setDistritos(data.distritos)
        //     setBarrios(data.barrios)
        //     setEstacionamientos(data.estacionamientos)
        //     setLoading(false)
        // } else {
        //     const data = (await axios.post(`${URIsDistritos.getEstacionamientos}`, res)).data
        //     setDistritos(data.distritos)
        //     setBarrios(data.barrios)
        // }

        setLoading(true)
        const data = (await axios.get(`${URIsDistritos.getEstacionamientosInicio}`)).data
        setDistritos(data.distritos)
        setBarrios(data.barrios)
        setEstacionamientos(data.estacionamientos)
        setLoading(false)
        
    }

    const handleFilter = async (data) => {
        let res 
        setFiltro(data)
        setLoading(true)

        console.log('Antes consulta: ' + JSON.stringify(data))
        if(Object.keys(data).length !== 0) {
            if(data.color !== '' && data.tipo !== '') {
                res = (await axios.get(`${URIsEstacionamientos.color_tipo}?color=${data.color}&tipo=${data.tipo}`)).data
            } else if(data.color !== '') {
                res = (await axios.get(`${URIsEstacionamientos.color}?color=${data.color}`)).data
            } else if(data.tipo !== '') {
                res = (await axios.get(`${URIsEstacionamientos.tipo}?tipo=${data.tipo}`)).data
            }

            if(res.estacionamientos.length > 1000) {
                setDistritos(res.distritos)
                setBarrios(res.barrios)
            } else {
                setDistritos([])
                setBarrios([])
            }
            setEstacionamientos(res.estacionamientos)
        } else {    
            cargarZonas() 
        }
        
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
        <div className="padre">
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
                            <div className="col-xl-7 col-lg-12">
                                <MapEstacionamientos estacionamientos={estacionamientos}
                                                     setEstacionamientos={setEstacionamientos}
                                                     distritos={distritos}
                                                     barrios={barrios}
                                                     filtro={filtro}
                                                     setFiltro={setFiltro}
                                                     setLoading={setLoading}
                                />
                            </div>
                            <div className="col-xl-5 col-lg-12 mt-5">
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