'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Footer from '@/components/Footer';
import AnimatedHeader from '@/components/AnimatedHeader';
import '../custom.css';

const StudioPage = () => {
  return (
    <>
      <AnimatedHeader 
        title="Nebulark"
        subtitle="Studio"
        height="40vh"
        minHeight="40vh"
      />

      {/* Services Section */}
      <div className="steps-section">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h1 className="values-title">Our <span className='highlight'>Creative Services</span></h1>
            </Col>
          </Row>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-paint-brush"></i>
                  </div>
                  <Card.Title>UI/UX Design</Card.Title>
                  <Card.Text>
                    Create intuitive and beautiful user experiences that engage and delight.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-laptop-code"></i>
                  </div>
                  <Card.Title>Web Development</Card.Title>
                  <Card.Text>
                    Build modern, responsive websites and web applications with cutting-edge tech.
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
                  <Card.Title>Mobile Apps</Card.Title>
                  <Card.Text>
                    Develop native and cross-platform mobile applications for iOS and Android.
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
                  <Card.Title>Brand Identity</Card.Title>
                  <Card.Text>
                    Design compelling brand identities, logos, and marketing materials.
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
                  <Card.Title>Digital Marketing</Card.Title>
                  <Card.Text>
                    Drive growth with strategic digital marketing and SEO optimization.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="step-card">
                <Card.Body>
                  <div className="step-icon">
                    <i className="fas fa-cogs"></i>
                  </div>
                  <Card.Title>Consulting</Card.Title>
                  <Card.Text>
                    Get expert advice on technology strategy and digital transformation.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Work Section - matching main site design */}
      <div className="products-section">
        <Container>
          <Row className="text-center">
            <Col className="kudos-text">
              <h1 className="values-title">Featured <span className='highlight'>Work</span></h1>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={6} xs={12} lg={4}>
              <Card className="product-card">
                <div className="hover-bg">
                  <img 
                    src="/img/portfolio/al-fatihah-logo-final.png" 
                    alt="Al-Fatihah Branding"
                    className="card-img-top"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                  <div className="hover-text">
                    <Card.Title>Al-Fatihah Branding</Card.Title>
                    <p>Complete brand identity design for a modern Islamic organization.</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={6} xs={12} lg={4}>
              <Card className="product-card">
                <div className="hover-bg">
                  <img 
                    src="/img/portfolio/hikayat-logo-final.png" 
                    alt="Hikayat Platform"
                    className="card-img-top"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                  <div className="hover-text">
                    <Card.Title>Hikayat Platform</Card.Title>
                    <p>Modern web application for storytelling and content creation.</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={6} xs={12} lg={4}>
              <Card className="product-card">
                <div className="hover-bg">
                  <img 
                    src="/img/portfolio/noble-earth-logo-final.png" 
                    alt="Noble Earth"
                    className="card-img-top"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                  <div className="hover-text">
                    <Card.Title>Noble Earth</Card.Title>
                    <p>Sustainable business platform with eco-friendly design principles.</p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Process Section */}
      <div className="steps-section">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h1 className="values-title">Our <span className='highlight'>Creative Process</span></h1>
            </Col>
          </Row>
          <Row>
            <Col lg={3} md={6} className="text-center mb-4">
              <div className="mb-3">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0dcaf0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
              </div>
              <h5 style={{ color: 'var(--white)' }}>Discovery</h5>
              <p style={{ color: 'var(--white)' }}>We start by understanding your goals, audience, and vision.</p>
            </Col>
            <Col lg={3} md={6} className="text-center mb-4">
              <div className="mb-3">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0dcaf0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
              </div>
              <h5 style={{ color: 'var(--white)' }}>Strategy</h5>
              <p style={{ color: 'var(--white)' }}>We develop a comprehensive strategy and design approach.</p>
            </Col>
            <Col lg={3} md={6} className="text-center mb-4">
              <div className="mb-3">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0dcaf0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  3
                </div>
              </div>
              <h5 style={{ color: 'var(--white)' }}>Creation</h5>
              <p style={{ color: 'var(--white)' }}>Our team brings your vision to life with creativity and precision.</p>
            </Col>
            <Col lg={3} md={6} className="text-center mb-4">
              <div className="mb-3">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0dcaf0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  4
                </div>
              </div>
              <h5 style={{ color: 'var(--white)' }}>Launch</h5>
              <p style={{ color: 'var(--white)' }}>We ensure smooth deployment and provide ongoing support.</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default StudioPage;
