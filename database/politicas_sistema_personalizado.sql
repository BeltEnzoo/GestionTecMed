-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Solo administradores pueden crear perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos pueden ver perfiles" ON perfiles_usuarios;

-- Crear políticas simplificadas para sistema personalizado
-- Como no usamos Supabase Auth, permitimos todas las operaciones a usuarios autenticados
-- El control de permisos se hará en el frontend

-- SELECT: Todos los usuarios autenticados pueden ver perfiles
CREATE POLICY "Todos pueden ver perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

-- INSERT: Todos los usuarios autenticados pueden crear perfiles
-- (El control de permisos se hará en el frontend)
CREATE POLICY "Todos pueden crear perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- UPDATE: Todos los usuarios autenticados pueden actualizar perfiles
-- (El control de permisos se hará en el frontend)
CREATE POLICY "Todos pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (true);

-- DELETE: Todos los usuarios autenticados pueden eliminar perfiles
-- (El control de permisos se hará en el frontend)
CREATE POLICY "Todos pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'perfiles_usuarios'
ORDER BY cmd;


