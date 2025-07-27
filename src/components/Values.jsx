import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaLightbulb, FaHandshake, FaRocket, FaUsers, FaAward, FaHeart } from 'react-icons/fa';

const Values = () => {
  const valuesData = [
    {
      icon: <FaLightbulb />,
      title: "Innovation",
      description: "We constantly push boundaries to create cutting-edge solutions."
    },
    {
      icon: <FaHandshake />,
      title: "Trust",
      description: "Building lasting relationships through transparency and reliability."
    },
    {
      icon: <FaRocket />,
      title: "Excellence",
      description: "Delivering outstanding results that exceed expectations."
    },
    {
      icon: <FaUsers />,
      title: "Collaboration",
      description: "Working together to achieve shared success and growth."
    },
    {
      icon: <FaAward />,
      title: "Quality",
      description: "Every project crafted with attention to detail and precision."
    },
    {
      icon: <FaHeart />,
      title: "Passion",
      description: "Driven by our love for creating meaningful digital experiences."
    }
  ];

  return (
    <div id="values" className="steps-section">
      <Container>
        <Row className="text-center mb-4">
          <Col>
            <h1 className="values-title">Our <span className='highlight'>Values</span></h1>
          </Col>
        </Row>
        <Row>
          {valuesData.map((value, index) => (
            <Col key={index} md={6} lg={4} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">{value.icon}</div>
                  <Card.Title>{value.title}</Card.Title>
                  <Card.Text>{value.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Values;
