import React, { useContext } from "react";
import { Context } from "../store/appContext";
import '../../styles/home.css';
import { useNavigate } from "react-router-dom";
import Depilaser from "../../img/depilaser.png";
import PestañasImg from "../../img/pestanas.webp";
import HifuImg from "../../img/hifu.jpg";
import CriolipolisisImg from "../../img/Criolipólisis.jpg";
import CejasImg from "../../img/cejas.jpg";
import MasajesImg from "../../img/descontracturantes.jpg";
import ReductoresImg from "../../img/reductores.jpg";
import CuponerasImg from "../../img/cuponeras.jpg";


export const Home = () => {
	const { store, actions } = useContext(Context);
	const navigate = useNavigate();


	return (
		<div className="container my-5">
			<div className="row g-4">

				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100" onClick={() => navigate("/depiLaser")}>
						<img src={Depilaser} className="card-img-top service-img" alt="Depilación Láser" />
						<div className="card-body">
							<h5 className="card-title">Depilación Láser</h5>
						</div>
					</div>
				</div>

				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100" onClick={() => navigate("/pestanas")}>
						<img src={PestañasImg} className="card-img-top service-img" alt="Pestañas" />
						<div className="card-body">
							<h5 className="card-title">Pestañas</h5>
						</div>
					</div>
				</div>

				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/hifu")}>
						<img src={HifuImg} className="card-img-top service-img" alt="HIFU" />
						<div className="card-body">
							<h5 className="card-title">HIFU</h5>
						</div>
					</div>
				</div>


				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/criolipolisis")}>
						<img src={CriolipolisisImg} className="card-img-top service-img" alt="Criolipólisis" />
						<div className="card-body">
							<h5 className="card-title">Criolipólisis</h5>
						</div>
					</div>
				</div>


				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/cejas")}>
						<img src={CejasImg} className="card-img-top service-img" alt="Perfilado de Cejas" />
						<div className="card-body">
							<h5 className="card-title">Perfilado de Cejas</h5>
						</div>
					</div>
				</div>


				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/masajes")}>
						<img src={MasajesImg} className="card-img-top service-img" alt="Masajes Descontracturantes" />
						<div className="card-body">
							<h5 className="card-title">Masajes Descontracturantes</h5>
						</div>
					</div>
				</div>


				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/reductores")}>
						<img src={ReductoresImg} className="card-img-top service-img" alt="Tratamientos Reductores" />
						<div className="card-body">
							<h5 className="card-title">Tratamientos Reductores</h5>
						</div>
					</div>
				</div>


				<div className="col-12 col-sm-6 col-md-4 col-lg-3">
					<div className="card h-100"onClick={() => navigate("/cuponeras")}>
						<img src={CuponerasImg} className="card-img-top service-img" alt="Cuponeras" />
						<div className="card-body">
							<h5 className="card-title">Cuponeras</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

