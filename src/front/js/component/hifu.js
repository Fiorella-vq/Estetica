import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import HifuImage from "../../img/hifu.jpg";

export const Hifu = () => {
  const navigate = useNavigate();
  
    const handleButtonClick = () => {
      navigate("/calendario", { state: { from: "HIFU" } });
    };
  return (
    <div className="card2">
      <div className="image-container">
        <img src={HifuImage} className="service-img2" alt="hifu" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>HIFU </u>
        </h5>
        <p>
          <strong>Descripción:</strong> Tratamiento no invasivo de lifting
          facial y corporal mediante ultrasonido focalizado de alta intensidad.
          Estimula el colágeno en profundidad, reafirma la piel, reduce la
          flacidez y mejora el contorno facial sin necesidad de cirugía. Ideal
          para rostro, cuello, papada, abdomen, brazos y piernas. Resultados
          progresivos desde la primera sesión.
        </p>
        <p>
          <strong>Duración por sesión:</strong> 60 minutos por zona.

        </p>
        <p>
          <strong>Resultados esperados:</strong> Efecto lifting, mayor firmeza y
          definición del rostro.
        </p>
        <p>
          <strong>Frecuencia:</strong> 1 a 2 veces al año.
        </p>
        <p>
          <strong>Precio:</strong> $3.000 por zona.
        </p>
        <p>
          <strong>Recomendaciones:</strong> No exponerse al sol ni usar
          maquillaje el mismo día.
        </p>
        <p>
          <strong>Promoción:</strong> Sí.
        </p>
          <p>
          <strong>Zonas:</strong> Rostro, cuello, papada, abdomen, brazos, piernas
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
