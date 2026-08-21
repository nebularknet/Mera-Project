'use client';
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

const CustomNavbar: React.FC = () => {
  const pathname = usePathname();

  // The careers admin dashboard is a standalone internal tool — hide the
  // marketing navbar there so it doesn't overlap the dashboard chrome.
  if (pathname?.startsWith("/careers/admin")) return null;

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
              href="/studio" 
              className={`nav-link-custom ${pathname?.startsWith('/studio') ? 'active' : ''}`}
            >
              Studio
            </Nav.Link>
            <Nav.Link 
              href="/academy" 
              className={`nav-link-custom ${pathname?.startsWith('/academy') ? 'active' : ''}`}
            >
              Academy
            </Nav.Link>
            <Nav.Link 
              href="/blog" 
              className={`nav-link-custom ${pathname?.startsWith('/blog') ? 'active' : ''}`}
            >
              Blog
            </Nav.Link>
            <Nav.Link 
              href="/jobs" 
              className={`nav-link-custom ${pathname?.startsWith('/jobs') ? 'active' : ''}`}
            >
              Careers
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar; 