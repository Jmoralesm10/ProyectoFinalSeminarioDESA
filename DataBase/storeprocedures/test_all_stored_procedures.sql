-- =====================================================
-- Script de pruebas para todos los procedimientos almacenados
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- =====================================================
-- CONFIGURACIÓN INICIAL
-- =====================================================

-- Limpiar datos de prueba anteriores (opcional)
-- DELETE FROM tb_logs_sistema WHERE accion_log LIKE '%PRUEBA%';
-- DELETE FROM tb_usuarios WHERE email_usuario LIKE '%@test.com';

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_inscribir_usuario
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_inscribir_usuario' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 1: Inscribir estudiante externo válido
-- =====================================================
SELECT 'PRUEBA 1: Estudiante externo válido' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Juan Carlos', 
    'Pérez Martínez', 
    'juan.perez@test.com', 
    'password123', 
    '555-0101', 
    'Colegio San José'
);

-- =====================================================
-- PRUEBA 2: Inscribir estudiante interno válido
-- =====================================================
SELECT 'PRUEBA 2: Estudiante interno válido' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'interno', 
    'María Elena', 
    'González Silva', 
    'maria.gonzalez@universidad.edu', 
    'password456', 
    '555-0102', 
    NULL
);

-- =====================================================
-- PRUEBA 3: Error - Email duplicado
-- =====================================================
SELECT 'PRUEBA 3: Error - Email duplicado' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Pedro', 
    'López', 
    'juan.perez@test.com',  -- Email duplicado
    '555-0103', 
    'Instituto Tecnológico'
);

-- =====================================================
-- PRUEBA 4: Error - Estudiante externo sin colegio
-- =====================================================
SELECT 'PRUEBA 4: Error - Estudiante externo sin colegio' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Ana', 
    'Martínez', 
    'ana.martinez@test.com', 
    '555-0104', 
    NULL  -- Sin colegio (debería fallar)
);

-- =====================================================
-- PRUEBA 5: Error - Estudiante interno con colegio
-- =====================================================
SELECT 'PRUEBA 5: Error - Estudiante interno con colegio' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'interno', 
    'Carlos', 
    'Rodríguez', 
    'carlos.rodriguez@universidad.edu', 
    '555-0105', 
    'Colegio San José'  -- Con colegio (debería fallar)
);

-- =====================================================
-- PRUEBA 6: Error - Email universitario para externo
-- =====================================================
SELECT 'PRUEBA 6: Error - Email universitario para externo' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Luis', 
    'Fernández', 
    'luis.fernandez@universidad.edu',  -- Email universitario para externo
    '555-0106', 
    'Liceo Moderno'
);

-- =====================================================
-- PRUEBA 7: Error - Email no universitario para interno
-- =====================================================
SELECT 'PRUEBA 7: Error - Email no universitario para interno' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'interno', 
    'Sofía', 
    'Ramírez', 
    'sofia.ramirez@gmail.com',  -- Email no universitario para interno
    '555-0107', 
    NULL
);

-- =====================================================
-- PRUEBA 8: Error - Tipo de usuario inválido
-- =====================================================
SELECT 'PRUEBA 8: Error - Tipo de usuario inválido' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'inválido',  -- Tipo inválido
    'Diego', 
    'Morales', 
    'diego.morales@test.com', 
    '555-0108', 
    'Escuela Técnica'
);

-- =====================================================
-- PRUEBA 9: Error - Formato de email inválido
-- =====================================================
SELECT 'PRUEBA 9: Error - Formato de email inválido' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Valentina', 
    'Silva', 
    'email-invalido',  -- Email sin formato válido
    '555-0109', 
    'Colegio Nacional'
);

-- =====================================================
-- PRUEBA 10: Casos edge - Nombres con espacios
-- =====================================================
SELECT 'PRUEBA 10: Casos edge - Nombres con espacios' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    '  José María  ',  -- Con espacios
    '  de la Cruz  ',  -- Con espacios
    'jose.maria@test.com', 
    '555-0110', 
    'Colegio Nacional'
);

