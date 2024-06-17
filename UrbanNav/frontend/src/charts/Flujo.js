import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { 
    Bar, Line, 
    ComposedChart,
    CartesianGrid, 
    XAxis, YAxis, 
    Legend, Tooltip, ResponsiveContainer, Brush  } from "recharts"
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import { iconos } from "../markerIcons"
import { initialDataFlujo } from "../features/flujo/dataFlujoSlice"

const Flujo = () => {
    //entidad podra ser el data que devuelva tanto la consulta de trafico como la de accidentes
    const dataFlujo = useSelector(state => state.flujo.dataFlujo)  
    const filtro = useSelector(state => state.flujo.filtro)
    const [entidad, setEntidad] = useState(null)
    const location = useLocation()
    const info = location.state.info
    const [tipo, setTipo] = useState(location.state.tipo)
    const [brush, setBrush] = useState(true)
    const loading = useSelector(state => state.flujo.loading)

    const [centro, setCentro] = useState()
    useEffect(() => {
        if (entidad !== null) {
            setCentro(entidad.centro)
            
            setBrush(entidad.zonaPrincipal.length > 10)
        }
    }, [entidad, tipo])

    useEffect(() => {
        if (tipo && info && dataFlujo !== initialDataFlujo) {
            setEntidad(dataFlujo)
        }
    }, [tipo, info, dataFlujo])

    const [data, setData] = useState()
    const [estacion, setEstacion] = useState()
    const [barrio, setBarrio] = useState()
    useEffect(() => {
        if(entidad !== null) {
            if (tipo === 'estacion' || tipo === 'trafico distrito' || tipo === 'accidente distrito' || tipo === 'accidente barrio') {
                setData(entidad.zonaPrincipal)
            } else if (tipo.split(' ')[0] === 'barrio') {   //tipo === 'barrio id'
                var aux = entidad.subzonas.find(el => el.nombre === tipo.slice(7))
                if (aux) {
                    setData(aux.accidentes)
                    setBarrio(aux)
                }
            } else {        //tipo === num_estacion --> estacion de un distrito
                var estacion_aux = parseInt(tipo.split(' ')[1])
                var aux = entidad.subzonas.find(el => el.estacion === estacion_aux)
                if(aux) {
                    setData(aux.trafico)
                    setEstacion(aux)    
                }
            }
        }
    }, [entidad, tipo])


    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container">
            {loading || entidad === null ?
                <Loader></Loader>
            :
                <>
                    <div className="row">
                        <div className="col">
                            {tipo === 'estacion' ?
                                <h3>Estacion: {entidad.codigo}</h3>
                            : tipo === 'trafico distrito' || tipo === 'accidente distrito' || tipo.split(' ')[0] === 'estacion' || tipo.split(' ')[0] === 'barrio' ?
                                <h3>Distrito: {entidad.nombre}</h3>
                            :   <h3>Barrio: {entidad.nombre}</h3>
                            }
                        </div>
                        <div className="col">
                            <h3>Desde {filtro[`${info}1`]} hasta {tipo.includes('accidente') ? filtro[`${info}2`] : `${filtro[`${info}2`].split(':')[0]}:59`}</h3>
                        </div>
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
                                                        {(tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio' || tipo === 'accidente barrio') ? <span>{`Accidentes: ${value}`}</span> : <span>{`Aforo: ${value}`}</span> }    
                                                    </span>
                                                ]
                                            } else {
                                            // Lógica para mostrar otra información si 'info' no es una fecha
                                            // Por ejemplo, si es una hora, podrías formatearla de manera especial aquí
                                            return `${value}`;
                                            }
                                            
                                        }} // Solo muestra la información de "aforo" en Tooltips
                                    />
                                    <Legend 
                                        content={(props) => {
                                            return (
                                            <>
                                                {tipo === 'accidente distrito' || tipo === 'accidente barrio' || tipo.split(' ')[0] === 'barrio' ? 
                                                <div className="custom-legend">
                                                    <h3>
                                                        Accidentes {tipo === 'accidente distrito' ? 'de Distrito ' : tipo === 'accidente barrio' ? `del Barrio ${entidad.nombre}` : `del Barrio ${barrio.nombre}`}
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
                                                        Flujo de trafico de {tipo === 'estacion' ? `Estación ${entidad.nombre}`  : 
                                                                            tipo === 'trafico distrito' ? `Distrito ${entidad.nombre}` : 
                                                                            `Estación ${estacion.nombre}`} 
                                                    </h3>
                                                    {tipo !== 'trafico distrito' && tipo !== 'estacion' && tipo.split(' ')[0] === 'estacion' &&
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
                                    {tipo && (tipo === 'accidente distrito' || tipo === 'accidente barrio' || tipo.split(' ')[0] === 'barrio')  ?
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
                            {centro && centro.length === 2 && centro === entidad.centro &&
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <MapContainer center={centro}
                                                    zoom={12}
                                                    style={{ height: '300px', width: '100%', borderRadius: '10px' }}
                                                    className="shadow"
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            /> 
                                            {tipo && tipo === 'estacion' ?
                                                <Marker key={entidad.estacion}
                                                        position={entidad.centro}
                                                        icon={iconos.azul}
                                                >

                                                </Marker>
                                            :
                                                <>
                                                    <Polygon key={entidad.codigo}
                                                            positions={entidad.delimitaciones}
                                                    >
                                                    </Polygon>
                                                    {tipo === 'accidente distrito' || tipo.split(' ')[0] === 'barrio' ? entidad.subzonas.map((barrio) => (
                                                        <Polygon key={barrio.nombre}
                                                                positions={barrio.delimitaciones}
                                                                pathOptions={{
                                                                    color: barrio.nombre === tipo.slice(7) ? '#CB2B3E' : '#2A81CB'
                                                                }}
                                                                eventHandlers={{
                                                                    click: () => {
                                                                        setBarrio(barrio)
                                                                        setTipo(`barrio ${barrio.nombre} accidente`)
                                                                    }
                                                                }}
                                                        >

                                                        </Polygon>
                                                    ))
                                                    : tipo === 'trafico distrito' || (tipo.split(' ')[0] === 'estacion' && tipo.split(' ').length > 1) ?
                                                    entidad.subzonas.map((aforo) => (
                                                        <Marker key={aforo.estacion}
                                                                position={[aforo.lat, aforo.lon]}
                                                                icon={aforo.estacion === parseInt(tipo.split(' ')[1]) ? iconos.rojo : iconos.azul}
                                                                eventHandlers={{
                                                                    click: () => {
                                                                        setEstacion(aforo)
                                                                        setTipo(`estacion ${aforo.estacion}`)
                                                                    }
                                                                }}
                                                        >
                                                        </Marker>
                                                    ))
                                                    : <></>
                                                    }
                                                </>
                                            }
                                        </MapContainer>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </>
        }
            </div>
        </div>
    )
}

export default Flujo