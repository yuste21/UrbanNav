import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Offcanvas, OverlayTrigger, Popover } from "react-bootstrap"
import { getDataRadaresInicio, getDataRadaresFiltro, initialFilter } from "../features/radar/dataRadarSlice"
import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import MapRadares from "./MapRadares"
import Charts from "../charts/Charts"
import FormRadares from "./FormRadares"
import DynamicTable from "../table/DynamicTable"

function Radares () {

    useEffect(() => {
        const url = process.env.REACT_APP_URL_BACKEND
        console.log(url)
    }, [])

    const radares = useSelector(state => state.radares.dataRadares.radares)
    const barrios = useSelector(state => state.radares.dataRadares.barrios)
    const distritos = useSelector(state => state.radares.dataRadares.distritos)
    const loading = useSelector(state => state.radares.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getDataRadaresInicio())
    }, []) // Este useEffect se ejecuta solo una vez al cargar el componente

    const [leftCol, setLeftCol] = useState('col-1')
    const [colMap, setColMap] = useState('col-11')
    const [showBarChart, setShowBarChart] = useState(false)
    const [selectedRadar, setSelectedRadar] = useState(null)
    const [showTable, setShowTable] = useState(false)
    useEffect(() => {
        if (showBarChart) {
            setColMap('col-xl-6 col-lg-12')
            setLeftCol('col-xl-6 col-lg-12')
        } else {
            setColMap('col-11')
            setLeftCol('col-1')
        }
    }, [showBarChart, showTable])
    
    //Icono chart
    const [icon, setIcon] = useState('bi bi-bar-chart')

    const radaresCharts = () => {
        return radares.filter(el => el.multas > 0)
    }

    //Filtro
    const filtro = useSelector(state => state.radares.filtro)
    const [showForm, setShowForm] = useState(false)
    const handleClose = () => setShowForm(false);
    const handleShow = () => setShowForm(true);

    const handleFilter = (filtro) => {
        if (filtro !== initialFilter) {
            dispatch(getDataRadaresFiltro(filtro))
            if (!showBarChart) setShowBarChart(true)
            setShowForm(false)
        }
    }

    //Filtro aplicado
    const [filtroAplicado, setFiltroAplicado] = useState([])
    useEffect(() => {
        setFiltroAplicado(filtroString(filtro))
    }, [filtro])

    const filtroString = (filtro) => {
        let resultado = []
        if (filtro.costeMin !== '' && filtro.costeMax !== '') {
            if (filtro.costeMin === filtro.costeMax) {  
                resultado.push(`Coste de ${filtro.costeMin} euros`)

            } else {    
                resultado.push(`Coste entre ${filtro.costeMin} y ${filtro.costeMax} euros`)
            }
        } else if (filtro.costeMin !== '') {    
            resultado.push(`Coste mayor de ${filtro.costeMin} euros`)
        } else if (filtro.costeMax !== '') {
            resultado.push(`Coste menor de ${filtro.costeMax} euros`)
        }

        if (filtro.puntosMin !== '' && filtro.puntosMax !== '') {
            if (filtro.puntosMin === filtro.puntosMax) {  
                resultado.push(`Infracción de ${filtro.puntosMin} puntos`)

            } else {    
                resultado.push(`Infracción desde ${filtro.puntosMin} hasta ${filtro.puntosMax} puntos`)
            }
        } else if (filtro.puntosMin !== '') {
            resultado.push(`Infracción de ${filtro.puntosMin} puntos como mínimo`)
        } else if (filtro.puntosMax !== '') {
            resultado.push(`Infracción de ${filtro.puntosMax} puntos como máximo`)
        }

        if (filtro.horaMin !== '' && filtro.horaMax !== '') {
            if (filtro.horaMin === filtro.horaMax) {
                resultado.push(`A las ${filtro.horaMin}`)
            } else {
                resultado.push(`Entre las ${filtro.horaMin} y las ${filtro.horaMax}`)
            }
        } else if (filtro.horaMin !== '') {
            resultado.push(`Después de las ${filtro.horaMin}`)
        } else if (filtro.horaMax !== '') {
            resultado.push(`Antes de las ${filtro.horaMax}`)
        }
        
        if (filtro.descuento === '1') {
            resultado.push('Con descuento aplicado')
        } else if (filtro.descuento === '0') {
            resultado.push('Sin descuento aplicado')
        }

        if (filtro.calificacion !== '') {
            resultado.push(`Clasificacion: ${filtro.calificacion}`)
        }

        return resultado
    }

    const popover = (
        <Popover id='popover'>
            <Popover.Header as="h4">Filtro aplicado</Popover.Header>
            <Popover.Body className='popover-body'>
            {filtroAplicado.map((el, index) => (
                <p key={index}>{el}</p>
            ))}
            </Popover.Body>
        </Popover>
    );



    //Tabla
    const dataTable = () => {
        let data = []
        selectedRadar.radar.multas.forEach((multa) => {
            data.push({
                mes: multa.mes,
                año: multa.año,
                hora: multa.hora,
                coste: multa.coste,
                puntos: multa.puntos,
                descuento: multa.descuento === true ? 'SI' : 'NO',
                vel_limite: multa.vel_limite,
                vel_circula: multa.vel_circula,
                calificacion: multa.calificacione.calificacion_multa
            })
        })
        
        return data
    }

    const dataColumns = () => {
        return [
            { header: 'Mes', accessor: 'mes'},
            { header: 'Año', accessor: 'año'},
            { header: 'Hora', accessor: 'hora'},
            { header: 'Coste', accessor: 'coste'},
            { header: 'Puntos', accessor: 'puntos'},
            { header: 'Descuento', accessor: 'descuento'},
            { header: 'Velocidad límite', accessor: 'vel_limite'},
            { header: 'Velocidad de circulación', accessor: 'vel_circula'},
            { header: 'Calificación', accessor: 'calificacion'},
        ]
    }

    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container" style={{ position: 'relative' }}>
                {loading ? 
                    <Loader></Loader>
                    :
                    <>
                        <div className="row"> 
                            {/* BarChart + Tabla + Filtro */}
                            <div className={leftCol}>
                                {/* FILTRO */}
                                {!showForm &&
                                    <>
                                        <button className="btn" onClick={handleShow} >
                                            <i class="bi bi-filter"></i>
                                        </button>
                                        {filtro.filtrado &&
                                            <div className='row'>
                                                <OverlayTrigger
                                                    placement="bottom"
                                                    trigger='click'
                                                    overlay={popover}
                                                >
                                                    <button className='btn'>Mostrar Filtrado</button>
                                                </OverlayTrigger>
                                            </div>
                                        }
                                    </>
                                }
                                <Offcanvas show={showForm} onHide={handleClose} style={{ width: '650px' }} className="custom-offcanvas canvas">
                                    <Offcanvas.Body>
                                        <FormRadares handleFilter={handleFilter}
                                                    handleClose={handleClose}
                                        />
                                    </Offcanvas.Body>
                                </Offcanvas>
                                {showTable &&
                                    <div className="row">
                                        <button className="btn"
                                                onClick={() => {
                                                    setShowTable(false)
                                                    if (!showBarChart) setSelectedRadar(null)
                                                }}
                                        >
                                            Ocultar tabla
                                        </button>
                                    </div>
                                }
                                {showBarChart ?
                                    <>
                                        {/* BarChart */}
                                        <div className="row">
                                            <button className="btn mt-3"
                                                onClick={() => {
                                                    setShowBarChart(false)
                                                    if (!showTable) setSelectedRadar(null)
                                                }}
                                            >
                                                Ocultar grafica
                                            </button>
                                            <Charts data={radaresCharts()} 
                                                    setSelectedBar={setSelectedRadar}
                                                    tipo={'radares'}
                                                    activatedOverlay={''}
                                            />
                                        </div>
                                        
                                    </>
                                :
                                    <button className="btn mt-3"
                                            onClick={() => {
                                                setShowBarChart(true)
                                                setShowTable(true)
                                            }}
                                            onMouseEnter={() => setIcon('bi bi-bar-chart-fill')}
                                            onMouseLeave={() => setIcon('bi bi-bar-chart')}
                                    >
                                        <i className={icon}></i>
                                    </button>
                                }
                            
                            </div>
                            {/* Map */}
                            <div className={colMap}>
                                <MapRadares distritos={distritos}
                                            barrios={barrios}
                                            selectedRadar={selectedRadar}
                                            setSelectedRadar={setSelectedRadar}
                                            showBarChart={showBarChart}
                                            showTable={showTable}
                                            setShowTable={setShowTable}
                                />
                            </div>
                        </div>
                        {showTable && selectedRadar !== null &&
                            <div className="row">
                                <h4>{selectedRadar.radar.ubicacion}</h4>
                                <DynamicTable data={dataTable()}
                                              columns={dataColumns()}
                                />
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    )
}

export default Radares