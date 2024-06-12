import { Col, Form, OverlayTrigger, Popover } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { activarFiltro, vaciarFiltro, handleChange, getMultasInicio } from "../features/radar/dataMultaSlice"
import { useState } from "react"

const FormMultas = ({ handleFilter, handleClose }) => {

    const dispatch = useDispatch()
    const filtro = useSelector(state => state.multas.filtro)
    const barrios = useSelector(state => state.multas.barrios)

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.costeMin && !filtro.costeMax && !filtro.infraccion &&
            !filtro.puntosMin && !filtro.puntosMax && !filtro.denunciante &&
            !filtro.horaMin && !filtro.horaMax && !filtro.barrio &&
            !filtro.mesMin && !filtro.mesMax &&
            !filtro.calificacion && !filtro.descuento) {
                
            alert('Datos incompletos')
            return;
        }

        dispatch(activarFiltro())
        handleFilter(filtro)
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro())
        dispatch(getMultasInicio())
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
                                          placeholder="Desde"
                                          className="me-2"
                                          value={filtro.puntosMin}
                                          style={{ width: '100px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                            <Form.Control type="number"
                                          min="0"
                                          max="15"
                                          name="puntosMax"
                                          placeholder="Hasta"
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
                                          placeholder="Desde"
                                          className="me-2"
                                          value={filtro.costeMin}
                                          style={{ width: '200px' }}
                                          onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                            />
                            <Form.Control type="number"
                                          min="0"
                                          max="1000"
                                          name="costeMax"
                                          placeholder="Hasta"
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
                            <Form.Label className="fw-bold me-2" htmlFor="infraccion">Infracción</Form.Label>
                            <Form.Control type="text" 
                                          className='me-4' 
                                          style={{ width: '300px' }} 
                                          id="infraccion"
                                          name="infraccion"
                                          value={filtro.infraccion} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            />
                            <OverlayTrigger placement="right"
                                            trigger='click'
                                            overlay={popoverInfraccion}
                                            style={{ width: '300px', height: '400px' }}
                            >
                                <button type="button" className="btn">Ejemplos infracciones</button>
                            </OverlayTrigger>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
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
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
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
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="mes">Desde</Form.Label>
                            <Form.Control type="month"
                                            id="mes1"
                                            name="mesMin"
                                            value={filtro.mesMin}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            style={{ width: '200px' }}
                                            className="me-4"
                                            isInvalid={!!filtro.error.mes}
                            />
                            <Form.Label className="fw-bold me-2" htmlFor="mes2">Hasta</Form.Label>
                            <Form.Control type="month"
                                            id="mes2"
                                            name="mesMax"
                                            value={filtro.mesMax}
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                            style={{ width: '200px' }}
                                            isInvalid={!!filtro.error.mes}
                            />
                            <Form.Control.Feedback type='invalid'>
                                {filtro.error.mes}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="hora1">Desde</Form.Label>
                            <Form.Control type="time"
                                          className="me-4"
                                          id="hora1"
                                          name="horaMin"
                                          value={filtro.horaMin}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            />
                            <Form.Label className="fw-bold me-2" htmlFor="hora2">Hasta</Form.Label>
                            <Form.Control type="time"
                                          className="me-4"
                                          id="hora2"
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

export default FormMultas