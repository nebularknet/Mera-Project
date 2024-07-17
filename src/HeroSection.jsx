import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { FaArrowAltCircleRight } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'; // Import the custom CSS file

const HeroSection = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row>
          <Col md={6} className="text-container">
            <h1 className="hero-title">
              Data Informed Insights To Prove Your <span className="highlight">Team's Success</span>
            </h1>
            <p className="hero-subtitle">
              Find Your High-Points & Prove It With Data In <span className="highlight underline">One Day</span>
            </p>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Your Work Email"
                aria-label="Your Work Email"
              />
              <Button variant="primary" className="btn-custom">See How It Works</Button>
            </InputGroup>
            <div className="create-account-link">
              <FaArrowAltCircleRight className="link-icon" />
              <span className="link-text">Create Free Account</span>
            </div>
          </Col>
          <Col md={6} className="image-container">
            <img src="propelo-hero-section.png" alt="Hero Graphic" className="hero-image" />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;