import React, { useState } from 'react';
import { usePublicDataSimple } from '../../hooks/usePublicDataSimple';
import './FAQ.css';

const FAQ = () => {
  const { faqs, faqCategories, loading, error } = usePublicDataSimple();
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Filtrar FAQs por categoría
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const filteredFaqs = selectedCategory === 'todas' 
    ? safeFaqs 
    : safeFaqs.filter(faq => faq.categoria_faq === selectedCategory);

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <section id="faq" className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-subtitle">Encuentra respuestas a las dudas más comunes</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando preguntas frecuentes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="faq" className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-subtitle">Encuentra respuestas a las dudas más comunes</p>
          </div>
          <div className="error-container">
            <p>Error al cargar las preguntas frecuentes. Por favor, intenta más tarde.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <p className="section-subtitle">Encuentra respuestas a las dudas más comunes</p>
        </div>

        {/* Filtros de categoría */}
        {Array.isArray(faqCategories) && faqCategories.length > 0 && (
          <div className="faq-filters">
            <button 
              className={`filter-btn ${selectedCategory === 'todas' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('todas')}
            >
              Todas ({safeFaqs.length})
            </button>
            {faqCategories.map((category, index) => {
              const categoryCount = safeFaqs.filter(faq => faq.categoria_faq === category).length;
              return (
                <button 
                  key={index}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({categoryCount})
                </button>
              );
            })}
          </div>
        )}

        {/* Lista de FAQs */}
        <div className="faq-list">
          {filteredFaqs.length === 0 ? (
            <div className="no-faqs">
              <p>No hay preguntas frecuentes disponibles para esta categoría.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div key={faq.id_faq} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id_faq)}
                >
                  <span className="faq-question-text">{faq.pregunta_faq}</span>
                  <span className={`faq-icon ${expandedFaq === faq.id_faq ? 'expanded' : ''}`}>
                    {expandedFaq === faq.id_faq ? '−' : '+'}
                  </span>
                </button>
                
                {expandedFaq === faq.id_faq && (
                  <div className="faq-answer">
                    <p>{faq.respuesta_faq}</p>
                    {faq.categoria_faq && (
                      <div className="faq-category">
                        <span className="category-tag">{faq.categoria_faq}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Información adicional */}
        <div className="faq-footer">
          <p>¿No encuentras la respuesta que buscas?</p>
          <button className="btn-contact">
            Contáctanos
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
