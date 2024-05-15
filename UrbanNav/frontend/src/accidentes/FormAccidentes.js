import { useEffect, useState } from "react"
import { Form, Col } from 'react-bootstrap';
import { useForm } from "./useFormAccidentes.js"

const initialForm = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    edad1: '',
    edad2: '',
    vehiculo: '',
    drogas: '',
    alcohol: '',
    lesion: '',
    sexo: '',
    accidente: '',
    clima: '',
    radio: {
        activo: false,
        distancia: 0,
        lat: 0,
        lon: 0
    },
    zona: []
}


const FormAccidentes = ({ handleFilter, markerPosition, filtro }) => {

    const { 
        form,
        setForm,
        errors,
        response,
        handleChange,
        handleSubmit,
        vaciarFiltro } = useForm(initialForm, handleFilter, filtro)


    return(
        <div className='card'>
            <div className='card-title'>
                <h3>Filtrar por: </h3> <br/>
            </div>
            <div className='card-body'> 
                <Form onSubmit={(event) => handleSubmit(event, markerPosition)}>
                    <div className="row">
                            {!form.radio.activo ? 
                                <button className="btn btn-azul mb-3 me-4" 
                                        type="button" 
                                        name="activo"
                                        onClick={handleChange} 
                                >Mostrar marcador arrastrable</button>
                            :
                            <>
                                <input className="mb-3"
                                       type="number"
                                       value={form.radio.distancia}
                                       disabled="true"
                                       style={{ width: '90px' }}
                                />
                                <Form.Group as={Col}>
                                    <Form.Label>Selecciona un radio en metros</Form.Label>
                                    <Form.Range value={form.radio.distancia}
                                                onChange={handleChange}
                                                id="radio"
                                                name="distancia"
                                                min={0}
                                                max={38000}
                                                step={100}
                                    />
                                </Form.Group>
                                <button className="btn btn-rojo mb-3 me-4"
                                        type="button"
                                        name="inactivo"
                                        onClick={handleChange}
                                >Ocultar marcador arrastrable</button>
                            </>
                            }
                    </div>
                    <div className="row mb-4">
                        <Form.Group as={Col} sm={12} md={6}
                                    controlId="alcohol" 
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2">Alcohol</Form.Label>
                            <Form.Control as="select" 
                                        className="form-select" 
                                        style={{ width: '180px' }}
                                        value={form.alcohol} 
                                        name="alcohol" 
                                        onChange={handleChange}
                            >
                                    <option value="">Ninguno</option>
                                    <option value="1">Positivo</option>
                                    <option value="0">Negativo</option>
                                </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} sm={12} md={6}
                                    controlId="drogas" 
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2">Drogas</Form.Label>
                            <Form.Control as="select" 
                                          className="form-select" 
                                          style={{ width: '180px' }}
                                          value={form.drogas} 
                                          name="drogas" 
                                          onChange={handleChange}
                            >
                                <option value="">Ninguno</option>
                                <option value="1">Positivo</option>
                                <option value="0">Negativo</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Form.Group as={Col} sm={12} md={6}
                                    controlId="vehiculo" 
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2">Vehiculo</Form.Label>
                            <Form.Control as="select" 
                                          className="form-select" 
                                          style={{ width: '180px' }}
                                          value={form.vehiculo} 
                                          name="vehiculo" 
                                          onChange={handleChange}
                            >
                                <option value="">Ninguno</option>
                                <option value="Todo terreno">Todo terreno</option>
                                <option value="Turismo">Turismo</option>
                                <option value="hasta">Motocicleta hasta 125cc</option>
                                <option value="Furgoneta">Furgoneta</option>
                                <option value="articulado">Vehículo articulado</option>
                                <option value="Autobus">Autobús</option>
                                <option value="Camion">Camión rígido</option>
                                <option value="Ciclomotor">Ciclomotor</option>
                                <option value="Tractocamion">Tractocamión</option>
                                <option value=">">Motocicleta mas de 125cc</option>
                                <option value="Bicicleta">Bicicleta</option>
                                <option value="Otros">Otros vehiculos con motor</option>
                                <option value="EPAC">Bicicleta EPAC</option>
                                <option value="obras">Maquinaria de obras</option>
                                <option value="vmu">VMU electrico</option>
                            </Form.Control>
                        </Form.Group>
                        
                        <Form.Group as={Col} sm={12} md={6}
                                    controlId="accidente" 
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2">Accidente</Form.Label>
                            <Form.Control as="select" 
                                          className="form-select" 
                                          style={{ width: '180px' }}
                                          value={form.accidente} 
                                          name="accidente" 
                                          onChange={handleChange}
                            >
                                <option value="">Ninguno</option>
                                <option value="doble">Colisión doble</option>
                                <option value="multiple">Colisión múltiple</option>
                                <option value="alcance">Alcance</option>
                                <option value="obstaculo">Choque contra obstáculo fijo</option>
                                <option value="persona">Atropello a persona</option>
                                <option value="vuelco">Vuelco</option>
                                <option value="caida">Caída</option>
                                <option value="otro">Otro</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center">
                            <Form.Label className='me-4 fw-bold'>Gravedad de la lesión:</Form.Label>
                            <Form.Check inline className="form-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    value="LEVE" 
                                    id="leve"
                                    name="lesion"
                                    checked={form.lesion === 'LEVE'} 
                                    onChange={handleChange} 
                                />
                                <Form.Check.Label htmlFor="leve">Leve</Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline className="form-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    value="GRAVE" 
                                    id="grave"
                                    name="lesion"
                                    checked={form.lesion === 'GRAVE'} 
                                    onChange={handleChange} 
                                />
                                <Form.Check.Label htmlFor="grave">Grave</Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline className="form-check-inline">
                                <Form.Check.Input 
                                    type="radio" 
                                    value="FALLECIDO" 
                                    id="fallecido"
                                    name="lesion"
                                    checked={form.lesion === 'FALLECIDO'} 
                                    onChange={handleChange} 
                                />
                                <Form.Check.Label htmlFor="fallecido">Fallecido</Form.Check.Label>
                            </Form.Check>
                        </Col>
                    </div>
                    <div className="row mb-3">  
                        <Form.Group as={Col} sm={12} md={6}
                                    controlId="sexo" 
                                    className="d-flex align-items-center mb-sm-2 mb-md-2 mb-2"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="sexo">Sexo</Form.Label>
                            <Form.Control as="select" 
                                          className="form-select" 
                                          style={{ width: '180px' }}
                                          value={form.sexo} 
                                          id="sexo"
                                          name="sexo" 
                                          onChange={handleChange}
                            >
                                <option value="">Ninguno</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} xs={6} sm={6} md={6} lg={6} xl={6}
                                    controlId="clima" 
                                    className="d-flex align-items-center"
                        >
                            <Form.Label className="fw-bold me-2" htmlFor="clima">Clima</Form.Label>
                            <Form.Control as="select" 
                                          className='form-select' 
                                          style={{ width: '180px' }} 
                                          value={form.clima} 
                                          id="clima" 
                                          name="clima" 
                                          onChange={handleChange}
                            >
                                    <option value="">Ninguno</option>
                                    <option value="Despejado">Despejado</option>
                                    <option value="Nublado">Nublado</option>
                                    <option value="debil">Lluvia débil</option>
                                    <option value="intensa">Lluvia intensa</option>
                                    <option value="Granizando">Granizando</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="horaConcreta">Hora concreta</Form.Label>
                            <Form.Control 
                                type="time" 
                                className='me-4' 
                                value={form.hora1} 
                                id="horaConcreta"
                                name="hora1"
                                onChange={handleChange}/>
                        </Col>
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="entreHoras">Entre 2 horas</Form.Label>
                            <Form.Control 
                                type="time" 
                                className='me-2' 
                                value={form.hora1} 
                                id="entreHoras"
                                name="hora1"
                                onChange={handleChange} />
                            <Form.Control 
                                type="time" 
                                value={form.hora2} 
                                name="hora2"
                                onChange={handleChange} />
                        </Col>
                    </div>
                    <div className="row mb-3">
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="fechaConcreta">Fecha concreta</Form.Label>
                            <Form.Control 
                                type="date" 
                                className='me-4' 
                                value={form.fecha1} 
                                id="fechaConcreta"
                                name="fecha1"
                                onChange={handleChange}/>
                        </Col>
                        <Col className="d-flex align-items-center mb-3">
                            <Form.Label className='fw-bold me-2' htmlFor="entreFechas">Entre 2 fechas</Form.Label>
                            <Form.Control 
                                type="date" 
                                className='me-2' 
                                value={form.fecha1} 
                                id="entreFechas"
                                name="fecha1"
                                onChange={handleChange} />
                            <Form.Control 
                                type="date" 
                                value={form.fecha2} 
                                name="fecha2"
                                onChange={handleChange} />
                        </Col>
                    </div>
                    <input className="btn btn-azul me-4" type="submit" value="Filtrar"></input>
                    <button className='btn btn-rojo' type='button' onClick={vaciarFiltro}>Limpiar filtro</button>
                </Form>
            </div>
        </div>
    )
}

export default FormAccidentes