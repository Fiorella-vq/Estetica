import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export const Pagos = () => {
  const location = useLocation();

  const reservaInicial = location.state || null;

  const [reserva, setReserva] = useState(reservaInicial);
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorReserva, setErrorReserva] = useState(null);
  const [senia, setSenia] = useState("");
  const [email, setEmail] = useState(reservaInicial?.email || "");
  const [errorEmail, setErrorEmail] = useState("");

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:3001/api";

  useEffect(() => {
    if (!reserva) {
      const fetchReserva = async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/reserva/ultima`);
          const reservaData = response.data;

          setReserva(reservaData);
          if (reservaData.email) setEmail(reservaData.email);

          if (reservaData.precio) {
            const seniaCalculada = Number(
              (reservaData.precio * 0.4).toFixed(2)
            );
            setSenia(seniaCalculada);
          }
        } catch (error) {
          setErrorReserva("Error al obtener la reserva.");
        }
      };

      fetchReserva();
    } else {
      if (reserva.precio) {
        const seniaCalculada = Number((reserva.precio * 0.4).toFixed(2));
        setSenia(seniaCalculada);
      }
    }
  }, [reserva, BACKEND_URL]);

  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(valor);

  const handlePagar = async () => {
    if (!reserva) return;

    if (!validarEmail(email)) {
      setErrorEmail("Por favor ingresa un email válido.");
      return;
    } else {
      setErrorEmail("");
    }

    setLoadingPago(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/pagos`, {
        monto: senia,
        email: email,
      });

      window.location.href = response.data.init_point;
    } catch (error) {
      console.error(
        "Error al iniciar el pago:",
        error.response?.data || error.message
      );
      alert(
        "Hubo un error al procesar el pago. Por favor, intentá nuevamente."
      );
    } finally {
      setLoadingPago(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 text-center mb-4">
          <h1 className="text-primary">¡Reserva Confirmada!</h1>
          <p className="text-muted">Tu reserva ha sido registrada con éxito.</p>
          <p>
            Para confirmar tu turno, aboná el 40% del valor del servicio con
            Mercado Pago.
          </p>
        </div>

        <div className="col-12 col-md-8">
          {errorReserva ? (
            <div className="alert alert-danger">{errorReserva}</div>
          ) : reserva ? (
            <div className="list-group-item">
              <strong>Servicio:</strong> {reserva.servicio}
              <br />
              <strong>Fecha:</strong> {reserva.fecha}
              <br />
              <strong>Hora:</strong> {reserva.hora}
              <br />
              <strong>Email:</strong> {reserva.email}
              <br />
              <strong>Precio total:</strong> {formatoMoneda(reserva.precio)}
              <br />
              <strong>Seña (40%):</strong> {formatoMoneda(senia)}
            </div>
          ) : (
            <div className="alert alert-warning">Cargando reserva...</div>
          )}
        </div>

        {reserva && (
          <div className="col-12 col-md-8 text-center mt-4">
            <div className="mb-3">
              <label htmlFor="emailPago" className="form-label">
                Email para el pago
              </label>
              <input
                type="email"
                className={`form-control ${errorEmail ? "is-invalid" : ""}`}
                id="emailPago"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@dominio.com"
              />
              {errorEmail && (
                <div className="invalid-feedback">{errorEmail}</div>
              )}
            </div>

            <button
              onClick={handlePagar}
              className="btn btn-primary btn-lg"
              disabled={loadingPago}
            >
              {loadingPago
                ? "Redirigiendo..."
                : `Pagar ${formatoMoneda(senia)} con Mercado Pago`}
            </button>
          </div>
        )}

        <div className="col-12 col-md-8 text-center mt-5">
          <h2 className="text-primary mb-4">¿Qué deseas hacer ahora?</h2>
          <button
  className="btn btn-outline-secondary"
  onClick={async () => {
    if (!reserva || !reserva.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró la reserva para cancelar.",
      });
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "Si volvés al inicio se cancelará tu reserva y el horario quedará disponible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, volver",
    });

    if (confirmacion.isConfirmed) {
      try {
        // Llamada PUT para cancelar la reserva
        await axios.put(`${BACKEND_URL}/reserva/${reserva.id}`);

        await Swal.fire({
          icon: "success",
          title: "Reserva cancelada",
          text: "Tu reserva fue cancelada correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirigir a inicio
        window.location.href = "/";
      } catch (error) {
        console.error("Error al cancelar la reserva:", error.response?.data || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cancelar la reserva. Intentá nuevamente.",
        });
      }
    }
  }}
>
  Volver al Inicio
</button>
        </div>
      </div>
    </div>
  );
};
