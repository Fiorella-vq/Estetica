import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import PestañasImage from "../../img/pestanas.webp";

const zonasPestanas = [
  { nombre: "volumen tecnológico", precio: 1000 },
  { nombre: "lifting", precio: 500 },
];

export const PerfiladoPestanas = () => {
  const navigate = useNavigate();

  const [zonaSeleccionada, setZonaSeleccionada] = useState(zonasPestanas[0]);

  const handleZonaChange = (e) => {
    const seleccion = zonasPestanas.find((z) => z.nombre === e.target.value);
    if (seleccion) setZonaSeleccionada(seleccion);
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: "Perfilado de Pestañas",
        precio: zonaSeleccionada.precio,
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
          <strong>Precio:</strong> ${zonaSeleccionada.precio}.
        </p>
        <p>
          <strong>¿Está en promoción?:</strong> No.
        </p>
        <p>
          <strong>Zonas que incluye:</strong> Ojos.
        </p>

        <label htmlFor="zona">Elegí la zona:</label>
        <select
          id="zona"
          value={zonaSeleccionada.nombre}
          onChange={handleZonaChange}
        >
          {zonasPestanas.map((zona) => (
            <option key={zona.nombre} value={zona.nombre}>
              {zona.nombre} - ${zona.precio}
            </option>
          ))}
        </select>
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
