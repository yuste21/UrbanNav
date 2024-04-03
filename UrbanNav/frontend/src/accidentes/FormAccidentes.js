import { useEffect, useState } from "react"
import { useForm } from "./useFormAccidentes.js"

const initialForm = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: '',
    edad1: '',
    edad2: '',
    vehiculo: '',
    distrito: '',
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
    const [showForm, setShowForm] = useState(false)

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
                <button className={showForm ? "btn btn-primary mb-3" : "btn btn-secondary mb-3"} 
                        type="button" 
                        onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Ocultar filtro' : 'Mostrar filtro'}
                </button>
                {showForm &&
                    <form onSubmit={(event) => handleSubmit(event, markerPosition)}>
                        <div className="d-flex align-items-center">
                            {!form.radio.activo ? 
                                <button className="btn btn-secondary mb-4" 
                                        type="button" 
                                        name="activo"
                                        onClick={handleChange} 
                                >Mostrar marcador arrastrable</button>
                            :
                            <>
                                <label className='fw-bold me-2 mb-4' htmlFor="radio">Selecciona un radio en km</label>
                                <input className="mb-4 me-2"
                                       type="number"
                                       value={form.radio.distancia}
                                       id="radio"
                                       name="distancia"
                                       onChange={handleChange}
                                />
                                <button className="btn btn-secondary mb-4"
                                        type="button"
                                        name="inactivo"
                                        onClick={handleChange}
                                >Ocultar marcador arrastrable</button>
                            </>
                            }
                        </div>
                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="sexo">Sexo</label>
                            <select className='mb-4 me-4 form-select' 
                                    value={form.sexo} 
                                    id="sexo"
                                    name="sexo"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option> 
                            </select>

                            <label className='fw-bold me-2 mb-4' htmlFor="distrito" >Distrito</label>
                            <input  className='form-control mb-4'
                                    type='text'  
                                    id="distrito"
                                    name='distrito' 
                                    onChange={handleChange} /> <br/>
                        </div>
            
                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="drogas" >Positivo en drogas</label>
                            <select className='mb-4 form-select' 
                                    value={form.drogas} 
                                    id="drogas"
                                    name="drogas"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="1">Positivo</option>
                                <option value="0">Negativo</option>
                            </select> <br/>
                        </div>
                        
                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="alcohol">Positivo en alcohol</label>
                            <select className='mb-4 form-select' 
                                    value={form.alcohol} 
                                    id="alcohol"
                                    name="alcohol"
                                    style={{ width: '220px'}}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="1">Positivo</option>
                                <option value="0">Negativo</option>
                            </select> <br/>
                        </div>
                        
                        <div className="d-flex align-items-center">
                            <label className='me-4 fw-bold mb-4'>Gravedad de la lesión:</label>
                            <div className="form-check form-check-inline mb-3">
                                <input  
                                    className="form-check-input" 
                                    type='radio' 
                                    value={'LEVE'} 
                                    id="leve"
                                    name="lesion"
                                    checked={form.lesion === 'LEVE'} 
                                    onChange={handleChange} 
                                />
                                <label className="form-check-label" htmlFor="leve">Leve</label>
                            </div>
                            <div className="form-check form-check-inline mb-3">
                                <input  
                                    className="form-check-input" 
                                    type='radio' 
                                    value={'GRAVE'} 
                                    id="grave"
                                    name="lesion"
                                    checked={form.lesion === 'GRAVE'} 
                                    onChange={handleChange} 
                                />
                                <label className="form-check-label" htmlFor="grave">Grave</label>
                            </div>
                            <div className="form-check form-check-inline mb-3">
                                <input  
                                    className="form-check-input" 
                                    type='radio' 
                                    value={'FALLECIDO'} 
                                    id="fallecido"
                                    name="lesion"
                                    checked={form.lesion === 'FALLECIDO'} 
                                    onChange={handleChange} 
                                />
                                <label className="form-check-label" htmlFor="fallecido">Fallecido</label>
                            </div>
                        </div>

                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="vehiculo">Tipo de vehiculo</label>
                            <select className='mb-4 form-select' 
                                    value={form.vehiculo} 
                                    id="vehiculo"
                                    name="vehiculo"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
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
                            </select> <br/>
                        </div>

                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="accidente">Tipo de accidente</label>
                            <select className='mb-4 form-select' 
                                    value={form.accidente} 
                                    id="accidente"
                                    name="accidente"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="doble">Colisión doble</option>
                                <option value="multiple">Colisión múltiple</option>
                                <option value="alcance">Alcance</option>
                                <option value="obstaculo">Choque contra obstáculo fijo</option>
                                <option value="persona">Atropello a persona</option>
                                <option value="vuelco">Vuelco</option>
                                <option value="caida">Caída</option>
                                <option value="otro">Otro</option>
                            </select> <br/>
                        </div>

                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="clima">Clima</label>
                            <select className='mb-4 form-select' 
                                    value={form.clima} 
                                    id="clima"
                                    name="clima"
                                    style={{ width: '220px' }}
                                    onChange={handleChange}>
                                <option value="">Selecciona una opción</option>
                                <option value="Despejado">Despejado</option>
                                <option value="Nublado">Nublado</option>
                                <option value="debil">Lluvia débil</option>
                                <option value="intensa">Lluvia intensa</option>
                                <option value="Granizando">Granizando</option>
                            </select> <br/>
                        </div>

                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="horaConcreta">Hora concreta</label>
                            <input  className='mb-4 me-4' 
                                    type="time" 
                                    value={form.hora1} 
                                    id="horaConcreta"
                                    name="hora1"
                                    onChange={handleChange}/>

                            <label className='fw-bold me-2 mb-4' htmlFor="entreHoras">Entre 2 horas</label>
                            <input  className='mb-4 me-2' 
                                    type="time" 
                                    value={form.hora1} 
                                    id="entreHoras"
                                    name="hora1"
                                    onChange={handleChange} />
                            <input  className='mb-4' 
                                    type="time" 
                                    value={form.hora2} 
                                    name="hora2"
                                    onChange={handleChange} /> <br/>
                        </div>

                        <div className='d-flex align-items-center'>
                            <label className='fw-bold me-2 mb-4' htmlFor="fechaConcreta">Fecha concreta</label>
                            <input  className='mb-4 me-4' 
                                    type="date" 
                                    value={form.fecha1} 
                                    id="fechaConcreta"
                                    name="fecha1"
                                    onChange={handleChange}/>

                            <label className='fw-bold me-2 mb-4' htmlFor="entreFechas">Entre 2 fechas</label>
                            <input  className='mb-4 me-4' 
                                    type="date" 
                                    value={form.fecha1} 
                                    id="entreFechas"
                                    name="fecha1"
                                    onChange={handleChange}/>
                            <input  className='mb-4' 
                                    type="date" 
                                    value={form.fecha2}
                                    name="fecha2" 
                                    onChange={handleChange} /> <br/>
                        </div>
                        <input className="btn btn-secondary me-4" type="submit" value="Filtrar"></input>
                        <button className='btn btn-secondary' type='button' onClick={vaciarFiltro}>Limpiar filtro</button>
                    </form>
                }
            </div>
        </div>
    )
}

export default FormAccidentes