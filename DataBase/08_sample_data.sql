-- =====================================================
-- Script de datos de ejemplo para testing
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Insertar usuarios de ejemplo (estudiantes externos)
INSERT INTO usuarios (tipo_usuario_id, nombre, apellido, email, telefono, colegio) VALUES
(1, 'Juan', 'Pérez', 'juan.perez@colegio1.edu', '555-0101', 'Colegio San José'),
(1, 'María', 'González', 'maria.gonzalez@colegio2.edu', '555-0102', 'Instituto Tecnológico'),
(1, 'Carlos', 'Rodríguez', 'carlos.rodriguez@colegio3.edu', '555-0103', 'Liceo Moderno'),
(1, 'Ana', 'Martínez', 'ana.martinez@colegio1.edu', '555-0104', 'Colegio San José'),
(1, 'Luis', 'Fernández', 'luis.fernandez@colegio4.edu', '555-0105', 'Escuela Técnica Superior');

-- Insertar usuarios de ejemplo (estudiantes internos)
INSERT INTO usuarios (tipo_usuario_id, nombre, apellido, email, email_universitario) VALUES
(2, 'Sofía', 'Ramírez', 'sofia.ramirez@gmail.com', 'sofia.ramirez@universidad.edu'),
(2, 'Diego', 'Morales', 'diego.morales@gmail.com', 'diego.morales@universidad.edu'),
(2, 'Valentina', 'Silva', 'valentina.silva@gmail.com', 'valentina.silva@universidad.edu'),
(2, 'Andrés', 'Torres', 'andres.torres@gmail.com', 'andres.torres@universidad.edu'),
(2, 'Camila', 'Vargas', 'camila.vargas@gmail.com', 'camila.vargas@universidad.edu');

-- Insertar inscripciones de ejemplo
INSERT INTO inscripciones_actividad (usuario_id, actividad_id, estado) VALUES
-- Usuario 1 (Juan Pérez)
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 1, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 2, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 3, 'confirmada'),

-- Usuario 2 (María González)
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 1, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 4, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 6, 'confirmada'),

-- Usuario 3 (Carlos Rodríguez)
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 2, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 3, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 5, 'confirmada'),

-- Usuario 4 (Ana Martínez)
((SELECT id FROM usuarios WHERE email = 'ana.martinez@colegio1.edu'), 1, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'ana.martinez@colegio1.edu'), 4, 'confirmada'),

-- Usuario 5 (Luis Fernández)
((SELECT id FROM usuarios WHERE email = 'luis.fernandez@colegio4.edu'), 2, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'luis.fernandez@colegio4.edu'), 6, 'confirmada'),

-- Usuario 6 (Sofía Ramírez - interna)
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 1, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 3, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 5, 'confirmada'),

-- Usuario 7 (Diego Morales - interno)
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 2, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 4, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 6, 'confirmada'),

-- Usuario 8 (Valentina Silva - interna)
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 1, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 2, 'confirmada'),

-- Usuario 9 (Andrés Torres - interno)
((SELECT id FROM usuarios WHERE email = 'andres.torres@gmail.com'), 3, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'andres.torres@gmail.com'), 5, 'confirmada'),

-- Usuario 10 (Camila Vargas - interna)
((SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), 4, 'confirmada'),
((SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), 6, 'confirmada');

-- Insertar asistencia de ejemplo
INSERT INTO asistencia (usuario_id, actividad_id, tipo_asistencia, metodo_registro) VALUES
-- Asistencia general al congreso
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'ana.martinez@colegio1.edu'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'luis.fernandez@colegio4.edu'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'andres.torres@gmail.com'), NULL, 'general', 'qr'),
((SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), NULL, 'general', 'qr'),

-- Asistencia a actividades específicas
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 1, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 2, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 1, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 4, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 2, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 3, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'ana.martinez@colegio1.edu'), 1, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 1, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 3, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 2, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 4, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 1, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 2, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'andres.torres@gmail.com'), 3, 'actividad', 'qr'),
((SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), 4, 'actividad', 'qr');

