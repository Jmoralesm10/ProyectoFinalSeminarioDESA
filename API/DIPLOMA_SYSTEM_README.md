# 🏆 Sistema de Diplomas - API

## 📋 Descripción

Sistema completo para la generación, gestión y envío automático de diplomas en el Congreso de Tecnología 2024. Permite generar diplomas especiales para ganadores de competencias y diplomas genéricos para participantes.

## 🎯 Características Principales

### ✅ **Generación de Diplomas**
- **Diplomas de Competencia**: Para 1°, 2° y 3° lugar
- **Diplomas de Participación**: Para el resto de asistentes
- **Diplomas del Congreso**: Participación general al congreso
- **Plantillas Personalizadas**: Diferentes plantillas por tipo de diploma

### ✅ **Gestión de Resultados**
- Registro de ganadores de competencias
- Validación de asistencia confirmada
- Puntuaciones y descripciones de proyectos
- Fotos de proyectos (opcional)

### ✅ **Envío Automático**
- Envío por correo electrónico automático
- Plantillas HTML personalizadas
- Adjuntos PDF de diplomas
- Seguimiento de estado de envío

### ✅ **Consultas y Reportes**
- Consulta de diplomas con filtros
- Estadísticas completas
- Reportes por actividad
- Historial de descargas

## 🏗️ Arquitectura

```
API/src/
├── types/diploma.types.ts          # Tipos TypeScript
├── repositories/diploma.repository.ts  # Acceso a datos
├── services/diploma.service.ts     # Lógica de negocio
├── controllers/diploma.controller.ts   # Controladores HTTP
├── routes/diploma.routes.ts        # Rutas de la API
└── services/email.service.ts       # Envío de emails (extendido)
```

## 🚀 Endpoints Disponibles

### 📊 **Resultados de Competencias**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `POST` | `/api/diplomas/competitions/:id/resultados` | Registrar ganadores | `gestionar_actividades` |
| `GET` | `/api/diplomas/competitions/:id/resultados` | Consultar resultados | `gestionar_actividades` |

### 🎓 **Generación de Diplomas**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `POST` | `/api/diplomas/activities/:id/generate` | Generar diplomas de actividad | `gestionar_actividades` |
| `POST` | `/api/diplomas/congreso/generate` | Generar diplomas del congreso | `gestionar_actividades` |

### 📋 **Consultas**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `GET` | `/api/diplomas` | Consultar diplomas con filtros | `gestionar_actividades` |
| `GET` | `/api/diplomas/stats` | Estadísticas de diplomas | `gestionar_actividades` |
| `GET` | `/api/diplomas/templates` | Plantillas disponibles | `gestionar_actividades` |
| `GET` | `/api/diplomas/user/:userId` | Diplomas de un usuario | `gestionar_actividades` |
| `GET` | `/api/diplomas/activity/:activityId` | Diplomas de una actividad | `gestionar_actividades` |

### 🔧 **Gestión**

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `PUT` | `/api/diplomas/:usuarioId/:actividadId/:tipoDiploma` | Actualizar diploma | `gestionar_actividades` |
| `PATCH` | `/api/diplomas/:usuarioId/:actividadId/:tipoDiploma/download` | Marcar como descargado | `gestionar_actividades` |
| `POST` | `/api/diplomas/:usuarioId/:actividadId/:tipoDiploma/resend` | Reenviar por email | `gestionar_actividades` |

## 💾 Base de Datos

### 📊 **Tablas Principales**

#### `tb_diplomas`
```sql
- id_usuario (UUID) - Usuario que recibe el diploma
- id_actividad (INTEGER) - Actividad (NULL para congreso general)
- tipo_diploma (VARCHAR) - 'participacion' | 'congreso_general'
- nombre_diploma (VARCHAR) - Nombre descriptivo del diploma
- plantilla_path_diploma (VARCHAR) - Ruta de la plantilla
- archivo_path_diploma (VARCHAR) - Ruta del archivo generado
- fecha_generacion_diploma (TIMESTAMP) - Fecha de generación
- fecha_descarga_diploma (TIMESTAMP) - Fecha de descarga
- enviado_email_diploma (BOOLEAN) - Estado de envío
- fecha_envio_email_diploma (TIMESTAMP) - Fecha de envío
- generado_por_usuario (UUID) - Administrador que generó
- observaciones_diploma (TEXT) - Observaciones adicionales
```

#### `tb_resultados_competencia`
```sql
- id_actividad (INTEGER) - ID de la competencia
- id_usuario (UUID) - Usuario ganador
- posicion_resultado (INTEGER) - 1, 2, o 3
- puntuacion_resultado (DECIMAL) - Puntuación obtenida
- descripcion_proyecto_resultado (TEXT) - Descripción del proyecto
- foto_proyecto_path_resultado (VARCHAR) - Ruta de la foto
- fecha_resultado (TIMESTAMP) - Fecha del resultado
- observaciones_resultado (TEXT) - Observaciones
```

### 🔧 **Stored Procedures**

