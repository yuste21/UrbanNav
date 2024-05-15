import { useState } from "react"

export const useModal = () => {
    const [isOpen, setIsOpen] = useState({})

    const openModal = (idx) => setIsOpen(prevState => ({
        ...prevState,
        [idx]: true
    }))

    const closeModal = (idx) => setIsOpen(prevState => ({
        ...prevState,
        [idx]: false
    }))

    return [isOpen, openModal, closeModal]
}