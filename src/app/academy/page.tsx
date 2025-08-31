'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Footer from '@/components/Footer';
import AnimatedHeader from '@/components/AnimatedHeader';
import '../custom.css';

const AcademyPage = () => {
  return (
    <>
      <AnimatedHeader 
        title="Nebulark"
        subtitle="Academy"
        height="40vh"
        minHeight="40vh"
      />

      {/* Course Categories */}
      <div className="steps-section">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h1 className="values-title">Learning <span className='highlight'>Paths</span></h1>
            </Col>
          </Row>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-palette"></i>
                  </div>
                  <Card.Title>Design Fundamentals</Card.Title>
                  <Card.Text>
                    Learn the core principles of design, typography, and visual hierarchy.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <Card.Title>Web Development</Card.Title>
                  <Card.Text>
                    Master modern web technologies and build responsive applications.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <Card.Title>Mobile Development</Card.Title>
                  <Card.Text>
                    Create stunning mobile apps with cutting-edge frameworks.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <Card.Title>Digital Marketing</Card.Title>
                  <Card.Text>
                    Master digital marketing strategies and growth techniques.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <Card.Title>Business Strategy</Card.Title>
                  <Card.Text>
                    Learn business development and strategic planning skills.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <Card.Title>Leadership</Card.Title>
                  <Card.Text>
                    Develop leadership skills and team management expertise.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <div className="benchmark-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="values-title">Why Choose <span className='highlight'>Nebulark Academy</span>?</h1>
              <div className="mb-4">
                <h3 style={{ color: 'var(--pink)' }}>🎯 Project-Based Learning</h3>
                <p style={{ color: 'var(--white)' }}>Learn by building real-world projects that showcase your skills.</p>
              </div>
              <div className="mb-4">
                <h3 style={{ color: 'var(--pink)' }}>👥 Expert Mentorship</h3>
                <p style={{ color: 'var(--white)' }}>Get guidance from industry professionals with years of experience.</p>
              </div>
              <div className="mb-4">
                <h3 style={{ color: 'var(--pink)' }}>📱 Flexible Learning</h3>
                <p style={{ color: 'var(--white)' }}>Study at your own pace with 24/7 access to course materials.</p>
              </div>
              <div className="mb-4">
                <h3 style={{ color: 'var(--pink)' }}>🏆 Certification</h3>
                <p style={{ color: 'var(--white)' }}>Earn recognized certificates upon course completion.</p>
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <div style={{ 
                  width: '100%', 
                  height: '300px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)',
                  fontSize: '1.2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <i className="fas fa-graduation-cap fa-3x mb-3" style={{ color: 'var(--pink)' }}></i>
                    <br />
                    Academy Learning Platform
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default AcademyPage;
