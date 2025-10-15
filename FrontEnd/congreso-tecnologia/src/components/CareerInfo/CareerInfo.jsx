import React from 'react';
import './CareerInfo.css';

const CareerInfo = () => {
  // Datos estáticos de la información de la carrera
  const careerData = {
    titulo: 'Ingeniería en Sistemas',
    universidad: 'Universidad Mariano Gálvez de Guatemala',
    descripcion: 'La carrera de Ingeniería en Sistemas es un programa académico de excelencia que forma profesionales altamente capacitados para enfrentar los desafíos del mundo digital actual.',
    secciones: [
      {
        titulo: 'Perfil del Egresado',
        contenido: [
          'Capacidad para diseñar, desarrollar e implementar sistemas de información',
          'Habilidades en programación y desarrollo de software',
          'Conocimientos en bases de datos y arquitectura de sistemas',
          'Competencias en gestión de proyectos tecnológicos',
          'Pensamiento crítico y resolución de problemas complejos'
        ]
      },
      {
        titulo: 'Ventajas Competitivas',
        contenido: [
          'Programa actualizado con las últimas tecnologías del mercado',
          'Docentes con experiencia en la industria tecnológica',
          'Laboratorios equipados con tecnología de vanguardia',
          'Vinculación directa con empresas del sector tecnológico',
          'Oportunidades de prácticas profesionales y empleo'
        ]
      },
      {
        titulo: 'Campos de Trabajo',
        contenido: [
          'Desarrollo de software y aplicaciones web',
          'Administración de sistemas y redes',
          'Consultoría en tecnología de la información',
          'Emprendimiento tecnológico y startups',
          'Investigación y desarrollo en nuevas tecnologías'
        ]
      },
      {
        titulo: 'Tecnologías que Aprenderás',
        contenido: [
          'Lenguajes de programación: Java, Python, C#, JavaScript',
          'Desarrollo web: HTML, CSS, React, Node.js',
          'Bases de datos: MySQL, PostgreSQL, MongoDB',
          'Cloud computing: AWS, Azure, Google Cloud',
          'Inteligencia artificial y machine learning'
        ]
      }
    ]
  };

  return (
    <section id="carrera" className="career-section">
      <div className="career-container">
        <div className="career-header">
          <h2 className="section-title">{careerData.titulo}</h2>
          <p className="section-subtitle">{careerData.universidad}</p>
          <p className="career-description">{careerData.descripcion}</p>
        </div>
        
        <div className="career-content">
          <div className="career-sections">
            {careerData.secciones.map((seccion, index) => (
              <div key={index} className="career-section-item">
                <h3 className="career-section-title">{seccion.titulo}</h3>
                <div className="career-section-content">
                  {seccion.contenido.map((item, itemIndex) => (
                    <div key={itemIndex} className="career-item">
                      <div className="bullet-item">
                        <span className="bullet-point">•</span>
                        <span className="bullet-text">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerInfo;