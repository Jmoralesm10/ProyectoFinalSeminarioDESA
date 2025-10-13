import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import './QRScanner.css';

const QRScanner = ({ onScan, onError, isActive = true }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Detener escáner anterior si existe
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      // Verificar permisos de cámara
      const hasCameraPermission = await QrScanner.hasCamera();
      if (!hasCameraPermission) {
        setError('No se encontró ninguna cámara disponible');
        setHasPermission(false);
        setIsScanning(false);
        return;
      }

      setHasPermission(true);

      // Esperar un momento antes de crear el escáner
      await new Promise(resolve => setTimeout(resolve, 100));

      // Crear instancia del escáner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detectado:', result.data);
          if (onScan) {
            onScan(result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Cámara trasera
          maxScansPerSecond: 3, // Reducir frecuencia para evitar conflictos
          returnDetailedScanResult: true
        }
      );

      // Iniciar el escáner con manejo de errores
      try {
        await qrScannerRef.current.start();
      } catch (startError) {
        if (startError.name === 'AbortError') {
          console.log('Escáner interrumpido, reintentando...');
          // Reintentar después de un breve delay
          setTimeout(() => {
            if (qrScannerRef.current && isActive) {
              qrScannerRef.current.start().catch(console.error);
            }
          }, 500);
        } else {
          throw startError;
        }
      }
    } catch (err) {
      console.error('Error al iniciar el escáner QR:', err);
      setError('Error al acceder a la cámara: ' + err.message);
      setHasPermission(false);
      setIsScanning(false);
      if (onError) {
        onError(err);
      }
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const requestCameraPermission = async () => {
    try {
      // Intentar acceder a la cámara para solicitar permisos
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      startScanner();
    } catch (err) {
      setError('Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
      setHasPermission(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h3>Escanear Código QR</h3>
        <p>Posiciona el código QR dentro del marco para escanearlo</p>
      </div>

      <div className="qr-scanner-video-container">
        <video
          ref={videoRef}
          className="qr-scanner-video"
          playsInline
          muted
        />
        
        {/* Overlay con marco de escaneo */}
        <div className="qr-scanner-overlay">
          <div className="qr-scanner-frame">
            <div className="qr-scanner-corner top-left"></div>
            <div className="qr-scanner-corner top-right"></div>
            <div className="qr-scanner-corner bottom-left"></div>
            <div className="qr-scanner-corner bottom-right"></div>
          </div>
        </div>

        {/* Indicador de estado */}
        {isScanning && (
          <div className="qr-scanner-status">
            <div className="qr-scanner-pulse"></div>
            <span>Escaneando...</span>
          </div>
        )}
      </div>

      {/* Mensajes de error y permisos */}
      {error && (
        <div className="qr-scanner-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          {!hasPermission && (
            <button 
              className="btn-primary"
              onClick={requestCameraPermission}
            >
              Permitir Acceso a Cámara
            </button>
          )}
        </div>
      )}

      {/* Advertencia HTTPS */}
      {window.location.protocol !== 'https:' && (
        <div className="qr-scanner-warning">
          <div className="warning-icon">⚠️</div>
          <p><strong>Nota:</strong> Para un mejor rendimiento, se recomienda usar HTTPS en producción.</p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="qr-scanner-instructions">
        <h4>Instrucciones:</h4>
        <ul>
          <li>Asegúrate de tener buena iluminación</li>
          <li>Mantén el código QR centrado en el marco</li>
          <li>Acerca o aleja el dispositivo según sea necesario</li>
          <li>El escáner detectará automáticamente el código</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
