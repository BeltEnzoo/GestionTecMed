import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EquipoEventsChart = ({ equipoId, equipoNombre }) => {
  const [eventosData, setEventosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line'); // 'line' o 'bar'

  useEffect(() => {
    if (equipoId) {
      fetchEventosData();
    }
  }, [equipoId]);

  const fetchEventosData = async () => {
    try {
      setLoading(true);
      
      // Obtener eventos del equipo
      const { data: eventos, error } = await supabase
        .from('historial_eventos')
        .select('*')
        .eq('equipo_id', equipoId)
        .order('fecha_evento', { ascending: true });

      if (error) {
        console.error('Error fetching eventos:', error);
        return;
      }

      // Procesar datos por meses (últimos 12 meses)
      const eventosPorMes = {};
      const meses = [];
      
      // Generar últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const mesKey = fecha.toISOString().slice(0, 7); // YYYY-MM
        const mesNombre = fecha.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short' 
        });
        meses.push(mesNombre);
        eventosPorMes[mesKey] = 0;
      }

      // Contar eventos por mes
      eventos?.forEach(evento => {
        const mesEvento = evento.fecha_evento?.slice(0, 7);
        if (eventosPorMes.hasOwnProperty(mesEvento)) {
          eventosPorMes[mesEvento]++;
        }
      });

      // Convertir a arrays para el gráfico
      const datosEventos = Object.values(eventosPorMes);
      
      setEventosData({
        labels: meses,
        datasets: [
          {
            label: 'Eventos',
            data: datosEventos,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          }
        ]
      });

    } catch (error) {
      console.error('Error processing eventos data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Eventos de ${equipoNombre}`,
        font: {
          family: 'Georgia, Times New Roman, Times, serif',
          size: 16,
          weight: 'bold'
        },
        color: '#111827'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `Eventos: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Georgia, Times New Roman, Times, serif',
            size: 12
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Georgia, Times New Roman, Times, serif',
            size: 12
          },
          color: '#6b7280',
          stepSize: 1
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (loading) {
    return (
      <div className="equipo-events-chart">
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Cargando datos de eventos...</p>
        </div>
      </div>
    );
  }

  if (!eventosData) {
    return (
      <div className="equipo-events-chart">
        <div className="chart-empty">
          <div className="chart-empty-icon">
            📊
          </div>
          <p>No hay datos de eventos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="equipo-events-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>Frecuencia de Eventos</h3>
          <p>Últimos 12 meses</p>
        </div>
        <div className="chart-controls">
          <button 
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Línea
          </button>
          <button 
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            Barras
          </button>
        </div>
      </div>
      
      <div className="chart-container">
        {chartType === 'line' ? (
          <Line data={eventosData} options={chartOptions} />
        ) : (
          <Bar data={eventosData} options={chartOptions} />
        )}
      </div>
      
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Total Eventos:</span>
          <span className="stat-value">
            {eventosData.datasets[0].data.reduce((a, b) => a + b, 0)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Promedio/mes:</span>
          <span className="stat-value">
            {(eventosData.datasets[0].data.reduce((a, b) => a + b, 0) / 12).toFixed(1)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mes más activo:</span>
          <span className="stat-value">
            {eventosData.labels[eventosData.datasets[0].data.indexOf(Math.max(...eventosData.datasets[0].data))]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipoEventsChart;
