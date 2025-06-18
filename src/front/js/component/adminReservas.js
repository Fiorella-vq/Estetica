import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HORARIOS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00"
];


const formatHora = (horaString) => {
  if (!horaString) return "";
  return horaString.length >= 5 ? horaString.slice(0, 5) : horaString;
};

export const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  const fetchData = async (date) => {
    setLoading(true);
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const [reservaRes, bloqueoRes] = await Promise.all([
        fetch(`http://localhost:3001/api/admin/reservas?fecha=${formattedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:3001/api/admin/bloqueos?fecha=${formattedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const reservasData = await reservaRes.json();
      const bloqueosData = await bloqueoRes.json();

      // Opcional: logs para depurar
      console.log("Reservas recibidas:", reservasData.reservas);
      console.log("Bloqueos recibidos:", bloqueosData.bloqueos);

      setReservas(reservasData.reservas || []);
      setBloqueos(bloqueosData.bloqueos || []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleBloquearHorario = async (hora) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    try {
      const res = await fetch(`http://localhost:3001/api/admin/bloqueos`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          fecha: formattedDate, 
          hora: hora, 
          bloqueado: true
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error bloqueando horario");

      Swal.fire("Hecho", `Horario ${hora} bloqueado`, "success");

    
      fetchData(selectedDate);

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleQuitarBloqueo = async (bloqueoId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/bloqueos/${bloqueoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error quitando bloqueo");
      Swal.fire("Hecho", "Bloqueo eliminado", "success");

   
      fetchData(selectedDate);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };


  const estaReservado = (hora) => reservas.some(r => formatHora(r.hora) === hora);
  const estaBloqueado = (hora) => bloqueos.some(b => formatHora(b.hora) === hora);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Administrar Horarios</h3>
      <div className="row">
        <div className="col-md-4 mb-4">
          <label className="form-label fw-semibold">Seleccionar fecha:</label>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            minDate={new Date()}
          />
        </div>

        <div className="col-md-8">
          <ul
            className="list-group"
            style={{ maxHeight: "480px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "5px" }}
          >
            {HORARIOS.map(hora => {
              const reservado = estaReservado(hora);
              const bloqueado = estaBloqueado(hora);
              const bloqueoData = bloqueos.find(b => formatHora(b.hora) === hora);

              return (
                <li
                  key={hora}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    reservado
                      ? "list-group-item-danger"
                      : bloqueado
                      ? "list-group-item-secondary"
                      : ""
                  }`}
                >
                  <span>{hora}</span>
                  <div>
                    {reservado && <span className="fw-bold text-white">Reservado</span>}

                    {!reservado && bloqueado && bloqueoData && (
                      <>
                        <span className="fw-semibold">Bloqueado</span>
                        <button
                          className="btn btn-sm btn-outline-success ms-2"
                          onClick={() => handleQuitarBloqueo(bloqueoData.id)}
                        >
                          Desbloquear
                        </button>
                      </>
                    )}

                    {!reservado && !bloqueado && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleBloquearHorario(hora)}
                      >
                        Bloquear
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

