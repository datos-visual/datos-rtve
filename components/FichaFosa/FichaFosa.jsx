"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import "../../app/styles/_fichaFosa.scss";

import iconFiltro from "../../app/assets/iconFiltro.svg";
import iconExhumados from "../../app/assets/iconFiltroExhumados.svg";
import iconLugares from "../../app/assets/iconFiltroLugares.svg";
import iconMujeres from "../../app/assets/iconFiltroMujeres.svg";
import iconObjetos from "../../app/assets/iconFiltroObjetos.svg";
import iconPersonajes from "../../app/assets/iconFiltroPersonajes.svg";
import iconRepresion from "../../app/assets/iconFiltroRepresion.svg";
import pointIcon from "../../app/assets/pointIcon.svg";
import iconClose from "../../app/assets/icon-close.svg";

import ModalCarrousel from "../common/ModalCarrousel";

const iconosCategorias = {
  todas: iconFiltro,
  mujeres: iconMujeres,
  lugares: iconLugares,
  personajes: iconPersonajes,
  objetos: iconObjetos,
  represion: iconRepresion,
  exhumaciones: iconExhumados,
};

const FichaFosa = React.memo(function FichaFosa({ fosa, onClose }) {
  const [fichaExtra, setFichaExtra] = useState(null);
  const [activeTab, setActiveTab] = useState("imagenes");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (fosa?.id_datos) {
      fetch(
        `https://www.rtve.es/datos-repo/test-fosas/fichas/${fosa.id_datos}.json`
      )
        .then((resp) => (resp.ok ? resp.json() : null))
        .then((data) => setFichaExtra(data))
        .catch((e) => console.error("Error fetching ficha extra:", e));
    }
  }, [fosa]);

  if (!fosa) return null;

  const {
    ccaa,
    municipio,
    provincia,
    title,
    event_date,
    status,
    n_buried,
    linea_narrativa,
    fuente_info,
    fuente_enlace,
    foto,
    video,
    audio,
  } = fosa;

  const descripcion =
    fichaExtra?.descripcion || linea_narrativa || "Sin descripción disponible";
  const fuenteInfo = fichaExtra?.fuente_info || fuente_info;
  const fuenteEnlace = fichaExtra?.fuente_enlace || fuente_enlace;

  const claveCategoria = (linea_narrativa || "todas").toLowerCase();
  const textoCategoria =
    claveCategoria === "exhumaciones"
      ? "Exhumados"
      : claveCategoria.charAt(0).toUpperCase() + claveCategoria.slice(1);
  const iconoCategoria = iconosCategorias[claveCategoria] || iconFiltro;

  const fotos = Array.isArray(foto) ? foto : foto ? [foto] : [];
  const videos = Array.isArray(video) ? video : video ? [video] : [];
  const audios = Array.isArray(audio) ? audio : audio ? [audio] : [];

  return (
    <div className="ficha-fosa inline">
      {/* Cerrar */}
      <button className="cerrar" onClick={onClose}>
        <Image src={iconClose} alt="Cerrar" />
      </button>

      <div className="ficha-contenido">
        <div className="cabecera">
          <div className="info">
            <div className="info-cabecera">
              <div className="info-ubicacion">
                <p className="ubicacion">
                  <strong>{municipio}</strong> | {provincia} |  {ccaa}
                </p>
                <h2 className="info-ubicacion__name">
                  {title || "Sin título"}
                </h2>
              </div>
              <div className="info-category">
                <div className="category-item">
                  <Image src={iconoCategoria} alt="" />
                  <span className="category-item__name">{textoCategoria}</span>
                </div>
              </div>
            </div>

            <ul className="datos">
              <li className="datos__item">
                <label className="datos__label">FECHA DE LA FOSA</label>
                <span className="datos__value">{event_date || "-"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">ESTADO DE LA FOSA</label>
                <span className="datos__value">{status || "-"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">NÚMERO DE INHUMADOS</label>
                <span className="datos__value">{n_buried || "-"}</span>
              </li>
            </ul>
          </div>

          {/* Imagen destacada */}
          <div className="foto" onClick={() => setModalOpen(true)}>
            <h2 class="datos__title">{title || "Sin título"}</h2>
            <Image
              src={
                foto ||
                "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg"
              }
              alt="Imagen fosa"
              width={500}
              height={300}
            />
          </div>

          {/* ModalCarrousel */}
          {modalOpen && (
            <ModalCarrousel
              imagenes={fotos}
              onClose={() => setModalOpen(false)}
            />
          )}
        </div>

        {/* Resumen */}
        <div className="resumen">
          <div className="resumen-datos">
            {/*<h3>Resumen / Descripción / Label</h3>*/}
            <p>{descripcion}</p>

            {fuenteInfo && (
              <>
                <h4>FUENTES</h4>
                <a href={fuenteEnlace} target="_blank">
                  {fuenteInfo} 🔗
                </a>
              </>
            )}

            <h4>Notas relacionadas</h4>
            <ul class="news-related">
              <li class="news-related_list">
                <img src=""/>
                <div class="news-related_description">
                  <a class="news-related_title" href="#">Lo que quedó no se ve, pero pesa</a>
                  <p class="news-related_date">Fecha</p>
                </div>
              </li>
              <li class="news-related_list">
                <img src=""/>
                <div class="news-related_description">
                  <a class="news-related_title" href="#">Escribir para no perder lo que nunca se encontró</a>
                  <p class="news-related_date">Fecha</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Multimedia */}
          <div className="multimedia">
            <h3>MATERIAL MULTIMEDIA</h3>
            <div className="multimedia-tabs">
              <button
                className={`tab-btn ${
                  activeTab === "imagenes" ? "active" : ""
                }`}
                onClick={() => setActiveTab("imagenes")}
              >
                Fotos <span className="badge">{fotos.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
                onClick={() => setActiveTab("videos")}
              >
                Videos <span className="badge">{videos.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "audios" ? "active" : ""}`}
                onClick={() => setActiveTab("audios")}
              >
                Voces <span className="badge">{audios.length}</span>
              </button>
            </div>

            <div className="multimedia-content">
              {activeTab === "imagenes" && (
                <div className="tab-content active">
                  <h4>Fotos</h4>
                  {fotos.length ? (
                    fotos.map((f, i) => (
                      <Image
                        key={i}
                        src={f}
                        alt="Imagen"
                        width={400}
                        height={250}
                      />
                    ))
                  ) : (
                    <p>No hay imágenes disponibles.</p>
                  )}
                </div>
              )}
              {activeTab === "videos" && (
                <div className="tab-content active">
                  <h4>Videos</h4>
                  {videos.length ? (
                    videos.map((v, i) => (
                      <video key={i} controls src={v} width="100%" />
                    ))
                  ) : (
                    <p>No hay videos disponibles.</p>
                  )}
                </div>
              )}
              {activeTab === "audios" && (
                <div className="tab-content active">
                  <h4>Audios</h4>
                  {audios.length ? (
                    audios.map((a, i) => <audio key={i} controls src={a} />)
                  ) : (
                    <p>No hay audios disponibles.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div class="victimas">
            <div class="victimas_header">
              <h4>Victimas</h4>
              <p><strong>Formato de los datos:</strong> Nombre y Apellido, edad, fecha de fusilamiento</p>
            </div>

            <div class="victimas_item">
              <div class="victimas_item-title">
                <h5><strong>Ricardo Gómex Alonso</strong>, 19 años, estudiantes</h5>
                <a class="victimas_open">Más información</a>
              </div>
             

              <p>Aprendió de manera práctica en hospitales de campaña improvisados. Pasaba noches enteras atendiendo heridos. Llevaba una libreta donde escribís los nombres de los que no sobrevivían, apara que no quedaran en el olvido.</p>
            </div>
            <div class="victimas_item">
              <div class="victimas_item-title">
                <h5><strong>Gregorio Muñoz García</strong>, 24 años, maestro</h5>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

export default FichaFosa;
