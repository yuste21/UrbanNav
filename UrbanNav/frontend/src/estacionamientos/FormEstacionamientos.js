import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { 
    handleChange, 
    getDataEstacionamientosInicio, 
    activarFiltro, 
    vaciarFiltro 
} from '../features/estacionamiento/dataEstacionamientoSlice';

const FormEstacionamientos = ({ handleFilter }) => {
    const filtro = useSelector(state => state.estacionamientos.filtro)
    const [validated, setValidated] = useState(false)
    const dispatch = useDispatch()
    
    const [filtroAplicado, setFiltroAplicado] = useState([])
    useEffect(() => {
        setFiltroAplicado(filtroString(filtro))
    }, [filtro])

    const filtroString = (filtro) => {
        let resultado = []
        for(let key in filtro) {
            if(filtro[key] && filtro[key] !== 0 && key !== 'filtrado' && key !== 'error' && !key.includes('plazas')) {
                if(key !== 'zonas') {
                    resultado.push(`${key}: ${filtro[key]}`)
                } else if (filtro[key].activo) {
                    resultado.push(`${filtro[key].tipo}: ${filtro[key].nombre}`)
                }
                
            }
        }

        if (filtro.plazas1 !== '' && filtro.plazas2 !== '') {
            if (filtro.plazas1 === filtro.plazas2) {
                resultado.push(`${filtro.plazas1} plazas`)
            } else {
                resultado.push(`Entre ${filtro.plazas1} y ${filtro.plazas2} plazas`)
            }
        } else if (filtro.plazas1 !== '') {
            resultado.push(`Mínimo ${filtro.plazas1} plazas`)
        } else if (filtro.plazas2 !== '') {
            resultado.push(`Máximo ${filtro.plazas2} plazas`)
        }

        return resultado
    }

    const popover = (
        <Popover id='popover'>
            <Popover.Header as="h4">Filtro aplicado</Popover.Header>
            <Popover.Body className='popover-body'>
            {filtroAplicado.map((el, index) => (
                <p key={index}>{el}</p>
            ))}
            </Popover.Body>
        </Popover>
    );


    const handleSubmit = (e) => {
        e.preventDefault()

        if (!filtro.color && !filtro.tipo && !filtro.plazas1 && !filtro.plazas2) {
            alert('Datos incompletos')
            return
        } else if (filtro.error.plazas !== '') {
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
            dispatch(getDataEstacionamientosInicio());     // Carga inicial
        } else {
            // Si el usuario no confirma, simplemente retornar
            return;
        }
    }


    return(
        <>
            <div className="card">
                <div className="card-body">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>

                        {/* COLOR */}
                        <div className='row mb-2'>
                            <Form.Group as={Col}className='d-flex flex-column align-items-start'>
                                <Form.Label className='fw-bold me-2' htmlFor="color">Color</Form.Label>
                                <Form.Control as="select"
                                            className='form-select'
                                            style={{ width: '200px' }}
                                            value={filtro.color}
                                            id='color'
                                            name='color'
                                            onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="Verde">Verde</option>
                                    <option value="Azul">Azul</option>
                                    <option value="Naranja">Naranja</option>
                                    <option value="Rojo">Rojo</option>
                                    <option value="Amarillo">Amarillo</option>
                                    <option value="Negro">Negro</option>
                                    <option value="Morado">Morado</option>
                                </Form.Control>
                            </Form.Group>
                        </div>

                        {/* TIPO */}
                        <div className='row mb-2'>
                            <Form.Group as={Col} className='d-flex flex-column align-items-start'> 
                                <Form.Label className='fw-bold me-2' htmlFor='tipo'>Tipo de aparcamiento</Form.Label>
                                <Form.Control as="select"
                                              className='form-select'
                                              style={{ width: '200px' }}
                                              value={filtro.tipo}
                                              id='tipo'
                                              name='tipo'
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                >
                                    <option value="">Ninguna</option>
                                    <option value="Línea">Línea</option>
                                    <option value="Batería">Batería</option>
                                </Form.Control>
                            </Form.Group>
                        </div>

                        {/* PLAZAS */}
                        <div className='row mb-2'>
                            <Form.Label className="fw-bold me-2 d-flex align-items-start" htmlFor="plazas1">Plazas</Form.Label>
                            <Form.Group as={Col} xs={12} sm={6} className='d-flex flex-column align-items-start mb-2'>
                                    <Form.Control type='number'
                                                min="0"
                                                max="200"
                                                style={{ width: "100px" }}
                                                id="plazas1"
                                                name="plazas1"
                                                placeholder='Mínimo'
                                                value={filtro.plazas1}
                                                onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                isInvalid={!!filtro.error.plazas}
                                    />
                            </Form.Group>
                            <Form.Group as={Col} xs={12} sm={6} className='d-flex flex-column align-items-start'>
                                    <Form.Control type='number'
                                                min="0"
                                                max="200"
                                                style={{ width: "100px" }}
                                                id="plazas2"
                                                name="plazas2"
                                                placeholder='Máximo'
                                                value={filtro.plazas2}
                                                onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                                isInvalid={!!filtro.error.plazas}
                                    />
                                <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
                                    {filtro.error.plazas}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                
                        <input  className="btn btn-azul me-4"
                                type="submit"
                                value="Filtrar" />
                        <input className="btn btn-rojo"
                                type="button"
                                value="Limpiar filtro"
                                onClick={limpiarFiltro} />
                    </Form>
                </div>
            </div>
            {filtro.filtrado &&
                <div className='row'>
                    <OverlayTrigger
                        trigger="click"
                        placement="bottom"
                        overlay={popover}
                    >
                        <button className='btn'>Mostrar Filtrado</button>
                    </OverlayTrigger>
                </div>
            }
        </>
    )
}

export default FormEstacionamientos