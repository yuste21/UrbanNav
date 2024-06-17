import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Col, Form, OverlayTrigger, Popover } from "react-bootstrap"
import { activarFiltro, vaciarFiltro, handleChange, getMultasInicio } from "../features/radar/dataMultaSlice"

const FormMultas = ({ handleFilter, handleClose }) => {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.multas.filtro)
    const barrios = useSelector(state => state.multas.barrios)
    const [validated, setValidated] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.costeMin && !filtro.costeMax && !filtro.infraccion &&
            !filtro.puntosMin && !filtro.puntosMax && !filtro.denunciante &&
            !filtro.horaMin && !filtro.horaMax && !filtro.barrio &&
            !filtro.mesMin && !filtro.mesMax &&
            !filtro.calificacion && !filtro.descuento) {
                
            alert('Datos incompletos')
            return;
        } else if (filtro.error.hora !== '' || filtro.error.coste !== '' 
                || filtro.error.puntos !== '' || filtro.error.mes !== '') {
            
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
            dispatch(getMultasInicio());     // Carga inicial
        } else {
            // Si el usuario no confirma, simplemente retornar
            return;
        }
    }

    const popoverInfraccion = (
        <Popover id="popover2" style={{ maxWidth: '300px', width: 'auto', maxHeight: '400px' }} >
            <Popover.Body className="popover-body">
                <ul className="list-group">
                    <li className="list-group-item">Estacionar en lugar prohibido</li>
                    <li className="list-group-item">Estacionar sobre la acera</li>
                    <li className="list-group-item">Rebasar un semáforo en fase roja</li>
                    <li className="list-group-item">Estacionar en lugar prohibido</li>
                    <li className="list-group-item">Circular en sentido contrario al establecido</li>
                    <li className="list-group-item">No respetar la señalización</li>
                    <li className="list-group-item">Conducir utilizando dispositivo de telefonía móvil, sujetándolo con la mano</li>
                    <li className="list-group-item">No obedecer las órdenes del agente que regula la circulación</li>
                    <li className="list-group-item">Circular sin la debida precaución</li>
                    <li className="list-group-item">Circular sobre un carril de circulación reservada</li>
                    <li className="list-group-item">Estacionar en carril de circulación</li>
                    <li className="list-group-item">Efectuar un cambio de sentido prohibido</li>
                    <li className="list-group-item">Circular por carril bus</li>
                    <li className="list-group-item">Efectuar cambio de dirección prohibido</li>
                    <li className="list-group-item">Estacionar en zona de horario de carga y descarga sin realizar una operación con esa finalidad</li>
                    <li className="list-group-item">Estacionar en lugar reservado temporalmente para otros usos señalizado al menos con 48 horas de antelación</li>
                    <li className="list-group-item">Estacionar en intersección obstaculizando gravemente la circulación</li>
                    <li className="list-group-item">Estacionar obstaculizando la utilización normal de un paso de peatones</li>
                    <li className="list-group-item">Estacionar motocicleta o ciclomotor sobre la acera de forma antireglamentaria</li>
                    <li className="list-group-item">Conducir con una tasa de alcohol no permitida</li>
                    {/* <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li>
                    <li className="list-group-item"></li> */}
                </ul>
            </Popover.Body>
        </Popover>
    )

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
                    
                    {/* MES */}
                    <div className="row mb-3">
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Label className="fw-bold me-2" htmlFor="mes1">Desde</Form.Label>
                                <Form.Control type="month"
                                              id="mes1"
                                              name="mesMin"
                                              value={filtro.mesMin}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                              style={{ width: '210px' }}
                                              className="me-4"
                                              isInvalid={!!filtro.error.mes}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <Form.Label className="fw-bold me-2" htmlFor="mes2">Hasta</Form.Label>
                                <Form.Control
                                    type="month"
                                    id="mes2"
                                    name="mesMax"
                                    value={filtro.mesMax}
                                    onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                    style={{ width: '210px' }}
                                    isInvalid={!!filtro.error.mes}
                                />
                            </div>
                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                {filtro.error.mes}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    {/* INFRACCION */}
                    <div className="row mb-3">  
                        <Form.Group as={Col} className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center">
                            <Form.Label className="fw-bold me-2" htmlFor="infraccion">Infracción</Form.Label>
                            <Form.Control type="text" 
                                          style={{ width: '80%' }} 
                                          id="infraccion"
                                          name="infraccion"
                                          value={filtro.infraccion} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            />
                            </div>
                        </Form.Group>
                        <Col xs={12} sm={6} className="d-flex flex-column align-items-start">
                            <OverlayTrigger placement="bottom"
                                            trigger='click'
                                            overlay={popoverInfraccion}
                                            style={{ width: '300px', height: '400px' }}
                            >
                                <button type="button" className="btn">Ejemplos infracciones</button>
                            </OverlayTrigger>
                        </Col>
                    </div>

                    {/* DENUNCIANTE + BARRIO */}
                    <div className="row mb-3">
                        <Form.Group as={Col} className="d-flex flex-column align-items-start mb-3">
                            <Form.Label className="fw-bold me-2" htmlFor="denunciante">Denunciante</Form.Label>
                            <Form.Control as="select" 
                                          className='filtro-select' 
                                          style={{ width: '180px' }} 
                                          id="denunciante"
                                          name="denunciante"
                                          value={filtro.denunciante} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                    <option value="">Sin especificar</option>
                                    <option value="MEDIOS DE CAPTACION DE IMAGEN">Medios de captación de imagen</option>
                                    <option value="AGENTES DE MOVILIDAD">Agentes de movilidad</option>
                                    <option value="SER">Servicio de estacionamiento regulado (SER)</option>
                                    <option value="POLICIA MUNICIPAL">Policía municipal</option>
                                    <option value="SACE">Servicio de apoyo al control de estacionamiento (SACE)</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} className="d-flex flex-column align-items-start">
                            <Form.Label className="fw-bold me-2" htmlFor="barrio">Barrio</Form.Label>
                            <Form.Control as="select"
                                          className="filtro-select"
                                          style={{ width: '180px' }}
                                          id="barrio"
                                          name="barrio"
                                          value={filtro.barrio}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            >
                                <option value="">Sin especificar</option>
                                {barrios.map((barrio) => (
                                    <option value={barrio.id}>{barrio.nombre}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </div>

                    <input className="btn btn-azul me-4" type="submit" value="Filtrar"/>
                    <button className="btn btn-rojo" type="button" onClick={() => limpiarFiltro()}>Limpiar Filtro</button>
                </Form>
            </div>
        </div>
    )
}

export default FormMultas