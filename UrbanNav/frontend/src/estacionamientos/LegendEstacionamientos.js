const LegendEstacionamientos = () => {
    return(
        <div className="legend">
            <h4>Leyenda</h4>
            <div className="info legend">
                <div className="mb-2">
                    <p>Tipo de estacionamiento (color)</p>
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#2AAD27'}}></i>Residencial
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#2A81CB'}}></i>Rotacional
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#CB8427'}}></i>Larga estancia
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#CB2B3E'}}></i>Ámbito sanitario
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#FFD326'}}></i>Minusválidos
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#3D3D3D'}}></i>Reserva de motos
                </div>
                <div className="mb-2">
                    <i style={{backgroundColor: '#9C2BCB'}}></i>Carga y descarga
                </div>
            </div>
        </div>
    )
}

export default LegendEstacionamientos