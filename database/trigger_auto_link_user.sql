-- Función para vincular automáticamente usuarios de auth con perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar si existe un perfil sin user_id para este email
  UPDATE perfiles_usuarios
  SET user_id = NEW.id
  WHERE email = NEW.email 
  AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecute cuando se crea un usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario sobre la función
COMMENT ON FUNCTION public.handle_new_user() IS 'Vincula automáticamente usuarios de auth.users con perfiles_usuarios cuando se crea un nuevo usuario';


