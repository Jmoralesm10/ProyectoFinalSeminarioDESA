# Procedimientos Almacenados - Sistema de Gestión del Congreso de Tecnología

## Descripción
Esta carpeta contiene todos los procedimientos almacenados (stored procedures) del sistema. Los procedimientos almacenados encapsulan la lógica de negocio en la base de datos, proporcionando mayor seguridad, rendimiento y consistencia.

## Convención de Nomenclatura
- **Prefijo**: `sp_` (stored procedure)
- **Formato**: `sp_[accion]_[entidad]`
- **Ejemplo**: `sp_inscribir_usuario`, `sp_consultar_actividades`

## Archivos

### Procedimientos Almacenados
- **`sp_inscribir_usuario.sql`** - Procedimiento para inscribir usuarios al congreso
- **`test_all_stored_procedures.sql`** - Script de pruebas unificado para todos los procedimientos

## Uso de los Procedimientos

### 1. Crear un Procedimiento
```sql
-- Ejecutar el archivo del procedimiento
\i sp_inscribir_usuario.sql
```

### 2. Llamar un Procedimiento
```sql
-- Sintaxis general
SELECT * FROM sp_nombre_procedimiento(parametro1, parametro2, ...);

-- Ejemplo específico
SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Juan', 
    'Pérez', 
    'juan.perez@colegio.edu', 
    '555-0101', 
    'Colegio San José'
);
```

### 3. Probar todos los Procedimientos
```sql
-- Ejecutar el archivo de pruebas unificado
\i test_all_stored_procedures.sql
```

## Ventajas de los Procedimientos Almacenados

### 🔒 **Seguridad**
- Validaciones centralizadas en la base de datos
- Prevención de inyección SQL
- Control de acceso granular

### ⚡ **Rendimiento**
- Ejecución optimizada en el servidor de base de datos
- Menos tráfico de red
- Caché de planes de ejecución

### 🔄 **Consistencia**
- Lógica de negocio centralizada
- Transacciones automáticas
- Validaciones uniformes

### 🛠️ **Mantenimiento**
- Cambios centralizados
- Versionado de lógica de negocio
- Debugging más fácil

## Estructura de Respuesta

Los procedimientos almacenados siguen un formato estándar de respuesta:

```sql
RETURNS TABLE (
    success BOOLEAN,    -- Indica si la operación fue exitosa
    message TEXT,       -- Mensaje descriptivo del resultado
    data JSONB          -- Datos adicionales (opcional)
) AS $$
```

### Ejemplo de Respuesta
```sql
-- Éxito
success: true
message: "Usuario inscrito exitosamente"
data: {"id_usuario": "uuid", "codigo_qr": "CONGRESO_2024_..."}

-- Error
success: false
message: "El email ya está registrado en el sistema"
data: null
```

## Procedimientos Planificados

### Gestión de Usuarios
- ✅ `sp_inscribir_usuario` - Inscribir usuario
- 🔄 `sp_consultar_usuario` - Consultar datos de usuario
- 🔄 `sp_actualizar_usuario` - Actualizar datos de usuario
- 🔄 `sp_eliminar_usuario` - Eliminar usuario

### Gestión de Actividades
- 🔄 `sp_inscribir_actividad` - Inscribir usuario a actividad
- 🔄 `sp_consultar_actividades` - Consultar actividades disponibles
- 🔄 `sp_actualizar_cupo` - Actualizar cupo de actividad

### Gestión de Asistencia
- 🔄 `sp_registrar_asistencia` - Registrar asistencia con QR
- 🔄 `sp_consultar_asistencia` - Consultar registros de asistencia
- 🔄 `sp_generar_reporte_asistencia` - Generar reportes

### Gestión de Diplomas
- 🔄 `sp_generar_diploma` - Generar diploma automáticamente
- 🔄 `sp_consultar_diplomas` - Consultar diplomas de usuario
- 🔄 `sp_enviar_diploma_email` - Enviar diploma por email

### Gestión de Resultados
- 🔄 `sp_registrar_resultado` - Registrar resultado de competencia
- 🔄 `sp_consultar_ganadores` - Consultar ganadores
- 🔄 `sp_actualizar_ranking` - Actualizar ranking

## Mejores Prácticas

### 1. Validaciones
- Validar todos los parámetros de entrada
- Verificar permisos y restricciones
- Manejar casos edge apropiadamente

### 2. Manejo de Errores
- Usar bloques EXCEPTION
- Proporcionar mensajes descriptivos
- Logear errores críticos

### 3. Transacciones
- Usar transacciones para operaciones complejas
- Rollback en caso de error
- Commit solo cuando todo esté correcto

### 4. Documentación
- Comentar cada procedimiento
- Incluir ejemplos de uso
- Documentar parámetros y respuestas

## Testing

### Ejecutar Todas las Pruebas
```bash
# Desde la carpeta storeprocedures
psql -U postgres -d congreso_tecnologia -f test_all_stored_procedures.sql
```

### Agregar Nuevas Pruebas
1. Agregar sección al archivo `test_all_stored_procedures.sql`
2. Incluir casos de éxito y error
3. Agregar verificaciones post-pruebas
4. Documentar resultados esperados

## Mantenimiento

### Actualizar Procedimiento
1. Modificar el archivo `.sql`
2. Ejecutar `DROP FUNCTION IF EXISTS`
3. Ejecutar el nuevo `CREATE FUNCTION`
4. Ejecutar pruebas

### Eliminar Procedimiento
```sql
DROP FUNCTION IF EXISTS sp_nombre_procedimiento(parámetros);
```

## Notas Importantes

- Los procedimientos almacenados se ejecutan en el contexto de la base de datos
- Tienen acceso completo a todas las tablas y funciones
- Deben ser probados exhaustivamente antes de producción
- Los cambios requieren permisos de administrador de base de datos
