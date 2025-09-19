-- Crear el usuario administrador que falta
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
    'admin@hospital.com',
    'admin123',
    'Administrador',
    'Sistema',
    '+54 11 0000-0000',
    'Sistemas',
    'Administrador del Sistema',
    'Administrador',
    'Activo',
    CURRENT_DATE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    estado = EXCLUDED.estado,
    updated_at = NOW();

-- Verificar que se creó
SELECT 
    email,
    rol,
    estado,
    'Contraseña: admin123' as credenciales
FROM perfiles_usuarios 
WHERE email = 'admin@hospital.com';


