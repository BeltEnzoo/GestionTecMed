-- Políticas de Storage para el bucket 'equipos-files'
-- Este script configura las políticas RLS necesarias para permitir la subida y descarga de archivos
-- IMPORTANTE: Este proyecto usa autenticación personalizada (no Supabase Auth)
-- Por lo tanto, las políticas usan 'anon' en lugar de 'authenticated'

-- Nota: Primero debes crear el bucket en Supabase Dashboard:
-- 1. Ve a Storage en tu proyecto de Supabase
-- 2. Click en "Create bucket"
-- 3. Nombre: equipos-files
-- 4. Marca como "Public bucket" para que las imágenes sean accesibles públicamente
-- 5. Ejecuta este script en el SQL Editor de Supabase

-- Eliminar políticas existentes si las hay (opcional)
DROP POLICY IF EXISTS "Permitir subida de archivos anon" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de archivos públicos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de archivos anon" ON storage.objects;

-- Crear políticas para permitir INSERT (subir archivos)
-- Permitir acceso anónimo para subir archivos (usando anon key)
CREATE POLICY "Permitir subida de archivos anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'equipos-files' AND
  (storage.foldername(name))[1] IS NOT NULL
);

-- También permitir a usuarios autenticados (por si acaso)
CREATE POLICY "Permitir subida de archivos authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'equipos-files' AND
  (storage.foldername(name))[1] IS NOT NULL
);

-- Crear políticas para permitir SELECT (descargar/ver archivos)
-- Permitir acceso público para leer archivos
CREATE POLICY "Permitir lectura de archivos públicos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'equipos-files'
);

-- Crear políticas para permitir DELETE (eliminar archivos)
-- Permitir acceso anónimo para eliminar archivos
CREATE POLICY "Permitir eliminación de archivos anon"
ON storage.objects FOR DELETE
TO anon
USING (
  bucket_id = 'equipos-files'
);

-- También permitir a usuarios autenticados (por si acaso)
CREATE POLICY "Permitir eliminación de archivos authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'equipos-files'
);

-- Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%equipos%'
ORDER BY cmd;

