import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadLinksPreset } from '@tsparticles/preset-links';

const ParticlesTest = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadLinksPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log("Test particles loaded", container);
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', backgroundColor: '#000', position: 'relative' }}>
      <Particles
        id="test-particles"
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
              value: 30,
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
              value: 3,
            },
            links: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.8,
              width: 1
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
            },
          },
        }}
      />
    </div>
  );
};

export default ParticlesTest; 