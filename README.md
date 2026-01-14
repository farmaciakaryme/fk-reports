# FK-REPORTS - Sistema de Gestión de Reportes Clínicos

Sistema web moderno para la gestión y generación de reportes de laboratorio clínico, desarrollado con React + Vite y conectado a una API REST real.

## 🚀 Características

- ✅ **Autenticación Real** - Sistema de login con JWT conectado a API
- ✅ **Gestión de Reportes** - Crear, editar y administrar reportes médicos
- ✅ **Gestión de Pruebas** - CRUD completo de tipos de pruebas clínicas
- ✅ **Gestión de Pacientes** - Administración completa de información de pacientes
- ✅ **Generación de PDFs** - Reportes profesionales en formato PDF
- ✅ **Roles y Permisos** - Sistema multiusuario con diferentes niveles de acceso
- ✅ **Navegación Universal** - Interfaz consistente en toda la aplicación
- ✅ **Diseño Responsivo** - Optimizado para desktop, tablet y móvil

## 🛠️ Stack Tecnológico

- **Frontend:** React 18.2.0
- **Build Tool:** Vite 5.2.0
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React 0.344.0
- **Fonts:** Poppins, Inter (Google Fonts)
- **Backend:** Node.js + Express (API REST separada)
- **Database:** MongoDB

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- API Backend corriendo (ver `API_EXAMPLES.md`)

## ⚡ Instalación Rápida

### 1. Clonar e Instalar
```bash
git clone <repository-url>
cd fk-reports
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y configurar la URL de tu API
# VITE_API_URL=http://localhost:5000
```

### 3. Iniciar Aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Credenciales de Prueba

El sistema utiliza autenticación real contra la API. Credenciales disponibles:

**Admin:**
- Email: `arturdar16@gmail.com`
- Password: `Prime175`

**Laboratorista:**
- Email: `linitomm@gmail.com`
- Password: `lin123`

## 📁 Estructura del Proyecto

```
fk-reports/
├── src/
│   ├── components/          # Componentes React
│   │   ├── LoginPage.jsx            # ✅ Integrado con API
│   │   ├── Dashboard.jsx            # Dashboard principal
│   │   ├── UniversalNav.jsx         # Navegación global
│   │   ├── TestManagement.jsx       # Gestión de pruebas
│   │   ├── ReportesManagement.jsx   # Gestión de reportes
│   │   ├── AntidopingComponent.jsx  # Formulario antidoping
│   │   └── AlcoholimetroComponent.jsx # Formulario alcoholímetro
│   ├── services/            # Servicios de API
│   │   └── api.js                   # ✅ Servicio centralizado de API
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno (no versionado)
├── .env.example             # Plantilla de variables de entorno
├── package.json             # Dependencias
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
├── API_EXAMPLES.md          # 📄 Ejemplos de endpoints de API
├── CONFIGURACION_API.md     # 📄 Guía de configuración e integración
└── README.md               # Este archivo
```

## 🔌 Integración con API

### Servicios Disponibles

El archivo `src/services/api.js` proporciona acceso a todos los endpoints:

```javascript
import api from './services/api';

// Autenticación
await api.auth.login(email, password);
await api.auth.getProfile();

// Pacientes
await api.pacientes.getAll({ page: 1, limit: 10 });
await api.pacientes.create(pacienteData);

// Pruebas
await api.pruebas.getAll();
await api.pruebas.getById(id);

// Reportes
await api.reportes.getAll({ page: 1, limit: 10 });
await api.reportes.create(reporteData);
```

Para más detalles, consulta:
- `API_EXAMPLES.md` - Ejemplos completos de todos los endpoints
- `CONFIGURACION_API.md` - Guía de configuración y despliegue

### Estado de Integración

| Componente | Estado | Endpoints Integrados |
|------------|--------|---------------------|
| LoginPage | ✅ Completo | POST /api/auth/login |
| ReportesManagement | ⏳ Pendiente | GET, POST, PUT, DELETE /api/reportes |
| TestManagement | ⏳ Pendiente | GET, POST, PUT, DELETE /api/pruebas |
| Dashboard | ⏳ Pendiente | GET /api/reportes/stats |

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa del build

# Linting
npm run lint         # Ejecuta ESLint
```

## 📦 Build para Producción

```bash
# 1. Configurar variable de entorno
export VITE_API_URL=https://tu-api-en-produccion.com

# 2. Construir
npm run build

# 3. Los archivos estarán en /dist
```

## 🌐 Despliegue

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel login
vercel
```

Configurar en Vercel:
- Environment Variable: `VITE_API_URL` = URL de tu API

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Environment Variable: `VITE_API_URL`

## 🔧 Configuración de CORS

Para que el frontend pueda comunicarse con la API, configura CORS en tu backend:

```javascript
// Backend (Express.js)
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## ⚠️ Notas Importantes

1. **NO USAR TAILWIND CSS v4** - Este proyecto usa v3.4.1 específicamente
2. **Token JWT** - Se guarda en localStorage, validez según configuración del backend
3. **CORS** - Debe estar configurado en el backend para permitir peticiones del frontend

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Versión:** 2.0.0 (Con integración API real)  
**Última actualización:** Enero 2026