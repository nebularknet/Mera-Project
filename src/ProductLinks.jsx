import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaWordpress } from 'react-icons/fa';

export const ProductLinks = ({
  title,
  images,
  facebook,
  twitter,
  wordpress,
  instagram,
  pinterest
}) => {
  const links = { twitter, facebook, instagram, wordpress, pinterest };

  return (
    <div className='portfolio-item'>
      <div className='hover-bg'>
        <div className='hover-text'>
          <h4>{title}</h4>
          <div className='row'>
            <div className='social'>
              <ul>
                {Object.keys(links).map((key, index) => (
                  links[key] && (
                    <li key={index}>
                      <a href={links[key]} target='_blank' rel='noopener noreferrer'>
                        {getIcon(key)}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>
        </div>
        <img src={images[0]} className='img-responsive' alt={title} />
      </div>
    </div>
  )
}

// Helper function to map key to icon
const getIcon = (key) => {
  switch (key) {
    case 'facebook':
      return <FaFacebook className='fa' />;
    case 'twitter':
      return <FaTwitter className='fa' />;
    case 'instagram':
      return <FaInstagram className='fa' />;
    case 'wordpress':
      return <FaWordpress className='fa' />;
    case 'pinterest':
      return <FaPinterest className='fa' />;
    default:
      return null;
  }
}