- `sp_generar_diplomas_actividad()` - Genera diplomas para una actividad
- `sp_generar_diplomas_congreso()` - Genera diplomas del congreso
- `sp_registrar_resultados_competencia()` - Registra ganadores
- `sp_consultar_diplomas()` - Consulta diplomas con filtros

### 📊 **Vistas**

- `vista_diplomas_completa` - Información completa de diplomas
- `vista_resultados_competencia` - Resultados de competencias
- `vista_reporte_diplomas_actividad` - Reportes por actividad
- `vista_estadisticas_diplomas` - Estadísticas generales

## 🎨 Plantillas de Diplomas

### 📁 **Estructura de Plantillas**
```
/templates/
├── participacion_generica.pdf      # Participación general
├── primer_lugar.pdf               # Primer lugar
├── segundo_lugar.pdf              # Segundo lugar
├── tercer_lugar.pdf               # Tercer lugar
└── congreso_general.pdf           # Congreso general
```

### 🎯 **Tipos de Plantillas**
- **`participacion`**: Para participantes regulares
- **`primer_lugar`**: Para ganadores del primer lugar
- **`segundo_lugar`**: Para ganadores del segundo lugar
- **`tercer_lugar`**: Para ganadores del tercer lugar
- **`congreso_general`**: Para participación general al congreso

## 📧 Sistema de Emails

### ✉️ **Características**
- **Plantillas HTML**: Diseño profesional y responsivo
- **Adjuntos PDF**: Diplomas en formato PDF
- **Personalización**: Contenido específico por tipo de diploma
- **Seguimiento**: Estado de envío y fechas

### 🎨 **Plantillas de Email**
- **Asunto personalizado**: Según tipo de diploma y posición
- **Contenido dinámico**: Nombre, actividad, posición, fecha
- **Diseño profesional**: Gradientes, iconos, colores corporativos
- **Información de adjunto**: Instrucciones claras para el usuario

## 🔐 Seguridad y Permisos

### 🛡️ **Autenticación**
- **JWT Token**: Autenticación requerida para todos los endpoints
- **Middleware**: `authMiddleware.authenticateToken`

### 🔑 **Autorización**
- **Permiso requerido**: `gestionar_actividades`
- **Middleware**: `authMiddleware.requirePermission('gestionar_actividades')`

### ✅ **Validaciones**
- **Parámetros obligatorios**: Validación en controladores
- **Existencia de datos**: Verificación en stored procedures
- **Asistencia confirmada**: Solo diplomas para asistentes confirmados

## 🧪 Pruebas

### 🚀 **Script de Prueba**
```bash
# Ejecutar pruebas del sistema
node test-diploma-system.js
```

### 📋 **Casos de Prueba**
1. **Login y autenticación**
2. **Obtener plantillas disponibles**
3. **Consultar estadísticas**
4. **Registrar resultados de competencia**
5. **Generar diplomas de actividad**
6. **Generar diplomas del congreso**
7. **Consultar diplomas con filtros**
8. **Reenviar diplomas por email**

## 🔧 Configuración

### 🌐 **Variables de Entorno**
```env
# SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=congreso_tecnologia
DB_USER=tu-usuario
DB_PASS=tu-password
```

### 📁 **Directorios Requeridos**
```
API/
├── templates/          # Plantillas de diplomas PDF
├── generated/          # Diplomas generados
└── logs/              # Logs del sistema
```

## 🚀 Flujo de Trabajo

### 1️⃣ **Registrar Resultados**
```javascript
POST /api/diplomas/competitions/1/resultados
{
  "primer_lugar_usuario": "uuid-del-ganador",
  "puntuaciones": {
    "primer_lugar": 95.5
  },
  "descripciones_proyectos": {
    "primer_lugar": "Descripción del proyecto ganador"
  }
}
```

### 2️⃣ **Generar Diplomas**
```javascript
POST /api/diplomas/activities/1/generate
{
  "incluir_participacion": true,
  "plantilla_participacion": "/templates/participacion_generica.pdf"
}
```

### 3️⃣ **Envío Automático**
- Los diplomas se envían automáticamente por email
- Se actualiza el estado de envío en la base de datos
- Se registra la fecha de envío

### 4️⃣ **Seguimiento**
```javascript
GET /api/diplomas/stats
// Retorna estadísticas completas de diplomas
```

## 🎯 Próximos Pasos

### 📋 **Implementación Pendiente**
1. **Generación de PDFs**: Integrar librería para generar diplomas PDF
2. **Plantillas reales**: Crear plantillas de diplomas profesionales
3. **Sistema de archivos**: Configurar almacenamiento de archivos
4. **Pruebas con datos reales**: Validar con datos de producción

### 🔧 **Mejoras Futuras**
1. **Plantillas dinámicas**: Editor de plantillas en el frontend
2. **Firmas digitales**: Integración con certificados digitales
3. **Verificación**: Sistema de verificación de diplomas
4. **Analytics**: Dashboard de métricas de diplomas

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema de diplomas, contactar al equipo de desarrollo del Congreso de Tecnología 2024.

---

**© 2024 Congreso de Tecnología. Sistema de Diplomas v1.0.0**
