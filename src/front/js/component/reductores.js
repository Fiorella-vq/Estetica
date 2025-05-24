import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import ReductoresImage from "../../img/reductores.jpg";

export const Reductores = () => {
  const navigate = useNavigate();
  
    const handleButtonClick = () => {
      navigate("/calendario", { state: { from: "Tratamiento Reductor" } });
    };

  return (
    <div className="card2">
      <div className="image-container">
        <img src={ReductoresImage} className="service-img2" alt="reductores" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Tratamiento Reductor</u>
        </h5>
        <p>
          <strong>Descripción:</strong>Tratamientos para modelar el cuerpo,
          reducir medidas y mejorar la textura de la piel. Disponibles con
          aparatología (ultrasonido, ondas rusas, radiofrecuencia) o de forma
          manual.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente 60 minutos.
        </p>
        <p>
          <strong>Frecuencia:</strong> Se recomienda realizar de 1 a 2 sesiones
          por semana, según las necesidades y el área a tratar.
        </p>
        <p>
          <strong>Precio:</strong> $850 por sesión.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Mantener una dieta equilibrada y
          evitar el consumo de alcohol o cafeína antes y después del
          tratamiento.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado en personas con
          problemas circulatorios, enfermedades cardíacas o mujeres embarazadas.
        </p>
        <p>
          <strong>Resultados esperados:</strong> Reducción de grasa localizada,
          contorno corporal más definido y piel más firme.
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
