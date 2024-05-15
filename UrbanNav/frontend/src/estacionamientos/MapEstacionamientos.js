import LegendEstacionamientos from "./LegendEstacionamientos"
import { SetViewOnClick, DisplayPosition, center, zoom } from "../MapFunctions" 
import { URIsEstacionamientos } from "./URIsEstacionamientos"
import { iconos } from "../markerIcons"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import axios from 'axios'
import { useState, useEffect, useRef } from "react"

const MapEstacionamientos = ({ estacionamientos, setEstacionamientos, distritos, barrios, filtro, setFiltro, setLoading }) => {
    const [map, setMap] = useState(null)

    //Con estacionamientosPrev recupero el valor de estacionamientos al darle al boton: 'Volver a mostrar las zonas' 
    const [estacionamientosPrev, setEstacionamientosPrev] = useState([])


    //ZONA SELECCIONADA
    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
    const [zonaClickeada, setZonaClickeada] = useState(false)
    const [eventZonaPrevia, setEventZonaPrevia] = useState(null)
    const polygonBarrioRefs = useRef(new Array(barrios.length))
    const polygonDistritoRefs = useRef(new Array(distritos.length))

    const handleClick = (index, zona, tipo) => {
        const prevIndex = eventZonaPrevia ? eventZonaPrevia.index : null;
        const newColor = filtro.color === 'Verde' ? 'green' :
                          filtro.color === 'Azul' ? 'blue' :
                          filtro.color === 'Naranja' ? 'orange' :
                          filtro.color === 'Rojo' ? 'red' :
                          filtro.color === 'Amarillo' ? 'yellow' :
                          filtro.color === 'Negro' ? 'black' :
                          filtro.color === 'Morado' ? 'purple' : '#017FC3';

        if (zonaClickeada && prevIndex !== null) {
            // Restablecer el color anterior
            const prevRef = tipo === 'distrito' ? polygonDistritoRefs.current[prevIndex] : polygonBarrioRefs.current[prevIndex];
            prevRef.setStyle({
                fillColor: eventZonaPrevia.color,
                fillOpacity: 0.2  
            });
            if(index !== eventZonaPrevia.index) {   //He seleccionado una zona distinta a la que ya estaba seleccionada
                const ref = tipo === 'distrito' ? polygonDistritoRefs.current[index] : polygonBarrioRefs.current[index];
                ref.setStyle({
                    fillColor: 'rgba(4, 4, 252, 0)',
                    fillOpacity: 0
                });
                setEventZonaPrevia({ index: index, color: newColor })
                setZonaSeleccionada(zona)
                setZonaClickeada(true)
            } else {    //He deseleccionado una zona
                setEventZonaPrevia(null);
                setZonaSeleccionada(null);
                setZonaClickeada(false)
            }
        } else {
            // Cambiar a transparente + guardar color anterior
            
            const ref = tipo === 'distrito' ? polygonDistritoRefs.current[index] : polygonBarrioRefs.current[index];
            ref.setStyle({
                fillColor: 'rgba(4, 4, 252, 0)',
                fillOpacity: 0
            });
            setEventZonaPrevia({ index: index, color: newColor });
            setZonaSeleccionada(zona);
            setZonaClickeada(true)
        }
    };
    

    const handleMouseOut = (event, color) => {
        if(!zonaClickeada) {
            const fillColor = color === 'Verde' ? '#2AAD27' :
                              color === 'Azul' ? '#2A81CB' :
                              color === 'Naranja' ? '#CB8427' :
                              color === 'Rojo' ? '#CB2B3E' :
                              color === 'Amarillo' ? '#FFD326' :
                              color === 'Negro' ? '#3D3D3D' :
                              color === 'Morado' ? '#9C2BCB' : '#017FC3'

            event.target.setStyle({ fillColor: fillColor });
            setZonaSeleccionada(null)
        }
    }

    const handleMouseOver = (event, zona) => {
        if(!zonaClickeada) {
            const fillColor = 'rgba(4, 4, 252, 0)'
            event.target.setStyle({ fillColor: fillColor })
            setZonaSeleccionada(zona)
        }
    }

    function calcularTotal(distrito) {
        var total = 0
        distrito.barrios.forEach((barrio) => {
            total += barrio.estacionamientos.length
        })
        return total
    }

    function asignarEstacionamientos(distrito) {
        setLoading(true)
        var est = []
        for(const barrio of distrito.barrios) {
            est = est.concat(barrio.estacionamientos)
        }
        setEstacionamientos(est)
        setLoading(false)
    }

    //Tipo de zona seleccionada: distrito o barrio (LayersControl)
    const [activateOverlay, setActivateOverlay] = useState('Distritos')
    useEffect(() => {
        if(barrios.length === 0 && distritos.length === 0) {
            setActivateOverlay('Markers')
        } else {
            setActivateOverlay('Distritos')
        }
    }, [barrios, distritos])

    const handleOverlayChange = (selectedOverlay) => {
        setActivateOverlay(activateOverlay === selectedOverlay ? '' : selectedOverlay)
    };

    return(
        <>
            {zonaSeleccionada !== null && zonaSeleccionada.codigo ?  //Es un distrito
                <h1>Total: {calcularTotal(zonaSeleccionada)}</h1>
             : zonaSeleccionada !== null && zonaSeleccionada.nombre ?    //Es un barrio
                <h1>Total: {zonaSeleccionada.estacionamientos.length}</h1>
             
             :  <h1>Total: {estacionamientos.length}</h1>
            }
            <div className="row">
                <div className="col-sm-12 col-md-3">
                    <LegendEstacionamientos></LegendEstacionamientos>
                    
                    {/* 
                        En este caso teniamos las zonas y hemos mostrado los estacionamientos de una zona concreta. 
                        Ahora queremos deshacer esto y volver a mostrar las zonas
                    */}
                    {filtro.zonas === 1 &&
                        <button className="btn btn-secondary"
                                onClick={() => {
                                    setEstacionamientos(estacionamientosPrev)
                                    setFiltro({
                                        ...filtro,
                                        zonas: 0
                                    }) 
                                    
                                }}
                        >
                            Volver a mostrar las zonas
                        </button>
                    }
                </div>
                <div className="col-sm-12 col-md-9">
                    <div className="card m-3">
                        <div className="card-body">
                            { map ? <DisplayPosition map={map} /> : null }
                            {estacionamientos.length > 1000 &&
                                <>
                                    <label className="me-2">Mostrar distritos</label>
                                    <input type="checkbox"
                                           checked={activateOverlay === 'Distritos'}
                                           onClick={() => handleOverlayChange('Distritos')}
                                           className="me-4"
                                    />
                                    <label className="me-2">Mostrar barrios</label>
                                    <input type="checkbox"
                                           checked={activateOverlay === 'Barrios'}
                                           onClick={() => handleOverlayChange('Barrios')}
                                    />
                                </>
                            }
                            <MapContainer center={center} 
                                          zoom={zoom} 
                                          style={{ height: '400px', width: '100%', borderRadius: '10px' }} 
                                          className="shadow"
                                          ref={setMap}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {distritos.length > 0 && activateOverlay === 'Distritos' && (filtro.zonas === 0 || JSON.stringify(filtro) === '{}') && distritos.map((distrito, index) => (
                                    <Polygon    key={index} 
                                                ref={(el) => polygonDistritoRefs.current[index] = el}
                                                eventHandlers={{
                                                    mouseout: (event) => handleMouseOut(event, filtro.color),
                                                    mouseover: (event) => handleMouseOver(event, distrito),
                                                    click: () => handleClick(index, distrito, 'distrito')
                                                }}
                                                pathOptions={{ color: filtro.color === 'Verde' ? 'green' :
                                                                    filtro.color === 'Azul' ? 'blue' :
                                                                    filtro.color === 'Naranja' ? 'orange' :
                                                                    filtro.color === 'Rojo' ? 'red' :
                                                                    filtro.color === 'Amarillo' ? 'yellow' :
                                                                    filtro.color === 'Negro' ? 'black' :
                                                                    filtro.color === 'Morado' ? 'purple' : '#017FC3'}} 
                                                positions={distrito.delimitaciones}
                                    >
                                        <Popup>
                                            <button className="btn"
                                                    onClick={() => {
                                                        setEstacionamientosPrev(estacionamientos)
                                                        asignarEstacionamientos(distrito) 
                                                        setFiltro({
                                                            ...filtro,
                                                            zonas: 1
                                                        })
                                                    }}
                                            >Ver estacionamientos de este distrito</button>
                                        </Popup>
                                    </Polygon>
                                ))} 
                                {barrios.length > 0 && activateOverlay === 'Barrios' && (filtro.zonas === 0 || JSON.stringify(filtro) === '{}') && barrios.map((barrio, index) => (
                                    <Polygon    key={index} 
                                                ref={(el) => polygonBarrioRefs.current[index] = el}
                                                eventHandlers={{
                                                    mouseout: (event) => handleMouseOut(event, filtro.color),
                                                    mouseover: (event) => handleMouseOver(event, barrio),
                                                    click: () => handleClick(index, barrio, 'barrio')
                                                }}
                                                pathOptions={{ color: filtro.color === 'Verde' ? 'green' :
                                                                    filtro.color === 'Azul' ? 'blue' :
                                                                    filtro.color === 'Naranja' ? 'orange' :
                                                                    filtro.color === 'Rojo' ? 'red' :
                                                                    filtro.color === 'Amarillo' ? 'yellow' :
                                                                    filtro.color === 'Negro' ? 'black' :
                                                                    filtro.color === 'Morado' ? 'purple' : '#017FC3'}} 
                                                positions={barrio.delimitaciones}
                                    >
                                        <Popup>
                                            <button className="btn"
                                                    onClick={() => {
                                                        setEstacionamientosPrev(estacionamientos)
                                                        setEstacionamientos(barrio.estacionamientos)
                                                        setFiltro({
                                                            ...filtro,
                                                            zonas: 1
                                                        })
                                                    }}
                                            >Ver estacionamientos de este barrio</button>
                                        </Popup>
                                    </Polygon>
                                ))}
                                {estacionamientos && estacionamientos.length > 0 && (filtro.zonas === 1 || estacionamientos.length < 1000) && estacionamientos.map((estacionamiento, index) => (
                                    <Marker key={index} 
                                            position={[estacionamiento.lat, estacionamiento.lon]}
                                            icon={estacionamiento.colore.color === 'Verde' ? iconos.verde : 
                                                estacionamiento.colore.color === 'Azul' ? iconos.azul :
                                                estacionamiento.colore.color === 'Naranja' ? iconos.naranja : 
                                                estacionamiento.colore.color === 'Rojo' ? iconos.rojo : 
                                                estacionamiento.colore.color === 'Amarillo' ? iconos.amarillo :
                                                estacionamiento.colore.color === 'Negro' ? iconos.negro :
                                                iconos.morado}
                                    >
                                        <Popup>
                                            <p>
                                                Plazas: {estacionamiento.plazas} <br/>
                                                Tipo: {estacionamiento.tipo_estacionamiento && estacionamiento.tipo_estacionamiento.tipo_estacionamiento} <br/>
                                                Color: {estacionamiento.colore && estacionamiento.colore.color && estacionamiento.colore.color}
                                            </p>
                                        </Popup>
                                    </Marker>
                                ))}
                                <SetViewOnClick />
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    )
}

export default MapEstacionamientos