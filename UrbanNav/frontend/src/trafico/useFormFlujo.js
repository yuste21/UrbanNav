import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { URIsTrafico } from './URIsTrafico'
import { URIsAccidentes } from '../accidentes/URIsAccidentes'

export const useFormFlujo = (initialForm, setLoading) => {
    const [form, setForm] = useState(initialForm)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    //entidad será el objeto correspondiente: estacion, distrito o barrio
    //tipo nos indica que objeto de los 2 es aforo
    const handleSubmit = async(event, entidad, tipo) => {
        event.preventDefault()
        setLoading(true)
        //setForm(form)
        if(form.fecha1 !== '' && form.fecha2 !== '' && form.hora1 !== '' && form.hora2 !== '') {
            alert('Solo puedes filtrar por la fecha o por la hora')
            return
        } else if((form.fecha1 !== '' && form.fecha2 === '') || (form.fecha1 === '' && form.fecha2 !== '')) {
            alert('Debes insertar ambas fechas')
            return
        } else if((form.hora1 !== '' && form.hora2 === '') || (form.hora1 === '' && form.hora2 !== '')) {
            alert('Debes insertar ambas horas')
            return
        } else if(form.fecha1 === '' && form.fecha2 === '' && form.hora1 === '' && form.hora2 === '') {
            alert('Datos incompletos')
            return
        }

        var info, data
        var tipo_dato = tipo
        if(tipo === 'estacion') {
            if(form.fecha1 !== '' && form.fecha2 !== '') {
                data = (await axios.get(`${URIsTrafico.chartFechaEstacion}?fecha1=${form.fecha1}&fecha2=${form.fecha2}&estacion=${entidad.estacion}`)).data
                info = 'fecha'
            } else {
                data = (await axios.get(`${URIsTrafico.chartHoraEstacion}?hora1=${form.hora1}&hora2=${form.hora2}&estacion=${entidad.estacion}`)).data
                info = 'hora'
            }
        } else if(tipo === 'trafico distrito'){
            if(form.fecha1 !== '' && form.fecha2 !== '') {
                data = (await axios.get(`${URIsTrafico.chartFechaDistrito}?fecha1=${form.fecha1}&fecha2=${form.fecha2}&codigo=${entidad.codigo}`)).data
                info = 'fecha'
            } else {
                data = (await axios.get(`${URIsTrafico.chartHoraDistrito}?hora1=${form.hora1}&hora2=${form.hora2}&codigo=${entidad.codigo}`)).data
                info = 'hora'
            }
        } else if(tipo === 'accidente distrito') {
            if(form.fecha1 !== '' && form.fecha2 !== '') {
                data = (await axios.get(`${URIsAccidentes.chart_fecha_distrito}?fecha1=${form.fecha1}&fecha2=${form.fecha2}&id=${entidad.id}`)).data
                info = 'fecha'
            } else {
                data = (await axios.get(`${URIsAccidentes.chart_hora_distrito}?hora1=${form.hora1}&hora2=${form.hora2}&id=${entidad.id}`)).data
                info = 'hora'
            }
        } else {    //accidente barrio
            if(form.fecha1 !== '' && form.fecha2 !== '') {
                data = (await axios.get(`${URIsAccidentes.chart_fecha_barrio}?fecha1=${form.fecha1}&fecha2=${form.fecha2}&id=${entidad.id}`)).data
                info = 'fecha'
            } else {
                data = (await axios.get(`${URIsAccidentes.chart_hora_barrio}?hora1=${form.hora1}&hora2=${form.hora2}&id=${entidad.id}`)).data
                info = 'hora'
            }
        }
        

        //setTrafico(data.trafico)
        //setInfo(info)
        //setShowChart(true)
        setLoading(false)
        navigate('/flujo', { state: { entidad: data, info: info, tipo: tipo_dato } })
    }

    return {
        form, 
        handleChange,
        handleSubmit
    }
}