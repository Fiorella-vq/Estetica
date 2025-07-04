import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import Loto from "../../img/loto.png";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <Link
            to="/loginAdmin"
            title="Área de administración"
            style={{
              fontSize: "0.9rem",
              marginRight: "8px",
              opacity: 0.3,
              textDecoration: "none",
            }}
          >
            ⚙️
          </Link>
          <Link to="/">
            <img
              src={Loto}
              alt="Logo Flor Estética Integral"
              className="navbar-logo"
            />
          </Link>
        </div>

        <h2 className="Flor">Flor Estética Integral</h2>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/sobreMi" className="nav-link">
                Sobre mí
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/informacion-adicional" className="nav-link">
                Información adicional
              </Link>
            </li> */}
            <li className="nav-item">
              <Link to="/cuponeras" className="nav-link">
                Cuponeras
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/horariosDisponible" className="nav-link">
                Horarios y disponibilidad
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/testimonios" className="nav-link">
                Testimonios
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
