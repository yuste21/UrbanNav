import { Modal, Button } from "react-bootstrap"
import FormFlujo from "../charts/FormFlujo"
import { useEffect } from "react";


const ModalWindow = ({children, isOpen, closeModal, info}) => {
    const { data, entidad, tipo, idx } = info;
    
    useEffect(() => {
        console.log('idx = ' + idx)
    }, [idx])

    return(
        <Modal show={isOpen[idx] === true} 
               onHide={() => closeModal(idx)}
               size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Información {data !== '' && `de ${data}`} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between align-items-center">
                {(data !== 'Accidente Marker') &&
                    <FormFlujo entidad={entidad}
                            tipo={tipo}
                    />
                }
                <Button variant="secondary" onClick={() => closeModal(idx) }>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ModalWindow