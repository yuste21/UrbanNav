import axios from 'axios'
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet' 
import { iconos } from '../markerIcons'
import LegendTrafico from "./LegendTrafico"
import { useModal } from '../modal/useModal'
import Modal from '../modal/Modal'
import { useState } from 'react'
import { URIsTrafico } from './URIsTrafico'
import LineChartTrafico from './LineChartTrafico'
import { useNavigate } from 'react-router-dom'

const initialForm = {
    fecha1: '',
    fecha2: '',
    hora1: '',
    hora2: ''
}

const MapTrafico = ({ estaciones, media }) => {

    //MODAL
    const [isOpenModal, openModal, closeModal] = useModal(false)

    //FORM CHART
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(initialForm)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async(event, estacion) => {
        event.preventDefault()

        setForm(form)
        if(form.fecha1 !== '' && form.fecha2 !== '' && form.hora1 !== '' && form.hora2 !== '') {
            alert('Solo puedes filtrar por la fecha o por la hora')
            return
        } else if((form.fecha1 !== '' && form.fecha2 === '') || (form.fecha1 === '' && form.fecha2 !== '')) {
            alert('Debes insertar ambas fechas')
            return
        } else if((form.hora1 !== '' && form.hora2 === '') || (form.hora1 === '' && form.hora2 !== '')) {
            alert('Debes insertar ambas horas')
            return
        }

        var info, data
        if(form.fecha1 !== '' && form.fecha2 !== '') {
            data = (await axios.get(`${URIsTrafico.chartFecha}?fecha1=${form.fecha1}&fecha2=${form.fecha2}&estacion=${estacion.estacion}`)).data
            info = 'fecha'
        } else {
            data = (await axios.get(`${URIsTrafico.chartHora}?hora1=${form.hora1}&hora2=${form.hora2}&estacion=${estacion.estacion}`)).data
            info = 'hora'
        }


        navigate('/line', { state: { trafico: data, info: info } })
    }

    return(
        <div className='container'>
            <div className='row'>
                <div className='col-3'>
                    <LegendTrafico />
                </div>
                <div className='col-9'>
                    <div className='card m-3'>
                        <div className='card-body'>
                            <MapContainer center={[40.41688189428294, -3.703318510771146]} zoom={11} style={{ height: '400px', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />  
                                {estaciones && estaciones.length > 0 && estaciones.map((estacion, index) => (
                                    <Marker key={index} 
                                            position={[estacion.lat, estacion.lon]}
                                            icon={estacion.media > (media + media*0.5) ? iconos.rojo :
                                                  estacion.media < (media - media*0.5) ? iconos.azul :
                                                  iconos.amarillo
                                            }
                                    >
                                        <div>
                                            <Popup>
                                                {!showForm &&
                                                    <button onClick={openModal}
                                                        className='btn'
                                                    >   
                                                        Ver más información
                                                    </button>
                                                }
                                                <Modal isOpen={isOpenModal} closeModal={closeModal}>
                                                <p style={{color: '#FCF7F8', fontWeight: 'bold'}}>
                                                    Nombre: {estacion.nombre} <br/>
                                                    Sentido: {estacion.sentido} <br/>
                                                    Estacion: {estacion.estacion} <br/>
                                                    Trafico medio: {estacion.media}
                                                </p>
                                                </Modal>

                                                <button onClick={() => setShowForm(!showForm)}
                                                        className='btn'
                                                >
                                                    {!showForm ? 'Mostrar filtro' : 'Ocultar filtro'}
                                                </button>
                                                {showForm &&
                                                    <form onSubmit={(event) => handleSubmit(event, estacion)}>
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
                                                        </div>
                                                        <input type='submit' className='btn btn-primary' />
                                                    </form>
                                                }
                                            </Popup>
                                        </div>
                                    </Marker>
                                ))}                           
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapTrafico