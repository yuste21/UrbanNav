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

    const getAll = () => {
        if(window.confirm('¿Estás seguro de que quieres mostrar todo el trafico? Puede tardar varios minutos')) {
            handleFilter({
                ...initialForm,
                getAll: true
            })
        } else {
            return;
        }
    }

    return{
        form,
        handleSubmit,
        handleChange,
        vaciarFiltro,
        getAll
    }
}