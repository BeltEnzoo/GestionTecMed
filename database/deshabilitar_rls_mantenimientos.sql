-- Deshabilitar RLS temporalmente para mantenimientos
ALTER TABLE mantenimientos DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'mantenimientos';

