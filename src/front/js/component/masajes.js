import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import MasajesImage from "../../img/descontracturantes.jpg";

const zonasMasajes = [
  { nombre: "Descontracturantes tren superior ", precio: { local: 900, casa: 750 } },
  { nombre: "Relajantes", precio: { local: 900, casa: 750 } },
  { nombre: "Piedras Calientes", precio: { local: 1000, casa: 850 } },
  { nombre: "Ventosas", precio: { local: 1000, casa: 850 } },
];

export const MasajesDescontracturantes = () => {
  const navigate = useNavigate();

  const [zonaSeleccionada, setZonaSeleccionada] = useState(zonasMasajes[0]);
  const [lugar, setLugar] = useState("local");

  const handleZonaChange = (e) => {
    const seleccion = zonasMasajes.find((z) => z.nombre === e.target.value);
    if (seleccion) setZonaSeleccionada(seleccion);
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: `Masajes - ${zonaSeleccionada.nombre}`,
        precio: zonaSeleccionada.precio[lugar],
        lugar,
      },
    });
  };

  return (
    <div className="card2">
      <div className="image-container">
        <img
          src={MasajesImage}
          className="service-img2"
          alt="masajes descontracturantes"
        />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Masajes Descontracturantes</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Masajes para aliviar tensiones musculares y contracturas. Se puede complementar con ventosas o piedras calientes para mayor relajación.
        </p>
        <p>
          <strong>Duración por sesión:</strong> Aproximadamente 45 a 60 minutos.
        </p>
        <p>
          <strong>Frecuencia:</strong> Se recomienda realizar sesiones semanales o según lo necesite el paciente.
        </p>
        <p>
          <strong>Recomendaciones:</strong> Mantenerse hidratado después de la sesión y evitar actividades físicas intensas durante las primeras 24 horas.
        </p>
        <p>
          <strong>Contraindicaciones:</strong> No recomendado en caso de lesiones graves, infecciones cutáneas o problemas circulatorios.
        </p>
        <p>
          <strong>Resultados esperados:</strong> Reducción de dolor muscular, mejor flexibilidad y sensación de relajación profunda.
        </p>
        <p>
          <strong>Promoción:</strong> No.
        </p>
        <p>
          <strong>Zonas:</strong> Espalda, cuello, piernas, cuerpo completo.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <label htmlFor="zona" style={{ fontWeight: "bold" }}>Elegí el tipo de masaje:</label>
          <select
            id="zona"
            value={zonaSeleccionada.nombre}
            onChange={handleZonaChange}
            style={{ padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc", marginTop: "0.5rem" }}
          >
            {zonasMasajes.map((zona) => (
              <option key={zona.nombre} value={zona.nombre}>
                {zona.nombre} - ${zona.precio[lugar]}
              </option>
            ))}
          </select>
        </div>

        <div className="radio-group" style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: "bold" }}>¿Dónde querés recibir el masaje?</p>
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
