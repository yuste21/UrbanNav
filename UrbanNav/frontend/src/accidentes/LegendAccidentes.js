import React from 'react';

const LegendAccidentes = ({ zonaSelected, riesgoMedio }) => {

    return (
        <div className='legend'>
            <h2>Leyenda</h2>
            <div className='info legend'>
                <h3>Riesgo medio: {riesgoMedio > 0 ? Math.round(riesgoMedio) : 'Sin información'}</h3>
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
                {zonaSelected && typeof zonaSelected.n_accidentes === 'number' && zonaSelected.n_accidentes > 0 && 
                    typeof zonaSelected.lesividad_media === 'number' && typeof zonaSelected.riesgo === 'number' &&
                    riesgoMedio > 0 && (
                    <div className='mt-4'>
                        <p>Lesividad Media: {(zonaSelected.lesividad_media).toFixed(2)} </p>
                        <p>Total Accidentes: {zonaSelected.n_accidentes} </p>
                        <p>Riesgo: {zonaSelected.riesgo} </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LegendAccidentes;
