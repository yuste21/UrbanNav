import { useState } from "react"

export const useFormTrafico = (initialForm, handleFilter) => {
    const [form, setForm] = useState(initialForm)

    const handleSubmit = (e) => {
        e.preventDefault()

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

    return{
        form,
        handleSubmit,
        handleChange,
        vaciarFiltro
    }
}