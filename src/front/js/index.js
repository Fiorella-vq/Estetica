// Import React into the bundle
import React from "react";
import ReactDOM from "react-dom/client"; // Asegúrate de importar desde 'react-dom/client'

// Include your index.scss file into the bundle
import "../styles/index.css";

// Import your own components
import Layout from "./layout";

// Create the root element and render your React application
const root = ReactDOM.createRoot(document.querySelector("#app")); // Usar createRoot
root.render(<Layout />);
