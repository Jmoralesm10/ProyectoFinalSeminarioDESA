// =====================================================
// Servicio de Generación de PDFs
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

// Usar puppeteer en desarrollo y puppeteer-core en producción
const puppeteer = process.env['NODE_ENV'] === 'production' || process.env['VERCEL'] 
  ? require('puppeteer-core') 
  : require('puppeteer');
import fs from 'fs';
import path from 'path';

export interface DiplomaPDFData {
  nombreCompleto: string;
  actividad: string;
  tipoDiploma: 'participacion' | 'primer_lugar' | 'segundo_lugar' | 'tercer_lugar' | 'congreso_general';
  fechaGeneracion: string;
  posicion?: number | undefined;
  puntuacion?: number | undefined;
  descripcionProyecto?: string | undefined;
}

export class PDFService {
  private outputDir: string;

  constructor() {
    // En Vercel, usar /tmp para archivos temporales
    if (process.env['NODE_ENV'] === 'production' || process.env['VERCEL']) {
      this.outputDir = '/tmp/diplomas';
    } else {
      this.outputDir = path.join(process.cwd(), 'diplomas');
    }
    
    // Crear directorio de salida si no existe (solo en desarrollo)
    if (process.env['NODE_ENV'] !== 'production' && !process.env['VERCEL']) {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    }
  }

  /**
   * Generar PDF de diploma
   */
  async generateDiplomaPDF(data: DiplomaPDFData): Promise<string> {
    try {
      // Configuración de Puppeteer
      const browserOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      };

      // En Vercel, usar Chromium incluido
      if (process.env['VERCEL']) {
        browserOptions.executablePath = '/usr/bin/chromium-browser';
      } else {
        // En desarrollo local, intentar encontrar Chrome
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Users\\' + process.env['USERNAME'] + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
        ];
        
        for (const path of possiblePaths) {
          if (fs.existsSync(path)) {
            browserOptions.executablePath = path;
            console.log('🔍 Usando Chrome encontrado en:', path);
            break;
          }
        }
      }

      const browser = await puppeteer.launch(browserOptions);
      const page = await browser.newPage();
      
      // Configurar tamaño de página A4
      await page.setViewport({ width: 794, height: 1123 }); // A4 en píxeles

