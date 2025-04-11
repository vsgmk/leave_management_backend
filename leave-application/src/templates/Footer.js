import React from "react";
import "./Footer.css";
import { FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-text">Made with ❤️ by VSGMK</div>
      <div className="footer-icons">
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://wa.me/8446690401"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <FaWhatsapp />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
