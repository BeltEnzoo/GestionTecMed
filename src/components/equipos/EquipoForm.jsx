import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import "./EquipoForm.css";

// Esquema de validación con Zod - TODOS LOS CAMPOS OPCIONALES
const equipoSchema = z.object({
  // Datos básicos - todos opcionales
  nombre: z.string().optional().transform(val => val === '' ? null : val),
  marca: z.string().optional().transform(val => val === '' ? null : val),
  modelo: z.string().optional().transform(val => val === '' ? null : val),
  numeroSerie: z.string().optional().transform(val => val === '' ? null : val),
  codigoInterno: z.string().optional().transform(val => val === '' ? null : val),
  categoria: z.string().optional().transform(val => val === '' ? null : val),
  estado: z.string().optional().default('activo'),
  
  // Especificaciones técnicas - todos opcionales
  añoFabricacion: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined(),
    z.nan()
  ]).optional().transform((val) => {
    if (val === '' || val === null || val === undefined || val === 'NaN' || Number.isNaN(val)) return new Date().getFullYear();
    if (typeof val === 'string' && val.trim() === '') return new Date().getFullYear();
    const num = Number(val);
    return isNaN(num) ? new Date().getFullYear() : num;
  }),
  potencia: z.string().optional().transform(val => val === '' ? null : val),
  voltaje: z.string().optional().transform(val => val === '' ? null : val),
  dimensiones: z.string().optional().transform(val => val === '' ? null : val),
  peso: z.string().optional().transform(val => val === '' ? null : val),
  certificaciones: z.string().optional().transform(val => val === '' ? null : val),
  fechaVencimientoGarantia: z.string().optional().transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    return val;
  }),
  
  // Ubicación - todos opcionales
  edificio: z.string().optional().transform(val => val === '' ? null : val),
  piso: z.string().optional().transform(val => val === '' ? null : val),
  sala: z.string().optional().transform(val => val === '' ? null : val),
  cama: z.string().optional().transform(val => val === '' ? null : val),
  responsable: z.string().optional().transform(val => val === '' ? null : val),
  departamento: z.string().optional().transform(val => val === '' ? null : val),
  
  // Mantenimiento
  frecuenciaMantenimiento: z.string().optional().transform(val => val === '' ? null : val),
  proveedorMantenimiento: z.string().optional().transform(val => val === '' ? null : val),
  costoPromedioMantenimiento: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined(),
    z.nan()
  ]).optional().transform((val) => {
    if (val === '' || val === null || val === undefined || val === 'NaN' || Number.isNaN(val)) return null;
    if (typeof val === 'string' && val.trim() === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  
  // Información financiera
  costoAdquisicion: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined(),
    z.nan()
  ]).optional().transform((val) => {
    if (val === '' || val === null || val === undefined || val === 'NaN' || Number.isNaN(val)) return null;
    if (typeof val === 'string' && val.trim() === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  valorActual: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined(),
    z.nan()
  ]).optional().transform((val) => {
    if (val === '' || val === null || val === undefined || val === 'NaN' || Number.isNaN(val)) return null;
    if (typeof val === 'string' && val.trim() === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  
  // Notas
  notas: z.string().optional().transform(val => val === '' ? null : val),
});

const EquipoForm = ({ equipo = null, onSave, onCancel, isOpen }) => {
  const [activeTab, setActiveTab] = useState("basicos");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      codigoInterno: "",
      categoria: "",
      estado: "activo",
      añoFabricacion: new Date().getFullYear(),
      edificio: "",
      sala: "",
      responsable: "",
      departamento: "",
    },
  });

  // Actualizar el formulario cuando cambie el equipo a editar
  useEffect(() => {
    if (equipo) {
      // Debug: verificar qué datos llegan
      console.log('Datos del equipo para editar:', equipo);
      
      reset({
        nombre: equipo.nombre || "",
        marca: equipo.marca || "",
        modelo: equipo.modelo || "",
        numeroSerie: equipo.numero_serie || "",
        codigoInterno: equipo.codigo_interno || "",
        categoria: equipo.categoria || "",
        estado: equipo.estado || "activo",
        añoFabricacion: equipo.año_fabricacion || new Date().getFullYear(),
        potencia: equipo.potencia || "",
        voltaje: equipo.voltaje || "",
        dimensiones: equipo.dimensiones || "",
        peso: equipo.peso || "",
        certificaciones: equipo.certificaciones || "",
        fechaVencimientoGarantia: equipo.fecha_vencimiento_garantia || "",
        edificio: equipo.edificio || "",
        piso: equipo.piso || "",
        sala: equipo.sala || "",
        cama: equipo.cama || "",
        responsable: equipo.responsable || "",
        departamento: equipo.departamento || "",
        frecuenciaMantenimiento: equipo.frecuencia_mantenimiento || "",
        proveedorMantenimiento: equipo.proveedor_mantenimiento || "",
        costoPromedioMantenimiento: equipo.costo_promedio_mantenimiento || "",
        costoAdquisicion: equipo.costo_adquisicion || "",
        valorActual: equipo.valor_actual || "",
        notas: equipo.notas || ""
      });
    } else {
      // Resetear a valores por defecto para nuevo equipo
      reset({
        nombre: "",
        marca: "",
        modelo: "",
        numeroSerie: "",
        codigoInterno: "",
        categoria: "",
        estado: "activo",
        añoFabricacion: new Date().getFullYear(),
        edificio: "",
        sala: "",
        responsable: "",
        departamento: "",
      });
    }
  }, [equipo, reset]);

  const watchedAñoFabricacion = watch("añoFabricacion");
  const añosAntigüedad = watchedAñoFabricacion 
    ? new Date().getFullYear() - watchedAñoFabricacion 
    : 0;

  const categorias = [
    "Monitoreo",
    "Respiración",
    "Diagnóstico",
    "Cirugía",
    "Emergencias",
    "Laboratorio",
    "Imagenología",
    "Rehabilitación",
    "Otros"
  ];

  const estados = [
    { value: "activo", label: "Activo" },
    { value: "mantenimiento", label: "En Mantenimiento" },
    { value: "fuera-servicio", label: "Fuera de Servicio" },
    { value: "retirado", label: "Retirado" },
  ];

  const departamentos = [
    "UCI",
    "Emergencias",
    "Quirófanos",
    "Cardiología",
    "Neurología",
    "Pediatría",
    "Ginecología",
    "Traumatología",
    "Laboratorio",
    "Imagenología",
    "Otros"
  ];

  const tabs = [
    { id: "basicos", label: "Datos Básicos", icon: CpuChipIcon },
    { id: "tecnicos", label: "Especificaciones", icon: WrenchScrewdriverIcon },
    { id: "ubicacion", label: "Ubicación", icon: MapPinIcon },
    { id: "mantenimiento", label: "Mantenimiento", icon: WrenchScrewdriverIcon },
    { id: "financiero", label: "Financiero", icon: CurrencyDollarIcon },
    { id: "archivos", label: "Archivos", icon: DocumentIcon },
  ];

  const onSubmit = (data) => {
    // Los datos ya están procesados por Zod
    const processedData = {
      ...data,
      añosAntigüedad,
      archivos: uploadedFiles,
      fechaCreacion: new Date().toISOString(),
    };
    onSave(processedData);
    reset();
    setUploadedFiles([]);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  if (!isOpen) return null;

  return (
    <div className="equipo-form-overlay">
      <div className="equipo-form-container">
        <div className="equipo-form-header">
          <h2 className="equipo-form-title">
            {equipo ? `Editar Equipo - ${equipo.nombre || 'Sin nombre'}` : "Nuevo Equipo Médico"}
          </h2>
          <button
            onClick={onCancel}
            className="equipo-form-close-btn"
            aria-label="Cerrar formulario"
          >
                          <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="equipo-form-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`equipo-form-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="equipo-form-content">
          {/* Tab: Datos Básicos */}
          {activeTab === "basicos" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Información General</h3>
                <div className="equipo-form-grid">
                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Nombre del Equipo
                    </label>
                    <input
                      {...register("nombre")}
                      className="equipo-form-input"
                      placeholder="Ej: Monitor de Signos Vitales"
                    />
                    {errors.nombre && (
                      <span className="equipo-form-error">{errors.nombre.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Marca
                    </label>
                    <input
                      {...register("marca")}
                      className="equipo-form-input"
                      placeholder="Ej: Philips"
                    />
                    {errors.marca && (
                      <span className="equipo-form-error">{errors.marca.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Modelo
                    </label>
                    <input
                      {...register("modelo")}
                      className="equipo-form-input"
                      placeholder="Ej: MP70"
                    />
                    {errors.modelo && (
                      <span className="equipo-form-error">{errors.modelo.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Número de Serie
                    </label>
                    <input
                      {...register("numeroSerie")}
                      className="equipo-form-input"
                      placeholder="Ej: MSV001"
                    />
                    {errors.numeroSerie && (
                      <span className="equipo-form-error">{errors.numeroSerie.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Código Interno
                    </label>
                    <input
                      {...register("codigoInterno")}
                      className="equipo-form-input"
                      placeholder="Ej: HOSP-MSV-001"
                    />
                    {errors.codigoInterno && (
                      <span className="equipo-form-error">{errors.codigoInterno.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Categoría
                    </label>
                    <select {...register("categoria")} className="equipo-form-select">
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.categoria && (
                      <span className="equipo-form-error">{errors.categoria.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Estado
                    </label>
                    <select {...register("estado")} className="equipo-form-select">
                      {estados.map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                    {errors.estado && (
                      <span className="equipo-form-error">{errors.estado.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Especificaciones Técnicas */}
          {activeTab === "tecnicos" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Especificaciones Técnicas</h3>
                <div className="equipo-form-grid">
                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Año de Fabricación
                    </label>
                    <input
                      {...register("añoFabricacion", { valueAsNumber: true })}
                      type="number"
                      className="equipo-form-input"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    {errors.añoFabricacion && (
                      <span className="equipo-form-error">{errors.añoFabricacion.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Años de Antigüedad
                    </label>
                    <input
                      value={añosAntigüedad}
                      className="equipo-form-input"
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Potencia
                    </label>
                    <input
                      {...register("potencia")}
                      className="equipo-form-input"
                      placeholder="Ej: 100W"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Voltaje
                    </label>
                    <input
                      {...register("voltaje")}
                      className="equipo-form-input"
                      placeholder="Ej: 220V"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Dimensiones
                    </label>
                    <input
                      {...register("dimensiones")}
                      className="equipo-form-input"
                      placeholder="Ej: 30x20x15 cm"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Peso
                    </label>
                    <input
                      {...register("peso")}
                      className="equipo-form-input"
                      placeholder="Ej: 5.2 kg"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Certificaciones
                    </label>
                    <input
                      {...register("certificaciones")}
                      className="equipo-form-input"
                      placeholder="Ej: CE, FDA"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Vencimiento de Garantía
                    </label>
                    <input
                      {...register("fechaVencimientoGarantia")}
                      type="date"
                      className="equipo-form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Ubicación */}
          {activeTab === "ubicacion" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Ubicación del Equipo</h3>
                <div className="equipo-form-grid">
                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Edificio
                    </label>
                    <input
                      {...register("edificio")}
                      className="equipo-form-input"
                      placeholder="Ej: Edificio Principal"
                    />
                    {errors.edificio && (
                      <span className="equipo-form-error">{errors.edificio.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Piso
                    </label>
                    <input
                      {...register("piso")}
                      className="equipo-form-input"
                      placeholder="Ej: 3er Piso"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Sala/Área
                    </label>
                    <input
                      {...register("sala")}
                      className="equipo-form-input"
                      placeholder="Ej: UCI - Cama 1"
                    />
                    {errors.sala && (
                      <span className="equipo-form-error">{errors.sala.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Cama/Posición
                    </label>
                    <input
                      {...register("cama")}
                      className="equipo-form-input"
                      placeholder="Ej: Cama 1"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Responsable del Área
                    </label>
                    <input
                      {...register("responsable")}
                      className="equipo-form-input"
                      placeholder="Ej: Dr. Juan Pérez"
                    />
                    {errors.responsable && (
                      <span className="equipo-form-error">{errors.responsable.message}</span>
                    )}
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Departamento
                    </label>
                    <select {...register("departamento")} className="equipo-form-select">
                      <option value="">Seleccionar departamento</option>
                      {departamentos.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.departamento && (
                      <span className="equipo-form-error">{errors.departamento.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Mantenimiento */}
          {activeTab === "mantenimiento" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Información de Mantenimiento</h3>
                <div className="equipo-form-grid">
                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Frecuencia de Mantenimiento
                    </label>
                    <select {...register("frecuenciaMantenimiento")} className="equipo-form-select">
                      <option value="">Seleccionar frecuencia</option>
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                      <option value="según-uso">Según uso</option>
                    </select>
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Proveedor de Mantenimiento
                    </label>
                    <input
                      {...register("proveedorMantenimiento")}
                      className="equipo-form-input"
                      placeholder="Ej: Servitec Médica"
                    />
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Costo Promedio de Mantenimiento
                    </label>
                    <div className="equipo-form-input-group">
                      <span className="equipo-form-input-prefix">$</span>
                      <input
                        {...register("costoPromedioMantenimiento", { valueAsNumber: true })}
                        type="number"
                        className="equipo-form-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Financiero */}
          {activeTab === "financiero" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Información Financiera</h3>
                <div className="equipo-form-grid">
                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Costo de Adquisición
                    </label>
                    <div className="equipo-form-input-group">
                      <span className="equipo-form-input-prefix">$</span>
                      <input
                        {...register("costoAdquisicion", { valueAsNumber: true })}
                        type="number"
                        className="equipo-form-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="equipo-form-field">
                    <label className="equipo-form-label">
                      Valor Actual Estimado
                    </label>
                    <div className="equipo-form-input-group">
                      <span className="equipo-form-input-prefix">$</span>
                      <input
                        {...register("valorActual", { valueAsNumber: true })}
                        type="number"
                        className="equipo-form-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Archivos */}
          {activeTab === "archivos" && (
            <div className="equipo-form-tab-content">
              <div className="equipo-form-section">
                <h3 className="equipo-form-section-title">Archivos y Documentos</h3>
                
                <div className="equipo-form-file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="equipo-form-file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="equipo-form-file-label">
                    <PhotoIcon className="h-5 w-5" />
                    <span>Seleccionar archivos</span>
                  </label>
                  <p className="equipo-form-file-help">
                    Formatos: JPG, PNG, PDF, DOC, DOCX (Máx. 10MB)
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="equipo-form-files-list">
                    <h4 className="equipo-form-files-title">Archivos Subidos:</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="equipo-form-file-item">
                        <DocumentIcon className="h-4 w-4" />
                        <span className="equipo-form-file-name">{file.name}</span>
                        <span className="equipo-form-file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="equipo-form-file-remove"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="equipo-form-field">
                  <label className="equipo-form-label">
                    Notas y Observaciones
                  </label>
                  <textarea
                    {...register("notas")}
                    className="equipo-form-textarea"
                    rows="4"
                    placeholder="Información adicional sobre el equipo..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="equipo-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="equipo-form-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="equipo-form-btn-save"
            >
              {equipo ? "Actualizar Equipo" : "Crear Equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipoForm;

