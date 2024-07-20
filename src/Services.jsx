import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaCode, FaPaintBrush, FaChartLine, FaEdit, FaShoppingCart, FaBtc } from 'react-icons/fa';

const Services = () => {
  const [selectedTag, setSelectedTag] = useState('All');

  const services = [
    {
      icon: <FaCode />,
      name: "Application Development",
      text: "Desktop, Web and Mobile Application Development",
      tags: ['Dev']
    },
    {
      icon: <FaPaintBrush />,
      name: "Graphics Designing",
      text: "All Kinds of Graphics, Mockups, NFTs Collectible/ Character",
      tags: ['Design']
    },
    {
      icon: <FaChartLine />,
      name: "Digital Marketing",
      text: "Social Media Marketing, Search Engine Optimization, Amazon Virtual Assistant",
      tags: ['Marketing']
    },
    {
      icon: <FaEdit />,
      name: "Content Writing",
      text: "Academic, Technical and Research Writing related to IT, IR, Business",
      tags: ['Writing']
    },
    {
      icon: <FaShoppingCart />,
      name: "Ecommerce Development",
      text: "Design and Deploying ECommerce Stores using Shopify",
      tags: ['Dev', 'Ecommerce']
    },
    {
      icon: <FaBtc />,
      name: "Blockchain and NFT Development",
      text: "NFT Marketplace, Blockchain solutions",
      tags: ['Blockchain']
    }
  ];

  const tags = ['All', 'Dev', 'Design', 'Marketing', 'Writing', 'Ecommerce', 'Blockchain'];

  const filteredServices = selectedTag === 'All' ? services : services.filter(service => service.tags.includes(selectedTag));

  return (
    <div className="services-section" id='services'>
      <Container>
        <Row className="text-center mb-4">
          <Col className="kudos-text">
            <h1 className="values-title">Our <span className='highlight'>Services</span></h1>
          </Col>
        </Row>
        <Row className="justify-content-center text-center mb-4">
          {tags.map((tag, index) => (
            <Col key={index} xs={12} md={2} className="filter-button-col mb-2">
              <Button
                className={`filter-button ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            </Col>
          ))}
        </Row>
        <Row className="justify-content-center">
          {filteredServices.map((service, index) => (
            <Col key={index} md={4} className="mb-4"> {/* Add margin-bottom class */}
              <Card className="service-card">
                <Card.Body>
                  <div className="service-icon">{service.icon}</div>
                  <Card.Title>{service.name}</Card.Title>
                  <Card.Text>{service.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Services;
