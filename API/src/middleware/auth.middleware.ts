// =====================================================
// Middleware de Autenticación
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken'; // No se usa directamente
import { UserService } from '../services/user.service';
import { JwtPayload } from '../types/user.types';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Middleware para verificar token JWT
  authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token de acceso requerido'
        });
        return;
      }

      // Verificar y decodificar el token
      const decoded = await this.userService.verifyToken(token);
      
      if (!decoded) {
        res.status(403).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Error en authenticateToken middleware:', error);
      res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
  };

  // Middleware opcional para verificar token (no falla si no hay token)
  optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const decoded = await this.userService.verifyToken(token);
        if (decoded) {
          req.user = decoded;
        }
      }

      next();
    } catch (error) {
      // En caso de error, continuar sin autenticación
      next();
    }
  };

  // Middleware para verificar roles específicos
  requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.tipo_usuario)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
        return;
      }

      next();
    };
  };

  // Middleware para verificar que el usuario esté activo
  requireActiveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Verificar que el usuario esté activo en la base de datos
      const userProfile = await this.userService.getUserProfile(req.user.id_usuario);
      
      if (!userProfile.success || !userProfile.data) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
        return;
      }

      if (!userProfile.data.estado_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en requireActiveUser middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Middleware para verificar que el usuario sea el propietario del recurso
  requireOwnership = (userIdParam: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const resourceUserId = req.params[userIdParam];
      
      if (req.user.id_usuario !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
        return;
      }

      next();
    };
  };

  // Middleware para verificar email verificado
  requireVerifiedEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const userProfile = await this.userService.getUserProfile(req.user.id_usuario);
      
      if (!userProfile.success || !userProfile.data) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      if (!userProfile.data.email_verificado_usuario) {
        res.status(403).json({
          success: false,
          message: 'Debes verificar tu email antes de acceder a este recurso'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en requireVerifiedEmail middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}

// Instancia del middleware para exportar
export const authMiddleware = new AuthMiddleware();
