import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaComments, FaBullhorn, FaUsers, FaMagic, FaCogs, FaLightbulb } from 'react-icons/fa';


const Values = () => {

 
const values = [
  {
    icon: <FaComments />,
    title: 'Quality Services',
    description: 'Providing top-notch services to meet your needs.',
    _id: '65167a6c6e9c4582848b23af'
  },
  {
    icon: <FaBullhorn />,
    title: 'Timely Delivery',
    description: 'Ensuring your projects are delivered on time.',
    _id: '65167a6c6e9c4582848b23b0'
  },
  {
    icon: <FaUsers />,
    title: 'Standardized Procedures',
    description: 'Maintaining high standards in all processes.',
    _id: '65167a6c6e9c4582848b23b1'
  },
  {
    icon: <FaMagic />,
    title: 'Feedback Oriented',
    description: 'Add values and integrating client feedback.',
    _id: '65167a6c6e9c4582848b23b2'
  },
  {
    icon: <FaCogs />,
    title: 'Innovative Solutions',
    description: 'Creating innovative solutions to solve complex problems.',
    _id: '65167a6c6e9c4582848b23b3'
  },
  {
    icon: <FaLightbulb />,
    title: 'Creative Thinking',
    description: 'Encouraging creative thinking to drive success.',
    _id: '65167a6c6e9c4582848b23b4'
  }
];
  return (
    <div id="values" className="steps-section">
      <Container>
      <Row className="text-center">
          <Col className="kudos-text">
            <h1 className="values-title">Our <span className='highlight'>Values</span></h1>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {values.map((value, index) => (
            <Col key={value._id} md={4} >
              <Card className="step-card">
                <Card.Body>
                  <div className="card-number">{index + 1}</div>
                  <div className="step-icon">{value.icon}</div>
                  <Card.Title>{value.title}</Card.Title>
                  <Card.Text>{value.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* <Row className="justify-content-center">
          <Col md={4}>

            <Card className="step-card">
              <Card.Body>
                <div className="card-number">1</div>
                <div className="step-icon"><FaStar /></div>
                <Card.Title>Nominate the Xponent</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="step-card">
              <Card.Body>
                <div className="card-number">2</div>
                <div className="step-icon"><FaCheck /></div>
                <Card.Title>Propelo validates through interview</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="step-card">
              <Card.Body>
                <div className="card-number">3</div>
                <div className="step-icon"><FaAward /></div>
                <Card.Title>Present Everywhere</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row> */}
      </Container>
    </div>
  );
};

export default Values;