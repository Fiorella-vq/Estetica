import React from "react";
import '../../styles/footer.css';

export const Footer = () => {
    return (
        <footer className="footer-container">
            <h5 className="footer-contact-title mb-3">Contacto</h5>
            <div className="footer-content d-flex gap-4">
                <a
                    href="https://wa.me/59891744816?text=Hola,%20quiero%20más%20información"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="contact-icon whatsapp-icon"
                >
                    <i className="fa-brands fa-whatsapp"></i>
                </a>

                <a
                    href="mailto:florenciadeleon46@gmail.com"
                    aria-label="Correo electrónico"
                    className="contact-icon email-icon"
                >
                    <i className="fa-regular fa-envelope"></i>
                </a>

                <a
                    href="https://www.instagram.com/florestetica_integral"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="contact-icon instagram-icon"
                >
                    <i className="fa-brands fa-instagram"></i>
                </a>
            </div>
        </footer>
    );
};
