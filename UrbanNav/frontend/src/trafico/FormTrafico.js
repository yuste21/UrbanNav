import { useFormTrafico } from "./UseFormTrafico"
import { Form, Col } from 'react-bootstrap'

const initialForm = {
    mes: '',
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    sentido: '',
    getAll: false
}

const FormTrafico = ({ handleFilter }) => {
    const {form, handleSubmit, handleChange, vaciarFiltro, getAll} = useFormTrafico(initialForm, handleFilter)

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
                                        controlId="mes"
                                        className="d-flex align-items-center"
                            >
                                <Form.Label className="fw-bold me-2">Introduce un mes</Form.Label>
                                <Form.Control type="month"
                                              id="mes"
                                              name="mes"
                                              value={form.mes}
                                              onChange={handleChange}
                                              style={{ width: '200px' }}
                                />
                            </Form.Group>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2">Entre 2 fechas</Form.Label>
                                <Form.Control type="date"
                                              className="me-2"
                                              value={form.fecha1}
                                              id="fecha1"
                                              name="fecha1"
                                              style={{ width: '150px' }}
                                              onChange={handleChange}
                                />
                                <Form.Control type="date"
                                              value={form.fecha2}
                                              id="fecha2"
                                              name="fecha2"
                                              style={{ width: '150px' }}
                                              onChange={handleChange}
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2">Fecha concreta</Form.Label>
                                <Form.Control type="date"
                                              value={form.fecha1}
                                              id="fechaConcreta"
                                              name="fecha1"
                                              style={{ width: '150px' }}
                                              onChange={handleChange}
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2">Entre 2 horas</Form.Label>
                                <Form.Control type="time"
                                              value={form.hora1}
                                              id="hora1"
                                              name="hora1"
                                              style={{ width: '100px' }}
                                              onChange={handleChange}
                                              className="me-2"
                                />
                                <Form.Control type="time"
                                              value={form.hora2}
                                              id="hora2"
                                              name="hora2"
                                              style={{ width: '100px' }}
                                              onChange={handleChange}
                                              className="me-2"
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2">Hora concreta</Form.Label>
                                <Form.Control type="time"
                                              value={form.hora1}
                                              id="horaConcreta"
                                              name="hora1"
                                              style={{ width: '100px' }}
                                              onChange={handleChange}
                                              className="me-2"
                                />
                            </Col>
                        </div>
                        <div className="row mb-4">
                            <Col className="d-flex align-items-center">
                                <Form.Label className="fw-bold me-2">Selecciona un sentido</Form.Label>
                                <Form.Control as="select"
                                            className="form-select"
                                            style={{ width: '200px' }}
                                            value={form.sentido}
                                            id="sentido"
                                            name="sentido"
                                            onChange={handleChange}
                                >
                                    <option value="">Ninguno</option>
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
                                <input className="btn btn-rojo"
                                       type="button"
                                       onClick={vaciarFiltro}
                                       value='Limpiar filtro'
                                />
                            </Col>
                            <Col>   
                                <input className="btn btn-amarillo"
                                       type="button"
                                       onClick={getAll}
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