import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Form } from "react-bootstrap";
import { 
    handleChange,
    vaciarFiltro, 
    activarFiltro, 
    getDataRadaresInicio 
} from "../features/radar/dataRadarSlice";

const FormRadares = ({ handleFilter, handleClose }) => {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.radares.filtro)
    const [validated, setValidated] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.costeMin && !filtro.costeMax && 
            !filtro.puntosMin && !filtro.puntosMax && 
            !filtro.horaMin && !filtro.horaMax &&
            !filtro.calificacion && !filtro.descuento) {
                
            alert('Datos incompletos')
            return;
        } else if (filtro.error.coste !== '' || filtro.error.puntos !== '' || filtro.error.hora !== '') {
            setValidated(false)
            return
        }

        setValidated(true)
        dispatch(activarFiltro())
        handleFilter(filtro)
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro());    // Limpiar filtro
        const confirmacion = window.confirm('¿Deseas realizar la carga inicial de datos?');
        
        if (confirmacion) {
            dispatch(getDataRadaresInicio());     // Carga inicial
        } else {
            // Si el usuario no confirma, simplemente retornar
            return;
        }
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
                <Form noValidate validated={validated} onSubmit={(event) => handleSubmit(event)}>

                    {/* PUNTOS */}
                    <div className="row mb-3">
                        <Form.Label className="fw-bold me-2" htmlFor="puntosMin">Puntos</Form.Label>
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control type="number"
                                            min="0"
                                            max="15"
                                            id="puntosMin"
                                            name="puntosMin"
                                            placeholder="Mínimo"
                                            className="me-2"
                                            value={filtro.puntosMin}
                                            style={{ width: '200px' }}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            isInvalid={!!filtro.error.puntos}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control type="number"
                                            min="0"
                                            max="15"
                                            name="puntosMax"
                                            placeholder="Máximo"
                                            className="me-2"
                                            value={filtro.puntosMax}
                                            style={{ width: '200px' }}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            isInvalid={!!filtro.error.puntos}
                                />
                            </div>
                            <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                {filtro.error.puntos}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    {/* COSTE */}
                    <div className="row mb-3">
                        <Form.Label className="fw-bold me-2" htmlFor="costeMin">Coste</Form.Label>
                        <Form.Group as={Col} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control type="number"
                                            min="0"
                                            max="1000"
                                            id="costeMin"
                                            name="costeMin"
                                            placeholder="Mínimo"
                                            className="me-2"
                                            value={filtro.costeMin}
                                            style={{ width: '200px' }}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            isInvalid={!!filtro.error.coste}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group as={Col} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control type="number"
                                            min="0"
                                            max="1000"
                                            name="costeMax"
                                            placeholder="Máximo"
                                            className="me-2"
                                            value={filtro.costeMax}
                                            style={{ width: '200px' }}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            isInvalid={!!filtro.error.coste}
                                />
                            </div>
                            <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                {filtro.error.coste}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    {/* CALIFICACION + DESCUENTO */}
                    <div className="row mb-3">  
                        <Form.Group as={Col} className="d-flex flex-column align-items-start mb-2">
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
                        <Form.Group as={Col} className="d-flex flex-column align-items-start">
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

                    {/* HORA */}
                    <div className="row mb-3">
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Label className="fw-bold me-2" htmlFor="hora1">Desde</Form.Label>
                                <Form.Control type="time"
                                            className="me-4"
                                            id="hora1"
                                            name="horaMin"
                                            value={filtro.horaMin}
                                            onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                            isInvalid={!!filtro.error.hora}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Label className="fw-bold me-2" htmlFor="hora2">Hasta</Form.Label>
                                <Form.Control type="time"
                                            className="me-4"
                                            name="horaMax"
                                            value={filtro.horaMax}
                                            onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                            isInvalid={!!filtro.error.hora}
                                />
                            </div>
                            <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                {filtro.error.hora}
                            </Form.Control.Feedback>
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