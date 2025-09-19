import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import MantenimientoForm from './MantenimientoForm';
import './MantenimientosList.css';

const MantenimientosList = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    fetchMantenimientos();
    fetchEquipos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      const { data, error } = await supabase
        .from('mantenimientos')
        .select(`
          *,
          equipos (
            nombre,
            numero_serie
          )
        `)
        .order('fecha_programada', { ascending: false });

      if (error) throw error;
      setMantenimientos(data || []);
    } catch (error) {
      console.error('Error fetching mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipos = async () => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('id, nombre, numero_serie')
        .order('nombre');

      if (error) throw error;
      setEquipos(data || []);
    } catch (error) {
      console.error('Error fetching equipos:', error);
    }
  };

  const handleCreate = () => {
    setEditingMantenimiento(null);
    setShowForm(true);
  };

  const handleEdit = (mantenimiento) => {
    setEditingMantenimiento(mantenimiento);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este mantenimiento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mantenimientos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchMantenimientos();
    } catch (error) {
      console.error('Error deleting mantenimiento:', error);
      alert('Error al eliminar el mantenimiento');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMantenimiento(null);
    fetchMantenimientos();
  };

  const filteredMantenimientos = mantenimientos.filter(mantenimiento => {
    const matchesSearch = 
      mantenimiento.equipos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || mantenimiento.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'programado': return 'status-scheduled';
      case 'en_proceso': return 'status-progress';
      case 'completado': return 'status-completed';
      case 'cancelado': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'programado': return 'Programado';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getTipoColor = (tipo) => {
    return tipo === 'preventivo' ? 'tipo-preventivo' : 'tipo-correctivo';
  };

  const getTipoText = (tipo) => {
    return tipo === 'preventivo' ? 'Preventivo' : 'Correctivo';
  };

  if (loading) {
    return (
      <div className="mantenimientos-container">
        <div className="loading">Cargando mantenimientos...</div>
      </div>
    );
  }

  return (
    <div className="mantenimientos-container">
      <div className="mantenimientos-header">
        <div>
          <h1>Mantenimientos</h1>
          <p>Gestión de mantenimientos preventivos y correctivos</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuevo Mantenimiento
        </button>
      </div>

      <div className="mantenimientos-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar mantenimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos los estados</option>
          <option value="programado">Programado</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="mantenimientos-table-container">
        <table className="mantenimientos-table">
          <thead>
            <tr>
              <th>EQUIPO</th>
              <th>TIPO</th>
              <th>TÉCNICO</th>
              <th>FECHA PROGRAMADA</th>
              <th>ESTADO</th>
              <th>COSTO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredMantenimientos.map((mantenimiento) => (
              <tr key={mantenimiento.id}>
                <td>
                  <div className="equipo-info">
                    <div className="equipo-nombre">
                      {mantenimiento.equipos?.nombre || 'Equipo no encontrado'}
                    </div>
                    <div className="equipo-descripcion">
                      {mantenimiento.descripcion || 'Sin descripción'}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`tipo-badge ${getTipoColor(mantenimiento.tipo)}`}>
                    {getTipoText(mantenimiento.tipo)}
                  </span>
                </td>
                <td>{mantenimiento.tecnico}</td>
                <td>
                  <div className="fecha-info">
                    {new Date(mantenimiento.fecha_programada).toLocaleDateString()}
                    {mantenimiento.fecha_completado && (
                      <div className="fecha-completado">
                        Completado: {new Date(mantenimiento.fecha_completado).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(mantenimiento.estado)}`}>
                    {getStatusText(mantenimiento.estado)}
                  </span>
                </td>
                <td>
                  {mantenimiento.costo ? `$${mantenimiento.costo.toFixed(2)}` : '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(mantenimiento)}
                      title="Editar mantenimiento"
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(mantenimiento.id)}
                      title="Eliminar mantenimiento"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMantenimientos.length === 0 && (
          <div className="empty-state">
            <p>No se encontraron mantenimientos</p>
          </div>
        )}
      </div>

      {showForm && (
        <MantenimientoForm
          mantenimiento={editingMantenimiento}
          equipos={equipos}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MantenimientosList;