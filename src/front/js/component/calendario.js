import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendario.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Calendario = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fecha, setFecha] = useState(new Date());
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  // Precio inicial desde location.state o 0
  const [precioServicio, setPrecioServicio] = useState(() => location.state?.precio || 0);

  // Función para formatear moneda local (ARS)
  const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);

  const cargarHorasDisponibles = async (nuevaFecha) => {
    try {
      const fechaISO = nuevaFecha.toISOString().slice(0, 10);

      const response = await fetch(`http://localhost:3001/api/horarios-disponibles?fecha=${fechaISO}`);
      if (!response.ok) throw new Error("Error al obtener horarios disponibles");

      const data = await response.json();
      let libres = data.horarios_disponibles || [];

      // Filtrar las horas pasadas si la fecha es hoy
      const hoy = new Date();
      const esHoy =
        nuevaFecha.getFullYear() === hoy.getFullYear() &&
        nuevaFecha.getMonth() === hoy.getMonth() &&
        nuevaFecha.getDate() === hoy.getDate();

      if (esHoy) {
        const horaActual = hoy.getHours();
        const minutoActual = hoy.getMinutes();
        libres = libres.filter((hora) => {
          const [h, m] = hora.split(":").map(Number);
          return h > horaActual || (h === horaActual && m > minutoActual);
        });
      }

      setHorasDisponibles(libres);

      if (!libres.includes(horaSeleccionada)) {
        setHoraSeleccionada(null);
      }
    } catch (error) {
      console.error("Error al cargar horarios disponibles:", error);
      Swal.fire("Error", "No se pudieron cargar las horas disponibles.", "error");
      setHorasDisponibles([]);
      setHoraSeleccionada(null);
    }
  };

  useEffect(() => {
    cargarHorasDisponibles(fecha);
  }, [fecha]);

  useEffect(() => {
    setPrecioServicio(location.state?.precio || 0);
  }, [location.state?.precio]);

  const manejarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
  };

  const manejarRadioChange = (e) => {
    setHoraSeleccionada(e.target.value);
  };

  const confirmarReserva = async () => {
    if (!nombre.trim() || !telefono.trim() || !emailCliente.trim() || !horaSeleccionada) {
      Swal.fire("Atención", "Por favor completá todos los campos y seleccioná una hora.", "warning");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailCliente)) {
      Swal.fire("Atención", "Por favor ingresá un correo electrónico válido.", "warning");
      return;
    }

    const servicio = location.state?.from || "Servicio";

    const result = await Swal.fire({
      title: `¿Confirmás tu turno para ${servicio} a las ${horaSeleccionada}?`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      denyButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        const fechaISO = fecha.toISOString().slice(0, 10);

        const crearResponse = await fetch("http://localhost:3001/api/reservas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha: fechaISO,
            hora: horaSeleccionada,
            nombre,
            telefono,
            email: emailCliente,
            servicio,
            precio: precioServicio,
          }),
        });

        if (!crearResponse.ok) {
          const errorData = await crearResponse.json();
          throw new Error(errorData.error || "No se pudo crear la reserva");
        }

        const reservaCreada = await crearResponse.json();

        // Guardar el id de la reserva en localStorage para que el componente Pagos pueda usarlo
        localStorage.setItem("reservaId", reservaCreada.id);

        Swal.fire(
          "¡Turno confirmado!",
          "¡Tu reserva fue creada con éxito! Te hemos enviado un correo electrónico con los detalles. Si no lo ves en tu bandeja de entrada, por favor revisá tu carpeta de correo no deseado o spam.",
          "success"
        );

        // Pasar la info completa al componente Pagos via location.state
        const reservaParaPago = {
          id: reservaCreada.id,
          nombre,
          email: emailCliente,
          telefono,
          fecha: fechaISO,
          hora: horaSeleccionada,
          servicio,
          precio: precioServicio,
        };

        // Limpiar formulario
        setNombre("");
        setTelefono("");
        setEmailCliente("");
        setHoraSeleccionada(null);

        cargarHorasDisponibles(fecha);

        navigate("/pagos", { state: reservaParaPago });
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    } else if (result.isDenied) {
      Swal.fire("Reserva cancelada", "", "info");
    }
  };

  const deshabilitarDiasPasados = ({ date, view }) => {
    if (view === "month") {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return date < hoy;
    }
    return false;
  };

  const asignarClaseCalendario = ({ date, view }) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (view === "month" && date < hoy) {
      return "dia-pasado";
    }
    return null;
  };

  return (
    <div className="calendario-container">
      <h2>{location.state?.from || "Servicio"}</h2>
      <p>
        Precio: <strong>{formatoMoneda(precioServicio)}</strong>
      </p>
      <Calendar
        onChange={manejarFecha}
        value={fecha}
        tileDisabled={deshabilitarDiasPasados}
        tileClassName={asignarClaseCalendario}
        locale="es-ES"
      />
      <p>
        Fecha seleccionada:{" "}
        {fecha
          .toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          .replace(/^\w/, (c) => c.toUpperCase())}
      </p>

      <div className="datos-cliente">
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          className="input-nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label htmlFor="telefono">Teléfono:</label>
        <input
          id="telefono"
          className="input-telefono"
          type="tel"
          placeholder="Tu teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <label htmlFor="email">Correo electrónico:</label>
        <input
          id="email"
          className="input-email"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={emailCliente}
          onChange={(e) => setEmailCliente(e.target.value)}
        />
      </div>

      {horasDisponibles.length > 0 ? (
        <>
          <h3>Horas disponibles:</h3>
          {horasDisponibles.map((hora) => (
            <label key={hora}>
              <input
                type="radio"
                name="hora"
                value={hora}
                checked={horaSeleccionada === hora}
                onChange={manejarRadioChange}
              />
              {hora}
            </label>
          ))}
          <button className="btn" onClick={confirmarReserva} disabled={!horaSeleccionada}>
            Confirmar turno
          </button>
        </>
      ) : (
        <p>No hay horas disponibles para esta fecha.</p>
      )}
    </div>
  );
};
