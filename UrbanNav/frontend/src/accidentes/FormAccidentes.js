import { useContext, useEffect, useState } from "react"
import { Form, Col, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { handleChange, initialFilter, vaciarFiltro, activarFiltro, getDataAccidentesInicio, initialError } from "../features/accidente/dataAccidenteSlice.js";
import { store } from "../app/store.js";

const FormAccidentes = ({ handleFilter, handleClose }) => {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.accidentes.filtro)
    const [validated, setValidated] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = event.currentTarget

        if(!filtro.accidente && !filtro.alcohol && !filtro.clima && !filtro.drogas && !filtro.edad1 && 
            !filtro.edad2 && !filtro.fecha1 && !filtro.fecha2 && !filtro.hora1 && !filtro.hora2 && !filtro.lesion && 
            !filtro.sexo && !filtro.vehiculo && filtro.radio.distancia === 0) {
            alert('Datos incompletos')
            return;
        } else if (filtro.error.edad !== '' || filtro.error.fecha !== '' || filtro.error.hora !== '') {
            event.stopPropagation()
            setValidated(false)
            return;
        }
        setValidated(true)
        dispatch(activarFiltro())

        handleFilter(filtro)
    }


    const limpiarFiltro = () => {
        dispatch(vaciarFiltro())    //Limpiar filtro
        dispatch(getDataAccidentesInicio())     //cargaInicial
    }

    return(
        <div className='card'>
            <div className="card-title">
                <div className="button-container">
                    <button onClick={handleClose} className="btn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
            <div className='card-body'> 
                <Form noValidate validated={validated} onSubmit={(event) => handleSubmit(event)} >
                    <div className="row">
                            {!filtro.radio.activo ? 
                                <button className="btn btn-azul mb-3 me-4" 
                                        type="button" 
                                        name="activo"
                                        onClick={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                >Mostrar marcador arrastrable</button>
                            :
                            <>
                                <input className="mb-3"
                                       type="number"
                                       value={filtro.radio.distancia}
                                       disabled={true}
                                       style={{ width: '90px' }}
                                />
                                <Form.Group as={Col}>
                                    <Form.Label htmlFor="radio">Selecciona un radio en metros</Form.Label>
                                    <Form.Range value={filtro.radio.distancia}
                                                onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                                id="radio"
                                                name="distancia"
                                                min={0}
                                                max={20500}
                                                step={100}
                                    />
                                </Form.Group>
                                <button className="btn btn-rojo mb-3 me-4"
                                        type="button"
                                        name="inactivo"
                                        onClick={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                >Ocultar marcador arrastrable</button>
                            </>
                            }
                    </div>
                    <div className="row mb-4">
                        <Form.Group as={Col} sm={12} md={6}
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="alcohol">Alcohol</Form.Label>
                            <Form.Control as="select" 
                                        className="filtro-select" 
                                        style={{ width: '180px' }}
                                        id="alcohol"
                                        name="alcohol"
                                        value={filtro.alcohol} 
                                        onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                    <option value="">Sin especificar</option>
                                    <option value="1">Positivo</option>
                                    <option value="0">Negativo</option>
                                </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} sm={12} md={6}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="drogas">Drogas</Form.Label>
                            <Form.Control as="select" 
                                          className="filtro-select" 
                                          style={{ width: '180px' }}
                                          id="drogas"
                                          name="drogas"
                                          value={filtro.drogas} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                <option value="">Sin especificar</option>
                                <option value="1">Positivo</option>
                                <option value="0">Negativo</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col} sm={12} md={6}
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="vehiculo">Vehiculo</Form.Label>
                            <Form.Control as="select" 
                                          className="filtro-select" 
                                          style={{ width: '180px' }}
                                          id="vehiculo"
                                          name="vehiculo"
                                          value={filtro.vehiculo} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                <option value="">Sin especificar</option>
                                <option value="todo terreno">Todo terreno</option>
                                <option value="turismo">Turismo</option>
                                <option value="motocicleta hasta 125cc">Motocicleta hasta 125cc</option>
                                <option value="furgoneta">Furgoneta</option>
                                <option value="vehículo articulado">Vehículo articulado</option>
                                <option value="autobús">Autobús</option>
                                <option value="camión rígido">Camión rígido</option>
                                <option value="ciclomotor">Ciclomotor</option>
                                <option value="tractocamión">Tractocamión</option>
                                <option value="motocicleta más de 125cc">Motocicleta mas de 125cc</option>
                                <option value="bicicleta">Bicicleta</option>
                                <option value="otros vehículos con motor">Otros vehiculos con motor</option>
                                <option value="bicicleta EPAC">Bicicleta EPAC</option>
                                <option value="maquinaria de obras">Maquinaria de obras</option>
                                <option value="VMU eléctrico">VMU electrico</option>
                            </Form.Control>
                        </Form.Group>
                        
                        <Form.Group as={Col} sm={12} md={6}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="accidente">Accidente</Form.Label>
                            <Form.Control as="select" 
                                          className="filtro-select" 
                                          style={{ width: '180px' }}
                                          id="accidente"
                                          name="accidente"
                                          value={filtro.accidente}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                <option value="">Sin especificar</option>
                                <option value="colisión doble">Colisión doble</option>
                                <option value="colisión multiple">Colisión múltiple</option>
                                <option value="alcance">Alcance</option>
                                <option value="choque contra obstáculo fijo">Choque contra obstáculo fijo</option>
                                <option value="atropello a persona">Atropello a persona</option>
                                <option value="vuelco">Vuelco</option>
                                <option value="caída">Caída</option>
                                <option value="otro">Otro</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center">
                            <Form.Label className='me-4 fw-bold'>Gravedad de la lesión:</Form.Label>
                            <Form.Check inline className="filtro-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    id="cualquiera"
                                    value="" 
                                    name="lesion"
                                    checked={filtro.lesion === ''} 
                                    onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                />
                                <Form.Check.Label htmlFor="cualquiera">Cualquiera</Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline className="filtro-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    id="leve"
                                    value="Leve" 
                                    name="lesion"
                                    checked={filtro.lesion === 'Leve'} 
                                    onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                />
                                <Form.Check.Label htmlFor="leve">Leve</Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline className="filtro-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    id="grave"
                                    value="Grave" 
                                    name="lesion"
                                    checked={filtro.lesion === 'Grave'} 
                                    onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                />
                                <Form.Check.Label htmlFor="grave">Grave</Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline className="filtro-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    id="fallecido"
                                    value="Fallecido" 
                                    name="lesion"
                                    checked={filtro.lesion === 'Fallecido'} 
                                    onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                />
                                <Form.Check.Label htmlFor="fallecido">Fallecido</Form.Check.Label>
                            </Form.Check>
                        </Col>
                    </div>
                    <div className="row mb-3">  
                        <Form.Group as={Col} sm={12} md={6}
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="sexo">Sexo</Form.Label>
                            <Form.Control as="select" 
                                          className="filtro-select" 
                                          style={{ width: '180px' }}
                                          id="sexo"
                                          name="sexo"
                                          value={filtro.sexo} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                <option value="">Sin especificar</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} xs={6} sm={6} md={6} lg={6} xl={6}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="clima">Clima</Form.Label>
                            <Form.Control as="select" 
                                          className='filtro-select' 
                                          style={{ width: '180px' }} 
                                          id="clima"
                                          name="clima"
                                          value={filtro.clima} 
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                            >
                                    <option value="">Sin especificar</option>
                                    <option value="Despejado">Despejado</option>
                                    <option value="Nublado">Nublado</option>
                                    <option value="Lluvia débil">Lluvia débil</option>
                                    <option value="Lluvia intensa">Lluvia intensa</option>
                                    <option value="Granizando">Granizando</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col}
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="edad1">Edad mínima</Form.Label>
                            <Form.Control type="number"
                                          min="0"
                                          max="74"
                                          id="edad1"
                                          name="edad1"
                                          className="me-2"
                                          value={filtro.edad1}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                          isInvalid={!!filtro.error.edad}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.edad}
                            </Form.Control.Feedback>
                            <Form.Label className="fw-bold me-2" htmlFor="edad2">Edad máxima</Form.Label>
                            <Form.Control type="number"
                                          min="0"
                                          max="74"
                                          className="me-2"
                                          name="edad2"
                                          value={filtro.edad2}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                          isInvalid={!!filtro.error.edad}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.edad}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="hora1">Desde</Form.Label>
                            <Form.Control 
                                type="time" 
                                className='me-2' 
                                value={filtro.hora1} 
                                id="hora1"
                                name="hora1"
                                onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                isInvalid={!!filtro.error.hora}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.hora}
                            </Form.Control.Feedback>
                            <Form.Label className='fw-bold me-2' htmlFor="hora2">Hasta</Form.Label>
                            <Form.Control 
                                type="time" 
                                value={filtro.hora2} 
                                id="hora2"
                                name="hora2"
                                onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                isInvalid={!!filtro.error.hora}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.hora}
                            </Form.Control.Feedback>
                        </Col>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="fecha1">Desde</Form.Label>
                            <Form.Control 
                                type="date" 
                                className='me-2' 
                                value={filtro.fecha1} 
                                id="fecha1"
                                name="fecha1"
                                onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                isInvalid={!!filtro.error.fecha}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.fecha}
                            </Form.Control.Feedback>
                            <Form.Label className='fw-bold me-2' htmlFor="fecha2">Hasta</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={filtro.fecha2} 
                                id="fecha2"
                                name="fecha2"
                                onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))} 
                                isInvalid={!!filtro.error.fecha}
                            />
                            <Form.Control.Feedback type="invalid">
                                {filtro.error.fecha}
                            </Form.Control.Feedback>
                        </Col>
                    </div>
                    <input className="btn btn-azul me-4" type="submit" value="Filtrar"></input>
                    <button className='btn btn-rojo' type='button' onClick={() => limpiarFiltro()}>Limpiar filtro</button>
                </Form>
            </div>
        </div>
    )
}

export default FormAccidentes