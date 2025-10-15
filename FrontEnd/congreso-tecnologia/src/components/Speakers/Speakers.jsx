import React from 'react';
import './Speakers.css';

const Speakers = () => {
  // Datos estáticos de los ponentes
  const speakersData = [
    {
      id: 1,
      nombre: 'Dr. Carlos Eduardo',
      apellido: 'Marroquín',
      nombreCompleto: 'Dr. Carlos Eduardo Marroquín',
      tituloAcademico: 'Dr.',
      cargo: 'Director de Tecnología',
      empresa: 'Tigo Guatemala',
      especialidad: 'Telecomunicaciones y Transformación Digital',
      email: 'carlos.marroquin@tigo.com.gt',
      linkedin: 'https://linkedin.com/in/carlos-marroquin'
    },
    {
      id: 2,
      nombre: 'Ing. María Elena',
      apellido: 'Rodríguez',
      nombreCompleto: 'Ing. María Elena Rodríguez',
      tituloAcademico: 'Ing.',
      cargo: 'Arquitecta de Software Senior',
      empresa: 'Microsoft Guatemala',
      especialidad: 'Cloud Computing y Azure',
      email: 'maria.rodriguez@microsoft.com',
      linkedin: 'https://linkedin.com/in/maria-rodriguez'
    },
    {
      id: 3,
      nombre: 'Lic. Roberto',
      apellido: 'García',
      nombreCompleto: 'Lic. Roberto García',
      tituloAcademico: 'Lic.',
      cargo: 'Especialista en Inteligencia Artificial',
      empresa: 'Google Cloud',
      especialidad: 'Machine Learning y Data Science',
      email: 'roberto.garcia@google.com',
      linkedin: 'https://linkedin.com/in/roberto-garcia'
    },
    {
      id: 4,
      nombre: 'Dra. Ana Lucía',
      apellido: 'Hernández',
      nombreCompleto: 'Dra. Ana Lucía Hernández',
      tituloAcademico: 'Dra.',
      cargo: 'Investigadora Principal',
      empresa: 'Universidad del Valle de Guatemala',
      especialidad: 'Ciberseguridad y Blockchain',
      email: 'ana.hernandez@uvg.edu.gt',
      linkedin: 'https://linkedin.com/in/ana-hernandez'
    },
    {
      id: 5,
      nombre: 'Ing. Luis Fernando',
      apellido: 'Morales',
      nombreCompleto: 'Ing. Luis Fernando Morales',
      tituloAcademico: 'Ing.',
      cargo: 'CTO y Fundador',
      empresa: 'TechStart Guatemala',
      especialidad: 'Desarrollo de Software y Emprendimiento',
      email: 'luis.morales@techstart.gt',
      linkedin: 'https://linkedin.com/in/luis-morales'
    },
    {
      id: 6,
      nombre: 'MSc. Patricia',
      apellido: 'Vásquez',
      nombreCompleto: 'MSc. Patricia Vásquez',
      tituloAcademico: 'MSc.',
      cargo: 'Especialista en UX/UI',
      empresa: 'Design Studio Guatemala',
      especialidad: 'Diseño de Experiencia de Usuario',
      email: 'patricia.vasquez@designstudio.gt',
      linkedin: 'https://linkedin.com/in/patricia-vasquez'
    }
  ];

  // Función para obtener iniciales del nombre
  const getInitials = (nombre, apellido) => {
    const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  return (
    <section id="ponentes" className="speakers-section">
      <div className="speakers-container">
        <div className="speakers-header">
          <h2 className="section-title">Ponentes Invitados</h2>
          <p className="section-subtitle">Expertos de la industria tecnológica</p>
        </div>
        
        <div className="speakers-content">
          <div className="speakers-grid">
            {speakersData.map((speaker) => (
              <div key={speaker.id} className="speaker-card">
                <div className="speaker-avatar">
                  <div className="speaker-initial">
                    {getInitials(speaker.nombre, speaker.apellido)}
                  </div>
                </div>
                
                <div className="speaker-info">
                  <h3 className="speaker-name">{speaker.nombreCompleto}</h3>
                  <p className="speaker-position">{speaker.cargo}</p>
                  <p className="speaker-company">{speaker.empresa}</p>
                  <p className="speaker-specialty">{speaker.especialidad}</p>
                  
                  <div className="speaker-contacts">
                    <a 
                      href={`mailto:${speaker.email}`}
                      className="contact-link email"
                      title="Enviar email"
                    >
                      📧
                    </a>
                    <a 
                      href={speaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link linkedin"
                      title="Ver LinkedIn"
                    >
                      💼
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Speakers;