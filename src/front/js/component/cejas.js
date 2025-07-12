import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import CejasImage from "../../img/cejas.jpg";

export const PerfiladoCejas = () => {
  const navigate = useNavigate();
  const [lugar, setLugar] = useState("local");

  const precios = {
    local: 500,
    casa: 800,
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: "Perfilado de Cejas",
        precio: precios[lugar],
        lugar,
      },
    });
  };

  return (
    <div className="card2">
      <div className="image-container">
        <img src={CejasImage} className="service-img2" alt="cejas" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Perfilado de Cejas</u>
        </h5>

        <p>
          <strong>Descripción:</strong> Perfilado y diseño de cejas para
          resaltar tu expresión natural. Incluye depilación y armonización según
          tu rostro.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente 30 a 45 minutos.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Evitar mojar o maquillar las cejas
          durante las primeras 24 horas. No frotar la zona tratada.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado en caso de
          infecciones cutáneas o alergias a los productos utilizados.
        </p>
        <p>
          <strong>Resultados esperados:</strong> Cejas más definidas y
          simétricas, con un efecto natural y duradero.
        </p>
        <p>
          <strong>Promoción:</strong> No.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Precio:</p>
          <div className="radio-group">
            <p><strong>¿Dónde querés hacerte el servicio?</strong></p>
            <label>
              <input
                type="radio"
                name="lugar"
                value="local"
                checked={lugar === "local"}
                onChange={() => setLugar("local")}
              />
              En local ($ {precios.local})
            </label>
            <label style={{ marginLeft: "1rem" }}>
              <input
                type="radio"
                name="lugar"
                value="casa"
                checked={lugar === "casa"}
                onChange={() => setLugar("casa")}
              />
              En domicilio ($ {precios.casa})
            </label>
          </div>
        </div>
      </div>

      <div className="btn-container" style={{ marginTop: "1.5rem" }}>
        <button className="btn" onClick={handleButtonClick}>
          Agendá tu cita
        </button>
        <button className="btn" onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    </div>
  );
};
