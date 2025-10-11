# 📚 Documentación Frontend - Sistema de Gestión del Congreso de Tecnología

## 🎯 Introducción

Este documento explica la estructura y funcionamiento del frontend del Sistema de Gestión del Congreso de Tecnología, desarrollado con **React** y **Vite**. Aquí encontrarás información sobre cómo está organizado el código, por qué tomamos ciertas decisiones de diseño y cómo funciona cada parte del sistema.

---

## 🚀 ¿Qué es React?

**React** es una librería de JavaScript desarrollada por Facebook para crear interfaces de usuario interactivas. Es especialmente útil para aplicaciones web complejas como nuestro sistema de congreso.

### **Características principales de React:**

1. **Componentes**: React organiza la interfaz en componentes reutilizables
2. **Virtual DOM**: Actualiza solo las partes que cambian, mejorando el rendimiento
3. **JSX**: Permite escribir HTML dentro de JavaScript de forma más intuitiva
4. **Estado**: Maneja los datos que cambian en la aplicación
5. **Props**: Permite pasar datos entre componentes

### **¿Por qué elegimos React para este proyecto?**

- ✅ **Perfecto para aplicaciones complejas** con múltiples páginas y funcionalidades
- ✅ **Componentes reutilizables** para formularios, tarjetas, botones, etc.
- ✅ **Gran ecosistema** de librerías para funcionalidades específicas
- ✅ **Excelente para formularios** (inscripciones, login, etc.)
- ✅ **Fácil integración** con APIs y bases de datos
- ✅ **Comunidad activa** y mucha documentación

---

## 📁 Estructura del Proyecto

```
FrontEnd/
└── congreso-tecnologia/          # Proyecto React principal
    ├── public/                   # Archivos públicos (favicon, etc.)
    ├── src/                      # Código fuente principal
    │   ├── components/           # Componentes reutilizables
    │   ├── pages/               # Páginas principales
    │   ├── assets/              # Imágenes, iconos, etc.
    │   ├── styles/              # Estilos globales
    │   ├── utils/               # Funciones utilitarias
    │   ├── hooks/               # Custom hooks de React
    │   ├── services/            # Servicios para API
    │   ├── App.jsx              # Componente principal
    │   ├── App.css              # Estilos del componente principal
    │   ├── main.jsx             # Punto de entrada de la aplicación
    │   └── index.css            # Estilos globales
    ├── package.json             # Dependencias y scripts
    ├── vite.config.js           # Configuración de Vite
    └── README.md                # Documentación del proyecto
```

---

## 🧩 Explicación de Carpetas y Archivos

### **📂 `/src/components/`**
**¿Qué es?** Aquí guardamos los componentes reutilizables de React.

**¿Por qué esta estructura?**
- **Modularidad**: Cada componente tiene su propia carpeta con su archivo JSX y CSS
- **Reutilización**: Los componentes se pueden usar en múltiples páginas
- **Mantenimiento**: Es fácil encontrar y modificar componentes específicos

**Estructura actual:**
```
components/
├── Header/              # Navegación principal
│   ├── Header.jsx       # Lógica del componente
│   └── Header.css       # Estilos específicos
├── Hero/                # Sección principal de la página
│   ├── Hero.jsx
│   └── Hero.css
└── InfoSection/         # Información del congreso
    ├── InfoSection.jsx
    └── InfoSection.css
```

**Ejemplo de componente:**
```jsx
// Header.jsx
import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="header">
      {/* Contenido del header */}
    </header>
  );
};

export default Header;
```

### **📂 `/src/pages/`**
**¿Qué es?** Aquí guardamos las páginas principales de la aplicación.

**¿Por qué separamos páginas de componentes?**
- **Páginas**: Combinan múltiples componentes para crear una vista completa
- **Componentes**: Son piezas más pequeñas y reutilizables
- **Organización**: Es más fácil encontrar y modificar páginas específicas

**Estructura actual:**
```
pages/
├── HomePage.jsx         # Página principal
└── HomePage.css         # Estilos específicos de la página
```

### **📂 `/src/assets/`**
**¿Qué es?** Aquí guardamos recursos estáticos como imágenes, iconos, etc.

**Contenido típico:**
- Imágenes del congreso
- Logos de la universidad
- Iconos personalizados
- Archivos de fuentes

### **📂 `/src/styles/`**
**¿Qué es?** Estilos globales y compartidos entre componentes.

**¿Por qué separar estilos?**
- **Variables CSS**: Colores, tamaños, etc. consistentes
- **Estilos globales**: Reset, tipografía base
- **Utilidades**: Clases CSS reutilizables

### **📂 `/src/utils/`**
**¿Qué es?** Funciones utilitarias que se usan en múltiples lugares.

**Ejemplos:**
- Formateo de fechas
- Validación de formularios
- Funciones de ayuda

### **📂 `/src/hooks/`**
**¿Qué es?** Custom hooks de React para lógica reutilizable.

**¿Qué son los hooks?**
- Funciones que permiten usar estado y efectos en componentes
- Permiten reutilizar lógica entre componentes
- Ejemplo: `useAuth`, `useForm`, `useApi`

### **📂 `/src/services/`**
**¿Qué es?** Servicios para comunicarse con la API.

**Ejemplos:**
- `authService.js` - Para login y registro
- `congressService.js` - Para datos del congreso
- `userService.js` - Para gestión de usuarios

---

## 🎨 ¿Por qué configuramos la página principal de esta forma?

### **1. Estructura Modular**

**Decisión**: Separamos la página principal en componentes independientes.

