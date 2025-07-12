import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { useNavigate } from "react-router-dom";
import Depilaser from "../../img/depilaser.png";
import PestañasImg from "../../img/pestanas.webp";
import HifuImg from "../../img/hifu.jpg";
import CejasImg from "../../img/cejas.jpg";
import MasajesImg from "../../img/descontracturantes.jpg";
import ReductoresImg from "../../img/reductores.jpg";
import CuponerasImg from "../../img/cuponeras.jpg";

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    width="16"
    height="16"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
);

export const Home = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const servicios = [
    { img: Depilaser, alt: "Depilación Láser", title: "Depilación Láser", ruta: "/depiLaser" },
    { img: PestañasImg, alt: "Pestañas", title: "Pestañas", ruta: "/pestanas" },
    { img: HifuImg, alt: "HIFU", title: "HIFU", ruta: "/hifu" },
    { img: CejasImg, alt: "Perfilado de Cejas", title: "Perfilado de Cejas", ruta: "/cejas" },
    { img: MasajesImg, alt: "Masajes Descontracturantes", title: "Masajes", ruta: "/masajes" },
    { img: ReductoresImg, alt: "Tratamientos Reductores", title: "Tratamientos Reductores", ruta: "/reductores" },
    { img: CuponerasImg, alt: "Cuponeras", title: "Cuponeras", ruta: "/cuponeras" },
  ];

  return (
    <div className="container my-5">
      <div className="row g-4 justify-content-center">
        {servicios.map((servicio, index) => (
          <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
            <div
              className="card h-100 w-100 card-custom"
              onClick={() => navigate(servicio.ruta)}
              role="button"
              tabIndex={0}
              onKeyPress={e => {
                if (e.key === 'Enter') navigate(servicio.ruta);
              }}
            >
              <img src={servicio.img} className="card-img-top service-img" alt={servicio.alt} />
              <div className="card-body card-body-custom">
                <h5 className="card-title">{servicio.title}</h5>
                <button
                  className="card-info-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(servicio.ruta);
                  }}
                  aria-label={`Más información sobre ${servicio.title}`}
                >
                  <InfoIcon />
                  <span>Info</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
