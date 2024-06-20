import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer, Brush } from 'recharts';

const BarChartAccidente = ({ datosAgrupados, 
                             agrupacion, 
                             obtenerDatosGrafica,
                             zonaSeleccionada
                            }) => {

    return(
        <>  
            <p>Estadísticas de los implicados | {agrupacion === 'sexo.sexo' ? 'sexo' : agrupacion}</p>
            {datosAgrupados.length > 0 && 
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={datosAgrupados}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey={agrupacion}/>
                        <YAxis />
                        <Tooltip />
                        {agrupacion === 'edad' && <Brush dataKey='categoria' height={30} stroke="#8884d8" /> }
                        <Bar dataKey='cantidad' fill='#8884d8' > 
                            <LabelList dataKey="categoria" position="bottom" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            }
            <a>Agrupar por: </a>
            <label className='me-3'>
            <input  type='radio' 
                    value={'sexo.sexo'} 
                    checked={agrupacion === 'sexo.sexo'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar', zonaSeleccionada)}
            />
            Sexo
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'edad'} 
                    checked={agrupacion === 'edad'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar', zonaSeleccionada)} 
            />
            Edad
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'alcohol'} 
                    checked={agrupacion === 'alcohol'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar', zonaSeleccionada)} 
            />
            
            Alcohol
            </label> 

            <label className='me-3'>
            <input  type='radio' 
                    value={'drogas'} 
                    checked={agrupacion === 'drogas'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar', zonaSeleccionada)} 
            />
            
            Drogas
            </label> <br/>
        </>
    )
}

export default BarChartAccidente