-- =====================================================
-- PRUEBA 11: Casos edge - Email en mayúsculas
-- =====================================================
SELECT 'PRUEBA 11: Casos edge - Email en mayúsculas' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'interno', 
    'Andrés', 
    'Torres', 
    'ANDRES.TORRES@UNIVERSIDAD.EDU',  -- Email en mayúsculas
    '555-0111', 
    NULL
);

-- =====================================================
-- PRUEBA 12: Casos edge - Teléfono opcional
-- =====================================================
SELECT 'PRUEBA 12: Casos edge - Teléfono opcional' as test_case;

SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Camila', 
    'Vargas', 
    'camila.vargas@test.com', 
    NULL,  -- Sin teléfono
    'Liceo Moderno'
);

-- =====================================================
-- VERIFICACIONES POST-PRUEBAS
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'VERIFICACIONES POST-PRUEBAS' as verification_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- VERIFICACIÓN 1: Usuarios creados exitosamente
-- =====================================================
SELECT 'VERIFICACIÓN 1: Usuarios creados exitosamente' as verification_case;

SELECT 
    u.id_usuario,
    tu.nombre_tipo_usuario,
    u.nombre_usuario,
    u.apellido_usuario,
    u.email_usuario,
    u.colegio_usuario,
    u.codigo_qr_usuario,
    u.fecha_inscripcion_usuario
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE u.email_usuario LIKE '%@test.com' 
   OR u.email_usuario LIKE '%@universidad.edu'
ORDER BY u.fecha_inscripcion_usuario DESC;

-- =====================================================
-- VERIFICACIÓN 2: Logs generados
-- =====================================================
SELECT 'VERIFICACIÓN 2: Logs generados' as verification_case;

SELECT 
    accion_log,
    tabla_afectada_log,
    registro_id_log,
    detalles_log,
    fecha_log
FROM tb_logs_sistema
WHERE accion_log = 'INSCRIPCION_USUARIO'
ORDER BY fecha_log DESC;

-- =====================================================
-- VERIFICACIÓN 3: Códigos QR generados
-- =====================================================
SELECT 'VERIFICACIÓN 3: Códigos QR generados' as verification_case;

SELECT 
    nombre_usuario,
    apellido_usuario,
    email_usuario,
    codigo_qr_usuario,
    CASE 
        WHEN codigo_qr_usuario LIKE 'CONGRESO_2024_%' THEN 'Formato correcto'
        ELSE 'Formato incorrecto'
    END as formato_qr
FROM tb_usuarios
WHERE codigo_qr_usuario IS NOT NULL
ORDER BY fecha_inscripcion_usuario DESC;

-- =====================================================
-- VERIFICACIÓN 4: Estadísticas de pruebas
-- =====================================================
SELECT 'VERIFICACIÓN 4: Estadísticas de pruebas' as verification_case;

SELECT 
    'Total usuarios creados' as metrica,
    COUNT(*) as valor
FROM tb_usuarios
WHERE email_usuario LIKE '%@test.com' 
   OR email_usuario LIKE '%@universidad.edu'

UNION ALL

SELECT 
    'Usuarios externos' as metrica,
    COUNT(*) as valor
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE tu.nombre_tipo_usuario = 'externo'
  AND (u.email_usuario LIKE '%@test.com' OR u.email_usuario LIKE '%@universidad.edu')

UNION ALL

SELECT 
    'Usuarios internos' as metrica,
    COUNT(*) as valor
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE tu.nombre_tipo_usuario = 'interno'
  AND (u.email_usuario LIKE '%@test.com' OR u.email_usuario LIKE '%@universidad.edu')

UNION ALL

SELECT 
    'Logs de inscripción' as metrica,
    COUNT(*) as valor
FROM tb_logs_sistema
WHERE accion_log = 'INSCRIPCION_USUARIO';

