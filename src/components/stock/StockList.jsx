import React, { useState, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { stockService } from "../../services/stockService";
import { useAuth } from "../../hooks/useAuth";
import StockForm from "./StockForm";
import ReportesPDFService from "../../services/reportesPDFService";
import "./StockList.css";

const StockList = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await stockService.getAll();
    if (error) {
      console.error("Error fetching stock:", error);
      alert("Error al cargar el stock: " + error.message);
    } else {
      setStock(data || []);
    }
    setLoading(false);
  };

  const filteredStock = searchTerm
    ? stock.filter(
        (item) =>
          item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : stock;

  const getStockStatus = (item) => {
    if (item.stock_minimo && item.cantidad <= item.stock_minimo) {
      return "bajo";
    }
    if (item.fecha_vencimiento) {
      const fechaVenc = new Date(item.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
      if (diasRestantes < 0) return "vencido";
      if (diasRestantes <= 30) return "por-vencer";
    }
    return "normal";
  };

  const getStockStatusClass = (status) => {
    switch (status) {
      case "bajo":
        return "stock-badge bajo";
      case "vencido":
        return "stock-badge vencido";
      case "por-vencer":
        return "stock-badge por-vencer";
      default:
        return "stock-badge normal";
    }
  };

  const getStockStatusLabel = (status) => {
    switch (status) {
      case "bajo":
        return "Stock Bajo";
      case "vencido":
        return "Vencido";
      case "por-vencer":
        return "Por Vencer";
      default:
        return "Normal";
    }
  };

  const handleNewStock = () => {
    setEditingStock(null);
    setShowForm(true);
  };

  const handleEditStock = (item) => {
    setEditingStock(item);
    setShowForm(true);
  };

  const handleDeleteStock = async (item) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${item.nombre}"?`
      )
    ) {
      const { error } = await stockService.delete(item.id);
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        fetchStock();
      }
    }
  };

  const handleSaveStock = async (stockData) => {
    const stockToSave = {
      ...stockData,
      createdBy: user?.id,
    };

    let result;
    if (editingStock) {
      result = await stockService.update(editingStock.id, stockToSave);
    } else {
      result = await stockService.create(stockToSave);
    }

    if (result.error) {
      alert("Error al guardar: " + result.error.message);
    } else {
      setShowForm(false);
      setEditingStock(null);
      fetchStock();
    }
  };

  const handleExportPDF = async () => {
    try {
      await ReportesPDFService.generarReporteStock(stock);
    } catch (error) {
      console.error("Error exportando stock:", error);
      alert("Error al exportar el stock. Por favor, inténtalo de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="stock-container">
        <div className="stock-loading">Cargando stock...</div>
      </div>
    );
  }

  return (
    <div className="stock-container">
      <div className="stock-header">
        <div>
          <h1 className="stock-title">Stock / Insumos</h1>
          <p className="stock-subtitle">
            Gestión de insumos, accesorios y repuestos del taller
          </p>
        </div>
        <div className="stock-header-actions">
          <button onClick={handleExportPDF} className="btn-export-pdf">
            <DocumentArrowDownIcon className="btn-icon-small" />
            Exportar PDF
          </button>
          <button onClick={handleNewStock} className="btn-nuevo-stock">
            <PlusIcon className="btn-icon-small" />
            Nuevo Insumo
          </button>
        </div>
      </div>

      <div className="stock-search">
        <div className="search-wrapper">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, ubicación o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {showForm && (
        <StockForm
          stock={editingStock}
          onSave={handleSaveStock}
          onCancel={() => {
            setShowForm(false);
            setEditingStock(null);
          }}
        />
      )}

      <div className="stock-table-container">
        {filteredStock.length === 0 ? (
          <div className="stock-empty">
            <p>No se encontraron insumos.</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="btn-clear-search">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="stock-name-cell">
                        <strong>{item.nombre}</strong>
                        {item.descripcion && (
                          <span className="stock-description">{item.descripcion}</span>
                        )}
                      </div>
                    </td>
                    <td>{item.categoria}</td>
                    <td>
                      {item.cantidad} {item.unidad_medida}
                      {item.stock_minimo && (
                        <span className="stock-minimo">
                          (mín: {item.stock_minimo})
                        </span>
                      )}
                    </td>
                    <td>{item.ubicacion || "-"}</td>
                    <td>{item.proveedor || "-"}</td>
                    <td>
                      <span className={getStockStatusClass(status)}>
                        {getStockStatusLabel(status)}
                      </span>
                    </td>
                    <td>
                      <div className="stock-actions">
                        <button
                          onClick={() => handleEditStock(item)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStock(item)}
                          className="btn-action btn-delete"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockList;

