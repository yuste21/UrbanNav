import { Navbar, Nav, NavDropdown, NavItem } from 'react-bootstrap';
import { redirect, useNavigate, useParams } from 'react-router-dom'
import React, { useState, useEffect } from 'react';

function NavbarPage() {

    return(
        <Nav className='me-auto mb-3'>
            <Nav.Link href='/accidentes' className='navbar-link' >Accidentes</Nav.Link>
            <Nav.Link href='/estacionamientos' className='navbar-link' >Estacionamientos</Nav.Link>
            <Nav.Link href='/trafico' className='navbar-link' >Trafico</Nav.Link>
            <Nav.Link href='/radares' className='navbar-link' >Radares</Nav.Link>
        </Nav>
    )
}

export default NavbarPage