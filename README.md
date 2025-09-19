# Gestión Parque Tecnológico

Sistema de gestión para equipos médicos y mantenimientos.

## 🚀 Deployment en Render

### 1. Preparar el repositorio
- Subir el código a GitHub
- Asegurar que todas las variables de entorno estén configuradas

### 2. Variables de entorno requeridas
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Configuración en Render
1. Crear nueva Web Service
2. Conectar con GitHub
3. Configurar:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Node Version**: 18+

### 4. Variables de entorno en Render
- Agregar las variables de Supabase en la sección Environment Variables

### 5. Deploy
- Hacer commit y push
- Render detectará automáticamente los cambios y hará deploy

## 📱 Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de equipos médicos
- ✅ Sistema de mantenimientos
- ✅ Historial de eventos (Hoja de vida)
- ✅ Gestión de usuarios con roles
- ✅ Diseño responsive (móvil/tablet/desktop)
- ✅ Autenticación personalizada

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