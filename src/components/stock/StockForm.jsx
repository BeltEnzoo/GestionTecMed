import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "./StockForm.css";

const StockForm = ({ stock, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: stock || {
      nombre: "",
      descripcion: "",
      categoria: "Insumo",
      cantidad: 0,
      unidadMedida: "unidades",
      stockMinimo: 0,
      ubicacion: "",
      proveedor: "",
      costoUnitario: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      fechaVencimiento: "",
      notas: "",
    },
  });

  useEffect(() => {
    if (stock) {
      reset(stock);
    }
  }, [stock, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  const categorias = ["Insumo", "Accesorio", "Repuesto", "Herramienta", "Otro"];

  const unidadesMedida = [
    "unidades",
    "litros",
    "kg",
    "metros",
    "cajas",
    "paquetes",
    "rollos",
  ];

  return (
    <div className="stock-form-overlay">
      <div className="stock-form-container">
        <div className="stock-form-header">
          <h2>{stock ? "Editar Insumo" : "Nuevo Insumo"}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="stock-form-close-btn"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="stock-form">
          <div className="stock-form-grid">
            {/* Nombre */}
            <div className="stock-form-group">
              <label htmlFor="nombre">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                {...register("nombre", { required: "El nombre es obligatorio" })}
                className={errors.nombre ? "error" : ""}
              />
              {errors.nombre && (
                <span className="error-message">{errors.nombre.message}</span>
              )}
            </div>

            {/* Categoría */}
            <div className="stock-form-group">
              <label htmlFor="categoria">
                Categoría <span className="required">*</span>
              </label>
              <select
                id="categoria"
                {...register("categoria", { required: true })}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div className="stock-form-group">
              <label htmlFor="cantidad">
                Cantidad <span className="required">*</span>
              </label>
              <input
                type="number"
                id="cantidad"
                step="0.01"
                min="0"
                {...register("cantidad", {
                  required: "La cantidad es obligatoria",
                  min: { value: 0, message: "La cantidad debe ser mayor o igual a 0" },
                })}
                className={errors.cantidad ? "error" : ""}
              />
              {errors.cantidad && (
                <span className="error-message">{errors.cantidad.message}</span>
              )}
            </div>

            {/* Unidad de Medida */}
            <div className="stock-form-group">
              <label htmlFor="unidadMedida">
                Unidad de Medida <span className="required">*</span>
              </label>
              <select
                id="unidadMedida"
                {...register("unidadMedida", { required: true })}
              >
                {unidadesMedida.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {unidad}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Mínimo */}
            <div className="stock-form-group">
              <label htmlFor="stockMinimo">Stock Mínimo</label>
              <input
                type="number"
                id="stockMinimo"
                step="0.01"
                min="0"
                {...register("stockMinimo", {
                  min: { value: 0, message: "El stock mínimo debe ser mayor o igual a 0" },
                })}
                className={errors.stockMinimo ? "error" : ""}
              />
              {errors.stockMinimo && (
                <span className="error-message">{errors.stockMinimo.message}</span>
              )}
            </div>

            {/* Ubicación */}
            <div className="stock-form-group">
              <label htmlFor="ubicacion">Ubicación en Taller</label>
              <input
                type="text"
                id="ubicacion"
                placeholder="Ej: Estante A, Cajón 3"
                {...register("ubicacion")}
              />
            </div>

            {/* Proveedor */}
            <div className="stock-form-group">
              <label htmlFor="proveedor">Proveedor</label>
              <input
                type="text"
                id="proveedor"
                {...register("proveedor")}
              />
            </div>

            {/* Costo Unitario */}
            <div className="stock-form-group">
              <label htmlFor="costoUnitario">Costo Unitario ($)</label>
              <input
                type="number"
                id="costoUnitario"
                step="0.01"
                min="0"
                {...register("costoUnitario", {
                  min: { value: 0, message: "El costo debe ser mayor o igual a 0" },
                })}
                className={errors.costoUnitario ? "error" : ""}
              />
              {errors.costoUnitario && (
                <span className="error-message">{errors.costoUnitario.message}</span>
              )}
            </div>

            {/* Fecha de Ingreso */}
            <div className="stock-form-group">
              <label htmlFor="fechaIngreso">Fecha de Ingreso</label>
              <input
                type="date"
                id="fechaIngreso"
                {...register("fechaIngreso")}
              />
            </div>

            {/* Fecha de Vencimiento */}
            <div className="stock-form-group">
              <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
              <input
                type="date"
                id="fechaVencimiento"
                {...register("fechaVencimiento")}
              />
            </div>

            {/* Descripción */}
            <div className="stock-form-group full-width">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                rows="3"
                {...register("descripcion")}
              />
            </div>

            {/* Notas */}
            <div className="stock-form-group full-width">
              <label htmlFor="notas">Notas</label>
              <textarea
                id="notas"
                rows="3"
                {...register("notas")}
              />
            </div>
          </div>

          <div className="stock-form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {stock ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockForm;


