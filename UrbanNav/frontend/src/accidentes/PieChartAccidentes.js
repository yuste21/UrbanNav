import React, { useState } from "react";
import { PieChart, Pie, Sector } from "recharts";


const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy - 130} dy={8} textAnchor="middle" fill={fill}>
        {payload.categoria}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`PV ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const PieChartAccidentes = ({ datosAgrupadosPie, agrupacionPie, obtenerDatosGrafica }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <>
        <p>Estadísticas de los accidentes</p>
        <PieChart width={450} height={400}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={datosAgrupadosPie}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cantidad"
            onMouseEnter={onPieEnter}
          />
        </PieChart>
        <a>Agrupar por: </a> <br/>
        <label className="me-3">
            <input type="radio" 
                   value={'tipo_accidente.tipo_accidente'}
                   checked={agrupacionPie === 'tipo_accidente.tipo_accidente'}
                   name="grafica"
                   onChange={(e) => obtenerDatosGrafica(e.target.value, 'Pie')}
            />
            Accidente
        </label>
        <label className="me-3">
            <input type="radio" 
                   value={'tipo_vehiculo.tipo_vehiculo'}
                   checked={agrupacionPie === 'tipo_vehiculo.tipo_vehiculo'}
                   name="grafica"
                   onChange={(e) => obtenerDatosGrafica(e.target.value, 'Pie')}
            />
            Vehículo
        </label>
        <label className="me-3">
            <input type="radio" 
                   value={'lesividade.tipo_lesion'}
                   checked={agrupacionPie === 'lesividad.lesividad'}
                   name="grafica"
                   onChange={(e) => obtenerDatosGrafica(e.target.value, 'Pie')}
            /> 
            Lesión
        </label>
    </>
  );
};

export default PieChartAccidentes;
