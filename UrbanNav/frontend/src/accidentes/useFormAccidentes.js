import { useState } from "react"

export const useForm = (initialForm, handleFilter) => {
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [response, setResponse] = useState(null)

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if(!form.accidente && !form.alcohol && !form.clima && !form.distrito && !form.drogas && !form.edad1 && 
            !form.edad2 && !form.fecha1 && !form.fecha2 && !form.hora1 && !form.hora2 && !form.lesion && 
            !form.sexo && !form.vehiculo) {
            alert('Datos incompletos')
            return;
        }

        setForm(form)
        handleFilter(form)
    }

    const vaciarFiltro = () => {
        setForm(initialForm)
        handleFilter({})
    }

    return {
        form,
        errors,
        response,
        handleChange,
        handleSubmit,
        vaciarFiltro
    }
}