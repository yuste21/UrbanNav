import { useState } from "react";
import NavbarPage from "../navbar/navbar";
import { Card, Collapse, Container, Button, Col, Row, Offcanvas, OverlayTrigger, Accordion, AccordionBody } from "react-bootstrap";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { center, zoom } from "../MapFunctions";
import Modal from '../modal/Modal.js'
import { useModal } from "../modal/useModal";
import { accidentes, multas, distritos } from "./data.js";
import DynamicTable from "../table/DynamicTable.js";
import FormMultas from "../radares/FormMultas.js";
import Charts from "../charts/Charts.js";

const initialElements = [false, false, false, false, false]
//----------------------[map,   chart, filter, modal, table]

const CompInicio = () => {
    const [elements, setElements] = useState(initialElements)

    const setSelectedBar = () => {
        return
    }

    const handleClose = () => {
        setElements(initialElements)
    }
    const handleFilter = () => alert('Prueba Filtrado')

    const [isOpenModal, openModal, closeModal] = useModal(false)

    //Tabla
    const dataTable = () => {
        let data = []
        multas.forEach((multa) => {
            data.push({
                ...multa,
                descuento: multa.descuento === true ? 'SI' : 'NO',
                calificacion: multa.calificacione.calificacion_multa,
                vel_limite: multa.vel_limite === null ? '-' : multa.vel_limite,
                vel_circula: multa.vel_circula === null ? '-' : multa.vel_circula,
            })
        })
        
        return data
    }

    const dataColumns = () => {
        return [
            { header: 'Mes', accessor: 'mes'},
            { header: 'Año', accessor: 'año'},
            { header: 'Hora', accessor: 'hora'},
            { header: 'Coste', accessor: 'coste'},
            { header: 'Puntos', accessor: 'puntos'},
            { header: 'Denunciante', accessor: 'denunciante' },
            { header: 'Infracción', accessor: 'infraccion' },
            { header: 'Descuento', accessor: 'descuento'},
            { header: 'Velocidad límite', accessor: 'vel_limite'},
            { header: 'Velocidad de circulación', accessor: 'vel_circula'},
            { header: 'Calificación', accessor: 'calificacion'},
        ]
    }

    return(

        <>
            <NavbarPage></NavbarPage>
            <Container>
                <h1>Bienvenido a UrbanNav Madrid</h1>
                <Row className="my-4">
                    <Col xl={4} md={12}>
                    <Card className="card-hover m-3">
                        <Card.Body>
                            <Card.Title>UrbanNav Madrid te ofrece una visión completa de la movilidad urbana</Card.Title>
                            <Card.Text>
                                <p>Características principales</p>
                                <ul>
                                    <li>
                                        <button className="btn"
                                                onClick={() => {
                                                    if (elements[0]) {
                                                        setElements(initialElements)
                                                    } else {
                                                        setElements([true, false, false, false, false]);
                                                    }
                                                }}
                                        >
                                            Mapas interactivos
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn"
                                                onClick={() => {
                                                    if (elements[1]) {
                                                        setElements(initialElements)
                                                    } else {
                                                        setElements([false, true, false, false, false]);
                                                    }
                                                }}
                                        >
                                            Filtros avanzados
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn"
                                                onClick={() => {
                                                    if (elements[2]) {
                                                        setElements(initialElements)
                                                    } else {
                                                        setElements([false, false, true, false, false]);
                                                    }
                                                }}
                                        >
                                            Gráficas informativas
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn"
                                                onClick={() => {
                                                    if (elements[3]) {
                                                        setElements(initialElements)
                                                    } else {
                                                        setElements([false, false, false, true, false]);
                                                    }
                                                }}
                                        >
                                            Información detallada
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn"
                                                onClick={() => {
                                                    if (elements[4]) {
                                                        setElements(initialElements)
                                                    } else {
                                                        setElements([false, false, false, false, true]);
                                                    }
                                                }}
                                        >
                                            Tablas con ordenación de datos
                                        </button>
                                    </li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    </Col>
                    {elements !== initialElements &&
                        <Col xs={8}>
                            {elements[0] ?
                            <div className="card m-3">
                                <div className="body">
                                    <MapContainer center={center}
                                                    zoom={zoom}
                                                    style={{ height: '400px', borderRadius: '10px' }} 
                                                    className='shadow m-3'
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        {accidentes.map((el, index) => (
                                            <Marker key={index} position={[el.lat, el.lon]}>
                                                <Popup>
                                                    <button onClick={() => openModal(index)}
                                                            className="btn"
                                                    >
                                                        Ver más información
                                                    </button>
                                                </Popup>
                                            </Marker>
                                        ))

                                        }
                                    </MapContainer>
                                </div>
                            </div>
                            : elements[1] ?
                                <>
                                    <h2>Multas de tráfico</h2>
                                    <DynamicTable data={dataTable()}
                                                columns={dataColumns()}
                                    />
                                </>
                            : elements[2] ?
                                <Offcanvas show={elements[2]} onHide={handleClose} style={{ width: '650px' }} className="custom-offcanvas canvas">
                                    <Offcanvas.Body>
                                        <FormMultas handleFilter={handleFilter}
                                                    handleClose={handleClose}
                                        />
                                    </Offcanvas.Body>
                                </Offcanvas>
                            : elements[3] ?
                                <Modal isOpen={isOpenModal} 
                                    closeModal={closeModal} 
                                    info={{ data: 'Accidente Marker', tipo: 'accidente', idx: 1}}
                                >
                                    <p style={{fontWeight: 'bold'}}>
                                        Fecha: {accidentes[0].fecha} <br/>
                                        Hora: {accidentes[0].hora} <br/>
                                        Clima: {accidentes[0].clima.clima} <br/>
                                        Edad: {accidentes[0].edad} <br/>
                                        Positivo en drogas: {accidentes[0].drogas ? 'Si' : 'No'} <br/>
                                        Positivo en alcohol: {accidentes[0].alcohol ? 'Si' : 'No'} <br/>
                                        Lesion: {[1, 2, 5, 6, 7].includes(accidentes[0].lesividadeCodigo) ? 'Leve' : 
                                                accidentes[0].lesividadeCodigo === 3 ? 'Grave' : accidentes[0].lesividadeCodigo === 4 ? 'Fallecido' : 
                                                accidentes[0].lesividadeCodigo === 14 ? 'Sin asistencia sanitaria' : 'Desconocido'} <br/>
                                        Sexo: {accidentes[0].sexo.sexo} <br/>
                                        {/* Tipo de accidente: {accidentes[0].tipo_accidente[0].tipo_accidente[0]} <br/> */}
                                        Vehiculo: {accidentes[0].tipo_vehiculo.tipo_vehiculo} <br/>
                                    </p>
                                </Modal>
                            : elements[4] ?
                                <Charts data={distritos}
                                        setSelectedBar={setSelectedBar}
                                        activatedOverlay={'Distrito'}
                                        tipo={'trafico'}
                                />
                            : <></>
                            }
                        </Col>
                    }

                    {/* ACCIDENTES */}
                    <Col xl={8} md={6}>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Accidentes</Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Mapa con los distritos y barrios clasificados por el riesgo</li>
                                        <li>Gráficas que clasifican los accidentes por diversas características</li>
                                        <li>Filtra los accidentes por diferentes atributos, permitiendo una búsqueda precisa</li>
                                        <li>Visualiza el flujo de accidentes durante un periodo de tiempo mostrando la ocurriencia de incidentes por hora o día</li>
                                        <li>Información detallada de cada accidente</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Estacionamientos</Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Mapa que muestra todas las zonas de estacionamiento, diferenciadas por 
                                            colores según el tipo de aparcamiento</li>
                                        <li>Función de búsqueda de zonas de estacionamiento por distrito, barrio, 
                                            tipo de aparcamiento y color</li>
                                        <li>Información detallada sobre cada estacionamiento, incluyendo número de plazas, 
                                            en línea o en batería y tipo de estacionamiento</li>
                                        <li>Filtro para buscar entre todos los estacionamientos según las características deseadas</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Tráfico</Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Mapa interactivo con las zonas clasificadas según la densidad 
                                            media de tráfico</li>
                                        <li>Gráficas que ordenan los distritos y barrios por volumen de tráfico</li>
                                        <li>Filtros para visualizar la densidad de tráfico en el mapa y en 
                                            los gráficos durante un periodo de tiempo concreto</li>
                                        <li>Análisis del flujo de tráfico en un distrito concreto</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>Infracciones</Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Mapa con la ubicación de todos los radares fijos</li>
                                        <li>Tablas con todas las multas por exceso de velocidad captadas 
                                            por radares, incluyendo información detallada</li>
                                        <li>Filtro para realizar una búsqueda exhaustiva de multas</li>
                                        <li>Gráficas que muestran los radares y las multas asociadas a cada uno</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default CompInicio