import LegendEstacionamientos from "./LegendEstacionamientos"
import { SetViewOnClick, DisplayPosition, center, zoom } from "../MapFunctions" 
import { URIsEstacionamientos } from "./URIsEstacionamientos"
import { iconos } from "../markerIcons"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import axios from 'axios'
import { useState } from "react"

const MapEstacionamientos = ({ estacionamientos, setEstacionamientos, zonas, setZonas, filtro, setFiltro }) => {
    const [map, setMap] = useState(null)

    /* Con estacionamientosPrev recupero el valor de estacionamientos al darle al boton: 'Volver a mostrar las zonas' */
    const [estacionamientosPrev, setEstacionamientosPrev] = useState([])

    return(
        <>
            <h1>Total: {estacionamientos.length}</h1>
            <div className="row">
                <div className="col-3">
                    <LegendEstacionamientos></LegendEstacionamientos>
                    
                    {/* 
                        En este caso teniamos las zonas y hemos mostrado los estacionamientos de una zona concreta. 
                        Ahora queremos deshacer esto y volver a mostrar las zonas
                    */}
                    {filtro.zonas === 1 && estacionamientos.length > 0 &&
                        <button className="btn btn-secondary"
                                onClick={() => {
                                    setFiltro({
                                        ...filtro,
                                        zonas: 0
                                    }) 
                                    setEstacionamientos(estacionamientosPrev)
                                }}
                        >Volver a mostrar las zonas</button>
                    }
                </div>
                <div className="col-9">
                    { map ? <DisplayPosition map={map} /> : null }
                    <MapContainer center={center} 
                                  zoom={zoom} 
                                  style={{ height: '400px', width: '100%' }} 
                                  ref={setMap}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {zonas.length > 0 && filtro.zonas === 0 ? zonas.map((zona, index) => (
                            <Polygon    key={index} 
                                        pathOptions={{ color: filtro.color === 'Verde' ? 'green' :
                                                              filtro.color === 'Azul' ? 'blue' :
                                                              filtro.color === 'Naranja' ? 'orange' :
                                                              filtro.color === 'Rojo' ? 'red' :
                                                              filtro.color === 'Amarillo' ? 'yellow' :
                                                              filtro.color === 'Negro' ? 'black' :
                                                              filtro.color === 'Morado' ? 'purple' : 'pink'}} 
                                        positions={zona.zona}
                            >
                                <Popup>
                                    <button className="btn"
                                            onClick={() => {
                                            setEstacionamientosPrev(estacionamientos)
                                            setEstacionamientos(zona.estacionamientos) 
                                            setFiltro({
                                                ...filtro,
                                                zonas: 1
                                            })
                                        }}
                                    >Ver estacionamientos de esta zona</button>
                                </Popup>
                            </Polygon>
                        ))
                        :
                        estacionamientos && estacionamientos.length > 0 && estacionamientos.map((estacionamiento, index) => (
                            <Marker key={index} 
                                    position={[estacionamiento.lat, estacionamiento.lon]}
                                    icon={estacionamiento.color === 'Verde' ? iconos.verde : 
                                          estacionamiento.color === 'Azul' ? iconos.azul :
                                          estacionamiento.color === 'Naranja' ? iconos.naranja : 
                                          estacionamiento.color === 'Rojo' ? iconos.rojo : 
                                          estacionamiento.color === 'Amarillo' ? iconos.amarillo :
                                          estacionamiento.color === 'Negro' ? iconos.negro :
                                          iconos.morado}
                            >
                                <Popup>
                                    <p>
                                        Distrito: {estacionamiento.distrito} <br/>
                                        Barrio: {estacionamiento.barrio} <br/>
                                        Plazas: {estacionamiento.plazas} <br/>
                                        Tipo: {estacionamiento.tipo} <br/>
                                        Color: {estacionamiento.color}
                                    </p>
                                </Popup>
                            </Marker>
                        ))}
                        <SetViewOnClick />
                    </MapContainer>
                </div>
            </div>
            
        </>
    )
}

export default MapEstacionamientos