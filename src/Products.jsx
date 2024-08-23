import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaWordpress, FaYoutube, FaTiktok } from 'react-icons/fa';

const Products = () => {
  const [selectedTag, setSelectedTag] = useState('All');

  const productsData = [
    {
      name: "Al Fatihah",
      image: "img/portfolio/al-fatihah-logo-final.png",
      links: {
        wordpress: "https://alfatihah01.wordpress.com/",
        facebook: "https://www.facebook.com/alfatihah01",
        twitter: "https://twitter.com/AlFatihahTheKey",
        instagram: "https://www.instagram.com/alfatihahthekey/?hl=en",
        pinterest: "https://www.pinterest.com/al123fatihah/",
        youtube: "",
        tiktok: ""
      },
      tags: ['All', 'Product']
    },
    {
      name: "Noble Earth",
      image: "img/portfolio/noble-earth-logo-final.png",
      links: {
        wordpress: "",
        facebook: "https://www.facebook.com/TheNobleEarthofficial",
        twitter: "https://twitter.com/TheNoble_Earth",
        instagram: "https://www.instagram.com/thenobleearth/",
        pinterest: "https://www.pinterest.com/thenobleearth/",
        youtube: "https://www.youtube.com/@TheNobleEarth",
        tiktok: "https://www.tiktok.com/@thenobleearth"
      },
      tags: ['All', 'Product']
    },
    {
      name: "Opportunity Circle",
      image: "img/portfolio/opportunity-circle-logo-final.png",
      links: {
        wordpress: "",
        facebook: "https://www.facebook.com/Opportunity.Circle/",
        twitter: "https://twitter.com/OpportunityCir1",
        instagram: "https://www.instagram.com/opportunity_circle/",
        pinterest: "https://www.pinterest.com/opportunitycircle/",
        youtube: "",
        tiktok: ""
      },
      tags: ['All', 'Product']
    },
    {
      name: "Hikayat",
      image: "img/portfolio/hikayat-logo-final.png",
      links: {
        wordpress: "",
        facebook: "https://www.facebook.com/profile.php?id=100088725561982",
        twitter: "https://twitter.com/Hikayat_App",
        instagram: "https://www.instagram.com/hikayat_app/",
        pinterest: "https://www.pinterest.com/hikayatapp/",
        youtube: "https://www.youtube.com/@Hikayat_app",
        tiktok: ""
      },
      tags: ['All', 'Product']
    },
    {
      name: "Prism",
      image: "img/portfolio/prism-riddle-logo-final.png",
      links: {
        wordpress: "",
        facebook: "",
        twitter: "",
        instagram: "",
        pinterest: "",
        youtube: "https://www.youtube.com/@PrismChallenges",
        tiktok: ""
      },
      tags: ['All', 'Product']
    },
    {
      name: "Today Chronicles",
      image: "img/portfolio/today-chronicles-logo-final.png",
      links: {
        wordpress: "",
        facebook: "",
        twitter: "",
        instagram: "",
        pinterest: "",
        youtube: "https://www.youtube.com/channel/UCGRoBc_BcxXiF-FL_kVGH8Q",
        tiktok: ""
      },
      tags: ['All', 'Product']
    }
  ];

  const tags = ['All', 'Product'];

  const filteredProducts = selectedTag === 'All' ? productsData : productsData.filter(product => product.tags.includes(selectedTag));

  return (
    <div className="products-section" id='products'>
      <Container>
        <Row className="text-center">
          <Col className="kudos-text">
            <h1 className="values-title">Our <span className='highlight'>Products</span></h1>
          </Col>
        </Row>
      
        <Row className="justify-content-center">
          {filteredProducts.map((product, index) => (
            <Col key={index} md={6} xs={12} lg={4}>
              <Card className="product-card">
                <div className="hover-bg">
                  <Card.Img variant="top" src={product.image} alt={product.name} />
                  <div className="hover-text">
                    <Card.Title>{product.name}</Card.Title>
                    <div className="social-links social">
                      <ul>
                        {product.links.wordpress && (
                          <li>
                            <a href={product.links.wordpress} target="_blank" rel="noopener noreferrer">
                              <FaWordpress className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.facebook && (
                          <li>
                            <a href={product.links.facebook} target="_blank" rel="noopener noreferrer">
                              <FaFacebook className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.twitter && (
                          <li>
                            <a href={product.links.twitter} target="_blank" rel="noopener noreferrer">
                              <FaTwitter className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.instagram && (
                          <li>
                            <a href={product.links.instagram} target="_blank" rel="noopener noreferrer">
                              <FaInstagram className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.pinterest && (
                          <li>
                            <a href={product.links.pinterest} target="_blank" rel="noopener noreferrer">
                              <FaPinterest className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.youtube && (
                          <li>
                            <a href={product.links.youtube} target="_blank" rel="noopener noreferrer">
                              <FaYoutube className="fa" />
                            </a>
                          </li>
                        )}
                        {product.links.tiktok && (
                          <li>
                            <a href={product.links.tiktok} target="_blank" rel="noopener noreferrer">
                              <FaTiktok className="fa" />
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Products;