-- Hacer el campo user_id opcional en la tabla perfiles_usuarios
ALTER TABLE perfiles_usuarios ALTER COLUMN user_id DROP NOT NULL;

-- Verificar que el cambio se aplicó
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'perfiles_usuarios' 
AND column_name = 'user_id';