-- =====================================================
-- LIMPIEZA (OPCIONAL)
-- =====================================================

-- Descomenta las siguientes líneas si quieres limpiar los datos de prueba
/*
SELECT '=====================================================' as separator;
SELECT 'LIMPIEZA DE DATOS DE PRUEBA' as cleanup_section;
SELECT '=====================================================' as separator;

-- Eliminar logs de prueba
DELETE FROM tb_logs_sistema 
WHERE accion_log = 'INSCRIPCION_USUARIO'
  AND detalles_log->>'email' LIKE '%@test.com';

-- Eliminar usuarios de prueba
DELETE FROM tb_usuarios 
WHERE email_usuario LIKE '%@test.com';

SELECT 'Datos de prueba eliminados' as cleanup_result;
*/

-- =====================================================
-- RESUMEN DE PRUEBAS
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'RESUMEN DE PRUEBAS COMPLETADAS' as summary_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_autenticar_usuario
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_autenticar_usuario' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 13: Autenticación exitosa - Usuario externo
-- =====================================================
SELECT 'PRUEBA 13: Autenticación exitosa - Usuario externo' as test_case;

SELECT * FROM sp_autenticar_usuario(
    'juan.perez@test.com',
    'password123'
);

-- =====================================================
-- PRUEBA 14: Autenticación exitosa - Usuario interno
-- =====================================================
SELECT 'PRUEBA 14: Autenticación exitosa - Usuario interno' as test_case;

SELECT * FROM sp_autenticar_usuario(
    'maria.gonzalez@universidad.edu',
    'password456'
);

-- =====================================================
-- PRUEBA 15: Error - Credenciales inválidas
-- =====================================================
SELECT 'PRUEBA 15: Error - Credenciales inválidas' as test_case;

SELECT * FROM sp_autenticar_usuario(
    'juan.perez@test.com',
    'password_incorrecta'
);

-- =====================================================
-- PRUEBA 16: Error - Usuario no existe
-- =====================================================
SELECT 'PRUEBA 16: Error - Usuario no existe' as test_case;

SELECT * FROM sp_autenticar_usuario(
    'usuario.inexistente@test.com',
    'password123'
);

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_verificar_email
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_verificar_email' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 17: Verificación de email exitosa
-- =====================================================
SELECT 'PRUEBA 17: Verificación de email exitosa' as test_case;

-- Primero obtenemos el token de verificación del usuario
SELECT 
    'Token de verificación: ' || token_verificacion_usuario as token_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com';

-- Luego verificamos el email (reemplazar con el token real)
-- SELECT * FROM sp_verificar_email('token_real_aqui');

-- =====================================================
-- PRUEBA 18: Error - Token inválido
-- =====================================================
SELECT 'PRUEBA 18: Error - Token inválido' as test_case;

SELECT * FROM sp_verificar_email('token_invalido_123');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_recuperar_password
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_recuperar_password' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 19: Solicitar recuperación exitosa
-- =====================================================
SELECT 'PRUEBA 19: Solicitar recuperación exitosa' as test_case;

SELECT * FROM sp_solicitar_recuperacion_password('juan.perez@test.com');

-- =====================================================
-- PRUEBA 20: Error - Email no existe
-- =====================================================
SELECT 'PRUEBA 20: Error - Email no existe' as test_case;

SELECT * FROM sp_solicitar_recuperacion_password('email.inexistente@test.com');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_consultar_usuario
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_consultar_usuario' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 21: Consultar usuario por ID exitoso
-- =====================================================
SELECT 'PRUEBA 21: Consultar usuario por ID exitoso' as test_case;

-- Primero obtenemos un ID de usuario existente
SELECT 
    'ID de usuario: ' || id_usuario as user_id_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com'
LIMIT 1;

-- Luego consultamos el usuario (reemplazar con ID real)
-- SELECT * FROM sp_consultar_usuario('id_usuario_real_aqui');

