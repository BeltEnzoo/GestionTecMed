-- Eliminar políticas existentes para usuarios
DROP POLICY IF EXISTS "Solo técnicos pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar perfiles" ON perfiles_usuarios;

-- Crear nuevas políticas: ADMINISTRADORES Y TÉCNICOS pueden gestionar usuarios
CREATE POLICY "Administradores y técnicos pueden insertar perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Técnico', 'Administrador')
      )
    );

CREATE POLICY "Administradores y técnicos pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Técnico', 'Administrador')
      )
    );

CREATE POLICY "Administradores y técnicos pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Técnico', 'Administrador')
      )
    );

-- Para equipos: SOLO TÉCNICOS pueden modificar
-- (Estas políticas ya están bien, no las tocamos)

-- Para mantenimientos: SOLO TÉCNICOS pueden modificar  
-- (Estas políticas ya están bien, no las tocamos)

-- Para eventos: SOLO TÉCNICOS pueden modificar
-- (Estas políticas ya están bien, no las tocamos)


