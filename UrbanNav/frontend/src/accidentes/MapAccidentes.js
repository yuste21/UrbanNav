import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, Circle, LayersControl, LayerGroup } from 'react-leaflet';
import { SetViewOnClick, DisplayPosition, DraggableMarker, zoom, center } from '../MapFunctions.js';
import LegendAccidentes from './LegendAccidentes.js';
import Modal from '../modal/Modal.js';
import { useModal } from '../modal/useModal.js';
import { useForm } from './useFormAccidentes.js';

const MapAccidentes = ({distritos, 
                        barrios, 
                        riesgoDistrito,
                        riesgoBarrio, 
                        accidentes, 
                        filtro, 
                        markerPosition, 
                        setMarkerPosition, 
                        handleFilter,
                        obtenerDatosGrafica,
                        zonaSeleccionada,
                        setZonaSeleccionada,
                        setLoading
                    }) => {

    //Centrar Mapa (Display Position)
    const [map, setMap] = useState(null)

    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    //FILTRO INDIVIDUAL
    const [showForm, setShowForm] = useState(false)
    const { 
        form,
        setForm,
        errors,
        response,
        handleChange,
        handleSubmit,
        vaciarFiltro } = useForm(filtro, handleFilter, filtro)


    //ZONA SELECCIONADA (INFO EN LA LEYENDA)
    const [zonaClickeada, setZonaClickeada] = useState(false)
    const [eventZonaPrevia, setEventZonaPrevia] = useState(null)

    const handleClick = (event, zona, riesgo) => {
        
        if(eventZonaPrevia !== null) {
            eventZonaPrevia.event.target.setStyle({ fillColor: eventZonaPrevia.color })
        }

        if(zonaClickeada) {
            setEventZonaPrevia(null)
        } else {
            const fillColor = zona.riesgo < (riesgo - riesgo*0.5) ? ' #2A81CB' : zona.riesgo < riesgo ? '#FFD326' : zona.riesgo < (riesgo + riesgo*0.5) ? '#CB8427' : '#CB2B3E'
            setEventZonaPrevia({ event: event, color: fillColor })
            setZonaSeleccionada(zona)
        }
        if(zonaClickeada) {
            obtenerDatosGrafica('clima.clima', 'DeseleccionadoBar')
            obtenerDatosGrafica('tipo_accidente.tipo_accidente', 'DeseleccionadoPie')
        } else {
            obtenerDatosGrafica('clima.clima', 'Bar')
            obtenerDatosGrafica('tipo_accidente.tipo_accidente', 'Pie')
        }
        setZonaClickeada(!zonaClickeada)
        setShowForm(!showForm)
    }

    const handleMouseOut = (event, zona, riesgo) => {
        if(!zonaClickeada) {
            const fillColor = zona.riesgo < (riesgo - riesgo*0.5) ? ' #2A81CB' : zona.riesgo < riesgo ? '#FFD326' : zona.riesgo < (riesgo + riesgo*0.5) ? '#CB8427' : '#CB2B3E'
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
        setActivateOverlay(activateOverlay === selectedOverlay ? '' : selectedOverlay)
    };


    const fillBlueOptions = { fillColor: 'blue' }

    return(
        <> 
            <div className='row'>
                <div className='col-md-12 col-lg-9'>
                    {/*MAPA + MARKER + POLYGON*/}
                    <div className='card m-3'>
                        <div className='card-body'>
                            { map ? <DisplayPosition map={map} /> : null }
                            {distritos.length > 0 && barrios.length > 0 &&
                                <>
                                    <label className='me-2' htmlFor='distrito'>Mostrar distritos</label>
                                    <input type='checkbox'
                                        id='distrito'
                                        className='me-4'
                                        checked={activateOverlay === 'Distritos'}
                                        onClick={() => handleOverlayChange('Distritos')}       
                                    /> 
                                    <label className='me-2' htmlFor='barrio'>Mostrar barrios</label>
                                    <input type='checkbox'
                                        id='barrio'
                                        checked={activateOverlay === 'Barrios'}
                                        onClick={() => handleOverlayChange('Barrios')}       
                                    />
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
                                {distritos && distritos.length > 0 && activateOverlay === 'Distritos' && distritos.map((distrito, index) => (
                                    <Polygon key={distrito.id}
                                            eventHandlers={{
                                                mouseout: (event) => handleMouseOut(event, distrito, riesgoDistrito),
                                                mouseover: (event) => handleMouseOver(event, distrito, riesgoDistrito),
                                                click: (event) => handleClick(event, distrito, riesgoDistrito)
                                            }}
                                            pathOptions={{
                                                color: distrito.riesgo < (riesgoDistrito - riesgoDistrito*0.5) ? '#2A81CB' : 
                                                    distrito.riesgo < riesgoDistrito ? '#FFD326' : 
                                                    distrito.riesgo < (riesgoDistrito + riesgoDistrito*0.5) ? '#CB8427' : 
                                                    '#CB2B3E' 
                                            }}
                                            positions={distrito.delimitaciones}
                                    >
                                        <Popup>
                                            <button onClick={() => openModal(distrito.id)}
                                                    className='btn'
                                            >
                                                Ver más información
                                            </button>
                                            <Modal isOpen={isOpenModal}
                                                   closeModal={closeModal}
                                                   info={{ data: 'Accidentes', setLoading, entidad: distrito, tipo: 'accidente distrito', idx: (distrito.id) }}
                                            >
                                                <p style={{ fontWeight: 'bold' }}>
                                                    Nombre: {distrito.nombre} <br/>
                                                    Lesividad media: {distrito.lesividad_media} <br/>
                                                    {distrito.n_accidentes} accidentes
                                                </p>
                                            </Modal>
                                        </Popup>
                                    </Polygon>
                                ))}
                                {barrios && barrios.length > 0 && activateOverlay === 'Barrios' && barrios.map((barrio, index) => (
                                    <Polygon key={index}
                                            eventHandlers={{
                                                mouseout: (event) => handleMouseOut(event, barrio, riesgoBarrio),
                                                mouseover: (event) => handleMouseOver(event, barrio, riesgoBarrio),
                                                click: (event) => handleClick(event, barrio, riesgoBarrio)
                                            }}
                                            pathOptions={{
                                                color: barrio.riesgo < (riesgoBarrio - riesgoBarrio*0.5) ? ' #2A81CB' : 
                                                    barrio.riesgo < riesgoBarrio ? '#FFD326' : 
                                                    barrio.riesgo < (riesgoBarrio + riesgoBarrio*0.5) ? '#CB8427' : 
                                                    '#CB2B3E' 
                                            }}
                                            positions={barrio.delimitaciones}
                                    >

                                    </Polygon>
                                ))}
                                {accidentes && accidentes.length > 0 && activateOverlay === 'Markers' && accidentes.map((accidente, index) => {
                                    var otros = accidentes.filter(el => el.lat === accidente.lat && el.lon === accidente.lon && el.fecha === accidente.fecha && el.hora === accidente.hora && el.id !== accidente.id)

                                    return (
                                        <Marker key={index} position={[accidente.lat, accidente.lon]}>
                                            <Popup>
                                                <button onClick={() => openModal(index)}
                                                        className='btn'
                                                >
                                                    Ver más información
                                                </button>
                                                <Modal isOpen={isOpenModal} 
                                                    closeModal={closeModal} 
                                                    info={{ data: 'Accidente', tipo: 'accidente', idx: index}}
                                                >
                                                    <p style={{fontWeight: 'bold'}}>
                                                        Fecha: {accidente.fecha} <br/>
                                                        Hora: {accidente.hora} <br/>
                                                        Clima: {accidente.clima.clima} <br/>
                                                        {otros && <hr/>}
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
                                                        {otros && otros.map((el) => (
                                                            <>
                                                                <hr/>
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
                                
                                { Object.keys(filtro).length > 0 && filtro.radio && filtro.radio.activo && <Circle center={markerPosition} pathOptions={fillBlueOptions} radius={(filtro.radio.distancia)} /> }

                                { Object.keys(filtro).length > 0 && filtro.radio && filtro.radio.activo && <DraggableMarker markerPosition={markerPosition} setMarkerPosition={setMarkerPosition} /> }
                            </MapContainer>
                        </div>
                    </div>
                </div>
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
            </div>
        </>
    )
}

export default MapAccidentes