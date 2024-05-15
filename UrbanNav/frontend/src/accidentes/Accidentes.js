import { URIsAccidentes } from "./URIsAccidentes";
import { URIsDistritos } from "../distritos/URIsDistritos"
import MapAccidentes from "./MapAccidentes";
import NavbarPage from "../navbar/navbar";
import BarChartAccidente from "./BarChartAccidente";
import FormAccidentes from "./FormAccidentes";
import { useState, useEffect } from "react";
import axios from 'axios'
import Loader from "../loader/Loader";
import { center } from "../MapFunctions";
import get from 'lodash/get'
import PieChartAccidentes from "./PieChartAccidentes";

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';

function Accidentes () {
    const [accidentes, setAccidentes] = useState([])

    //Charts
    const [showCharts, setShowCharts] = useState(false)
    const [datosAgrupados, setDatosAgrupados] = useState([])
    const [agrupacion, setAgrupacion] = useState('')
    const [datosAgrupadosPie, setDatosAgrupadosPie] = useState([])
    const [agrupacionPie, setAgrupacionPie] = useState('')
    const [colCharts, setColCharts] = useState()
    const [colMap, setColMap] = useState()
    useEffect(() => {
        setColMap(showCharts ? "col-xl-7 col-lg-12" : "col-lg-12 col-xl-11")
        setColCharts(showCharts ? "col-xl-5 col-lg-12" : "col-lg-12 col-xl-1")
    }, [showCharts])

    const [zonaSeleccionada, setZonaSeleccionada] = useState(null)

    //Con el metodo get de lodash puedo acceder a atributos como accidente.sexo.sexo
    const obtenerDatosGrafica = (agrupacion, chart) => {
        var datosAgrupados
        
        if(zonaSeleccionada === null || chart === 'DeseleccionadoBar' || chart === 'DeseleccionadoPie') {
            datosAgrupados = accidentes.reduce((acc, curr) => {
                const categoria = get(curr, agrupacion)
                acc[categoria] = acc[categoria] ? acc[categoria] + 1 : 1
                return acc
            }, {})
        } else {
            var zona = distritos.find(el => el.nombre === zonaSeleccionada.nombre)
            var accidentesAsociados
            if(!zona) {
                zona = barrios.find(el => el.nombre === zonaSeleccionada.nombre)
                accidentesAsociados = accidentes.filter(el => el.barrioId === zona.id)
            } else {
                accidentesAsociados = accidentes.filter(el => barrios.some(barrio => barrio.distritoId === zona.id && barrio.id === el.barrioId));
            }
            
            datosAgrupados = accidentesAsociados.reduce((acc, curr) => {
                const categoria = get(curr, agrupacion)
                acc[categoria] = acc[categoria] ? acc[categoria] + 1 : 1
                return acc
            }, {})
        }

        var datos = Object.keys(datosAgrupados).map((categoria) => ({
            categoria: categoria,
            cantidad: datosAgrupados[categoria]
        }))
        if(chart === 'Pie' || chart === 'DeseleccionadoPie') {
            setAgrupacionPie(agrupacion)
            setDatosAgrupadosPie(datos)
        } else {
            console.log('ENTROOO')
            setAgrupacion(agrupacion)
            setDatosAgrupados(datos)
        }
    }

    //FILTRO + FORM
    const [filtro, setFiltro] = useState({})
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)

    //Draggable Marker
    const [markerPosition, setMarkerPosition] = useState(center)

    //ZONAS
    const [distritos, setDistritos] = useState([])
    const [riesgoDistrito, setRiesgoDistrito] = useState(-1)
    const [barrios, setBarrios] = useState([])
    const [riesgoBarrio, setRiesgoBarrio] = useState(-1)
    const getAll = async () => {
        setLoading(true)
        const data = (await axios.get(URIsDistritos.getAccidentesInicio)).data
        setDistritos(data.distritos)
        setBarrios(data.barrios)
        setRiesgoDistrito(data.riesgoDistrito)
        setRiesgoBarrio(data.riesgoBarrio)
        setAccidentes(data.accidentes)
        setLoading(false)
    }

    useEffect(() => {
        if(JSON.stringify(filtro) === '{}') {
            getAll()
        }
    }, [filtro])

    //FILTRO
    const handleFilter = async(data) => {
        setFiltro(data)

        var res 
        //...   

        if(JSON.stringify(data) !== '{}') {
            setLoading(true)

            //Se desactiva el Draggable Marker --> vuelvo a cargar las zonas
            //Compruebo en el if si todos los valores de las claves estan vacios y si radio esta desactivado
            if((Object.values(data)).every(valor => valor === '' || typeof valor === 'object') && !data.radio.activo) {
                getAll()
            } 
            //Se activa el Draggable Marker
            else if(data.radio.activo && data.radio.distancia === 0) {
                setAccidentes([])
                setDistritos([])
                setBarrios([])
                setDatosAgrupados([])
                setAgrupacion('')
            } else {
                //Han introducido el radio en metros, por lo que tengo que dividirlo entre 1000
                var radio = data.radio.distancia / 1000

                //Filtro 3 atributos
                //Entre Fechas + Entre Horas +
                if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_edad}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_vehiculo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_drogas}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_alcohol}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_lesion}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_sexo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_accidente}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_clima}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&clima=${data.clima}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && radio > 0) {
                    
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras_radio}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                }

                //Entre Fechas + Hora Concreta +
                else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_edad}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_vehiculo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_drogas}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_alcohol}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_lesion}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_sexo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_accidente}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_clima}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&clima=${data.clima}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '' && radio > 0 ) {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta_radio}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora=${data.hora1}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                }

                //Fecha Concreta + Entre Horas +
                else if (data.fecha1 !== '' && data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_edad}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_vehiculo}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_drogas}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_alcohol}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_lesion}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_sexo}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_accidente}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_clima}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&clima=${data.clima}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && radio > 0 ) {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras_radio}?fecha1=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                }

                //Fecha Concreta + Hora Concreta +
                else if (data.fecha1 !== '' && data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_edad}?fecha1=${data.fecha1}&hora1=${data.hora1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_vehiculo}?fecha1=${data.fecha1}&hora1=${data.hora1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_drogas}?fecha1=${data.fecha1}&hora1=${data.hora1}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_alcohol}?fecha1=${data.fecha1}&hora1=${data.hora1}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_lesion}?fecha1=${data.fecha1}&hora1=${data.hora1}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_sexo}?fecha1=${data.fecha1}&hora1=${data.hora1}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_accidente}?fecha1=${data.fecha1}&hora1=${data.hora1}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_clima}?fecha1=${data.fecha1}&hora1=${data.hora1}&clima=${data.clima}`)).data;
                } else if (data.fecha1 !== '' !== '' && data.hora1 !== '' && radio > 0 ) {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta_radio}?fecha1=${data.fecha1}&hora1=${data.hora1}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                }

                //Filtro 2 atributos
                //Entre Fechas+
                else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_entreHoras}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}&hora2=${data.hora2}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.hora1 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_horaConcreta}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&hora1=${data.hora1}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_edad}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_vehiculo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_drogas}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_alcohol}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_lesion}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_sexo}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_accidente}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_clima}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&clima=${data.clima}`)).data;
                } else if (data.fecha1 !== '' && data.fecha2 !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.entreFechas_radio}?fecha1=${data.fecha1}&fecha2=${data.fecha2}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                }

                //Fecha Concreta+
                else if (data.fecha1 !== '' && data.hora1 !== '' && data.hora2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_entreHoras}?fecha=${data.fecha1}&hora1=${data.hora1}&hora2=${data.hora2}`)).data;
                } else if(data.fecha1 !== '' && data.hora1 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_horaConcreta}?fecha=${data.fecha1}&hora=${data.hora1}`)).data;
                } else if (data.fecha1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_edad}?fecha=${data.fecha1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.fecha1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_vehiculo}?fecha=${data.fecha1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.fecha1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_drogas}?fecha=${data.fecha1}&drogas=${data.drogas}`)).data;
                } else if (data.fecha1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_alcohol}?fecha=${data.fecha1}&alcohol=${data.alcohol}`)).data;
                } else if (data.fecha1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_lesion}?fecha=${data.fecha1}&lesion=${data.lesion}`)).data;
                } else if (data.fecha1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_sexo}?fecha=${data.fecha1}&sexo=${data.sexo}`)).data;
                } else if (data.fecha1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_accidente}?fecha=${data.fecha1}&accidente=${data.accidente}`)).data;
                } else if (data.fecha1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_clima}?fecha=${data.fecha1}&clima=${data.clima}`)).data;
                } else if(data.fecha1 !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.fechaConcreta_radio}?fecha=${data.fecha1}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                }

                //Entre Horas+
                else if(data.hora1 !== '' && data.hora2 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_edad}?hora1=${data.hora1}&hora2=${data.hora2}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_vehiculo}?hora1=${data.hora1}&hora2=${data.hora2}&vehiculo=${data.vehiculo}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_drogas}?hora1=${data.hora1}&hora2=${data.hora2}&drogas=${data.drogas}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_alcohol}?hora1=${data.hora1}&hora2=${data.hora2}&alcohol=${data.alcohol}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_lesion}?hora1=${data.hora1}&hora2=${data.hora2}&lesion=${data.lesion}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_sexo}?hora1=${data.hora1}&hora2=${data.hora2}&sexo=${data.sexo}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_accidente}?hora1=${data.hora1}&hora2=${data.hora2}&accidente=${data.accidente}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_clima}?hora1=${data.hora1}&hora2=${data.hora2}&clima=${data.clima}`)).data;
                } else if(data.hora1 !== '' && data.hora2 !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.entreHoras_radio}?hora1=${data.hora1}&hora2=${data.hora2}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                }

                //Hora Concreta+
                else if (data.hora1 !== '' && data.edad1 !== '' && data.edad2 !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_edad}?hora=${data.hora1}&edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.hora1 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_vehiculo}?hora=${data.hora1}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.hora1 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_drogas}?hora=${data.hora1}&drogas=${data.drogas}`)).data;
                } else if (data.hora1 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_alcohol}?hora=${data.hora1}&alcohol=${data.alcohol}`)).data;
                } else if (data.hora1 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_lesion}?hora=${data.hora1}&lesion=${data.lesion}`)).data;
                } else if (data.hora1 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_sexo}?hora=${data.hora1}&sexo=${data.sexo}`)).data;
                } else if (data.hora1 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_accidente}?hora=${data.hora1}&accidente=${data.accidente}`)).data;
                } else if (data.hora1 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_clima}?hora=${data.hora1}&clima=${data.clima}`)).data;
                } else if(data.hora1 !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.horaConcreta_radio}?hora=${data.hora1}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                }
                
                //Edad+
                else if (data.edad1 !== '' && data.edad2 !== '' && data.vehiculo !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_vehiculo}?edad1=${data.edad1}&edad2=${data.edad2}&vehiculo=${data.vehiculo}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_drogas}?edad1=${data.edad1}&edad2=${data.edad2}&drogas=${data.drogas}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_alcohol}?edad1=${data.edad1}&edad2=${data.edad2}&alcohol=${data.alcohol}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_lesion}?edad1=${data.edad1}&edad2=${data.edad2}&lesion=${data.lesion}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_sexo}?edad1=${data.edad1}&edad2=${data.edad2}&sexo=${data.sexo}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_accidente}?edad1=${data.edad1}&edad2=${data.edad2}&accidente=${data.accidente}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.edad_clima}?edad1=${data.edad1}&edad2=${data.edad2}&clima=${data.clima}`)).data;
                } else if (data.edad1 !== '' && data.edad2 !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.edad_radio}?edad1=${data.edad1}&edad2=${data.edad2}&radio=${radio}&lat=${data.lat}&lon=${data.lon}`)).data;
                } 

                //Vehiculo+
                else if (data.vehiculo !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_accidente}?vehiculo=${data.vehiculo}&accidente=${data.accidente}`)).data;
                } else if (data.vehiculo !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_alcohol}?vehiculo=${data.vehiculo}&alcohol=${data.alcohol}`)).data;
                } else if (data.vehiculo !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_clima}?vehiculo=${data.vehiculo}&clima=${data.clima}`)).data;
                } else if (data.vehiculo !== '' && data.drogas !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_drogas}?vehiculo=${data.vehiculo}&drogas=${data.drogas}`)).data;
                } else if (data.vehiculo !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_lesion}?vehiculo=${data.vehiculo}&lesion=${data.lesion}`)).data;
                } else if (data.vehiculo !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_radio}?vehiculo=${data.vehiculo}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data;
                } else if (data.vehiculo !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.vehiculo_sexo}?vehiculo=${data.vehiculo}&sexo=${data.sexo}`)).data;
                } 

                //Drogas+
                else if (data.drogas !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.drogas_accidente}?drogas=${data.drogas}&accidente=${data.accidente}`)).data
                } else if (data.drogas !== '' && data.alcohol !== '') {
                    res = (await axios.get(`${URIsAccidentes.drogas_alcohol}?drogas=${data.drogas}&alcohol=${data.alcohol}`)).data
                } else if (data.drogas !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.drogas_clima}?drogas=${data.drogas}&clima=${data.clima}`)).data
                } else if (data.drogas !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.drogas_lesion}?drogas=${data.drogas}&lesion=${data.lesion}`)).data
                } else if (data.drogas !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.drogas_radio}?drogas=${data.drogas}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                } else if (data.drogas !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.drogas_sexo}?drogas=${data.drogas}&sexo=${data.sexo}`)).data
                } 

                //Alcohol+
                else if (data.alcohol !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.alcohol_accidente}?alcohol=${data.alcohol}&accidente=${data.accidente}`)).data
                } else if (data.alcohol !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.alcohol_clima}?alcohol=${data.alcohol}&clima=${data.clima}`)).data
                } else if (data.alcohol !== '' && data.lesion !== '') {
                    res = (await axios.get(`${URIsAccidentes.alcohol_lesion}?alcohol=${data.alcohol}&lesion=${data.lesion}`)).data
                } else if (data.alcohol !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.alcohol_radio}?alcohol=${data.alcohol}&radio=${radio}&lat=${data.lat}&lon=${data.lon}`)).data
                } else if (data.alcohol !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.alcohol_sexo}?alcohol=${data.alcohol}&sexo=${data.sexo}`)).data
                } 

                //Lesion+
                else if (data.lesion !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.lesion_accidente}?lesion=${data.lesion}&accidente=${data.accidente}`)).data
                } else if (data.lesion !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.lesion_clima}?lesion=${data.lesion}&clima=${data.clima}`)).data
                } else if (data.lesion !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.lesion_radio}?lesion=${data.lesion}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                } else if (data.lesion !== '' && data.sexo !== '') {
                    res = (await axios.get(`${URIsAccidentes.lesion_sexo}?lesion=${data.lesion}&sexo=${data.sexo}`)).data
                } 

                //Sexo+
                else if (data.sexo !== '' && data.accidente !== '') {
                    res = (await axios.get(`${URIsAccidentes.sexo_accidente}?sexo=${data.sexo}&accidente=${data.accidente}`)).data
                } else if (data.sexo !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.sexo_clima}?sexo=${data.sexo}&clima=${data.clima}`)).data
                } else if (data.sexo !== '' && radio > 0 ) {
                    res = (await axios.get(`${URIsAccidentes.sexo_radio}?sexo=${data.sexo}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                } 

                //Accidente+
                else if (data.accidente !== '' && data.clima !== '') {
                    res = (await axios.get(`${URIsAccidentes.accidente_clima}?accidente=${data.accidente}&clima=${data.clima}`)).data
                } else if (data.accidente !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.accidente_radio}?accidente=${data.accidente}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                } 

                //Clima+
                else if (data.clima !== '' && radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.clima_radio}?clima=${data.clima}&radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                } 

                //Individuales
                else if (data.fecha1 !== '') {    
                    if (data.fecha2 !== '') {      // Entre fechas
                        res = (await axios.get(`${URIsAccidentes.fecha_entre}?fecha1=${data.fecha1}&fecha2=${data.fecha2}`)).data;
                    } else {                        // Fecha concreta
                        res = (await axios.get(`${URIsAccidentes.fecha_concreta}?fecha=${data.fecha1}`)).data;
                    }
                } else if (data.hora1 !== '') {         
                    if (data.hora2 !== '') {       // Entre horas
                        res = (await axios.get(`${URIsAccidentes.hora_entre}?hora1=${data.hora1}&hora2=${data.hora2}`)).data;
                    } else {                        // Hora concreta
                        res = (await axios.get(`${URIsAccidentes.hora_concreta}?hora=${data.hora1}`)).data;
                    }
                } else if (data.edad1 !== '' && data.edad2 !== '') { // Edad
                    res = (await axios.get(`${URIsAccidentes.edad}?edad1=${data.edad1}&edad2=${data.edad2}`)).data;
                } else if (data.vehiculo !== '') { // Vehículo
                    res = (await axios.get(`${URIsAccidentes.vehiculo}?vehiculo=${data.vehiculo}`)).data;
                } else if (data.drogas !== '') { // Drogas
                    res = (await axios.get(`${URIsAccidentes.drogas}?drogas=${data.drogas}`)).data;
                } else if (data.alcohol !== '') { // Alcohol
                    res = (await axios.get(`${URIsAccidentes.alcohol}?alcohol=${data.alcohol}`)).data;
                } else if (data.lesion !== '') { // Lesión
                    res = (await axios.get(`${URIsAccidentes.lesion}?lesion=${data.lesion}`)).data;
                } else if (data.sexo !== '') { // Sexo
                    res = (await axios.get(`${URIsAccidentes.sexo}?sexo=${data.sexo}`)).data;
                } else if (data.accidente !== '') { // Tipo de accidente
                    res = (await axios.get(`${URIsAccidentes.accidente}?accidente=${data.accidente}`)).data;
                } else if (data.clima !== '') { // Clima
                    res = (await axios.get(`${URIsAccidentes.clima}?clima=${data.clima}`)).data;
                } else if (radio > 0) {
                    res = (await axios.get(`${URIsAccidentes.radio}?radio=${radio}&lat=${data.radio.lat}&lon=${data.radio.lon}`)).data
                }
                

                if(!data.radio.activo && data.zona.length !== 0) {
                    res = (await axios.post(`${URIsAccidentes.zona_concreta}`, { accidentes: res.accidentes, zona: data.zona })).data
                }

                if(!data.radio.activo && res.accidentes.length > 500) {
                    setDistritos(res.distritos)
                    setBarrios(res.barrios)
                } else {
                    setDistritos([])
                    setBarrios([])
                }

                setAccidentes(res.accidentes)
                setDatosAgrupados([])
                setAgrupacion('')
            }
            setLoading(false)
        } else {    //Limpiar filtro
            getAll()
        }

        
    } 

    const filtroString = (filtro) => {
        let resultado = ''
        for(let key in filtro) {
            if(filtro[key]) {
                let valor
                let clave
                if(key !== 'radio') {   //Ignoro el atributo radio
                    if(filtro[key] === '1') {
                        clave = key + ': '
                        valor = 'positivo, '
                    } else if(filtro[key] === '0') {
                        clave = key + ': '
                        valor = 'negativo, '
                    } else if(key === 'zona' && filtro[key].length === 0) {
                        clave = ''
                        valor = ''
                        valor = filtro[key]
                    } else if(key === 'zona') {
                        clave = 'zona concreta, '
                        valor = ''
                    } else if(key === 'hora1' && filtro.hora2 === '') {
                        clave = 'hora concreta: '
                        valor = `${filtro.hora1.split(':')[0]}:${filtro.hora1.split(':')[1]}, `
                    } else if(key === 'hora2') {
                        clave = 'franja horaria: '
                        valor = `${filtro.hora1} - ${filtro.hora2}, `
                    } else if(key === 'fecha1' && filtro.fecha2 === '') {
                        clave = 'fecha concreta: '
                        valor = filtro.fecha1 + ', '
                    } else if(key === 'fecha2') {
                        clave = 'entre fechas: '
                        valor = `desde el ${filtro.fecha1} hasta el ${filtro.fecha2}, `
                    } else if(key === 'hora1') {
                        clave = ''
                        valor = ''
                    } else if(key === 'fecha1') {
                        clave = ''
                        valor = ''
                    } else {
                        clave = key + ': '
                        valor = filtro[key] + ', '
                    }
                    resultado += clave + valor
                }
            }
        }

        if(resultado.length > 0) {
            resultado = resultado.slice(0, -2)
        }

        return resultado
    }

    return(
        <div className="padre">
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ? 
                    <Loader></Loader>
                    :
                    <>
                        {JSON.stringify(filtro) !== '{}' && filtroString(filtro) !== '' &&
                            <div className="row">
                                <h4>Filtrado por {filtroString(filtro)}</h4>
                            </div>
                        }
                        <div className="row">   
                            {/* GRAFICAS */}
                            <div className={colCharts}>
                                {showCharts === false ?
                                    <>
                                        <button className="btn btn-azul mt-3"
                                            onClick={() => {
                                                obtenerDatosGrafica('clima.clima', 'Bar')
                                                obtenerDatosGrafica('tipo_accidente.tipo_accidente', 'Pie')
                                                setShowCharts(true)
                                            }}
                                        >
                                            Mostrar estadísticas
                                        </button> <br/>

                                    </>
                                :
                                    <>
                                        <button className="btn btn-rojo mb-3 mt-3"
                                            onClick={() => setShowCharts(false)}
                                        >
                                            Ocultar estadísticas
                                        </button> <br/>
                                        <div className="card">
                                            <div className="card-body">
                                                <BarChartAccidente datosAgrupados={datosAgrupados} 
                                                                   agrupacion={agrupacion} 
                                                                   obtenerDatosGrafica={obtenerDatosGrafica} 
                                                />
                                                <hr></hr>
                                                <PieChartAccidentes datosAgrupadosPie={datosAgrupadosPie}
                                                                    agrupacionPie={agrupacionPie}
                                                                    obtenerDatosGrafica={obtenerDatosGrafica}
                                                />
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                            {/* MAPAS */}
                            <div className={colMap}>
                                <div className="col-12">
                                    <MapAccidentes distritos={distritos}
                                                   barrios={barrios} 
                                                   riesgoDistrito={riesgoDistrito}
                                                   riesgoBarrio={riesgoBarrio}
                                                   accidentes={accidentes} 
                                                   filtro={filtro} 
                                                   markerPosition={markerPosition} 
                                                   setMarkerPosition={setMarkerPosition}
                                                   handleFilter={handleFilter}
                                                   obtenerDatosGrafica={obtenerDatosGrafica}
                                                   zonaSeleccionada={zonaSeleccionada}
                                                   setZonaSeleccionada={setZonaSeleccionada}
                                                   setLoading={setLoading}
                                    />
                                </div>
                                {/* FILTRO */}
                                <div className="col-12">
                                    {showForm ? 
                                        <Button
                                            onClick={() => setShowForm(!showForm)}
                                            aria-controls="example-collapse-text"
                                            aria-expanded={showForm}
                                            className="mb-4 btn-rojo"
                                        >
                                            Ocultar filtro
                                        </Button>
                                    :
                                        <Button
                                            onClick={() => setShowForm(!showForm)}
                                            aria-controls="example-collapse-text"
                                            aria-expanded={showForm}
                                            className="btn-azul mb-4"
                                        >
                                            Mostrar filtro
                                        </Button>
                                    }
                                    <div style={{ minHeight: '150px', position: 'relative' }}>
                                        <Collapse in={showForm} dimension="height">
                                        <div id="example-collapse-text" style={{ width: '100%', position: 'absolute', left: 0, right: 0 }}>
                                            <FormAccidentes handleFilter={handleFilter} 
                                                            markerPosition={markerPosition}
                                                            filtro={filtro}
                                            />
                                        </div>
                                        </Collapse>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br/>
                    </>
                }
            </div>
        </div>
    )
}

export default Accidentes