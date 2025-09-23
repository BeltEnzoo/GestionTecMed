# Gestión Parque Tecnológico

Sistema de gestión para equipos médicos y mantenimientos.

## 🚀 Deployment en Vercel (Recomendado)

### 1. Preparar el repositorio
- Subir el código a GitHub
- Asegurar que todas las variables de entorno estén configuradas

### 2. Variables de entorno requeridas
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_de_supabase
```

### 3. Deploy en Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Conectar con GitHub
3. Importar el repositorio
4. Configurar variables de entorno en Vercel Dashboard
5. Deploy automático

### 4. Configuración automática
- Vercel detecta automáticamente que es un proyecto Vite
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

### 5. Dominio personalizado (Opcional)
- Configurar dominio personalizado en Vercel Dashboard
- SSL automático incluido

## 📱 Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de equipos médicos (CRUD completo)
- ✅ Sistema de mantenimientos programados
- ✅ Historial de eventos (Hoja de vida por equipo)
- ✅ Gráficos de tendencias y análisis
- ✅ Reportes exportables en PDF
- ✅ Gestión de usuarios con roles
- ✅ Diseño responsive (móvil/tablet/desktop)
- ✅ Autenticación personalizada
- ✅ Análisis de costos por departamento
- ✅ Gráficos de frecuencia de eventos por equipo

## 👥 Roles de usuario

- **Técnico**: Acceso completo a todas las funcionalidades
- **Administrador**: Solo lectura de datos, puede gestionar usuarios
- **Invitado**: Solo lectura de toda la información

## 🛠️ Tecnologías

- React 19
- Vite
- Supabase
- Tailwind CSS
- Heroicons
- React Router
- React Hook Form
- Zod