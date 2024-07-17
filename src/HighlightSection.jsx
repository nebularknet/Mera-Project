import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'; // Import the custom CSS file

const HighlightSection = () => {
  return (
    <div className="highlight-section">
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8}>
            <h2 className="highlight-title">Highlight Your Success<br />Outdo Yourself<br />Repeat</h2>
            <p className="highlight-subtitle">A New Data-Informed Way To Run Your Software Factory</p>
            <h3 className="single-view-title">Single View of Your Software Operations</h3>
            <p className="single-view-description">There is some text that explains what we mean by single view. Something on need for a actionable stance on data etc. etc.</p>
          </Col>
        </Row>
        <Row className="info-section">
          <Col md={6} className="info-text">
            <div className="info-item">
              <span className="info-icon">🛠️</span>
              <div className="info-content">
                <h4>Correlate Insights from 40+ DevOps, Security & Support Tools</h4>
                <p>Here is some text that explains some more about this point</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📊</span>
              <div className="info-content">
                <h4>Out-of-box Dashboards</h4>
                <p>Here is some text that explains some more about this point</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">👥</span>
              <div className="info-content">
                <h4>By Teams, Organization & Product</h4>
                <p>Here is some text that explains some more about this point</p>
              </div>
            </div>
          </Col>
          <Col md={6} className="info-image">
            <img src="/images/dashboard-example.png" alt="Dashboard Example" className="dashboard-image" />
          </Col>
        </Row>
        <Row className="testimonial-section">
          <Col md={8} className="testimonial">
            <div className="testimonial-content">
              <img src="/images/testimonial-avatar.png" alt="Avatar" className="testimonial-avatar" />
              <p>"Propelo is a great solution for companies who want to spend less time on design and more time creating."</p>
              <p className="testimonial-author">- Vercel</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HighlightSection;
