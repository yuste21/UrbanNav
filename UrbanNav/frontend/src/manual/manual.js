import NavbarPage from "../navbar/navbar"
import ManualAccidentes from "./accidentes"
import ManualEstacionamientos from "./estacionamientos"
import ManualTrafico from "./trafico"
import ManualInfracciones from "./infracciones"

const Manual = () => {

    return (
        <div>
            <NavbarPage/>
            <div className="container">
                <h1>1. Introducción</h1>
                <p>
                    Bienvenido a UrbanNav Madrid, la herramienta diseñada para facilitar la comprensión de las 
                    dinámicas de movimiento urbanas y la identificación de zonas de riesgo en la ciudad. 
                    A través de gráficos, tablas y mapas interactivos, esta aplicación proporciona información 
                    detallada sobre accidentes, estacionamientos, tráfico, radares y multas.
                </p>

                <h1>2. Navegación</h1>
                <p>
                    La barra de navegación es tu guía a través de la aplicación. Con ella, podrás acceder 
                    fácilmente a todas las secciones y siempre sabrás en qué página te encuentras gracias a la 
                    indicación visual activa.
                </p>

                <h1>3. Inicio</h1>
                <p>
                    La página de inicio ofrece una visión general de las herramientas disponibles y una explicación 
                    de los datos que encontrarás en cada sección.
                </p>

                <ManualAccidentes/>

                <ManualEstacionamientos/>

                <ManualTrafico/>

                <ManualInfracciones/>
            </div>
        </div>
    )
}

export default Manual