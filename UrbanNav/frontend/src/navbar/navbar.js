import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

function NavbarPage() {
    const location = useLocation();

    // Función para verificar si la ruta es activa
    const isActive = (path) => location.pathname === path;

    return (
        <Navbar expand="md" className="navbar sticky-top">
            <Container>
                <Navbar.Brand href="/" className='link-custom'>Inicio</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto link-custom">
                        <Nav.Link href="/accidentes" className={`link-custom ${isActive('/accidentes') ? 'active' : ''}`}>Accidentes</Nav.Link>
                        <Nav.Link href="/estacionamientos" className={`link-custom ${isActive('/estacionamientos') ? 'active' : ''}`}>Estacionamientos</Nav.Link>
                        <Nav.Link href="/trafico" className={`link-custom ${isActive('/trafico') ? 'active' : ''}`}>Trafico</Nav.Link>
                        <NavDropdown className='link-custom' title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/radares" className={`link-custom ${isActive('/radares') ? 'active' : ''}`}>Radares</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/multas" className={`link-custom ${isActive('/multas') ? 'active' : ''}`}>Multas</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarPage;
