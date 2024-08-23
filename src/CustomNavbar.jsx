import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './custom.css'; // Import the custom CSS file

const CustomNavbar = () => {
  return (

    <Navbar className="navbar-custom" expand="lg">
    <Container>

      <h3 href="#home" className="navbar-brand-custom">
        nebulark
      </h3>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="navbar-nav-center mx-auto">
          <Nav.Link href="#home" className="nav-link-custom">Home</Nav.Link>
          <Nav.Link href="#values" className="nav-link-custom">Values</Nav.Link>
          <Nav.Link href="#about" className="nav-link-custom">About</Nav.Link>
          <Nav.Link href="#services" className="nav-link-custom">Services</Nav.Link>
          <Nav.Link href="#products" className="nav-link-custom">Products</Nav.Link>
        </Nav>
        {/* <Button className="btn-custom">Free Trial</Button> */}
      </Navbar.Collapse>
    </Container>
    </Navbar>
  );
};

export default CustomNavbar;
