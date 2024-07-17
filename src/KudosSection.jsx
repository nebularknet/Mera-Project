import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'; // Import the custom CSS file
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

const KudosSection = () => {
  return (
    <div className="kudos-section">
      <Container>
      <Row className="text-center">
          <Col md={6} className="kudos-text">
            <h1 className="kudos-title">Give <span className="highlight">Kudos</span> To Someone</h1>
            <Button className="kudos-button">Yes</Button>
            <p className="kudos-subtitle">I want to recognize someone</p>
          </Col>
          <Col md={6} className="testimonial-col">
            <div className="testimonial-box">
              <div className="quote-icon-left">“</div>
              <div className="quote-icon-right">”</div>
              <img src="/images/avatar.png" alt="Avatar" className="testimonial-avatar" />
              <p className="testimonial-quote">"Propelo is a great solution for companies who want to spend less time on design and more time creating."</p>
              <p className="testimonial-author">Vercel</p>
            </div>
          </Col>
        </Row>
        <Row className="steps-row">
          <Col md={4}>
            <Card className="kudos-card">
              <Card.Body>
                <div className="card-number">1</div>
                <Card.Title>Nominate the Xponent</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="kudos-card">
              <Card.Body>
                <div className="card-number">2</div>
                <Card.Title>Propelo validates through interview</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="kudos-card">
              <Card.Body>
                <div className="card-number">3</div>
                <Card.Title>Present Everywhere</Card.Title>
                <Card.Text>A simple form fill to show them how much you appreciate their work</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default KudosSection;
