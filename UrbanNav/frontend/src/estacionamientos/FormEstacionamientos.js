import { Form } from "react-bootstrap"
import { useFormEstacionamientos } from "./useFormEstacionamientos"

const initialForm = {
    distrito: '',
    barrio: '',
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
                    <form onSubmit={handleSubmit}>
                        {/* DISTRITO */}
                        <label className="fw-bold me-2 mb-4" htmlFor="distrito">Distrito</label>
                        <input  className="form-control mb-4" 
                                value={form.distrito}
                                type="text"
                                id="distrito"
                                name="distrito"
                                onChange={handleChange}
                                />

                        {/* BARRIO */}
                        <label className="fw-bold me-2 mb-4" htmlFor="barrio">Barrio</label>
                        <input  className="form-control mb-4" 
                                value={form.barrio}
                                type="text"
                                id="barrio"
                                name="barrio"
                                onChange={handleChange}
                                />

                        {/* COLOR */}
                        <label className="fw-bold me-2 mb-4">Color</label>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Verde'} 
                                id="verde"
                                name="color"
                                checked={form.color === 'Verde'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="verde">Verde</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Azul'} 
                                id="azul"
                                name="color"
                                checked={form.color === 'Azul'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="azul">Azul</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Naranja'} 
                                id="naranja"
                                name="color"
                                checked={form.color === 'Naranja'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="naranja">Naranja</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Rojo'} 
                                id="rojo"
                                name="color"
                                checked={form.color === 'Rojo'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="rojo">Rojo</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Amarillo'} 
                                id="amarillo"
                                name="color"
                                checked={form.color === 'Amarillo'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="amarillo">Amarillo</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Negro'} 
                                id="negro"
                                name="color"
                                checked={form.color === 'Negro'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="negro">Negro</label>
                        </div>
                        <div className="form-check form-check-inline mb-3">
                            <input  
                                className="form-check-input" 
                                type='radio' 
                                value={'Morado'} 
                                id="morado"
                                name="color"
                                checked={form.color === 'Morado'} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="morado">Morado</label>
                        </div>

                        {/* TIPO */}
                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="drogas" >Tipo de aparcamiento</label>
                            <select className='mb-4 form-select' 
                                    value={form.tipo} 
                                    id="tipo"
                                    name="tipo"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="Línea">Línea</option>
                                <option value="Batería">Batería</option>
                            </select> <br/>
                        </div>

                        <input  className="btn btn-primary me-4"
                                type="submit"
                                value="Filtrar" />
                        <input className="btn btn-secondary"
                                type="button"
                                value="Limpiar filtro"
                                onClick={vaciarFiltro} />
                    </form>
                </div>
            </div>
        </>
    )
}

export default FormEstacionamientos