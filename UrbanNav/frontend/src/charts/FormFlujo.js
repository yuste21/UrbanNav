import { Form, Col, FormControl } from 'react-bootstrap'
import { handleChange, 
        getFlujoAccidenteDistritoFecha, getFlujoAccidenteDistritoHora,
        getFlujoAccidenteBarrioFecha, getFlujoAccidenteBarrioHora,
        getFlujoTraficoDistritoFecha, getFlujoTraficoDistritoHora, 
        getFlujoTraficoEstacionFecha, getFlujoTraficoEstacionHora
 } from "../features/flujo/dataFlujoSlice"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const FormFlujo = ({ entidad, tipo }) => {
    //const { form, handleSubmit, handleChange } = useFormFlujo(initialForm, setLoading)

    const dispatch = useDispatch()
    const filtro = useSelector(state => state.flujo.filtro)
    const navigate = useNavigate()

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
        }

        var info, data
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
            console.log('Trafico distrito')
            if(filtro.fecha1 !== '' && filtro.fecha2 !== '') {
                console.log('Fecha')
                dispatch(getFlujoTraficoDistritoFecha({ filtro, entidad }))
                info = 'fecha'
            } else {
                dispatch(getFlujoTraficoDistritoHora({ filtro, entidad }))
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
        

        //setTrafico(data.trafico)
        //setInfo(info)
        //setShowChart(true)
        //setLoading(false)
        navigate('/flujo', { state: { info: info, tipo: tipo_dato } })

    }

    return(
        <>
            <Form onSubmit={(event) => handleSubmit(event, entidad, tipo)}>
                <div className="row mb-4">
                    <Form.Group as={Col}
                                className="d-flex align-items-center"
                    >
                        <Form.Label className="fw-bold me-2">Entre 2 fechas</Form.Label>
                        <Form.Control type="date"
                                      id="fecha1"
                                      name="fecha1"
                                      value={filtro.fecha1}
                                      style={{ width: '150px' }}
                                      onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                      className="me-2"
                        />
                        <Form.Control type="date"
                                      id="fecha2"
                                      name="fecha2"
                                      value={filtro.fecha2}
                                      style={{ width: '150px' }}
                                      onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                        />
                        
                    </Form.Group>
                </div>
                <div className="row mb-4">
                    <Form.Group as={Col}
                                className="d-flex align-items-center"
                    >
                        <Form.Label className="fw-bold me-2">Entre 2 horas</Form.Label>
                        <Form.Control type="time"
                                      id="hora1"
                                      name="hora1"
                                      value={filtro.hora1}
                                      style={{ width: '100px' }}
                                      onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                                      className="me-2"
                        />
                        <Form.Control type="time"
                                      id="hora2"
                                      name="hora2"
                                      value={filtro.hora2}
                                      style={{ width: '100px' }}
                                      onChange={(e) => dispatch(handleChange({name: e.target.name, value: e.target.value}))}
                        />
                    </Form.Group>
                </div>
                <input type='submit' className='btn btn-azul' />
            </Form>
        </>
    )
}

export default FormFlujo