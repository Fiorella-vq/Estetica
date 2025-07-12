import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import PestañasImage from "../../img/pestanas.webp";

const zonasPestanas = [
  { nombre: "Volumen tecnológico", precio: { local: 1000, casa: 1300 } },
  { nombre: "Lifting", precio: { local: 700, casa: 1000 } },
];

export const PerfiladoPestanas = () => {
  const navigate = useNavigate();
  const [zonaSeleccionada, setZonaSeleccionada] = useState(zonasPestanas[0]);
  const [lugar, setLugar] = useState("local");

  const handleZonaChange = (e) => {
    const seleccion = zonasPestanas.find((z) => z.nombre === e.target.value);
    if (seleccion) setZonaSeleccionada(seleccion);
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: `Perfilado de Pestañas - ${zonaSeleccionada.nombre}`,
        precio: zonaSeleccionada.precio[lugar],
        lugar,
      },
    });
  };

  return (
    <div className="card2">
      <div className="image-container">
        <img src={PestañasImage} className="service-img2" alt="pestañas" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Perfilado de Pestañas</u>
        </h5>

        <p>
          <strong>Descripción:</strong> Lifting y extensión de pestañas para una
          mirada más intensa y definida. Realza tu mirada con un efecto natural
          o dramático, según tu estilo.
        </p>
        <p>
          <strong>Duración aproximada:</strong> 45 a 90 minutos.
        </p>
        <p>
          <strong>¿Está en promoción?:</strong> No.
        </p>
        <p>
          <strong>Zonas que incluye:</strong> Ojos.
        </p>

        <p style={{ marginTop: "1.5rem", fontWeight: "bold" }}>
          Precio: ${zonaSeleccionada.precio[lugar]} por sesión
        </p>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="zona" style={{ display: "block", marginBottom: "0.5rem" }}>
            Elegí el tipo:
          </label>
          <select
            id="zona"
            value={zonaSeleccionada.nombre}
            onChange={handleZonaChange}
            style={{ padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {zonasPestanas.map((zona) => (
              <option key={zona.nombre} value={zona.nombre}>
                {zona.nombre} - ${zona.precio[lugar]}
              </option>
            ))}
          </select>
        </div>

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
            En local (${zonaSeleccionada.precio.local})
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="lugar"
              value="casa"
              checked={lugar === "casa"}
              onChange={() => setLugar("casa")}
            />
            En casa (${zonaSeleccionada.precio.casa})
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
