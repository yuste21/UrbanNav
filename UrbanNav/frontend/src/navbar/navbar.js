import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { redirect, useNavigate, useParams } from 'react-router-dom'
import React, { useState, useEffect } from 'react';

function NavbarPage() {

    
        {/*<Nav className='me-auto mb-3'>
            <Nav.Link href='/accidentes' className='navbar-link' >Accidentes</Nav.Link>
            <Nav.Link href='/estacionamientos' className='navbar-link' >Estacionamientos</Nav.Link>
            <Nav.Link href='/trafico' className='navbar-link' >Trafico</Nav.Link>
            <Nav.Link href='/radares' className='navbar-link' >Radares</Nav.Link>
        </Nav>*/}
    return(
        <Navbar expand="md" className="navbar sticky-top">
            <Container>
                <Navbar.Brand href="/" className='link-custom'>Inicio</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto link-custom">
                        <Nav.Link href="/accidentes" className='link-custom'>Accidentes</Nav.Link>
                        <Nav.Link href="/estacionamientos" className='link-custom'>Estacionamientos</Nav.Link>
                        <Nav.Link href="/trafico" className='link-custom'>Trafico</Nav.Link>
                        <NavDropdown className='link-custom' title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/radares" className='link-custom'>Radares</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/multas" className='link-custom'>Multas</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavbarPage