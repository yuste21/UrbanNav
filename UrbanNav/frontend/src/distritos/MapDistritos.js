import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, Circle } from 'react-leaflet';
import { center, zoom } from '../MapFunctions';

const MapDistritos = ({ distritos, barrios }) => {

    return(
        <>
            <div className='row'>
                <h3>Distritos</h3>
            </div>
            <div className='row'>
                <div className="card m-3">
                    <div className="card-body">
                        <MapContainer center={center}
                                    zoom={zoom}
                                    style={{ height: '400px', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {distritos && distritos.length > 0 && distritos.map((distrito, index) => (
                                <Polygon key={index}
                                         positions={distrito.delimitaciones}
                                >
                                    <Popup>
                                        <p>
                                            {distrito.nombre}
                                        </p>
                                    </Popup>
                                </Polygon>
                            ))

                            }
                            {barrios && barrios.length > 0 && barrios.map((barrio, index) => (
                                <>
                                    <Polygon key={index}
                                         positions={barrio.barrio.delimitaciones}
                                         pathOptions={{ color: '#CB2B3E' }}
                                    >
                                        <Popup>
                                            <p>
                                                {barrio.barrio.nombre}
                                            </p>
                                        </Popup>
                                    </Polygon>
                                    <Marker key={index} position={barrio.punto}>
                                        <Popup>
                                            <p>
                                                {barrio.barrio.nombre}
                                            </p>
                                        </Popup>
                                    </Marker>
                                </>
                            ))}
                        </MapContainer>

                    </div>
                </div>
            </div>
        </>
    )
}

export default MapDistritos