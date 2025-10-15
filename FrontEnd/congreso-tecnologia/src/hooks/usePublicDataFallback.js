import { useState } from 'react';

export const usePublicDataFallback = () => {
  // Valores por defecto estáticos para asegurar que la página se renderice
  const defaultCongressInfo = {
    titulo_informacion: 'Congreso de Tecnología 2025 - Universidad Mariano Gálvez de Guatemala',
    descripcion_informacion: 'El Congreso de Tecnología 2025 de la Universidad Mariano Gálvez de Guatemala es un evento académico de vanguardia que reúne a estudiantes de nivel medio de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas. Este congreso busca fomentar la innovación tecnológica, el desarrollo de competencias digitales y promover la carrera de Ingeniería en Sistemas como una opción profesional de excelencia en el país.',
    fecha_inicio_congreso: '2025-03-15T06:00:00.000Z',
    fecha_fin_congreso: '2025-03-16T06:00:00.000Z',
    lugar_congreso: 'Campus Central - Universidad Mariano Gálvez de Guatemala\nZona 11, Guatemala, Guatemala\nFacultad de Ingeniería en Sistemas',
    agenda_congreso: 'AGENDA CONGRESO DE TECNOLOGÍA 2025\n\nDÍA 1 - VIERNES 15 DE MARZO:\n08:00 - 09:00: Registro y Acreditación\n09:00 - 09:30: Ceremonia de Inauguración\n09:30 - 10:30: Conferencia Magistral: "El Futuro de la Tecnología en Guatemala"\n10:30 - 11:00: Coffee Break\n11:00 - 12:30: Talleres Básicos (Paralelos)\n12:30 - 14:00: Almuerzo\n14:00 - 15:30: Talleres Intermedios (Paralelos)\n15:30 - 16:00: Coffee Break\n16:00 - 17:30: Competencias de Programación (Fase 1)\n17:30 - 18:00: Networking y Exposición de Proyectos\n\nDÍA 2 - SÁBADO 16 DE MARZO:\n08:00 - 09:00: Registro y Acreditación\n09:00 - 10:30: Talleres Avanzados (Paralelos)\n10:30 - 11:00: Coffee Break\n11:00 - 12:30: Competencias de Robótica\n12:30 - 14:00: Almuerzo\n14:00 - 15:30: Competencias de Programación (Fase Final)\n15:30 - 16:00: Coffee Break\n16:00 - 17:00: Premiación y Clausura\n17:00 - 18:00: Networking Final y Entrega de Diplomas',
    ponentes_congreso: 'PONENTES INVITADOS:\n\n• Dr. Carlos Eduardo Marroquín - Director de Tecnología, Tigo Guatemala\n• Ing. Ana Lucía de León - Gerente de Desarrollo, Microsoft Guatemala\n• Lic. Roberto Carlos Morales - Fundador y CEO, Konfio Guatemala\n• Dra. María Elena Vásquez - Investigadora en IA, Universidad del Valle de Guatemala\n• Ing. José Luis Ramírez - Arquitecto de Soluciones, Amazon Web Services\n• Lic. Patricia Alejandra Castillo - Directora de Innovación, BAC Credomatic\n• Dr. Fernando Antonio García - Profesor Investigador, Universidad Mariano Gálvez\n• Ing. Luis Miguel Herrera - Desarrollador Senior, Google Guatemala',
    informacion_carrera: 'INFORMACIÓN SOBRE LA CARRERA DE INGENIERÍA EN SISTEMAS\nUniversidad Mariano Gálvez de Guatemala\n\nLa carrera de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Guatemala es un programa académico de excelencia que forma profesionales altamente capacitados para enfrentar los desafíos del mundo digital actual. Nuestro plan de estudios está diseñado para desarrollar competencias técnicas y habilidades de liderazgo que permiten a nuestros egresados destacar en el mercado laboral.\n\nPERFIL DEL EGRESADO:\n• Desarrollador de Software y Aplicaciones\n• Arquitecto de Soluciones Tecnológicas\n• Especialista en Ciberseguridad\n• Analista de Sistemas y Bases de Datos\n• Consultor en Transformación Digital\n• Emprendedor Tecnológico\n\nVENTAJAS COMPETITIVAS:\n• Plan de estudios actualizado con las últimas tecnologías\n• Laboratorios equipados con tecnología de punta\n• Profesores con experiencia en la industria\n• Convenios con empresas líderes del sector tecnológico\n• Programa de prácticas profesionales\n• Oportunidades de intercambio internacional\n• Bolsa de trabajo especializada\n\nCAMPOS DE TRABAJO:\n• Empresas de desarrollo de software\n• Instituciones financieras y bancarias\n• Empresas de telecomunicaciones\n• Consultoras tecnológicas\n• Startups y empresas emergentes\n• Sector público y gobierno\n• Emprendimiento propio\n\nLa Universidad Mariano Gálvez de Guatemala, con más de 50 años de experiencia educativa, garantiza una formación integral que combina excelencia académica con valores cristianos, preparando profesionales comprometidos con el desarrollo tecnológico de Guatemala.'
  };

  const defaultPublicStats = {
    total_usuarios: 500,
    total_actividades: 20,
    total_ponentes: 15,
    total_inscripciones: 0
  };

  const defaultFaqs = [
    {
      id_faq: 1,
      pregunta_faq: '¿Quién puede participar en el Congreso de Tecnología 2025?',
      respuesta_faq: 'Pueden participar estudiantes de nivel medio (4to y 5to bachillerato) de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Guatemala. Los estudiantes externos deben tener entre 15 y 18 años.',
      categoria_faq: 'general'
    },
    {
      id_faq: 2,
      pregunta_faq: '¿Cuándo y dónde se realizará el congreso?',
      respuesta_faq: 'El Congreso de Tecnología 2025 se realizará los días 15 y 16 de marzo de 2025 en el Campus Central de la Universidad Mariano Gálvez de Guatemala, ubicado en Zona 11, Guatemala. El evento se llevará a cabo en la Facultad de Ingeniería en Sistemas.',
      categoria_faq: 'general'
    },
    {
      id_faq: 3,
      pregunta_faq: '¿Es necesario pagar para participar?',
      respuesta_faq: 'La participación en el congreso es completamente gratuita. Sin embargo, algunos talleres especializados como "Robótica con Arduino" tienen un costo simbólico de Q25.00 para cubrir los materiales del kit de Arduino que se proporciona.',
      categoria_faq: 'costos'
    },
    {
      id_faq: 4,
      pregunta_faq: '¿Cómo me inscribo al congreso?',
      respuesta_faq: 'Puedes inscribirte a través de nuestro formulario en línea disponible en la página web del congreso. Los estudiantes externos deben proporcionar datos de su colegio y autorización de sus padres, mientras que los estudiantes internos de la UMG solo necesitan su email universitario (@umg.edu.gt).',
      categoria_faq: 'inscripcion'
    },
    {
      id_faq: 5,
      pregunta_faq: '¿Qué actividades están disponibles en el congreso?',
      respuesta_faq: 'Ofrecemos talleres de programación (Python, React, Machine Learning), robótica con Arduino, desarrollo web, inteligencia artificial, competencias de programación algorítmica, competencias de gaming, y charlas magistrales con expertos de empresas como Microsoft, Google, Tigo Guatemala y BAC Credomatic.',
      categoria_faq: 'actividades'
    },
    {
      id_faq: 6,
      pregunta_faq: '¿Cómo funciona el sistema de asistencia?',
      respuesta_faq: 'Cada participante recibirá un código QR único al inscribirse. Deberás escanear este código al ingresar al congreso y a cada actividad para registrar tu asistencia. Es importante que traigas tu código QR impreso o en tu dispositivo móvil.',
      categoria_faq: 'asistencia'
    },
    {
      id_faq: 7,
      pregunta_faq: '¿Recibiré un diploma por participar?',
      respuesta_faq: 'Sí, todos los participantes que asistan al menos al 80% de las actividades recibirán un diploma digital de participación que podrán descargar desde su perfil. Los ganadores de las competencias recibirán diplomas especiales de reconocimiento.',
      categoria_faq: 'diplomas'
    },
    {
      id_faq: 8,
      pregunta_faq: '¿Dónde puedo ver los resultados de las competencias?',
      respuesta_faq: 'Los resultados se publicarán en tiempo real en la sección de resultados de nuestra página web, incluyendo fotos de los proyectos ganadores, puntuaciones y posiciones. También se anunciarán durante la ceremonia de premiación.',
      categoria_faq: 'resultados'
    },
    {
      id_faq: 9,
      pregunta_faq: '¿Qué debo traer al congreso?',
      respuesta_faq: 'Recomendamos traer una laptop o tablet para participar en los talleres prácticos. También trae tu código QR impreso o en tu dispositivo móvil, identificación personal, y una botella de agua. Los materiales específicos para cada taller se indicarán en la confirmación de inscripción.',
      categoria_faq: 'preparacion'
    },
    {
      id_faq: 10,
      pregunta_faq: '¿Habrá estacionamiento disponible?',
      respuesta_faq: 'Sí, la Universidad Mariano Gálvez cuenta con estacionamiento gratuito para los participantes del congreso. Se recomienda llegar temprano ya que los espacios son limitados.',
      categoria_faq: 'logistica'
    },
    {
      id_faq: 11,
      pregunta_faq: '¿Habrá comida disponible durante el evento?',
      respuesta_faq: 'El congreso incluye coffee breaks durante las mañanas y tardes. Para el almuerzo, los participantes pueden traer su propia comida o visitar las cafeterías del campus universitario que estarán abiertas durante el evento.',
      categoria_faq: 'logistica'
    },
    {
      id_faq: 12,
      pregunta_faq: '¿Puedo participar en múltiples actividades?',
      respuesta_faq: 'Sí, puedes inscribirte en múltiples talleres y competencias, siempre y cuando no se traslapen en horario. El sistema te permitirá ver la disponibilidad de cupos y horarios antes de confirmar tu inscripción.',
      categoria_faq: 'actividades'
    },
    {
      id_faq: 13,
      pregunta_faq: '¿Qué pasa si no tengo experiencia en programación?',
      respuesta_faq: 'No te preocupes, el congreso está diseñado para todos los niveles. Ofrecemos talleres básicos para principiantes, intermedios y avanzados. Los instructores adaptarán el contenido según el nivel de los participantes.',
      categoria_faq: 'actividades'
    },
    {
      id_faq: 14,
      pregunta_faq: '¿Habrá oportunidades de networking?',
      respuesta_faq: 'Absolutamente. El congreso incluye sesiones de networking con profesionales de la industria tecnológica, estudiantes universitarios, y otros participantes. Es una excelente oportunidad para hacer contactos profesionales.',
      categoria_faq: 'networking'
    },
    {
      id_faq: 15,
      pregunta_faq: '¿Cómo puedo contactar a los organizadores?',
      respuesta_faq: 'Puedes contactarnos a través del email congreso.tech@umg.edu.gt, por WhatsApp al +502 5555-1234, o visitar nuestras oficinas en la Facultad de Ingeniería en Sistemas de la Universidad Mariano Gálvez.',
      categoria_faq: 'contacto'
    }
  ];

  const defaultFaqCategories = ['general', 'inscripcion', 'actividades', 'asistencia', 'costos', 'diplomas', 'resultados', 'preparacion', 'logistica', 'networking', 'contacto'];

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Por definir';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener estadísticas formateadas para el Hero
  const getHeroStats = () => {
    return {
      participantes: `${defaultPublicStats.total_usuarios}+`,
      talleres: `${defaultPublicStats.total_actividades}+`,
      ponentes: `${defaultPublicStats.total_ponentes}+`,
      dias: '3'
    };
  };

  // Función para obtener información del congreso formateada
  const getCongressInfoFormatted = () => {
    return {
      titulo: defaultCongressInfo.titulo_informacion,
      descripcion: defaultCongressInfo.descripcion_informacion,
      fechaInicio: formatDate(defaultCongressInfo.fecha_inicio_congreso),
      fechaFin: formatDate(defaultCongressInfo.fecha_fin_congreso),
      lugar: defaultCongressInfo.lugar_congreso,
      agenda: defaultCongressInfo.agenda_congreso,
      ponentes: defaultCongressInfo.ponentes_congreso
    };
  };

  return {
    // Datos por defecto
    congressInfo: defaultCongressInfo,
    publicStats: defaultPublicStats,
    faqs: defaultFaqs,
    faqCategories: defaultFaqCategories,
    
    // Estados (siempre listos)
    loading: false,
    error: null,
    
    // Datos formateados
    heroStats: getHeroStats(),
    congressInfoFormatted: getCongressInfoFormatted(),
    
    // Funciones
    formatDate
  };
};
