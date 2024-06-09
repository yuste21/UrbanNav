import { Col, Form } from "react-bootstrap";
import { handleChange, vaciarFiltro, activarFiltro, getDataRadaresInicio } from "../features/radar/dataRadarSlice";
import { useDispatch, useSelector } from "react-redux";

const FormRadares = ({ handleFilter, handleClose }) => {

    const dispatch = useDispatch()
    const filtro = useSelector(state => state.radares.filtro)

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.costeMin && !filtro.costeMax && 
            !filtro.puntosMin && !filtro.puntosMax && 
            !filtro.horaMin && !filtro.horaMax &&
            !filtro.calificacion && !filtro.descuento) {
                
            alert('Datos incompletos')
            return;
        }

        dispatch(activarFiltro())
        handleFilter(filtro)
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro())
        dispatch(getDataRadaresInicio())
    }

    return (    
        <div className="card">
            <div className="card-title">
                <div className="button-container">
                    <button onClick={handleClose} className="btn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
            <div className="card-body">
                <Form onSubmit={(event) => handleSubmit(event)}>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="puntosMin">Penalizacion de puntos</Form.Label>
                            <Form.Control type="number"
                                          min="0"
                                          max="15"
                                          id="puntosMin"
                                          name="puntosMin"
                                          className="me-2"
                                          value={filtro.puntosMin}
                                          style={{ width: '100px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                            <Form.Control type="number"
                                          min="0"
                                          max="15"
                                          name="puntosMax"
                                          className="me-2"
                                          value={filtro.puntosMax}
                                          style={{ width: '100px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="costeMin">Coste de la multa</Form.Label>
                            <Form.Control type="number"
                                          min="0"
                                          max="1000"
                                          id="costeMin"
                                          name="costeMin"
                                          className="me-2"
                                          value={filtro.costeMin}
                                          style={{ width: '200px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                            <Form.Control type="number"
                                          min="0"
                                          max="1000"
                                          name="costeMax"
                                          className="me-2"
                                          value={filtro.costeMax}
                                          style={{ width: '200px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                        </Form.Group>
                    </div>
                    <div className="row mb-3">  
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="calificacion">Calificacion</Form.Label>
                            <Form.Control as="select" 
                                          className='filtro-select' 
                                          style={{ width: '180px' }} 
                                          id="calificacion"
                                          name="calificacion"
                                          value={filtro.calificacion} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                    <option value="">Sin especificar</option>
                                    <option value="LEVE">Leve</option>
                                    <option value="GRAVE">Grave</option>
                                    <option value="MUY GRAVE">Muy grave</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="descuento">Descuento</Form.Label>
                            <Form.Control as="select"
                                          className="filtro-select"
                                          style={{ width: '180px' }}
                                          id="descuento"
                                          name="descuento"
                                          value={filtro.descuento}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                <option value="">Sin especificar</option>
                                <option value="1">SI</option>
                                <option value="0">NO</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="hora1">Hora</Form.Label>
                            <Form.Control type="time"
                                          className="me-4"
                                          id="hora1"
                                          name="horaMin"
                                          value={filtro.horaMin}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            />
                            <Form.Control type="time"
                                          className="me-4"
                                          name="horaMax"
                                          value={filtro.horaMax}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            />
                        </Form.Group>
                    </div>
                    <input className="btn btn-azul me-4" type="submit" value="Filtrar"/>
                    <button className="btn btn-rojo" type="button" onClick={() => limpiarFiltro()}>Limpiar Filtro</button>
                </Form>
            </div>
        </div>
    )
}

export default FormRadares