
const ManualTrafico = () => {

    return (
        <>
            <hr/>
            <h2>6. Tráfico</h2>
            <hr/>

            <p>
                La página de Tráfico te ofrece una visión detallada de la densidad de tráfico en Madrid, con datos 
                recopilados por estaciones distribuidas por toda la ciudad. Estos datos son esenciales para comprender 
                los patrones de movilidad y las áreas más transitadas. Al acceder a esta sección, la visualización inicial 
                presentará el tráfico correspondiente a un mes específico.
            </p>

            <hr className="subseccion" />
            <h3>6.1 Mapa</h3>
            <hr className="subseccion" />

            <p>
                El mapa de tráfico incluye funcionalidades estándar y la opción adicional de visualizar las estaciones de 
                tráfico. Las estaciones y las zonas se diferencian por colores que indican la densidad del tráfico. Al 
                seleccionar una estación o zona, se abrirá una ventana modal con detalles relevantes y un formulario que te 
                permitirá definir un intervalo de tiempo para analizar el flujo de tráfico en la zona seleccionada.
            </p>

            <hr className="subseccion" />
            <h3>6.2 Flujo de tráfico</h3>
            <hr className="subseccion" />

            <p>
                El análisis del flujo de tráfico funciona de manera similar al de los accidentes. En el formulario de la 
                ventana modal, solo podrás introducir dos fechas o dos horas. A continuación, se mostrará una gráfica con 
                barras que representan el tráfico registrado en la zona o estación durante el periodo especificado. Un mapa 
                adicional ilustrará la ubicación exacta de la zona o estación. Si se trata de un distrito, podrás 
                seleccionar una estación específica para obtener datos detallados de tráfico recopilados por esa estación.
                Si se ingresan horas en el formulario, el sistema reflejará en las barras de inicio y fin el tráfico 
                correspondiente a la hora completa ingresada, independientemente de los minutos especificados. Esto ocurre 
                porque el sistema registra el tráfico de manera horaria y no por minutos específicos. Así, se garantiza una 
                visualización consistente del flujo de tráfico por cada hora completa.
            </p>

            <hr className="subseccion" />
            <h3>6.3 Leyenda</h3>
            <hr className="subseccion" />

            <p>
                La leyenda, situada junto al mapa, asigna un color a cada nivel de densidad de tráfico y proporciona 
                información adicional sobre la zona seleccionada o señalada, como el nombre y el tráfico medio basado en 
                los criterios de búsqueda aplicados.
            </p>

            <hr className="subseccion" />
            <h3>6.4 Gráfica</h3>
            <hr className="subseccion" />

            <p>
                Al hacer clic en el icono de la gráfica, se mostrará un gráfico que ordena distritos o barrios por densidad 
                de tráfico, de mayor a menor. Al seleccionar una barra del gráfico, se activará un pop-up en el mapa que 
                indica el nombre de la zona correspondiente.
            </p>

            <hr className="subseccion" />
            <h3>6.5 Filtro</h3>
            <hr className="subseccion" />

            <p>
                Si pulsamos el botón del filtro saldrá un menú lateral similar al de accidentes con un filtro. En el filtro 
                podremos introducir una fecha concreta, un periodo comprendido entre dos fechas o un mes. Al hacer clic 
                sobre el botón de filtrado se realizará una búsqueda del tráfico registrado durante el periodo de tiempo 
                seleccionado. Además se podrá seleccionar un sentido de tráfico conreto. Y al darle al botón 'Mostrar todo 
                el tráfico' se mostrará el tráfico de cada zona con todos los datos registrados en el sistema. El botón 
                'Limpiar filtro' funciona igual que en el resto de filtros.
            </p>
        </>
    )
}

export default ManualTrafico