import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import { iconos } from "../markerIcons"
import { SetViewOnClick, DisplayPosition, center, zoom } from "../MapFunctions" 
import LegendEstacionamientos from "./LegendEstacionamientos"
import FormEstacionamientos from "./FormEstacionamientos"
import { asignarEstacionamientos, initialFilter } from "../features/estacionamiento/dataEstacionamientoSlice"

const MapEstacionamientos = ({ handleFilter }) => {
    const dispatch = useDispatch()

    const estacionamientos = useSelector(state => state.estacionamientos.dataEstacionamientos.estacionamientos)
    const distritos = useSelector(state => state.estacionamientos.dataEstacionamientos.distritos)
    const barrios = useSelector(state => state.estacionamientos.dataEstacionamientos.barrios)
    

    const filtro = useSelector(state => state.estacionamientos.filtro)
    const [color, setColor] = useState('#017FC3')
    useEffect(() => {
        if(filtro.filtrado && filtro.color !== '') setColor(filtro.color)
    }, [filtro.filtrado])

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
        const newColor = color === 'Verde' ? 'green' :
                          color === 'Azul' ? 'blue' :
                          color === 'Naranja' ? 'orange' :
                          color === 'Rojo' ? 'red' :
                          color === 'Amarillo' ? 'yellow' :
                          color === 'Negro' ? 'black' :
                          color === 'Morado' ? 'purple' : '#017FC3';

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

    //Tipo de zona seleccionada: distrito o barrio (LayersControl)
    const [activateOverlay, setActivateOverlay] = useState('Distritos')
    useEffect(() => {
        if((barrios.length === 0 && distritos.length === 0) || estacionamientos.length < 100) {
            setActivateOverlay('Estacionamientos')
        } else {
            setActivateOverlay('Distritos')
        }
    }, [barrios, distritos])

    const handleOverlayChange = (selectedOverlay) => {
        var aux = activateOverlay.split(' ')
        if(activateOverlay.includes(selectedOverlay)) {     //Desactivo checkbox
            var filtrado = aux.filter(el => el !== selectedOverlay && el !== '')
            setActivateOverlay(filtrado.length > 0 ? filtrado[0] : '')
        } else {  //Activamos el checkbox selectedOverlay
            
            if(selectedOverlay === 'Estacionamientos') {  //Si selected es Estacionamientos no tengo que desactivar ningun checkbox
                setActivateOverlay(activateOverlay + ' ' + selectedOverlay)
            } else {    //En caso de que haya algun checkbox activado que no sea Estacionamientos lo desactivo
            var filtrado = aux.filter(el => el === 'Estacionamientos')
            var filtradoString = filtrado.length > 0 ? `${filtrado[0]}` : ''
            setActivateOverlay(filtradoString + ' ' + selectedOverlay)
            }
        } 
    };

    return(
        <div className="row">
            <div className="col-xl-7 col-lg-12">
                {zonaSeleccionada !== null && zonaSeleccionada.codigo ?  //Es un distrito
                    <h1>Estacionamientos: {calcularTotal(zonaSeleccionada)}</h1>
                : zonaSeleccionada !== null && zonaSeleccionada.nombre ?    //Es un barrio
                    <h1>Estacionamientos: {zonaSeleccionada.estacionamientos.length}</h1>
                
                :  <h1>Estacionamientos: {estacionamientos.length}</h1>
                }
                <div className="row">
                    <div className="col-sm-12 col-md-3">
                        <LegendEstacionamientos></LegendEstacionamientos>
                    </div>
                    <div className="col-sm-12 col-md-9">
                        <div className="card m-3">
                            <div className="card-body">
                                { map ? <DisplayPosition map={map} /> : null }
                                {/* 
                                    En este caso teniamos las zonas y hemos mostrado los estacionamientos de una zona concreta. 
                                    Ahora queremos deshacer esto y volver a mostrar las zonas
                                */}
                                {filtro.zonas.activo &&
                                    <button className="btn btn-azul mb-3"
                                            onClick={() => {
                                                dispatch(asignarEstacionamientos({ estacionamientos: estacionamientosPrev, tipo: 'previos', nombre: '' }))
                                            }}
                                    >
                                        Volver a mostrar las zonas
                                    </button>
                                }
                                {distritos.length > 2 && !filtro.zonas.activo &&
                                    <>
                                        <label className="me-2">Distritos</label>
                                        <input type="checkbox"
                                               checked={activateOverlay.includes('Distritos')}
                                               onClick={() => handleOverlayChange('Distritos')}
                                               className="me-4"
                                        />
                                        <label className="me-2">Barrios</label>
                                        <input type="checkbox"
                                               checked={activateOverlay.includes('Barrios')}
                                               onClick={() => handleOverlayChange('Barrios')}
                                               className="me-4"
                                        />
                                    </>
                                }
                                {estacionamientos.length < 500 && !filtro.zonas.activo &&
                                    <>
                                        <label className="me-2">Estacionamientos</label>
                                        <input type="checkbox"
                                               checked={activateOverlay.includes('Estacionamientos')}
                                               onClick={() => handleOverlayChange('Estacionamientos')}
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
                                    {distritos.length > 2 && activateOverlay.includes('Distritos') && (filtro.zonas.activo === false || filtro === initialFilter) && distritos.map((distrito, index) => (
                                        <Polygon    key={index} 
                                                    ref={(el) => polygonDistritoRefs.current[index] = el}
                                                    eventHandlers={{
                                                        mouseout: (event) => handleMouseOut(event, color),
                                                        mouseover: (event) => handleMouseOver(event, distrito),
                                                        click: () => handleClick(index, distrito, 'distrito')
                                                    }}
                                                    pathOptions={{ color: color === 'Verde' ? 'green' :
                                                                        color === 'Azul' ? 'blue' :
                                                                        color === 'Naranja' ? 'orange' :
                                                                        color === 'Rojo' ? 'red' :
                                                                        color === 'Amarillo' ? 'yellow' :
                                                                        color === 'Negro' ? 'black' :
                                                                        color === 'Morado' ? 'purple' : '#017FC3'}} 
                                                    positions={distrito.delimitaciones}
                                        >
                                            <Popup>
                                                <button className="btn"
                                                        onClick={() => {
                                                            setEstacionamientosPrev(estacionamientos)
                                                            setZonaSeleccionada(null)
                                                            setZonaClickeada(false)
                                                            dispatch(asignarEstacionamientos({ estacionamientos: distrito, tipo: 'distrito', nombre: distrito.nombre}))
                                                        }}
                                                >Ver estacionamientos de este distrito</button>
                                            </Popup>
                                        </Polygon>
                                    ))} 
                                    {barrios.length > 0 && activateOverlay.includes('Barrios') && (filtro.zonas.activo === false || filtro === initialFilter) && barrios.map((barrio, index) => (
                                        <Polygon    key={index} 
                                                    ref={(el) => polygonBarrioRefs.current[index] = el}
                                                    eventHandlers={{
                                                        mouseout: (event) => handleMouseOut(event, color),
                                                        mouseover: (event) => handleMouseOver(event, barrio),
                                                        click: () => handleClick(index, barrio, 'barrio')
                                                    }}
                                                    pathOptions={{ color: color === 'Verde' ? 'green' :
                                                                        color === 'Azul' ? 'blue' :
                                                                        color === 'Naranja' ? 'orange' :
                                                                        color === 'Rojo' ? 'red' :
                                                                        color === 'Amarillo' ? 'yellow' :
                                                                        color === 'Negro' ? 'black' :
                                                                        color === 'Morado' ? 'purple' : '#017FC3'}} 
                                                    positions={barrio.delimitaciones}
                                        >
                                            <Popup>
                                                <button className="btn"
                                                        onClick={() => {
                                                            setEstacionamientosPrev(estacionamientos)
                                                            setZonaSeleccionada(null)
                                                            setZonaClickeada(false)
                                                            dispatch(asignarEstacionamientos({ estacionamientos: barrio.estacionamientos, tipo: 'barrio', nombre: barrio.nombre }))
                                                        }}
                                                >Ver estacionamientos de este barrio</button>
                                            </Popup>
                                        </Polygon>
                                    ))}
                                    {estacionamientos && estacionamientos.length > 0 && (activateOverlay.includes('Estacionamientos') || filtro.zonas.activo) && estacionamientos.map((estacionamiento, index) => (
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
                
            </div>
            <div className="col-xl-5 col-lg-12 mt-5">
                <FormEstacionamientos handleFilter={handleFilter} />
            </div>
        </div>
    )
}

export default MapEstacionamientos