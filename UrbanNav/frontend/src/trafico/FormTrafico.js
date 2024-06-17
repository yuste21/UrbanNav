import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Form, Col } from 'react-bootstrap'
import { 
    handleChange, 
    activarFiltro, 
    getAll, 
    vaciarFiltro, 
    getDataTraficoInicio 
} from "../features/trafico/dataTraficoSlice"

const FormTrafico = ({ handleFilter, handleClose }) => {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.trafico.filtro)
    const [validated, setValidated] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.fecha1 && !filtro.fecha2 && !filtro.mes && !filtro.hora1 && !filtro.hora2 && 
            !filtro.sentido && !filtro.getAll) {
            alert('Datos incompletos')
            return
        } else if (filtro.error.fecha !== '' || filtro.error.hora !== '' || filtro.error.mes !== '') {
            setValidated(false)
            return
        }

        setValidated(true)
        dispatch(activarFiltro())
        handleFilter()
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro());    // Limpiar filtro
        const confirmacion = window.confirm('¿Deseas realizar la carga inicial de datos?');
        
        if (confirmacion) {
            dispatch(getDataTraficoInicio());     // Carga inicial
        } else {
            // Si el usuario no confirma, simplemente retornar
            return;
        }
    }

    return(
        <>
            <div className="card">
                <div className="card-title">
                    <div className="button-container">
                        <button onClick={handleClose} className="btn">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <div className="row mb-2">
                            <Form.Group as={Col} className="d-flex flex-column align-items-start">
                                <Form.Label className="fw-bold me-2" htmlFor="mes">Introduce un mes</Form.Label>
                                <Form.Control type="month"
                                              id="mes"
                                              name="mes"
                                              value={filtro.mes}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              style={{ width: '200px' }}
                                              isInvalid={!!filtro.error.mes}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {filtro.error.mes}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="row mb-2">
                            <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                                <div className="d-flex align-items-center mb-2">
                                    <Form.Label className="fw-bold me-2" htmlFor="fecha1">Desde</Form.Label>
                                    <Form.Control type="date"
                                                  className="me-2"
                                                  value={filtro.fecha1}
                                                  id="fecha1"
                                                  name="fecha1"
                                                  style={{ width: '150px' }}
                                                  onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                  isInvalid={!!filtro.error.fecha}
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                                <div className="d-flex align-items-center mb-2">
                                    <Form.Label className="fw-bold me-2" htmlFor="fecha2">Hasta</Form.Label>
                                    <Form.Control type="date"
                                                  value={filtro.fecha2}
                                                  id="fecha2"
                                                  name="fecha2"
                                                  style={{ width: '150px' }}
                                                  onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                  isInvalid={!!filtro.error.fecha}
                                    />
                                </div>
                                <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                    {filtro.error.fecha}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="row mb-2">
                            <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                                <div className="d-flex align-items-center mb-2">
                                    <Form.Label className="fw-bold me-2" htmlFor="hora1">Desde</Form.Label>
                                    <Form.Control type="time"
                                                  value={filtro.hora1}
                                                  id="hora1"
                                                  name="hora1"
                                                  style={{ width: '100px' }}
                                                  onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                  className="me-2"
                                                  isInvalid={!!filtro.error.hora}
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                                <div className="d-flex align-items-center mb-2">
                                    <Form.Label className="fw-bold me-2" htmlFor="hora2">Hasta</Form.Label>
                                    <Form.Control type="time"
                                                  value={filtro.hora2}
                                                  id="hora2"
                                                  name="hora2"
                                                  style={{ width: '100px' }}
                                                  onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                  className="me-2"
                                                  isInvalid={!!filtro.error.hora}
                                    />
                                </div>
                                <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                    {filtro.error.hora}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="row mb-4">
                            <Form.Group className="d-flex flex-column align-items-start">
                                <Form.Label className="fw-bold me-2" htmlFor="sentido">Selecciona un sentido</Form.Label>
                                <Form.Control as="select"
                                              className="filtro-select"
                                              style={{ width: '200px' }}
                                              value={filtro.sentido}
                                              id="sentido"
                                              name="sentido"
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="Norte-Sur">Norte - Sur</option>
                                    <option value="Sur-Norte">Sur - Norte</option>
                                    <option value="Este-Oeste">Este - Oeste</option>
                                    <option value="Oeste-Este">Oeste - Este</option>
                                </Form.Control>
                            </Form.Group>
                        </div>
                        <div className="row">
                            <Col className="mb-sm-2 mb-2">
                                <input className='btn btn-azul' 
                                       type='submit' 
                                       value='Filtrar'
                                />
                            </Col>
                            <Col className="mb-sm-2 mb-2">
                                <input className="btn btn-rojo"
                                       type="button"
                                       onClick={limpiarFiltro}
                                       value='Limpiar filtro'
                                />
                            </Col>
                            <Col>   
                                <input className="btn btn-amarillo"
                                       type="button"
                                       onClick={(e) => {
                                            dispatch(getAll())
                                            handleSubmit(e)
                                       }}
                                       value='Mostrar todo el trafico'
                                />
                            </Col>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    )
}

export default FormTrafico