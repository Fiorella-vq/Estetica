import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export const LoginAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://floresteticaintegral.onrender.com/api/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Error de inicio de sesión",
          text: data.error || "Credenciales inválidas o error en el servidor.",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || "admin");

      navigate("/adminReservas");
    } catch (err) {
      if (err.message === "Failed to fetch") {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor. Intenta de nuevo más tarde.",
        });
      } else {
        console.error("Error inesperado:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <Link
        to="/"
        className={`mb-3 d-inline-block text-primary text-decoration-underline ${
          loading ? "disabled" : ""
        }`}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
        aria-disabled={loading}
        tabIndex={loading ? -1 : 0}
      >
        Ir a la página principal
      </Link>

      <h3 className="text-center mb-4">Iniciar sesión</h3>
      <p>Si eres administrador completa los siguientes datos.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password">Contraseña</label>
          <div className="input-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              disabled={loading}
            >
              <i
                className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
              ></i>
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
