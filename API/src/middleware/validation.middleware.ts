// =====================================================
// Middleware de Validación
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ValidationError } from '../types/user.types';

export class ValidationMiddleware {
  
  // Validar datos de registro de usuario
  validateRegister = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { tipo_usuario, nombre_usuario, apellido_usuario, email_usuario, password, telefono_usuario, colegio_usuario } = req.body;

    // Validar tipo de usuario
    if (!tipo_usuario) {
      errors.push({ field: 'tipo_usuario', message: 'Tipo de usuario es obligatorio' });
    } else if (!['externo', 'interno'].includes(tipo_usuario)) {
      errors.push({ field: 'tipo_usuario', message: 'Tipo de usuario debe ser "externo" o "interno"' });
    }

    // Validar nombre
    if (!nombre_usuario) {
      errors.push({ field: 'nombre_usuario', message: 'Nombre es obligatorio' });
    } else if (nombre_usuario.trim().length < 2) {
      errors.push({ field: 'nombre_usuario', message: 'El nombre debe tener al menos 2 caracteres' });
    } else if (nombre_usuario.trim().length > 100) {
      errors.push({ field: 'nombre_usuario', message: 'El nombre no puede exceder 100 caracteres' });
    }

    // Validar apellido
    if (!apellido_usuario) {
      errors.push({ field: 'apellido_usuario', message: 'Apellido es obligatorio' });
    } else if (apellido_usuario.trim().length < 2) {
      errors.push({ field: 'apellido_usuario', message: 'El apellido debe tener al menos 2 caracteres' });
    } else if (apellido_usuario.trim().length > 100) {
      errors.push({ field: 'apellido_usuario', message: 'El apellido no puede exceder 100 caracteres' });
    }

    // Validar email
    if (!email_usuario) {
      errors.push({ field: 'email_usuario', message: 'Email es obligatorio' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_usuario)) {
        errors.push({ field: 'email_usuario', message: 'Formato de email inválido' });
      } else if (email_usuario.length > 255) {
        errors.push({ field: 'email_usuario', message: 'El email no puede exceder 255 caracteres' });
      } else {
        // Validar dominio según tipo de usuario
        if (tipo_usuario === 'interno' && !email_usuario.endsWith('@miumg.edu.gt')) {
          errors.push({ field: 'email_usuario', message: 'Para usuarios internos, debe usar un email de UMG (@miumg.edu.gt)' });
        } else if (tipo_usuario === 'externo' && !email_usuario.endsWith('.edu.gt')) {
          errors.push({ field: 'email_usuario', message: 'Para usuarios externos, debe usar un email educativo (.edu.gt)' });
        }
      }
    }

