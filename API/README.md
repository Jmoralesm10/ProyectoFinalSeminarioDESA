# API - Sistema de Gestión del Congreso de Tecnología

## 📋 Descripción

API REST desarrollada con Node.js, Express y TypeScript para el Sistema de Gestión del Congreso de Tecnología. Proporciona endpoints para la gestión de usuarios, inscripciones, autenticación y más funcionalidades del congreso.

## 🚀 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Superset tipado de JavaScript
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Cifrado de contraseñas
- **Prisma** - ORM para base de datos

## 📁 Estructura del Proyecto

```
API/
├── src/
│   ├── controllers/     # Controladores (lógica de rutas)
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Acceso a datos
│   ├── middleware/      # Middleware personalizado
│   ├── routes/          # Definición de rutas
│   ├── types/           # Tipos TypeScript
│   ├── config/          # Configuraciones
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── prisma/              # Esquema de base de datos
├── uploads/             # Archivos subidos
├── public/              # Archivos estáticos
├── .env                 # Variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Base de Datos
DATABASE_URL="postgresql://username:password@localhost:5432/congreso_tecnologia"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=congreso_tecnologia
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
```

### 3. Configurar la base de datos
Asegúrate de que PostgreSQL esté ejecutándose y ejecuta los scripts SQL de la carpeta `DataBase/`.

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 5. Compilar para producción
```bash
npm run build
npm start
```

## 📚 Endpoints de la API

### 🔐 Autenticación y Usuarios

#### Registrar Usuario
```http
POST /api/users/register
Content-Type: application/json

{
  "tipo_usuario": "externo",
  "nombre_usuario": "Juan",
  "apellido_usuario": "Pérez",
  "email_usuario": "juan.perez@colegio.edu.gt",
  "password": "password123",
  "telefono_usuario": "5555-0101",
  "colegio_usuario": "Colegio San José"
}
```

#### Iniciar Sesión
```http
POST /api/users/login
Content-Type: application/json

{
  "email_usuario": "juan.perez@colegio.edu.gt",
  "password": "password123"
}
```

#### Verificar Email
```http
POST /api/users/verify-email
Content-Type: application/json

{
  "token_verificacion": "token_aqui"
}
```

#### Recuperar Contraseña
```http
POST /api/users/forgot-password
Content-Type: application/json

{
  "email_usuario": "juan.perez@colegio.edu.gt"
}
```

#### Resetear Contraseña
```http
POST /api/users/reset-password
Content-Type: application/json

{
  "token_recuperacion": "token_aqui",
  "new_password": "nueva_password123"
}
```

### 👤 Perfil de Usuario (Requiere Autenticación)

#### Obtener Perfil
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Actualizar Perfil
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_usuario": "Juan Carlos",
  "telefono_usuario": "5555-0102"
}
```

#### Cambiar Contraseña
```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "password123",
  "new_password": "nueva_password123"
}
```

### 📊 Información General

#### Health Check
```http
GET /health
```

#### Tipos de Usuario
```http
GET /api/users/types
```

## 🔒 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization`:

```http
Authorization: Bearer <tu_token_jwt>
```

## 📝 Tipos de Usuario

- **externo**: Estudiantes de colegios externos
- **interno**: Estudiantes de la universidad

## 🚨 Códigos de Estado HTTP

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error en la solicitud
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error interno del servidor

## 📋 Respuestas de la API

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos específicos
  }
}
```

### Formato de Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "campo",
      "message": "Mensaje de error específico"
    }
  ]
}
```

## 🛡️ Seguridad

- Cifrado de contraseñas con bcrypt
- Tokens JWT con expiración
- Validación de entrada
- Protección contra ataques de fuerza bruta
- CORS configurado
- Helmet para headers de seguridad

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📦 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar versión compilada
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autores

- Tu Nombre - Desarrollo inicial

## 📞 Soporte

Para soporte, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
