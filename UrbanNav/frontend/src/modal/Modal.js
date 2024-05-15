import { Modal, Button } from "react-bootstrap"
import FormFlujo from "../trafico/FormFlujo"
import { useEffect } from "react";


const ModalWindow = ({children, isOpen, closeModal, info}) => {
    const { data, setLoading, entidad, tipo, idx } = info;
    
    return(
        <Modal show={isOpen[idx] === true} 
               onHide={() => closeModal(idx)}
               size="md"
        >
            <Modal.Header closeButton>
                <Modal.Title>Información {data !== '' && `de ${data}`} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between align-items-center">
                <FormFlujo setLoading={setLoading}
                            entidad={entidad}
                            tipo={tipo}
                />
                <Button variant="secondary" onClick={() => closeModal(idx) }>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ModalWindow