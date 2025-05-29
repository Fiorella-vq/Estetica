import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export const Pagos = () => {
  const [reserva, setReserva] = useState(null);
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorReserva, setErrorReserva] = useState(null);
  const [importe, setImporte] = useState("");
  const [email, setEmail] = useState(""); // <-- Email para el pago

  useEffect(() => {
    const fetchReserva = async () => {
      try {
        const response = await axios.get(`${process.env.BACKEND_URL}/reserva/ultima`);
        setReserva(response.data);
        if (response.data.email) {
          setEmail(response.data.email); // precargar email si está en reserva
        }
      } catch (error) {
        setErrorReserva("Error al obtener la reserva.");
      }
    };

    fetchReserva();
  }, []);

  const handlePagar = async () => {
    if (!reserva) return;

    setLoadingPago(true);
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/pagos`, {
        monto: importe,
        email: email, // enviamos el email ingresado
      });

      window.location.href = response.data.init_point;
    } catch (error) {
      console.error("Error al iniciar el pago:", error.response?.data || error.message);
      alert("Hubo un error al procesar el pago.");
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
          <p>Puedes abonar ahora con Mercado Pago o hacerlo al momento del servicio.</p>
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
            </div>
          ) : (
            <div className="alert alert-warning">Cargando reserva...</div>
          )}
        </div>

        {reserva && (
          <div className="col-12 col-md-8 text-center mt-4">
            <div className="mb-3">
              <label htmlFor="importe" className="form-label">
                Importe a abonar ($)
              </label>
              <input
                type="number"
                className="form-control"
                id="importe"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                placeholder="Ej: 5000"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="emailPago" className="form-label">
                Email para el pago
              </label>
              <input
                type="email"
                className="form-control"
                id="emailPago"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@dominio.com"
              />
            </div>

            <button
              onClick={handlePagar}
              className="btn btn-primary btn-lg"
              disabled={loadingPago}
            >
              {loadingPago ? "Redirigiendo..." : "Pagar con Mercado Pago"}
            </button>
          </div>
        )}

        <div className="col-12 col-md-8 text-center mt-5">
          <h2 className="text-primary mb-4">¿Qué deseas hacer ahora?</h2>
          <Link to="/" className="btn btn-outline-secondary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
