import React from 'react';

const LegendAccidentes = ({ zonaSelected, riesgoMedio }) => {
    //Hacer modal en Leyenda para que la explique un poco | Que es el balance 
    //const [isOpenModal, openModal, closeModal] = useModal(false)

    return (
        <div className='legend'>
            <h4>Leyenda</h4>
            <div className='info legend'>
                <h3>Riesgo medio: {Math.round(riesgoMedio)}</h3>
                <div className='mb-2'>
                    <i style={{ background: '#2A81CB' }}></i> Riesgo bajo
                </div>
                <div className='mb-2'>
                    <i style={{ background: '#FFD326' }}></i> Riesgo medio
                </div>
                <div className='mb-2'>
                    <i style={{ background: '#CB8427' }}></i> Riesgo alto
                </div>
                <div className='mb-2'>
                    <i style={{ background: '#CB2B3E' }}></i> Riesgo muy alto
                </div>
                {zonaSelected && (
                    <div className='mt-2'>
                        <p>Lesividad Media: {Math.round(zonaSelected.lesividad)} </p>
                        <p>Total Accidentes: {zonaSelected.num_accidentes} </p>
                        <p>Riesgo: {Math.round(zonaSelected.riesgo)} </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegendAccidentes;
