'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Footer from '@/components/Footer';
import '../custom.css';

const AcademyPage = () => {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Particle animation for academy page - matching main site
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
            <span className="thin">Academy</span>
          </h1>
        </Container>
      </div>

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
