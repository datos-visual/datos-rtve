"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

  // Determinar página activa basándose en la ruta
  const getActivePageFromPath = () => {
    if (pathname.includes("/mapa")) return "fosas";
    if (pathname.includes("/historias")) return "historias";
    // Si estamos en una página de CCAA, provincia, etc., también es "fosas"
    if (pathname !== "/" && pathname !== "/historias") return "fosas";
    return "historias";
  };

  const [active, setActive] = useState(getActivePageFromPath());
  const [shareOpen, setShareOpen] = useState(false);

  // Funciones para generar URLs de compartir
  const getCurrentUrl = () => {
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const getPageTitle = () => {
    if (typeof document !== "undefined") {
      return document.title || "Mapa de Fosas - RTVE";
    }
    return "Mapa de Fosas - RTVE";
  };

  const shareUrls = {
    facebook: () => {
      const url = encodeURIComponent(getCurrentUrl());
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    },
    twitter: () => {
      const url = encodeURIComponent(getCurrentUrl());
      const text = encodeURIComponent(getPageTitle());
      return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    },
    whatsapp: () => {
      const url = encodeURIComponent(getCurrentUrl());
      const text = encodeURIComponent(`${getPageTitle()} ${getCurrentUrl()}`);
      return `https://wa.me/?text=${text}`;
    },
    bluesky: () => {
      const url = encodeURIComponent(getCurrentUrl());
      const text = encodeURIComponent(`${getPageTitle()} ${getCurrentUrl()}`);
      return `https://bsky.app/intent/compose?text=${text}`;
    },
  };

  const handleSocialShare = (platform) => {
    const url = shareUrls[platform]();
    window.open(url, "_blank", "width=600,height=400");
    setShareOpen(false);
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(getCurrentUrl());
      // Opcional: mostrar feedback visual
      alert("Enlace copiado al portapapeles");
    } catch (err) {
      // Error al copiar
    }
    setShareOpen(false);
  };

  // Actualizar estado activo cuando cambie la ruta
  useEffect(() => {
    setActive(getActivePageFromPath());
  }, [pathname]);

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
                <button
                  className="social-menu__btn"
                  onClick={() => handleSocialShare("facebook")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img src={IconSocialFacebook.src} alt="Facebook" />
                  <span>Facebook</span>
                </button>
              </li>
              <li>
                <button
                  className="social-menu__btn"
                  onClick={() => handleSocialShare("twitter")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img src={IconSocialX.src} alt="X-Twitter" />
                  <span>X - Twitter</span>
                </button>
              </li>
              <li>
                <button
                  className="social-menu__btn"
                  onClick={() => handleSocialShare("whatsapp")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img src={IconSocialWhatsApp.src} alt="WhatsApp" />
                  <span>WhatsApp</span>
                </button>
              </li>
              <li>
                <button
                  className="social-menu__btn"
                  onClick={() => handleSocialShare("bluesky")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img src={IconSocialBluesky.src} alt="Bluesky" />
                  <span>Bluesky</span>
                </button>
              </li>
              <li>
                <button
                  className="social-menu__btn"
                  onClick={handleCopyLink}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img src={IconSocialLink.src} alt="Enlace" />
                  <span>Copiar enlace</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
