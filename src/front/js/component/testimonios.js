import React, { useState, useEffect } from "react";
import "../../styles/services.css";

export const Testimonios = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    comentario: "",
    estrellas: 5,
  });
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const tokenStored = localStorage.getItem("token");
    setToken(tokenStored);
    setIsAdmin(tokenStored && role === "admin");
  }, []);

  const cargarTestimonios = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/testimonios");
      const data = await res.json();
      setTestimonios(data);
    } catch (error) {
      console.error("Error al cargar testimonios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTestimonios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "estrellas" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:3001/api/testimonios", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al enviar testimonio");

      setForm({ nombre: "", comentario: "", estrellas: 5 });
      cargarTestimonios();
    } catch (error) {
      alert("Error al enviar testimonio");
      console.error(error);
    }
  };

  const handleEliminarTestimonio = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este testimonio?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/testimonios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar testimonio");

      cargarTestimonios();
    } catch (error) {
      alert("No se pudo eliminar el testimonio");
      console.error(error);
    }
  };

  const renderStars = (count) => "⭐".repeat(count);

  if (loading) return <div>Cargando testimonios...</div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Nuestros clientes</h2>

      <div className="row justify-content-center">
        <div className="col-md-8">
          {testimonios.length === 0 ? (
            <div className="text-muted text-center mb-4">Aún no hay testimonios.</div>
          ) : (
            <div
              id="testimonialCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
              data-bs-interval="3000"
            >
              <div className="carousel-inner">
                {testimonios.map((t, index) => (
                  <div
                    key={t.id || t._id}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <div className="card mb-3 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title mb-1">{t.nombre}</h5>
                        <p className="card-text mb-2">{t.comentario}</p>
                        <div className="text-warning">{renderStars(t.estrellas)}</div>

                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-danger mt-2"
                            onClick={() => handleEliminarTestimonio(t.id || t._id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#testimonialCarousel"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#testimonialCarousel"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          )}

          <h4 className="mt-5 mb-3">Dejá tu comentario</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Comentario</label>
              <textarea
                className="form-control"
                name="comentario"
                rows="3"
                value={form.comentario}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Estrellas: {form.estrellas}</label>
              <input
                type="range"
                className="form-range"
                name="estrellas"
                min="1"
                max="5"
                value={form.estrellas}
                onChange={handleChange}
              />
              <div className="text-warning">{renderStars(form.estrellas)}</div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary">
                Enviar Testimonio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
