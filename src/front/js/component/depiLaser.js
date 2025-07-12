import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/services.css";
import Laser from "../../img/depilaser.png";

const zonasConPrecio = [
  { nombre: "Piernas", precio: 1000 },
  { nombre: "Axilas", precio: 500 },
  { nombre: "Cavado", precio: 700 },
  { nombre: "Rostro", precio: 800 },
  { nombre: "Brazos", precio: 900 },
  // agregar zonas
];

export const Depilaser = () => {
  const navigate = useNavigate();
  const [zonaSeleccionada, setZonaSeleccionada] = useState(zonasConPrecio[0]);

  const handleZonaChange = (e) => {
    const zona = zonasConPrecio.find((z) => z.nombre === e.target.value);
    setZonaSeleccionada(zona);
  };

  const handleButtonClick = () => {
    navigate("/calendario", {
      state: {
        from: `Depilación Láser - ${zonaSeleccionada.nombre}`,
        precio: zonaSeleccionada.precio,
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

        <p>
          <strong>Precio:</strong> Depende de la zona seleccionada
        </p>

        <label htmlFor="zona">Elegí la zona:</label>
        <select id="zona" value={zonaSeleccionada.nombre} onChange={handleZonaChange}>
          {zonasConPrecio.map((zona) => (
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