      // Generar HTML del diploma
      const htmlContent = this.generateDiplomaHTML(data);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generar nombre único para el archivo
      const fileName = `diploma_${data.nombreCompleto.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(this.outputDir, fileName);

      // Asegurar que el directorio existe en Vercel
      if (process.env['VERCEL'] && !fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Generar PDF
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      await browser.close();

      console.log(`✅ PDF generado exitosamente: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      throw new Error('Error al generar el PDF del diploma');
    }
  }

  /**
   * Generar HTML del diploma
   */
  private generateDiplomaHTML(data: DiplomaPDFData): string {
    const tipoTexto = this.getTipoTexto(data.tipoDiploma);
    const colorPrincipal = this.getColorPrincipal(data.tipoDiploma);
    const icono = this.getIcono(data.tipoDiploma);

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Diploma - ${data.nombreCompleto}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Open+Sans:wght@300;400;600&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Open Sans', sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .diploma-container {
                background: white;
                width: 100%;
                max-width: 800px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                position: relative;
            }
            
            .diploma-header {
                background: linear-gradient(135deg, ${colorPrincipal} 0%, #2C3E50 100%);
                color: white;
                padding: 40px;
                text-align: center;
                position: relative;
            }
            
            .diploma-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }
            
            .university-logo {
                font-size: 2.5rem;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .university-name {
                font-family: 'Playfair Display', serif;
                font-size: 1.8rem;
                font-weight: 700;
                margin-bottom: 5px;
                position: relative;
                z-index: 1;
            }
            
            .university-subtitle {
                font-size: 1rem;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .diploma-icon {
                font-size: 4rem;
                margin: 30px 0;
                position: relative;
                z-index: 1;
            }
            
            .diploma-title {
                font-family: 'Playfair Display', serif;
                font-size: 2.2rem;
                font-weight: 900;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .diploma-subtitle {
                font-size: 1.1rem;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .diploma-content {
                padding: 50px 40px;
                text-align: center;
            }
            
            .diploma-text {
                font-size: 1.3rem;
                line-height: 1.8;
                color: #2C3E50;
                margin-bottom: 30px;
            }
            
            .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 2.5rem;
                font-weight: 700;
                color: ${colorPrincipal};
                margin: 30px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .activity-name {
                font-size: 1.4rem;
                color: #34495e;
                font-weight: 600;
                margin: 20px 0;
                padding: 15px 30px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 10px;
                border-left: 5px solid ${colorPrincipal};
            }
            
            .diploma-details {
                margin-top: 40px;
                padding: 30px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 2px solid #e9ecef;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 15px 0;
                padding: 10px 0;
                border-bottom: 1px solid #dee2e6;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: #495057;
            }
            
            .detail-value {
                color: #2C3E50;
                font-weight: 500;
            }
            
            .diploma-footer {
                padding: 30px 40px;
                background: #f8f9fa;
                text-align: center;
                border-top: 3px solid ${colorPrincipal};
            }
            
            .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
            }
            
            .signature {
                text-align: center;
                flex: 1;
            }
            
            .signature-line {
                border-bottom: 2px solid #2C3E50;
                width: 150px;
                margin: 0 auto 10px;
                height: 40px;
            }
            
            .signature-text {
                font-size: 0.9rem;
                color: #6c757d;
                font-weight: 600;
            }
            
            .congress-info {
                margin-top: 20px;
                font-size: 0.9rem;
                color: #6c757d;
                font-style: italic;
            }
            
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 8rem;
                color: rgba(0, 0, 0, 0.03);
                font-weight: 900;
                z-index: 0;
                pointer-events: none;
            }
        </style>
    </head>
    <body>
        <div class="diploma-container">
            <div class="watermark">UMG</div>
            
            <div class="diploma-header">
                <div class="university-logo">🎓</div>
                <div class="university-name">Universidad Mariano Gálvez de Guatemala</div>
                <div class="university-subtitle">Facultad de Ingeniería en Sistemas</div>
                
                <div class="diploma-icon">${icono}</div>
                <div class="diploma-title">${tipoTexto}</div>
                <div class="diploma-subtitle">Congreso de Tecnología 2024</div>
            </div>
            
            <div class="diploma-content">
                <div class="diploma-text">
                    Se otorga el presente diploma a:
                </div>
                
                <div class="recipient-name">${data.nombreCompleto}</div>
                
                <div class="diploma-text">
                    ${this.getMotivoTexto(data.tipoDiploma)}
                </div>
                
                <div class="activity-name">${data.actividad}</div>
                
                ${data.posicion ? `
                <div class="diploma-details">
                    <div class="detail-row">
                        <span class="detail-label">Posición:</span>
                        <span class="detail-value">${this.getPosicionTexto(data.posicion)}</span>
                    </div>
                    ${data.puntuacion ? `
                    <div class="detail-row">
                        <span class="detail-label">Puntuación:</span>
                        <span class="detail-value">${data.puntuacion} puntos</span>
                    </div>
                    ` : ''}
                    ${data.descripcionProyecto ? `
                    <div class="detail-row">
                        <span class="detail-label">Proyecto:</span>
                        <span class="detail-value">${data.descripcionProyecto}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            
            <div class="diploma-footer">
                <div class="signature-section">
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-text">Director del Congreso</div>
                    </div>
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-text">Decano de la Facultad</div>
                    </div>
                </div>
                
                <div class="congress-info">
                    <p>Fecha de generación: ${new Date(data.fechaGeneracion).toLocaleDateString('es-GT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p>Este diploma es un reconocimiento oficial de la Universidad Mariano Gálvez de Guatemala</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Obtener texto del tipo de diploma
   */
  private getTipoTexto(tipo: string): string {
    switch (tipo) {
      case 'participacion':
        return 'Diploma de Participación';
      case 'primer_lugar':
        return 'Diploma de Primer Lugar';
      case 'segundo_lugar':
        return 'Diploma de Segundo Lugar';
      case 'tercer_lugar':
        return 'Diploma de Tercer Lugar';
      case 'congreso_general':
        return 'Diploma del Congreso';
      default:
        return 'Diploma de Reconocimiento';
    }
  }

  /**
   * Obtener color principal según el tipo
   */
  private getColorPrincipal(tipo: string): string {
    switch (tipo) {
      case 'primer_lugar':
        return '#FFD700'; // Oro
      case 'segundo_lugar':
        return '#C0C0C0'; // Plata
      case 'tercer_lugar':
        return '#CD7F32'; // Bronce
      case 'participacion':
        return '#1A365D'; // Azul UMG
      case 'congreso_general':
        return '#D92027'; // Rojo UMG
      default:
        return '#1A365D';
    }
  }

  /**
   * Obtener icono según el tipo
   */
  private getIcono(tipo: string): string {
    switch (tipo) {
      case 'primer_lugar':
        return '🥇';
      case 'segundo_lugar':
        return '🥈';
      case 'tercer_lugar':
        return '🥉';
      case 'participacion':
        return '🎓';
      case 'congreso_general':
        return '🏆';
      default:
        return '🎓';
    }
  }

  /**
   * Obtener texto de motivo
   */
  private getMotivoTexto(tipo: string): string {
    switch (tipo) {
      case 'primer_lugar':
        return 'por haber obtenido el primer lugar en la competencia:';
      case 'segundo_lugar':
        return 'por haber obtenido el segundo lugar en la competencia:';
      case 'tercer_lugar':
        return 'por haber obtenido el tercer lugar en la competencia:';
      case 'participacion':
        return 'por su participación activa en el taller:';
      case 'congreso_general':
        return 'por su participación en el Congreso de Tecnología 2024';
      default:
        return 'por su participación en:';
    }
  }

  /**
   * Obtener texto de posición
   */
  private getPosicionTexto(posicion: number): string {
    switch (posicion) {
      case 1:
        return 'Primer Lugar';
      case 2:
        return 'Segundo Lugar';
      case 3:
        return 'Tercer Lugar';
      default:
        return `Posición ${posicion}`;
    }
  }

  /**
   * Limpiar archivos antiguos
   */
  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = fs.readdirSync(this.outputDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convertir a milisegundos

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Archivo antiguo eliminado: ${file}`);
        }
      }
    } catch (error) {
      console.error('❌ Error al limpiar archivos antiguos:', error);
    }
  }
}
