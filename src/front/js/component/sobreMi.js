import React from "react";
import "../../styles/sobreMi.css";
import Flor1 from "../../img/Flor1.jpeg";

export const SobreMi = () => {
  return (
    <section className="container sobre-mi-section py-5">
      <div className="row align-items-center shadow-lg rounded-4 p-4 bg-white">
        <div className="col-md-5 text-center mb-4 mb-md-0">
          <div className="d-flex flex-column gap-3 align-items-center">
            <img
              src={Flor1}
              alt="Flor sonriendo"
              className="img-chica rounded-circle shadow"
            />
          </div>
        </div>

        <div className="col-md-7">
          <h2 className="titulo-sobre-mi mb-3">Sobre mí</h2>
          <p className="texto-sobre-mi">
            ¡Hola! Soy <strong>Flor</strong>, especialista en estética integral
            y bienestar. Mi compromiso es brindarte tratamientos personalizados,
            efectivos y adaptados a tus necesidades, siempre con un enfoque
            profesional y humano. En Florestética Integral encontrarás un
            servicio de calidad, enfocado en potenciar tu belleza natural y
            mejorar tu bienestar general.
          </p>
        </div>
      </div>
    </section>
  );
};
