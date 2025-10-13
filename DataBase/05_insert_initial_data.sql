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

-- Insertar información del congreso
INSERT INTO tb_informacion_congreso (titulo_informacion, descripcion_informacion, fecha_inicio_informacion, fecha_fin_informacion, lugar_informacion, agenda_informacion, ponentes_invitados_informacion, informacion_carrera_informacion) VALUES
('Congreso de Tecnología 2025', 
'El Congreso de Tecnología es un evento anual que busca promover la carrera de ingeniería en sistemas entre estudiantes de nivel medio y ofrecer a los alumnos de la facultad una plataforma para participar en diversas actividades académicas y recreativas.',
'2025-11-12',
'2025-11-13',
'Facultad de Ingeniería en Sistemas - Universidad',
'Día 1: Inauguración y talleres básicos
Día 2: Competencias y talleres avanzados
Día 3: Premiación y clausura',
'Dr. Juan Pérez - Especialista en IA
Ing. María González - Desarrolladora Senior
Lic. Carlos Rodríguez - Emprendedor Tecnológico',
'La carrera de Ingeniería en Sistemas forma profesionales capaces de diseñar, desarrollar e implementar soluciones tecnológicas innovadoras. Nuestros egresados trabajan en empresas líderes del sector tecnológico, desarrollando software, aplicaciones móviles, sistemas web y soluciones de inteligencia artificial.');

-- Insertar FAQ iniciales
INSERT INTO tb_faq (pregunta_faq, respuesta_faq, categoria_faq, orden_faq) VALUES
('¿Quién puede participar en el congreso?', 
'Pueden participar estudiantes de nivel medio de colegios externos y alumnos de la facultad de ingeniería en sistemas.', 
'general', 1),

('¿Es necesario pagar para participar?', 
'La participación en el congreso es gratuita. Sin embargo, algunos talleres especializados pueden tener un costo simbólico.', 
'costos', 2),

('¿Cómo me inscribo al congreso?', 
'Puedes inscribirte a través de nuestro formulario en línea. Los estudiantes externos deben proporcionar datos de su colegio, mientras que los estudiantes internos solo necesitan su email universitario.', 
'inscripcion', 3),

('¿Qué actividades están disponibles?', 
'Ofrecemos talleres de programación, robótica, desarrollo web, inteligencia artificial, y competencias de gaming y desarrollo de software.', 
'actividades', 4),

('¿Cómo funciona el sistema de asistencia?', 
'Cada participante recibirá un código QR único al inscribirse. Deberás escanear este código al ingresar al congreso y a cada actividad.', 
'asistencia', 5),

('¿Recibiré un diploma por participar?', 
'Sí, todos los participantes que asistan al menos al 80% de las actividades recibirán un diploma digital que podrán descargar desde su perfil.', 
'diplomas', 6),

('¿Dónde puedo ver los resultados de las competencias?', 
'Los resultados se publicarán en la sección de resultados de nuestra página web, incluyendo fotos de los proyectos ganadores.', 
'resultados', 7),

('¿Qué debo traer al congreso?', 
'Recomendamos traer una laptop o tablet para participar en los talleres prácticos. También trae tu código QR impreso o en tu dispositivo móvil.', 
'preparacion', 8);

-- Insertar administrador por defecto (password: admin123)
INSERT INTO tb_administradores (nombre_administrador, apellido_administrador, email_administrador, password_hash_administrador, rol_administrador) VALUES
('Administrador', 'Sistema', 'admin@congreso.edu', crypt('admin123', gen_salt('bf')), 'super_admin');

-- Insertar algunas actividades de ejemplo
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
(1, 'Introducción a Python', 'taller', '2025-11-12 09:00:00', '2025-11-12 12:00:00', 30, 'Taller básico de programación en Python para principiantes', '2025-11-11 23:59:59', 180, 'Aula 101', 'Dr. Ana Martínez', 'Conocimientos básicos de programación', 'basico', 14, 25, 'Laptop con Python instalado', 0.00, 'GTQ', TRUE, FALSE),
(1, 'Competencia de Programación', 'competencia', '2025-11-12 14:00:00', '2025-11-12 18:00:00', 50, 'Competencia de resolución de problemas algorítmicos', '2025-11-11 23:59:59', 240, 'Laboratorio de Computación', 'Ing. Roberto Silva', 'Conocimientos de programación y algoritmos', 'intermedio', 16, 30, 'Laptop con editor de código', 0.00, 'GTQ', TRUE, FALSE),
(2, 'Robótica con Arduino', 'taller', '2025-11-12 14:00:00', '2025-11-12 17:00:00', 20, 'Taller práctico de construcción y programación de robots', '2025-11-11 23:59:59', 180, 'Laboratorio de Robótica', 'Ing. Laura Fernández', 'Interés en electrónica y programación', 'basico', 15, 25, 'Kit de Arduino (proporcionado)', 25.00, 'GTQ', TRUE, FALSE),
(3, 'Machine Learning Básico', 'taller', '2025-11-12 09:00:00', '2025-11-12 12:00:00', 25, 'Introducción a los conceptos de inteligencia artificial', '2025-11-11 23:59:59', 180, 'Aula 205', 'Dr. Miguel Torres', 'Conocimientos básicos de Python y matemáticas', 'intermedio', 17, 30, 'Laptop con Python y librerías ML', 0.00, 'GTQ', TRUE, FALSE),
(4, 'Desarrollo Web con React', 'taller', '2025-11-13 09:00:00', '2025-11-13 12:00:00', 35, 'Taller de desarrollo de aplicaciones web modernas', '2025-11-11 23:59:59', 180, 'Laboratorio de Desarrollo', 'Ing. Sofía Ramírez', 'Conocimientos básicos de HTML, CSS y JavaScript', 'intermedio', 16, 30, 'Laptop con Node.js instalado', 0.00, 'GTQ', TRUE, FALSE),
(7, 'Competencia de Gaming', 'competencia', '2025-11-13 14:00:00', '2025-11-13 18:00:00', 40, 'Torneo de videojuegos y desarrollo de juegos', '2025-11-11 23:59:59', 240, 'Sala de Gaming', 'Lic. Diego Morales', 'Experiencia en videojuegos', 'basico', 14, 25, 'Control de juego (opcional)', 0.00, 'GTQ', TRUE, FALSE);
