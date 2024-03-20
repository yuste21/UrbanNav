import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { SetViewOnClick, DisplayPosition, zoom, center } from "../MapFunctions" 
import { useState } from "react"

function MapRadares ({ radares }) {
    const [map, setMap] = useState(null)

    return(
        <>
            <div className="card">
                <div className="card-title">
                    <h1>Radares | Total: {radares.length}</h1>
                </div>
                <div className="card-body">
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
                        {radares && radares.map((radar, index) => (
                            <Marker key={index} position={[radar.lat, radar.lon]}>
                                <Popup>
                                    <p>Tipo: {radar.tipo !== '' ? radar.tipo : 'Sin información'}</p>
                                    <p>Sentido: {radar.sentido !== '' ? radar.sentido : 'Sin información'}</p>
                                </Popup>
                            </Marker>
                        ))
                        }
                        <SetViewOnClick />
                    </MapContainer>
                </div>
            </div>
        </>
    )
}

export default MapRadares