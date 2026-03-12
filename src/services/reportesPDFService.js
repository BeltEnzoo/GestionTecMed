import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

class ReportesPDFService {
  
  // Generar reporte de inventario completo
  static async generarReporteInventario(equiposData) {
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Título del reporte
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INVENTARIO', 105, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Equipamiento Médico', 105, 30, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaActual}`, 14, 40);
    
    // Estadísticas generales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 14, 55);
    
    // Manejar diferentes tipos de datos
    let equipos = [];
    if (Array.isArray(equiposData)) {
      equipos = equiposData;
    } else if (equiposData && typeof equiposData === 'object') {
      // Si es un objeto, extraer todos los arrays de equipos
      equipos = [
        ...(equiposData.equiposFueraServicio || []),
        ...(equiposData.equiposSinMantenimientoReciente || []),
        ...(equiposData.mantenimientosVencidos || [])
      ];
    }
    
    const totalEquipos = equipos.length;
    const equiposActivos = equipos.filter(e => e.estado === 'Activo' || e.estado === 'activo').length;
    const equiposMantenimiento = equipos.filter(e => e.estado === 'En Mantenimiento' || e.estado === 'mantenimiento').length;
    const equiposFueraServicio = equipos.filter(e => e.estado === 'Fuera de Servicio' || e.estado === 'fuera_servicio').length;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Equipos: ${totalEquipos}`, 14, 65);
    doc.text(`Equipos Activos: ${equiposActivos}`, 14, 72);
    doc.text(`En Mantenimiento: ${equiposMantenimiento}`, 14, 79);
    doc.text(`Fuera de Servicio: ${equiposFueraServicio}`, 14, 86);
    
    // Tabla de equipos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE EQUIPOS', 14, 100);
    
    const tableData = equipos.map(equipo => [
      equipo.marca || 'Sin marca',
      equipo.modelo || 'Sin modelo',
      equipo.numero_serie || 'Sin serie',
      equipo.ubicacion || 'Sin ubicación',
      equipo.estado || 'Sin estado',
      equipo.ano_fabricacion || 'Sin año',
      equipo.categoria || 'Sin categoría'
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [['Marca', 'Modelo', 'S/N', 'Ubicación', 'Estado', 'Año', 'Categoría']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
    });
    
    // Guardar el PDF
    const nombreArchivo = `inventario_equipos_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }

  // Generar reporte de mantenimientos
  static async generarReporteMantenimientos(mantenimientosData) {
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE MANTENIMIENTOS', 105, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Equipamiento Médico', 105, 30, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaActual}`, 14, 40);
    
    // Estadísticas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE MANTENIMIENTOS', 14, 55);
    
    // Manejar diferentes tipos de datos
    let mantenimientos = [];
    if (Array.isArray(mantenimientosData)) {
      mantenimientos = mantenimientosData;
    } else if (mantenimientosData && typeof mantenimientosData === 'object') {
      // Si es un objeto, buscar arrays de mantenimientos
      mantenimientos = mantenimientosData.mantenimientos || mantenimientosData.data || [];
    }
    
    const totalMantenimientos = mantenimientos.length;
    const preventivos = mantenimientos.filter(m => m.tipo === 'preventivo').length;
    const correctivos = mantenimientos.filter(m => m.tipo === 'correctivo').length;
    const completados = mantenimientos.filter(m => m.estado === 'completado').length;
    const pendientes = mantenimientos.filter(m => m.estado === 'programado').length;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Mantenimientos: ${totalMantenimientos}`, 14, 65);
    doc.text(`Preventivos: ${preventivos}`, 14, 72);
    doc.text(`Correctivos: ${correctivos}`, 14, 79);
    doc.text(`Completados: ${completados}`, 14, 86);
    doc.text(`Pendientes: ${pendientes}`, 14, 93);
    
    // Tabla de mantenimientos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE MANTENIMIENTOS', 14, 105);
    
    const tableData = mantenimientos.map(mantenimiento => [
      mantenimiento.equipo_marca || 'Sin marca',
      mantenimiento.equipo_modelo || 'Sin modelo',
      mantenimiento.tipo || 'Sin tipo',
      mantenimiento.tecnico || 'Sin técnico',
      mantenimiento.fecha_programada ? new Date(mantenimiento.fecha_programada).toLocaleDateString('es-ES') : 'Sin fecha',
      mantenimiento.estado || 'Sin estado',
      mantenimiento.descripcion ? mantenimiento.descripcion.substring(0, 30) + '...' : 'Sin descripción'
    ]);
    
    autoTable(doc, {
      startY: 110,
      head: [['Equipo', 'Modelo', 'Tipo', 'Técnico', 'Fecha Prog.', 'Estado', 'Descripción']],
      body: tableData,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
    });
    
    const nombreArchivo = `mantenimientos_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }

  // Generar reporte de eventos por equipo
  static async generarReporteEventosEquipo(equipo, eventos) {
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`REPORTE DE EVENTOS`, 105, 20, { align: 'center' });
    
    // Información del equipo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${equipo.marca || 'Sin marca'} ${equipo.modelo || 'Sin modelo'}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`S/N: ${equipo.numero_serie || 'Sin serie'}`, 105, 37, { align: 'center' });
    doc.text(`Ubicación: ${equipo.ubicacion || 'Sin ubicación'}`, 105, 44, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${fechaActual}`, 14, 55);
    
    // Estadísticas del equipo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE EVENTOS', 14, 70);
    
    const totalEventos = eventos.length;
    const eventosResueltos = eventos.filter(e => e.estado === 'resuelto').length;
    const eventosPendientes = eventos.filter(e => e.estado === 'pendiente').length;
    const eventosCriticos = eventos.filter(e => e.prioridad === 'alta').length;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Eventos: ${totalEventos}`, 14, 80);
    doc.text(`Eventos Resueltos: ${eventosResueltos}`, 14, 87);
    doc.text(`Eventos Pendientes: ${eventosPendientes}`, 14, 94);
    doc.text(`Eventos Críticos: ${eventosCriticos}`, 14, 101);
    
    // Tabla de eventos
    if (eventos.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE EVENTOS', 14, 115);
      
      const tableData = eventos.map(evento => [
        evento.tipo_evento || 'Sin tipo',
        evento.prioridad || 'Sin prioridad',
        evento.estado || 'Sin estado',
        evento.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-ES') : 'Sin fecha',
        evento.tecnico_responsable || 'Sin técnico',
        evento.titulo ? evento.titulo.substring(0, 25) + '...' : 'Sin título'
      ]);
      
      autoTable(doc, {
        startY: 120,
        head: [['Tipo', 'Prioridad', 'Estado', 'Fecha', 'Técnico', 'Título']],
        body: tableData,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 },
        pageBreak: 'auto',
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${doc.internal.getNumberOfPages()}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE EVENTOS', 14, 115);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('No hay eventos registrados para este equipo.', 14, 125);
    }
    
    const nombreArchivo = `eventos_${equipo.marca || 'equipo'}_${equipo.numero_serie || 'sin_serie'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }

  // Generar reporte de costos
  static async generarReporteCostos(equipos, mantenimientos) {
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE COSTOS', 105, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Análisis Financiero del Equipamiento Médico', 105, 30, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaActual}`, 14, 40);
    
    // Análisis de costos por departamento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('COSTOS POR DEPARTAMENTO', 14, 55);
    
    // Simular datos de costos (en un sistema real vendrían de la base de datos)
    const costosPorDepto = {
      'UTI': 45000,
      'Emergencias': 32000,
      'Cirugía': 28000,
      'Cardiología': 15000,
      'Neurología': 22000
    };
    
    let yPosition = 65;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    Object.entries(costosPorDepto).forEach(([depto, costo]) => {
      doc.text(`${depto}: $${costo.toLocaleString()}`, 14, yPosition);
      yPosition += 7;
    });
    
    // Total general
    const totalGeneral = Object.values(costosPorDepto).reduce((sum, costo) => sum + costo, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GENERAL: $${totalGeneral.toLocaleString()}`, 14, yPosition + 5);
    
    // Recomendaciones
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDACIONES', 14, yPosition + 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const recomendaciones = [
      '• Considerar renovación de equipos con más de 10 años de antigüedad',
      '• Implementar mantenimientos preventivos más frecuentes en UTI',
      '• Evaluar contratos de servicio para reducir costos operativos',
      '• Monitorear equipos críticos con mayor frecuencia'
    ];
    
    recomendaciones.forEach((rec, index) => {
      doc.text(rec, 14, yPosition + 30 + (index * 7));
    });
    
    const nombreArchivo = `reporte_costos_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }

  // Generar reporte de stock/insumos completo
  static async generarReporteStock(stockData) {
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Título del reporte
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE STOCK / INSUMOS', 105, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Inventario Completo del Taller', 105, 30, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaActual}`, 14, 40);
    
    // Estadísticas generales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GENERAL', 14, 55);
    
    const stock = Array.isArray(stockData) ? stockData : [];
    const totalItems = stock.length;
    
    // Calcular estadísticas
    const stockBajo = stock.filter(item => 
      item.stock_minimo && item.cantidad <= item.stock_minimo
    ).length;
    
    const stockVencido = stock.filter(item => {
      if (!item.fecha_vencimiento) return false;
      const fechaVenc = new Date(item.fecha_vencimiento);
      return fechaVenc < new Date();
    }).length;
    
    const stockPorVencer = stock.filter(item => {
      if (!item.fecha_vencimiento) return false;
      const fechaVenc = new Date(item.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
      return diasRestantes > 0 && diasRestantes <= 30;
    }).length;
    
    // Calcular valor total del stock
    const valorTotal = stock.reduce((sum, item) => {
      const costo = parseFloat(item.costo_unitario) || 0;
      const cantidad = parseFloat(item.cantidad) || 0;
      return sum + (costo * cantidad);
    }, 0);
    
    // Agrupar por categoría
    const porCategoria = {};
    stock.forEach(item => {
      const cat = item.categoria || 'Sin categoría';
      if (!porCategoria[cat]) {
        porCategoria[cat] = 0;
      }
      porCategoria[cat]++;
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Items: ${totalItems}`, 14, 65);
    doc.text(`Stock Bajo: ${stockBajo}`, 14, 72);
    doc.text(`Stock Vencido: ${stockVencido}`, 14, 79);
    doc.text(`Por Vencer (30 días): ${stockPorVencer}`, 14, 86);
    doc.setFont('helvetica', 'bold');
    doc.text(`Valor Total del Stock: $${valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 93);
    
    // Distribución por categoría
    if (Object.keys(porCategoria).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUCIÓN POR CATEGORÍA', 14, 105);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let yPos = 115;
      Object.entries(porCategoria).forEach(([categoria, cantidad]) => {
        doc.text(`${categoria}: ${cantidad} items`, 14, yPos);
        yPos += 7;
      });
    }
    
    // Tabla de stock completo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const startY = Object.keys(porCategoria).length > 0 ? 140 : 110;
    doc.text('DETALLE COMPLETO DE STOCK', 14, startY);
    
    const tableData = stock.map(item => {
      // Determinar estado
      let estado = 'Normal';
      if (item.stock_minimo && item.cantidad <= item.stock_minimo) {
        estado = 'Stock Bajo';
      } else if (item.fecha_vencimiento) {
        const fechaVenc = new Date(item.fecha_vencimiento);
        const hoy = new Date();
        if (fechaVenc < hoy) {
          estado = 'Vencido';
        } else {
          const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
          if (diasRestantes <= 30) {
            estado = 'Por Vencer';
          }
        }
      }
      
      // Formatear fecha de vencimiento
      const fechaVenc = item.fecha_vencimiento 
        ? new Date(item.fecha_vencimiento).toLocaleDateString('es-ES')
        : '-';
      
      // Calcular valor total del item
      const costoUnit = parseFloat(item.costo_unitario) || 0;
      const cantidad = parseFloat(item.cantidad) || 0;
      const valorTotal = (costoUnit * cantidad).toLocaleString('es-ES', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
      
      return [
        item.nombre || 'Sin nombre',
        item.categoria || 'Sin categoría',
        `${parseFloat(item.cantidad).toFixed(2)} ${item.unidad_medida || 'unidades'}`,
        item.ubicacion || '-',
        item.proveedor || '-',
        fechaVenc,
        estado,
        item.costo_unitario ? `$${costoUnit.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
        `$${valorTotal}`
      ];
    });
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Nombre', 'Categoría', 'Cantidad', 'Ubicación', 'Proveedor', 'Vencimiento', 'Estado', 'Costo Unit.', 'Valor Total']],
      body: tableData,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
    });
    
    // Guardar el PDF
    const nombreArchivo = `stock_insumos_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }
}

export default ReportesPDFService;
