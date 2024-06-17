import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Offcanvas, OverlayTrigger, Popover } from "react-bootstrap"
import NavbarPage from "../navbar/navbar.js"
import Loader from "../loader/Loader.js"
import { initialFilter } from "../features/radar/dataMultaSlice.js"
import { getMultasFiltro, getMultasInicio } from "../features/radar/dataMultaSlice.js"
import FormMultas from "./FormMultas.js"
import DynamicTable from "../table/DynamicTable.js"

const Multas = () => {

    const dispatch = useDispatch()
    const loading = useSelector(state => state.multas.loading)
    const multas = useSelector(state => state.multas.multas)

    useEffect(() => {
        dispatch(getMultasInicio())
    }, [])

    //Filtro
    const filtro = useSelector(state => state.multas.filtro)
    const [showForm, setShowForm] = useState(false)
    const handleClose = () => setShowForm(false)
    const handleShow = () => setShowForm(true)

    const handleFilter = (filtro) => {
        if (filtro !== initialFilter) {
            dispatch(getMultasFiltro(filtro))
        }
    }

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

        if (filtro.mesMin !== '' && filtro.mesMax !== '') {
            if (filtro.mesMin === filtro.mesMax) {
                resultado.push(`Mes: ${filtro.mesMin}`)
            } else {
                resultado.push(`Desde ${filtro.mesMin} hasta ${filtro.mesMax}`)

            }
        } else if (filtro.mesMin !== '') {
            resultado.push(`Desde ${filtro.mesMin}`)

        } else if (filtro.mesMax !== '') {
            resultado.push(`Hasta ${filtro.mesMax}`)

        }
        
        if (filtro.descuento === '1') {
            resultado.push('Con descuento aplicado')
        } else if (filtro.descuento === '0') {
            resultado.push('Sin descuento aplicado')
        }

        if (filtro.calificacion !== '') {
            resultado.push(`Clasificacion: ${filtro.calificacion}`)
        }

        if (filtro.infraccion !== '') {
            resultado.push(`Infracción: ${filtro.infraccion}`)
        }

        if (filtro.denunciante !== '') {
            resultado.push(`Denunciante: ${filtro.denunciante}`)
        }

        // if (filtro.barrio !== '') {
            
        //     resultado.push(``)
        // }

        return resultado
    }

    //Tabla
    const dataTable = () => {
        let data = []
        multas.forEach((multa) => {
            data.push({
                ...multa,
                descuento: multa.descuento === true ? 'SI' : 'NO',
                calificacion: multa.calificacione.calificacion_multa,
                vel_limite: multa.vel_limite === null ? '-' : multa.vel_limite,
                vel_circula: multa.vel_circula === null ? '-' : multa.vel_circula,
                barrioId: multa.barrio !== null ? multa.barrio.nombre : 'Desconocido'
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
            { header: 'Denunciante', accessor: 'denunciante' },
            { header: 'Infracción', accessor: 'infraccion' },
            { header: 'Barrio', accessor: 'barrioId' },
            { header: 'Descuento', accessor: 'descuento'},
            { header: 'Velocidad límite', accessor: 'vel_limite'},
            { header: 'Velocidad de circulación', accessor: 'vel_circula'},
            { header: 'Calificación', accessor: 'calificacion'},
        ]
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

    return(
        <div>
            <NavbarPage></NavbarPage>
            <div className="container" style={{ position: 'relative' }}>
                {loading ?
                    <Loader></Loader>
                :
                    <>
                        <div className="row">
                            <div className="col-xl-1 col-lg-12">
                                <h3>{multas.length} Multas</h3>
                                {!showForm &&
                                    <>
                                        <button className="btn" onClick={handleShow}>
                                            <i class="bi bi-filter"></i>
                                        </button>
                                    {filtro.filtrado &&
                                        <div className="row">
                                            <OverlayTrigger placement="bottom"
                                                            trigger='click'
                                                            overlay={popover}
                                            >
                                                <button className="btn">Mostrar filtrado</button>
                                            </OverlayTrigger>
                                        </div>
                                    }
                                    </>
                                }
                                <Offcanvas show={showForm} onHide={handleClose} style={{ width: '650px' }} className="custom-offcanvas canvas">
                                    <Offcanvas.Body>
                                        <FormMultas handleFilter={handleFilter}
                                                    handleClose={handleClose}
                                        />
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </div>
                            <div className="col-xl-11 col-lg-12">
                                <div className="row">
                                    <DynamicTable data={dataTable()}
                                                  columns={dataColumns()}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Multas