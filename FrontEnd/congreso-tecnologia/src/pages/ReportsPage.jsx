import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import './ReportsPage.css';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    actividadId: '',
    estado: '',
    colegioId: ''
  });

  // Lista de reportes disponibles basada en los endpoints reales de la API
  const availableReports = [
    // REPORTES DE ASISTENCIA
    {
      id: 'attendance-general',
      title: 'Reporte de Asistencia General',
      description: 'Asistencia general al congreso con estadísticas',
      icon: '📊',
      endpoint: 'GET /api/reports/attendance/general',
      requiresFilters: false,
      category: 'Asistencia'
    },
    {
      id: 'attendance-activities',
      title: 'Asistencia por Actividades',
      description: 'Asistencia específica a talleres y competencias',
      icon: '🎯',
      endpoint: 'GET /api/reports/attendance/activities',
      requiresFilters: false,
      category: 'Asistencia'
    },
    {
      id: 'attendance-complete',
      title: 'Reporte Completo de Asistencia',
      description: 'Reporte detallado con todos los datos de asistencia',
      icon: '📋',
      endpoint: 'GET /api/reports/attendance/complete',
      requiresFilters: false,
      category: 'Asistencia'
    },
    
    // ESTADÍSTICAS DEL SISTEMA
    {
      id: 'system-stats',
      title: 'Estadísticas del Sistema',
      description: 'Estadísticas completas del sistema',
      icon: '📈',
      endpoint: 'GET /api/reports/statistics/complete',
      requiresFilters: false,
      category: 'Estadísticas'
    },
    {
      id: 'user-stats',
      title: 'Estadísticas de Usuarios',
      description: 'Estadísticas detalladas de usuarios',
      icon: '👥',
      endpoint: 'GET /api/reports/statistics/users',
      requiresFilters: false,
      category: 'Estadísticas'
    },
    {
      id: 'activity-stats',
      title: 'Estadísticas de Actividades',
      description: 'Estadísticas de talleres y competencias',
      icon: '🎯',
      endpoint: 'GET /api/reports/statistics/activities',
      requiresFilters: false,
      category: 'Estadísticas'
    },
    {
      id: 'attendance-stats',
      title: 'Estadísticas de Asistencia',
      description: 'Métricas de participación y asistencia',
      icon: '📊',
      endpoint: 'GET /api/reports/statistics/attendance',
      requiresFilters: false,
      category: 'Estadísticas'
    },
    {
      id: 'admin-stats',
      title: 'Estadísticas de Administradores',
      description: 'Estadísticas de gestión administrativa',
      icon: '🔧',
      endpoint: 'GET /api/reports/statistics/admins',
      requiresFilters: false,
      category: 'Estadísticas'
    },
    
    // REPORTES DE INSCRIPCIONES
    {
      id: 'registrations',
      title: 'Reporte de Inscripciones',
      description: 'Reporte general de inscripciones con filtros',
      icon: '📝',
      endpoint: 'GET /api/reports/registrations',
      requiresFilters: true,
      category: 'Inscripciones'
    },
    {
      id: 'registrations-confirmed',
      title: 'Inscripciones Confirmadas',
      description: 'Listado de inscripciones confirmadas',
      icon: '✅',
      endpoint: 'GET /api/reports/registrations/confirmed',
      requiresFilters: false,
      category: 'Inscripciones'
    },
    
    
    // REPORTES DE USUARIOS MÁS ACTIVOS
    {
      id: 'most-active-users',
      title: 'Usuarios Más Activos',
      description: 'Ranking de usuarios con mayor participación',
      icon: '🏆',
      endpoint: 'GET /api/reports/users/most-active',
      requiresFilters: false,
      category: 'Usuarios'
    },
    
    // REPORTES DE DIPLOMAS
    {
      id: 'diplomas',
      title: 'Reporte de Diplomas',
      description: 'Reporte de diplomas generados y entregados',
      icon: '🎓',
      endpoint: 'GET /api/reports/diplomas',
      requiresFilters: false,
      category: 'Diplomas'
    },
    
    // REPORTES DE COMPETENCIAS
    {
      id: 'competition-results',
      title: 'Resultados de Competencias',
      description: 'Reporte de resultados y ganadores de competencias',
      icon: '🏅',
      endpoint: 'GET /api/reports/competitions/results',
      requiresFilters: false,
      category: 'Competencias'
    }
  ];

  // Agrupar reportes por categoría
  const reportsByCategory = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});

   const generateExcel = (reportData, reportTitle) => {
     try {
       // Crear un nuevo workbook
       const workbook = XLSX.utils.book_new();
       
       // Procesar datos del reporte
       console.log('Datos del reporte:', reportData); // Debug
       
       // Si los datos contienen metadatos del API, extraer solo los datos reales
       if (reportData && typeof reportData === 'object' && reportData.data) {
         console.log('Extrayendo datos de .data:', reportData.data);
         reportData = reportData.data;
       }
       
       // Verificar si es un objeto con estructura de reporte (como asistencia general)
       if (reportData && typeof reportData === 'object' && reportData.registros) {
         console.log('Procesando reporte con estructura de registros');
         
         // Crear datos combinados en una sola hoja
         const combinedData = [
           ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
           [''],
           ['INFORMACIÓN DEL REPORTE'],
           [''],
           ['Tipo de Reporte:', reportData.tipo_reporte || 'N/A'],
           ['Total Registros:', reportData.total_registros || '0'],
           ['Fecha Desde:', reportData.fecha_desde ? new Date(reportData.fecha_desde).toLocaleDateString('es-GT') : 'N/A'],
           ['Fecha Hasta:', reportData.fecha_hasta ? new Date(reportData.fecha_hasta).toLocaleDateString('es-GT') : 'N/A'],
           ['Generado el:', new Date().toLocaleString('es-GT')],
           ['']
         ];
         
         // Procesar registros si existen
         if (reportData.registros && Array.isArray(reportData.registros) && reportData.registros.length > 0) {
           // Agregar encabezado de datos
           combinedData.push(['DATOS DEL REPORTE']);
           combinedData.push(['']);
           
           // Preparar encabezados de la tabla
           const firstRow = reportData.registros[0];
           const headers = Object.keys(firstRow).map(key => 
             key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
           );
           combinedData.push(headers);
           
           // Procesar cada registro
           reportData.registros.forEach(row => {
             const processedRow = [];
             
             Object.keys(row).forEach(key => {
               let value = row[key];
               
               // Manejar diferentes tipos de datos
               if (value === null || value === undefined) {
                 value = '';
               } else if (typeof value === 'object') {
                 value = JSON.stringify(value);
               } else if (key.includes('fecha')) {
                 // Formatear fechas
                 try {
                   value = new Date(value).toLocaleDateString('es-GT');
                 } catch (e) {
                   value = String(value);
                 }
               } else if (key.includes('hora')) {
                 // Formatear horas
                 try {
                   value = new Date(value).toLocaleTimeString('es-GT');
                 } catch (e) {
                   value = String(value);
                 }
               } else {
                 value = String(value);
               }
               
               processedRow.push(value);
             });
             
             combinedData.push(processedRow);
           });
         }
         
         // Crear hoja única con todos los datos
         const combinedSheet = XLSX.utils.aoa_to_sheet(combinedData);
         
         // Configurar ancho de columnas
         const colWidths = [];
         const maxCols = Math.max(...combinedData.map(row => row.length));
         
         for (let i = 0; i < maxCols; i++) {
           let maxLength = 0;
           combinedData.forEach(row => {
             if (row[i]) {
               maxLength = Math.max(maxLength, String(row[i]).length);
             }
           });
           colWidths.push({ width: Math.min(Math.max(maxLength + 2, 15), 50) });
         }
         combinedSheet['!cols'] = colWidths;
         
         XLSX.utils.book_append_sheet(workbook, combinedSheet, 'Reporte');
         
       } else if (Array.isArray(reportData)) {
         // Si es un array, crear tabla directamente en una sola hoja
         if (reportData.length > 0) {
           const combinedData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Total Registros:', reportData.length],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['DATOS DEL REPORTE'],
             ['']
           ];
           
           // Preparar encabezados de la tabla
           const firstRow = reportData[0];
           const headers = Object.keys(firstRow).map(key => 
             key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
           );
           combinedData.push(headers);
           
           // Procesar cada registro
           reportData.forEach(row => {
             const processedRow = [];
             
             Object.keys(row).forEach(key => {
               let value = row[key];
               
               // Manejar diferentes tipos de datos
               if (value === null || value === undefined) {
                 value = '';
               } else if (typeof value === 'object') {
                 value = JSON.stringify(value);
               } else if (key.includes('fecha')) {
                 try {
                   value = new Date(value).toLocaleDateString('es-GT');
                 } catch (e) {
                   value = String(value);
                 }
               } else if (key.includes('hora')) {
                 try {
                   value = new Date(value).toLocaleTimeString('es-GT');
                 } catch (e) {
                   value = String(value);
                 }
               } else {
                 value = String(value);
               }
               
               processedRow.push(value);
             });
             
             combinedData.push(processedRow);
           });
           
           // Crear hoja única con todos los datos
           const combinedSheet = XLSX.utils.aoa_to_sheet(combinedData);
           
           // Configurar ancho de columnas
           const colWidths = [];
           const maxCols = Math.max(...combinedData.map(row => row.length));
           
           for (let i = 0; i < maxCols; i++) {
             let maxLength = 0;
             combinedData.forEach(row => {
               if (row[i]) {
                 maxLength = Math.max(maxLength, String(row[i]).length);
               }
             });
             colWidths.push({ width: Math.min(Math.max(maxLength + 2, 15), 50) });
           }
           combinedSheet['!cols'] = colWidths;
           
           XLSX.utils.book_append_sheet(workbook, combinedSheet, 'Reporte');
         }
         
       } else if (typeof reportData === 'object' && reportData !== null) {
         // Si es un objeto, verificar si es un reporte de estadísticas
         if (reportData.estadisticas_generales || reportData.estadisticas_usuarios || reportData.estadisticas_actividades) {
           // Es un reporte de estadísticas - procesarlo de forma especial
           const statsData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['ESTADÍSTICAS DEL SISTEMA'],
             ['']
           ];

           // Procesar estadísticas generales
           if (reportData.estadisticas_generales) {
             statsData.push(['ESTADÍSTICAS GENERALES', '']);
             Object.entries(reportData.estadisticas_generales).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 statsData.push([`  ${readableKey}`, '']);
                 Object.entries(value).forEach(([subKey, subValue]) => {
                   const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                   statsData.push([`    ${readableSubKey}`, String(subValue)]);
                 });
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
             statsData.push(['']); // Línea en blanco
           }

           // Procesar estadísticas de usuarios
           if (reportData.estadisticas_usuarios) {
             statsData.push(['ESTADÍSTICAS DE USUARIOS', '']);
             Object.entries(reportData.estadisticas_usuarios).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 if (Array.isArray(value)) {
                   statsData.push([`  ${readableKey}`, '']);
                   value.forEach((item, index) => {
                     statsData.push([`    ${index + 1}`, String(item)]);
                   });
                 } else {
                   statsData.push([`  ${readableKey}`, '']);
                   Object.entries(value).forEach(([subKey, subValue]) => {
                     const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                     statsData.push([`    ${readableSubKey}`, String(subValue)]);
                   });
                 }
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
             statsData.push(['']); // Línea en blanco
           }

           // Procesar estadísticas de actividades
           if (reportData.estadisticas_actividades) {
             statsData.push(['ESTADÍSTICAS DE ACTIVIDADES', '']);
             Object.entries(reportData.estadisticas_actividades).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 if (Array.isArray(value)) {
                   statsData.push([`  ${readableKey}`, '']);
                   value.forEach((item, index) => {
                     statsData.push([`    ${index + 1}`, String(item)]);
                   });
                 } else {
                   statsData.push([`  ${readableKey}`, '']);
                   Object.entries(value).forEach(([subKey, subValue]) => {
                     const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                     statsData.push([`    ${readableSubKey}`, String(subValue)]);
                   });
                 }
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
             statsData.push(['']); // Línea en blanco
           }

           // Procesar estadísticas de asistencias
           if (reportData.estadisticas_asistencias) {
             statsData.push(['ESTADÍSTICAS DE ASISTENCIAS', '']);
             Object.entries(reportData.estadisticas_asistencias).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 if (Array.isArray(value)) {
                   statsData.push([`  ${readableKey}`, '']);
                   value.forEach((item, index) => {
                     statsData.push([`    ${index + 1}`, String(item)]);
                   });
                 } else {
                   statsData.push([`  ${readableKey}`, '']);
                   Object.entries(value).forEach(([subKey, subValue]) => {
                     const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                     statsData.push([`    ${readableSubKey}`, String(subValue)]);
                   });
                 }
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
             statsData.push(['']); // Línea en blanco
           }

           // Procesar estadísticas de administradores
           if (reportData.estadisticas_administradores) {
             statsData.push(['ESTADÍSTICAS DE ADMINISTRADORES', '']);
             Object.entries(reportData.estadisticas_administradores).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 if (Array.isArray(value)) {
                   statsData.push([`  ${readableKey}`, '']);
                   value.forEach((item, index) => {
                     statsData.push([`    ${index + 1}`, String(item)]);
                   });
                 } else {
                   statsData.push([`  ${readableKey}`, '']);
                   Object.entries(value).forEach(([subKey, subValue]) => {
                     const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                     statsData.push([`    ${readableSubKey}`, String(subValue)]);
                   });
                 }
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
             statsData.push(['']); // Línea en blanco
           }

           // Procesar tendencias
           if (reportData.tendencias) {
             statsData.push(['TENDENCIAS', '']);
             Object.entries(reportData.tendencias).forEach(([key, value]) => {
               const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               if (typeof value === 'object' && value !== null) {
                 statsData.push([`  ${readableKey}`, '']);
                 Object.entries(value).forEach(([subKey, subValue]) => {
                   const readableSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                   if (typeof subValue === 'object' && subValue !== null) {
                     statsData.push([`    ${readableSubKey}`, '']);
                     Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
                       const readableSubSubKey = subSubKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                       statsData.push([`      ${readableSubSubKey}`, String(subSubValue)]);
                     });
                   } else {
                     statsData.push([`    ${readableSubKey}`, String(subValue)]);
                   }
                 });
               } else {
                 statsData.push([`  ${readableKey}`, String(value)]);
               }
             });
           }

           const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
           statsSheet['!cols'] = [
             { width: 30 },
             { width: 20 }
           ];
           
           XLSX.utils.book_append_sheet(workbook, statsSheet, 'Reporte');
         } else if (reportData.diplomas && Array.isArray(reportData.diplomas)) {
           // Es un reporte de diplomas con estructura {total_diplomas: X, diplomas: Array}
           const diplomaData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['RESUMEN'],
             ['Total Diplomas:', reportData.total_diplomas || reportData.diplomas.length],
             [''],
             ['DATOS DETALLADOS'],
             ['']
           ];

           // Agregar encabezados de la tabla de diplomas
           if (reportData.diplomas.length > 0) {
             const firstDiploma = reportData.diplomas[0];
             const headers = Object.keys(firstDiploma).map(key => 
               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
             );
             diplomaData.push(headers);

             // Procesar cada diploma
             reportData.diplomas.forEach(diploma => {
               const processedRow = [];
               Object.keys(diploma).forEach(key => {
                 let value = diploma[key];
                 if (value === null || value === undefined) {
                   value = '';
                 } else if (typeof value === 'object') {
                   value = JSON.stringify(value);
                 } else if (key.includes('fecha')) {
                   try {
                     value = new Date(value).toLocaleDateString('es-GT');
                   } catch (e) {
                     value = String(value);
                   }
                 } else {
                   value = String(value);
                 }
                 processedRow.push(value);
               });
               diplomaData.push(processedRow);
             });
           }

           const diplomaSheet = XLSX.utils.aoa_to_sheet(diplomaData);
           diplomaSheet['!cols'] = [
             { width: 20 },
             { width: 15 },
             { width: 25 },
             { width: 30 },
             { width: 20 },
             { width: 15 },
             { width: 20 },
             { width: 20 },
             { width: 15 },
             { width: 15 },
             { width: 20 },
             { width: 20 },
             { width: 15 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 15 },
             { width: 15 },
             { width: 20 }
           ];
           
           XLSX.utils.book_append_sheet(workbook, diplomaSheet, 'Reporte');
         } else if (reportData.resultados && Array.isArray(reportData.resultados)) {
           // Es un reporte de competencias con estructura {total_resultados: X, resultados: Array}
           const competitionData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['RESUMEN'],
             ['Total Resultados:', reportData.total_resultados || reportData.resultados.length],
             [''],
             ['DATOS DETALLADOS'],
             ['']
           ];

           // Agregar encabezados de la tabla de resultados
           if (reportData.resultados.length > 0) {
             const firstResult = reportData.resultados[0];
             const headers = Object.keys(firstResult).map(key => 
               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
             );
             competitionData.push(headers);

             // Procesar cada resultado
             reportData.resultados.forEach(result => {
               const processedRow = [];
               Object.keys(result).forEach(key => {
                 let value = result[key];
                 if (value === null || value === undefined) {
                   value = '';
                 } else if (typeof value === 'object') {
                   value = JSON.stringify(value);
                 } else if (key.includes('fecha')) {
                   try {
                     value = new Date(value).toLocaleDateString('es-GT');
                   } catch (e) {
                     value = String(value);
                   }
                 } else {
                   value = String(value);
                 }
                 processedRow.push(value);
               });
               competitionData.push(processedRow);
             });
           }

           const competitionSheet = XLSX.utils.aoa_to_sheet(competitionData);
           competitionSheet['!cols'] = [
             { width: 15 },
             { width: 20 },
             { width: 25 },
             { width: 25 },
             { width: 30 },
             { width: 15 },
             { width: 15 },
             { width: 30 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 20 },
             { width: 20 }
           ];
           
           XLSX.utils.book_append_sheet(workbook, competitionSheet, 'Reporte');
         } else if (reportData.usuarios && Array.isArray(reportData.usuarios)) {
           // Es un reporte con estructura {total_usuarios: X, usuarios: Array}
           const userData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['RESUMEN'],
             ['Total Usuarios:', reportData.total_usuarios || reportData.usuarios.length],
             [''],
             ['DATOS DETALLADOS'],
             ['']
           ];

           // Agregar encabezados de la tabla de usuarios
           if (reportData.usuarios.length > 0) {
             const firstUser = reportData.usuarios[0];
             const headers = Object.keys(firstUser).map(key => 
               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
             );
             userData.push(headers);

             // Procesar cada usuario
             reportData.usuarios.forEach(user => {
               const processedRow = [];
               Object.keys(user).forEach(key => {
                 let value = user[key];
                 if (value === null || value === undefined) {
                   value = '';
                 } else if (typeof value === 'object') {
                   value = JSON.stringify(value);
                 } else if (key.includes('fecha')) {
                   try {
                     value = new Date(value).toLocaleDateString('es-GT');
                   } catch (e) {
                     value = String(value);
                   }
                 } else {
                   value = String(value);
                 }
                 processedRow.push(value);
               });
               userData.push(processedRow);
             });
           }

           const userSheet = XLSX.utils.aoa_to_sheet(userData);
           
           // Configurar ancho de columnas
           const colWidths = [];
           const maxCols = Math.max(...userData.map(row => row.length));
           for (let i = 0; i < maxCols; i++) {
             let maxLength = 0;
             userData.forEach(row => {
               if (row[i]) {
                 maxLength = Math.max(maxLength, String(row[i]).length);
               }
             });
             colWidths.push({ width: Math.min(Math.max(maxLength + 2, 15), 50) });
           }
           userSheet['!cols'] = colWidths;
           
           XLSX.utils.book_append_sheet(workbook, userSheet, 'Reporte');
         } else {
           // Es un objeto regular - mostrar como lista de propiedades
           const objectData = [
             ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
             [''],
             ['INFORMACIÓN DEL REPORTE'],
             [''],
             ['Generado el:', new Date().toLocaleString('es-GT')],
             [''],
             ['DATOS DEL REPORTE'],
             [''],
             ['PROPIEDAD', 'VALOR']
           ];
           
           Object.entries(reportData).forEach(([key, value]) => {
             let valueText = '';
             if (value === null || value === undefined) {
               valueText = 'N/A';
             } else if (typeof value === 'object') {
               if (Array.isArray(value)) {
                 valueText = `Array con ${value.length} elementos`;
               } else {
                 valueText = JSON.stringify(value, null, 2);
               }
             } else {
               valueText = String(value);
             }
             
             const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
             objectData.push([readableKey, valueText]);
           });
           
           const objectSheet = XLSX.utils.aoa_to_sheet(objectData);
           objectSheet['!cols'] = [
             { width: 25 },
             { width: 50 }
           ];
           
           XLSX.utils.book_append_sheet(workbook, objectSheet, 'Reporte');
         }
         
       } else {
         // Si es un valor primitivo
         const primitiveData = [
           ['UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'],
           [''],
           ['INFORMACIÓN DEL REPORTE'],
           [''],
           ['Tipo de datos:', typeof reportData],
           ['Valor:', String(reportData)],
           ['Generado el:', new Date().toLocaleString('es-GT')]
         ];
         
         const primitiveSheet = XLSX.utils.aoa_to_sheet(primitiveData);
         primitiveSheet['!cols'] = [
           { width: 20 },
           { width: 30 }
         ];
         
         XLSX.utils.book_append_sheet(workbook, primitiveSheet, 'Reporte');
       }

       // Descargar archivo Excel
       const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
       XLSX.writeFile(workbook, fileName);

     } catch (error) {
       console.error('Error generando Excel:', error);
       throw new Error('Error al generar el archivo Excel');
     }
   };

  const fetchReportData = async (report) => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      let url = `http://localhost:3001${report.endpoint.replace('GET ', '')}`;
      
      // Agregar parámetros de filtro si es necesario
      if (report.requiresFilters && filters) {
        const params = new URLSearchParams();
        if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
        if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
        if (filters.actividadId) params.append('actividadId', filters.actividadId);
        if (filters.estado) params.append('estado', filters.estado);
        if (filters.colegioId) params.append('colegioId', filters.colegioId);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Debug: Mostrar la estructura completa del response
      console.log('Response completo:', responseData);
      console.log('Tipo de response:', typeof responseData);
      console.log('Es array:', Array.isArray(responseData));
      
      // Extraer los datos reales del response
      let reportData;
      if (responseData.data && Array.isArray(responseData.data)) {
        reportData = responseData.data;
        console.log('Usando responseData.data (array):', reportData);
      } else if (responseData.data && typeof responseData.data === 'object') {
        reportData = responseData.data;
        console.log('Usando responseData.data (object):', reportData);
      } else if (Array.isArray(responseData)) {
        reportData = responseData;
        console.log('Usando responseData directo (array):', reportData);
      } else if (typeof responseData === 'object') {
        reportData = responseData;
        console.log('Usando responseData directo (object):', reportData);
      } else {
        reportData = responseData;
        console.log('Usando responseData directo (primitivo):', reportData);
      }
      
      // Mostrar datos en consola para debug
      console.log('=== DATOS PARA PDF ===');
      console.log('Reporte:', report.title);
      console.log('Datos extraídos:', reportData);
      console.log('Tipo:', typeof reportData);
      console.log('Es array:', Array.isArray(reportData));
      
      if (typeof reportData === 'object' && reportData !== null) {
        console.log('Claves del objeto:', Object.keys(reportData));
        if (reportData.registros) {
          console.log('Tiene registros:', Array.isArray(reportData.registros));
          console.log('Cantidad de registros:', reportData.registros.length);
          if (reportData.registros.length > 0) {
            console.log('Primer registro:', reportData.registros[0]);
            console.log('Claves del primer registro:', Object.keys(reportData.registros[0]));
          }
        }
      }
      
      if (Array.isArray(reportData) && reportData.length > 0) {
        console.log('Primer elemento:', reportData[0]);
        console.log('Claves del primer elemento:', Object.keys(reportData[0]));
      }
      console.log('=====================');
      
       // Generar Excel
       generateExcel(reportData, report.title);
      
      setShowFilters(false);
      setCurrentReport(null);
      
    } catch (error) {
      console.error('Error obteniendo datos del reporte:', error);
       setError(`Error al generar el Excel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (report) => {
    if (report.requiresFilters) {
      setCurrentReport(report);
      setShowFilters(true);
    } else {
      fetchReportData(report);
    }
  };

  const handleGenerateWithFilters = () => {
    if (currentReport) {
      fetchReportData(currentReport);
    }
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
    setCurrentReport(null);
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      actividadId: '',
      estado: '',
      colegioId: ''
    });
  };

  return (
    <div className="reports-page">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <button 
            className="back-button"
            onClick={() => navigate('/admin-panel')}
          >
            <span>←</span> Volver al Panel Admin
          </button>
          <h1>📊 Generar Reportes en Excel</h1>
          <p>Selecciona el tipo de reporte que deseas generar</p>
          <div className="management-info">
            <span className="management-badge">📊 Generar Reportes</span>
            <span className="management-email">{user?.email || 'Usuario'}</span>
          </div>
        </div>

      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

       {/* Loading overlay */}
       {loading && (
         <div className="loading-overlay">
           <div className="loading-spinner"></div>
           <p>Generando reporte en Excel...</p>
         </div>
       )}

      {/* Reportes por categoría */}
      {Object.entries(reportsByCategory).map(([category, reports]) => (
        <div key={category} className="reports-category">
          <h2 className="category-title">
            {category === 'Asistencia' && '📊'}
            {category === 'Estadísticas' && '📈'}
            {category === 'Inscripciones' && '📝'}
            {category === 'Actividades' && '🎯'}
            {category === 'Usuarios' && '👥'}
            {category}
          </h2>
          
          <div className="reports-grid">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="report-card"
                onClick={() => handleReportClick(report)}
              >
                <div className="report-icon">{report.icon}</div>
                <h3 className="report-title">{report.title}</h3>
                <p className="report-description">{report.description}</p>
                {report.requiresFilters && (
                  <div className="filter-indicator">🔍 Requiere filtros</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal de filtros */}
      {showFilters && currentReport && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
               <h2>Filtros para Excel: {currentReport.title}</h2>
               <button className="close-button" onClick={handleCloseFilters}>
                 ×
               </button>
             </div>
            
            <div className="modal-body">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Fecha de Inicio</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.fechaInicio}
                    onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
                  />
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Fecha de Fin</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.fechaFin}
                    onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
                  />
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">ID de Actividad</label>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="ID de la actividad"
                    value={filters.actividadId}
                    onChange={(e) => setFilters({...filters, actividadId: e.target.value})}
                  />
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Estado</label>
                  <select
                    className="filter-select"
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">ID de Colegio</label>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="ID del colegio"
                    value={filters.colegioId}
                    onChange={(e) => setFilters({...filters, colegioId: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseFilters}>
                Cancelar
              </button>
               <button className="btn-primary" onClick={handleGenerateWithFilters}>
                 Generar Excel
               </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReportsPage;
