import { Form, Col } from 'react-bootstrap'
import { handleChange, 
        getFlujoAccidenteDistritoFecha, getFlujoAccidenteDistritoHora,
        getFlujoAccidenteBarrioFecha, getFlujoAccidenteBarrioHora,
        getFlujoTraficoDistritoFecha, getFlujoTraficoDistritoHora, 
        getFlujoTraficoEstacionFecha, getFlujoTraficoEstacionHora,
        vaciarFiltro,
        getFlujoTraficoBarrioHora,
        getFlujoTraficoBarrioFecha
 } from "../features/flujo/dataFlujoSlice"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useState } from 'react'

const FormFlujo = ({ entidad, tipo }) => {
    const dispatch = useDispatch()
    const filtro = useSelector(state => state.flujo.filtro)
    const navigate = useNavigate()
    const [validated, setValidated] = useState(false)

    //entidad será el objeto correspondiente: estacion, distrito o barrio
    //tipo nos indica que objeto de los 2 es aforo
    const handleSubmit = async (event, entidad, tipo) => {
        event.preventDefault()

        if(filtro.fecha1 !== '' && filtro.fecha2 !== '' && filtro.hora1 !== '' && filtro.hora2 !== '') {
            alert('Solo puedes filtrar por la fecha o por la hora')
            return
        } else if((filtro.fecha1 !== '' && filtro.fecha2 === '') || (filtro.fecha1 === '' && filtro.fecha2 !== '')) {
            alert('Debes insertar ambas fechas')
            return
        } else if((filtro.hora1 !== '' && filtro.hora2 === '') || (filtro.hora1 === '' && filtro.hora2 !== '')) {
            alert('Debes insertar ambas horas')
            return
        } else if(filtro.fecha1 === '' && filtro.fecha2 === '' && filtro.hora1 === '' && filtro.hora2 === '') {
            alert('Datos incompletos')
            return
        } else if (filtro.error.hora !== '' || filtro.error.fecha !== '') {
            setValidated(false)
            return
        }

        setValidated(true)
        var info
        var tipo_dato = tipo
        if(tipo === 'estacion') {
            if(filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                dispatch(getFlujoTraficoEstacionFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoTraficoEstacionHora({ filtro, entidad }))
                info = 'hora'
            }
        } else if(tipo === 'trafico distrito'){
            if(filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                dispatch(getFlujoTraficoDistritoFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoTraficoDistritoHora({ filtro, entidad }))
                info = 'hora'
            }
        } else if (tipo === 'trafico barrio') {
            if (filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                dispatch(getFlujoTraficoBarrioFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoTraficoBarrioHora({ filtro, entidad }))
                info = 'hora'
            }
        } else if(tipo === 'accidente distrito') {
            if(filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                dispatch(getFlujoAccidenteDistritoFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoAccidenteDistritoHora({ filtro, entidad }))
                info = 'hora'
            }
        } else {    //accidente barrio
            if(filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                dispatch(getFlujoAccidenteBarrioFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoAccidenteBarrioHora({ filtro, entidad }))
                info = 'hora'
            }
        }
        
        navigate('/flujo', { state: { info: info, tipo: tipo_dato } })

    }

    return(
        <>
            <Form noValidate validated={validated} onSubmit={(event) => handleSubmit(event, entidad, tipo)}>
                <div className="row mb-2">
                    <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                        <div className='d-flex align-items-center mb-2'>
                            <Form.Label className="fw-bold me-2" htmlFor='fecha1'>Desde</Form.Label>
                            <Form.Control type="date"
                                        id="fecha1"
                                        name="fecha1"
                                        value={filtro.fecha1}
                                        onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                        className="me-2"
                                        isInvalid={!!filtro.error.fecha}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                        <div className='d-flex align-items-center mb-2'>
                            <Form.Label className="fw-bold me-2" htmlFor='fecha2'>Hasta</Form.Label>
                            <Form.Control type="date"
                                        id="fecha2"
                                        name="fecha2"
                                        value={filtro.fecha2}
                                        onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
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
                        <div className='d-flex align-items-center mb-2'>
                            <Form.Label className="fw-bold me-2" htmlFor='hora1'>Desde</Form.Label>
                            <Form.Control type="time"
                                          id="hora1"
                                          name="hora1"
                                          value={filtro.hora1}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                          className="me-2"
                                          isInvalid={!!filtro.error.hora}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group as={Col} xs={12} sm={6} className="d-flex flex-column align-items-start">
                        <div className='d-flex align-items-center'>
                            <Form.Label className="fw-bold me-2" htmlFor='hora2'>Hasta</Form.Label>
                            <Form.Control type="time"
                                          id="hora2"
                                          name="hora2"
                                          value={filtro.hora2}
                                          onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                          isInvalid={!!filtro.error.hora}
                            />
                        </div>
                        <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                            {filtro.error.hora}
                        </Form.Control.Feedback>
                    </Form.Group>
                </div>
                <input type='submit' className='btn btn-azul me-2' />
                <button type='button' className='btn btn-rojo' onClick={() => dispatch(vaciarFiltro())}>Limpiar filtro</button>
            </Form>
        </>
    )
}

export default FormFlujo