-- Eliminar todas las políticas existentes de perfiles_usuarios
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden ver perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden eliminar perfiles" ON perfiles_usuarios;

-- Crear nuevas políticas específicas por rol

-- 1. VER PERFILES: Todos los usuarios autenticados pueden ver
CREATE POLICY "Todos pueden ver perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

-- 2. CREAR PERFILES: Solo Administradores
CREATE POLICY "Solo administradores pueden crear perfiles" 
    ON perfiles_usuarios FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

-- 3. ACTUALIZAR PERFILES: Solo Administradores
CREATE POLICY "Solo administradores pueden actualizar perfiles" 
    ON perfiles_usuarios FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

-- 4. ELIMINAR PERFILES: Solo Administradores
CREATE POLICY "Solo administradores pueden eliminar perfiles" 
    ON perfiles_usuarios FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol = 'Administrador'
      )
    );

-- Aplicar las mismas restricciones a equipos
DROP POLICY IF EXISTS "Solo técnicos pueden insertar equipos" ON equipos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar equipos" ON equipos;

CREATE POLICY "Administradores y técnicos pueden insertar equipos" 
    ON equipos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden actualizar equipos" 
    ON equipos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden eliminar equipos" 
    ON equipos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

-- Aplicar las mismas restricciones a mantenimientos
DROP POLICY IF EXISTS "Solo técnicos pueden insertar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar mantenimientos" ON mantenimientos;

CREATE POLICY "Administradores y técnicos pueden insertar mantenimientos" 
    ON mantenimientos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden actualizar mantenimientos" 
    ON mantenimientos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden eliminar mantenimientos" 
    ON mantenimientos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

-- Aplicar las mismas restricciones a historial_eventos
DROP POLICY IF EXISTS "Solo técnicos pueden insertar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar eventos" ON historial_eventos;

CREATE POLICY "Administradores y técnicos pueden insertar eventos" 
    ON historial_eventos FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden actualizar eventos" 
    ON historial_eventos FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );

CREATE POLICY "Administradores y técnicos pueden eliminar eventos" 
    ON historial_eventos FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM perfiles_usuarios 
        WHERE user_id = auth.uid() 
        AND rol IN ('Administrador', 'Técnico')
      )
    );


