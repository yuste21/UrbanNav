import { useEffect, useState } from "react"
import { BarChart, Bar, CartesianGrid, Legend, XAxis, YAxis, Tooltip, Brush } from "recharts"

const BarChartTrafico = ({ data, setSelectedBar, activatedOverlay }) => {

    const [selectedInfo, setSelectedInfo] = useState()
    useEffect(() => {
        var splitString = activatedOverlay.split(' ')

        //Si se estan mostrando las estaciones y algun tipo de zona muestro en el barChart esa zona
        if(splitString.length > 1) {    
            var filtered = splitString.filter(el => el !== 'Estaciones')
            setSelectedInfo(filtered)
        }  else {
            setSelectedInfo(splitString[0])
        }
    }, [activatedOverlay])
    const handleBarClick = (data, index) => {
        setSelectedBar(data)
    }

    return(
        <BarChart
            width={500}
            height={300}
            data={data}
            onClick={handleBarClick}
        >
            <CartesianGrid strokeDasharray="3 3" />
                {/*<XAxis dataKey="name" scale="band" />*/}
                <XAxis  dataKey={'nombre'} />
                <YAxis />
                <Tooltip 
                    labelStyle={{ color: "red" }} // Estilo para la etiqueta de Tooltips
                    formatter={(value, name, props) => ["aforo", value]} // Solo muestra la información de "aforo" en Tooltips
                />
                <Legend 
                    content={(props) => {
                        return (
                          <div className="custom-legend">
                            <h3>Flujo de trafico clasificado por {selectedInfo}</h3>
                          </div>
                        );
                    }}
                />
                <Bar dataKey="media" fill="#8884d8" />
                <Brush dataKey={'nombre'} height={30} stroke="#8884d8" /> 
        </BarChart>
    )
}

export default BarChartTrafico