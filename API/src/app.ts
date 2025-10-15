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
import activityRoutes from './routes/activity.routes';
import paymentRoutes from './routes/payment.routes';
import attendanceRoutes from './routes/attendance.routes';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/report.routes';
import diplomaRoutes from './routes/diploma.routes';
import publicRoutes from './routes/public.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE GLOBAL
// =====================================================

// Seguridad
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5173', // Desarrollo local
  'http://localhost:3000', // Desarrollo local alternativo
  'https://proyecto-final-seminario-desa.vercel.app', // Frontend en Vercel
  process.env['FRONTEND_URL'] // Variable de entorno personalizada
].filter(Boolean); // Eliminar valores undefined/null

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log(`🚫 CORS bloqueado para origin: ${origin}`);
    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
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
app.use('/api/activities', activityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/diplomas', diplomaRoutes);
app.use('/api/public', publicRoutes);

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
      console.log(`📋 Asistencia API: http://localhost:${PORT}/api/attendance`);
      console.log(`👑 Administradores API: http://localhost:${PORT}/api/admin`);
      console.log(`🌐 API Pública: http://localhost:${PORT}/api/public`);
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