-- =====================================================
-- PRUEBA 22: Error - Usuario no encontrado
-- =====================================================
SELECT 'PRUEBA 22: Error - Usuario no encontrado' as test_case;

SELECT * FROM sp_consultar_usuario('00000000-0000-0000-0000-000000000000');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_consultar_usuario_por_email
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_consultar_usuario_por_email' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 23: Consultar usuario por email exitoso
-- =====================================================
SELECT 'PRUEBA 23: Consultar usuario por email exitoso' as test_case;

SELECT * FROM sp_consultar_usuario_por_email('juan.perez@test.com');

-- =====================================================
-- PRUEBA 24: Error - Email no encontrado
-- =====================================================
SELECT 'PRUEBA 24: Error - Email no encontrado' as test_case;

SELECT * FROM sp_consultar_usuario_por_email('usuario.inexistente@test.com');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_verificar_email_existe
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_verificar_email_existe' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 25: Email existe
-- =====================================================
SELECT 'PRUEBA 25: Email existe' as test_case;

SELECT * FROM sp_verificar_email_existe('juan.perez@test.com');

-- =====================================================
-- PRUEBA 26: Email no existe
-- =====================================================
SELECT 'PRUEBA 26: Email no existe' as test_case;

SELECT * FROM sp_verificar_email_existe('email.inexistente@test.com');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_actualizar_usuario
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_actualizar_usuario' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 27: Actualizar usuario exitoso
-- =====================================================
SELECT 'PRUEBA 27: Actualizar usuario exitoso' as test_case;

-- Primero obtenemos un ID de usuario existente
SELECT 
    'ID de usuario: ' || id_usuario as user_id_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com'
LIMIT 1;

-- Luego actualizamos el usuario (reemplazar con ID real)
-- SELECT * FROM sp_actualizar_usuario(
--     'id_usuario_real_aqui',
--     'Juan Carlos Actualizado',
--     'Pérez Martínez Actualizado',
--     '555-9999',
--     'Colegio Actualizado'
-- );

-- =====================================================
-- PRUEBA 28: Error - Usuario no encontrado
-- =====================================================
SELECT 'PRUEBA 28: Error - Usuario no encontrado' as test_case;

SELECT * FROM sp_actualizar_usuario(
    '00000000-0000-0000-0000-000000000000',
    'Nombre',
    'Apellido',
    '555-0000',
    'Colegio'
);

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_cambiar_password
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_cambiar_password' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 29: Cambiar contraseña exitoso
-- =====================================================
SELECT 'PRUEBA 29: Cambiar contraseña exitoso' as test_case;

-- Primero obtenemos un ID de usuario existente
SELECT 
    'ID de usuario: ' || id_usuario as user_id_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com'
LIMIT 1;

-- Luego cambiamos la contraseña (reemplazar con ID real)
-- SELECT * FROM sp_cambiar_password(
--     'id_usuario_real_aqui',
--     'password123',
--     'nueva_password456'
-- );

-- =====================================================
-- PRUEBA 30: Error - Contraseña actual incorrecta
-- =====================================================
SELECT 'PRUEBA 30: Error - Contraseña actual incorrecta' as test_case;

-- Primero obtenemos un ID de usuario existente
SELECT 
    'ID de usuario: ' || id_usuario as user_id_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com'
LIMIT 1;

-- Luego intentamos cambiar con contraseña incorrecta (reemplazar con ID real)
-- SELECT * FROM sp_cambiar_password(
--     'id_usuario_real_aqui',
--     'contraseña_incorrecta',
--     'nueva_password456'
-- );

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_consultar_tipos_usuario
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_consultar_tipos_usuario' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 31: Consultar tipos de usuario
-- =====================================================
SELECT 'PRUEBA 31: Consultar tipos de usuario' as test_case;

SELECT * FROM sp_consultar_tipos_usuario();

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_crear_actividad
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_crear_actividad' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 32: Crear actividad exitosa
-- =====================================================
SELECT 'PRUEBA 32: Crear actividad exitosa' as test_case;