-- Insertar diplomas de ejemplo
INSERT INTO diplomas (usuario_id, actividad_id, nombre_diploma, archivo_path, enviado_email) VALUES
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 1, 'Diploma de Participación - Introducción a Python', '/diplomas/juan_perez_python.pdf', true),
((SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 2, 'Diploma de Participación - Competencia de Programación', '/diplomas/juan_perez_competencia.pdf', true),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 1, 'Diploma de Participación - Introducción a Python', '/diplomas/maria_gonzalez_python.pdf', true),
((SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 4, 'Diploma de Participación - Machine Learning Básico', '/diplomas/maria_gonzalez_ml.pdf', false),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 2, 'Diploma de Participación - Competencia de Programación', '/diplomas/carlos_rodriguez_competencia.pdf', true),
((SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 3, 'Diploma de Participación - Robótica con Arduino', '/diplomas/carlos_rodriguez_robotica.pdf', true),
((SELECT id FROM usuarios WHERE email = 'ana.martinez@colegio1.edu'), 1, 'Diploma de Participación - Introducción a Python', '/diplomas/ana_martinez_python.pdf', true),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 1, 'Diploma de Participación - Introducción a Python', '/diplomas/sofia_ramirez_python.pdf', true),
((SELECT id FROM usuarios WHERE email = 'sofia.ramirez@gmail.com'), 3, 'Diploma de Participación - Robótica con Arduino', '/diplomas/sofia_ramirez_robotica.pdf', true),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 2, 'Diploma de Participación - Competencia de Programación', '/diplomas/diego_morales_competencia.pdf', true),
((SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 4, 'Diploma de Participación - Machine Learning Básico', '/diplomas/diego_morales_ml.pdf', true),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 1, 'Diploma de Participación - Introducción a Python', '/diplomas/valentina_silva_python.pdf', true),
((SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 2, 'Diploma de Participación - Competencia de Programación', '/diplomas/valentina_silva_competencia.pdf', true),
((SELECT id FROM usuarios WHERE email = 'andres.torres@gmail.com'), 3, 'Diploma de Participación - Robótica con Arduino', '/diplomas/andres_torres_robotica.pdf', true),
((SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), 4, 'Diploma de Participación - Machine Learning Básico', '/diplomas/camila_vargas_ml.pdf', true);

-- Insertar resultados de competencias de ejemplo
INSERT INTO resultados_competencia (actividad_id, usuario_id, posicion, puntuacion, descripcion_proyecto, foto_proyecto_path) VALUES
-- Competencia de Programación (actividad_id = 2)
(2, (SELECT id FROM usuarios WHERE email = 'diego.morales@gmail.com'), 1, 95.5, 'Sistema de gestión de inventarios con interfaz web moderna', '/fotos/diego_morales_proyecto1.jpg'),
(2, (SELECT id FROM usuarios WHERE email = 'valentina.silva@gmail.com'), 2, 92.0, 'Aplicación móvil para control de gastos personales', '/fotos/valentina_silva_proyecto1.jpg'),
(2, (SELECT id FROM usuarios WHERE email = 'carlos.rodriguez@colegio3.edu'), 3, 88.5, 'Plataforma de aprendizaje online con gamificación', '/fotos/carlos_rodriguez_proyecto1.jpg'),
(2, (SELECT id FROM usuarios WHERE email = 'juan.perez@colegio1.edu'), 4, 85.0, 'Sistema de reservas para restaurantes', '/fotos/juan_perez_proyecto1.jpg'),

-- Competencia de Gaming (actividad_id = 6)
(6, (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@colegio2.edu'), 1, 98.0, 'Juego de plataformas 2D con mecánicas innovadoras', '/fotos/maria_gonzalez_juego1.jpg'),
(6, (SELECT id FROM usuarios WHERE email = 'luis.fernandez@colegio4.edu'), 2, 94.5, 'Simulador de ciudad con elementos de estrategia', '/fotos/luis_fernandez_juego1.jpg'),
(6, (SELECT id FROM usuarios WHERE email = 'camila.vargas@gmail.com'), 3, 91.0, 'Puzzle game con física realista', '/fotos/camila_vargas_juego1.jpg');

-- Actualizar fechas de descarga de diplomas
UPDATE diplomas SET fecha_descarga = CURRENT_TIMESTAMP WHERE enviado_email = true;

-- Actualizar fechas de envío de email
UPDATE diplomas SET fecha_envio_email = CURRENT_TIMESTAMP WHERE enviado_email = true;
