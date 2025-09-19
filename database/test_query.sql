-- Probar la consulta exacta que usa el servicio
SELECT 
    id,
    email,
    password,
    nombre,
    apellido,
    rol,
    estado
FROM perfiles_usuarios 
WHERE email = 'dtmhospitalbj@gmail.com' 
AND estado = 'Activo';

-- Verificar que el campo password existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'perfiles_usuarios' 
AND column_name = 'password';


