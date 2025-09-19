-- Agregar las columnas faltantes a la tabla mantenimientos existente

-- Agregar columna ID (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'id') THEN
        ALTER TABLE mantenimientos ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- Agregar columna equipo_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'equipo_id') THEN
        ALTER TABLE mantenimientos ADD COLUMN equipo_id UUID REFERENCES equipos(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar columna tipo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'tipo') THEN
        ALTER TABLE mantenimientos ADD COLUMN tipo VARCHAR(20) CHECK (tipo IN ('preventivo', 'correctivo'));
    END IF;
END $$;

-- Agregar columna tecnico
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'tecnico') THEN
        ALTER TABLE mantenimientos ADD COLUMN tecnico VARCHAR(100);
    END IF;
END $$;

-- Agregar columna fecha_programada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'fecha_programada') THEN
        ALTER TABLE mantenimientos ADD COLUMN fecha_programada DATE;
    END IF;
END $$;

-- Agregar columna fecha_completado
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'fecha_completado') THEN
        ALTER TABLE mantenimientos ADD COLUMN fecha_completado DATE;
    END IF;
END $$;

-- Agregar columna estado
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'estado') THEN
        ALTER TABLE mantenimientos ADD COLUMN estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado'));
    END IF;
END $$;

-- Agregar columna descripcion
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mantenimientos' AND column_name = 'descripcion') THEN
        ALTER TABLE mantenimientos ADD COLUMN descripcion TEXT;
    END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_estado ON mantenimientos(estado);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha_programada ON mantenimientos(fecha_programada);

-- Verificar la estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'mantenimientos' 
ORDER BY ordinal_position;

