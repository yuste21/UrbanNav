import { useState } from "react"

export const useFormEstacionamientos = (initialForm, handleFilter) => {
    const [form, setForm] = useState(initialForm)

    const handleSubmit = (e) => {
        e.preventDefault()

        /*if(!form.distrito && !form.barrio && !form.color && !form.tipo) {
            alert('Datos incompletos')
        }*/


        setForm(form)
        handleFilter(form)
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const vaciarFiltro = () => {
        setForm(initialForm)
        handleFilter({})
    }

    return {
        form,
        handleSubmit,
        handleChange,
        vaciarFiltro
    }
}