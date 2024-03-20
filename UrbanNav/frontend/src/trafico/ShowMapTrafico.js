import axios from 'axios'
import { useEffect, useState } from 'react' 
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet' 

const ShowMapTrafico = () => {
    const URIgetAll = 'http://localhost:8000/trafico/'
    const URIgetPorMes = 'http://localhost:8000/trafico/mes'

    const [estaciones, setEstaciones] = useState([])
    const [zonas, setZonas] = useState([])
    const [fecha, setFecha] = useState()

    const manejarFecha = (e) => {
        setFecha(e.target.value)
    }

    const getEstaciones = async() => {
        var res 
        if(fecha !== undefined) {
            var date = new Date(fecha)
            var mes = date.getMonth() + 1
            var ano = date.getFullYear()
            res = (await axios.get(`${URIgetPorMes}/?month=${mes}&year=${ano}`)).data
        } else {
            res = (await axios.get(`${URIgetAll}`)).data
        }
        setEstaciones(res)
        //setZonas(res.poligonos)
    }

    return(
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='d-flex align-items-center'>  
                        <p className='fw-bold'>Introduce una fecha</p>
                        <input type='date' className='mb-4' value={fecha} onChange={(e) => manejarFecha(e)} /> <br/>
                        <button className='btn btn-secondary' type='button' onClick={getEstaciones} >Filtrar</button> <br/>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <div className='card m-3'>
                        <div className='card-body'>
                            <MapContainer center={[40.41688189428294, -3.703318510771146]} zoom={11} style={{ height: '400px', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />  
                                {estaciones.length > 0 && estaciones.map((estacion, index) => (
                                    <Marker key={index} position={[estacion.lat, estacion.lon]}>
                                        <div>
                                            <Popup>
                                                <p>Nombre: {estacion.nombre}</p> <br/>
                                                <p>Trafico medio: {estacion.media}</p>
                                                <a href='/estacionamientos'>Estacionamientos</a>
                                            </Popup>
                                        </div>
                                    </Marker>
                                ))}    
                                {zonas.length > 0 && zonas.map((zona, index) => (
                                    <Polygon key={index} pathOptions={{ color: 'red'}} positions={zona} />
                                ))}                           
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowMapTrafico