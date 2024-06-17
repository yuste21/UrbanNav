import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import MapTrafico from "./MapTrafico"
import BarChartTrafico from "../charts/Charts"
import { 
    getDataTraficoInicio, 
    getDataTraficoFiltro, 
    getAllDataTrafico, 
    initialFilter 
} from "../features/trafico/dataTraficoSlice"

function Trafico () {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.trafico.filtro)

    const estaciones = useSelector(state => state.trafico.dataTrafico.estaciones)
    const distritos = useSelector(state => state.trafico.dataTrafico.distritos)
    const barrios = useSelector(state => state.trafico.dataTrafico.barrios)
    const loading = useSelector(state => state.trafico.loading)


    const [fechaMin, setFechaMin] = useState(null)
    const [fechaMax, setFechaMax] = useState(null)

    //BarChart Zonas mas concurridas
    const [showBarChart, setShowBarChart] = useState(false)
    const [selectedBar, setSelectedBar] = useState(null)
    const [activatedOverlay, setActivatedOverlay] = useState('Estaciones')

    //Con esta variable ajusto el tamaño de los col del mapa y del barchart
    const [colMap, setColMap] = useState()
    useEffect(() => {
        setColMap(showBarChart ? "col-md-12 col-xl-7" : "col-12")
    })

    //PROVISIONAL
    const orientacion = 'true'

    const cargaInicial = async () => {
        if (estaciones.length === 0) {
            dispatch(getDataTraficoInicio(orientacion))
        }
    }

    useEffect(() => {
        cargaInicial()
    }, [])

    const handleFilter = async () => {
        if (filtro !== initialFilter) {
            if (filtro.getAll === true) {
                dispatch(getAllDataTrafico)
            } else {
                const [year, month] = filtro.mes.split('-')
                var numeroMonth = parseInt(month, 10)
                dispatch(getDataTraficoFiltro({ orientacion, numeroMonth, year, filtro }))
            }
        }
    }

    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ?
                    <Loader/>
                :
                    <>
                        <div className="row">
                            <div className={colMap}>
                                <MapTrafico activatedOverlay={activatedOverlay}
                                            setActivatedOverlay={setActivatedOverlay}
                                            selectedBar={selectedBar}
                                            setSelectedBar={setSelectedBar}
                                            showBarChart={showBarChart}
                                            setShowBarChart={setShowBarChart}
                                            handleFilter={handleFilter}
                                />
                            </div>
                            {showBarChart &&
                                <div className="col-md-12 col-xl-5">
                                    <BarChartTrafico data={activatedOverlay.split(' ').includes('Distritos') ? distritos 
                                                        : activatedOverlay.split(' ').includes('Barrios') ? barrios : estaciones}
                                                    setSelectedBar={setSelectedBar}
                                                    activatedOverlay={activatedOverlay}
                                                     tipo={'trafico'}
                                    />
                                </div>
                            }
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Trafico