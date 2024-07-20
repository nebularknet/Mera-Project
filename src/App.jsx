import { useState } from 'react'
import CustomNavbar from './CustomNavbar'
import HeroSection from './HeroSection';
import 'bootstrap/dist/css/bootstrap.min.css';
import CompanyLogos from './Logos';
import HighlightSection from './HighlightSection';
import Footer from './Footer';
import KudosSection from './KudosSection';
import Values from './Values';
import Header from './Header';
// import { Values } from './values_old';
import AboutUs from './AboutUs';
import Services from './Services';
import Products from './Products';
function App() {

  return (
    <>
      <CustomNavbar />
      <Header/>
      <AboutUs/>
      <Values/>
      <Services/>
      <Products/>
      <Footer/>
    </>
  )
}

export default App
