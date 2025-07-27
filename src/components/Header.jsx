import React, { useState } from 'react';
import Particles from 'react-tsparticles';
import { loadLinksPreset } from 'tsparticles-preset-links';
import { Container } from 'react-bootstrap';

const Header = () => {
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  const particlesInit = (main) => {
    console.log(main);
    loadLinksPreset(main);
  };

  const handleParticlesLoaded = (container) => {
    console.log(container);
    setParticlesLoaded(true);
  };

  return (
    <div id='home' style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={handleParticlesLoaded}
        options={{
          preset: 'links',
          background: {
            color: {
              value: '#000',
            },
          },
          fullScreen: {
            enable: false,
          },
        }}
      />
      <Container className="header-container">
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
