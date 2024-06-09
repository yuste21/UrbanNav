import { useEffect, useState } from "react"
import { BarChart, Bar, CartesianGrid, Legend, XAxis, YAxis, Tooltip, Brush, Cell } from "recharts"

const Charts = ({ data, setSelectedBar, activatedOverlay, tipo }) => {

    const [selectedInfo, setSelectedInfo] = useState()
    const [selectedIndex, setSelectedIndex] = useState(null)

    useEffect(() => {
        if (tipo === 'trafico') {
            var splitString = activatedOverlay.split(' ')

            //Si se estan mostrando las estaciones y algun tipo de zona muestro en el barChart esa zona
            if(splitString.length > 1) {    
                var filtered = splitString.filter(el => el !== 'Estaciones')
                setSelectedInfo(filtered)
            }  else {
                setSelectedInfo(splitString[0])
            }
        }
    }, [activatedOverlay])

    const handleBarClick = (data, index) => {
        setSelectedBar(data.activePayload[0].payload)
        setSelectedIndex(index)
    }

    const getBarColor = (index) => {
        return index === selectedIndex ? '#82ca9d' : '#8884d8'; // Cambia el color de la barra seleccionada
    };

    return(
        <div className="m-1">
            <BarChart
                width={tipo === 'trafico' ? 500 : 400}
                height={tipo === 'trafico' ? 300 : 300}
                data={data}
                onClick={(event, index) => handleBarClick(event, index)}
            >
                <CartesianGrid strokeDasharray="3 3" />
                    {/*<XAxis dataKey="name" scale="band" />*/}
                    <XAxis  dataKey={tipo === 'trafico' ? 'nombre' : 'radar.ubicacion'} />
                    <YAxis />
                    <Tooltip 
                        wrapperStyle={{
                            maxWidth: '90%', // Ajusta el ancho máximo del tooltip
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 1)', // Fondo del tooltip
                            border: '1px solid #d5d5d5', // Borde del tooltip
                            borderRadius: '10px', // Bordes redondeados
                            padding: '10px' // Espaciado interno
                        }}
                        labelStyle={{ color: "red" }} // Estilo para la etiqueta de Tooltips
                        formatter={(value, name, props) => [tipo === 'trafico' ? "aforo" : 'multas', value]} // Solo muestra la información de "aforo" en Tooltips
                    />

                    <Legend 
                        content={(props) => {
                            return (
                            <div className="custom-legend">
                                {tipo === 'trafico' ?
                                    <h3>Flujo de trafico clasificado por {selectedInfo}</h3>
                                :
                                    <h3>Radares clasificados por multas</h3>
                                }
                            </div>
                            );
                        }}
                    />
                    <Bar dataKey={tipo === 'trafico' ? 'media' : 'multas'} 
                         fill={getBarColor(selectedIndex)}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} 
                                  fill={getBarColor(index)} 
                                  onClick={() => setSelectedIndex(index)}
                            />
                        ))}
                    </Bar>
                    {tipo === 'trafico' &&
                        <Brush dataKey={'nombre'} height={30} stroke="#8884d8" /> 
                    }
            </BarChart>
        </div>
    )
}

export default Charts