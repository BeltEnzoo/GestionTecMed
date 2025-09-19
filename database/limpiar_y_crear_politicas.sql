-- PASO 1: Eliminar TODAS las políticas existentes de perfiles_usuarios
DROP POLICY IF EXISTS "Todos pueden ver perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden crear perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden ver perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden eliminar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los administradores pueden insertar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los administradores pueden actualizar perfiles" ON perfiles_usuarios;
DROP POLICY IF EXISTS "Los administradores pueden eliminar perfiles" ON perfiles_usuarios;

-- PASO 2: Eliminar TODAS las políticas existentes de equipos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los equipos" ON equipos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar equipos" ON equipos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar equipos" ON equipos;
DROP POLICY IF EXISTS "Solo técnicos pueden insertar equipos" ON equipos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar equipos" ON equipos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden insertar equipos" ON equipos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden eliminar equipos" ON equipos;

-- PASO 3: Eliminar TODAS las políticas existentes de mantenimientos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Solo técnicos pueden insertar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden insertar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden actualizar mantenimientos" ON mantenimientos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden eliminar mantenimientos" ON mantenimientos;

-- PASO 4: Eliminar TODAS las políticas existentes de historial_eventos
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Solo técnicos pueden insertar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Solo técnicos pueden actualizar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Solo técnicos pueden eliminar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden insertar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden actualizar eventos" ON historial_eventos;
DROP POLICY IF EXISTS "Administradores y técnicos pueden eliminar eventos" ON historial_eventos;

-- PASO 5: Crear nuevas políticas para perfiles_usuarios
CREATE POLICY "Todos pueden ver perfiles" 
    ON perfiles_usuarios FOR SELECT 
    TO authenticated 
    USING (true);

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

-- PASO 6: Crear nuevas políticas para equipos
CREATE POLICY "Todos pueden ver equipos" 
    ON equipos FOR SELECT 
    TO authenticated 
    USING (true);

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

-- PASO 7: Crear nuevas políticas para mantenimientos
CREATE POLICY "Todos pueden ver mantenimientos" 
    ON mantenimientos FOR SELECT 
    TO authenticated 
    USING (true);

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

-- PASO 8: Crear nuevas políticas para historial_eventos
CREATE POLICY "Todos pueden ver eventos" 
    ON historial_eventos FOR SELECT 
    TO authenticated 
    USING (true);

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


