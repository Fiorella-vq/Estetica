import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import MasajesImage from "../../img/descontracturantes.jpg";

export const MasajesDescontracturantes = () => {
  const navigate = useNavigate();
  
    const handleButtonClick = () => {
      navigate("/calendario", { state: { from: "Masajes Descontracturantes" } });
    };
  return (
    <div className="card2">
      <div className="image-container">
        <img
          src={MasajesImage}
          className="service-img2"
          alt="masajes descontracturantes"
        />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Masajes Descontracturantes</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Masajes para aliviar tensiones
          musculares y contracturas. Se puede complementar con ventosas o
          piedras calientes para mayor relajación.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente 45 a 60 minutos.
        </p>
        <p>
          <strong>Frecuencia:</strong> Se recomienda realizar sesiones semanales
          o según lo necesite el paciente.
        </p>
        <p>
          <strong>Precio:</strong> $700 por sesión.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Mantenerse hidratado después de la
          sesión y evitar actividades físicas intensas durante las primeras 24
          horas.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado en caso de
          lesiones graves, infecciones cutáneas o problemas circulatorios.
        </p>
        <p>
          <strong>Resultados esperados:</strong> Reducción de dolor muscular,
          mejor flexibilidad y sensación de relajación profunda.
        </p>
         <p>
          <strong>Promoción:</strong> No.
        </p>
         <p>
          <strong>Zonas:</strong> Espalda, cuello, piernas, cuerpo completo.
        </p>
       
      </div>
      <div className="btn-container">
        <button
          className="btn"
      onClick={handleButtonClick} 
        >
          Agendate!
        </button>
      </div>
    </div>
  );
};
