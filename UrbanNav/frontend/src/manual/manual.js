import NavbarPage from "../navbar/navbar"
import ManualAccidentes from "./accidentes"
import ManualEstacionamientos from "./estacionamientos"
import ManualTrafico from "./trafico"
import ManualInfracciones from "./infracciones"
import { Card } from "react-bootstrap"

const Manual = () => {

    return (
        <div>
            <NavbarPage/>
            <div className="container">
                <Card className="my-5 card-inicio p-5">
                    <Card className="m-3">
                        <Card.Header><h1>Manual de usuario</h1></Card.Header>
                    </Card>

                    <hr/>
                    <h2>1. Introducción</h2>
                    <hr/>
                    
                    <p>
                        Bienvenido a UrbanNav Madrid, la herramienta diseñada para facilitar la comprensión de las 
                        dinámicas de movimiento urbanas y la identificación de zonas de riesgo en la ciudad. 
                        A través de gráficos, tablas y mapas interactivos, esta aplicación proporciona información 
                        detallada sobre accidentes, estacionamientos, tráfico, radares y multas.
                    </p>

                    <hr/>
                    <h2>2. Navegación</h2>
                    <hr/>

                    <p>
                        La barra de navegación es tu guía a través de la aplicación. Con ella, podrás acceder 
                        fácilmente a todas las secciones y siempre sabrás en qué página te encuentras gracias a la 
                        indicación visual activa.
                    </p>

                    <hr/>
                    <h2>3. Inicio</h2>
                    <hr/>

                    <p>
                        La página de inicio ofrece una visión general de las herramientas disponibles y una explicación 
                        de los datos que encontrarás en cada sección.
                    </p>

                    <ManualAccidentes/>

                    <ManualEstacionamientos/>

                    <ManualTrafico/>

                    <ManualInfracciones/>
                    </Card>
            </div>
        </div>
    )
}

export default Manual