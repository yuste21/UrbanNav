import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { useState } from 'react';

const ChartAccidente = ({ accidentes, datosAgrupados, agrupacion, obtenerDatosGrafica }) => {
    return(
        <>
            {datosAgrupados.length > 0 && 
                <BarChart width={400} height={200} data={datosAgrupados}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey={agrupacion}/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='cantidad' fill='#8884d8' > 
                        <LabelList dataKey="categoria" position="bottom" />
                    </Bar>
                </BarChart>
            }
            <a>Agrupar por: </a>
            <label className='me-3'>
            <input  type='radio' 
                    value={'sexo'} 
                    checked={agrupacion === 'sexo'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value)} />
            Sexo
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'clima'} 
                    checked={agrupacion === 'clima'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value)} />
            Clima
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'edad'} 
                    checked={agrupacion === 'edad'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value)} />
            Edad
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'alcohol'} 
                    checked={agrupacion === 'alcohol'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value)} />
            
            Alcohol
            </label> 

            <label className='me-3'>
            <input  type='radio' 
                    value={'drogas'} 
                    checked={agrupacion === 'drogas'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value)} />
            
            Drogas
            </label> <br/>
        </>
    )
}

export default ChartAccidente