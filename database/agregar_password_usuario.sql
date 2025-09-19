-- Agregar campo password a la tabla perfiles_usuarios
ALTER TABLE perfiles_usuarios ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Actualizar el usuario administrador existente con una contraseña
UPDATE perfiles_usuarios 
SET password = 'admin123' 
WHERE email = 'admin@hospital.com';

-- Comentario sobre el campo
COMMENT ON COLUMN perfiles_usuarios.password IS 'Contraseña del usuario (en producción usar hash)';


