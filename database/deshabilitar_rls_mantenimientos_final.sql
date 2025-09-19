-- Deshabilitar RLS para la tabla mantenimientos temporalmente
ALTER TABLE mantenimientos DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes (por si acaso)
DROP POLICY IF EXISTS "Usuarios autenticados pueden gestionar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON mantenimientos;
DROP POLICY IF EXISTS "Permitir acceso completo a mantenimientos para usuarios autenticados" ON mantenimientos;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'mantenimientos';

-- Verificar que no hay políticas
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'mantenimientos';

