"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import "../../app/styles/_menuSwitch.scss";

import IconMenu from "../../app/assets/icon-menu.svg";
import IconShare from "../../app/assets/icon-share.svg";
import IconSocialFacebook from "../../app/assets/icon-social-facebook.svg";
import IconSocialX from "../../app/assets/icon-social-x.svg";
import IconSocialWhatsApp from "../../app/assets/icon-social-whats.svg";
import IconSocialBluesky from "../../app/assets/icon-social-bluesky.svg";
import IconSocialLink from "../../app/assets/icon-social-link.svg";

export default function MenuSwitch({ onOpenMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(
    pathname.includes("/mapa") ? "fosas" : "historias"
  );
  const [shareOpen, setShareOpen] = useState(false);

  const handleNavigate = (page) => {
    setActive(page);
    if (page === "historias") {
      router.push("/historias");
    } else if (page === "fosas") {
      router.push("/mapa");
    }
  };

  return (
    <nav className="menu-switch">
      {/* Botón menú hamburguesa */}
      <button className="btn-menu" onClick={onOpenMenu}>
        <img src={IconMenu.src} alt="Menú" />
        <span>MENÚ</span>
      </button>

      {/* Switch de páginas */}
      <div className="switch">
        <button
          className={`switch-btn ${active === "historias" ? "active" : ""}`}
          onClick={() => handleNavigate("historias")}
        >
          HISTORIAS
        </button>
        <button
          className={`switch-btn ${active === "fosas" ? "active" : ""}`}
          onClick={() => handleNavigate("fosas")}
        >
          BUSCADOR DE FOSAS
        </button>
      </div>

      {/* Dropdown compartir */}
      <div className="social-dropdown">
        <button className="btn-share" onClick={() => setShareOpen(!shareOpen)}>
          <img src={IconShare.src} alt="Compartir" />
          <span>Compartir</span>
        </button>

        {shareOpen && (
          <div className="social-menu-container">
            <ul className="social-menu">
              <li>
                <a className="social-menu__btn" href="#" target="_blank">
                  <img src={IconSocialFacebook.src} alt="Facebook" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a className="social-menu__btn" href="#" target="_blank">
                  <img src={IconSocialX.src} alt="X-Twitter" />
                  <span>X - Twitter</span>
                </a>
              </li>
              <li>
                <a className="social-menu__btn" href="#" target="_blank">
                  <img src={IconSocialWhatsApp.src} alt="WhatsApp" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a className="social-menu__btn" href="#" target="_blank">
                  <img src={IconSocialBluesky.src} alt="Bluesky" />
                  <span>Bluesky</span>
                </a>
              </li>
              <li>
                <a
                  className="social-menu__btn"
                  href={
                    typeof window !== "undefined" ? window.location.href : "#"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <img src={IconSocialLink.src} alt="Enlace" />
                  <span>Enlace</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
