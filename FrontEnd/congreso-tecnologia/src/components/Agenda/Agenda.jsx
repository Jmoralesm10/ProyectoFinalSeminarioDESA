import React from 'react';
import './Agenda.css';

const Agenda = () => {
  // Datos estáticos de la agenda
  const agendaData = [
    {
      dia: 1,
      actividades: [
        {
          hora: '08:00 - 09:00',
          titulo: 'Registro y Acreditación',
          descripcion: 'Registro de participantes y entrega de materiales del congreso',
          tipo: 'Inauguración'
        },
        {
          hora: '09:00 - 10:00',
          titulo: 'Ceremonia de Inauguración',
          descripcion: 'Bienvenida oficial y presentación del programa',
          tipo: 'Inauguración'
        },
        {
          hora: '10:00 - 11:30',
          titulo: 'Conferencia Magistral: El Futuro de la Tecnología',
          descripcion: 'Charla sobre las tendencias tecnológicas emergentes',
          tipo: 'Conferencia'
        },
        {
          hora: '11:30 - 12:00',
          titulo: 'Coffee Break',
          descripcion: 'Pausa para networking y refrigerios',
          tipo: 'Networking'
        },
        {
          hora: '12:00 - 13:30',
          titulo: 'Taller: Desarrollo Web Moderno',
          descripcion: 'Introducción a React, Node.js y bases de datos',
          tipo: 'Taller'
        },
        {
          hora: '13:30 - 14:30',
          titulo: 'Almuerzo',
          descripcion: 'Comida y networking',
          tipo: 'Networking'
        },
        {
          hora: '14:30 - 16:00',
          titulo: 'Competencia de Programación',
          descripcion: 'Desafíos de programación para estudiantes',
          tipo: 'Competencia'
        },
        {
          hora: '16:00 - 17:30',
          titulo: 'Taller: Inteligencia Artificial',
          descripcion: 'Introducción a machine learning y Python',
          tipo: 'Taller'
        }
      ]
    },
    {
      dia: 2,
      actividades: [
        {
          hora: '08:00 - 09:00',
          titulo: 'Registro del Segundo Día',
          descripcion: 'Acreditación para el segundo día del congreso',
          tipo: 'Inauguración'
        },
        {
          hora: '09:00 - 10:30',
          titulo: 'Conferencia: Cloud Computing',
          descripcion: 'Tendencias en computación en la nube',
          tipo: 'Conferencia'
        },
        {
          hora: '10:30 - 11:00',
          titulo: 'Coffee Break',
          descripcion: 'Pausa para networking',
          tipo: 'Networking'
        },
        {
          hora: '11:00 - 12:30',
          titulo: 'Taller: Robótica con Arduino',
          descripcion: 'Construcción y programación de robots básicos',
          tipo: 'Taller'
        },
        {
          hora: '12:30 - 13:30',
          titulo: 'Almuerzo',
          descripcion: 'Comida y networking',
          tipo: 'Networking'
        },
        {
          hora: '13:30 - 15:00',
          titulo: 'Presentación de Proyectos',
          descripcion: 'Exposición de proyectos estudiantiles',
          tipo: 'Conferencia'
        },
        {
          hora: '15:00 - 16:30',
          titulo: 'Ceremonia de Clausura',
          descripcion: 'Entrega de reconocimientos y cierre del evento',
          tipo: 'Clausura'
        }
      ]
    }
  ];

  const getTipoColor = (tipo) => {
    const colores = {
      'Inauguración': '#22c55e',
      'Conferencia': '#8b5cf6',
      'Taller': '#f59e0b',
      'Competencia': '#ef4444',
      'Networking': '#3b82f6',
      'Clausura': '#6b7280'
    };
    return colores[tipo] || '#6b7280';
  };

  return (
    <section id="agenda" className="agenda-section">
      <div className="agenda-container">
        <div className="agenda-header">
          <h2 className="section-title">Agenda del Congreso</h2>
          <p className="section-subtitle">Programa completo de actividades</p>
        </div>
        
        <div className="agenda-content">
          {agendaData.map((dia) => (
            <div key={dia.dia} className="agenda-day">
              <h3 className="day-title">Día {dia.dia}</h3>
              <div className="agenda-table">
                <div className="table-header">
                  <div className="col-time">Hora</div>
                  <div className="col-title">Actividad</div>
                  <div className="col-type">Tipo</div>
                </div>
                <div className="table-body">
                  {dia.actividades.map((actividad, index) => (
                    <div key={index} className="table-row">
                      <div className="col-time">
                        <span className="time-text">{actividad.hora}</span>
                      </div>
                      <div className="col-title">
                        <h4 className="activity-title">{actividad.titulo}</h4>
                        <p className="activity-description">{actividad.descripcion}</p>
                      </div>
                      <div className="col-type">
                        <span 
                          className="activity-type"
                          style={{ backgroundColor: getTipoColor(actividad.tipo) }}
                        >
                          {actividad.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Agenda;