    // Validar contraseña
    if (!password) {
      errors.push({ field: 'password', message: 'Contraseña es obligatoria' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' });
    } else if (password.length > 128) {
      errors.push({ field: 'password', message: 'La contraseña no puede exceder 128 caracteres' });
    }

    // Validar teléfono (opcional)
    if (telefono_usuario && telefono_usuario.length > 20) {
      errors.push({ field: 'telefono_usuario', message: 'El teléfono no puede exceder 20 caracteres' });
    }

    // Validar colegio para estudiantes externos
    if (tipo_usuario === 'externo') {
      if (!colegio_usuario) {
        errors.push({ field: 'colegio_usuario', message: 'El colegio es obligatorio para estudiantes externos' });
      } else if (colegio_usuario.trim().length < 2) {
        errors.push({ field: 'colegio_usuario', message: 'El nombre del colegio debe tener al menos 2 caracteres' });
      } else if (colegio_usuario.trim().length > 200) {
        errors.push({ field: 'colegio_usuario', message: 'El nombre del colegio no puede exceder 200 caracteres' });
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar datos de login
  validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { email_usuario, password } = req.body;

    // Validar email
    if (!email_usuario) {
      errors.push({ field: 'email_usuario', message: 'Email es obligatorio' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_usuario)) {
        errors.push({ field: 'email_usuario', message: 'Formato de email inválido' });
      }
    }

    // Validar contraseña
    if (!password) {
      errors.push({ field: 'password', message: 'Contraseña es obligatoria' });
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar token de verificación
  validateVerifyEmail = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { token_verificacion } = req.body;

    if (!token_verificacion) {
      errors.push({ field: 'token_verificacion', message: 'Token de verificación es obligatorio' });
    } else if (token_verificacion.length < 10) {
      errors.push({ field: 'token_verificacion', message: 'Token de verificación inválido' });
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar email para recuperación de contraseña
  validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { email_usuario } = req.body;

    if (!email_usuario) {
      errors.push({ field: 'email_usuario', message: 'Email es obligatorio' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_usuario)) {
        errors.push({ field: 'email_usuario', message: 'Formato de email inválido' });
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar datos para resetear contraseña
  validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { token_recuperacion, new_password } = req.body;

    if (!token_recuperacion) {
      errors.push({ field: 'token_recuperacion', message: 'Token de recuperación es obligatorio' });
    } else if (token_recuperacion.length < 10) {
      errors.push({ field: 'token_recuperacion', message: 'Token de recuperación inválido' });
    }

    if (!new_password) {
      errors.push({ field: 'new_password', message: 'Nueva contraseña es obligatoria' });
    } else if (new_password.length < 8) {
      errors.push({ field: 'new_password', message: 'La nueva contraseña debe tener al menos 8 caracteres' });
    } else if (new_password.length > 128) {
      errors.push({ field: 'new_password', message: 'La nueva contraseña no puede exceder 128 caracteres' });
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar datos de actualización de perfil
  validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { nombre_usuario, apellido_usuario, telefono_usuario, colegio_usuario } = req.body;

    // Validar nombre (opcional en actualización)
    if (nombre_usuario !== undefined) {
      if (nombre_usuario.trim().length < 2) {
        errors.push({ field: 'nombre_usuario', message: 'El nombre debe tener al menos 2 caracteres' });
      } else if (nombre_usuario.trim().length > 100) {
        errors.push({ field: 'nombre_usuario', message: 'El nombre no puede exceder 100 caracteres' });
      }
    }

    // Validar apellido (opcional en actualización)
    if (apellido_usuario !== undefined) {
      if (apellido_usuario.trim().length < 2) {
        errors.push({ field: 'apellido_usuario', message: 'El apellido debe tener al menos 2 caracteres' });
      } else if (apellido_usuario.trim().length > 100) {
        errors.push({ field: 'apellido_usuario', message: 'El apellido no puede exceder 100 caracteres' });
      }
    }

    // Validar teléfono (opcional)
    if (telefono_usuario !== undefined && telefono_usuario.length > 20) {
      errors.push({ field: 'telefono_usuario', message: 'El teléfono no puede exceder 20 caracteres' });
    }

    // Validar colegio (opcional)
    if (colegio_usuario !== undefined) {
      if (colegio_usuario.trim().length < 2) {
        errors.push({ field: 'colegio_usuario', message: 'El nombre del colegio debe tener al menos 2 caracteres' });
      } else if (colegio_usuario.trim().length > 200) {
        errors.push({ field: 'colegio_usuario', message: 'El nombre del colegio no puede exceder 200 caracteres' });
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar datos para cambio de contraseña
  validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { current_password, new_password } = req.body;

    if (!current_password) {
      errors.push({ field: 'current_password', message: 'Contraseña actual es obligatoria' });
    }

    if (!new_password) {
      errors.push({ field: 'new_password', message: 'Nueva contraseña es obligatoria' });
    } else if (new_password.length < 8) {
      errors.push({ field: 'new_password', message: 'La nueva contraseña debe tener al menos 8 caracteres' });
    } else if (new_password.length > 128) {
      errors.push({ field: 'new_password', message: 'La nueva contraseña no puede exceder 128 caracteres' });
    }

    if (current_password && new_password && current_password === new_password) {
      errors.push({ field: 'new_password', message: 'La nueva contraseña debe ser diferente a la actual' });
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  // Validar UUID
  validateUUID = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const uuid = req.params[paramName];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuid || !uuidRegex.test(uuid)) {
        const response: ApiResponse = {
          success: false,
          message: `Parámetro ${paramName} debe ser un UUID válido`,
          errors: [{ field: paramName, message: `Parámetro ${paramName} debe ser un UUID válido` }]
        };
        res.status(400).json(response);
        return;
      }

      next();
    };
  };

  // Validar datos de pago
  validatePaymentRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { id_actividad, metodo_pago, detalles_pago } = req.body;

    // Validar ID de actividad
    if (!id_actividad) {
      errors.push({ field: 'id_actividad', message: 'ID de actividad es obligatorio' });
    } else if (!Number.isInteger(Number(id_actividad)) || Number(id_actividad) <= 0) {
      errors.push({ field: 'id_actividad', message: 'ID de actividad debe ser un número entero positivo' });
    }

    // Validar método de pago
    if (!metodo_pago) {
      errors.push({ field: 'metodo_pago', message: 'Método de pago es obligatorio' });
    } else if (!['tarjeta', 'paypal', 'transferencia'].includes(metodo_pago)) {
      errors.push({ field: 'metodo_pago', message: 'Método de pago debe ser "tarjeta", "paypal" o "transferencia"' });
    }

    // Validar detalles de pago según el método
    if (metodo_pago === 'tarjeta') {
      if (!detalles_pago) {
        errors.push({ field: 'detalles_pago', message: 'Detalles de pago son obligatorios para tarjeta' });
      } else {
        const { numero_tarjeta, fecha_vencimiento, cvv, nombre_tarjeta } = detalles_pago;
        
        if (!numero_tarjeta) {
          errors.push({ field: 'numero_tarjeta', message: 'Número de tarjeta es obligatorio' });
        } else if (!/^\d{13,19}$/.test(numero_tarjeta.replace(/\s/g, ''))) {
          errors.push({ field: 'numero_tarjeta', message: 'Número de tarjeta debe tener entre 13 y 19 dígitos' });
        }

        if (!fecha_vencimiento) {
          errors.push({ field: 'fecha_vencimiento', message: 'Fecha de vencimiento es obligatoria' });
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha_vencimiento)) {
          errors.push({ field: 'fecha_vencimiento', message: 'Fecha de vencimiento debe tener formato MM/AA' });
        }

        if (!cvv) {
          errors.push({ field: 'cvv', message: 'CVV es obligatorio' });
        } else if (!/^\d{3,4}$/.test(cvv)) {
          errors.push({ field: 'cvv', message: 'CVV debe tener 3 o 4 dígitos' });
        }

        if (!nombre_tarjeta) {
          errors.push({ field: 'nombre_tarjeta', message: 'Nombre en la tarjeta es obligatorio' });
        } else if (nombre_tarjeta.trim().length < 2) {
          errors.push({ field: 'nombre_tarjeta', message: 'Nombre en la tarjeta debe tener al menos 2 caracteres' });
        }
      }
    } else if (metodo_pago === 'paypal') {
      if (!detalles_pago || !detalles_pago.email_paypal) {
        errors.push({ field: 'email_paypal', message: 'Email de PayPal es obligatorio' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detalles_pago.email_paypal)) {
        errors.push({ field: 'email_paypal', message: 'Email de PayPal debe ser válido' });
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de pago inválidos',
        errors
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
}

// Instancia del middleware para exportar
export const validationMiddleware = new ValidationMiddleware();
