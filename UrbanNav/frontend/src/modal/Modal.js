import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap"
import FormFlujo from "../charts/FormFlujo"

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
                <Modal.Title className="ubuntu-bold">Información {data !== '' && `de ${data.split(' ')[0]}`} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between align-items-center">
                {(data !== 'Accidente Marker' && !data.includes('Radar')) &&
                    <FormFlujo entidad={entidad}
                            tipo={tipo}
                    />
                }
            </Modal.Footer>
        </Modal>
    )
}

export default ModalWindow