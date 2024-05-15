import axios from 'axios'
import { MapContainer, TileLayer, Marker, Polygon, Popup, LayersControl, LayerGroup } from 'react-leaflet' 
import { useState, useEffect } from 'react'
import { iconos } from '../markerIcons'
import LegendTrafico from "./LegendTrafico"
import FormFlujo from './FormFlujo'
import { useModal } from '../modal/useModal'
import Modal from '../modal/Modal'
import { URIsTrafico } from './URIsTrafico'
import { DisplayPosition } from '../MapFunctions'


const MapTrafico = ({ activatedOverlay,
                      setActivatedOverlay,
                      selectedBar, 
                      setSelectedBar,
                      showBarChart, 
                      setShowBarChart, 
                      setLoading, 
                      estaciones, 
                      media, 
                      distritos, 
                      barrios 
                    }) => {

    //Centrar Mapa (Display Position)
    const [map, setMap] = useState(null)

    //BarChart 
    //Uso esta variable de estado para mostrar en el mapa la zona seleccionada en el BarChart
    const [barSelected, setBarSelected] = useState(selectedBar)
    useEffect(() => {
        if(selectedBar !== null && JSON.stringify(selectedBar) !== '{}') {
            console.log('selectedBar payload = ' + JSON.stringify(selectedBar.activePayload[0].payload))
            setBarSelected(selectedBar.activePayload[0].payload)
        }
    }, [selectedBar])
    
    useEffect(() => {
        if(distritos.length === 0) {
            setActivatedOverlay('Estaciones')
        } else {
            setActivatedOverlay('Distritos')
        }
    }, [distritos])

    const handleOverlayChange = (selectedOverlay) => {
        var aux = activatedOverlay.split(' ')
        if(activatedOverlay.includes(selectedOverlay)) {     //Desactivo checkbox
            var filtrado = aux.filter(el => el !== selectedOverlay)
            setActivatedOverlay(filtrado.length > 0 ? filtrado[0] : '')
        } else {  //Activamos el checkbox selectedOverlay
            
            if(selectedOverlay === 'Estaciones') {  //Si selected es Estaciones no tengo que desactivar ningun checkbox
                setActivatedOverlay(activatedOverlay + ' ' + selectedOverlay)
            } else {    //En caso de que haya algun checkbox activado que no sea Estaciones lo desactivo
            var filtrado = aux.filter(el => el === 'Estaciones')
            var filtradoString = filtrado.length > 0 ? `${filtrado[0]}` : ''
            setActivatedOverlay(filtradoString + ' ' + selectedOverlay)
            }
        }
    };

    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    //ZONA SELECCIONADA
    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
    const [zonaClickeada, setZonaClickeada] = useState(false)
    const [eventZonaPrevia, setEventZonaPrevia] = useState(null)

    const handleClick = (event, zona, index) => {
        const newColor = zona.media > (media + (media*0.5)) ? '#CB2B3E' :   //Rojo - Alta
                         zona.media < (media - (media*0.5)) ? '#2A81CB' :   //Azul - Baja
                         '#FFD326'  //Amarilla - Media

        if(zonaClickeada) {
            //Restablecer el color de la zona anterior
            eventZonaPrevia.event.target.setStyle({ fillColor: eventZonaPrevia.color })

            if(index !== eventZonaPrevia.index) {   //Se ha seleccionado una zona nueva
                event.target.setStyle({ fillColor: 'rgba(4, 4, 252, 0)' })            
                setEventZonaPrevia({ event: event, index: index, color: newColor })
                setZonaSeleccionada(zona)
                setZonaClickeada(true)
            } else {    //Se ha deseleccionado una zona
                setEventZonaPrevia(null)
                setZonaSeleccionada(null)
                setZonaClickeada(false)
            }
        } else {
            event.target.setStyle({ fillColor: 'rgba(4, 4, 252, 0)' })            
            setEventZonaPrevia({ event: event, color: newColor, index: index })
            setZonaSeleccionada(zona)
            setZonaClickeada(true)
        }
    }

    const handleMouseOut = (event, zona) => {
        if(!zonaClickeada) {
            const fillColor = zona.media < (media - (media*0.5)) ? '#2A81CB' : zona.media > (media + (media*0.5)) ? '#CB2B3E' : '#FFD326'
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

    //FORM + FLUJO
    const [showForm, setShowForm] = useState(false)
    

    return(
        <div className='container'>
            <div className='row'>
                <div className='col-md-12 col-lg-3'>
                    <div className='row'>
                        <LegendTrafico zonaSeleccionada={zonaSeleccionada}/>
                    </div>
                    {showBarChart ?
                        <button className='btn btn-azul'
                                onClick={() => {
                                    setBarSelected(null)
                                    setSelectedBar(null)
                                    setShowBarChart(false)
                                }}
                        >
                            Mostrar filtro
                        </button>
                    : (activatedOverlay.split(' ').includes('Distritos') || activatedOverlay.split(' ').includes('Barrios')) &&
                        <button className='btn btn-morado'
                                onClick={() => setShowBarChart(true)}
                        >
                            Mostrar grafica de zonas más concurridas
                        </button>
                    }
                </div>
                <div className='col-md-12 col-lg-9'>
                    <div className='card m-3'>
                        <div className='card-body'>
                            {map ? <DisplayPosition map={map} /> : null}
                            <label className='me-2'>Mostrar distritos</label>
                            <input type='checkbox'
                                   className='me-4'
                                   checked={activatedOverlay.includes('Distritos')}
                                   onClick={() => handleOverlayChange('Distritos')}  
                                   disabled={showBarChart === true}     
                            />
                            <label className='me-2'>Mostrar barrios</label>
                            <input type='checkbox'
                                   className='me-4'
                                   checked={activatedOverlay.includes('Barrios')}
                                   onClick={() => handleOverlayChange('Barrios')}  
                                   disabled={showBarChart === true}     
                            />
                            <label className='me-2'>Mostrar estaciones</label>
                            <input type='checkbox'
                                checked={activatedOverlay.includes('Estaciones')}
                                onClick={() => handleOverlayChange('Estaciones')}         
                            />
                            
                            <MapContainer center={[40.41688189428294, -3.703318510771146]} 
                                          zoom={11} 
                                          style={{ height: '400px', width: '100%', borderRadius: '10px' }}
                                          className='shadow'
                                          ref={setMap}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />  
                                {activatedOverlay.includes('Estaciones') && estaciones && estaciones.length > 0 && estaciones.map((estacion) => {
                                    var estacionOtra = estaciones.find(el => el.estacion === estacion.estacion && el.sentido !== estacion.sentido);
                                    return(
                                        <>
                                            {barSelected !== null && barSelected.estacion === estacion.estacion && (
                                                <Popup position={[estacion.lat, estacion.lon]}>
                                                    <p>{barSelected.nombre}</p>
                                                </Popup>
                                            )}
                                            <Marker key={estacion.estacion} 
                                                    position={[estacion.lat, estacion.lon]}
                                                    icon={
                                                        estacion.media > (media + (media*0.5)) ? iconos.rojo :
                                                        estacion.media < (media - (media*0.5)) ? iconos.azul :
                                                        iconos.amarillo
                                                    }
                                                    eventHandlers={{
                                                        click: () => {
                                                            setBarSelected(null)
                                                            setSelectedBar(null)
                                                        }
                                                    }}
                                            >
                                                <Popup>
                                                    <button onClick={() => openModal(estacion.estacion)}
                                                        className='btn'
                                                    >   
                                                        Ver más información
                                                    </button>
                                                    <Modal isOpen={isOpenModal} 
                                                           closeModal={closeModal} 
                                                           info={{ data: 'Trafico', setLoading, aforo: estacion, tipo: 'estacion', idx: estacion.estacion }}
                                                    >
                                                        <p style={{ fontWeight: 'bold' }}>
                                                            Nombre: {estacion.nombre} <br/>
                                                            Estacion: {estacion.estacion} <br/>
                                                            {estacionOtra && <hr/>}
                                                            Sentido: {estacion.sentido} <br/>
                                                            Trafico medio: {estacion.media} 
                                                            {estacionOtra &&(
                                                                <>
                                                                    <hr/>
                                                                    Sentido: {estacionOtra.sentido} <br/>
                                                                    Trafico medio: {estacionOtra.media}
                                                                </>
                                                            )}
                                                        </p>
                                                    </Modal>
                                                </Popup>
                                            </Marker>
                                        </>
                                    )
                                })}
                                {activatedOverlay.includes('Distritos') && distritos && distritos.length > 0 && distritos.map((distrito) => (
                                    <>
                                        {/* Le sumo 1000 al codigo del distrito para que no coincida con los numeros de las estaciones 
                                            a la hora de abrir el ModalWindow */}
                                        {barSelected !== null && (barSelected.codigo+1000) === (distrito.codigo+1000) && (
                                            <Popup position={distrito.centro}>
                                                <p>{barSelected.nombre}</p>
                                            </Popup>
                                        )}
                                        <Polygon key={distrito.codigo+1000}
                                                eventHandlers={{
                                                    mouseout: (event) => handleMouseOut(event, distrito),
                                                    mouseover: (event) => handleMouseOver(event, distrito),
                                                    click: (event) => handleClick(event, distrito, distrito.codigo)
                                                }}        
                                                pathOptions={{
                                                    color: distrito.media > (media + (media*0.5)) ? '#CB2B3E' :   //Rojo - Alta
                                                        distrito.media < (media - (media*0.5)) ? '#2A81CB' :   //Azul - Baja
                                                        '#FFD326'                                            //Amarillo - Media
                                                }}
                                                positions={distrito.delimitaciones}
                                        >
                                            <Popup>
                                                <button onClick={() => openModal(distrito.codigo+1000)}
                                                        className='btn'
                                                >   
                                                    Ver más información
                                                </button>
                                                <Modal isOpen={isOpenModal} 
                                                       closeModal={closeModal} 
                                                       info={{data: 'Trafico', setLoading, entidad: distrito, tipo: 'trafico distrito', idx: (distrito.codigo+1000)}}
                                                >
                                                    <p style={{ fontWeight: 'bold' }}>
                                                        Nombre: {distrito.nombre} <br/>
                                                        Codigo: {distrito.estacion} <br/>
                                                        Trafico medio: {distrito.media}
                                                    </p>
                                                </Modal>
                                            </Popup>
                                        </Polygon>
                                    </>
                                ))} 
                                {activatedOverlay.includes('Barrios') && barrios && barrios.length > 0 && barrios.map((barrio) => (
                                    <>
                                        {barSelected !== null && barSelected.id === barrio.id && (
                                            <Popup position={barrio.centro}>
                                                <p>{barSelected.nombre}</p>
                                            </Popup>
                                        )}
                                        <Polygon key={barrio.id}
                                                eventHandlers={{
                                                    mouseout: (event) => handleMouseOut(event, barrio),
                                                    mouseover: (event) => handleMouseOver(event, barrio),
                                                    click: (event) => handleClick(event, barrio, barrio.id)
                                                }}        
                                                pathOptions={{
                                                    color:  barrio.media > (media + (media*0.5)) ? '#CB2B3E' :   //Rojo - Alta
                                                            barrio.media < (media - (media*0.5)) ? '#2A81CB' :   //Azul - Baja
                                                            '#FFD326'                                            //Amarillo - Media
                                                }}
                                                positions={barrio.delimitaciones}
                                        >
                                            <Popup>
                                                <button onClick={() => openModal(barrio.id)}
                                                    className='btn'
                                                >   
                                                    Ver más información
                                                </button>
                                                <Modal isOpen={isOpenModal} 
                                                       closeModal={closeModal} 
                                                       info={{data: 'Trafico', setLoading, aforo: barrio, tipo: 'barrio', idx: barrio.id}}
                                                >
                                                    <p style={{ fontWeight: 'bold' }}>
                                                        Nombre: {barrio.nombre} <br/>
                                                        Trafico medio: {barrio.media}
                                                    </p>
                                                </Modal>
                                            </Popup>
                                        </Polygon>
                                    </>
                                ))

                                }                          
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapTrafico