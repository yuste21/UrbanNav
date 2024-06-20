
const ManualInfracciones = () => {

    return (
        <>
            <hr/>
            <h2>7. Radares</h2>
            <hr/>

            <p>
                Esta página visualiza la ubicación de los radares fijos en Madrid y las multas registradas por cada uno. 
                Es una herramienta útil para conocer dónde están situados los radares y cuáles capturan más infracciones. 
                La visualización inicial muestra 50 multas asociadas a cada radar.
            </p>

            <hr className="subseccion" />
            <h3>7.1 Mapa</h3>
            <hr className="subseccion" />

            <p>
                Esta página visualiza la ubicación de los radares fijos en Madrid y las multas registradas por cada uno. 
                Es una herramienta útil para conocer dónde están situados los radares y cuáles capturan más infracciones. 
                La visualización inicial muestra 50 multas asociadas a cada radar.
            </p>

            <hr className="subseccion" />
            <h3>7.2 Gráfica</h3>
            <hr className="subseccion" />

            <p>
                Al hacer clic en el icono de gráfica, se muestra un gráfico que clasifica los radares por el número de 
                multas registradas. Pasar el cursor sobre una barra proporciona información rápida del radar, y al hacer 
                clic, se resalta el radar en el mapa con un marcador verde y se muestra una tabla con las multas asociadas.
            </p>

            <hr className="subseccion" />
            <h3>7.3 Filtro</h3>
            <hr className="subseccion" />

            <p>
                El filtro te permite buscar multas por criterios específicos como puntos infraccionados, aplicación de 
                descuentos, coste de la multa, clasificación y hora de la multa. Este filtro también incluye la función 
                ‘Limpiar filtro’ para restablecer los campos o realizar una nueva carga de datos y el manejo de errores 
                de entrada.
            </p>

            <hr className="subseccion" />
            <h3>7.4 Tabla</h3>
            <hr className="subseccion" />

            <p>
                La tabla detalla cada multa y permite ordenar las infracciones ascendente o descendentemente por cualquier 
                atributo simplemente haciendo clic en la cabecera correspondiente.
            </p>

            <hr/>
            <h2>8. Multas</h2>
            <hr/>

            <p>
                La sección de Multas te ofrece acceso a una base de datos completa de todas las infracciones, permitiéndote 
                no solo ver las multas por exceso de velocidad sino también una variedad de otras infracciones.
            </p>

            <hr className="subseccion" />
            <h3>8.1 Tabla</h3>
            <hr className="subseccion" />

            <p>
                Similar a la sección de Radares, esta tabla proporciona información adicional como el barrio, el motivo de 
                la infracción y el denunciante. Puedes ordenar las multas según cualquier columna, ajustar el número de 
                multas mostradas por página y navegar entre las distintas páginas de la tabla.
            </p>

            <hr className="subseccion" />
            <h3>8.2 Filtro</h3>
            <hr className="subseccion" />

            <p>
                El filtro se ha enriquecido con la capacidad de buscar multas por motivo de infracción. Un botón adyacente 
                al campo de búsqueda despliega ejemplos de infracciones para facilitar tu selección. Además, puedes filtrar 
                las multas por barrio y denunciante para una búsqueda más específica.
            </p>
        </>
    )
}

export default ManualInfracciones