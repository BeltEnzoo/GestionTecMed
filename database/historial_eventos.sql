-- Crear tabla para el historial de eventos/sucesos de equipos
CREATE TABLE IF NOT EXISTS historial_eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN (
    'Falla',
    'Reparación', 
    'Observación',
    'Incidente',
    'Mantenimiento Preventivo',
    'Mantenimiento Correctivo',
    'Calibración',
    'Actualización',
    'Otro'
  )),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  estado VARCHAR(20) DEFAULT 'Registrado' CHECK (estado IN (
    'Registrado',
    'En Proceso', 
    'Resuelto',
    'Cancelado'
  )),
  tecnico_responsable VARCHAR(255),
  costo_reparacion DECIMAL(10,2),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  observaciones_resolucion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_eventos_equipo_id ON historial_eventos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_fecha_evento ON historial_eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_tipo_evento ON historial_eventos(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_estado ON historial_eventos(estado);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_historial_eventos_updated_at 
    BEFORE UPDATE ON historial_eventos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE historial_eventos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS
CREATE POLICY "Los usuarios autenticados pueden ver todos los eventos" 
    ON historial_eventos FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios autenticados pueden insertar eventos" 
    ON historial_eventos FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Los usuarios autenticados pueden actualizar eventos" 
    ON historial_eventos FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios autenticados pueden eliminar eventos" 
    ON historial_eventos FOR DELETE 
    TO authenticated 
    USING (true);

-- Insertar algunos eventos de ejemplo (opcional)
INSERT INTO historial_eventos (
  equipo_id, 
  tipo_evento, 
  titulo, 
  descripcion, 
  prioridad, 
  estado, 
  tecnico_responsable
) VALUES 
(
  (SELECT id FROM equipos LIMIT 1),
  'Falla',
  'Equipo no responde',
  'El equipo dejó de funcionar durante el turno de la mañana. Se verificó la alimentación eléctrica y está correcta.',
  'Alta',
  'Resuelto',
  'Juan Pérez'
),
(
  (SELECT id FROM equipos LIMIT 1 OFFSET 1),
  'Mantenimiento Preventivo',
  'Calibración programada',
  'Calibración anual del equipo según protocolo del fabricante.',
  'Media',
  'Registrado',
  'María González'
),
(
  (SELECT id FROM equipos LIMIT 1 OFFSET 2),
  'Observación',
  'Ruido anormal detectado',
  'Se detectó un ruido inusual en el funcionamiento del equipo. No afecta la operación pero requiere monitoreo.',
  'Baja',
  'En Proceso',
  'Carlos Rodríguez'
);

-- Comentarios sobre la tabla
COMMENT ON TABLE historial_eventos IS 'Registro de eventos, fallas y sucesos de los equipos médicos';
COMMENT ON COLUMN historial_eventos.tipo_evento IS 'Tipo de evento: Falla, Reparación, Observación, etc.';
COMMENT ON COLUMN historial_eventos.prioridad IS 'Prioridad del evento: Alta, Media, Baja';
COMMENT ON COLUMN historial_eventos.estado IS 'Estado actual del evento: Registrado, En Proceso, Resuelto, Cancelado';
COMMENT ON COLUMN historial_eventos.fecha_evento IS 'Fecha y hora cuando ocurrió el evento';
COMMENT ON COLUMN historial_eventos.fecha_resolucion IS 'Fecha y hora cuando se resolvió el evento';


