import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import { SetViewOnClick, DisplayPosition, zoom, center } from "../MapFunctions" 
import { useEffect, useState } from "react"
import { useModal } from "../modal/useModal"
import ModalWindow from "../modal/Modal"
 
function MapRadares ({ radares, setRadares, distritos, barrios, setLoading }) {
    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    const [map, setMap] = useState(null)
    const [radaresPrev, setRadaresPrev] = useState([])
    const [activateOverlay, setActivateOverlay] = useState('Radares')
    useEffect(() => {
        if(barrios.length === 0 && distritos.length === 0) {
            setActivateOverlay('Radares')
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
        setLoading(true)
        var aux = []
        
        for(const barrio of distrito.barrios) {
            aux = aux.concat(barrio.radares)
        }
        setRadares(aux)
        setLoading(false)
    }

    return(
        <>
            <div className="card">
                <div className="card-title">
                    <h1>Radares | Total: {radares.length}</h1>
                </div>
                <div className="card-body">
                    { map ? <DisplayPosition map={map} /> : null }
                    {radares.length < 10 && 
                        <>
                            <button className="btn btn-secondary"
                                    onClick={() => {
                                        setRadares(radaresPrev)
                                        setActivateOverlay('Distritos')
                                    }}
                            >
                                Volver a mostrar las zonas
                            </button> <br/>
                        </>
                    }
                    <label className="mb-2 me-2">Mostrar distritos</label>
                    <input type="checkbox"
                           className="me-4"
                           checked={activateOverlay.includes('Distritos')}
                           onClick={() => handleOverlayChange('Distritos')}
                           
                    />
                    <label className="mb-2 me-2">Mostrar Barrios</label>
                    <input type="checkbox"
                           className="me-4"
                           checked={activateOverlay.includes('Barrios')}
                           onClick={() => handleOverlayChange('Barrios')}
                    />
                    <label className="mb-2 me-2">Mostrar radares</label>
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
                        {activateOverlay.includes('Distritos') && distritos && distritos.map((distrito, index) => (
                            <Polygon positions={distrito.delimitaciones}
                                     key={index}
                            >   
                                <Popup>
                                    <button className="btn"
                                            onClick={() => {
                                                setRadaresPrev(radares)
                                                asignarRadares(distrito)
                                                setActivateOverlay('Radares')
                                            }}
                                    >
                                        Mostrar radares de este distrito
                                    </button>
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
                        {activateOverlay.includes('Radares') && radares && radares.map((radar, index) => (
                            <Marker key={index} position={[radar.lat, radar.lon]}>
                                <Popup>
                                    <button className="btn"
                                            onClick={() => openModal()}
                                    >
                                        Ver más información
                                    </button>
                                    <ModalWindow isOpen={isOpenModal} closeModal={closeModal} info={{ data: 'Radar' }}
                                    >
                                        <p style={{ fontWeight: 'bold' }}>
                                            Tipo: {radar.tipo !== '' ? radar.tipo : 'Sin información'} <br/>
                                            Sentido: {radar.sentido !== '' ? radar.sentido : 'Sin información'} <br/>
                                            ID: {radar.id} <br/>
                                            UBI: {radar.ubicacion} <br/>
                                            PK: {radar.pk}
                                        </p>
                                    </ModalWindow>
                                </Popup>
                            </Marker>
                        ))}
                        <SetViewOnClick />
                    </MapContainer>
                </div>
            </div>
        </>
    )
}

export default MapRadares