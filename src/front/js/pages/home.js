import React, { useContext } from "react";
import { Context } from "../store/appContext";
import '../../styles/home.css';
import { useNavigate } from "react-router-dom";
import Depilaser from "../../img/depilaser.png";
import PestañasImg from "../../img/pestanas.webp";
import HifuImg from "../../img/hifu.jpg";
import CejasImg from "../../img/cejas.jpg";
import MasajesImg from "../../img/descontracturantes.jpg";
import ReductoresImg from "../../img/reductores.jpg";
import CuponerasImg from "../../img/cuponeras.jpg";

export const Home = () => {
	const { store, actions } = useContext(Context);
	const navigate = useNavigate();

	const servicios = [
		{ img: Depilaser, alt: "Depilación Láser", title: "Depilación Láser", ruta: "/depiLaser" },
		{ img: PestañasImg, alt: "Pestañas", title: "Pestañas", ruta: "/pestanas" },
		{ img: HifuImg, alt: "HIFU", title: "HIFU", ruta: "/hifu" },
		{ img: CejasImg, alt: "Perfilado de Cejas", title: "Perfilado de Cejas", ruta: "/cejas" },
		{ img: MasajesImg, alt: "Masajes Descontracturantes", title: "Masajes Descontracturantes", ruta: "/masajes" },
		{ img: ReductoresImg, alt: "Tratamientos Reductores", title: "Tratamientos Reductores", ruta: "/reductores" },
		{ img: CuponerasImg, alt: "Cuponeras", title: "Cuponeras", ruta: "/cuponeras" },
	];

	return (
		<div className="container my-5">
			<div className="row g-4 justify-content-center">
				{servicios.map((servicio, index) => (
					<div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
						<div className="card h-100 w-100" onClick={() => navigate(servicio.ruta)}>
							<img src={servicio.img} className="card-img-top service-img" alt={servicio.alt} />
							<div className="card-body">
								<h5 className="card-title">{servicio.title}</h5>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
