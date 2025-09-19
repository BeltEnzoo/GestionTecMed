-- Eliminar tabla si existe (cuidado: esto borrará todos los datos)
DROP TABLE IF EXISTS mantenimientos CASCADE;

-- Crear tabla de mantenimientos
CREATE TABLE mantenimientos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipo_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('preventivo', 'correctivo')),
    tecnico VARCHAR(100) NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_completado DATE,
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado')),
    costo DECIMAL(10,2),
    descripcion TEXT,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);
CREATE INDEX idx_mantenimientos_estado ON mantenimientos(estado);
CREATE INDEX idx_mantenimientos_fecha_programada ON mantenimientos(fecha_programada);

-- Habilitar RLS
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

-- Crear política simple que permita todo a usuarios autenticados
CREATE POLICY "Permitir todo a usuarios autenticados" ON mantenimientos
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar que se creó correctamente
SELECT 'Tabla mantenimientos creada correctamente' as resultado;

