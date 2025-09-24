"use client";

import { useRef } from "react";
import "../../app/styles/_moduloNoticias.scss";

import noticia1 from "../../app/assets/noticias1.png";
import noticia2 from "../../app/assets/noticias2.png";
import noticia3 from "../../app/assets/noticias3.png";
import noticia4 from "../../app/assets/noticias4.png";
import noticia5 from "../../app/assets/noticias5.png";

const noticias = [
  {
    img: noticia1,
    title: "La tierra no olvida los nombres que el tiempo quiso borrar",
    autor: "Firma del autor",
  },
  {
    img: noticia2,
    title: "La tierra no olvida los nombres que el tiempo quiso borrar",
    autor: "Firma del autor",
  },
  {
    img: noticia3,
    title: "La tierra no olvida los nombres que el tiempo quiso borrar",
    autor: "Firma del autor",
  },
  {
    img: noticia4,
    title: "La tierra no olvida los nombres que el tiempo quiso borrar",
    autor: "Firma del autor",
  },
  {
    img: noticia5,
    title: "La tierra no olvida los nombres que el tiempo quiso borrar",
    autor: "Firma del autor",
  },
];

export default function ModuloNoticias() {
  const carouselRef = useRef(null);
  const scrollStep = 300;

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -scrollStep, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  };

  return (
    <section className="modulo-noticias">
      <div className="modulo-noticias-wrapper">
        <div className="modulo-header">
          <h3 className="modulo-header__title">
            Título para módulo de Noticias
          </h3>
          <div className="nav-arrows">
            <button className="prev-btn" onClick={scrollPrev}>
              ‹
            </button>
            <button className="next-btn" onClick={scrollNext}>
              ›
            </button>
          </div>
        </div>

        <div className="noticias-carousel" ref={carouselRef}>
          {noticias.map((n, i) => (
            <div className="noticia-card" key={i}>
              <div className="imagen-noticia">
                <img src={n.img.src} alt={`noticia ${i + 1}`} />
              </div>
              <h4>{n.title}</h4>
              <p className="autor">{n.autor}</p>
            </div>
          ))}
        </div>

        <ul className="carousel-dots">
          {noticias.map((_, i) => (
            <li key={i} className={i === 0 ? "active" : ""}></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
