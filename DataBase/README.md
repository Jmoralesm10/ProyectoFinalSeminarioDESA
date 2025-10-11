# Base de Datos - Sistema de Gestión del Congreso de Tecnología

## Descripción
Este directorio contiene todos los scripts SQL necesarios para crear y configurar la base de datos PostgreSQL del Sistema de Gestión del Congreso de Tecnología.

## Estructura de Archivos

### Scripts de Creación
- **01_create_database.sql** - Creación de la base de datos y extensiones
- **02_create_tables.sql** - Creación de todas las tablas del sistema
- **03_create_indexes.sql** - Creación de índices para optimización
- **04_create_triggers.sql** - Triggers y funciones automáticas
- **05_insert_initial_data.sql** - Datos iniciales del sistema
- **06_create_views.sql** - Vistas para consultas complejas
- **07_create_functions.sql** - Funciones personalizadas
- **08_sample_data.sql** - Datos de ejemplo para testing
- **09_create_roles_permissions.sql** - Roles y permisos de seguridad
- **10_backup_restore.sql** - Funciones de respaldo y mantenimiento

## Instalación

### Prerrequisitos
- PostgreSQL 12 o superior
- Extensión `uuid-ossp` habilitada
- Extensión `pgcrypto` habilitada

### Pasos de Instalación

1. **Crear la base de datos:**
   ```bash
   psql -U postgres -f 01_create_database.sql
   ```

2. **Crear las tablas:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 02_create_tables.sql
   ```

3. **Crear índices:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 03_create_indexes.sql
   ```

4. **Crear triggers:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 04_create_triggers.sql
   ```

5. **Insertar datos iniciales:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 05_insert_initial_data.sql
   ```

6. **Crear vistas:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 06_create_views.sql
   ```

7. **Crear funciones:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 07_create_functions.sql
   ```

8. **Insertar datos de ejemplo (opcional):**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 08_sample_data.sql
   ```

9. **Configurar roles y permisos:**
   ```bash
   psql -U postgres -d congreso_tecnologia -f 09_create_roles_permissions.sql
   ```

10. **Configurar respaldos:**
    ```bash
    psql -U postgres -d congreso_tecnologia -f 10_backup_restore.sql
    ```

### Instalación Completa (Script único)
```bash
# Ejecutar todos los scripts en orden
for file in 01_*.sql 02_*.sql 03_*.sql 04_*.sql 05_*.sql 06_*.sql 07_*.sql 08_*.sql 09_*.sql 10_*.sql; do
    psql -U postgres -d congreso_tecnologia -f "$file"
done
```

## Estructura de la Base de Datos

### Tablas Principales

#### Gestión de Usuarios
- **tipos_usuario** - Tipos de usuario (externo, interno)
- **usuarios** - Información de estudiantes y participantes
- **administradores** - Administradores del sistema

#### Gestión de Actividades
- **categorias_actividad** - Categorías para clasificar actividades
- **actividades** - Talleres y competencias del congreso
- **inscripciones_actividad** - Inscripciones de usuarios a actividades

#### Control de Asistencia
- **asistencia** - Registro de asistencia de participantes

#### Gestión de Diplomas
- **diplomas** - Diplomas generados para participantes

#### Resultados y Competencias
- **resultados_competencia** - Resultados de competencias

#### Contenido del Sistema
- **faq** - Preguntas frecuentes
- **informacion_congreso** - Información general del congreso

#### Auditoría
- **logs_sistema** - Logs de actividades del sistema

### Vistas Principales
- **vista_usuarios_completa** - Usuarios con información completa
- **vista_actividades_completa** - Actividades con información de categoría
- **vista_inscripciones_completa** - Inscripciones con datos de usuario y actividad
- **vista_asistencia_completa** - Asistencia con información completa
- **vista_diplomas_completa** - Diplomas con información de usuario y actividad
- **vista_resultados_competencia** - Resultados de competencias
- **vista_estadisticas_generales** - Estadísticas generales del sistema
- **vista_reporte_asistencia_actividad** - Reporte de asistencia por actividad
- **vista_usuarios_mas_activos** - Usuarios con mayor participación

### Funciones Principales
- **obtener_estadisticas_usuario()** - Estadísticas de un usuario específico
- **verificar_disponibilidad_inscripcion()** - Verificar si un usuario puede inscribirse
- **generar_reporte_asistencia_fecha()** - Reporte de asistencia por fechas
- **obtener_ganadores_competencia()** - Ganadores de competencias
- **calcular_porcentaje_asistencia_usuario()** - Porcentaje de asistencia
- **obtener_actividades_populares()** - Actividades más populares
- **validar_datos_usuario()** - Validación de datos de usuario

## Usuarios y Permisos

### Roles Creados
- **congreso_admin** - Administrador con acceso completo
- **congreso_organizador** - Organizador con permisos de gestión
- **congreso_lector** - Solo lectura para consultas

### Usuarios de Aplicación
- **app_admin** - Usuario administrador de la aplicación
- **app_organizador** - Usuario organizador de la aplicación
- **app_lector** - Usuario de solo lectura

## Características Técnicas

### Seguridad
- Row Level Security (RLS) habilitado en tablas sensibles
- Políticas de seguridad por rol
- Encriptación de contraseñas con bcrypt
- Logs de auditoría completos

### Optimización
- Índices en campos de consulta frecuente
- Índices compuestos para consultas complejas
- Triggers automáticos para mantenimiento de datos
- Vistas materializadas para reportes

### Mantenimiento
- Funciones de respaldo automático
- Limpieza automática de logs antiguos
- Verificación de integridad de datos
- Optimización automática de la base de datos

## Datos de Prueba

El archivo `08_sample_data.sql` incluye:
- 10 usuarios de ejemplo (5 externos, 5 internos)
- 6 actividades de ejemplo (talleres y competencias)
- Inscripciones de ejemplo
- Registros de asistencia
- Diplomas generados
- Resultados de competencias

## Mantenimiento

### Respaldo Regular
```sql
SELECT crear_respaldo_completo();
```

### Limpieza de Logs
```sql
SELECT limpiar_logs_antiguos(90); -- Eliminar logs de más de 90 días
```

### Verificación de Integridad
```sql
SELECT * FROM verificar_integridad_bd();
```

### Optimización
```sql
SELECT optimizar_bd();
```

## Notas Importantes

1. **Códigos QR**: Se generan automáticamente al crear usuarios
2. **Cupos**: Se actualizan automáticamente con triggers
3. **Logs**: Todas las operaciones críticas se registran automáticamente
4. **Seguridad**: Los datos sensibles están protegidos con RLS
5. **Escalabilidad**: La estructura permite manejar miles de participantes

## Soporte

Para consultas técnicas sobre la base de datos, revisar:
- Logs del sistema en la tabla `logs_sistema`
- Funciones de verificación de integridad
- Documentación de PostgreSQL para funciones específicas
