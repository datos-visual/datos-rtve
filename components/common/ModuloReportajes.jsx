"use client";

import "../../app/styles/_moduloReportajes.scss";

import Imagen1 from "../../app/assets/image1.png";
import Imagen2 from "../../app/assets/image2.png";
import Imagen3 from "../../app/assets/image3.png";
import Imagen4 from "../../app/assets/image4.png";
import Imagen5 from "../../app/assets/image5.png";
import Imagen6 from "../../app/assets/image6.png";
import ImagenHover from "../../app/assets/image1-hover.png";

const reportajes = [
  {
    main: Imagen1,
    hover: ImagenHover,
    type: "Mujeres",
    title: "Humilladas y asesinadas por ser mujeres",
    text: "Tras el sueño de la igualdad en la Segunda República llegó la pesadilla de la represión",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-categorias-mujeres/16744245.shtml",
  },
  {
    main: Imagen2,
    hover: ImagenHover,
    type: "Objetos",
    title: "La memoria de un anillo, un peine o una carta",
    text: "Los objetos ayudan a la identificación y representan para las familias a la persona que ha estado ausente.",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-espana-categorias-objetos/16744277.shtml",
  },
  {
    main: Imagen3,
    hover: ImagenHover,
    type: "Lugares",
    title: "Un lugar donde hacerlos desaparecer para siempre",
    text: "Además de los cementerios y las cunetas, todo tipo de parajes se convirtieron en lugar de enterramiento.",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-espana-categorias-lugares/16744281.shtml",
  },
  {
    main: Imagen4,
    hover: ImagenHover,
    type: "Reprasaliados",
    title: "Morir por sus ideas o por ser fiel a la República",
    text: "Alcaldes y sindicalistas, pero también maestros de escuela fueron asesinados por los sublevados.",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-espana-categoria-represaliados/16744260.shtml",
  },
  {
    main: Imagen5,
    hover: ImagenHover,
    type: "Nombres propios",
    title: "De Federico García Lorca a Pedro Muñoz Seca",
    text: "Personajes de la cultura, la política o la sociedad civil también acabaron en fosas comunes.",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-espana-categoria-nombres-propios/16744274.shtml",
  },
  {
    main: Imagen6,
    hover: ImagenHover,
    type: "Exhumaciones tempranas",
    title: "Abrir la tierra con las propias manos",
    text: "Los pioneros de la memoria exhumaron a sus familiares durante la Transición para darles una sepultura digna.",
    url: "https://www.rtve.es/noticias/20250925/mapa-fosas-guerra-civil-franquismo-espana-categorias-exhumaciones-tempranas/16744284.shtml",
  },
];

export default function ModuloReportajes() {
  return (
    <section className="modulo-reportajes">
      <div className="modulo-reportajes-wrapper">
        <h3>Título para módulo de Reportajes</h3>
        <div className="cards-container">
          {reportajes.map((r, i) => (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reportajes-card-link"
              key={i}
            >
              <div className="reportajes-card">
                <div className="card-image">
                  <img
                    src={r.main.src}
                    alt={`imagen ${i + 1}`}
                    className="image-main"
                  />
                  <img src={r.hover.src} alt="" className="image-hover" />
                </div>
                <p className="reportajes-card__type">{r.type}</p>
                <h4 className="reportajes-card__title">{r.title}</h4>
                <p className="reportajes-card__text">{r.text}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
