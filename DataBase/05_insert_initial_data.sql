-- =====================================================
-- Script de inserción de datos iniciales
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Insertar tipos de usuario
INSERT INTO tb_tipos_usuario (nombre_tipo_usuario, descripcion_tipo_usuario) VALUES
('externo', 'Estudiantes de nivel medio de colegios externos'),
('interno', 'Alumnos de la facultad de ingeniería en sistemas');

-- Insertar categorías de actividades
INSERT INTO tb_categorias_actividad (nombre_categoria, descripcion_categoria) VALUES
('programacion', 'Actividades relacionadas con programación y desarrollo de software'),
('robotica', 'Talleres y competencias de robótica'),
('inteligencia_artificial', 'Actividades sobre IA y machine learning'),
('desarrollo_web', 'Talleres de desarrollo web y aplicaciones'),
('seguridad_informatica', 'Actividades sobre ciberseguridad'),
('emprendimiento_tech', 'Talleres sobre emprendimiento tecnológico'),
('gaming', 'Competencias de videojuegos y desarrollo de juegos'),
('networking', 'Actividades de networking y charlas profesionales');

-- Insertar información general del congreso 2025 - Universidad Mariano Gálvez de Guatemala
INSERT INTO tb_informacion_congreso (titulo_informacion, descripcion_informacion, fecha_inicio_informacion, fecha_fin_informacion, lugar_informacion, informacion_carrera_informacion) VALUES
('Congreso de Tecnología 2025 - Universidad Mariano Gálvez de Guatemala', 
'El Congreso de Tecnología 2025 de la Universidad Mariano Gálvez de Guatemala es un evento académico de vanguardia que reúne a estudiantes de nivel medio de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas. Este congreso busca fomentar la innovación tecnológica, el desarrollo de competencias digitales y promover la carrera de Ingeniería en Sistemas como una opción profesional de excelencia en el país.

El evento ofrece una plataforma única para el intercambio de conocimientos, la participación en talleres prácticos, competencias de programación y robótica, así como charlas magistrales con expertos del sector tecnológico guatemalteco e internacional.',
'2025-03-15',
'2025-03-16',
'Campus Central - Universidad Mariano Gálvez de Guatemala, Zona 11, Guatemala, Guatemala, Facultad de Ingeniería en Sistemas',
'INFORMACIÓN SOBRE LA CARRERA DE INGENIERÍA EN SISTEMAS
Universidad Mariano Gálvez de Guatemala

La carrera de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Guatemala es un programa académico de excelencia que forma profesionales altamente capacitados para enfrentar los desafíos del mundo digital actual. Nuestro plan de estudios está diseñado para desarrollar competencias técnicas y habilidades de liderazgo que permiten a nuestros egresados destacar en el mercado laboral.

PERFIL DEL EGRESADO:
• Desarrollador de Software y Aplicaciones
• Arquitecto de Soluciones Tecnológicas
• Especialista en Ciberseguridad
• Analista de Sistemas y Bases de Datos
• Consultor en Transformación Digital
• Emprendedor Tecnológico

VENTAJAS COMPETITIVAS:
• Plan de estudios actualizado con las últimas tecnologías
• Laboratorios equipados con tecnología de punta
• Profesores con experiencia en la industria
• Convenios con empresas líderes del sector tecnológico
• Programa de prácticas profesionales
• Oportunidades de intercambio internacional
• Bolsa de trabajo especializada

CAMPOS DE TRABAJO:
• Empresas de desarrollo de software
• Instituciones financieras y bancarias
• Empresas de telecomunicaciones
• Consultoras tecnológicas
• Startups y empresas emergentes
• Sector público y gobierno
• Emprendimiento propio

La Universidad Mariano Gálvez de Guatemala, con más de 50 años de experiencia educativa, garantiza una formación integral que combina excelencia académica con valores cristianos, preparando profesionales comprometidos con el desarrollo tecnológico de Guatemala.');

-- Insertar agenda del congreso 2025
INSERT INTO tb_agenda_congreso (id_informacion, dia_agenda, hora_inicio_agenda, hora_fin_agenda, titulo_actividad_agenda, descripcion_actividad_agenda, tipo_actividad_agenda, ponente_agenda, orden_agenda) VALUES
-- DÍA 1 - VIERNES 15 DE MARZO
(1, 1, '08:00:00', '09:00:00', 'Registro y Acreditación', 'Registro de participantes y entrega de materiales del congreso', 'inauguracion', 'Equipo Organizador', 1),
(1, 1, '09:00:00', '09:30:00', 'Ceremonia de Inauguración', 'Bienvenida oficial y presentación del congreso', 'inauguracion', 'Dr. Fernando Antonio García - UMG', 2),
(1, 1, '09:30:00', '10:30:00', 'Conferencia Magistral: "El Futuro de la Tecnología en Guatemala"', 'Charla magistral sobre las tendencias tecnológicas en Guatemala', 'conferencia', 'Dr. Carlos Eduardo Marroquín - Tigo Guatemala', 3),
(1, 1, '10:30:00', '11:00:00', 'Coffee Break', 'Pausa para café y networking', 'coffee_break', NULL, 4),
(1, 1, '11:00:00', '12:30:00', 'Talleres Básicos (Paralelos)', 'Talleres de programación básica y robótica para principiantes', 'taller', 'Varios Instructores', 5),
(1, 1, '12:30:00', '14:00:00', 'Almuerzo', 'Pausa para almuerzo', 'almuerzo', NULL, 6),
(1, 1, '14:00:00', '15:30:00', 'Talleres Intermedios (Paralelos)', 'Talleres de desarrollo web, IA y ciberseguridad', 'taller', 'Varios Instructores', 7),
(1, 1, '15:30:00', '16:00:00', 'Coffee Break', 'Pausa para café y networking', 'coffee_break', NULL, 8),
(1, 1, '16:00:00', '17:30:00', 'Competencias de Programación (Fase 1)', 'Primera fase de la competencia de programación algorítmica', 'competencia', 'Ing. José Luis Ramírez - AWS', 9),
(1, 1, '17:30:00', '18:00:00', 'Networking y Exposición de Proyectos', 'Sesión de networking y exposición de proyectos estudiantiles', 'networking', 'Todos los Participantes', 10),

-- DÍA 2 - SÁBADO 16 DE MARZO
(1, 2, '08:00:00', '09:00:00', 'Registro y Acreditación', 'Registro de participantes del segundo día', 'inauguracion', 'Equipo Organizador', 1),
(1, 2, '09:00:00', '10:30:00', 'Talleres Avanzados (Paralelos)', 'Talleres avanzados de Python, APIs y desarrollo de videojuegos', 'taller', 'Varios Instructores', 2),
(1, 2, '10:30:00', '11:00:00', 'Coffee Break', 'Pausa para café y networking', 'coffee_break', NULL, 3),
(1, 2, '11:00:00', '12:30:00', 'Competencias de Robótica', 'Competencia de robótica y navegación autónoma', 'competencia', 'Ing. Ana Lucía de León - Microsoft Guatemala', 4),
(1, 2, '12:30:00', '14:00:00', 'Almuerzo', 'Pausa para almuerzo', 'almuerzo', NULL, 5),
(1, 2, '14:00:00', '15:30:00', 'Competencias de Programación (Fase Final)', 'Fase final de la competencia de programación', 'competencia', 'Ing. José Luis Ramírez - AWS', 6),
(1, 2, '15:30:00', '16:00:00', 'Coffee Break', 'Pausa para café y networking', 'coffee_break', NULL, 7),
(1, 2, '16:00:00', '17:00:00', 'Premiación y Clausura', 'Ceremonia de premiación y clausura del congreso', 'premiacion', 'Dr. Fernando Antonio García - UMG', 8),
(1, 2, '17:00:00', '18:00:00', 'Networking Final y Entrega de Diplomas', 'Sesión final de networking y entrega de diplomas', 'networking', 'Todos los Participantes', 9);

-- Insertar ponentes invitados del congreso 2025
INSERT INTO tb_ponentes_congreso (id_informacion, nombre_ponente, apellido_ponente, titulo_academico_ponente, cargo_ponente, empresa_ponente, especialidad_ponente, email_ponente, linkedin_ponente, orden_ponente) VALUES
(1, 'Carlos Eduardo', 'Marroquín', 'Dr.', 'Director de Tecnología', 'Tigo Guatemala', 'Telecomunicaciones y Transformación Digital', 'carlos.marroquin@tigo.com.gt', 'https://linkedin.com/in/carlos-marroquin', 1),

(1, 'Ana Lucía', 'de León', 'Ing.', 'Gerente de Desarrollo', 'Microsoft Guatemala', 'Desarrollo de Software y Cloud Computing', 'ana.deleon@microsoft.com', 'https://linkedin.com/in/ana-deleon', 2),

(1, 'Roberto Carlos', 'Morales', 'Lic.', 'Fundador y CEO', 'Konfio Guatemala', 'Emprendimiento Tecnológico y Fintech', 'roberto.morales@konfio.com', 'https://linkedin.com/in/roberto-morales', 3),

(1, 'María Elena', 'Vásquez', 'Dra.', 'Investigadora en IA', 'Universidad del Valle de Guatemala', 'Inteligencia Artificial y Machine Learning', 'maria.vasquez@uvg.edu.gt', 'https://linkedin.com/in/maria-vasquez', 4),

(1, 'José Luis', 'Ramírez', 'Ing.', 'Arquitecto de Soluciones', 'Amazon Web Services', 'Cloud Computing y Arquitectura de Software', 'jose.ramirez@amazon.com', 'https://linkedin.com/in/jose-ramirez', 5),

(1, 'Patricia Alejandra', 'Castillo', 'Lic.', 'Directora de Innovación', 'BAC Credomatic', 'Ciberseguridad y Innovación Financiera', 'patricia.castillo@baccredomatic.com', 'https://linkedin.com/in/patricia-castillo', 6),

(1, 'Fernando Antonio', 'García', 'Dr.', 'Profesor Investigador', 'Universidad Mariano Gálvez', 'Investigación en Sistemas y Educación Tecnológica', 'fernando.garcia@umg.edu.gt', 'https://linkedin.com/in/fernando-garcia', 7),

(1, 'Luis Miguel', 'Herrera', 'Ing.', 'Desarrollador Senior', 'Google Guatemala', 'Desarrollo Web y Tecnologías Frontend', 'luis.herrera@google.com', 'https://linkedin.com/in/luis-herrera', 8);

-- Insertar FAQ específicas del Congreso 2025 - Universidad Mariano Gálvez de Guatemala
INSERT INTO tb_faq (pregunta_faq, respuesta_faq, categoria_faq, orden_faq) VALUES
('¿Quién puede participar en el Congreso de Tecnología 2025?', 
'Pueden participar estudiantes de nivel medio (4to y 5to bachillerato) de colegios externos y alumnos de la Facultad de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Guatemala. Los estudiantes externos deben tener entre 15 y 18 años.', 
'general', 1),

('¿Cuándo y dónde se realizará el congreso?', 
'El Congreso de Tecnología 2025 se realizará los días 15 y 16 de marzo de 2025 en el Campus Central de la Universidad Mariano Gálvez de Guatemala, ubicado en Zona 11, Guatemala. El evento se llevará a cabo en la Facultad de Ingeniería en Sistemas.', 
'general', 2),

('¿Es necesario pagar para participar?', 
'La participación en el congreso es completamente gratuita. Sin embargo, algunos talleres especializados como "Robótica con Arduino" tienen un costo simbólico de Q25.00 para cubrir los materiales del kit de Arduino que se proporciona.', 
'costos', 3),

('¿Cómo me inscribo al congreso?', 
'Puedes inscribirte a través de nuestro formulario en línea disponible en la página web del congreso. Los estudiantes externos deben proporcionar datos de su colegio y autorización de sus padres, mientras que los estudiantes internos de la UMG solo necesitan su email universitario (@umg.edu.gt).', 
'inscripcion', 4),

('¿Qué actividades están disponibles en el congreso?', 
'Ofrecemos talleres de programación (Python, React, Machine Learning), robótica con Arduino, desarrollo web, inteligencia artificial, competencias de programación algorítmica, competencias de gaming, y charlas magistrales con expertos de empresas como Microsoft, Google, Tigo Guatemala y BAC Credomatic.', 
'actividades', 5),

('¿Cómo funciona el sistema de asistencia?', 
'Cada participante recibirá un código QR único al inscribirse. Deberás escanear este código al ingresar al congreso y a cada actividad para registrar tu asistencia. Es importante que traigas tu código QR impreso o en tu dispositivo móvil.', 
'asistencia', 6),

('¿Recibiré un diploma por participar?', 
'Sí, todos los participantes que asistan al menos al 80% de las actividades recibirán un diploma digital de participación que podrán descargar desde su perfil. Los ganadores de las competencias recibirán diplomas especiales de reconocimiento.', 
'diplomas', 7),

('¿Dónde puedo ver los resultados de las competencias?', 
'Los resultados se publicarán en tiempo real en la sección de resultados de nuestra página web, incluyendo fotos de los proyectos ganadores, puntuaciones y posiciones. También se anunciarán durante la ceremonia de premiación.', 
'resultados', 8),

('¿Qué debo traer al congreso?', 
'Recomendamos traer una laptop o tablet para participar en los talleres prácticos. También trae tu código QR impreso o en tu dispositivo móvil, identificación personal, y una botella de agua. Los materiales específicos para cada taller se indicarán en la confirmación de inscripción.', 
'preparacion', 9),

('¿Habrá estacionamiento disponible?', 
'Sí, la Universidad Mariano Gálvez cuenta con estacionamiento gratuito para los participantes del congreso. Se recomienda llegar temprano ya que los espacios son limitados.', 
'logistica', 10),

('¿Habrá comida disponible durante el evento?', 
'El congreso incluye coffee breaks durante las mañanas y tardes. Para el almuerzo, los participantes pueden traer su propia comida o visitar las cafeterías del campus universitario que estarán abiertas durante el evento.', 
'logistica', 11),

('¿Puedo participar en múltiples actividades?', 
'Sí, puedes inscribirte en múltiples talleres y competencias, siempre y cuando no se traslapen en horario. El sistema te permitirá ver la disponibilidad de cupos y horarios antes de confirmar tu inscripción.', 
'actividades', 12),

('¿Qué pasa si no tengo experiencia en programación?', 
'No te preocupes, el congreso está diseñado para todos los niveles. Ofrecemos talleres básicos para principiantes, intermedios y avanzados. Los instructores adaptarán el contenido según el nivel de los participantes.', 
'actividades', 13),

('¿Habrá oportunidades de networking?', 
'Absolutamente. El congreso incluye sesiones de networking con profesionales de la industria tecnológica, estudiantes universitarios, y otros participantes. Es una excelente oportunidad para hacer contactos profesionales.', 
'networking', 14),

('¿Cómo puedo contactar a los organizadores?', 
'Puedes contactarnos a través del email congreso.tech@umg.edu.gt, por WhatsApp al +502 5555-1234, o visitar nuestras oficinas en la Facultad de Ingeniería en Sistemas de la Universidad Mariano Gálvez.', 
'contacto', 15);

-- Insertar administrador por defecto (password: admin123)
INSERT INTO tb_administradores (nombre_administrador, apellido_administrador, email_administrador, password_hash_administrador, rol_administrador) VALUES
('Administrador', 'Sistema', 'admin@congreso.edu', crypt('admin123', gen_salt('bf')), 'super_admin');

-- Insertar actividades del Congreso de Tecnología 2025 - Universidad Mariano Gálvez de Guatemala
INSERT INTO tb_actividades (
    id_categoria, 
    nombre_actividad, 
    tipo_actividad, 
    fecha_inicio_actividad, 
    fecha_fin_actividad, 
    cupo_maximo_actividad,
    descripcion_actividad, 
    fecha_limite_inscripcion,
    duracion_estimada_minutos,
    lugar_actividad, 
    ponente_actividad,
    requisitos_actividad,
    nivel_requerido,
    edad_minima,
    edad_maxima,
    materiales_requeridos,
    costo_actividad,
    moneda_costo,
    permite_inscripciones,
    requiere_aprobacion
) VALUES
-- DÍA 1 - VIERNES 15 DE MARZO
(1, 'Introducción a Python para Principiantes', 'taller', '2025-03-15 11:00:00', '2025-03-15 12:30:00', 30, 
'Taller básico de programación en Python dirigido a estudiantes sin experiencia previa. Aprenderás los conceptos fundamentales de programación, sintaxis básica de Python, y crearás tu primer programa.', 
'2025-03-14 23:59:59', 90, 'Laboratorio de Programación A', 'Dr. Fernando Antonio García - UMG', 
'No se requiere experiencia previa en programación', 'basico', 15, 18, 'Laptop con Python 3.8+ instalado', 0.00, 'GTQ', TRUE, FALSE),

(1, 'Competencia de Programación Algorítmica - Fase 1', 'competencia', '2025-03-15 16:00:00', '2025-03-15 17:30:00', 50, 
'Primera fase de la competencia de programación algorítmica. Los participantes resolverán problemas de lógica y algoritmos usando el lenguaje de programación de su elección.', 
'2025-03-14 23:59:59', 90, 'Laboratorio de Computación Principal', 'Ing. José Luis Ramírez - AWS', 
'Conocimientos básicos de programación en cualquier lenguaje', 'intermedio', 16, 18, 'Laptop con editor de código y compilador', 0.00, 'GTQ', TRUE, FALSE),

(2, 'Robótica con Arduino - Construye tu Primer Robot', 'taller', '2025-03-15 14:00:00', '2025-03-15 15:30:00', 20, 
'Taller práctico donde construirás y programarás tu primer robot usando Arduino. Aprenderás sobre sensores, motores, y programación básica de microcontroladores.', 
'2025-03-14 23:59:59', 90, 'Laboratorio de Robótica UMG', 'Ing. Ana Lucía de León - Microsoft Guatemala', 
'Interés en electrónica y programación básica', 'basico', 15, 18, 'Kit de Arduino (incluido en el costo)', 25.00, 'GTQ', TRUE, FALSE),

(3, 'Machine Learning: Tu Primera Red Neuronal', 'taller', '2025-03-15 11:00:00', '2025-03-15 12:30:00', 25, 
'Introducción práctica a la inteligencia artificial y machine learning. Crearás tu primera red neuronal para reconocimiento de patrones usando Python y TensorFlow.', 
'2025-03-14 23:59:59', 90, 'Aula de Inteligencia Artificial', 'Dra. María Elena Vásquez - UVG', 
'Conocimientos básicos de Python y matemáticas de bachillerato', 'intermedio', 16, 18, 'Laptop con Python, NumPy, Pandas y TensorFlow', 0.00, 'GTQ', TRUE, FALSE),

(4, 'Desarrollo Web Moderno con React', 'taller', '2025-03-15 14:00:00', '2025-03-15 15:30:00', 35, 
'Taller de desarrollo de aplicaciones web modernas usando React. Aprenderás a crear interfaces de usuario interactivas y componentes reutilizables.', 
'2025-03-14 23:59:59', 90, 'Laboratorio de Desarrollo Web', 'Ing. Luis Miguel Herrera - Google Guatemala', 
'Conocimientos básicos de HTML, CSS y JavaScript', 'intermedio', 16, 18, 'Laptop con Node.js y un editor de código', 0.00, 'GTQ', TRUE, FALSE),

-- DÍA 2 - SÁBADO 16 DE MARZO
(1, 'Python Avanzado: APIs y Bases de Datos', 'taller', '2025-03-16 09:00:00', '2025-03-16 10:30:00', 30, 
'Taller avanzado de Python enfocado en el desarrollo de APIs REST y manejo de bases de datos. Perfecto para estudiantes con experiencia básica en Python.', 
'2025-03-15 23:59:59', 90, 'Laboratorio de Programación B', 'Dr. Carlos Eduardo Marroquín - Tigo Guatemala', 
'Conocimientos básicos de Python y programación orientada a objetos', 'avanzado', 16, 18, 'Laptop con Python, Flask y SQLite', 0.00, 'GTQ', TRUE, FALSE),

(2, 'Competencia de Robótica: Desafío de Navegación', 'competencia', '2025-03-16 11:00:00', '2025-03-16 12:30:00', 20, 
'Competencia de robótica donde los participantes programarán robots para navegar por un laberinto y completar tareas específicas. Se evaluará precisión, velocidad y creatividad.', 
'2025-03-15 23:59:59', 90, 'Laboratorio de Robótica UMG', 'Ing. Ana Lucía de León - Microsoft Guatemala', 
'Haber participado en el taller de Robótica con Arduino o experiencia equivalente', 'intermedio', 15, 18, 'Robot Arduino (propio o proporcionado)', 0.00, 'GTQ', TRUE, FALSE),

(1, 'Competencia de Programación Algorítmica - Fase Final', 'competencia', '2025-03-16 14:00:00', '2025-03-16 15:30:00', 30, 
'Fase final de la competencia de programación. Los mejores participantes de la primera fase competirán por los primeros tres lugares resolviendo problemas algorítmicos complejos.', 
'2025-03-15 23:59:59', 90, 'Laboratorio de Computación Principal', 'Ing. José Luis Ramírez - AWS', 
'Haber clasificado en la Fase 1 de la competencia', 'avanzado', 16, 18, 'Laptop con editor de código y compilador', 0.00, 'GTQ', TRUE, FALSE),

(7, 'Competencia de Gaming: Desarrollo de Videojuegos', 'competencia', '2025-03-16 09:00:00', '2025-03-16 10:30:00', 40, 
'Competencia de desarrollo de videojuegos usando Unity. Los participantes crearán un juego simple en 90 minutos y serán evaluados por creatividad, jugabilidad y calidad técnica.', 
'2025-03-15 23:59:59', 90, 'Sala de Gaming UMG', 'Lic. Roberto Carlos Morales - Konfio Guatemala', 
'Conocimientos básicos de programación y creatividad', 'intermedio', 15, 18, 'Laptop con Unity instalado', 0.00, 'GTQ', TRUE, FALSE),

(5, 'Ciberseguridad: Protege tu Información Digital', 'taller', '2025-03-16 11:00:00', '2025-03-16 12:30:00', 25, 
'Taller sobre ciberseguridad básica y buenas prácticas para proteger información personal y profesional. Aprenderás sobre contraseñas seguras, phishing, y encriptación.', 
'2025-03-15 23:59:59', 90, 'Aula de Ciberseguridad', 'Lic. Patricia Alejandra Castillo - BAC Credomatic', 
'Conocimientos básicos de computación e internet', 'basico', 15, 18, 'Laptop con navegador web', 0.00, 'GTQ', TRUE, FALSE),

(6, 'Emprendimiento Tecnológico: De la Idea al Negocio', 'taller', '2025-03-16 14:00:00', '2025-03-16 15:30:00', 30, 
'Taller sobre emprendimiento en el sector tecnológico. Aprenderás a identificar oportunidades, crear modelos de negocio, y presentar ideas de manera efectiva.', 
'2025-03-15 23:59:59', 90, 'Aula de Emprendimiento', 'Lic. Roberto Carlos Morales - Konfio Guatemala', 
'Interés en emprendimiento y tecnología', 'basico', 15, 18, 'Laptop o tablet para tomar notas', 0.00, 'GTQ', TRUE, FALSE);
