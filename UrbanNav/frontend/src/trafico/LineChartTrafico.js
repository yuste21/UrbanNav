import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"
import { useLocation } from "react-router-dom"

const LineChartTrafico = () => {
    const location = useLocation()
    
    const trafico = location.state.trafico
    const info = location.state.info
    console.log(trafico)
    console.log('INFO = ' + info)
    return(
        <div className="container mt-4">
            <LineChart 
                width={1000} 
                height={500} 
                data={trafico.trafico}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={info} label={{ value: info, position: 'insideBottomRight', offset: -20 }}  />
                <YAxis label={{ value: 'aforo', position: 'insideBottom', offset: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aforo" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </div>
    )
}

export default LineChartTrafico