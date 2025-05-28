import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "../../styles/cancelar.css";

export const Cancelar = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReserva = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/reserva-por-token/${token}`
        );
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error || "No se pudo cargar la reserva");

        setReserva(data.reserva);
      } catch (error) {
        Swal.fire("Error", error.message, "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchReserva();
  }, [token, navigate]);

  const cancelarReserva = async () => {
    const result = await Swal.fire({
      title: "¿Confirmar cancelación?",
      text: `¿Estás segura de cancelar esta reserva para ${reserva.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, volver",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/cancelar/${token}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "No se pudo cancelar la reserva");

      const fechaReserva = new Date(reserva.fecha + "T00:00:00");
      const fechaServicio = fechaReserva.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      Swal.fire(
        "Cancelada",
        `La reserva para el día ${fechaServicio} fue cancelada con éxito.`,
        "success"
      ).then(() => navigate("/"));
    } catch (error) {
      Swal.fire("Error", error.message, "error").then(() => navigate("/"));
    }
  };

  if (loading) return <p>Cargando información de la reserva...</p>;
  if (!reserva) return <p>No se encontró la reserva.</p>;

  return (
    <div className="cancelar-container">
      <h2>Cancelar Reserva</h2>
      <p>
        <strong>Nombre:</strong> {reserva.nombre}
      </p>
      <p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(reserva.fecha + "T00:00:00").toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </p>
      <p>
        <strong>Hora:</strong> {reserva.hora}
      </p>
      <p>
        <strong>Servicio:</strong> {reserva.servicio}
      </p>
      <p>
        <strong>Correo:</strong> {reserva.email}
      </p>
      <button className="btn" onClick={cancelarReserva}>
        Cancelar reserva
      </button>
    </div>
  );
};
