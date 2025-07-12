import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import Laser from "../../img/depilaser.png";

const zonasConPrecios = [
  { nombre: "Piernas", local: 1000, casa: 1500 },
  { nombre: "Axilas", local: 500, casa: 800 },
  { nombre: "Cavado", local: 700, casa: 1100 },
  { nombre: "Rostro", local: 800, casa: 1200 },
  { nombre: "Brazos", local: 900, casa: 1300 },
];

export const Depilaser = () => {
  const navigate = useNavigate();
  const [zonaSeleccionada, setZonaSeleccionada] = useState(zonasConPrecios[0]);
  const [lugar, setLugar] = useState("local");

  const handleZonaChange = (e) => {
    const zona = zonasConPrecios.find((z) => z.nombre === e.target.value);
    setZonaSeleccionada(zona);
  };

  const handleLugarChange = (e) => {
    setLugar(e.target.value);
  };

  const handleButtonClick = () => {
    const precioFinal = lugar === "local" ? zonaSeleccionada.local : zonaSeleccionada.casa;
    navigate("/calendario", {
      state: {
        from: `Depilación Láser - ${zonaSeleccionada.nombre} (${lugar})`,
        precio: precioFinal,
        lugar,
        zona: zonaSeleccionada.nombre,
      },
    });
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

        <p style={{ marginTop: "1.5rem", fontWeight: "bold" }}>
          Precio: ${lugar === "local" ? zonaSeleccionada.local : zonaSeleccionada.casa}
        </p>

        <div style={{ margin: "1rem 0" }}>
          <label htmlFor="zona" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Elegí la zona:
          </label>
          <select
            id="zona"
            value={zonaSeleccionada.nombre}
            onChange={handleZonaChange}
            style={{ padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {zonasConPrecios.map((zona) => (
              <option key={zona.nombre} value={zona.nombre}>
                {zona.nombre}
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
              onChange={handleLugarChange}
            />
            En local (${zonaSeleccionada.local})
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="lugar"
              value="casa"
              checked={lugar === "casa"}
              onChange={handleLugarChange}
            />
            En casa (${zonaSeleccionada.casa})
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
