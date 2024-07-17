'use client';

import { 
  FaApple, FaGoogle, FaMicrosoft, FaAmazon, FaFacebook, FaTwitter, FaGithub, FaLinkedin, 
  FaSlack, FaSpotify, FaDropbox, FaSalesforce, FaReddit, FaSnapchat, FaYoutube, FaTwitch 
} from 'react-icons/fa';


import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';


const images = [
  { icon: <FaApple />, alt: 'Apple' },
  { icon: <FaGoogle />, alt: 'Google' },
  { icon: <FaMicrosoft />, alt: 'Microsoft' },
  { icon: <FaAmazon />, alt: 'Amazon' },
  { icon: <FaFacebook />, alt: 'Facebook' },
  { icon: <FaTwitter />, alt: 'Twitter' },
  { icon: <FaGithub />, alt: 'Github' },
  { icon: <FaLinkedin />, alt: 'LinkedIn' },
//   { icon: <FaSlack />, alt: 'Slack' },
//   { icon: <FaSpotify />, alt: 'Spotify' },
//   { icon: <FaDropbox />, alt: 'Dropbox' },
//   { icon: <FaSalesforce />, alt: 'Salesforce' },
//   { icon: <FaReddit />, alt: 'Reddit' },
//   { icon: <FaSnapchat />, alt: 'Snapchat' },
//   { icon: <FaYoutube />, alt: 'YouTube' },
//   { icon: <FaTwitch />, alt: 'Twitch' },
  // Add more icons as needed
];











const CompanyLogos = () => {
    return (
      <div className="company-logos-section">
        {/* <Marquee velocity={15}> */}
          {images.map((image) => (
            <div  className="logo-col">
              {image.icon}
            </div>
          ))}
        {/* </Marquee> */}
      </div>
    );
  };
  
  export default CompanyLogos;
