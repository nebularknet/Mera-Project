'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaCode, FaPaintBrush, FaChartLine, FaEdit, FaShoppingCart, FaBtc, FaBrain, FaEye, FaFileAlt, FaRobot, FaShieldAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Footer from '@/components/Footer';

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllServices, setShowAllServices] = useState(false);

  const serviceCategories = [
    { id: 'All', name: 'All Services', count: 12 },
    { id: 'Development', name: 'Development', count: 3 },
    { id: 'AI', name: 'AI & Machine Learning', count: 4 },
    { id: 'Design', name: 'Design & Creative', count: 2 },
    { id: 'Marketing', name: 'Digital Marketing', count: 2 },
    { id: 'Security', name: 'Security & Blockchain', count: 2 },
  ];

  const detailedServices = [
    {
      id: 1,
      icon: <FaCode className="text-primary" />,
      title: "Web Application Development",
      shortDescription: "Custom web applications built with modern technologies",
      fullDescription: "We create scalable, secure, and high-performance web applications using cutting-edge technologies like React, Next.js, Node.js, and cloud platforms. Our development process includes responsive design, API integration, database optimization, and deployment automation.",
      features: [
        "Full-stack development with React/Next.js",
        "RESTful API and GraphQL integration",
        "Cloud deployment (AWS, Vercel, Netlify)",
        "Progressive Web App (PWA) development",
        "Database design and optimization",
        "Performance optimization and SEO"
      ],
      technologies: ["React", "Next.js", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"],
      category: 'Development',
      pricing: "Starting from $2,500",
      timeline: "4-12 weeks",
      caseStudies: ["E-commerce platform for retail chain", "SaaS dashboard for analytics"]
    },
    {
      id: 2,
      icon: <FaCode className="text-success" />,
      title: "Mobile App Development",
      shortDescription: "Native and cross-platform mobile applications",
      fullDescription: "Develop high-quality mobile applications for iOS and Android using React Native, Flutter, or native technologies. We focus on user experience, performance, and platform-specific design guidelines.",
      features: [
        "Cross-platform development with React Native/Flutter",
        "Native iOS and Android development",
        "App Store and Google Play Store optimization",
        "Push notifications and real-time features",
        "Offline functionality and data synchronization",
        "Third-party integrations and APIs"
      ],
      technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
      category: 'Development',
      pricing: "Starting from $5,000",
      timeline: "6-16 weeks",
      caseStudies: ["Food delivery app with 50K+ downloads", "Fitness tracking app with social features"]
    },
    {
      id: 3,
      icon: <FaShoppingCart className="text-warning" />,
      title: "E-commerce Development",
      shortDescription: "Complete e-commerce solutions with Shopify and custom platforms",
      fullDescription: "Build powerful e-commerce stores using Shopify, WooCommerce, or custom solutions. We handle everything from design to payment integration, inventory management, and marketing automation.",
      features: [
        "Shopify store development and customization",
        "WooCommerce and custom e-commerce platforms",
        "Payment gateway integration (Stripe, PayPal, etc.)",
        "Inventory management systems",
        "Multi-vendor marketplace development",
        "Mobile-responsive design"
      ],
      technologies: ["Shopify", "WooCommerce", "Stripe", "PayPal", "Magento"],
      category: 'Development',
      pricing: "Starting from $3,000",
      timeline: "3-10 weeks",
      caseStudies: ["Fashion store with 1000+ products", "B2B marketplace platform"]
    },
    {
      id: 4,
      icon: <FaRobot className="text-info" />,
      title: "Artificial Intelligence Solutions",
      shortDescription: "Custom AI solutions for business automation and data analysis",
      fullDescription: "Implement AI-powered solutions including machine learning models, predictive analytics, automation systems, and intelligent data processing to transform your business operations.",
      features: [
        "Machine learning model development",
        "Predictive analytics and forecasting",
        "Business process automation",
        "Data mining and analysis",
        "AI-powered chatbots and virtual assistants",
        "Custom AI algorithm development"
      ],
      technologies: ["Python", "TensorFlow", "PyTorch", "OpenAI", "Azure AI", "AWS AI"],
      category: 'AI',
      pricing: "Starting from $4,000",
      timeline: "6-20 weeks",
      caseStudies: ["Sales forecasting system", "Customer service automation"]
    },
    {
      id: 5,
      icon: <FaBrain className="text-purple" />,
      title: "Natural Language Processing",
      shortDescription: "Advanced text processing and language understanding systems",
      fullDescription: "Develop sophisticated NLP solutions for text analysis, document processing, sentiment analysis, language translation, and intelligent content generation.",
      features: [
        "Text classification and sentiment analysis",
        "Named entity recognition (NER)",
        "Document parsing and information extraction",
        "Language translation services",
        "Text summarization and generation",
        "Resume parsing and candidate matching"
      ],
      technologies: ["spaCy", "NLTK", "Transformers", "BERT", "GPT", "LangChain"],
      category: 'AI',
      pricing: "Starting from $3,500",
      timeline: "4-12 weeks",
      caseStudies: ["Resume screening system", "Legal document analysis tool"]
    },
    {
      id: 6,
      icon: <FaFileAlt className="text-success" />,
      title: "Generative AI (GenAI)",
      shortDescription: "AI-powered content generation and automation solutions",
      fullDescription: "Harness the power of generative AI for content creation, document automation, code generation, and creative applications using the latest GPT, Claude, and other foundation models.",
      features: [
        "Content generation and copywriting automation",
        "Document template automation",
        "Code generation and refactoring",
        "Image and video generation",
        "Prompt engineering and optimization",
        "Custom GPT and AI agent development"
      ],
      technologies: ["OpenAI GPT", "Claude", "Midjourney", "Stable Diffusion", "LangChain"],
      category: 'AI',
      pricing: "Starting from $3,000",
      timeline: "3-10 weeks",
      caseStudies: ["Marketing content automation", "Technical documentation generator"]
    },
    {
      id: 7,
      icon: <FaEye className="text-primary" />,
      title: "Computer Vision",
      shortDescription: "Image processing, object detection, and visual analytics",
      fullDescription: "Implement computer vision solutions for image classification, object detection, facial recognition, OCR, video analytics, and automated quality control systems.",
      features: [
        "Object detection and tracking",
        "Image classification and recognition",
        "Optical Character Recognition (OCR)",
        "Facial recognition and biometric systems",
        "Video analytics and processing",
        "Quality control and defect detection"
      ],
      technologies: ["OpenCV", "YOLO", "TensorFlow", "PyTorch", "Azure Vision", "AWS Rekognition"],
      category: 'AI',
      pricing: "Starting from $4,500",
      timeline: "6-16 weeks",
      caseStudies: ["Manufacturing quality control", "Security surveillance system"]
    },
    {
      id: 8,
      icon: <FaPaintBrush className="text-danger" />,
      title: "Graphics & UI/UX Design",
      shortDescription: "Professional design services for digital and print media",
      fullDescription: "Create stunning visual designs including logos, branding, web interfaces, mobile app designs, marketing materials, and NFT collections with modern design principles.",
      features: [
        "Logo and brand identity design",
        "Web and mobile UI/UX design",
        "Marketing materials and brochures",
        "Social media graphics and templates",
        "NFT collection and character design",
        "Print design and packaging"
      ],
      technologies: ["Figma", "Adobe Creative Suite", "Sketch", "Canva", "Blender"],
      category: 'Design',
      pricing: "Starting from $800",
      timeline: "1-6 weeks",
      caseStudies: ["Brand redesign for tech startup", "Mobile app UI for fintech company"]
    },
    {
      id: 9,
      icon: <FaChartLine className="text-success" />,
      title: "Digital Marketing & SEO",
      shortDescription: "Comprehensive digital marketing strategies and implementation",
      fullDescription: "Drive growth with data-driven digital marketing strategies including SEO, social media marketing, PPC campaigns, content marketing, and Amazon marketplace optimization.",
      features: [
        "Search Engine Optimization (SEO)",
        "Social media marketing and management",
        "Pay-per-click (PPC) advertising",
        "Content marketing and strategy",
        "Amazon Virtual Assistant services",
        "Email marketing automation"
      ],
      technologies: ["Google Analytics", "SEMrush", "Hootsuite", "Mailchimp", "Facebook Ads"],
      category: 'Marketing',
      pricing: "Starting from $1,200/month",
      timeline: "Ongoing campaigns",
      caseStudies: ["200% traffic increase for SaaS", "Amazon sales optimization"]
    },
    {
      id: 10,
      icon: <FaEdit className="text-info" />,
      title: "Content Writing & Documentation",
      shortDescription: "Professional content creation for technical and business needs",
      fullDescription: "High-quality content writing services including technical documentation, academic writing, business content, research papers, and SEO-optimized web content.",
      features: [
        "Technical documentation and API docs",
        "Academic and research writing",
        "Business content and proposals",
        "SEO-optimized web content",
        "White papers and case studies",
        "Grant writing and funding proposals"
      ],
      technologies: ["Microsoft Office", "Google Workspace", "Notion", "GitBook", "WordPress"],
      category: 'Marketing',
      pricing: "Starting from $50/hour",
      timeline: "1-4 weeks",
      caseStudies: ["Technical documentation for API", "Academic research publication"]
    },
    {
      id: 11,
      icon: <FaBtc className="text-warning" />,
      title: "Blockchain & NFT Development",
      shortDescription: "Blockchain solutions and NFT marketplace development",
      fullDescription: "Build decentralized applications, smart contracts, NFT marketplaces, and blockchain-based solutions using Ethereum, Solana, and other blockchain platforms.",
      features: [
        "Smart contract development",
        "NFT marketplace creation",
        "DeFi application development",
        "Cryptocurrency wallet integration",
        "Blockchain consulting and strategy",
        "Token creation and ICO development"
      ],
      technologies: ["Solidity", "Web3.js", "Ethereum", "Solana", "IPFS", "MetaMask"],
      category: 'Security',
      pricing: "Starting from $6,000",
      timeline: "8-20 weeks",
      caseStudies: ["NFT marketplace with 10K+ transactions", "DeFi lending platform"]
    },
    {
      id: 12,
      icon: <FaShieldAlt className="text-dark" />,
      title: "Cybersecurity Solutions",
      shortDescription: "Comprehensive security audits and protection systems",
      fullDescription: "Protect your business with comprehensive cybersecurity solutions including security audits, penetration testing, security system implementation, and compliance consulting.",
      features: [
        "Security audits and vulnerability assessment",
        "Penetration testing and ethical hacking",
        "Security system implementation",
        "Compliance consulting (GDPR, HIPAA, SOC 2)",
        "Incident response and recovery",
        "Security training and awareness"
      ],
      technologies: ["Kali Linux", "Metasploit", "Wireshark", "OWASP", "Nessus", "Burp Suite"],
      category: 'Security',
      pricing: "Starting from $2,000",
      timeline: "2-8 weeks",
      caseStudies: ["Enterprise security audit", "GDPR compliance implementation"]
    }
  ];

  const filteredServices = selectedCategory === 'All' 
    ? detailedServices 
    : detailedServices.filter(service => service.category === selectedCategory);

  const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#0a0a0a', color: 'white', padding: '100px 0 80px' }}>
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-3 mb-4">
                Professional <span style={{ color: '#007bff' }}>Digital Services</span>
              </h1>
              <p className="lead mb-5">
                Comprehensive technology solutions to transform your business. From AI-powered applications to custom web development, we deliver innovative solutions that drive growth.
              </p>
              <Button variant="primary" size="lg" className="me-3">
                Get Free Consultation
              </Button>
              <Button variant="outline-light" size="lg">
                View Portfolio
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Service Categories */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 mb-3">Service Categories</h2>
              <p className="lead text-muted">Choose from our comprehensive range of digital services</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            {serviceCategories.map((category) => (
              <Col key={category.id} lg={2} md={4} sm={6} className="mb-3">
                <Button
                  variant={selectedCategory === category.id ? 'primary' : 'outline-primary'}
                  className="w-100 py-3"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="text-center">
                    <div className="fw-bold">{category.name}</div>
                    <small className="d-block mt-1">{category.count} services</small>
                  </div>
                </Button>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Services Grid */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 0' }}>
        <Container>
          <Row>
            {displayedServices.map((service) => (
              <Col key={service.id} lg={6} className="mb-5">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div style={{ fontSize: '2.5rem' }} className="me-3">
                        {service.icon}
                      </div>
                      <div>
                        <Card.Title className="mb-1">{service.title}</Card.Title>
                        <Badge bg="light" text="dark">{service.category}</Badge>
                      </div>
                    </div>
                    
                    <Card.Text className="text-muted mb-3">
                      {service.shortDescription}
                    </Card.Text>
                    
                    <div className="mb-3">
                      <small className="fw-bold text-muted d-block mb-2">Key Features:</small>
                      <ul className="list-unstyled">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="small text-muted mb-1">
                            <FaCheckCircle className="text-success me-2" size={12} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-3">
                      <small className="fw-bold text-muted d-block mb-2">Technologies:</small>
                      <div>
                        {service.technologies.slice(0, 4).map((tech, index) => (
                          <Badge key={index} bg="secondary" className="me-1 mb-1 small">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block">Starting from</small>
                        <span className="fw-bold text-primary">{service.pricing}</span>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        Learn More <FaArrowRight size={12} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {!showAllServices && filteredServices.length > 6 && (
            <Row className="text-center">
              <Col>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setShowAllServices(true)}
                >
                  View All Services ({filteredServices.length - 6} more)
                </Button>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {/* Why Choose Us */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '80px 0' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 mb-3">Why Choose Nebulark?</h2>
              <p className="lead text-muted">
                We combine technical expertise with business understanding to deliver solutions that drive real results
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <FaRobot size={30} />
                </div>
                <h5>Cutting-Edge Technology</h5>
                <p className="text-muted">We use the latest technologies and frameworks to build future-proof solutions</p>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="text-center">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <FaCheckCircle size={30} />
                </div>
                <h5>Proven Track Record</h5>
                <p className="text-muted">100+ successful projects delivered with 98% client satisfaction rate</p>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <FaArrowRight size={30} />
                </div>
                <h5>Agile Delivery</h5>
                <p className="text-muted">Fast, iterative development with regular updates and transparent communication</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#0a0a0a', color: 'white', padding: '80px 0' }}>
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 mb-4">Ready to Transform Your Business?</h2>
                              <p className="lead mb-5">
                  Let&apos;s discuss your project and create a custom solution that meets your specific needs and budget.
                </p>
              <Button variant="primary" size="lg" className="me-3">
                Start Your Project
              </Button>
              <Button variant="outline-light" size="lg">
                Schedule Consultation
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </>
  );
};

export default ServicesPage;

