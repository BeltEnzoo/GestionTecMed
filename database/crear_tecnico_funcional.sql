-- Crear un usuario técnico que funcione
INSERT INTO perfiles_usuarios (
    email,
    password,
    nombre,
    apellido,
    telefono,
    departamento,
    cargo,
    rol,
    estado,
    fecha_ingreso,
    created_at,
    updated_at
) VALUES (
    'tecnico@hospital.com',
    '123456',
    'Juan',
    'Pérez',
    '+54 11 1234-5678',
    'Técnico',
    'Técnico en Electromedicina',
    'Técnico',
    'Activo',
    CURRENT_DATE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    estado = EXCLUDED.estado,
    updated_at = NOW();

-- Verificar que se creó correctamente
SELECT 
    email,
    rol,
    estado,
    'Contraseña: 123456' as credenciales
FROM perfiles_usuarios 
WHERE email = 'tecnico@hospital.com';


