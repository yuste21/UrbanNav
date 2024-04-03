import { useFormTrafico } from "./UseFormTrafico"

const initialForm = {
    mes: '',
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    sentido: ''
}

const FormTrafico = ({ handleFilter }) => {
    const {form, handleSubmit, handleChange, vaciarFiltro} = useFormTrafico(initialForm, handleFilter)

    return(
        <>
            <div className="card">
                <div className="card-title">
                    <h3>Filtrar por: </h3> <br/>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className='d-flex align-items-center'>  
                            <label className='fw-bold me-2 mb-4' htmlFor="mes">Introduce un mes</label>
                            <input type='month' 
                                   id="mes"
                                   name="mes"
                                   className='mb-4' 
                                   value={form.mes} 
                                   onChange={handleChange} 
                            /> 
                        </div>
                        <div className='d-flex align-items-center'>  
                        <label className='fw-bold me-2 mb-4' htmlFor="fecha1">Entre 2 fechas</label>
                            <input type='date' 
                                   id="fecha1"
                                   name="fecha1"
                                   className='mb-4 me-2' 
                                   value={form.fecha1} 
                                   onChange={handleChange} 
                            /> 
                            <input type='date' 
                                   id="fecha2"
                                   name="fecha2"
                                   className='mb-4 me-4' 
                                   value={form.fecha2} 
                                   onChange={handleChange} 
                            /> 

                            <label className='fw-bold me-2 mb-4' htmlFor="fechaConcreta">Fecha concreta</label>
                            <input type='date' 
                                   id="fechaConcreta"
                                   name="fecha1"
                                   className='mb-4' 
                                   value={form.fecha1} 
                                   onChange={handleChange} 
                            /> 
                        </div>
                        <div className='d-flex align-items-center'>  
                            <label className='fw-bold me-2 mb-4' htmlFor="hora1">Entre 2 horas</label>
                            <input type='time' 
                                   id="hora1"
                                   name="hora1"
                                   className='mb-4 me-2' 
                                   value={form.hora1} 
                                   onChange={handleChange} 
                            /> 
                            <input type='time' 
                                   name="hora2"
                                   className='mb-4 me-4' 
                                   value={form.hora2} 
                                   onChange={handleChange} 
                            /> 

                            <label className="fw-bold me-2 mb-4" htmlFor="horaConcreta">Hora concreta</label>
                            <input  type="time"
                                    id="horaConcreta"
                                    name="hora1"
                                    className="mb-4 me-2"
                                    value={form.hora1}
                                    onChange={handleChange}
                            />
                        </div>
                        <div className='d-flex align-items-center'>  
                            <label className='fw-bold me-2 mb-4' htmlFor="sentido">Introduce un sentido</label>
                            <select className="form-select mb-4"
                                    value={form.sentido}
                                    id="sentido"
                                    name="sentido"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opcion</option>
                                <option value="N-S">Norte - Sur</option>
                                <option value="S-N">Sur - Norte</option>
                                <option value="E-O">Este - Oeste</option>
                                <option value="O-E">Oeste - Este</option>
                            </select>
                        </div>
                        <input  className='btn btn-secondary me-2' 
                                type='submit' 
                                value='Filtrar'
                        />

                        <input  className="btn btn-secondary"
                                type="button"
                                onClick={vaciarFiltro}
                                value='Limpiar filtro'
                        />
                    </form>
                </div>
            </div>
        </>
    )
}

export default FormTrafico