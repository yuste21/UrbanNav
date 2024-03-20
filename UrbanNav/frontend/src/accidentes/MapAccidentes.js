import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import LegendAccidentes from './LegendAccidentes.js';
import { useModal } from './useModalAccidente.js';
import ModalAccidente from './ModalAccidentes.js';
import { SetViewOnClick, DisplayPosition, DraggableMarker, zoom, center } from '../MapFunctions.js';

const MapAccidentes = ({zonas, accidentes }) => {
    const [map, setMap] = useState(null)

    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    //ZONA SELECCIONADA (INFO EN LA LEYENDA)
    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)

    const handleClick = (zona) => {
        setZonaSeleccionada(zona)
    }

    const handleMouseOut = (event) => {
        setZonaSeleccionada(null)
    }

    const handleMouseOver = (zona) => {
        setZonaSeleccionada(zona)
    }

    //AÑADIR ANIMATE PANNING (BUSCAR EN DOCUMENTACION DE REACT-LEAFLET)
    return(
        <>
            <div className='col-2'>
            {/*LEYENDA*/}
            { zonas.length > 0 && <LegendAccidentes zonaSelected={zonaSeleccionada}/> }
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
                            
                            {zonas && zonas.map((zona, index) => (
                                Math.round(zona.balance) < 50 ?
                                <Polygon key={index} pathOptions={{ color: 'blue' }} positions={zona.zona} 
                                        eventHandlers={{
                                            mouseout: handleMouseOut,
                                            mouseover: () => handleMouseOver(zona),
                                            click: () => handleClick(zona)
                                        }}
                                />
                                : Math.round(zona.balance) < 150 ?
                                <Polygon key={index} pathOptions={{ color: 'yellow' }} positions={zona.zona} 
                                        eventHandlers={{
                                            mouseout: handleMouseOut,
                                            mouseover: () => handleMouseOver(zona),
                                            click: () => handleClick(zona)
                                        }}
                                />
                                : Math.round(zona.balance) < 250 ?
                                <Polygon key={index} pathOptions={{ color: 'orange' }} positions={zona.zona} 
                                        eventHandlers={{
                                            mouseout: handleMouseOut,
                                            mouseover: () => handleMouseOver(zona),
                                            click: () => handleClick(zona)
                                        }}
                                />
                                : <Polygon key={index} pathOptions={{ color: 'red' }} positions={zona.zona} 
                                        eventHandlers={{
                                            mouseout: handleMouseOut,
                                            mouseover: () => handleMouseOver(zona),
                                            click: () => handleClick(zona)
                                        }}
                                />
                            ))}
                            {accidentes && zonas.length === 0 && accidentes.map((accidente, index) => (
                                <Marker key={index} position={[accidente.lat, accidente.lon]}>
                                    <Popup>
                                        <button onClick={openModal}>Ver más información</button>
                                        <ModalAccidente isOpen={isOpenModal} closeModal={closeModal}>
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
                                        </ModalAccidente>
                                    </Popup>
                                </Marker>
                            ))}
                            <SetViewOnClick />
                            <DraggableMarker />
                        </MapContainer>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MapAccidentes