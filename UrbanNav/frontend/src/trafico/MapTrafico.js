import axios from 'axios'
import { MapContainer, TileLayer, Marker, Polygon, Popup, LayersControl, LayerGroup } from 'react-leaflet' 
import { useState, useEffect } from 'react'
import { iconos } from '../markerIcons'
import LegendTrafico from "./LegendTrafico"
import FormFlujo from '../charts/FormFlujo'
import { useModal } from '../modal/useModal'
import Modal from '../modal/Modal'
import { URIsTrafico } from './URIsTrafico'
import { DisplayPosition } from '../MapFunctions'
import { useSelector } from 'react-redux'
import { Button, Offcanvas, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import FormTrafico from './FormTrafico'

const MapTrafico = ({ activatedOverlay,
                      setActivatedOverlay,
                      selectedBar, 
                      setSelectedBar,
                      showBarChart, 
                      setShowBarChart, 
                      handleFilter
                    }) => {

    const estaciones = useSelector(state => state.trafico.dataTrafico.estaciones)
    const distritos = useSelector(state => state.trafico.dataTrafico.distritos)
    const barrios = useSelector(state => state.trafico.dataTrafico.barrios)
    const media = useSelector(state => state.trafico.dataTrafico.media)    

    const filtro = useSelector(state => state.trafico.filtro)
    const [showForm, setShowForm] = useState(false)
    const handleClose = () => setShowForm(false);
    const handleShow = () => setShowForm(true);

    //Icono Chart
    const [icon, setIcon] = useState('bi bi-bar-chart')

    //Centrar Mapa (Display Position)
    const [map, setMap] = useState(null)
    
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
            var filtrado = aux.filter(el => el !== selectedOverlay && el !== '')
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
    

    //Filtro aplicado
    const [filtroAplicado, setFiltroAplicado] = useState([])
    useEffect(() => {
        setFiltroAplicado(filtroString(filtro))
    }, [])

    const filtroString = (filtro) => {
        let resultado = []
        for(let key in filtro) {
            if(filtro[key] && key !== 'filtrado' && key !== 'error' && !key.includes('hora') && !key.includes('fecha')) {
                let valor
                let clave
                if(key === 'sentido') {
                    clave = 'sentido: '
                    //console.log(filtro[key])
                    if(filtro[key] === 'Norte-Sur') {
                        valor = 'Norte - Sur'
                    } else if(filtro[key] === 'Sur-Norte') {
                        valor = 'Sur - Norte'
                    } else if(filtro[key] === 'Este-Oeste') {
                        valor = 'Este - Oeste'
                    } else {
                        valor = 'Oeste - Este'
                    }
                } else if(key === 'getAll') {
                    clave = 'Mostrando todo el trafico'
                    valor = '  '
                } else {
                    clave = key + ': '
                    valor = filtro[key]
                }
                resultado.push(clave + valor)
            }
        }

        if (filtro.fecha1 !== '' && filtro.fecha2 !== '') {
            if (filtro.fecha1 === filtro.fecha2) {
                resultado.push(`Fecha: ${filtro.fecha1}`)
            } else {
                resultado.push(`Fecha: desde el ${filtro.fecha1} hasta el ${filtro.fecha2}`)
            }
        } else if (filtro.fecha1 !== '') {
            resultado.push(`Fecha: desde el ${filtro.fecha1}`)

        } else if (filtro.fecha2 !== '') {
            resultado.push(`Fecha: hasta el ${filtro.fecha2}`)

        }
        

        if (filtro.hora1 !== '' && filtro.hora2 !== '') {
            if (filtro.hora1 === filtro.hora2) {
                resultado.push(`Hora: ${filtro.hora1}`)
            } else {
                resultado.push(`Hora: desde ${filtro.hora1} hasta ${filtro.hora2}`)
            }
        } else if (filtro.hora1 !== '') {
            resultado.push(`Hora: desde ${filtro.hora1}`)

        } else if (filtro.hora2 !== '') {
            resultado.push(`Hora: hasta ${filtro.hora2}`)

        }

        return resultado
    }

    const popover = (
        <Popover id='popover'>
            <Popover.Header as="h4">Filtro aplicado</Popover.Header>
            <Popover.Body className='popover-body'>
            {filtroAplicado.map((el, index) => (
                <p key={index}>{el}</p>
            ))}
            </Popover.Body>
        </Popover>
    );

    return(
        <div className='container'>
            <div className='row'>
                <div className='col-md-12 col-lg-3'>
                    {showBarChart ?
                        <button className='btn btn-azul m-3'
                                onClick={() => {
                                    setSelectedBar(null)
                                    setShowBarChart(false)
                                }}
                        >
                            Ocultar grafica
                        </button>
                    : (activatedOverlay.split(' ').includes('Distritos') || activatedOverlay.split(' ').includes('Barrios')) &&
                        <button className='btn mt-3'
                                onMouseEnter={() => setIcon('bi bi-bar-chart-fill')}
                                onMouseLeave={() => setIcon('bi bi-bar-chart')}
                                onClick={() => setShowBarChart(true)}
                        >
                            <i className={icon}></i>
                        </button>
                  
                    }
                    {/* FILTRO */}
                    {!showForm && !showBarChart &&
                        <button className='btn' onClick={handleShow}>
                            <i class="bi bi-filter"></i>
                        </button>
                    }
                    {
                        <Offcanvas show={showForm} onHide={handleClose} style={{ width: '700px' }} className="canvas">
                            <Offcanvas.Body>
                                <FormTrafico handleFilter={handleFilter}
                                            handleClose={handleClose}
                                />
                            </Offcanvas.Body>
                        </Offcanvas>
                    }
                    <hr></hr>
                    <div className='row'>
                        {!showForm && 
                            <>
                                <h5>Trafico Medio {media}</h5>
                                {filtro.filtrado &&
                                    <div className='row'>
                                        <OverlayTrigger
                                            placement='auto'
                                            trigger='click'
                                            overlay={popover}
                                        >
                                            <button className='btn'>Mostrar Filtrado</button>
                                        </OverlayTrigger>
                                    </div>

                                }
                            </>
                        }
                    </div>
                    <hr></hr>
                    <div className='row'>
                        <LegendTrafico zonaSeleccionada={zonaSeleccionada}/>
                    </div>
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
                                            {selectedBar !== null && selectedBar.estacion === estacion.estacion && (
                                                <Popup position={[estacion.lat, estacion.lon]}>
                                                    <p>{selectedBar.nombre}</p>
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
                                                           info={{ data: 'Trafico', entidad: estacion, tipo: 'estacion', idx: estacion.estacion }}
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
                                        {selectedBar !== null && (selectedBar.codigo+1000) === (distrito.codigo+1000) && (
                                            <Popup position={distrito.centro}>
                                                <p>{selectedBar.nombre}</p>
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
                                                       info={{data: 'Trafico', entidad: distrito, tipo: 'trafico distrito', idx: (distrito.codigo+1000)}}
                                                >
                                                    <p style={{ fontWeight: 'bold' }}>
                                                        Nombre: {distrito.nombre} <br/>
                                                        Codigo: {distrito.codigo} <br/>
                                                        Trafico medio: {distrito.media}
                                                    </p>
                                                </Modal>
                                            </Popup>
                                        </Polygon>
                                    </>
                                ))} 
                                {activatedOverlay.includes('Barrios') && barrios && barrios.length > 0 && barrios.map((barrio) => (
                                    <>
                                        {selectedBar !== null && selectedBar.id === barrio.id && (
                                            <Popup position={barrio.centro}>
                                                <p>{selectedBar.nombre}</p>
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
                                                       info={{data: 'Trafico', aforo: barrio, tipo: 'barrio', idx: barrio.id}}
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