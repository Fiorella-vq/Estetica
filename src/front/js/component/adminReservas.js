import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HORARIOS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const SERVICIOS = [
  "Depilación Láser",
  "Perfilado de Cejas",
  "Masajes Descontracturantes",
  "Criopolisis",
  "Hifu",
  "Perfilado de Pestañas",
];

// Función para normalizar hora formato "HH:mm"
const normalizeHora = (horaString) => {
  if (!horaString) return "";
  return horaString.length >= 5 ? horaString.slice(0, 5) : horaString;
};

// Función para formato "yyyy-MM-dd"
const formatFecha = (date) => date.toISOString().split("T")[0];

export const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Redirigir si no hay token
  useEffect(() => {
    if (!token) {
      navigate("/loginAdmin", { replace: true });
    }
  }, [token, navigate]);

  // Traer reservas y bloqueos filtrados por fecha
  const fetchData = async (date) => {
    setLoading(true);
    const formattedDate = formatFecha(date);
    try {
      const [reservaRes, bloqueoRes] = await Promise.all([
        fetch(
          `https://floresteticaintegral.onrender.com/api/admin/reservas?fecha=${formattedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `https://floresteticaintegral.onrender.com/api/admin/bloqueos?fecha=${formattedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!reservaRes.ok || !bloqueoRes.ok) {
        throw new Error("Error al obtener datos");
      }

      const reservasData = await reservaRes.json();
      const bloqueosData = await bloqueoRes.json();

      // Filtro bloqueos por fecha (por si acaso)
      const bloqueosFiltrados = (bloqueosData.bloqueos || []).filter(
        (b) => b.fecha === formattedDate
      );

      // Filtro reservas por fecha (muy importante para no mostrar reservas de otros días)
      const reservasFiltradas = (reservasData.reservas || []).filter(
        (r) => r.fecha === formattedDate
      );

      setReservas(reservasFiltradas);
      setBloqueos(bloqueosFiltrados);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      setReservas([]);
      setBloqueos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(selectedDate);
    }
  }, [selectedDate, token]);

  const totalGanado = reservas.reduce(
    (acc, r) => acc + (Number(r.precio) || 0),
    0
  );

  // Bloquear horario
  const handleBloquearHorario = async (hora) => {
    const { value: formValues } = await Swal.fire({
      title: `Bloquear horario ${hora}`,
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" />
        <select id="swal-servicio" class="swal2-select" style="display:block; margin: 0 auto; width: 80%; padding: 0.5em; font-size: 1rem;">
          <option value="">Seleccioná un servicio</option>
          ${SERVICIOS.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const nombre = document.getElementById("swal-nombre").value.trim();
        const servicio = document.getElementById("swal-servicio").value;
        if (!nombre) {
          Swal.showValidationMessage("Por favor, completá el nombre");
          return null;
        }
        if (!servicio) {
          Swal.showValidationMessage("Por favor, seleccioná un servicio");
          return null;
        }
        return { nombre, servicio };
      },
    });

    if (!formValues) return;

    const formattedDate = formatFecha(selectedDate);

    try {
      const res = await fetch(
        `https://floresteticaintegral.onrender.com/api/admin/bloqueos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: formattedDate,
            hora,
            bloqueado: true,
            nombre: formValues.nombre,
            servicio: formValues.servicio,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error bloqueando horario");

      Swal.fire(
        "Hecho",
        `Horario ${hora} bloqueado para ${formValues.nombre}`,
        "success"
      );

      fetchData(selectedDate);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Quitar bloqueo
  const handleQuitarBloqueo = async (bloqueo) => {
    if (!bloqueo) {
      Swal.fire("Error", "Bloqueo inválido", "error");
      return;
    }

    try {
      let res;
      let data;

      if (bloqueo.id) {
        res = await fetch(
          `https://floresteticaintegral.onrender.com/api/admin/bloqueos/${bloqueo.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        data = await res.json();
      } else {
        res = await fetch(
          `https://floresteticaintegral.onrender.com/api/admin/bloqueos`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fecha: bloqueo.fecha, hora: bloqueo.hora }),
          }
        );
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || "Error quitando bloqueo");

      Swal.fire("Hecho", "Bloqueo eliminado", "success");
      fetchData(selectedDate);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Normalizar hora para comparar
  const estaReservado = (hora) =>
    reservas.some((r) => normalizeHora(r.hora) === hora);
  const estaBloqueado = (hora) =>
    bloqueos.some((b) => normalizeHora(b.hora) === hora);

  // Eliminar reserva
  const handleEliminarReserva = async (reservaData) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `https://floresteticaintegral.onrender.com/api/admin/reservas/${reservaData.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al eliminar reserva");
        }
        Swal.fire("Reserva eliminada", "", "success");
        fetchData(selectedDate);
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  // Logout admin
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        navigate("/loginAdmin", { replace: true });
      }
    });
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Administrar Horarios</h3>
      <h5>
        Ganancias por reserva de app. {formatFecha(selectedDate)}:{" "}
        <strong>${totalGanado.toFixed(2)}</strong>
      </h5>

      <div className="mb-4 d-flex flex-column flex-sm-row gap-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/horariosDisponible")}
        >
          Ir a Horarios Disponibles
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/testimonios")}
        >
          Ir a Testimonios
        </button>
        <button
          className="btn btn-outline-danger ms-auto"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <label className="form-label fw-semibold">Seleccionar fecha:</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            minDate={new Date()}
          />
        </div>

        <div className="col-md-8">
          {loading ? (
            <p>Cargando horarios...</p>
          ) : (
            <ul
              className="list-group"
              style={{
                maxHeight: "480px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            >
              {HORARIOS.map((hora) => {
                const reservado = estaReservado(hora);
                const bloqueado = estaBloqueado(hora);
                const bloqueoData = bloqueos.find(
                  (b) => normalizeHora(b.hora) === hora
                );
                const reservaData = reservas.find(
                  (r) => normalizeHora(r.hora) === hora
                );

                const ahora = new Date();
                const esHoy =
                  selectedDate.getFullYear() === ahora.getFullYear() &&
                  selectedDate.getMonth() === ahora.getMonth() &&
                  selectedDate.getDate() === ahora.getDate();

                const [h, m] = hora.split(":").map(Number);
                const horaHorario = new Date(selectedDate);
                horaHorario.setHours(h, m, 0, 0);

                const esHoraPasada = esHoy && horaHorario <= ahora;

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
                    <div style={{ minWidth: "200px" }}>
                      {esHoraPasada ? (
                        <>
                          {reservado && reservaData && (
                            <div style={{ color: "gray" }}>
                              <span className="fw-bold">Reservado</span>
                              <div>
                                <small>
                                  <strong>Cliente:</strong>{" "}
                                  {reservaData.nombre || "-"}
                                </small>
                                <br />
                                <small>
                                  <strong>Servicio:</strong>{" "}
                                  {reservaData.servicio || "-"}
                                </small>
                              </div>
                            </div>
                          )}
                          {!reservado && bloqueado && bloqueoData && (
                            <div style={{ color: "gray" }}>
                              <span className="fw-semibold">Bloqueado</span>
                              <div>
                                <small>
                                  <strong>Nombre:</strong>{" "}
                                  {bloqueoData.nombre || "-"}
                                </small>
                                <br />
                                <small>
                                  <strong>Servicio:</strong>{" "}
                                  {bloqueoData.servicio || "-"}
                                </small>
                              </div>
                            </div>
                          )}
                          {!reservado && !bloqueado && (
                            <div style={{ color: "gray" }}>Horario pasado</div>
                          )}
                        </>
                      ) : (
                        <>
                          {reservado && reservaData && (
                            <div>
                              <span className="fw-bold text-white">
                                Reservado
                              </span>
                              <div>
                                <small>
                                  <strong>Cliente:</strong>{" "}
                                  {reservaData.nombre || "-"}
                                </small>
                                <br />
                                <small>
                                  <strong>Servicio:</strong>{" "}
                                  {reservaData.servicio || "-"}
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger mt-1"
                                onClick={() =>
                                  handleEliminarReserva(reservaData)
                                }
                              >
                                Eliminar reserva
                              </button>
                            </div>
                          )}

                          {!reservado && bloqueado && bloqueoData && (
                            <div>
                              <span className="fw-semibold">Bloqueado</span>
                              <div>
                                <small>
                                  <strong>Nombre:</strong>{" "}
                                  {bloqueoData.nombre || "-"}
                                </small>
                                <br />
                                <small>
                                  <strong>Servicio:</strong>{" "}
                                  {bloqueoData.servicio || "-"}
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-success mt-1"
                                onClick={() => handleQuitarBloqueo(bloqueoData)}
                              >
                                Desbloquear
                              </button>
                            </div>
                          )}

                          {!reservado && !bloqueado && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleBloquearHorario(hora)}
                            >
                              Bloquear
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
