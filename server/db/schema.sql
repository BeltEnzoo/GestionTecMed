-- Gestión Parque Tecnológico — esquema Neon (sin auth.users de Supabase)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================== SEDES =====================
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL UNIQUE,
  codigo VARCHAR(50) UNIQUE,
  ciudad VARCHAR(100),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_sedes_updated_at ON sedes;
CREATE TRIGGER update_sedes_updated_at
  BEFORE UPDATE ON sedes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== EQUIPOS =====================
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  nombre TEXT,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  codigo_interno TEXT,
  categoria TEXT,
  estado TEXT DEFAULT 'activo',
  año_fabricacion INTEGER,
  potencia TEXT,
  voltaje TEXT,
  dimensiones TEXT,
  peso TEXT,
  certificaciones TEXT,
  fecha_vencimiento_garantia DATE,
  edificio TEXT,
  piso TEXT,
  sala TEXT,
  cama TEXT,
  responsable TEXT,
  departamento TEXT,
  frecuencia_mantenimiento TEXT,
  proveedor_mantenimiento TEXT,
  costo_promedio_mantenimiento NUMERIC(12, 2),
  costo_adquisicion NUMERIC(12, 2),
  valor_actual NUMERIC(12, 2),
  notas TEXT,
  archivos JSONB DEFAULT '[]'::jsonb,
  años_antigüedad NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_equipos_estado ON equipos(estado);
CREATE INDEX IF NOT EXISTS idx_equipos_departamento ON equipos(departamento);
CREATE INDEX IF NOT EXISTS idx_equipos_nombre ON equipos(nombre);

DROP TRIGGER IF EXISTS update_equipos_updated_at ON equipos;
CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_equipos_antiguedad()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.año_fabricacion IS NOT NULL THEN
    NEW.años_antigüedad := EXTRACT(YEAR FROM CURRENT_DATE)::NUMERIC - NEW.año_fabricacion;
  ELSE
    NEW.años_antigüedad := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_equipos_antiguedad ON equipos;
CREATE TRIGGER trg_equipos_antiguedad
  BEFORE INSERT OR UPDATE OF año_fabricacion ON equipos
  FOR EACH ROW EXECUTE FUNCTION set_equipos_antiguedad();

-- ===================== MANTENIMIENTOS =====================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('preventivo', 'correctivo')),
  tecnico VARCHAR(100) NOT NULL,
  fecha_programada DATE NOT NULL,
  fecha_completado DATE,
  estado VARCHAR(20) DEFAULT 'programado'
    CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado')),
  costo DECIMAL(10, 2),
  descripcion TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_estado ON mantenimientos(estado);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha_programada ON mantenimientos(fecha_programada);

DROP TRIGGER IF EXISTS update_mantenimientos_updated_at ON mantenimientos;
CREATE TRIGGER update_mantenimientos_updated_at
  BEFORE UPDATE ON mantenimientos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== HISTORIAL EVENTOS =====================
CREATE TABLE IF NOT EXISTS historial_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN (
    'Falla', 'Reparación', 'Observación', 'Incidente',
    'Mantenimiento Preventivo', 'Mantenimiento Correctivo',
    'Calibración', 'Actualización', 'Otro'
  )),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_evento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  estado VARCHAR(20) DEFAULT 'Registrado' CHECK (estado IN (
    'Registrado', 'En Proceso', 'Resuelto', 'Cancelado'
  )),
  tecnico_responsable VARCHAR(255),
  costo_reparacion DECIMAL(10, 2),
  fecha_resolucion TIMESTAMPTZ,
  observaciones_resolucion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_eventos_equipo_id ON historial_eventos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_fecha_evento ON historial_eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_tipo_evento ON historial_eventos(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_historial_eventos_estado ON historial_eventos(estado);

DROP TRIGGER IF EXISTS update_historial_eventos_updated_at ON historial_eventos;
CREATE TRIGGER update_historial_eventos_updated_at
  BEFORE UPDATE ON historial_eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== USUARIOS =====================
CREATE TABLE IF NOT EXISTS perfiles_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  departamento VARCHAR(100),
  cargo VARCHAR(100),
  rol VARCHAR(50) DEFAULT 'Invitado' CHECK (rol IN (
    'Superusuario', 'Administrador', 'Técnico', 'Invitado'
  )),
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  ultimo_acceso TIMESTAMPTZ,
  permisos JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  sede_id UUID REFERENCES sedes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_email ON perfiles_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_rol ON perfiles_usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_usuarios_estado ON perfiles_usuarios(estado);

DROP TRIGGER IF EXISTS update_perfiles_usuarios_updated_at ON perfiles_usuarios;
CREATE TRIGGER update_perfiles_usuarios_updated_at
  BEFORE UPDATE ON perfiles_usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== STOCK =====================
CREATE TABLE IF NOT EXISTS stock_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL DEFAULT 'Insumo',
  cantidad NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unidad_medida TEXT NOT NULL DEFAULT 'unidades',
  stock_minimo NUMERIC(10, 2) DEFAULT 0,
  ubicacion TEXT,
  proveedor TEXT,
  costo_unitario NUMERIC(10, 2),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_stock_nombre ON stock_insumos(nombre);
CREATE INDEX IF NOT EXISTS idx_stock_categoria ON stock_insumos(categoria);
CREATE INDEX IF NOT EXISTS idx_stock_ubicacion ON stock_insumos(ubicacion);
CREATE INDEX IF NOT EXISTS idx_stock_fecha_vencimiento ON stock_insumos(fecha_vencimiento);

DROP TRIGGER IF EXISTS update_stock_insumos_updated_at ON stock_insumos;
CREATE TRIGGER update_stock_insumos_updated_at
  BEFORE UPDATE ON stock_insumos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== ARCHIVOS (para Vercel serverless, sin disco) =====================
CREATE TABLE IF NOT EXISTS archivo_blobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  equipo_id TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  content BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archivo_blobs_equipo_id ON archivo_blobs(equipo_id);
