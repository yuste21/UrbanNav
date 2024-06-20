
const ManualAccidentes = () => {
    return (
        <>
            <hr/>
            <h2>4. Accidentes</h2>
            <hr/>

            <p>
                En esta página se tratarán todos los datos asociados a los accidentes de tráfico. Estos datos 
                se mostrarán en un mapa y en dos gráficos, complementados con una leyenda que proporciona 
                información adicional sobre las zonas representadas y un filtro con el que hacer una búsqueda
                exhaustiva. Al visitar esta página por primera vez o tras una actualización, se realizará una 
                carga inicial mostrando 10 accidentes por barrio.
            </p>

            <hr className="subseccion" />
            <h3>4.1. Mapa</h3>
            <hr className="subseccion" />

            <p>
                Todos los mapas cuentan con un botón ‘Centrar Mapa’ que sitúa la vista en el centro de Madrid 
                con un zoom estándar. Las zonas coloreadas en el mapa reflejan el nivel de riesgo basado en los 
                accidentes. Puedes alternar la visualización entre ‘Barrios’ y ‘Distritos’ y, si hay menos de 
                500 accidentes, también podrás ver marcadores individuales.
            </p>

            <p>
                Al pulsar sobre una zona veremos que aparece un pop-up del cual puede que se muestren dos 
                opciones: 'Ver accidentes de este distrito/barrio' y 'Ver más información'. La primera opción 
                solo aparecerá si la zona contiene menos de 100 accidentes. Al hacer clic sobre la opción 
                'Ver accidentes de este distrito/barrio' se ocultarán todas las zonas dibujadas del mapa y solo 
                aparecerán marcadores de accidentes sobre la zona que hemos seleccionado. Debajo del botón 
                'Centrar Mapa' aparecerá uno nuevo que dirá 'Volver a mostrar distritos/barrios'. Si hacemos 
                clic sobre el botón desaparecerán los marcadores y volverán a aparecer las zonas en el mapa. 
                Si hacemos clic sobre el botón 'Ver más información' al seleccionar una zona aparecerá una 
                ventana emergente que mostrará información sobre la zona como el nombre, el riesgo y el número 
                de accidentes en base a la búsqueda aplicada y debajo aparecerá un formulario. Este formulario 
                se explicará más adelante. Podremos cerrar la ventana emergente al hacer clic sobre un botón 
                en forma de <i class="bi bi-x-lg"></i> posicionado en la esquina superior derecha o al pulsar 
                fuera de la propia ventana. Al hacer clic sobre el marcador de un accidente aparecerá la opción
                de 'Ver más información' y al seleccionarla se verá una ventana modal con información sobre el 
                accidente y todas las personas implicadas en él. En este caso no aparecerá el formulario en la 
                parte inferior de la ventana modal.
            </p>

            <hr className="subseccion" />
            <h3>4.2 Flujo de accidentes</h3>
            <hr className="subseccion" />

            <p>
                El formulario en la ventana emergente permite introducir dos fechas o dos horas para analizar el 
                flujo de accidentes. Debes asegurarte de que la primera fecha/hora sea anterior a la segunda para 
                evitar errores. La gráfica resultante y el mapa adjunto te permitirán examinar la distribución de 
                accidentes por día o por hora. En caso contrario saldrá un mensaje de error por pantalla. 
                Si introducimos 2 fechas correctas se mostrará una gráfica donde cada barra agrupa los accidentes
                ocurridos durante ese día. Además a la derecha de la gráfica veremos un mapa que muestra la zona 
                dibujadada en él. En el caso de haber seleccionado un distrito veremos dentro de él los barrios 
                por los que está compuesto. Y si hacemos clic sobre un barrio la gráfica se actualiza mostrando 
                solo los datos de ese barrio. De esta manera podremos analizar el flujo de tráfico de las distintas 
                zonas de un distrito. Si introducimos 2 horas veremos una gráfica donde cada barra representa todos 
                los accidentes transcurridos durante esa hora todos los dias registrados en la base de datos. 
                La primera barra incluye los datos desde la hora de inicio hasta el comienzo de la hora siguiente, 
                y la última barra abarca desde el inicio de la última hora hasta el final del periodo seleccionado. 
                Al colocar el cursor sobre una barra veremos el día/hora y la cantidad de accidentes registrados.
            </p>

            <hr className="subseccion" />
            <h3>4.3 Leyenda</h3>
            <hr className="subseccion" />

            <p>
                La leyenda, ubicada adyacente al mapa, sirve como guía para interpretar la paleta de colores 
                utilizada en la representación de las zonas. Los tonos más cálidos señalan áreas de mayor 
                peligrosidad. Al posicionar el cursor sobre una zona específica o al hacer clic en ella, la 
                leyenda proporcionará información detallada, incluyendo el número total de accidentes, el nivel 
                de riesgo y la lesividad media. La lesividad media se mide en una escala de 0 a 100, reflejando 
                el promedio de gravedad de los accidentes ocurridos. El valor del riesgo se incrementa 
                proporcionalmente con la frecuencia de accidentes en la zona.
            </p>

            <hr className="subseccion" />
            <h3>4.4 Gráfica</h3>
            <hr className="subseccion" />

            <p>
                Al seleccionar el icono correspondiente a las gráficas <i className="bi bi-bar-chart"></i>, 
                se desplegarán dos tipos distintos que categorizan los accidentes según diversas características. 
                La gráfica de barras se enfoca en los atributos de las personas involucradas en los accidentes, 
                mientras que la gráfica circular analiza aspectos inherentes a los propios accidentes. 
                Al hacer clic en una zona específica del mapa, ambas gráficas se actualizarán para reflejar 
                los datos de accidentes pertinentes a esa área seleccionada.
            </p>

            <hr className="subseccion" />
            <h3>4.5 Filtro</h3>
            <hr className="subseccion" />

            <p>
                Al activar el icono del filtro <i class="bi bi-filter"></i>, se desplegará un panel lateral que 
                contiene un formulario detallado. Este panel puede cerrarse seleccionando el botón con forma de 
                <i class="bi bi-x-lg"></i> situado en la esquina superior derecha o haciendo clic fuera del 
                área del menú. En la parte inferior del panel de filtro, encontrarás dos opciones: 'Filtrar' 
                y 'Limpiar filtro'. Al seleccionar 'Filtrar' sin completar los campos requeridos, recibirás una 
                notificación indicando 'Datos incompletos'. Si los campos están correctamente rellenados, se 
                procederá con la búsqueda según los criterios especificados. Al elegir 'Limpiar filtro', aparecerá 
                un mensaje preguntando si deseas volver a la carga inicial de datos. Aceptar este mensaje 
                reiniciará la carga de datos y limpiará el filtro. Si decides no aceptar, simplemente se borrarán 
                los campos del formulario sin iniciar una nueva búsqueda.
            </p>
        </>
    )
}

export default ManualAccidentes