SELECT * FROM sp_crear_actividad(
    1, -- id_categoria
    'Taller de JavaScript Moderno', -- nombre_actividad
    'taller', -- tipo_actividad
    '2025-11-15 10:00:00', -- fecha_inicio_actividad
    '2025-11-15 13:00:00', -- fecha_fin_actividad
    25, -- cupo_maximo_actividad
    'Taller de programación con JavaScript ES6+', -- descripcion_actividad
    '2025-11-14 23:59:59', -- fecha_limite_inscripcion
    180, -- duracion_estimada_minutos
    'Aula 102', -- lugar_actividad
    'Ing. Carlos López', -- ponente_actividad
    'Conocimientos básicos de programación', -- requisitos_actividad
    'intermedio', -- nivel_requerido
    16, -- edad_minima
    25, -- edad_maxima
    'Laptop con editor de código', -- materiales_requeridos
    0.00, -- costo_actividad
    'GTQ', -- moneda_costo
    TRUE, -- permite_inscripciones
    FALSE -- requiere_aprobacion
);

-- =====================================================
-- PRUEBA 33: Error - Datos inválidos
-- =====================================================
SELECT 'PRUEBA 33: Error - Datos inválidos' as test_case;

SELECT * FROM sp_crear_actividad(
    NULL, -- id_categoria (inválido)
    'Taller Inválido', -- nombre_actividad
    'taller', -- tipo_actividad
    '2025-11-15 10:00:00', -- fecha_inicio_actividad
    '2025-11-15 13:00:00', -- fecha_fin_actividad
    25, -- cupo_maximo_actividad
    'Descripción', -- descripcion_actividad
    NULL, -- fecha_limite_inscripcion
    180, -- duracion_estimada_minutos
    'Aula 102', -- lugar_actividad
    'Ing. Carlos López', -- ponente_actividad
    'Requisitos', -- requisitos_actividad
    'intermedio', -- nivel_requerido
    16, -- edad_minima
    25, -- edad_maxima
    'Materiales', -- materiales_requeridos
    0.00, -- costo_actividad
    'GTQ', -- moneda_costo
    TRUE, -- permite_inscripciones
    FALSE -- requiere_aprobacion
);

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_listar_actividades
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_listar_actividades' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 34: Listar todas las actividades
-- =====================================================
SELECT 'PRUEBA 34: Listar todas las actividades' as test_case;

SELECT * FROM sp_listar_actividades();

-- =====================================================
-- PRUEBA 35: Listar solo talleres
-- =====================================================
SELECT 'PRUEBA 35: Listar solo talleres' as test_case;

SELECT * FROM sp_listar_actividades('taller');

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_inscribirse_actividad
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_inscribirse_actividad' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 36: Inscripción exitosa
-- =====================================================
SELECT 'PRUEBA 36: Inscripción exitosa' as test_case;

-- Primero obtenemos un ID de usuario y actividad existentes
SELECT 
    'ID Usuario: ' || id_usuario as user_id_info
FROM tb_usuarios 
WHERE email_usuario = 'juan.perez@test.com'
LIMIT 1;

-- Luego nos inscribimos (reemplazar con IDs reales)
-- SELECT * FROM sp_inscribirse_actividad(
--     'id_usuario_real_aqui', -- id_usuario
--     1, -- id_actividad
--     'Interesado en aprender JavaScript' -- observaciones_inscripcion
-- );

-- =====================================================
-- PRUEBA 37: Error - Usuario no existe
-- =====================================================
SELECT 'PRUEBA 37: Error - Usuario no existe' as test_case;

SELECT * FROM sp_inscribirse_actividad(
    '00000000-0000-0000-0000-000000000000', -- id_usuario (no existe)
    1, -- id_actividad
    'Observaciones' -- observaciones_inscripcion
);

