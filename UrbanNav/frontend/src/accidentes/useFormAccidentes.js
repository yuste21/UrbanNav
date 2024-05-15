import { useState } from "react"

export const useForm = (initialForm, handleFilter, filtro) => {
    //En caso de que aplique el filtro guardo el estado almacenandolo en form, sino le doy el valor initialForm
    const [form, setForm] = useState(JSON.stringify(filtro) !== '{}' ? filtro : initialForm)
    const [errors, setErrors] = useState({})
    const [response, setResponse] = useState(null)

    const handleChange = (e) => {
        if(e.target.name === 'activo') {
            let updatedForm
            updatedForm = {
                ...form,
                radio: {
                    ...form.radio,
                    activo: true
                }
            }
            setForm(updatedForm)
            handleFilter(updatedForm)

        } else if(e.target.name === 'inactivo') {
            setForm(initialForm)
            handleFilter(initialForm)
        } else if(e.target.name === 'distancia') {
            setForm({
                ...form,
                radio: {
                    ...form.radio,
                    distancia: e.target.value
                }
            })
        } else {
            setForm({
                ...form,
                [e.target.name]: e.target.value,
            })
        }
    }

    const handleSubmit = (event, markerPosition) => {
        event.preventDefault()

        if(!form.accidente && !form.alcohol && !form.clima && !form.drogas && !form.edad1 && 
            !form.edad2 && !form.fecha1 && !form.fecha2 && !form.hora1 && !form.hora2 && !form.lesion && 
            !form.sexo && !form.vehiculo && form.radio.distancia === 0) {
            alert('Datos incompletos')
            return;
        }

        if(markerPosition !== null) {
            form.radio.lat = markerPosition[0]
            form.radio.lon = markerPosition[1]
        }

        //setForm(form)
        handleFilter(form)
    }

    const vaciarFiltro = () => {
        setForm(initialForm)
        handleFilter({})
    }

    return {
        form,
        setForm,
        errors,
        response,
        handleChange,
        handleSubmit,
        vaciarFiltro
    }
}