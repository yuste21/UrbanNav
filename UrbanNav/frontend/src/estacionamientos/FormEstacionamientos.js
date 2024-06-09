import { Form, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { handleChange, getDataEstacionamientosInicio, activarFiltro, vaciarFiltro } from '../features/estacionamiento/dataEstacionamientoSlice';

const FormEstacionamientos = ({ handleFilter }) => {

    const filtro = useSelector(state => state.estacionamientos.filtro)
    const estacionamientos = useSelector(state => state.estacionamientos.dataEstacionamientos.estacionamientos)
    const dispatch = useDispatch()
    
    const filtroString = (filtro) => {
        let resultado = []
        for(let key in filtro) {
            if(filtro[key] && filtro[key] !== 0 && key !== 'filtrado') {
                if(key !== 'zonas') {
                    resultado.push(`${key}: ${filtro[key]}`)
                } else if (filtro[key].activo) {
                    resultado.push(`${filtro[key].tipo}: ${filtro[key].nombre}`)
                }
                
            }
        }

        return resultado
    }

    const popover = (
        <Popover id='popover'>
            <Popover.Header as="h4">Filtro aplicado</Popover.Header>
            <Popover.Body className='popover-body'>
            {filtroString(filtro).map((el, index) => (
                <p key={index}>{el}</p>
            ))}
            </Popover.Body>
        </Popover>
    );


    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(activarFiltro())
        handleFilter(activarFiltro())
    }

    const limpiarFiltro = () => {
        dispatch(vaciarFiltro())
        dispatch(getDataEstacionamientosInicio())
    }


    return(
        <>
            <div className="card">
                <div className="card-title">
                    <h3>Filtrar</h3>
                </div>
                <div className="card-body">
                    <Form onSubmit={handleSubmit}>
                        {/* COLOR */}
                        <div className='row mb-4'>
                            <Form.Group as={Col}
                                        className='d-flex align-items-center'    
                            >
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
                        <div className='row mb-4'>
                            <Form.Group as={Col} 
                                        className='d-flex align-items-center'
                            >   
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
                        <div className='row mb-4'>
                            <Form.Group as={Col}
                                        className='d-flex align-items.center'
                            >
                                <Form.Label className="fw-bold me-2" htmlFor="plazas">Plazas</Form.Label>
                                <Form.Control type='number'
                                              min="0"
                                              max="60"
                                              style={{ width: "100px" }}
                                              id="plazas"
                                              name="plazas"
                                              value={filtro.plazas}
                                              onChange={(e) => dispatch(handleChange({ name: e.target.name, value: e.target.value }))}
                                />
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