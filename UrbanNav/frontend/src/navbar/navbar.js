import React, { useEffect } from 'react';
import { Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleCheck } from '../features/help/helpSlice';

function NavbarPage() {
    const location = useLocation();
    const dispatch = useDispatch()
    const help = useSelector(state => state.help.active)

    // Función para verificar si la ruta es activa
    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate()

    return (
        <Navbar expand="md" className="navbar sticky-top">
            {isActive('/flujo') &&
                <button className="btn"
                        onClick={() => navigate(-1)}
                >
                    <i class="bi bi-arrow-return-left"></i> Volver
                </button>
            }
            <Container>
                <Navbar.Brand href="/" className={`link-custom ${isActive('/') ? 'active' : ''}`}>Inicio</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto link-custom">
                        <Nav.Link href="/accidentes" className={`link-custom ${isActive('/accidentes') ? 'active' : ''}`}>Accidentes</Nav.Link>
                        <Nav.Link href="/estacionamientos" className={`link-custom ${isActive('/estacionamientos') ? 'active' : ''}`}>Estacionamientos</Nav.Link>
                        <Nav.Link href="/trafico" className={`link-custom ${isActive('/trafico') ? 'active' : ''}`}>Trafico</Nav.Link>
                        <NavDropdown className={`link-custom ${(isActive('/radares') || isActive('/multas')) ? 'active' : ''}`} title="Infracciones" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/radares" className={`link-custom ${isActive('/radares') ? 'active' : ''}`}>Radares</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/multas" className={`link-custom ${isActive('/multas') ? 'active' : ''}`}>Multas</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
                <Nav.Link href='/manual' className={`link-custom ${isActive('/manual') ? 'active' : ''}`}>
                    {isActive('/manual') ? <i className="bi bi-question-circle-fill"></i> : <i className="bi bi-question-circle"></i>}
                </Nav.Link>
            </Container>
        </Navbar>
    );
}

export default NavbarPage;
