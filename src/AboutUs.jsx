import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaCircleArrowRight } from "react-icons/fa6";

const AboutUs = () => {
  const aboutData = {
    paragraph: "Welcome to Nebulark Inc, your number one source for IT designing and development services. We're dedicated to providing you the best, with a focus on dependability, customer service, timely delivery, quality products and service delivery. We provide services in the different domains including but not limited to graphic designing, application designing, application development, ecommerce, digital marketing, content writing and BlockChain/ NFT solutions.",
    Why: [
      "Timely Response and Service Delivery",
      "Technology Agnostic Team Members",
      "Services for Complete Product Life Cycle"
    ],
    Why2: [
      "Bi Directional Feedback Mechanism",
      "Quality Results and Solutions",
      "Bleeding Edge Technology Adaptation"
    ]
  };

  return (
    <div id="about" className="benchmark-section">
      <Container className="text-light">
        <Row className="py-5">
          <Col md={8}>
            <h1 className='highlight'>About Us</h1>
            <hr className="bg-light" />
            <p>{aboutData.paragraph}</p>
            <h3 className="highlight mt-4">Why Choose Us?</h3>
            <Row>
              <Col md={6}>
                <ul className="list-unstyled">
                  {aboutData.Why.map((item, index) => (
                    <li key={index} className="d-flex align-items-center mb-2 mr-2">
                      <FaCircleArrowRight className="icon-custom" /> {item}
                    </li>
                  ))}
                </ul>
              </Col>
              <Col md={6}>
                <ul className="list-unstyled">
                  {aboutData.Why2.map((item, index) => (
                    <li key={index} className="d-flex align-items-center mb-2 mr-2">
                      <FaCircleArrowRight className="icon-custom" /> {item}
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          </Col>
          <Col md={4} className="d-flex justify-content-center align-items-center">
            <Card className="bg-dark text-light">
              <Card.Img src="./about-us-final.png" alt="Office Image" className="centered-image"/>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
