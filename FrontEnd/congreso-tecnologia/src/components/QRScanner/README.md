# Módulo de Asistencia por QR

## 📱 Descripción

Este módulo permite registrar la asistencia de usuarios al congreso mediante el escaneo de códigos QR utilizando la cámara del dispositivo.

## 🚀 Características

- **Escáner QR en tiempo real** usando la cámara del dispositivo
- **Dos tipos de asistencia**:
  - Asistencia general al congreso
  - Asistencia a actividades específicas
- **Interfaz intuitiva** con indicadores visuales
- **Manejo de errores** y permisos de cámara
- **Responsive design** para dispositivos móviles y desktop

## 📋 Componentes

### 1. QRScanner
- **Ubicación**: `src/components/QRScanner/QRScanner.jsx`
- **Función**: Componente principal para escanear códigos QR
- **Dependencias**: `qr-scanner`

### 2. AttendancePage
- **Ubicación**: `src/pages/AttendancePage.jsx`
- **Función**: Página principal de gestión de asistencia
- **Características**:
  - Selector de tipo de asistencia
  - Selector de actividad (para asistencia específica)
  - Integración con el escáner QR
  - Mostrar resultados de escaneo

### 3. AttendanceHistory
- **Ubicación**: `src/components/AttendanceHistory/AttendanceHistory.jsx`
- **Función**: Mostrar historial de asistencia de un usuario
- **Características**:
  - Resumen de asistencia
  - Lista de asistencias generales
  - Lista de asistencias a actividades

## 🔧 Instalación

```bash
npm install qr-scanner
```

## 📖 Uso

### Acceso al Módulo
1. Iniciar sesión en la aplicación
2. Navegar a "Asistencia QR" en el menú principal
3. Seleccionar el tipo de asistencia
4. Iniciar el escáner

### Tipos de Asistencia

#### Asistencia General
- Registra la llegada del usuario al congreso
- Se puede registrar una vez por día
- Endpoint: `POST /api/attendance/general`

#### Asistencia a Actividad
- Registra la participación en una actividad específica
- Requiere seleccionar la actividad antes de escanear
- Endpoint: `POST /api/attendance/activity`

## 🎯 Flujo de Trabajo

1. **Selección de Tipo**: El usuario selecciona entre asistencia general o por actividad
2. **Configuración**: Si es por actividad, se selecciona la actividad específica
3. **Inicio del Escáner**: Se activa la cámara y el escáner QR
4. **Escaneo**: Se escanea el código QR del usuario
5. **Procesamiento**: Se envía la información a la API
6. **Resultado**: Se muestra el resultado del registro

## 🔒 Permisos Requeridos

- **Cámara**: Acceso a la cámara del dispositivo
- **Autenticación**: Usuario debe estar logueado
- **API**: Endpoints de asistencia deben estar disponibles

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Móviles, tablets, desktop
- **HTTPS**: Requerido para acceso a cámara en producción

## 🛠️ Configuración de la API

### Endpoints Requeridos

```javascript
// Asistencia general
POST /api/attendance/general
{
  "codigo_qr_usuario": "string"
}

// Asistencia a actividad
POST /api/attendance/activity
{
  "codigo_qr_usuario": "string",
  "id_actividad": number
}

// Consultar actividades
GET /api/activities?limite=100
```

### Respuestas Esperadas

```javascript
// Éxito
{
  "success": true,
  "message": "Asistencia registrada exitosamente",
  "data": {
    "id_usuario": "uuid",
    "nombre_completo": "string",
    "fecha_asistencia": "date",
    "hora_ingreso": "timestamp"
  }
}

// Error
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

## 🎨 Personalización

### Estilos
- Los estilos están en archivos CSS separados
- Usa variables CSS para colores principales
- Responsive design incluido

### Configuración del Escáner
```javascript
// En QRScanner.jsx
const scannerOptions = {
  highlightScanRegion: true,
  highlightCodeOutline: true,
  preferredCamera: 'environment', // Cámara trasera
  maxScansPerSecond: 5
};
```

## 🐛 Solución de Problemas

### Cámara no funciona
1. Verificar permisos de cámara en el navegador
2. Asegurar que la página se sirve por HTTPS
3. Verificar que el dispositivo tiene cámara

### QR no se detecta
1. Verificar iluminación adecuada
2. Asegurar que el código QR está centrado
3. Verificar que el código QR es válido

### Error de API
1. Verificar que la API está ejecutándose
2. Verificar que los endpoints están disponibles
3. Revisar logs de la consola del navegador

## 📝 Notas de Desarrollo

- El componente usa `useRef` para manejar la instancia del escáner
- Se implementa limpieza automática al desmontar el componente
- Los permisos de cámara se solicitan automáticamente
- El escáner se detiene automáticamente después de un escaneo exitoso
