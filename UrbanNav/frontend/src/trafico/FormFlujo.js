import { useState } from "react"
import { useFormFlujo } from "./useFormFlujo"
import { Form, Col, FormControl } from 'react-bootstrap'

const initialForm = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: ''
}

const FormFlujo = ({ setLoading, entidad, tipo }) => {
    const { form, handleSubmit, handleChange } = useFormFlujo(initialForm, setLoading)

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
                                      value={form.fecha1}
                                      style={{ width: '150px' }}
                                      onChange={handleChange}
                                      className="me-2"
                        />
                        <Form.Control type="date"
                                      id="fecha2"
                                      name="fecha2"
                                      value={form.fecha2}
                                      style={{ width: '150px' }}
                                      onChange={handleChange}
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
                                      value={form.hora1}
                                      style={{ width: '100px' }}
                                      onChange={handleChange}
                                      className="me-2"
                        />
                        <Form.Control type="time"
                                      id="hora2"
                                      name="hora2"
                                      value={form.hora2}
                                      style={{ width: '100px' }}
                                      onChange={handleChange}
                        />
                    </Form.Group>
                </div>
                <input type='submit' className='btn btn-azul' />
            </Form>
        </>
    )
}

export default FormFlujo