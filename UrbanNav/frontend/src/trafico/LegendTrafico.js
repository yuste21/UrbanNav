const LegendTrafico = () => {

    return(
        <div className="legend">
            <h4>Leyenda</h4>
            <div className="info legend">
                <div className="mb-2">
                    <p>Densidad del tráfico</p>
                </div>
                <div className="mb-2">
                    <i style={{ background: '#2A81CB' }}></i>Baja
                </div>
                <div className="mb-2">
                    <i style={{ background: '#FFD326' }}></i>Media
                </div>
                <div className="mb-2">
                    <i style={{ background: '#CB2B3E' }}></i>Alta
                </div>
            </div>
        </div>
    )
}

export default LegendTrafico