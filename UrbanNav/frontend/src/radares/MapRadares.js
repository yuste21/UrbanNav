import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import { SetViewOnClick, DisplayPosition, zoom, center } from "../MapFunctions" 
import { useModal } from "../modal/useModal"
import Modal from '../modal/Modal.js';
import { iconos } from "../markerIcons.js";
import { getRadares, getRadaresPrev } from "../features/radar/dataRadarSlice"

function MapRadares ({ distritos, barrios, selectedRadar, setSelectedRadar, showBarChart, showTable, setShowTable }) {

    const radares = useSelector(state => state.radares.dataRadares.radares)
    const dispatch = useDispatch()

    useEffect(() => {
        if ((showBarChart || selectedRadar !== null) && !activateOverlay.includes('Radares') ) {
            setActivateOverlay(activateOverlay + ' Radares')
        }
    }, [showBarChart, selectedRadar])

    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    const [map, setMap] = useState(null)
    const [radaresPrev, setRadaresPrev] = useState([])
    const [activateOverlay, setActivateOverlay] = useState('Radares Distritos')

    const handleOverlayChange = (selectedOverlay) => {
        var aux = activateOverlay.split(' ')
        if(activateOverlay.includes(selectedOverlay)) {     //Desactivo checkbox
            var filtrado = aux.filter(el => el !== selectedOverlay && el !== '')
            setActivateOverlay(filtrado.length > 0 ? filtrado[0] : '')
        } else {  //Activamos el checkbox selectedOverlay
            
            if(selectedOverlay === 'Radares') {  //Si selected es Estaciones no tengo que desactivar ningun checkbox
                setActivateOverlay(activateOverlay + ' ' + selectedOverlay)
            } else {    //En caso de que haya algun checkbox activado que no sea Radares lo desactivo
            var filtrado = aux.filter(el => el === 'Radares')
            var filtradoString = filtrado.length > 0 ? `${filtrado[0]}` : ''
            setActivateOverlay(filtradoString + ' ' + selectedOverlay)
            }
        }
    };

    const asignarRadares = (distrito) => {
        var aux = []
        
        for(const barrio of distrito.barrios) {
            aux = aux.concat(barrio.radares)
        }
        dispatch(getRadares({ radares: aux }))
    }

    const contarMultas = () => {
        let contador = 0
        radares.forEach((radar) => {
            contador += radar.multas
        })
        return contador
    }

    //Centramos la vista del mapa al radar seleccionado
    useEffect(() => {
        console.log('Map.setview')
        if (selectedRadar !== null && map) {
            map.setView([selectedRadar.radar.lat, selectedRadar.radar.lon], map.getZoom());
        }
    }, [selectedRadar, map]);

    return(
        <>
            <div className="card m-3">
                <div className="card-title">
                    {radares && radares.length &&
                        <h3>{radares.length} Radares | {contarMultas()} Multas</h3>
                    }
                </div>
                <div className="card-body">
                    { map ? <DisplayPosition map={map} /> : null }
                    {radares.length < 10 && 
                        <>
                            <button className="btn btn-secondary"
                                    onClick={() => {
                                        dispatch(getRadaresPrev({ radares: radaresPrev }))
                                        setActivateOverlay('Distritos Radares')
                                    }}
                            >
                                Volver a mostrar las zonas
                            </button> <br/>
                        </>
                    }
                    <label className="mb-2 me-2">Distritos</label>
                    <input type="checkbox"
                           className="me-4"
                           checked={activateOverlay.includes('Distritos')}
                           onClick={() => handleOverlayChange('Distritos')}
                           
                    />
                    <label className="mb-2 me-2">Barrios</label>
                    <input type="checkbox"
                           className="me-4"
                           checked={activateOverlay.includes('Barrios')}
                           onClick={() => handleOverlayChange('Barrios')}
                    />
                    <label className="mb-2 me-2">Radares</label>
                    <input type="checkbox"
                           checked={activateOverlay.includes('Radares')}
                           onClick={() => handleOverlayChange('Radares')}
                    /> <br/>
                    <MapContainer center={center} 
                                  zoom={zoom} 
                                  style={{ height: '400px', width: '100%', borderRadius: '10px' }} 
                                  className="shadow"
                                  whenCreated={setMap}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {activateOverlay.includes('Distritos') && distritos && distritos.map((distrito) => (
                            <Polygon positions={distrito.delimitaciones}
                                     key={(distrito.id+100)}
                            >   
                                <Popup>
                                    {distrito.barrios.find(barrio => barrio.radares.length > 0) &&
                                        <button className="btn btn-hover"
                                                onClick={() => {
                                                    setSelectedRadar(null)
                                                    setRadaresPrev(radares)
                                                    asignarRadares(distrito)
                                                    setActivateOverlay('Radares')
                                                }}
                                        >
                                            Mostrar radares de este distrito
                                        </button>
                                    }
                                    <p style={{ fontWeight: 'bold' }}>
                                        {distrito.nombre !== '' ? distrito.nombre : 'Sin información'} <br/>
                                    </p>
                                </Popup>
                            </Polygon>
                        ))}
                        {activateOverlay.includes('Barrios') && barrios && barrios.map((barrio, index) => (
                            <Polygon positions={barrio.delimitaciones}
                                     key={index}
                            >
                                <Popup>
                                    <p style={{ fontWeight: 'bold' }}>
                                        {barrio.nombre}
                                    </p>
                                </Popup>
                            </Polygon>
                        ))}
                        {activateOverlay.includes('Radares') && radares && radares.map((radar) => (
                            <>
                                {selectedRadar !== null && selectedRadar.radar.id === radar.radar.id && (
                                    <Popup position={[radar.radar.lat, radar.radar.lon]}>
                                        <p>{selectedRadar.radar.ubicacion}</p>
                                    </Popup>
                                )}
                                <Marker key={radar.radar.id} 
                                        position={[radar.radar.lat, radar.radar.lon]}
                                        icon={(selectedRadar !== null && selectedRadar.radar.id === radar.radar.id) ? iconos.verde : 
                                               radar.multas > 0 ? iconos.rojo : iconos.azul}
                                >
                                    <Popup>
                                        <button className="btn"
                                                onClick={() => {
                                                    //setSelectedRadar(null)
                                                    openModal(radar.radar.id)
                                                }}
                                        >
                                            Ver más información del radar
                                        </button>
                                        <Modal isOpen={isOpenModal} 
                                            closeModal={closeModal} 
                                            info={{ data: 'Radar', idx: radar.radar.id }}
                                        >
                                            <p style={{ fontWeight: 'bold' }}>
                                                Tipo: {radar.radar.tipo !== '' ? radar.radar.tipo : 'Sin información'} <br/>
                                                Sentido: {radar.radar.sentido !== '' ? radar.radar.sentido : 'Sin información'} <br/>
                                                ID: {radar.radar.id} <br/>
                                                Ubicacion: {radar.radar.ubicacion} <br/>
                                                {radar.multas > 0 ? `${radar.multas} Multas` : ''}
                                            </p>
                                        </Modal>
                                        {radar.multas > 0 && (selectedRadar === null || selectedRadar.radar.id !== radar.radar.id || (selectedRadar.radar.id === radar.radar.id && !showTable)) &&
                                            <button className="btn"
                                                    onClick={() => {
                                                        setSelectedRadar(radar)
                                                        setShowTable(true)
                                                    }}
                                            >
                                                Mostrar multas
                                            </button>
                                        }
                                    </Popup>
                                </Marker>
                            </>
                        ))}
                        <SetViewOnClick />
                    </MapContainer>
                </div>
            </div>
        </>
    )
}

export default MapRadares