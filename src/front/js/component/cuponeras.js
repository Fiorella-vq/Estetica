import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import CuponerasImage from "../../img/cuponeras.jpg";

export const Cuponeras = () => {
  const navigate = useNavigate();
  const [lugar, setLugar] = useState("local");

  const precios = {
    local: 6990,
    casa: 4990,
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: "Cuponera Full Reductora (8 sesiones)",
        precio: precios[lugar],
        lugar,
      },
    });
  };

  return (
    <div className="card2">
      <div className="image-container">
        <img src={CuponerasImage} className="service-img2" alt="cuponeras" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Cuponera Full Reductora</u>
        </h5>
        <p><em>Incluye 8 sesiones con aparatología</em></p>
        <p>
          <strong>Descripción:</strong> Paquete completo de 8 sesiones reductoras con aparatología
          para modelar el cuerpo y reducir grasa localizada.
        </p>
        <p>
          <strong>Aparatología incluida:</strong> Radiofrecuencia, lipoláser, ultracavitación y electrodos.
        </p>
        <p>
          <strong>Precio:</strong> ${precios[lugar]} en modalidad {lugar === "local" ? "en local" : "a domicilio"}.
        </p>
        <p>
          <strong>Beneficios:</strong> Ideal para tratamientos continuos o combinados. Consultá por promociones adicionales.
        </p>

        <div className="radio-group" style={{ marginTop: "1rem" }}>
          <p><strong>¿Dónde querés hacerte el servicio?</strong></p>
          <label>
            <input
              type="radio"
              name="lugar"
              value="local"
              checked={lugar === "local"}
              onChange={() => setLugar("local")}
            />
            En local (${precios.local})
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="lugar"
              value="casa"
              checked={lugar === "casa"}
              onChange={() => setLugar("casa")}
            />
            En casa (${precios.casa})
          </label>
        </div>
      </div>
      <div className="btn-container">
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
