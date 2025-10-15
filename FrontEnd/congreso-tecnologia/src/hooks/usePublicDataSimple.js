import { useState, useEffect } from 'react';

export const usePublicDataSimple = () => {
  const [loading, setLoading] = useState(false);

  // Valores por defecto estáticos
  const defaultCongressInfo = {
    titulo_informacion: 'Congreso de Tecnología 2025 - Universidad Mariano Gálvez de Guatemala',
    descripcion_informacion: 'El Congreso de Tecnología 2025 de la Universidad Mariano Gálvez de Guatemala es un evento académico de vanguardia que reúne a estudiantes de nivel medio de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas.',
    fecha_inicio_informacion: '2025-03-15T06:00:00.000Z',
    fecha_fin_informacion: '2025-03-16T06:00:00.000Z',
    lugar_informacion: 'Campus Central - Universidad Mariano Gálvez de Guatemala',
    informacion_carrera_informacion: 'INFORMACIÓN SOBRE LA CARRERA DE INGENIERÍA EN SISTEMAS\nUniversidad Mariano Gálvez de Guatemala\n\nLa carrera de Ingeniería en Sistemas es un programa académico de excelencia que forma profesionales altamente capacitados para enfrentar los desafíos del mundo digital actual.'
  };

  const defaultPublicStats = {
    total_usuarios_registrados: 500,
    total_actividades: 20,
    total_ponentes: 15,
    total_dias_congreso: 3
  };

  const defaultFaqs = [
    {
      id_faq: 1,
      pregunta_faq: '¿Quién puede participar en el Congreso de Tecnología 2025?',
      respuesta_faq: 'Pueden participar estudiantes de nivel medio (4to y 5to bachillerato) de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Guatemala.',
      categoria_faq: 'general'
    },
    {
      id_faq: 2,
      pregunta_faq: '¿Cuándo y dónde se realizará el congreso?',
      respuesta_faq: 'El Congreso de Tecnología 2025 se realizará los días 15 y 16 de marzo de 2025 en el Campus Central de la Universidad Mariano Gálvez de Guatemala.',
      categoria_faq: 'general'
    },
    {
      id_faq: 3,
      pregunta_faq: '¿Es necesario pagar para participar?',
      respuesta_faq: 'La participación en el congreso es completamente gratuita. Sin embargo, algunos talleres especializados tienen un costo simbólico para cubrir los materiales.',
      categoria_faq: 'costos'
    },
    {
      id_faq: 4,
      pregunta_faq: '¿Cómo me inscribo al congreso?',
      respuesta_faq: 'Puedes inscribirte a través de nuestro formulario en línea disponible en la página web del congreso.',
      categoria_faq: 'inscripcion'
    },
    {
      id_faq: 5,
      pregunta_faq: '¿Qué actividades están disponibles en el congreso?',
      respuesta_faq: 'Ofrecemos talleres de programación, robótica con Arduino, desarrollo web, inteligencia artificial, competencias de programación y charlas magistrales.',
      categoria_faq: 'actividades'
    }
  ];

  const defaultFaqCategories = ['general', 'inscripcion', 'actividades', 'costos'];

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Por definir';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Por definir';
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Por definir';
    }
  };

  // Función para obtener el día del mes
  const getDayFromDate = (dateString) => {
    if (!dateString) return '15';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '15';
      return date.getDate().toString();
    } catch (error) {
      return '15';
    }
  };

  // Función para obtener el mes abreviado
  const getMonthFromDate = (dateString) => {
    if (!dateString) return 'MAR';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'MAR';
      return date.toLocaleDateString('es-GT', { month: 'short' }).toUpperCase();
    } catch (error) {
      return 'MAR';
    }
  };

  // Función para obtener estadísticas formateadas para el Hero
  const getHeroStats = () => {
    return {
      participantes: `${defaultPublicStats.total_usuarios_registrados}+`,
      talleres: `${defaultPublicStats.total_actividades}+`,
      ponentes: `${defaultPublicStats.total_ponentes}+`,
      dias: defaultPublicStats.total_dias_congreso
    };
  };

  // Función para obtener información del congreso formateada
  const getCongressInfoFormatted = () => {
    return {
      titulo: defaultCongressInfo.titulo_informacion,
      descripcion: defaultCongressInfo.descripcion_informacion,
      fechaInicio: formatDate(defaultCongressInfo.fecha_inicio_informacion),
      fechaFin: formatDate(defaultCongressInfo.fecha_fin_informacion),
      lugar: defaultCongressInfo.lugar_informacion,
      informacionCarrera: defaultCongressInfo.informacion_carrera_informacion,
      // Funciones para formatear fechas para el Hero
      getDayFromDate: () => getDayFromDate(defaultCongressInfo.fecha_inicio_informacion),
      getMonthFromDate: () => getMonthFromDate(defaultCongressInfo.fecha_inicio_informacion)
    };
  };

  return {
    // Datos por defecto
    congressInfo: defaultCongressInfo,
    publicStats: defaultPublicStats,
    faqs: defaultFaqs,
    faqCategories: defaultFaqCategories,
    
    // Estados
    loading,
    error: null,
    
    // Datos formateados
    heroStats: getHeroStats(),
    congressInfoFormatted: getCongressInfoFormatted(),
    
    // Funciones
    formatDate
  };
};