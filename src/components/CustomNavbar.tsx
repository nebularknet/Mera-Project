'use client';
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

const CustomNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <Navbar className="navbar-custom" expand="lg">
      <Container className="align-items-center">
        <Navbar.Brand href="/" className="navbar-brand-custom">
          nebulark
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav-center">
            <Nav.Link 
              href="/" 
              className={`nav-link-custom ${pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              href="/#values" 
              className={`nav-link-custom ${pathname === '/' ? 'active' : ''}`}
            >
              Values
            </Nav.Link>
            <Nav.Link 
              href="/#about" 
              className={`nav-link-custom ${pathname === '/' ? 'active' : ''}`}
            >
              About
            </Nav.Link>
            <Nav.Link 
              href="/#services" 
              className={`nav-link-custom ${pathname === '/' ? 'active' : ''}`}
            >
              Services
            </Nav.Link>
            <Nav.Link 
              href="/#products" 
              className={`nav-link-custom ${pathname === '/' ? 'active' : ''}`}
            >
              Products
            </Nav.Link>
            <Nav.Link 
              href="/blog" 
              className={`nav-link-custom ${pathname.startsWith('/blog') ? 'active' : ''}`}
            >
              Blog
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar; 