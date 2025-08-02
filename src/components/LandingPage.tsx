
'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
import Values from './Values';
import Header from './Header';
import AboutUs from './AboutUs';
import Services from './Services';
import Products from './Products';

export default function LandingPage() {
  return (
    <>
      <Header />
      <AboutUs />
      <Values />
      <Services />
      <Products />
      <Footer />
    </>
  );
} 