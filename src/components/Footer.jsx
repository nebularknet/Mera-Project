import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="footer-logo">
          <h4  className="navbar-brand-custom">
              nebulark
          </h4>
          </Col>
          <Col md={4} className="footer-links">
            <h5>SITEMAP</h5>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#values">Values</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#products">Products</a></li>
            </ul>
          </Col>
          <Col md={4} className="footer-contact">
            <h5>CONTACT</h5>
            <p><a href="mailto:nebulark.net@gmail.com">nebulark.net@gmail.com</a></p>
            <p>Islamabad,Pakistan<br /></p>
            <p>Phone: <a href="tel:+923432018677">+923432018677</a></p>
          </Col>
        </Row>
        <Row className="footer-bottom">
          <Col md={12} className="text-center">
            <ul className="footer-bottom-links">
              <li><a href="#publisher-terms">Publisher Terms</a></li>
              <li><a href="#terms-of-service">Terms of Service</a></li>
              <li><a href="#privacy-policy">Privacy Policy</a></li>
            </ul>
            <div className="footer-social-icons">
              <a href="https://twitter.com"><FaTwitter /></a>
              <a href="https://linkedin.com"><FaLinkedin /></a>
              <a href="https://instagram.com"><FaInstagram /></a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
