import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import { SetViewOnClick, DisplayPosition, zoom, center } from "../MapFunctions" 
import { useEffect, useState } from "react"
import { useModal } from "../modal/useModal"
import Modal from '../modal/Modal.js';
import { useDispatch, useSelector } from "react-redux"
import { getDataRadares, getRadares } from "../features/radar/dataRadarSlice"
import { iconos } from "../markerIcons.js";

function MapRadares ({ distritos, barrios, selectedRadar, setSelectedRadar, showBarChart, setShowTable }) {

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

    return(
        <>
            <div className="card mt-3 mb-3">
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
                                        dispatch(getRadares({ radares: radaresPrev }))
                                        setActivateOverlay('Distritos')
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
                                  ref={setMap}
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
                                    <button className="btn"
                                            onClick={() => {
                                                setSelectedRadar(null)
                                                setRadaresPrev(radares)
                                                asignarRadares(distrito)
                                                setActivateOverlay('Radares')
                                            }}
                                    >
                                        Mostrar radares de este distrito
                                    </button>
                                    <button className="btn"
                                            onClick={() => {
                                                setSelectedRadar(null)
                                                openModal(distrito.id+100)
                                            }}
                                    >
                                        Info del distrito
                                    </button>
                                    <Modal isOpen={isOpenModal} 
                                           closeModal={closeModal} 
                                           info={{ data: 'Distrito', idx: (distrito.id+100) }}
                                    >
                                        <p style={{ fontWeight: 'bold' }}>
                                            Nombre: {distrito.nombre !== '' ? distrito.nombre : 'Sin información'} <br/>
                                        </p>
                                    </Modal>
                                </Popup>
                            </Polygon>
                        ))}
                        {activateOverlay.includes('Barrios') && barrios && barrios.map((barrio, index) => (
                            <Polygon positions={barrio.delimitaciones}
                                     key={index}
                            >
                                <Popup>
                                    <p>{barrio.nombre}</p> <br/>
                                    <p>ID: {barrio.id}</p>
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
                                                Ubicacion: {radar.radar.ubicacion}
                                            </p>
                                        </Modal>
                                        {radar.multas > 0 && (selectedRadar === null || selectedRadar.radar.id !== radar.radar.id) &&
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