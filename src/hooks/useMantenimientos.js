import { useState, useEffect } from 'react';
import {
  getMantenimientos,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento,
  searchMantenimientos
} from '../services/mantenimientosService';

export const useMantenimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar mantenimientos al inicializar
  useEffect(() => {
    loadMantenimientos();
  }, []);

  const loadMantenimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getMantenimientos();
      
      if (fetchError) {
        setError(fetchError);
      } else {
        setMantenimientos(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewMantenimiento = async (mantenimientoData) => {
    try {
      setError(null);
      const { data, error: createError } = await createMantenimiento(mantenimientoData);
      
      if (createError) {
        setError(createError);
        return { success: false, error: createError };
      } else {
        setMantenimientos(prev => [data, ...prev]);
        return { success: true, data };
      }
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateExistingMantenimiento = async (id, mantenimientoData) => {
    try {
      setError(null);
      const { data, error: updateError } = await updateMantenimiento(id, mantenimientoData);
      
      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      } else {
        setMantenimientos(prev => 
          prev.map(m => m.id === id ? data : m)
        );
        return { success: true, data };
      }
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteExistingMantenimiento = async (id) => {
    try {
      setError(null);
      const { data, error: deleteError } = await deleteMantenimiento(id);
      
      if (deleteError) {
        setError(deleteError);
        return { success: false, error: deleteError };
      } else {
        setMantenimientos(prev => prev.filter(m => m.id !== id));
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const searchMantenimientosWithFilters = async (searchTerm, filterStatus) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: searchError } = await searchMantenimientos(searchTerm, filterStatus);
      
      if (searchError) {
        setError(searchError);
      } else {
        setMantenimientos(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    mantenimientos,
    loading,
    error,
    createMantenimiento: createNewMantenimiento,
    updateMantenimiento: updateExistingMantenimiento,
    deleteMantenimiento: deleteExistingMantenimiento,
    searchMantenimientos: searchMantenimientosWithFilters,
    refreshMantenimientos: loadMantenimientos
  };
};



