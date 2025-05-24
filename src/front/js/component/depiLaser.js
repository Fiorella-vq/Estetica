import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import Laser from "../../img/depilaser.png";

export const Depilaser = () => {
  const navigate = useNavigate();
  
    const handleButtonClick = () => {
      navigate("/calendario", { state: { from: "Depilación Láser" } });
    };
  return (
    <div className="card2">
      <div className="image-container">
        <img src={Laser} className="service-img2" alt="Depilación Láser" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Depilación Láser</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Eliminación progresiva del vello en
          distintas zonas del cuerpo con tecnología láser. Resultados visibles
          desde la primera sesión. Ideal para hombres y mujeres.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente entre 30 a 60
          minutos, según la zona.
        </p>
        <p>
          <strong>Duración del tratamiento:</strong> De 6 a 10 sesiones,
          dependiendo del tipo de vello y la zona tratada.
        </p>
        <p>
          <strong>Frecuencia:</strong> Cada 4 a 6 semanas.
        </p>
        <p>
          <strong>Precio:</strong> A consultar según la zona.
        </p>
        <p>
          <strong>Zonas incluidas:</strong> Piernas, axilas, cavado, rostro,
          brazos, entre otras.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Evitar exposición solar en la zona
          tratada 48 horas antes y después del tratamiento. No usar cremas
          autobronceantes ni productos irritantes.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado para personas con
          piel bronceada, embarazadas, en periodo de lactancia, o con ciertas
          condiciones médicas (consultar previamente).
        </p>
        <p>
          <strong>Resultados esperados:</strong> Reducción del vello en un 80% a
          90% luego de varias sesiones. Piel más suave y sin irritaciones.
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
