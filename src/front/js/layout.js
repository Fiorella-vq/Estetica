import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { Depilaser } from "./component/depiLaser";
import { PerfiladoPestanas } from "./component/pestanas";
import { Hifu } from "./component/hifu";
import { PerfiladoCejas } from "./component/cejas";
import { MasajesDescontracturantes } from "./component/masajes";
import { Reductores } from "./component/reductores";
import { Cuponeras } from "./component/cuponeras";
import { Calendario } from "./component/calendario";
import { AdminReservas } from "./component/adminReservas";
import { LoginAdmin } from "./component/loginAdmin";
import { Cancelar } from "./component/cancelar";
import { Pagos } from "./component/pagos";
import { SobreMi } from "./component/sobreMi";
import { HorariosDisponibilidad } from "./component/horariosDisponible";
import { Testimonios } from "./component/testimonios";

const shouldHideLayout = (pathname) =>
  ["/loginAdmin", "/adminReservas"].some((path) =>
    pathname.startsWith(path)
  );

const NavbarComponent = () => {
  const location = useLocation();
  return shouldHideLayout(location.pathname) ? null : <Navbar />;
};

const FooterComponent = () => {
  const location = useLocation();
  return shouldHideLayout(location.pathname) ? null : <Footer />;
};

const Layout = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const basename = process.env.BASENAME || "";

  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "")
    return <BackendURL />;

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop>
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/single/:theid" element={<Single />} />
          <Route path="/depiLaser" element={<Depilaser />} />
          <Route path="/pestanas" element={<PerfiladoPestanas />} />
          <Route path="/hifu" element={<Hifu />} />
          <Route path="/cejas" element={<PerfiladoCejas />} />
          <Route path="/masajes" element={<MasajesDescontracturantes />} />
          <Route path="/reductores" element={<Reductores />} />
          <Route path="/cuponeras" element={<Cuponeras />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/adminReservas" element={<AdminReservas />} />
          <Route path="/loginAdmin" element={<LoginAdmin />} />
          <Route path="/cancelar/:token" element={<Cancelar />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/sobreMi" element={<SobreMi />} />
          <Route path="/horariosDisponible" element={<HorariosDisponibilidad />} />
          <Route path="/testimonios" element={<Testimonios />} />
          <Route path="*" element={<h1>Not found!</h1>} />
        </Routes>
        <FooterComponent />
      </ScrollToTop>
    </BrowserRouter>
  );
};

export default injectContext(Layout);
