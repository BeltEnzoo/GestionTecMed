-- Verificar todos los usuarios en la tabla perfiles_usuarios
SELECT 
    id,
    email,
    nombre,
    apellido,
    rol,
    estado,
    password,
    created_at
FROM perfiles_usuarios 
ORDER BY created_at DESC;

-- Verificar específicamente los usuarios técnicos
SELECT 
    email,
    rol,
    estado,
    CASE 
        WHEN password IS NOT NULL THEN 'Tiene contraseña'
        ELSE 'Sin contraseña'
    END as password_status
FROM perfiles_usuarios 
WHERE rol = 'Técnico' OR email LIKE '%tecnico%';


