import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export class EmailService {
  private transporter: nodemailer.Transporter | undefined;

  constructor() {
    // El transporter se inicializará de forma lazy cuando se necesite
  }

  // Inicializar transporter de forma lazy
  private getTransporter(): nodemailer.Transporter | undefined {
    if (!this.transporter) {
      // Configurar el transporter de nodemailer solo si hay credenciales
      if (process.env['SMTP_USER'] && process.env['SMTP_PASS']) {
        this.transporter = nodemailer.createTransport({
          host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
          port: parseInt(process.env['SMTP_PORT'] || '587'),
          secure: process.env['SMTP_SECURE'] === 'true', // true para 465, false para otros puertos
          auth: {
            user: process.env['SMTP_USER'],
            pass: process.env['SMTP_PASS']
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log('✅ Transporter SMTP inicializado correctamente');
      } else {
        console.warn('⚠️ Configuración SMTP no encontrada. Los correos no se enviarán.');
      }
    }
    return this.transporter;
  }

  // Verificar la conexión SMTP
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.warn('⚠️ Transporter SMTP no configurado.');
        return false;
      }
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en conexión SMTP:', error);
      return false;
    }
  }

  // Enviar correo de verificación de email
  async sendVerificationEmail(user: any, verificationToken: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.warn('⚠️ Transporter SMTP no configurado. Correo no enviado.');
        return false;
      }

      const verificationUrl = `${process.env['FRONTEND_URL']}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: `"Congreso de Tecnología 2024" <${process.env['SMTP_USER']}>`,
        to: user.email_usuario,
        subject: 'Verifica tu cuenta - Congreso de Tecnología 2024',
        html: this.getVerificationEmailTemplate(user, verificationUrl)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Correo de verificación enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo de verificación:', error);
      return false;
    }
  }

  // Enviar correo de confirmación de inscripción
  async sendRegistrationConfirmation(user: any): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.warn('⚠️ Transporter SMTP no configurado. Correo no enviado.');
        return false;
      }

      // Generar código QR como archivo adjunto
      let qrCodeAttachment = null;
      console.log('🔍 Generando código QR para:', user.codigo_qr_usuario);
      
      if (user.codigo_qr_usuario) {
        try {
          // Crear directorio temporal si no existe
          const tempDir = path.join(process.cwd(), 'temp');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          // Generar código QR como buffer
          const qrCodeBuffer = await QRCode.toBuffer(user.codigo_qr_usuario, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Crear archivo temporal
          const fileName = `qr_${user.id_usuario}.png`;
          const filePath = path.join(tempDir, fileName);
          fs.writeFileSync(filePath, qrCodeBuffer);
          
          // Configurar adjunto
          qrCodeAttachment = {
            filename: `codigo_qr_${user.nombre_usuario}_${user.apellido_usuario}.png`,
            content: qrCodeBuffer,
            contentType: 'image/png',
            cid: 'qr-code' // Content-ID para referenciar en el HTML
          };
          
          console.log('✅ Código QR generado como adjunto correctamente');
          console.log('📁 Archivo temporal creado:', filePath);
          
        } catch (qrError) {
          console.error('❌ Error generando código QR como adjunto:', qrError);
          // Continuar sin el código QR si hay error
        }
      } else {
        console.warn('⚠️ No hay código QR para generar');
      }

      const mailOptions = {
        from: `"Congreso de Tecnología 2024" <${process.env['SMTP_USER']}>`,
        to: user.email_usuario,
        subject: 'Inscripción Confirmada - Congreso de Tecnología 2024',
        html: this.getRegistrationConfirmationTemplate(user, qrCodeAttachment ? 'qr-code' : undefined),
        attachments: qrCodeAttachment ? [qrCodeAttachment] : []
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Correo de confirmación enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo de confirmación:', error);
      return false;
    }
  }

  // Enviar correo de recuperación de contraseña
  async sendPasswordResetEmail(user: any, resetToken: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.warn('⚠️ Transporter SMTP no configurado. Correo no enviado.');
        return false;
      }

      const resetUrl = `${process.env['FRONTEND_URL']}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Congreso de Tecnología 2024" <${process.env['SMTP_USER']}>`,
        to: user.email_usuario,
        subject: 'Recuperar Contraseña - Congreso de Tecnología 2024',
        html: this.getPasswordResetTemplate(user, resetUrl)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Correo de recuperación enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo de recuperación:', error);
      return false;
    }
  }

  // Plantilla HTML para verificación de email
  private getVerificationEmailTemplate(user: any, verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Congreso de Tecnología 2024</h1>
                <p>Verifica tu cuenta para continuar</p>
            </div>
            <div class="content">
                <h2>¡Hola ${user.nombre_usuario}!</h2>
                <p>Gracias por inscribirte en el Congreso de Tecnología 2024. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.</p>
                
                <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verificar Mi Cuenta</a>
                </div>
                
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                
                <p><strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.</p>
            </div>
            <div class="footer">
                <p>Si no te inscribiste en este congreso, puedes ignorar este correo.</p>
                <p>© 2024 Congreso de Tecnología. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Plantilla HTML para confirmación de inscripción
  private getRegistrationConfirmationTemplate(user: any, qrCodeCid?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscripción Confirmada</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ ¡Inscripción Confirmada!</h1>
                <p>Bienvenido al Congreso de Tecnología 2024</p>
            </div>
            <div class="content">
                <h2>¡Felicidades ${user.nombre_usuario}!</h2>
                <p>Tu inscripción al Congreso de Tecnología 2024 ha sido confirmada exitosamente.</p>
                
                <h3>📋 Detalles de tu inscripción:</h3>
                <ul>
                    <li><strong>Nombre:</strong> ${user.nombre_usuario} ${user.apellido_usuario}</li>
                    <li><strong>Email:</strong> ${user.email_usuario}</li>
                    <li><strong>Tipo de usuario:</strong> ${user.tipo_usuario}</li>
                    <li><strong>Código QR:</strong> ${user.codigo_qr_usuario}</li>
                </ul>
                
                <div class="qr-section">
                    <h3>🔲 Tu código QR personal:</h3>
                    ${qrCodeCid ? `
                        <div style="text-align: center; margin: 20px 0; padding: 20px; background: #ffffff; border: 3px solid #28a745; border-radius: 15px;">
                            <img src="cid:${qrCodeCid}" alt="Código QR del Congreso" style="display: block; margin: 0 auto; width: 200px; height: 200px; border: 1px solid #ddd;" />
                            <p style="text-align: center; font-size: 14px; color: #333; margin-top: 15px; font-weight: bold;">
                                Código: ${user.codigo_qr_usuario}
                            </p>
                        </div>
                    ` : `
                        <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 10px;">
                            <p style="color: #6c757d; margin: 0;">⚠️ Código QR no disponible</p>
                            <p style="font-family: monospace; background: #eee; padding: 10px; border-radius: 5px; margin-top: 10px;">${user.codigo_qr_usuario}</p>
                        </div>
                    `}
                    <p style="text-align: center; font-style: italic; color: #666; margin-top: 15px;">
                        📱 <strong>Guarda este código QR</strong><br>
                        Lo necesitarás para el registro de asistencia al congreso<br>
                        <em>También encontrarás el código QR como archivo adjunto en este correo</em>
                    </p>
                </div>
                
                <h3>📅 Próximos pasos:</h3>
                <ul>
                    <li>Revisa tu correo para más información sobre el evento</li>
                    <li>Descarga la aplicación móvil del congreso</li>
                    <li>Explora las actividades disponibles</li>
                </ul>
            </div>
            <div class="footer">
                <p>¡Esperamos verte en el congreso!</p>
                <p>© 2024 Congreso de Tecnología. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Plantilla HTML para recuperación de contraseña
  private getPasswordResetTemplate(user: any, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Recuperar Contraseña</h1>
                <p>Congreso de Tecnología 2024</p>
            </div>
            <div class="content">
                <h2>Hola ${user.nombre_usuario}</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Congreso de Tecnología 2024.</p>
                
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </div>
                
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Este enlace expirará en 1 hora por seguridad</li>
                    <li>Si no solicitaste este cambio, puedes ignorar este correo</li>
                    <li>Tu contraseña actual seguirá funcionando hasta que la cambies</li>
                </ul>
            </div>
            <div class="footer">
                <p>Si tienes problemas, contacta a nuestro equipo de soporte.</p>
                <p>© 2024 Congreso de Tecnología. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
