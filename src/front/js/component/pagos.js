import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";


export const Pagos = () => {
    const [reserva, setReserva] = useState(null);
    const { orderId } = useParams(); 

    useEffect(() => {
        const fetchReserva = async () => {
            try {
                const response = await axios.get(process.env.BACKEND_URL + "/reserva/ultima");
                console.log("Respuesta de la API:", response.data);
                setReserva(response.data);
            } catch (error) {
                console.error("Error al obtener la reserva:", error);
            }
        };

        fetchReserva();
    }, []);

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                {/* Título */}
                <div className="col-12 text-center mb-4">
                    <h1 className="text-primary">¡Reserva Confirmada!</h1>
                    <p className="text-muted">Tu reserva ha sido registrada con éxito.</p>
                    <p>Abonarás al momento del servicio.</p>
                    <p>¡Muchas gracias!</p>
                </div>

                {/* Detalles de la reserva */}
                <div className="col-12 col-md-8">
                    {reserva ? (
                        <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Servicio:</strong> {reserva.servicio}<br />
                                <strong>Fecha:</strong> {reserva.fecha}<br />
                                <strong>Hora:</strong> {reserva.hora}<br />
                                <strong>Cliente:</strong> {reserva.cliente_nombre}<br />
                                <strong>Email:</strong> {reserva.cliente_email}
                            </div>
                            <span className="badge bg-success text-white fs-5">
                                ${reserva.precio}
                            </span>
                        </div>
                    ) : (
                        <div className="alert alert-warning" role="alert">
                            Cargando detalles de la reserva...
                        </div>
                    )}
                </div>

                {/* Botón de volver */}
                <div className="col-12 col-md-8 text-center mt-5">
                    <h2 className="text-primary mb-4">¿Qué deseas hacer ahora?</h2>
                    <Link to="/" className="btn ">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};
