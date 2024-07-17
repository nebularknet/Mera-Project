import React from 'react';
import Particles from 'react-tsparticles';
import { loadLinksPreset } from 'tsparticles-preset-links';
import { Container } from 'react-bootstrap';
const Header = () => {
  const particlesInit = (main) => {
    console.log(main);
    loadLinksPreset(main);
  };

  const particlesLoaded = (container) => {
    console.log(container);
  };

  return (
    <div id='home'>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
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
