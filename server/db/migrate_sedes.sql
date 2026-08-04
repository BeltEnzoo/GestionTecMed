-- Multi-sede migration (idempotente)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================== SEDES (multi-hospital) =====================
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

INSERT INTO sedes (nombre, codigo, ciudad)
VALUES
  ('Hospital Juárez', 'juarez', 'Benito Juárez'),
  ('Hospital Tres Arroyos', 'tres-arroyos', 'Tres Arroyos')
ON CONFLICT (nombre) DO NOTHING;

-- sede_id en tablas operativas
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE stock_insumos ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE perfiles_usuarios ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE archivo_blobs ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);

-- Datos existentes → Juárez
UPDATE equipos SET sede_id = (SELECT id FROM sedes WHERE codigo = 'juarez' LIMIT 1)
WHERE sede_id IS NULL;
UPDATE stock_insumos SET sede_id = (SELECT id FROM sedes WHERE codigo = 'juarez' LIMIT 1)
WHERE sede_id IS NULL;
UPDATE archivo_blobs SET sede_id = (SELECT id FROM sedes WHERE codigo = 'juarez' LIMIT 1)
WHERE sede_id IS NULL;

-- Unicidad por sede (mismo código/serie puede existir en otro hospital)
DROP INDEX IF EXISTS uq_equipos_numero_serie;
DROP INDEX IF EXISTS uq_equipos_codigo_interno;
CREATE UNIQUE INDEX IF NOT EXISTS uq_equipos_numero_serie_sede
  ON equipos (sede_id, numero_serie) WHERE numero_serie IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_equipos_codigo_interno_sede
  ON equipos (sede_id, codigo_interno) WHERE codigo_interno IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipos_sede_id ON equipos(sede_id);
CREATE INDEX IF NOT EXISTS idx_stock_sede_id ON stock_insumos(sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_sede_id ON perfiles_usuarios(sede_id);

-- Roles: agregar Superusuario (sin romper filas existentes)
ALTER TABLE perfiles_usuarios DROP CONSTRAINT IF EXISTS perfiles_usuarios_rol_check;
ALTER TABLE perfiles_usuarios
  ADD CONSTRAINT perfiles_usuarios_rol_check
  CHECK (rol IN ('Superusuario', 'Administrador', 'Técnico', 'Invitado'));

-- Admin del sistema → Superusuario (sin sede fija)
UPDATE perfiles_usuarios
SET rol = 'Superusuario', sede_id = NULL
WHERE email = 'admin@hospital.com';
