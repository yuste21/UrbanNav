import React from 'react';
import ModalAccidente from './ModalAccidentes';
import { useModal } from './useModalAccidente';


const LegendAccidentes = ({ zonaSelected }) => {
    //Hacer modal en Leyenda para que la explique un poco | Que es el balance 
    //const [isOpenModal, openModal, closeModal] = useModal(false)

    return (
        <div className='legend'>
            <h4>Leyenda</h4>
            <div className='info legend'>
                <div>
                    <i style={{ background: 'blue' }}></i> Balance menor de 50
                </div>
                <div>
                    <i style={{ background: 'yellow' }}></i> Balance entre 50 y 150
                </div>
                <div>
                    <i style={{ background: 'orange' }}></i> Balance entre 150 y 250
                </div>
                <div>
                    <i style={{ background: 'red' }}></i> Balance mayor de 250
                </div>
                {zonaSelected && (
                    <div className='mt-2'>
                        <p>Lesividad Media: {Math.round(zonaSelected.lesividad)} </p>
                        <p>Total Accidentes: {zonaSelected.accidentes} </p>
                        <p>Balance: {Math.round(zonaSelected.balance)} </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegendAccidentes;
