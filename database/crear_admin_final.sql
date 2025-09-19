-- Crear el usuario administrador final
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
    rol = EXCLUDED.rol,
    estado = EXCLUDED.estado,
    updated_at = NOW();

-- Verificar usuarios existentes
SELECT 
    email,
    rol,
    estado,
    CASE 
        WHEN email = 'admin@hospital.com' THEN 'admin123'
        WHEN email = 'tecnico@test.com' THEN '123456'
        WHEN email = 'dtmhospitalbj@gmail.com' THEN '416937'
        ELSE 'Sin contraseña'
    END as password
FROM perfiles_usuarios 
ORDER BY rol, email;


