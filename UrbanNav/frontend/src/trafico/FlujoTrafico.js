import { Bar, LineChart, Line, ComposedChart,
        CartesianGrid, XAxis, YAxis, 
        Legend, Tooltip, ResponsiveContainer, Brush  } from "recharts"
import { useLocation } from "react-router-dom"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import { useEffect, useState } from "react"
import { iconos } from "../markerIcons"
import NavbarPage from "../navbar/navbar"

const FlujoTrafico = () => {
    const location = useLocation()
    const entidad = location.state.entidad  //entidad podra ser el data que devuelva tanto la consulta de trafico como la de accidentes
    const info = location.state.info
    const [tipo, setTipo] = useState(location.state.tipo)
    const [brush, setBrush] = useState(true)

    const [centro, setCentro] = useState()
    useEffect(() => {
        if(tipo === 'estacion') {
            setCentro([entidad.lat, entidad.lon])
        } else {
            setCentro(entidad.centro)
        }

        if(tipo === 'estacion' || tipo === 'trafico distrito') {
            setBrush(entidad.trafico.length > 10)
        } else {
            setBrush(entidad.distrito.length > 10)
        }
    }, [info])

    const [data, setData] = useState()
    const [estacion, setEstacion] = useState()
    const [barrio, setBarrio] = useState()
    useEffect(() => {
        if(tipo === 'estacion' || tipo === 'trafico distrito') {
            setData(entidad.trafico)
        } else if(tipo === 'accidente distrito') {
            setData(entidad.distrito)
        } else if(tipo.split(' ')[0] === 'barrio') {    //tipo === 'barrio id'
            var aux = entidad.barrios.find(el => el.nombre === tipo.split(' ')[1])
            if(aux) {
                setData(aux.accidentes)
                setBarrio(aux)
            }
        }
        else {    //tipo === num_estacion --> estacion de un distrito
            var aux = entidad.aforos.find(el => el.estacion === tipo)
            if(aux) {
                setData(aux.trafico)
                setEstacion(aux)
            }
        }
    }, [tipo])



    return(
        <div className="padre">
            <NavbarPage></NavbarPage>
            <div className="container">
                <div className="row">
                    {entidad.estacion ?
                        <h1>Estacion: {entidad.estacion}</h1>
                    :
                        <h1>Distrito: {entidad.nombre}</h1>
                    }
                </div>
                <div className="row">
                    <div className="col-lg-12 col-xl-8">
                        <ResponsiveContainer width="100%" height={500}>
                            <ComposedChart
                                width={800} 
                                height={500} 
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 100,
                                    left: 100,
                                    bottom: 5
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {/*<XAxis dataKey="name" scale="band" />*/}
                                <XAxis  dataKey={info} />
                                <YAxis />
                                <Tooltip 
                                    labelStyle={{ color: "red" }} // Estilo para la etiqueta de Tooltips
                                    formatter={(value, name, props) => {
                                        if (info === 'fecha') {
                                            // Lógica para mostrar el día de la semana si 'info' es una fecha
                                            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                            const fecha = new Date(props.payload.fecha);
                                            const diaSemana = dias[fecha.getDay()];
                                            return [
                                                <span>
                                                    <span>{`${diaSemana}, ${props.payload.fecha}`}</span> <br/>
                                                    {(tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio') ? <span>{`Accidentes: ${value}`}</span> : <span>{`Aforo: ${value}`}</span> }    
                                                </span>
                                            ]
                                        } else {
                                        // Lógica para mostrar otra información si 'info' no es una fecha
                                        // Por ejemplo, si es una hora, podrías formatearla de manera especial aquí
                                        return (tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio') ? ["accidentes", value] : ["aforo", value];
                                        }
                                        
                                    }} // Solo muestra la información de "aforo" en Tooltips
                                />
                                <Legend 
                                    content={(props) => {
                                        return (
                                        <>
                                            {tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio' ? 
                                            <div className="custom-legend">
                                                <h3>
                                                    Accidentes {tipo === 'accidente distrito' ? 'de Distrito ' : `del Barrio ${barrio.nombre}`}
                                                </h3>
                                                {tipo !== 'accidente distrito' && tipo !== 'accidente barrio' &&    //tipo === 'accidente -nombreBarrio-'
                                                    <button className="btn btn-primary"
                                                            onClick={() => setTipo('accidente distrito')}
                                                    >
                                                        Mostrar accidentes de todo el distrito
                                                    </button>
                                                }
                                            </div>
                                            :
                                            <div className="custom-legend">
                                                <h3>
                                                    Flujo de trafico de {tipo === 'estacion' ? 'Estación ' : 
                                                                        tipo === 'trafico distrito' ? 'Distrito ' : 
                                                                        `Estación ${estacion.nombre} del distrito `} {entidad.nombre}
                                                </h3>
                                                {tipo !== 'trafico distrito' && tipo !== 'estacion' &&
                                                    <button className="btn btn-primary"
                                                            onClick={() => setTipo('trafico distrito')}
                                                    >
                                                        Mostrar trafico de todo el distrito
                                                    </button>
                                                }
                                            </div>
                                            }
                                        </>
                                        );
                                    }}
                                />
                                {brush && <Brush dataKey={info} height={30} stroke="#8884d8" /> }
                                {tipo && tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio' ?
                                    <>
                                        <Bar dataKey="total" barSize={20} fill="#413ea0" />
                                        <Line 
                                            type="monotone" 
                                            dataKey="total" 
                                            stroke="#8884d8" 
                                            activeDot={{ r: 8 }} 
                                        />
                                    </>
                                :
                                    <>
                                        <Bar dataKey="aforo" barSize={20} fill="#413ea0" /> 
                                        <Line 
                                            type="monotone" 
                                            dataKey="aforo" 
                                            stroke="#8884d8" 
                                            activeDot={{ r: 8 }} 
                                        />
                                    </>
                                }
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="col-lg-12 col-xl-4">
                        {centro && 
                            <div className="card mb-4">
                                <div className="card-body">
                                    <MapContainer center={centro}
                                                zoom={13}
                                                style={{ height: '300px', width: '100%', borderRadius: '10px' }}
                                                className="shadow"
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        /> 
                                        {tipo && tipo === 'estacion' ?
                                            <Marker key={entidad.estacion}
                                                    position={[entidad.lat, entidad.lon]}
                                                    icon={iconos.azul}
                                            >

                                            </Marker>
                                        :
                                            <>
                                                <Polygon key={entidad.codigo}
                                                        positions={entidad.delimitaciones}
                                                >
                                                </Polygon>
                                                {tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio' ? entidad.barrios.map((barrio) => (
                                                    <Polygon key={barrio.nombre}
                                                             positions={barrio.delimitaciones}
                                                             pathOptions={{
                                                                color: barrio.nombre === tipo.split(' ')[1] ? '#CB2B3E' : '#2A81CB'
                                                             }}
                                                             eventHandlers={{
                                                                 click: () => {
                                                                     setBarrio(barrio)
                                                                     setTipo(`barrio ${barrio.nombre}`)
                                                                 }
                                                             }}
                                                    >

                                                    </Polygon>
                                                ))
                                                :
                                                entidad.aforos.map((aforo) => (
                                                    <Marker key={aforo.estacion}
                                                            position={[aforo.lat, aforo.lon]}
                                                            icon={aforo.estacion === tipo ? iconos.rojo : iconos.azul}
                                                            eventHandlers={{
                                                                click: () => {
                                                                    setEstacion(aforo)
                                                                    setTipo(aforo.estacion)
                                                                }
                                                            }}
                                                    >
                                                    </Marker>
                                                ))
                                                }
                                            </>
                                        }
                                    </MapContainer>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FlujoTrafico