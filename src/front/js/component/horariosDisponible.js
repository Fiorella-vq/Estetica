import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";       
import "../../styles/horarios.css";

const STORAGE_KEY = "infoHorariosDisponibilidad";

export const HorariosDisponibilidad = () => {
  const [info, setInfo] = useState({
    horarios: "Lunes a viernes de 8:00 a 18:00 hs",
    direccion: "Camino Guerra 7016 bis",
    atencion: "Solo con reserva previa.",
  });

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedInfo = localStorage.getItem(STORAGE_KEY);
    if (storedInfo) {
      setInfo(JSON.parse(storedInfo));
    }
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "Cambios guardados correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    }, 800);
  };

  return (
    <div className="card2">
      <div className="card-body">
        <h2 className="card-title2">Horarios y Disponibilidad</h2>
        {role === "admin" ? (
          <>
            <label>
              <strong>Horarios: </strong>
              <textarea
                name="horarios"
                value={info.horarios}
                onChange={handleChange}
                rows={2}
                disabled={loading}
              />
            </label>
            <br />
            <label>
              <strong>Dirección:</strong>
              <textarea
                name="direccion"
                value={info.direccion}
                onChange={handleChange}
                rows={2}
                disabled={loading}
              />
            </label>
            <br />
            <label>
              <strong>Atención:</strong>
              <textarea
                name="atencion"
                value={info.atencion}
                onChange={handleChange}
                rows={2}
                disabled={loading}
              />
            </label>
            <br />
            <button className="btn" onClick={handleGuardar} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </>
        ) : (
          <p>
            <strong>Horarios:</strong> {info.horarios}
            <br />
            <strong>Dirección:</strong> {info.direccion}
            <br />
            <strong>Atención:</strong> {info.atencion}
          </p>
        )}
      </div>
    </div>
  );
};
