'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

const Header = () => {
  const [Particles, setParticles] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadParticles = async () => {
      const { default: ParticlesComponent } = await import('@tsparticles/react');
      setParticles(() => ParticlesComponent);
    };
    loadParticles();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    console.log("Initializing particles...");
    const { loadLinksPreset } = await import('@tsparticles/preset-links');
    await loadLinksPreset(engine);
    console.log("Particles initialized");
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <div id='home' style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {isClient && Particles && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
              background: {
                color: {
                  value: "#000",
                },
              },
              fullScreen: {
                enable: false,
              },
              particles: {
                number: {
                  value: 80,
                },
                color: {
                  value: "#ffffff"
                },
                shape: {
                  type: "circle"
                },
                opacity: {
                  value: 1,
                },
                size: {
                  value: 4,
                },
                links: {
                  enable: true,
                  distance: 150,
                  color: "#ffffff",
                  opacity: 1,
                  width: 2
                },
                move: {
                  enable: true,
                  speed: 2,
                }
              },
              interactivity: {
                events: {
                  onHover: {
                    enable: true,
                    mode: "repulse"
                  },
                  onClick: {
                    enable: true,
                    mode: "push"
                  },
                },
                modes: {
                  repulse: {
                    distance: 100,
                    duration: 0.4
                  },
                  push: {
                    quantity: 4
                  }
                }
              },
            }}
          />
        </div>
      )}
      <Container 
        className="header-container" 
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          height: '100vh', 
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
