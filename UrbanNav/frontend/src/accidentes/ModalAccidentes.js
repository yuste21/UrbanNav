import "../Modal.css"

const ModalAccidente = ({children, isOpen, closeModal}) => {
    const handleContainerClick = (e) => e.stopPropagation()

    return(
        <div className={`modal ${isOpen && "is-open"}`} onClick={closeModal}>
            <div className="modal-container" onClick={handleContainerClick}>
                <button className="modal-close" onClick={closeModal}>X</button>
                {children}
            </div>
        </div>
    )
}

export default ModalAccidente