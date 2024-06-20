import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Offcanvas, OverlayTrigger, Popover } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import { initialFilter, asignarAccidentes } from '../features/accidente/dataAccidenteSlice.js';
import { DisplayPosition, zoom, center, DraggableMarker } from '../MapFunctions.js';
import LegendAccidentes from './LegendAccidentes.js';
import FormAccidentes from './FormAccidentes.js';
import Modal from '../modal/Modal.js';
import { useModal } from '../modal/useModal.js';

const fillBlueOptions = { fillColor: 'blue' }

const MapAccidentes = ({handleFilter,
                        obtenerDatosGrafica,
                        zonaSeleccionada,
                        setZonaSeleccionada,
                        agrupacion,
                        agrupacionPie,
                        zonaClickeada,
                        setZonaClickeada
                    }) => {

    const accidentes = useSelector(state => state.accidentes.dataAccidentes.accidentes)
    const distritos = useSelector(state => state.accidentes.dataAccidentes.distritos)
    const riesgoDistrito = useSelector(state => state.accidentes.dataAccidentes.riesgoDistrito)
    const barrios = useSelector(state => state.accidentes.dataAccidentes.barrios)
    const riesgoBarrio = useSelector(state => state.accidentes.dataAccidentes.riesgoBarrio)
    const dispatch = useDispatch()

    //Filtro
    const filtro = useSelector(state => state.accidentes.filtro)
    const [filtroAplicado, setFiltroAplicado] = useState([])
    useEffect(() => {
        setFiltroAplicado(filtroString(filtro))
    }, [filtro])

    const [showForm, setShowForm] = useState(false)
    const handleClose = () => setShowForm(false);
    const handleShow = () => setShowForm(true);
    
    //Mostrar filtro usado
    const filtroString = (filtro) => {
        let resultado = []
        for(let key in filtro) {
            if(filtro[key] && key !== 'filtrado' && key !== '' && key !== 'error' && 
                !key.includes('fecha') && !key.includes('hora') && !key.includes('edad')) {

                let valor
                let clave
                if (filtro[key] === '1') {
                    clave = key + ': '
                    valor = 'positivo'
                } else if (filtro[key] === '0') {
                    clave = key + ': '
                    valor = 'negativo'
                } else if (key === 'radio' && filtro[key].activo) {
                    clave = 'radio de '
                    valor = `${filtro[key].distancia} metros`
                } else if (key === 'zonas' && filtro[key].activo === true) {
                    clave = `${filtro[key].tipo} `
                    valor = `${filtro[key].nombre}`
                } else if (key !== 'zonas' && key !== 'radio') {
                    clave = key + ': '
                    valor = filtro[key] + ''
                } else {
                    clave = ''
                    valor = ''
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

        if (filtro.edad1 !== '' && filtro.edad2 !== '') {
            if (filtro.edad1 === filtro.edad2) {
                resultado.push(`Edad: ${filtro.edad1} años`)
            } else {
                resultado.push(`Edad: entre ${filtro.edad1} y ${filtro.edad2} años`)
            }
        } else if (filtro.edad1 !== '') {  
            resultado.push(`Edad: más de ${filtro.edad1} años`)
        } else if (filtro.edad2 !== '') {
            resultado.push(`Edad: menos de ${filtro.edad2} años`)
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

    //Centrar Mapa (Display Position)
    const [map, setMap] = useState(null)

    //Marker Position (Radio) | Draggable Marker
    const [markerPosition, setMarkerPosition] = useState(filtro.radio.recordar ? filtro.radio.posicion : center)


    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    //Accidentes de una zona
    const [accidentesPrev, setAccidentesPrev] = useState([])

    //ZONA SELECCIONADA (INFO EN LA LEYENDA)
    
    const [eventZonaPrevia, setEventZonaPrevia] = useState(null)

    const handleClick = (event, zona, riesgo) => {

        if(eventZonaPrevia !== null) {
            eventZonaPrevia.event.target.setStyle({ fillColor: eventZonaPrevia.color })
        }
        
        if (zonaSeleccionada !== null && zona.id === zonaSeleccionada.id && zonaClickeada) {
            setZonaClickeada(false)
            setZonaSeleccionada(null)

            setEventZonaPrevia(null)

            obtenerDatosGrafica(agrupacion, 'Bar', null)
            obtenerDatosGrafica(agrupacionPie, 'Pie', null)
        } else {
            setZonaClickeada(true)
            const fillColor = zona.riesgo < (riesgo - riesgo*0.5) || riesgo === 0 || !zona.n_accidentes ? ' #2A81CB' : zona.riesgo < riesgo ? '#FFD326' : zona.riesgo < (riesgo + riesgo*0.5) ? '#CB8427' : '#CB2B3E'
            event.target.setStyle({ fillColor: 'rgba(4, 4, 252, 0)' })

            setEventZonaPrevia({ event: event, color: fillColor })
            setZonaSeleccionada(zona)

            obtenerDatosGrafica(agrupacion, 'Bar', zona)
            obtenerDatosGrafica(agrupacionPie, 'Pie', zona)

        }

    }

    const handleMouseOut = (event, zona, riesgo) => {
        if(!zonaClickeada) {
            const fillColor = zona.riesgo < (riesgo - riesgo*0.5) || riesgo === 0 || !zona.n_accidentes ? ' #2A81CB' : zona.riesgo < riesgo ? '#FFD326' : zona.riesgo < (riesgo + riesgo*0.5) ? '#CB8427' : '#CB2B3E'
            event.target.setStyle({ fillColor: fillColor });
            setZonaSeleccionada(null)
        }
    }

    const handleMouseOver = (event, zona, riesgo) => {
        if(!zonaClickeada) {
            const fillColor = zona.riesgo < (riesgo - riesgo*0.5) ? 'rgba(4, 4, 252, 0)' : zona.riesgo < riesgo ? 'rgba(252, 184, 4, 0)' : zona.riesgo < (riesgo + riesgo*0.5) ? 'rgba(252, 105, 4, 0)' : 'rgba(255, 0, 0, 0)'
            event.target.setStyle({ fillColor: fillColor })
            setZonaSeleccionada(zona)
        }
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
        var aux = activateOverlay.split(' ')
        if(activateOverlay.includes(selectedOverlay)) {     //Desactivo checkbox
            var filtrado = aux.filter(el => el !== selectedOverlay && el !== '')
            setActivateOverlay(filtrado.length > 0 ? filtrado[0] : '')
        } else {  //Activamos el checkbox selectedOverlay
            
            if(selectedOverlay === 'Accidentes') {  //Si selected es Accidentes no tengo que desactivar ningun checkbox
                setActivateOverlay(activateOverlay + ' ' + selectedOverlay)
            } else {    //En caso de que haya algun checkbox activado que no sea Accidentes lo desactivo
            var filtrado = aux.filter(el => el === 'Accidentes')
            var filtradoString = filtrado.length > 0 ? `${filtrado[0]}` : ''
            setActivateOverlay(filtradoString + ' ' + selectedOverlay)
            }
        }    
    };

    return(
        <> 
            <div className='row'>
                {showForm && 
                    <div className='col-md-12 col-lg-3 mt-3'>
                        <h3>Accidentes: {accidentes.length}</h3>
                        {/*LEYENDA*/}
                        {activateOverlay === 'Distritos' ?
                            <LegendAccidentes zonaSelected={zonaSeleccionada}
                                            riesgoMedio={riesgoDistrito}
                            /> 
                            :
                            activateOverlay === 'Barrios' ?
                            <LegendAccidentes zonaSelected={zonaSeleccionada}
                                            riesgoMedio={riesgoBarrio}
                            />
                            : <></>}
                    </div>
                }
                <div className='col-md-12 col-lg-9'>
                    {/*MAPA + MARKER + POLYGON*/}
                    <div className='card m-3'>
                        <div className='card-body'>
                            { map ? <DisplayPosition map={map} /> : null }
                            {filtro.zonas.activo &&
                            <button className='btn btn-azul mb-3'
                                    onClick={() => {
                                        dispatch(asignarAccidentes({ accidentes: accidentesPrev, tipo: 'previos', nombre: '' }))
                                    }}
                            >
                                Volver a mostrar {filtro.zonas.tipo}s
                            </button>
                            }
                            {distritos.length > 0 && barrios.length > 0 && !filtro.zonas.activo &&
                                <>
                                    <label className="me-2" htmlFor="distrito">Distritos</label>
                                    <input
                                        type="checkbox"
                                        id="distrito"
                                        className="me-4"
                                        checked={activateOverlay.includes("Distritos")}
                                        onChange={() => handleOverlayChange('Distritos')}
                                    />
                              
                                    <label className="me-2" htmlFor="barrio">Barrios</label>
                                    <input
                                        type="checkbox"
                                        id="barrio"
                                        className="me-4"
                                        checked={activateOverlay.includes("Barrios")}
                                        onChange={() => handleOverlayChange('Barrios')}
                                    />

                                    {accidentes.length < 500 &&
                                    <>
                                        <label className="me-2" htmlFor="accidentes">Accidentes</label>
                                        <input
                                            type="checkbox"
                                            id="accidentes"
                                            className="me-4"
                                            checked={activateOverlay.includes("Accidentes")}
                                            onChange={() => handleOverlayChange('Accidentes')}
                                        />
                                    </>
                                    }
                              </>
                              
                            }
                            <MapContainer center={center} 
                                            zoom={zoom} 
                                            style={{ height: '400px', width: '100%', borderRadius: '10px' }} 
                                            ref={setMap}
                                            className='shadow'
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {distritos !== undefined && distritos.length > 0 && activateOverlay.includes('Distritos') && !filtro.zonas.activo && distritos.map((distrito, index) => (
                                    <Polygon key={distrito.id}
                                            eventHandlers={{
                                                mouseout: (event) => handleMouseOut(event, distrito, riesgoDistrito),
                                                mouseover: (event) => handleMouseOver(event, distrito, riesgoDistrito),
                                                click: (event) => handleClick(event, distrito, riesgoDistrito)
                                            }}
                                            pathOptions={{
                                                color: distrito.riesgo < (riesgoDistrito - riesgoDistrito*0.5) || distrito.riesgo === 0 ? '#2A81CB' : 
                                                       distrito.riesgo < riesgoDistrito ? '#FFD326' : 
                                                       distrito.riesgo < (riesgoDistrito + riesgoDistrito*0.5) ? '#CB8427' : 
                                                       '#CB2B3E' 
                                            }}
                                            positions={distrito.delimitaciones}
                                    >
                                        <Popup>
                                            {distrito.n_accidentes < 100 &&
                                                <button className='btn btn-hover'
                                                        onClick={() => {
                                                            setAccidentesPrev(accidentes)
                                                            setZonaClickeada(null)
                                                            dispatch(asignarAccidentes({ accidentes: distrito, tipo: 'distrito', nombre: distrito.nombre }))
                                                    }}
                                                >
                                                    Ver accidentes de este distrito
                                                </button>
                                            }
                                            <button onClick={() => openModal(distrito.id)}
                                                    className='btn btn-hover'
                                            >
                                                Ver más información
                                            </button>
                                            <Modal isOpen={isOpenModal}
                                                   closeModal={closeModal}
                                                   info={{ data: 'Accidentes', entidad: distrito, tipo: 'accidente distrito', idx: (distrito.id) }}
                                            >
                                                <p style={{ fontWeight: 'bold' }}>
                                                    Nombre: {distrito.nombre} <br/>
                                                    Lesividad media: {distrito.lesividad_media} <br/>
                                                    Riesgo: {distrito.riesgo} <br/>
                                                    {distrito.n_accidentes} accidentes
                                                </p>
                                            </Modal>
                                        </Popup>
                                    </Polygon>
                                ))}
                                {barrios !== undefined && barrios.length > 0 && activateOverlay.includes('Barrios') && !filtro.zonas.activo && barrios.map((barrio, index) => (
                                    <Polygon key={index}
                                            eventHandlers={{
                                                mouseout: (event) => handleMouseOut(event, barrio, riesgoBarrio),
                                                mouseover: (event) => handleMouseOver(event, barrio, riesgoBarrio),
                                                click: (event) => handleClick(event, barrio, riesgoBarrio)
                                            }}
                                            pathOptions={{
                                                color: barrio.riesgo < (riesgoBarrio - riesgoBarrio*0.5) || !barrio.n_accidentes ? '#2A81CB' : 
                                                    barrio.riesgo < riesgoBarrio ? '#FFD326' : 
                                                    barrio.riesgo < (riesgoBarrio + riesgoBarrio*0.5) ? '#CB8427' : 
                                                    '#CB2B3E' 
                                            }}
                                            positions={barrio.delimitaciones}
                                    >
                                        <Popup>
                                            {barrio.accidentes && barrio.accidentes.length < 100 &&
                                                <button className='btn'
                                                        onClick={() => {
                                                            setAccidentesPrev(accidentes)
                                                            setZonaClickeada(null)
                                                            dispatch(asignarAccidentes({ accidentes: barrio.accidentes, tipo: 'barrio', nombre: barrio.nombre }))
                                                    }}
                                                >
                                                    Ver accidentes de este barrio
                                                </button>
                                            }
                                            <button onClick={() => openModal(barrio.id)}
                                                    className='btn btn-hover'
                                            >
                                                Ver más información
                                            </button>
                                            <Modal isOpen={isOpenModal}
                                                   closeModal={closeModal}
                                                   info={{ data: 'Accidentes', entidad: barrio, tipo: 'accidente barrio', idx: (barrio.id) }}
                                            >
                                                <p style={{ fontWeight: 'bold' }}>
                                                    Nombre: {barrio.nombre} <br/>
                                                    {barrio.lesividad_media &&
                                                    <>
                                                        Lesividad media: {barrio.lesividad_media} <br/>
                                                        Riesgo: {barrio.riesgo} <br/>
                                                        {barrio.n_accidentes} accidentes
                                                    </>
                                                    }
                                                </p>
                                            </Modal>
                                        </Popup>
                                    </Polygon>
                                ))}
                                {accidentes !== undefined && accidentes.length > 0 && (activateOverlay.includes('Accidentes') || filtro.zonas.activo) && accidentes.map((accidente, index) => {
                                    var otros = accidentes.filter(el => el.lat === accidente.lat && el.lon === accidente.lon && el.fecha === accidente.fecha && el.hora === accidente.hora && el.id !== accidente.id)
                                    return (
                                        <Marker key={index} position={[accidente.lat, accidente.lon]}>
                                            <Popup>
                                                <button onClick={() => openModal(index)}
                                                        className='btn btn-hover'
                                                >
                                                    Ver más información
                                                </button>
                                                <Modal isOpen={isOpenModal} 
                                                    closeModal={closeModal} 
                                                    info={{ data: 'Accidente Marker', tipo: 'accidente', idx: index}}
                                                >
                                                    <p style={{fontWeight: 'bold'}}>
                                                        Fecha: {accidente.fecha} <br/>
                                                        Hora: {accidente.hora} <br/>
                                                        Clima: {accidente.clima.clima} <br/>
                                                        {otros && <hr/>}
                                                        Persona 1 <br/>
                                                        Edad: {accidente.edad} <br/>
                                                        Positivo en drogas: {accidente.drogas ? 'Si' : 'No'} <br/>
                                                        Positivo en alcohol: {accidente.alcohol ? 'Si' : 'No'} <br/>
                                                        Lesion: {[1, 2, 5, 6, 7].includes(accidente.lesividadeCodigo) ? 'Leve' : 
                                                                accidente.lesividadeCodigo === 3 ? 'Grave' : accidente.lesividadeCodigo === 4 ? 'Fallecido' : 
                                                                accidente.lesividadeCodigo === 14 ? 'Sin asistencia sanitaria' : 'Desconocido'} <br/>
                                                        Sexo: {accidente.sexo.sexo} <br/>
                                                        Tipo de accidente: {accidente.tipo_accidente.tipo_accidente} <br/>
                                                        Vehiculo: {accidente.tipo_vehiculo.tipo_vehiculo} <br/>
                                                        {accidente.tipo_persona.tipo_persona} <br/>
                                                        {otros && otros.map((el, index) => (
                                                            <>
                                                                <hr/>
                                                                Persona {index + 2} <br/>
                                                                Edad: {el.edad} <br/>
                                                                Positivo en drogas: {el.drogas ? 'Si' : 'No'} <br/>
                                                                Positivo en alcohol: {el.alcohol ? 'Si' : 'No'} <br/>
                                                                Lesion: {[1, 2, 5, 6, 7].includes(el.lesividadeCodigo) ? 'Leve' : 
                                                                        el.lesividadeCodigo === 3 ? 'Grave' : el.lesividadeCodigo === 4 ? 'Fallecido' : 
                                                                        el.lesividadeCodigo === 14 ? 'Sin asistencia sanitaria' : 'Desconocido'} <br/>
                                                                Sexo: {el.sexo.sexo} <br/>
                                                                Tipo de accidente: {accidente.tipo_accidente.tipo_accidente} <br/>
                                                                Vehiculo: {el.tipo_vehiculo.tipo_vehiculo} <br/>
                                                                {el.tipo_persona.tipo_persona} <br/>
                                                            </>
                                                        ))}
                                                    </p>
                                                </Modal>
                                            </Popup>
                                        </Marker>
                                    )
                                })}
                                
                                { filtro !== initialFilter && filtro.radio && filtro.radio.activo && <Circle center={markerPosition} pathOptions={fillBlueOptions} radius={(filtro.radio.distancia)} /> }

                                { filtro !== initialFilter > 0 && filtro.radio && filtro.radio.activo && <DraggableMarker markerPosition={markerPosition} setMarkerPosition={setMarkerPosition} filtro={filtro} /> }
                                
                            </MapContainer>
                        </div>
                    </div>
                </div>
                <div className='col-md-12 col-lg-3 mt-3'>
                    {/* FILTRO */}
                    {!showForm &&
                        <button className="btn" onClick={handleShow}>
                            <i class="bi bi-filter"></i>
                        </button>
                    }
                    <Offcanvas show={showForm} onHide={handleClose} style={{ width: '650px' }} className="canvas custom-offcanvas">
                        <Offcanvas.Body>
                            <FormAccidentes handleFilter={handleFilter}
                                            handleClose={handleClose}
                            />
                        </Offcanvas.Body>
                    </Offcanvas>
                    {!showForm &&
                        <>
                            <h3>Accidentes: {accidentes.length}</h3>
                            {filtro.filtrado &&
                                <div className='row'>
                                    <OverlayTrigger
                                        placement="bottom"
                                        trigger='click'
                                        overlay={popover}
                                    >
                                        <button className='btn'>Mostrar Filtrado</button>
                                    </OverlayTrigger>
                                </div>
                            }
                            {/*LEYENDA*/}
                            {activateOverlay.includes('Distritos') && !filtro.zonas.activo ?
                                <LegendAccidentes zonaSelected={zonaSeleccionada}
                                                riesgoMedio={riesgoDistrito}
                                /> 
                                :
                                activateOverlay.includes('Barrios') && !filtro.zonas.activo ?
                                <LegendAccidentes zonaSelected={zonaSeleccionada}
                                                riesgoMedio={riesgoBarrio}
                                />
                                : <></>}
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default MapAccidentes