import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import CejasImage from "../../img/cejas.jpg";

const opcionesCejas = [
  {
    nombre: "Perfilado de Cejas",
    descripcion: `Perfilado y diseño de cejas para resaltar tu expresión natural. Incluye depilación y armonización según tu rostro.`,
    precio: { local: 500, casa: 800 },
  },
  {
    nombre: "Laminado de Cejas + Lifting",
    descripcion: `Tratamiento para alisar, definir y fijar las cejas. Ideal para lograr un efecto peinado duradero.`,
    precio: { local: 1500, casa: 1300 },
  },
];

export const PerfiladoCejas = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState(opcionesCejas[0]);
  const [lugar, setLugar] = useState("local");

  const handleTipoChange = (e) => {
    const seleccion = opcionesCejas.find((op) => op.nombre === e.target.value);
    if (seleccion) setTipo(seleccion);
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: tipo.nombre,
        precio: tipo.precio[lugar],
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
          <u>{tipo.nombre}</u>
        </h5>

        <p>
          <strong>Descripción:</strong> {tipo.descripcion}
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
          <strong>Resultados esperados:</strong> Cejas más definidas, simétricas
          y con efecto natural o peinado según el tratamiento.
        </p>
        <p>
          <strong>Promoción:</strong> No.
        </p>

        {/* Selector tipo moved here */}
        <div className="form-group" style={{ marginBottom: "1rem", marginTop: "2rem" }}>
          <label htmlFor="tipo" style={{ display: "block", marginBottom: "0.5rem" }}>
            Elegí el tipo:
          </label>
          <select
            id="tipo"
            value={tipo.nombre}
            onChange={handleTipoChange}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            {opcionesCejas.map((opcion) => (
              <option key={opcion.nombre} value={opcion.nombre}>
                {opcion.nombre} - ${opcion.precio[lugar]}
              </option>
            ))}
          </select>
        </div>

        <p style={{ fontWeight: "bold" }}>
          Precio: ${tipo.precio[lugar]} por sesión
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
            En local (${tipo.precio.local})
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="lugar"
              value="casa"
              checked={lugar === "casa"}
              onChange={() => setLugar("casa")}
            />
            En domicilio (${tipo.precio.casa})
          </label>
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
