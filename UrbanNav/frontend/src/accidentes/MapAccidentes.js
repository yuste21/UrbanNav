import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, Circle } from 'react-leaflet';
import { SetViewOnClick, DisplayPosition, DraggableMarker, zoom, center } from '../MapFunctions.js';
import LegendAccidentes from './LegendAccidentes.js';
import Modal from '../modal/Modal.js';
import { useModal } from '../modal/useModal.js';
import { useForm } from './useFormAccidentes.js';

const MapAccidentes = ({zonas, riesgoMedio, accidentes, filtro, markerPosition, setMarkerPosition, handleFilter }) => {
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
    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
    const [zonaClickeada, setZonaClickeada] = useState(false)
    const [eventZonaPrevia, setEventZonaPrevia] = useState(null)


    const handleClick = (event, zona) => {
        
        if(eventZonaPrevia !== null) {
            eventZonaPrevia.event.target.setStyle({ fillColor: eventZonaPrevia.color })
        }

        if(zonaClickeada) {
            setEventZonaPrevia(null)
        } else {
            const fillColor = zona.riesgo < (riesgoMedio - riesgoMedio*0.5) ? ' #2A81CB' : zona.riesgo < riesgoMedio ? '#FFD326' : zona.riesgo < (riesgoMedio + riesgoMedio*0.5) ? '#CB8427' : '#CB2B3E'
            setEventZonaPrevia({ event: event, color: fillColor })
            setZonaSeleccionada(zona)
        }
        setZonaClickeada(!zonaClickeada)
        
    }

    const handleMouseOut = (event, zona) => {
        if(!zonaClickeada) {
            const fillColor = zona.riesgo < (riesgoMedio - riesgoMedio*0.5) ? ' #2A81CB' : zona.riesgo < riesgoMedio ? '#FFD326' : zona.riesgo < (riesgoMedio + riesgoMedio*0.5) ? '#CB8427' : '#CB2B3E'
            event.target.setStyle({ fillColor: fillColor });
            setZonaSeleccionada(null)
        }
    }

    const handleMouseOver = (event, zona) => {
        if(!zonaClickeada) {
            const fillColor = zona.riesgo < (riesgoMedio - riesgoMedio*0.5) ? 'rgba(4, 4, 252, 0)' : zona.riesgo < riesgoMedio ? 'rgba(252, 184, 4, 0)' : zona.riesgo < (riesgoMedio + riesgoMedio*0.5) ? 'rgba(252, 105, 4, 0)' : 'rgba(255, 0, 0, 0)'
            event.target.setStyle({ fillColor: fillColor })
            setZonaSeleccionada(zona)
        }
    }


    const fillBlueOptions = { fillColor: 'blue' }

    return(
        <>
            <div className='col-2'>
            {/*LEYENDA*/}
            { zonas && zonas.length > 0 && 
                <LegendAccidentes zonaSelected={zonaSeleccionada}
                                  riesgoMedio={riesgoMedio}
                /> 
            }
            </div>
            <div className='col-9'>
                {/*MAPA + MARKER + POLYGON*/}
                <div className='card m-3'>
                    <div className='card-body'>
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
                            {zonas && zonas.length > 0 && zonas.map((zona, index) => (
                                
                                <Polygon key={index}
                                         eventHandlers={{
                                             mouseout: (event) => handleMouseOut(event, zona),
                                             mouseover: (event) => handleMouseOver(event, zona),
                                             click: (event) => handleClick(event, zona)
                                         }}
                                         pathOptions={{
                                            color: zona.riesgo < (riesgoMedio - riesgoMedio*0.5) ? ' #2A81CB' : 
                                                   zona.riesgo < riesgoMedio ? '#FFD326' : 
                                                   zona.riesgo < (riesgoMedio + riesgoMedio*0.5) ? '#CB8427' : 
                                                   '#CB2B3E' 
                                         }}
                                         positions={zona.zona}
                                >
                                    {JSON.stringify(filtro) !== '{}' &&
                                        <Popup>
                                            <button className={!showForm ? 'btn' : 'btn btn-secondary mb-3'}
                                                    type='button'
                                                    onClick={() => setShowForm(!showForm)}
                                            >
                                                {showForm ? 'Ocultar filtro' : 'Mostrar filtro'}
                                            </button>
                                                    
                                            {showForm &&
                                                <form onSubmit={(event) => {
                                                        form.zona = zona.zona   //Le paso las coordenadas
                                                        handleSubmit(event, null)
                                                    }}
                                                >
                                                    <div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="drogas" >Positivo en drogas</label>
                                                        <select className='mb-4 form-select' 
                                                                value={form.drogas} 
                                                                id="drogas"
                                                                name="drogas"
                                                                style={{ width: '220px' }}
                                                                onChange={handleChange}>
                                                            <option value="">Selecciona una opción</option>
                                                            <option value="1">Positivo</option>
                                                            <option value="0">Negativo</option>
                                                        </select> <br/>
                                                    </div>
                                                    
                                                    <div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="alcohol">Positivo en alcohol</label>
                                                        <select className='mb-4 form-select' 
                                                                value={form.alcohol} 
                                                                id="alcohol"
                                                                name="alcohol"
                                                                style={{ width: '220px'}}
                                                                onChange={handleChange}>
                                                            <option value="">Selecciona una opción</option>
                                                            <option value="1">Positivo</option>
                                                            <option value="0">Negativo</option>
                                                        </select> <br/>
                                                    </div>

                                                    {/*<div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="accidente">Tipo de accidente</label>
                                                        <select className='mb-4 form-select' 
                                                                value={form.accidente} 
                                                                id="accidente"
                                                                name="accidente"
                                                                style={{ width: '220px' }}
                                                                onChange={handleChange}>
                                                            <option value="">Selecciona una opción</option>
                                                            <option value="doble">Colisión doble</option>
                                                            <option value="multiple">Colisión múltiple</option>
                                                            <option value="alcance">Alcance</option>
                                                            <option value="obstaculo">Choque contra obstáculo fijo</option>
                                                            <option value="persona">Atropello a persona</option>
                                                            <option value="vuelco">Vuelco</option>
                                                            <option value="caida">Caída</option>
                                                            <option value="otro">Otro</option>
                                                        </select> <br/>
                                                    </div>*/}

                                                    <div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="clima">Clima</label>
                                                        <select className='mb-4 form-select' 
                                                                value={form.clima} 
                                                                id="clima"
                                                                name="clima"
                                                                style={{ width: '220px' }}
                                                                onChange={handleChange}>
                                                            <option value="">Selecciona una opción</option>
                                                            <option value="Despejado">Despejado</option>
                                                            <option value="Nublado">Nublado</option>
                                                            <option value="debil">Lluvia débil</option>
                                                            <option value="intensa">Lluvia intensa</option>
                                                            <option value="Granizando">Granizando</option>
                                                        </select> <br/>
                                                    </div>

                                                    <div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="horaConcreta">Hora concreta</label>
                                                        <input  className='mb-4 me-4' 
                                                                type="time" 
                                                                value={form.hora1} 
                                                                id="horaConcreta"
                                                                name="hora1"
                                                                onChange={handleChange}/>

                                                        <label className='fw-bold me-2 mb-4' htmlFor="entreHoras">Entre 2 horas</label>
                                                        <input  className='mb-4 me-2' 
                                                                type="time" 
                                                                value={form.hora1} 
                                                                id="entreHoras"
                                                                name="hora1"
                                                                onChange={handleChange} />
                                                        <input  className='mb-4' 
                                                                type="time" 
                                                                value={form.hora2} 
                                                                name="hora2"
                                                                onChange={handleChange} /> <br/>
                                                    </div>

                                                    <div className='d-flex align-items-center'>
                                                        <label className='fw-bold me-2 mb-4' htmlFor="fechaConcreta">Fecha concreta</label>
                                                        <input  className='mb-4 me-4' 
                                                                type="date" 
                                                                value={form.fecha1} 
                                                                id="fechaConcreta"
                                                                name="fecha1"
                                                                onChange={handleChange}/>

                                                        <label className='fw-bold me-2 mb-4' htmlFor="entreFechas">Entre 2 fechas</label>
                                                        <input  className='mb-4 me-4' 
                                                                type="date" 
                                                                value={form.fecha1} 
                                                                id="entreFechas"
                                                                name="fecha1"
                                                                onChange={handleChange}/>
                                                        <input  className='mb-4' 
                                                                type="date" 
                                                                value={form.fecha2}
                                                                name="fecha2" 
                                                                onChange={handleChange} /> <br/>
                                                    </div>
                                                    <input className="btn btn-secondary me-4" type="submit" value="Filtrar"></input>
                                                    <button className='btn btn-secondary' type='button' onClick={() => setForm(filtro)}>Limpiar filtro</button>
                                                </form>
                                            }
                                        </Popup>
                                    }
                                </Polygon>
                            ))}
                            {accidentes && zonas && zonas.length === 0 && accidentes.map((accidente, index) => (
                                <Marker key={index} position={[accidente.lat, accidente.lon]}>
                                    <Popup>
                                        <button onClick={openModal}
                                                className='btn'
                                        >
                                            Ver más información
                                        </button>
                                        <Modal isOpen={isOpenModal} closeModal={closeModal}>
                                            <p style={{color: '#FCF7F8', fontWeight: 'bold'}}>
                                                Fecha: {accidente.fecha} <br/>
                                                Hora: {accidente.hora} <br/>
                                                Edad: {accidente.edad} <br/>
                                                Vehiculo: {accidente.vehiculo} <br/>
                                                Distrito: {accidente.distrito} <br/>
                                                Positivo en drogas: {accidente.drogas ? 'Si' : 'No'} <br/>
                                                Positivo en alcohol: {accidente.alcohol ? 'Si' : 'No'} <br/>
                                                Lesion: {[1, 2, 5, 6, 7].includes(accidente.lesividad) ? 'Leve' : 
                                                        accidente.lesividad === 3 ? 'Grave' : accidente.lesividad === 4 ? 'Fallecido' : 
                                                        accidente.lesividad === 14 ? 'Sin asistencia sanitaria' : 'Desconocido'} <br/>
                                                Sexo: {accidente.sexo} <br/>
                                                Tipo de accidente: {accidente.accidente} <br/>
                                                Clima: {accidente.clima} <br/>
                                            </p>
                                        </Modal>
                                    </Popup>
                                </Marker>
                            ))}
                            
                            { Object.keys(filtro).length > 0 && filtro.radio && filtro.radio.activo && <Circle center={markerPosition} pathOptions={fillBlueOptions} radius={(filtro.radio.distancia * 1000)} /> }

                            { Object.keys(filtro).length > 0 && filtro.radio && filtro.radio.activo && <DraggableMarker markerPosition={markerPosition} setMarkerPosition={setMarkerPosition} /> }
                        </MapContainer>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MapAccidentes