const ManualEstacionamientos = () => {
    return (
        <>
            <h1>5. Estacionamientos</h1>
            <p>
                La sección de Estacionamientos de UrbanNav Madrid te permite explorar las áreas de aparcamiento 
                de la ciudad, clasificadas por su propósito: residencial, rotacional, sanitario, para discapacitados, 
                motocicletas, carga y descarga, y larga estancia. Al igual que en la sección de accidentes, la 
                visualización inicial muestra 10 estacionamientos por barrio.
            </p>

            <h2>5.1 Mapa</h2>
            <p>
                El mapa de estacionamientos comparte funcionalidades con otros mapas interactivos de la aplicación, 
                como centrar la vista en Madrid o alternar entre la visualización de barrios y distritos. Si se 
                muestran menos de 500 estacionamientos, podrás activar una opción para visualizar todos los 
                aparcamientos disponibles. Al seleccionar una zona, se mostrarán todos los estacionamientos de esa 
                área. Al hacer clic en un marcador, se desplegará un pop-up con detalles como el número de plazas 
                disponibles, el tipo de uso y si el estacionamiento es en línea o en batería. Los marcadores se 
                diferencian por colores según su tipo de uso.
            </p>

            <h2>5.2 Leyenda</h2>
            <p>
                Ubicada junto al mapa, la leyenda facilita la interpretación de la clasificación de los estacionamientos 
                según el color asignado a cada tipo de uso.
            </p>

            <h2>5.3 Filtro</h2>
            <p>
                El filtro te permite especificar el tipo de aparcamiento (en línea o batería) y el uso (rotacional, 
                residencial, sanitario, para discapacitados, motocicletas, larga estancia, carga y descarga). También 
                puedes filtrar por el número de plazas estableciendo un mínimo, un máximo o ambos. Si queremos buscar por 
                un número de plazas concreto basta con introducir el mismo número como mínimo y máximo. En caso de que el 
                valor mínimo ingresado sea mayor que el máximo, se mostrará un mensaje de error. El botón ‘Limpiar filtro’ 
                te da la opción de vaciar los campos del filtro o realizar una nueva carga inicial de datos.
            </p>
        </>
    )
}

export default ManualEstacionamientos