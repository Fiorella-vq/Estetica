import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import CriolipolisisImage from "../../img/Criolipólisis.jpg";

export const Criolipolisis = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/calendario", { state: { from: "Criolipolisis" } });
  };
  return (
    <div className="card2">
      <div className="image-container">
        <img
          src={CriolipolisisImage}
          className="service-img2"
          alt="criolipolisis"
        />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Criolipolisis</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Reducción de grasa localizada mediante
          congelación controlada. Elimina células grasas sin cirugía, con
          resultados visibles en pocas semanas.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente 45 a 60 minutos.
        </p>
        <p>
          <strong>Precio:</strong> $2.500 por zona.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Mantener una dieta equilibrada y
          evitar el consumo de alcohol o cafeína antes del tratamiento.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado en personas con
          problemas circulatorios, enfermedades de la piel o mujeres
          embarazadas.
        </p>
        <p>
          <strong>Resultados esperados:</strong> Reducción de grasa localizada y
          contorno corporal más definido.
        </p>
        <p>
          <strong>Promoción:</strong> Sí.
        </p>
      </div>
      <div className="btn-container">
        <button className="btn" onClick={handleButtonClick}>
          Agendate!
        </button>
      </div>
    </div>
  );
};
