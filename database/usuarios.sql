-- Crear tabla para perfiles de usuarios del sistema
CREATE TABLE IF NOT EXISTS perfiles_usuarios (
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
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_user_id ON perfiles_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_email ON perfiles_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_rol ON perfiles_usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_estado ON perfiles_usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_departamento ON perfiles_usuarios(departamento);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfiles_usuarios_updated_at 
    BEFORE UPDATE ON perfiles_usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE perfiles_usuarios ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS
CREATE POLICY "Los usuarios autenticados pueden ver todos los perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Los administradores pueden insertar perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

CREATE POLICY "Los administradores pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

CREATE POLICY "Los administradores pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

-- Insertar usuario administrador por defecto
INSERT INTO perfiles_usuarios (
  user_id,
  email,
  nombre,
  apellido,
  telefono,
  departamento,
  cargo,
  rol,
  estado,
  fecha_ingreso,
  permisos
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@hospital.com' LIMIT 1),
  'admin@hospital.com',
  'Administrador',
  'Sistema',
  '+54 11 1234-5678',
  'Tecnología Médica',
  'Administrador de Sistema',
  'Administrador',
  'Activo',
  CURRENT_DATE,
  '{"equipos": "full", "mantenimientos": "full", "reportes": "full", "usuarios": "full"}'
) ON CONFLICT (email) DO NOTHING;

-- Comentarios sobre la tabla
COMMENT ON TABLE perfiles_usuarios IS 'Perfiles de usuarios del sistema de gestión médica';
COMMENT ON COLUMN perfiles_usuarios.user_id IS 'ID del usuario en auth.users (Supabase Auth)';
COMMENT ON COLUMN perfiles_usuarios.rol IS 'Rol del usuario: Administrador, Técnico, Usuario, Supervisor';
COMMENT ON COLUMN perfiles_usuarios.estado IS 'Estado del usuario: Activo, Inactivo, Suspendido';
COMMENT ON COLUMN perfiles_usuarios.permisos IS 'Permisos específicos del usuario en formato JSON';
COMMENT ON COLUMN perfiles_usuarios.ultimo_acceso IS 'Última vez que el usuario accedió al sistema';


