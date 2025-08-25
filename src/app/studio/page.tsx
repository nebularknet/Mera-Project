'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Footer from '@/components/Footer';
import '../custom.css';

const StudioPage = () => {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Particle animation for studio page - matching main site
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.color = `rgba(255, 255, 255, 0.8)`; // White particles like main site
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isClient]);

  return (
    <>
      {/* Hero Section with Particles - matching main site */}
      <div id='home' style={{ backgroundColor: '#000', minHeight: '40vh', position: 'relative', overflow: 'hidden' }}>
        {isClient && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        )}

        <Container
          className="header-container"
          style={{
            position: 'relative',
            zIndex: 2,
            height: '40vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            paddingTop: '80px'
          }}
        >
          <h1 className="main-title highlight">
            Nebulark
            <br />
            <span className="thin">Studio</span>
          </h1>
        </Container>
      </div>

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
