-- Verificar si la tabla existe y eliminarla si es necesario
DROP TABLE IF EXISTS perfiles_usuarios CASCADE;

-- Crear tabla para perfiles de usuarios del sistema
CREATE TABLE perfiles_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  departamento VARCHAR(100),
  cargo VARCHAR(100),
  rol VARCHAR(50) DEFAULT 'Usuario' CHECK (rol IN (
    'Administrador',
    'Técnico',
    'Usuario',
    'Supervisor'
  )),
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  permisos JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_perfiles_usuarios_user_id ON perfiles_usuarios(user_id);
CREATE INDEX idx_perfiles_usuarios_email ON perfiles_usuarios(email);
CREATE INDEX idx_perfiles_usuarios_rol ON perfiles_usuarios(rol);
CREATE INDEX idx_perfiles_usuarios_estado ON perfiles_usuarios(estado);
CREATE INDEX idx_perfiles_usuarios_departamento ON perfiles_usuarios(departamento);

-- Habilitar RLS (Row Level Security)
ALTER TABLE perfiles_usuarios ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS simplificadas
CREATE POLICY "Los usuarios autenticados pueden ver todos los perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios autenticados pueden insertar perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Los usuarios autenticados pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios autenticados pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (true);


