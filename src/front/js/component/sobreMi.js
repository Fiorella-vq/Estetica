import React from 'react';
import "../../styles/sobreMi.css";
import Flor1 from '../../img/Flor1.jpeg';
// import Flor2 from '../../img/Flor2.jpeg';

export const SobreMi = () => {
  return (
    <section className="container sobre-mi-section py-5">
      <div className="row align-items-center shadow-lg rounded-4 p-4 bg-white">
        
        {/* Imágenes */}
        <div className="col-md-5 text-center mb-4 mb-md-0">
          <div className="d-flex flex-column gap-3 align-items-center">
            <img src={Flor1} alt="Flor sonriendo" className="img-chica rounded-circle shadow" />
            {/* <img src={Flor2} alt="Flor trabajando" className="img-chica rounded-4 shadow" /> */}
          </div>
        </div>

        {/* Texto */}
        <div className="col-md-7">
          <h2 className="titulo-sobre-mi mb-3">Sobre mí</h2>
          <p className="texto-sobre-mi">
            ¡Hola! Soy <strong>Flor</strong>, una persona creativa, curiosa y apasionada por lo que hace.
            Me gusta aprender cosas nuevas, afrontar desafíos con una actitud positiva y trabajar
            con empatía y compromiso. En cada proyecto busco dejar mi sello personal y sumar desde lo humano y profesional.
          </p>
        </div>

      </div>
    </section>
  );
};





