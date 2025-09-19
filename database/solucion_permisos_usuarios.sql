-- PASO 1: Verificar si el usuario administrador existe en perfiles_usuarios
SELECT 
    id,
    email,
    nombre,
    rol,
    estado
FROM perfiles_usuarios 
WHERE email = 'admin@hospital.com';

-- PASO 2: Eliminar TODAS las políticas de perfiles_usuarios
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo técnicos pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Administradores y técnicos pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Administradores y técnicos pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Administradores y técnicos pueden eliminar perfiles" ON perfiles_usuarios;

-- PASO 3: Crear políticas simples y permisivas temporalmente
CREATE POLICY "Todos los usuarios autenticados pueden ver perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Todos los usuarios autenticados pueden insertar perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Todos los usuarios autenticados pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Todos los usuarios autenticados pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (true);

-- PASO 4: Verificar que las políticas se crearon
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'perfiles_usuarios';


