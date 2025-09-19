-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar perfiles" ON perfiles_usuarios;

-- Crear nuevas políticas con restricciones por rol
-- Solo TÉCNICOS pueden insertar perfiles
CREATE POLICY "Solo técnicos pueden insertar perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

-- Solo TÉCNICOS pueden actualizar perfiles
CREATE POLICY "Solo técnicos pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

-- Solo TÉCNICOS pueden eliminar perfiles
CREATE POLICY "Solo técnicos pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

-- Aplicar las mismas restricciones a la tabla equipos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar equipos" ON equipos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar equipos" ON equipos;

CREATE POLICY "Solo técnicos pueden insertar equipos" 
    ON equipos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden actualizar equipos" 
    ON equipos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden eliminar equipos" 
    ON equipos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

-- Aplicar las mismas restricciones a la tabla mantenimientos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar mantenimientos" ON mantenimientos;

CREATE POLICY "Solo técnicos pueden insertar mantenimientos" 
    ON mantenimientos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden actualizar mantenimientos" 
    ON mantenimientos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden eliminar mantenimientos" 
    ON mantenimientos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

-- Aplicar las mismas restricciones a la tabla historial_eventos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar eventos" ON historial_eventos;

CREATE POLICY "Solo técnicos pueden insertar eventos" 
    ON historial_eventos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden actualizar eventos" 
    ON historial_eventos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );

CREATE POLICY "Solo técnicos pueden eliminar eventos" 
    ON historial_eventos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Técnico'
      )
    );


