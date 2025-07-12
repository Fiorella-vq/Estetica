import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import CuponerasImage from "../../img/cuponeras.jpg";

export const Cuponeras = () => {
  const navigate = useNavigate();

  return (
    <div className="card2">
      <div className="image-container">
        <img src={CuponerasImage} className="service-img2" alt="cuponeras" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Cuponeras</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Disponibles cuponeras desde $5.000 para
          tratamientos continuos o combinados. Consultá por beneficios
          especiales.
        </p>
      </div>
      <div className="btn-container">
        <button className="btn" onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    </div>
  );
};
