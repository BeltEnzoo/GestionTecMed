-- Corregir políticas RLS para la tabla mantenimientos

-- Primero, eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir acceso completo a mantenimientos para usuarios autenticados" ON mantenimientos;

-- Deshabilitar RLS temporalmente para limpiar
ALTER TABLE mantenimientos DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS nuevamente
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

-- Crear política más específica para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden gestionar mantenimientos" ON mantenimientos
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar que la tabla existe y tiene la estructura correcta
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mantenimientos' 
ORDER BY ordinal_position;