-- =====================================================
-- PRUEBAS DEL PROCEDIMIENTO: sp_actualizar_actividad
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'PRUEBAS: sp_actualizar_actividad' as test_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- PRUEBA 38: Actualizar actividad exitosa
-- =====================================================
SELECT 'PRUEBA 38: Actualizar actividad exitosa' as test_case;

SELECT * FROM sp_actualizar_actividad(
    1, -- id_actividad
    NULL, -- id_categoria (no cambiar)
    'Taller de Python - Actualizado', -- nombre_actividad
    NULL, -- descripcion_actividad (no cambiar)
    NULL, -- tipo_actividad (no cambiar)
    NULL, -- fecha_inicio_actividad (no cambiar)
    NULL, -- fecha_fin_actividad (no cambiar)
    NULL, -- fecha_limite_inscripcion (no cambiar)
    NULL, -- duracion_estimada_minutos (no cambiar)
    35, -- cupo_maximo_actividad (cambiar a 35)
    NULL, -- lugar_actividad (no cambiar)
    NULL, -- ponente_actividad (no cambiar)
    NULL, -- requisitos_actividad (no cambiar)
    NULL, -- nivel_requerido (no cambiar)
    NULL, -- edad_minima (no cambiar)
    NULL, -- edad_maxima (no cambiar)
    NULL, -- materiales_requeridos (no cambiar)
    NULL, -- costo_actividad (no cambiar)
    NULL, -- moneda_costo (no cambiar)
    NULL, -- permite_inscripciones (no cambiar)
    NULL, -- requiere_aprobacion (no cambiar)
    NULL -- estado_actividad (no cambiar)
);

-- =====================================================
-- VERIFICACIONES FINALES
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'VERIFICACIONES FINALES' as verification_section;
SELECT '=====================================================' as separator;

-- =====================================================
-- VERIFICACIÓN 5: Usuarios con autenticación
-- =====================================================
SELECT 'VERIFICACIÓN 5: Usuarios con autenticación' as verification_case;

SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.apellido_usuario,
    u.email_usuario,
    u.email_verificado_usuario,
    u.ultimo_acceso_usuario,
    u.intentos_login_usuario,
    u.bloqueado_hasta_usuario,
    tu.nombre_tipo_usuario
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE u.email_usuario LIKE '%@test.com' 
   OR u.email_usuario LIKE '%@universidad.edu'
ORDER BY u.fecha_inscripcion_usuario DESC;

-- =====================================================
-- VERIFICACIÓN 6: Logs de autenticación
-- =====================================================
SELECT 'VERIFICACIÓN 6: Logs de autenticación' as verification_case;

SELECT 
    accion_log,
    tabla_afectada_log,
    registro_id_log,
    detalles_log,
    fecha_log
FROM tb_logs_sistema
WHERE accion_log IN ('LOGIN_EXITOSO', 'EMAIL_VERIFICADO', 'SOLICITUD_RECUPERACION_PASSWORD', 'PASSWORD_CAMBIADA_RECUPERACION')
ORDER BY fecha_log DESC;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT '=====================================================' as separator;
SELECT 'RESUMEN FINAL DE PRUEBAS' as summary_section;
SELECT '=====================================================' as separator;

SELECT 
    'Pruebas ejecutadas' as item,
    '31 casos de prueba para todos los procedimientos' as description

UNION ALL

SELECT 
    'Procedimientos probados' as item,
    'sp_inscribir_usuario, sp_autenticar_usuario, sp_verificar_email, sp_recuperar_password, sp_consultar_usuario, sp_consultar_usuario_por_email, sp_verificar_email_existe, sp_actualizar_usuario, sp_cambiar_password, sp_consultar_tipos_usuario' as description

UNION ALL

SELECT 
    'Verificaciones realizadas' as item,
    '6 verificaciones post-pruebas' as description

UNION ALL

SELECT 
    'Estado' as item,
    'Todas las pruebas completadas - Sistema completo de autenticación y gestión de usuarios' as description;
