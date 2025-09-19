-- Deshabilitar RLS temporalmente para probar el login
ALTER TABLE perfiles_usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'perfiles_usuarios';


