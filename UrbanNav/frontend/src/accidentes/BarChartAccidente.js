import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

const BarChartAccidente = ({ datosAgrupados, agrupacion, obtenerDatosGrafica }) => {
    return(
        <>  
            <p>Estadísticas de los implicados</p>
            {datosAgrupados.length > 0 && 
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={datosAgrupados}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey={agrupacion}/>
                        <YAxis />
                        <Tooltip />
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
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar')} />
            Sexo
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'clima.clima'} 
                    checked={agrupacion === 'clima.clima'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar')} />
            Clima
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'edad'} 
                    checked={agrupacion === 'edad'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar')} />
            Edad
            </label>

            <label className='me-3'>
            <input  type='radio' 
                    value={'alcohol'} 
                    checked={agrupacion === 'alcohol'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar')} />
            
            Alcohol
            </label> 

            <label className='me-3'>
            <input  type='radio' 
                    value={'drogas'} 
                    checked={agrupacion === 'drogas'} 
                    name='grafica' 
                    onChange={(e) => obtenerDatosGrafica(e.target.value, 'Bar')} />
            
            Drogas
            </label> <br/>
        </>
    )
}

export default BarChartAccidente