import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './MantenimientoForm.css';

const MantenimientoForm = ({ mantenimiento, equipos, onClose }) => {
  const [formData, setFormData] = useState({
    equipo_id: '',
    tipo: 'preventivo',
    tecnico: '',
    fecha_programada: '',
    fecha_completado: '',
    estado: 'programado',
    costo: '',
    descripcion: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mantenimiento) {
      setFormData({
        equipo_id: mantenimiento.equipo_id || '',
        tipo: mantenimiento.tipo || 'preventivo',
        tecnico: mantenimiento.tecnico || '',
        fecha_programada: mantenimiento.fecha_programada || '',
        fecha_completado: mantenimiento.fecha_completado || '',
        estado: mantenimiento.estado || 'programado',
        costo: mantenimiento.costo || '',
        descripcion: mantenimiento.descripcion || '',
        observaciones: mantenimiento.observaciones || ''
      });
    }
  }, [mantenimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        costo: formData.costo ? parseFloat(formData.costo) : null,
        fecha_completado: formData.fecha_completado || null
      };

      if (mantenimiento) {
        // Actualizar mantenimiento existente
        const { error } = await supabase
          .from('mantenimientos')
          .update(dataToSubmit)
          .eq('id', mantenimiento.id);

        if (error) throw error;
      } else {
        // Crear nuevo mantenimiento
        const { error } = await supabase
          .from('mantenimientos')
          .insert([dataToSubmit]);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving mantenimiento:', error);
      alert('Error al guardar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mantenimiento-form-overlay">
      <div className="mantenimiento-form-container">
        <div className="mantenimiento-form-header">
          <h2>{mantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="mantenimiento-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="equipo_id">Equipo *</label>
              <select
                id="equipo_id"
                name="equipo_id"
                value={formData.equipo_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map(equipo => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} - {equipo.numero_serie}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo de Mantenimiento *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tecnico">Técnico Responsable *</label>
              <input
                type="text"
                id="tecnico"
                name="tecnico"
                value={formData.tecnico}
                onChange={handleChange}
                placeholder="Nombre del técnico"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="programado">Programado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_programada">Fecha Programada *</label>
              <input
                type="date"
                id="fecha_programada"
                name="fecha_programada"
                value={formData.fecha_programada}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_completado">Fecha Completado</label>
              <input
                type="date"
                id="fecha_completado"
                name="fecha_completado"
                value={formData.fecha_completado}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costo">Costo</label>
              <input
                type="number"
                id="costo"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del mantenimiento"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones adicionales..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (mantenimiento ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MantenimientoForm;