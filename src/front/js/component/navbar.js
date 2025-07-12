import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import Loto from "../../img/loto.png";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        <div className="d-flex align-items-center">
          <Link to="/loginAdmin">
            <img
              src={Loto}
              alt="Logo Flor Estética Integral"
              className="navbar-logo"
            />
          </Link>
          <span className="Flor">Flor Estética Integral</span>
        </div>

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

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/sobreMi" className="nav-link">
                Sobre mí
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cuponeras" className="nav-link">
                Cuponeras
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/horariosDisponible" className="nav-link">
                Horarios
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/testimonios" className="nav-link">
                Clientes
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
