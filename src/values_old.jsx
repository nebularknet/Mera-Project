import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// import { FaComments, FaBullhorn, FaUsers, FaMagic } from 'react-icons/fa';
import { FaComments, FaBullhorn, FaUsers, FaMagic, FaCogs, FaLightbulb } from 'react-icons/fa';


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
      description: 'Valuing and integrating client feedback.',
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

export const Values = () => {
  return (
    <div className="kudos-section">
      <Container>
        <Row className="text-center">
          <Col md={6} className="kudos-text">
            <h1 className="kudos-title">Values</h1>
          </Col>
        </Row>

        <Row>
          {values ? (
            values.map((d) => (
              <Col key={d._id} xs={6} md={3} className="value-col text-center">
                {d.icon}
                <h3>{d.title}</h3>
              </Col>
            ))
          ) : (
            <Col>Loading...</Col>
          )}
        </Row>
      </Container>
    </div>
  );
};
