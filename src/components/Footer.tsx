'use client';
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="footer-logo">
            <h4 className="navbar-brand-custom">
              nebulark
            </h4>
            <p>Designing Solutions for Tomorrow</p>
          </Col>
          <Col md={4} className="footer-links">
            <h5>SITEMAP</h5>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#values">Values</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#products">Products</a></li>
            </ul>
          </Col>
          <Col md={4} className="footer-contact">
            <h5>CONTACT</h5>
            <p><a href="mailto:nebulark.net@gmail.com">nebulark.net@gmail.com</a></p>
            <p>Islamabad, Pakistan</p>
            <p>Phone: <a href="tel:+923432018677">+923432018677</a></p>
          </Col>
        </Row>
        <Row className="footer-bottom">
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center">
              <ul className="footer-bottom-links">
                <li><a href="#publisher-terms">Publisher Terms</a></li>
                <li><a href="#terms-of-service">Terms of Service</a></li>
                <li><a href="#privacy-policy">Privacy Policy</a></li>
              </ul>
              <div className="footer-social-icons">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
                <a href="https://www.linkedin.com/company/nebulark/" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
