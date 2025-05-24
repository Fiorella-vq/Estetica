import React, { Component } from "react";
import '../../styles/footer.css';

export const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="contact-container">
                    <h5 className="my-3">Contacto</h5>

                    <div className="contact-detail">
                        <i className="fa-brands fa-whatsapp"></i>
                        <a href="https://wa.me/59891744816?text=Hola,%20quiero%20más%20información" target="_blank" rel="noopener noreferrer">
						+ 598 92 080 877

                        </a>
                    </div>

                    <div className="contact-detail">
                        <i className="fa-regular fa-envelope"></i>
                        <a href="mailto:espacionovem@gmail.com">florenciadeleon46@gmail.com
						</a>
                    </div>

                    <div className="contact-detail">
                        <i className="fa-brands fa-instagram"></i>
                        <a href="https://www.instagram.com/florestetica_integral" target="_blank" rel="noopener noreferrer">
						florestetica_integral
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
