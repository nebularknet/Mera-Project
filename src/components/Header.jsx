'use client';

import React, {  useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';

const Header = () => {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple particles implementation
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
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

    // Handle resize
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
    <div id='home' style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Canvas for particles */}
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
          height: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <h1 className="main-title highlight">
          Nebulark
          <br />
          <span className="thin">Designing Solutions</span>
        </h1>
      </Container>
    </div>
  );
};

export default Header;
