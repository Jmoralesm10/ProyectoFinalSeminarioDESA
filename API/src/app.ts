// =====================================================
// Configuración Principal de la Aplicación
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Importar rutas
import userRoutes from './routes/user.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE GLOBAL
// =====================================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// RUTAS
// =====================================================

// Ruta de salud
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API del Congreso de Tecnología funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de la API
app.use('/api/users', userRoutes);

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Middleware para rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: _req.originalUrl
  });
});

// Middleware global de manejo de errores
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
  });
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

const PORT = process.env['PORT'] || 3001;

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📱 API disponible en: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 Usuarios API: http://localhost:${PORT}/api/users`);
      console.log(`🌍 Entorno: ${process.env['NODE_ENV'] || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Inicializar aplicación
initializeApp();

export default app;
