"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import closeMenu from "../../app/assets/CierreMenu.svg";
import closeMenuHover from "../../app/assets/CierreMenuHover.svg";
import "../../app/styles/_hamburger.scss";

export default function HamburgerMenu({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  // Esto asegura que solo renderizamos en cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // renderiza nada en servidor

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Historias", href: "/historias" },
    { label: "Buscador de Fosas", href: "/mapa" },
    { label: "Reportajes", href: "/mapa" },
    { label: "Personajes", href: "/mapa" },
    { label: "Sobre el proyecto", href: "/mapa" },
  ];

  return (
    <>
      <div className={`hamburger-menu ${isOpen ? "active" : ""}`}>
        <div className="close-menu" onClick={onClose}>
          <img src={closeMenu} alt="Cerrar menú" className="img--static" />
          <img src={closeMenuHover} alt="Cerrar menú" className="img--hover" />
        </div>

        <div className="hamburger-title">
          <p className="hamburger-title__text">El país de las 6.000 fosas</p>
          <span className="hamburger-title__slogan">AQUÍ YACE LA HISTORIA</span>
        </div>

        <div className="menu-itens">
          {menuItems.map((item) => {
            const key = `${item.label}-${item.href}`;
            return (
              <div className="menu-item" key={key} onClick={onClose}>
                <Link href={item.href} className="menu-item__btn">
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`menu-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      ></div>
    </>
  );
}
