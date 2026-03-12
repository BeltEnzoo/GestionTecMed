-- Tabla para gestionar stock/insumos del taller
CREATE TABLE IF NOT EXISTS stock_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_stock_nombre ON stock_insumos(nombre);
CREATE INDEX IF NOT EXISTS idx_stock_categoria ON stock_insumos(categoria);
CREATE INDEX IF NOT EXISTS idx_stock_ubicacion ON stock_insumos(ubicacion);
CREATE INDEX IF NOT EXISTS idx_stock_fecha_vencimiento ON stock_insumos(fecha_vencimiento);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_stock_insumos_updated_at
  BEFORE UPDATE ON stock_insumos
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE stock_insumos ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer stock"
  ON stock_insumos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos los usuarios autenticados pueden insertar
CREATE POLICY "Usuarios autenticados pueden insertar stock"
  ON stock_insumos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Todos los usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar stock"
  ON stock_insumos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Todos los usuarios autenticados pueden eliminar
CREATE POLICY "Usuarios autenticados pueden eliminar stock"
  ON stock_insumos
  FOR DELETE
  TO authenticated
  USING (true);


