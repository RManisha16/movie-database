import React from "react";
import "./Footer.css";

const Footer = ()=> {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                <h3 className="footer-title">Flimhub</h3>
                <p>One-stop destination for browsing movies, trailers & reviews.</p>
            </div>
            <div className="footer-section">
                <h4 className="footer-subtitle">Quick links</h4>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/movies">Movies</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h4 className="footer-subtitle">Contact</h4>
                <p>Email: support@flimhub.com</p>
                <p>Phone: +91 9000090000</p>
            </div>
            </div>
            <div className="footer-bottom">copyright © {new Date().getFullYear()} Flimhub All rights reserved.</div>
        </footer>
    );
};
export default Footer;