import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import InfoSection from '../components/InfoSection/InfoSection';
import ActivitiesList from '../components/ActivitiesList/ActivitiesList';
import Agenda from '../components/Agenda/Agenda';
import Speakers from '../components/Speakers/Speakers';
import CareerInfo from '../components/CareerInfo/CareerInfo';
import FAQ from '../components/FAQ/FAQ';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user, loading, getUserInscriptions } = useAuth();
  const [userInscriptions, setUserInscriptions] = useState([]);

  // Cargar inscripciones del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadUserInscriptions();
    }
  }, [isAuthenticated, loading]);

  const loadUserInscriptions = async () => {
    try {
      const inscriptions = await getUserInscriptions();
      setUserInscriptions(inscriptions);
    } catch (error) {
      console.error('Error loading user inscriptions:', error);
    }
  };

  if (loading) {
    return (
      <div className="homepage">
        <Header />
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Header />
      <main className="main-content">
        <Hero />
        <InfoSection />
        
            {/* Sección de Actividades */}
            <section id="actividades" className="activities-section">
              <div className="section-header">
                <h2>Actividades del Congreso</h2>
                <p>Explora los talleres y competencias disponibles</p>
              </div>
              <ActivitiesList 
                isAuthenticated={isAuthenticated}
                userInscriptions={userInscriptions}
                user={user}
              />
            </section>

            {/* Sección de Agenda */}
            <Agenda />

            {/* Sección de Ponentes */}
            <Speakers />

            {/* Sección de Información de Carrera */}
            <CareerInfo />

            {/* Sección de Preguntas Frecuentes */}
            <FAQ />
      </main>
    </div>
  );
};

export default HomePage;
