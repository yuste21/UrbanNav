import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from 'lodash/get'
import NavbarPage from "../navbar/navbar";
import Loader from "../loader/Loader";
import { 
    getDataAccidentesFiltro, 
    getDataAccidentesInicio, 
    initialFilter 
} from "../features/accidente/dataAccidenteSlice";
import MapAccidentes from "./MapAccidentes";
import BarChartAccidente from "./BarChartAccidente";
import PieChartAccidentes from "./PieChartAccidentes";

function Accidentes () {
    const dispatch = useDispatch()
    const accidentes = useSelector(state => state.accidentes.dataAccidentes.accidentes)

    //FILTRO + FORM
    const loading = useSelector(state => state.accidentes.loading)
    const filtro = useSelector(state => state.accidentes.filtro)

    //ZONAS
    const distritos = useSelector(state => state.accidentes.dataAccidentes.distritos)
    const barrios = useSelector(state => state.accidentes.dataAccidentes.barrios)

    const cargaInicial = async () => {
        dispatch(getDataAccidentesInicio())
    }

    useEffect(() => {
        if (accidentes.length === 0) {
            console.log('Carga inicial')
            cargaInicial()
        }
    }, [])

    //FILTRO
    const handleFilter = async(filtro) => {
        if(filtro !== initialFilter) {
            var radio = filtro.radio.distancia / 1000
            dispatch(getDataAccidentesFiltro({ filtro, radio }))
        }
    } 

    //Charts
    const [icon, setIcon] = useState('bi bi-bar-chart')
    const [showCharts, setShowCharts] = useState(false)
    const [datosAgrupados, setDatosAgrupados] = useState([])
    const [agrupacion, setAgrupacion] = useState('')
    const [datosAgrupadosPie, setDatosAgrupadosPie] = useState([])
    const [agrupacionPie, setAgrupacionPie] = useState('')
    const [colCharts, setColCharts] = useState()
    const [colMap, setColMap] = useState()
    useEffect(() => {
        setColMap(showCharts ? "col-xl-7 col-lg-12" : "col-lg-12 col-xl-11")
        setColCharts(showCharts ? "col-xl-5 col-lg-12" : "col-lg-12 col-xl-1")
    }, [showCharts])

    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)

    //Con el metodo get de lodash puedo acceder a atributos como accidente.sexo.sexo
    const obtenerDatosGrafica = (agrupacion, chart) => {
        var datosAgrupados
        
        if(zonaSeleccionada === null || chart === 'DeseleccionadoBar' || chart === 'DeseleccionadoPie') {
            datosAgrupados = accidentes.reduce((acc, curr) => {
                const categoria = get(curr, agrupacion)
                acc[categoria] = acc[categoria] ? acc[categoria] + 1 : 1
                return acc
            }, {})
        } else {
            var zona = distritos.find(el => el.nombre === zonaSeleccionada.nombre)
            var accidentesAsociados
            if(!zona) {
                zona = barrios.find(el => el.nombre === zonaSeleccionada.nombre)
                accidentesAsociados = accidentes.filter(el => el.barrioId === zona.id)
            } else {
                accidentesAsociados = accidentes.filter(el => barrios.some(barrio => barrio.distritoId === zona.id && barrio.id === el.barrioId));
            }
            
            datosAgrupados = accidentesAsociados.reduce((acc, curr) => {
                const categoria = get(curr, agrupacion)
                acc[categoria] = acc[categoria] ? acc[categoria] + 1 : 1
                return acc
            }, {})
        }

        var datos = Object.keys(datosAgrupados).map((categoria) => ({
            categoria: categoria,
            cantidad: datosAgrupados[categoria]
        }))
        if(chart === 'Pie' || chart === 'DeseleccionadoPie') {
            setAgrupacionPie(agrupacion)
            setDatosAgrupadosPie(datos)
        } else {
            setAgrupacion(agrupacion)
            setDatosAgrupados(datos)
        }
    }

    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ? 
                    <Loader></Loader>
                    :
                    <>
                        <div className="row">   
                            {/* GRAFICAS */}
                            <div className={colCharts}>
                                {showCharts === false ?
                                    <>
                                        <button className="btn mt-3"
                                                onClick={() => {
                                                    obtenerDatosGrafica('clima.clima', 'Bar')
                                                    obtenerDatosGrafica('tipo_accidente.tipo_accidente', 'Pie')
                                                    setShowCharts(true)
                                                }}
                                                onMouseEnter={() => setIcon('bi bi-bar-chart-fill')}
                                                onMouseLeave={() => setIcon('bi bi-bar-chart')}
                                                aria-controls="example-collapse-text"
                                        >
                                            <i className={icon}></i>
                                        </button> <br/>

                                    </>
                                :  
                                    <>
                                        <button className="btn mb-3 mt-3"
                                                onClick={() => setShowCharts(false)}
                                        >
                                            Ocultar estadísticas
                                        </button> <br/>
                                        <div className="card">
                                            <div className="card-body">
                                                <BarChartAccidente datosAgrupados={datosAgrupados} 
                                                                   agrupacion={agrupacion} 
                                                                   obtenerDatosGrafica={obtenerDatosGrafica} 
                                                />
                                                <hr></hr>
                                                <PieChartAccidentes datosAgrupadosPie={datosAgrupadosPie}
                                                                    agrupacionPie={agrupacionPie}
                                                                    obtenerDatosGrafica={obtenerDatosGrafica}
                                                />
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                            {/* MAPAS */}
                                <div className={colMap}>
                                    <div className="col-12">
                                        <MapAccidentes handleFilter={handleFilter}
                                                       obtenerDatosGrafica={obtenerDatosGrafica}
                                                       zonaSeleccionada={zonaSeleccionada}
                                                       setZonaSeleccionada={setZonaSeleccionada}
                                        />
                                    </div>
                                </div>
                        </div>
                        <br/>
                    </>
                }
            </div>
        </div>
    )
}

export default Accidentes