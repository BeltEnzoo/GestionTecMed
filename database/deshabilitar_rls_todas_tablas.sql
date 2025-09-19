-- Deshabilitar RLS para todas las tablas del sistema
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('equipos', 'mantenimientos', 'historial_eventos', 'perfiles_usuarios')
ORDER BY tablename;


