'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';

interface AnimatedHeaderProps {
  title: string;
  subtitle: string;
  height?: string; // Optional height prop for different page requirements
  minHeight?: string; // Optional minHeight prop
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ 
  title, 
  subtitle, 
  height = '50vh',
  minHeight = '100vh'
}) => {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Particle animation - reusable across all pages
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
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
        this.color = `rgba(255, 255, 255, 0.8)`; // White particles
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
    <div 
      id='home' 
      style={{ 
        backgroundColor: '#000', 
        minHeight: minHeight, 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
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
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          paddingTop: minHeight === '100vh' ? '0' : '80px' // Adjust padding for different page types
        }}
      >
        <h1 className="main-title highlight">
          {title}
          <br />
          <span className="thin">{subtitle}</span>
        </h1>
      </Container>
    </div>
  );
};

export default AnimatedHeader;
