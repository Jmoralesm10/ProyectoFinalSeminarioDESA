-- =====================================================
-- Script de inserción de datos iniciales
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Insertar tipos de usuario
INSERT INTO tipos_usuario (nombre, descripcion) VALUES
('externo', 'Estudiantes de nivel medio de colegios externos'),
('interno', 'Alumnos de la facultad de ingeniería en sistemas');

-- Insertar categorías de actividades
INSERT INTO categorias_actividad (nombre, descripcion) VALUES
('programacion', 'Actividades relacionadas con programación y desarrollo de software'),
('robotica', 'Talleres y competencias de robótica'),
('inteligencia_artificial', 'Actividades sobre IA y machine learning'),
('desarrollo_web', 'Talleres de desarrollo web y aplicaciones'),
('seguridad_informatica', 'Actividades sobre ciberseguridad'),
('emprendimiento_tech', 'Talleres sobre emprendimiento tecnológico'),
('gaming', 'Competencias de videojuegos y desarrollo de juegos'),
('networking', 'Actividades de networking y charlas profesionales');

-- Insertar información del congreso
INSERT INTO informacion_congreso (titulo, descripcion, fecha_inicio, fecha_fin, lugar, agenda, ponentes_invitados, informacion_carrera) VALUES
('Congreso de Tecnología 2024', 
'El Congreso de Tecnología es un evento anual que busca promover la carrera de ingeniería en sistemas entre estudiantes de nivel medio y ofrecer a los alumnos de la facultad una plataforma para participar en diversas actividades académicas y recreativas.',
'2024-10-15',
'2024-10-17',
'Facultad de Ingeniería en Sistemas - Universidad',
'Día 1: Inauguración y talleres básicos
Día 2: Competencias y talleres avanzados
Día 3: Premiación y clausura',
'Dr. Juan Pérez - Especialista en IA
Ing. María González - Desarrolladora Senior
Lic. Carlos Rodríguez - Emprendedor Tecnológico',
'La carrera de Ingeniería en Sistemas forma profesionales capaces de diseñar, desarrollar e implementar soluciones tecnológicas innovadoras. Nuestros egresados trabajan en empresas líderes del sector tecnológico, desarrollando software, aplicaciones móviles, sistemas web y soluciones de inteligencia artificial.');

-- Insertar FAQ iniciales
INSERT INTO faq (pregunta, respuesta, categoria, orden) VALUES
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
INSERT INTO administradores (nombre, apellido, email, password_hash, rol) VALUES
('Administrador', 'Sistema', 'admin@congreso.edu', crypt('admin123', gen_salt('bf')), 'super_admin');

-- Insertar algunas actividades de ejemplo
INSERT INTO actividades (categoria_id, nombre, descripcion, tipo_actividad, fecha_inicio, fecha_fin, cupo_maximo, lugar, ponente) VALUES
(1, 'Introducción a Python', 'Taller básico de programación en Python para principiantes', 'taller', '2024-10-15 09:00:00', '2024-10-15 12:00:00', 30, 'Aula 101', 'Dr. Ana Martínez'),
(1, 'Competencia de Programación', 'Competencia de resolución de problemas algorítmicos', 'competencia', '2024-10-16 14:00:00', '2024-10-16 18:00:00', 50, 'Laboratorio de Computación', 'Ing. Roberto Silva'),
(2, 'Robótica con Arduino', 'Taller práctico de construcción y programación de robots', 'taller', '2024-10-15 14:00:00', '2024-10-15 17:00:00', 20, 'Laboratorio de Robótica', 'Ing. Laura Fernández'),
(3, 'Machine Learning Básico', 'Introducción a los conceptos de inteligencia artificial', 'taller', '2024-10-16 09:00:00', '2024-10-16 12:00:00', 25, 'Aula 205', 'Dr. Miguel Torres'),
(4, 'Desarrollo Web con React', 'Taller de desarrollo de aplicaciones web modernas', 'taller', '2024-10-17 09:00:00', '2024-10-17 12:00:00', 35, 'Laboratorio de Desarrollo', 'Ing. Sofía Ramírez'),
(7, 'Competencia de Gaming', 'Torneo de videojuegos y desarrollo de juegos', 'competencia', '2024-10-17 14:00:00', '2024-10-17 18:00:00', 40, 'Sala de Gaming', 'Lic. Diego Morales');

-- Actualizar cupo disponible para las actividades
UPDATE actividades SET cupo_disponible = cupo_maximo;
