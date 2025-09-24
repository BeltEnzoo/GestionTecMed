import React, { useState, useEffect } from 'react';
import './MedicalCarousel.css';

const MedicalCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Imágenes de equipos médicos reales
  const medicalImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '🫁 Respirador Artificial',
      description: 'Equipo de ventilación mecánica para cuidados intensivos'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '📊 Monitor de Signos Vitales',
      description: 'Sistema de monitoreo continuo de pacientes'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '⚡ Desfibrilador',
      description: 'Equipo de emergencia para reanimación cardíaca'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '💉 Bomba de Infusión',
      description: 'Sistema de administración controlada de medicamentos'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '🏥 Equipo de Anestesia',
      description: 'Sistema completo para procedimientos quirúrgicos'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '🖥️ Centro de Monitoreo',
      description: 'Sala de control centralizada de equipos médicos'
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '🩺 Estetoscopio Digital',
      description: 'Equipo de diagnóstico médico avanzado'
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '🏥 Sala de Cirugía',
      description: 'Entorno quirúrgico con equipos de última generación'
    }
  ];

  // Cambiar imagen automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % medicalImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [medicalImages.length]);

  return (
    <div className="medical-carousel">
      <div className="carousel-container">
        {medicalImages.map((image, index) => (
          <div
            key={image.id}
            className={`carousel-slide ${index === currentImage ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h3 className="slide-title">{image.title}</h3>
                <p className="slide-description">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicadores */}
      <div className="carousel-indicators">
        {medicalImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImage ? 'active' : ''}`}
            onClick={() => setCurrentImage(index)}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Flechas de navegación */}
      <button
        className="carousel-nav prev"
        onClick={() => setCurrentImage((prev) => (prev - 1 + medicalImages.length) % medicalImages.length)}
        aria-label="Imagen anterior"
      >
        ‹
      </button>
      <button
        className="carousel-nav next"
        onClick={() => setCurrentImage((prev) => (prev + 1) % medicalImages.length)}
        aria-label="Siguiente imagen"
      >
        ›
      </button>
    </div>
  );
};

export default MedicalCarousel;
