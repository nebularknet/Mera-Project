'use client';
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

// Home-page sections, in page order. "home" is the hero at the top.
const HOME_SECTIONS = ['about', 'values', 'services', 'products'] as const;
type HomeSection = 'home' | (typeof HOME_SECTIONS)[number];

// A section counts as "in view" once its top passes this line (below the navbar).
const SPY_OFFSET = 140;

/** Tracks which home-page section is currently on screen. */
function useActiveSection(enabled: boolean): HomeSection {
  const [active, setActive] = React.useState<HomeSection>('home');

  React.useEffect(() => {
    if (!enabled) return;
    const update = () => {
      let current: HomeSection = 'home';
      for (const id of HOME_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = id;
      }
      // At the very bottom the last section may never reach the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = HOME_SECTIONS[HOME_SECTIONS.length - 1];
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return active;
}

const CustomNavbar: React.FC = () => {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const activeSection = useActiveSection(onHome);

  // The careers and blog dashboards are standalone internal tools — hide the
  // marketing navbar there so it doesn't overlap the dashboard chrome.
  if (pathname?.startsWith("/careers/admin") || pathname?.startsWith("/blog/admin")) return null;

  const homeCls = (section: HomeSection) =>
    `nav-link-custom ${onHome && activeSection === section ? 'active' : ''}`;
  const routeCls = (prefix: string) =>
    `nav-link-custom ${pathname?.startsWith(prefix) ? 'active' : ''}`;

  return (
    <Navbar className="navbar-custom" expand="lg">
      <Container className="align-items-center">
        <Navbar.Brand href="/" className="navbar-brand-custom">
          nebulark
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav-center">
            <Nav.Link href="/" className={homeCls('home')}>
              Home
            </Nav.Link>
            <Nav.Link href="/#values" className={homeCls('values')}>
              Values
            </Nav.Link>
            <Nav.Link href="/#about" className={homeCls('about')}>
              About
            </Nav.Link>
            <Nav.Link href="/#services" className={homeCls('services')}>
              Services
            </Nav.Link>
            <Nav.Link href="/#products" className={homeCls('products')}>
              Products
            </Nav.Link>
            <Nav.Link href="/studio" className={routeCls('/studio')}>
              Studio
            </Nav.Link>
            <Nav.Link href="/academy" className={routeCls('/academy')}>
              Academy
            </Nav.Link>
            <Nav.Link href="/blog" className={routeCls('/blog')}>
              Blog
            </Nav.Link>
            <Nav.Link href="/careers" className={routeCls('/careers')}>
              Careers
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
