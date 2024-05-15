import { Form, Col } from 'react-bootstrap';
import { useFormEstacionamientos } from "./useFormEstacionamientos"

const initialForm = {
    color: '',
    tipo: '',
    zonas: 0
}

const FormEstacionamientos = ({ handleFilter }) => {

    const { form, handleSubmit, handleChange, vaciarFiltro } = useFormEstacionamientos(initialForm, handleFilter)

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
                                        controlId='color'
                                        className='d-flex align-items-center'    
                            >
                                <Form.Label className='fw-bold me-2'>Color</Form.Label>
                                <Form.Control as="select"
                                            className='form-select'
                                            style={{ width: '200px' }}
                                            value={form.color}
                                            name='color'
                                            onChange={handleChange}
                                >
                                    <option value="">Ninguno</option>
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
                                        controlId="tipo"
                                        className='d-flex align-items-center'
                            >   
                                <Form.Label className='fw-bold me-2'>Tipo de aparcamiento</Form.Label>
                                <Form.Control as="select"
                                              className='form-select'
                                              style={{ width: '200px' }}
                                              value={form.tipo}
                                              name='tipo'
                                              onChange={handleChange}
                                >
                                    <option value="">Ninguna</option>
                                    <option value="Línea">Línea</option>
                                    <option value="Batería">Batería</option>
                                </Form.Control>
                            </Form.Group>
                        </div>
                
                        <input  className="btn btn-azul me-4"
                                type="submit"
                                value="Filtrar" />
                        <input className="btn btn-rojo"
                                type="button"
                                value="Limpiar filtro"
                                onClick={vaciarFiltro} />
                    </Form>
                </div>
            </div>
        </>
    )
}

export default FormEstacionamientos