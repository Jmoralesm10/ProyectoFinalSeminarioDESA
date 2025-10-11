import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import InfoSection from '../components/InfoSection/InfoSection';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />
      <main className="main-content">
        <Hero />
        <InfoSection />
        {/* Aquí agregaremos más secciones en el futuro */}
      </main>
    </div>
  );
};

export default HomePage;