**¿Por qué?**
```jsx
// HomePage.jsx
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import InfoSection from '../components/InfoSection/InfoSection';

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />        {/* Navegación */}
      <Hero />          {/* Sección principal */}
      <InfoSection />   {/* Información del congreso */}
    </div>
  );
};
```

**Beneficios:**
- ✅ **Fácil mantenimiento**: Cambiar el header no afecta otras secciones
- ✅ **Reutilización**: El Header se puede usar en otras páginas
- ✅ **Colaboración**: Diferentes desarrolladores pueden trabajar en diferentes componentes
- ✅ **Testing**: Cada componente se puede probar independientemente

### **2. CSS Modular**

**Decisión**: Cada componente tiene su propio archivo CSS.

**¿Por qué?**
```css
/* Header.css - Solo estilos del header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* ... */
}

/* Hero.css - Solo estilos del hero */
.hero {
  min-height: 100vh;
  /* ... */
}
```

**Beneficios:**
- ✅ **Sin conflictos**: Los estilos no se mezclan entre componentes
- ✅ **Fácil debugging**: Es fácil encontrar dónde está un estilo específico
- ✅ **Performance**: Solo se cargan los estilos necesarios
- ✅ **Mantenimiento**: Cambios en un componente no afectan otros

### **3. Diseño Responsive**

**Decisión**: Usamos CSS Grid y Flexbox con media queries.

**¿Por qué?**
```css
/* Responsive design */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;  /* Una columna en móvil */
  }
}
```

**Beneficios:**
- ✅ **Funciona en todos los dispositivos**: Móvil, tablet, desktop
- ✅ **Mejor experiencia de usuario**: La interfaz se adapta al dispositivo
- ✅ **SEO mejorado**: Google prefiere sitios responsive

### **4. Variables CSS**

**Decisión**: Usamos variables CSS para colores y tamaños consistentes.

**¿Por qué?**
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --spacing-lg: 2rem;
}
```

**Beneficios:**
- ✅ **Consistencia**: Todos los componentes usan los mismos colores
- ✅ **Fácil cambio**: Cambiar un color actualiza toda la aplicación
- ✅ **Mantenimiento**: Es fácil hacer cambios globales

---

## 🔧 Tecnologías y Herramientas Utilizadas

### **Core Technologies:**
- **React 18+**: Librería principal para la interfaz
- **Vite**: Herramienta de desarrollo rápida
- **JavaScript ES6+**: Lenguaje de programación moderno

### **Styling:**
- **CSS3**: Estilos nativos con variables CSS
- **CSS Grid & Flexbox**: Para layouts responsive
- **CSS Modules**: Para estilos modulares

### **Development Tools:**
- **ESLint**: Para mantener código limpio
- **Prettier**: Para formateo consistente
- **Hot Module Replacement**: Recarga automática durante desarrollo

### **Dependencies Installed:**
```json
{
  "react-router-dom": "Para navegación entre páginas",
  "axios": "Para peticiones HTTP a la API",
  "react-hook-form": "Para manejo de formularios",
  "@hookform/resolvers": "Para validación de formularios",
  "yup": "Librería de validación",
  "lucide-react": "Iconos modernos"
}
```

---

## 🚀 Cómo Ejecutar el Proyecto

### **Comandos principales:**

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar versión de producción
npm run preview
```

### **Estructura de desarrollo:**

1. **Modo desarrollo** (`npm run dev`):
   - Servidor local en `http://localhost:5173`
   - Recarga automática al cambiar archivos
   - Herramientas de debugging

2. **Modo producción** (`npm run build`):
   - Optimiza el código para mejor rendimiento
   - Minifica archivos CSS y JavaScript
   - Genera archivos listos para deploy

---

## 📋 Próximos Pasos

### **Funcionalidades a implementar:**

1. **✅ Completado**: Página principal con Header, Hero e InfoSection
2. **🔄 En progreso**: Más secciones (Actividades, Agenda, Ponentes)
3. **⏳ Pendiente**: Sistema de navegación con React Router
4. **⏳ Pendiente**: Formularios de inscripción
5. **⏳ Pendiente**: Integración con la API
6. **⏳ Pendiente**: Sistema de autenticación
7. **⏳ Pendiente**: Generación de códigos QR
8. **⏳ Pendiente**: Sistema de diplomas

### **Mejoras futuras:**

- **TypeScript**: Para mejor tipado y menos errores
- **Testing**: Pruebas unitarias y de integración
- **PWA**: Para funcionar como aplicación móvil
- **Optimización**: Lazy loading y code splitting

---

## 🤝 Contribución

### **Cómo agregar nuevos componentes:**

1. **Crear carpeta** en `/src/components/NombreComponente/`
2. **Crear archivos** `NombreComponente.jsx` y `NombreComponente.css`
3. **Exportar componente** con `export default`
4. **Importar y usar** en las páginas necesarias

### **Convenciones de código:**

- **Nombres de componentes**: PascalCase (ej: `Header`, `HeroSection`)
- **Nombres de archivos**: PascalCase para componentes, camelCase para utilidades
- **CSS classes**: kebab-case (ej: `hero-section`, `btn-primary`)
- **Variables CSS**: kebab-case con prefijo `--` (ej: `--primary-color`)

---

## 📞 Soporte

Si tienes preguntas sobre la estructura o funcionamiento del frontend:

1. **Revisa este README** para conceptos básicos
2. **Consulta la documentación de React**: https://react.dev/
3. **Revisa el código** de los componentes existentes
4. **Pregunta al equipo** de desarrollo

---

*Este documento se actualizará conforme avancemos en el desarrollo del proyecto.*
