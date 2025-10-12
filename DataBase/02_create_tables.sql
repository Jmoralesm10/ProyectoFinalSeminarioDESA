-- =====================================================
-- Script de creación de tablas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Tabla de tipos de usuario
DROP TABLE IF EXISTS tb_tipos_usuario CASCADE;
CREATE TABLE tb_tipos_usuario (
    id_tipo_usuario SERIAL PRIMARY KEY,
    nombre_tipo_usuario VARCHAR(50) NOT NULL UNIQUE,
    descripcion_tipo_usuario TEXT,
    estado_tipo_usuario BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (estudiantes externos e internos)
DROP TABLE IF EXISTS tb_usuarios CASCADE;
CREATE TABLE tb_usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_tipo_usuario INTEGER NOT NULL REFERENCES tb_tipos_usuario(id_tipo_usuario),
    nombre_usuario VARCHAR(100) NOT NULL,
    apellido_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(255) NOT NULL UNIQUE,
    password_hash_usuario VARCHAR(255) NOT NULL, -- Contraseña cifrada
    telefono_usuario VARCHAR(20),
    colegio_usuario VARCHAR(200), -- Solo para estudiantes externos (NULL para internos)
    codigo_qr_usuario VARCHAR(500) UNIQUE, -- Código QR generado automáticamente
    email_verificado_usuario BOOLEAN DEFAULT FALSE, -- Email verificado
    token_verificacion_usuario VARCHAR(500), -- Token para verificar email
    token_recuperacion_usuario VARCHAR(500), -- Token para recuperar contraseña
    fecha_expiracion_token_usuario TIMESTAMP, -- Fecha de expiración del token
    ultimo_acceso_usuario TIMESTAMP, -- Último acceso al sistema
    intentos_login_usuario INTEGER DEFAULT 0, -- Intentos fallidos de login
    bloqueado_hasta_usuario TIMESTAMP, -- Bloqueo temporal por intentos fallidos
    estado_usuario BOOLEAN DEFAULT TRUE,
    fecha_inscripcion_usuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion_usuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de actividades
DROP TABLE IF EXISTS tb_categorias_actividad CASCADE;
CREATE TABLE tb_categorias_actividad (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion_categoria TEXT,
    estado_categoria BOOLEAN DEFAULT TRUE,
    fecha_creacion_categoria TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actividades (talleres y competencias)
DROP TABLE IF EXISTS tb_actividades CASCADE;
CREATE TABLE tb_actividades (
    id_actividad SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES tb_categorias_actividad(id_categoria),
    nombre_actividad VARCHAR(200) NOT NULL,
    descripcion_actividad TEXT,
    tipo_actividad VARCHAR(50) NOT NULL CHECK (tipo_actividad IN ('taller', 'competencia')),
    
    -- Fechas y horarios
    fecha_inicio_actividad TIMESTAMP NOT NULL,
    fecha_fin_actividad TIMESTAMP NOT NULL,
    fecha_limite_inscripcion TIMESTAMP, -- Límite para inscribirse
    duracion_estimada_minutos INTEGER, -- Duración en minutos
    
    -- Cupos (solo máximo, calcular disponible dinámicamente)
    cupo_maximo_actividad INTEGER NOT NULL DEFAULT 0,
    
    -- Ubicación y ponente
    lugar_actividad VARCHAR(200),
    ponente_actividad VARCHAR(200),
    
    -- Requisitos y restricciones
    requisitos_actividad TEXT,
    nivel_requerido VARCHAR(20) CHECK (nivel_requerido IN ('basico', 'intermedio', 'avanzado')),
    edad_minima INTEGER DEFAULT 0,
    edad_maxima INTEGER,
    materiales_requeridos TEXT,
    
    -- Costo
    costo_actividad DECIMAL(10,2) DEFAULT 0.00, -- 0 = gratis
    moneda_costo VARCHAR(3) DEFAULT 'GTQ',
    
    -- Estado y control
    estado_actividad BOOLEAN DEFAULT TRUE,
    permite_inscripciones BOOLEAN DEFAULT TRUE, -- Control de inscripciones
    requiere_aprobacion BOOLEAN DEFAULT FALSE, -- Inscripciones pendientes de aprobación
    
    -- Auditoría
    fecha_creacion_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT chk_fechas_validas CHECK (fecha_fin_actividad > fecha_inicio_actividad),
    CONSTRAINT chk_cupo_positivo CHECK (cupo_maximo_actividad >= 0),
    CONSTRAINT chk_edad_valida CHECK (edad_maxima IS NULL OR edad_maxima >= edad_minima)
);

-- Tabla de inscripciones a actividades
DROP TABLE IF EXISTS tb_inscripciones_actividad CASCADE;
CREATE TABLE tb_inscripciones_actividad (
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    id_actividad INTEGER NOT NULL REFERENCES tb_actividades(id_actividad),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_inscripcion VARCHAR(20) DEFAULT 'confirmada' CHECK (estado_inscripcion IN ('confirmada', 'cancelada', 'en_espera')),
    observaciones_inscripcion TEXT,
    PRIMARY KEY (id_usuario, id_actividad)
);

-- Tabla de asistencia
DROP TABLE IF EXISTS tb_asistencia CASCADE;
CREATE TABLE tb_asistencia (
    id_asistencia UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    id_actividad INTEGER REFERENCES tb_actividades(id_actividad), -- NULL para asistencia general al congreso
    fecha_asistencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_asistencia VARCHAR(50) NOT NULL CHECK (tipo_asistencia IN ('general', 'actividad')),
    metodo_registro_asistencia VARCHAR(50) DEFAULT 'qr' CHECK (metodo_registro_asistencia IN ('qr', 'manual', 'lista')),
    observaciones_asistencia TEXT
);

-- Tabla de diplomas
DROP TABLE IF EXISTS tb_diplomas CASCADE;
CREATE TABLE tb_diplomas (
    id_diploma UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    id_actividad INTEGER REFERENCES tb_actividades(id_actividad),
    nombre_diploma VARCHAR(200) NOT NULL,
    plantilla_path_diploma VARCHAR(500),
    archivo_path_diploma VARCHAR(500),
    fecha_generacion_diploma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_descarga_diploma TIMESTAMP,
    enviado_email_diploma BOOLEAN DEFAULT FALSE,
    fecha_envio_email_diploma TIMESTAMP
);

-- Tabla de resultados de competencias
DROP TABLE IF EXISTS tb_resultados_competencia CASCADE;
CREATE TABLE tb_resultados_competencia (
    id_resultado UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_actividad INTEGER NOT NULL REFERENCES tb_actividades(id_actividad),
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    posicion_resultado INTEGER NOT NULL CHECK (posicion_resultado > 0),
    puntuacion_resultado DECIMAL(10,2),
    descripcion_proyecto_resultado TEXT,
    foto_proyecto_path_resultado VARCHAR(500),
    fecha_resultado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones_resultado TEXT
);

-- Tabla de FAQ (Preguntas Frecuentes)
DROP TABLE IF EXISTS tb_faq CASCADE;
CREATE TABLE tb_faq (
    id_faq SERIAL PRIMARY KEY,
    pregunta_faq TEXT NOT NULL,
    respuesta_faq TEXT NOT NULL,
    categoria_faq VARCHAR(100),
    orden_faq INTEGER DEFAULT 0,
    estado_faq BOOLEAN DEFAULT TRUE,
    fecha_creacion_faq TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion_faq TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de información del congreso
DROP TABLE IF EXISTS tb_informacion_congreso CASCADE;
CREATE TABLE tb_informacion_congreso (
    id_informacion SERIAL PRIMARY KEY,
    titulo_informacion VARCHAR(200) NOT NULL,
    descripcion_informacion TEXT,
    fecha_inicio_informacion DATE,
    fecha_fin_informacion DATE,
    lugar_informacion VARCHAR(200),
    agenda_informacion TEXT,
    ponentes_invitados_informacion TEXT,
    informacion_carrera_informacion TEXT,
    estado_informacion BOOLEAN DEFAULT TRUE,
    fecha_creacion_informacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion_informacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de administradores del sistema
DROP TABLE IF EXISTS tb_administradores CASCADE;
CREATE TABLE tb_administradores (
    id_administrador UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_administrador VARCHAR(100) NOT NULL,
    apellido_administrador VARCHAR(100) NOT NULL,
    email_administrador VARCHAR(255) NOT NULL UNIQUE,
    password_hash_administrador VARCHAR(255) NOT NULL,
    rol_administrador VARCHAR(50) DEFAULT 'admin' CHECK (rol_administrador IN ('admin', 'super_admin')),
    estado_administrador BOOLEAN DEFAULT TRUE,
    ultimo_acceso_administrador TIMESTAMP,
    fecha_creacion_administrador TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs del sistema
DROP TABLE IF EXISTS tb_logs_sistema CASCADE;
CREATE TABLE tb_logs_sistema (
    id_log UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES tb_usuarios(id_usuario),
    id_administrador UUID REFERENCES tb_administradores(id_administrador),
    accion_log VARCHAR(100) NOT NULL,
    tabla_afectada_log VARCHAR(100),
    registro_id_log VARCHAR(100),
    detalles_log JSONB,
    ip_address_log INET,
    user_agent_log TEXT,
    fecha_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de las tablas
COMMENT ON TABLE tb_tipos_usuario IS 'Tipos de usuario: externo, interno';
COMMENT ON TABLE tb_usuarios IS 'Usuarios del sistema (estudiantes externos e internos)';
COMMENT ON TABLE tb_categorias_actividad IS 'Categorías para clasificar las actividades';
COMMENT ON TABLE tb_actividades IS 'Talleres y competencias del congreso';
COMMENT ON TABLE tb_inscripciones_actividad IS 'Inscripciones de usuarios a actividades';
COMMENT ON TABLE tb_asistencia IS 'Registro de asistencia de usuarios';
COMMENT ON TABLE tb_diplomas IS 'Diplomas generados para los participantes';
COMMENT ON TABLE tb_resultados_competencia IS 'Resultados y ganadores de competencias';
COMMENT ON TABLE tb_faq IS 'Preguntas frecuentes del sistema';
COMMENT ON TABLE tb_informacion_congreso IS 'Información general del congreso';
COMMENT ON TABLE tb_administradores IS 'Administradores del sistema';
COMMENT ON TABLE tb_logs_sistema IS 'Logs de actividades del sistema';
