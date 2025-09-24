import React from 'react';
import './TechBackground.css';

const TechBackground = () => {
  return (
    <div className="tech-background">
      {/* Grid tecnológico */}
      <div className="tech-grid"></div>
      
      {/* Partículas flotantes */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      {/* Iconos médicos flotantes */}
      <div className="medical-icons">
        <div className="medical-icon icon-1">🏥</div>
        <div className="medical-icon icon-2">💊</div>
        <div className="medical-icon icon-3">🩺</div>
        <div className="medical-icon icon-4">⚕️</div>
        <div className="medical-icon icon-5">🩹</div>
        <div className="medical-icon icon-6">🧬</div>
        <div className="medical-icon icon-7">🔬</div>
        <div className="medical-icon icon-8">💉</div>
        <div className="medical-icon icon-9">📊</div>
        <div className="medical-icon icon-10">⚡</div>
      </div>
      
      {/* Líneas de conexión */}
      <div className="connection-lines">
        <div className="line line-1"></div>
        <div className="line line-2"></div>
        <div className="line line-3"></div>
        <div className="line line-4"></div>
        <div className="line line-5"></div>
      </div>
      
      {/* Ondas de datos */}
      <div className="data-waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>
      
      {/* Overlay con gradiente */}
      <div className="tech-overlay"></div>
    </div>
  );
};

export default TechBackground;
