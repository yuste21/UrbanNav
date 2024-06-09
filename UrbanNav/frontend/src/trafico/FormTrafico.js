import { useFormTrafico } from "./UseFormTrafico"
import { Form, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from "react-redux"
import { handleChange, activarFiltro, getAll, vaciarFiltro, getDataTraficoInicio } from "../features/trafico/dataTraficoSlice"

const FormTrafico = ({ handleFilter }) => {
    //const {form, handleSubmit, handleChange, vaciarFiltro, getAll} = useFormTrafico(initialForm, handleFilter)

    const dispatch = useDispatch()
    const filtro = useSelector(state => state.trafico.filtro)
    const handleSubmit = (e) => {
        e.preventDefault()

        dispatch(activarFiltro())
        handleFilter()
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro())
        dispatch(getDataTraficoInicio())
    }

    return(
        <>
            <div className="card">
                <div className="card-title">
                    <h3>Filtrar por: </h3> <br/>
                </div>
                <div className="card-body">
                    <Form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <Form.Group as={Col}
                                        className="d-flex align-items-center"
                            >
                                <Form.Label className="fw-bold me-2" htmlFor="mes">Introduce un mes</Form.Label>
                                <Form.Control type="month"
                                              id="mes"
                                              name="mes"
                                              value={filtro.mes}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              style={{ width: '200px' }}
                                />
                            </Form.Group>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2" htmlFor="entreFechas">Entre 2 fechas</Form.Label>
                                <Form.Control type="date"
                                              className="me-2"
                                              value={filtro.fecha1}
                                              id="entreFechas"
                                              name="fecha1"
                                              style={{ width: '150px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                />
                                <Form.Control type="date"
                                              value={filtro.fecha2}
                                              name="fecha2"
                                              style={{ width: '150px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2" htmlFor="fechaConcreta">Fecha concreta</Form.Label>
                                <Form.Control type="date"
                                              value={filtro.fecha1}
                                              id="fechaConcreta"
                                              name="fecha1"
                                              style={{ width: '150px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2" htmlFor="entreHoras">Entre 2 horas</Form.Label>
                                <Form.Control type="time"
                                              value={filtro.hora1}
                                              id="entreHoras"
                                              name="hora1"
                                              style={{ width: '100px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              className="me-2"
                                />
                                <Form.Control type="time"
                                              value={filtro.hora2}
                                              name="hora2"
                                              style={{ width: '100px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              className="me-2"
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2" htmlFor="horaConcreta">Hora concreta</Form.Label>
                                <Form.Control type="time"
                                              value={filtro.hora1}
                                              id="horaConcreta"
                                              name="hora1"
                                              style={{ width: '100px' }}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              className="me-2"
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
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
                            </Col>
                        </div>
                        <div className="row">
                            <Col className="mb-sm-2 mb-2">
                                <input className='btn btn-azul' 
                                       type='submit' 
                                       value='Filtrar'
                                />
                            </Col>
                            <Col className="mb-sm-2 mb-2">
                                <input className="btn"
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