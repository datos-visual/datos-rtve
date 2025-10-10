"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

// Función para formatear números con separadores de miles
const formatearNumero = (numero) => {
  if (!numero && numero !== 0) return null;
  const num = typeof numero === 'string' ? parseInt(numero, 10) : numero;
  if (isNaN(num)) return null;
  return new Intl.NumberFormat('es-ES').format(num);
};

const FichaFosa = React.memo(function FichaFosa({ fosa, onClose }) {
  const [fichaExtra, setFichaExtra] = useState(null);
  const [activeTab, setActiveTab] = useState("imagenes");
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // El campo id_datos del JSON se normaliza a "id" en datos.js
    const idDatos = fosa?.id;
    
    if (idDatos) {
      // Formatear ID con padding de ceros (ej: 257 → 00257)
      const idFormateado = String(idDatos).padStart(5, '0');
      
      fetch(
        `https://www.rtve.es/datos-repo/test-fosas/v3/fichas/${idFormateado}.json`
      )
        .then((resp) => {
          if (!resp.ok) {
            return null;
          }
          return resp.json();
        })
        .then((data) => {
          if (data) {
            setFichaExtra(data);
          }
        })
        .catch((e) => {
          // Silenciar errores de CORS/404 ya que son esperados para muchas fosas
        });
    }
  }, [fosa]);

  const handleOpenModal = useCallback(() => {
    if (modalRef.current && modalRef.current.open) {
      modalRef.current.open(0);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

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

  // Datos de fichaExtra (API v2)
  const descripcion =
    fichaExtra?.texto || fichaExtra?.titular || linea_narrativa || "Sin descripción disponible";
  const fuenteInfo = fichaExtra?.fuente_info || fuente_info;
  const fuenteEnlace = fichaExtra?.fuente_enlace || fuente_enlace;
  
  // Campos adicionales de fichaExtra
  const statusExtra = fichaExtra?.status || status;
  const eventDateExtra = fichaExtra?.event_date || event_date;
  const eventDateEnd = fichaExtra?.event_date_end;
  const bandoRepresor = fichaExtra?.bando_represor;
  const deathContext = fichaExtra?.death_context;
  const nBuriedExtra = fichaExtra?.n_buried || n_buried;
  const nExhumed = fichaExtra?.n_exhumed;
  const interventionsDateStart = fichaExtra?.ref_interventions_date_start;
  const interventionsDateEnd = fichaExtra?.ref_interventions_date_end;
  const titular = fichaExtra?.titular;
  const texto = fichaExtra?.texto;
  
  // Víctimas y contenidos
  const victimas = fichaExtra?.victimas || [];
  const contenidos = fichaExtra?.contenidos || [];
  
  // Separar contenidos por tipo
  const noticias = contenidos.filter(c => c.tipo === "noticia");
  const videosContenido = contenidos.filter(c => c.tipo === "video");
  const audiosContenido = contenidos.filter(c => c.tipo === "audio");
  const fotosContenido = contenidos.filter(c => c.tipo === "foto");

  const claveCategoria = (linea_narrativa || "todas").toLowerCase();
  const textoCategoria =
    claveCategoria === "exhumaciones"
      ? "Exhumados"
      : claveCategoria.charAt(0).toUpperCase() + claveCategoria.slice(1);
  const iconoCategoria = iconosCategorias[claveCategoria] || iconFiltro;

  // Función para generar thumbnail según tipo de contenido
  const generarThumbnail = (contenido, size = 400) => {
    const { tipo, id, url } = contenido;
    
    if (tipo === "video") {
      return `https://img.rtve.es/v/${id}?w=${size}`;
    } else if (tipo === "audio") {
      return `https://img.rtve.es/a/${id}?w=${size}`;
    } else if (tipo === "foto") {
      return url;
    }
    return null;
  };

  // Multimedia de la fosa base
  const fotosBase = Array.isArray(foto) ? foto : foto ? [foto] : [];
  const videosBase = Array.isArray(video) ? video : video ? [video] : [];
  const audiosBase = Array.isArray(audio) ? audio : audio ? [audio] : [];

  // Multimedia de fichaExtra (combinar con base)
  // Fotos: combinar base + contenidos tipo foto
  const fotos = [
    ...fotosBase,
    ...fotosContenido.map(f => f.url)
  ].filter(Boolean);
  
  // Videos: solo los de la base (los de contenido van en videosEmbed)
  const videos = [...videosBase].filter(Boolean);
  
  // Audios: combinar base + contenidos tipo audio
  const audios = [
    ...audiosBase,
    ...audiosContenido.map(a => a.url)
  ].filter(Boolean);

  // Contenidos multimedia completos (para modal con thumbnails)
  const contenidosMultimedia = [
    ...videosContenido.map(v => ({
      ...v,
      thumbnail: generarThumbnail(v, 400),
      embed: v.embed || null
    })),
    ...audiosContenido.map(a => ({
      ...a,
      thumbnail: generarThumbnail(a, 400),
      embed: a.embed || null
    })),
    ...fotosContenido.map(f => ({
      ...f,
      thumbnail: generarThumbnail(f, 400)
    }))
  ];

  // Filtrar contenidos destacados para el modal
  const contenidosDestacados = contenidosMultimedia.filter(c => c.destacado === true);

  // Obtener imagen destacada SOLO del primer contenido con destacado: true
  // No usar foto como fallback para mantener la lógica de contenidos
  const imagenDestacada = contenidosDestacados.length > 0 
    ? contenidosDestacados[0].thumbnail 
    : null;

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
                  {/* Si municipio y provincia son iguales, mostrar solo provincia */}
                  {municipio === provincia ? (
                    <><strong>{provincia}</strong> | {ccaa}</>
                  ) : (
                    <><strong>{municipio}</strong> | {provincia} | {ccaa}</>
                  )}
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
              {(eventDateExtra || eventDateEnd) && (
                <li className="datos__item">
                  <label className="datos__label">FECHA DE LA FOSA</label>
                  <span className="datos__value">
                    {eventDateExtra || "-"}
                    {eventDateEnd && ` a ${eventDateEnd}`}
                  </span>
                </li>
              )}
              {statusExtra && (
                <li className="datos__item">
                  <label className="datos__label">ESTADO DE LA FOSA</label>
                  <span className="datos__value">{statusExtra}</span>
                </li>
              )}
              {nBuriedExtra && (
                <li className="datos__item">
                  <label className="datos__label">NÚMERO DE INHUMADOS</label>
                  <span className="datos__value">{formatearNumero(nBuriedExtra)}</span>
                </li>
              )}
              {nExhumed && (
                <li className="datos__item">
                  <label className="datos__label">NÚMERO DE EXHUMADOS</label>
                  <span className="datos__value">{formatearNumero(nExhumed)}</span>
                </li>
              )}
              {bandoRepresor && (
                <li className="datos__item">
                  <label className="datos__label">BANDO REPRESOR</label>
                  <span className="datos__value">{bandoRepresor}</span>
                </li>
              )}
              {deathContext && (
                <li className="datos__item">
                  <label className="datos__label">CONTEXTO DE MUERTE</label>
                  <span className="datos__value">
                    {deathContext}
                  </span>
                </li>
              )}
              {(interventionsDateStart || interventionsDateEnd) && (
                <li className="datos__item">
                  <label className="datos__label">INTERVENCIONES</label>
                  <span className="datos__value">
                    {interventionsDateStart || "-"} / {interventionsDateEnd || "-"}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Imagen destacada - Solo si existe contenido con destacado: true */}
          {imagenDestacada && (
            <div className="foto" onClick={handleOpenModal}>
              <h2 className="datos__title">{title || "Sin título"}</h2>
              <Image
                src={imagenDestacada}
                alt={`${title} - Imagen destacada`}
                width={500}
                height={300}
              />
            </div>
          )}

          {/* ModalCarrousel */}
          <ModalCarrousel
            ref={modalRef}
            contenidos={contenidosMultimedia}
            destacados={contenidosDestacados}
            onClose={handleCloseModal}
          />
        </div>

        {/* Resumen */}
        <div className="resumen">
          <div className="resumen-datos">
            {/*<h3>Resumen / Descripción / Label</h3>*/}
            <p>{descripcion}</p>

            {fuenteInfo && (
            <>
              <div className="fuentes">
                <h4 className="fuentes_title">Fuentes</h4>
                <ul className="fuentes_list">
                  <li className="fuentes_item">
                    <a href={fuenteEnlace} target="_blank">
                      {fuenteInfo}
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}

            {noticias.length > 0 && (
              <>
                <h4>Notas relacionadas ({noticias.length})</h4>
                <ul className="news-related">
                  {noticias.map((noticia, idx) => (
                    <li key={idx} className="news-related_list">
                      <img src="" alt="" />
                      <div className="news-related_description">
                        {noticia.destacado && (
                          <span className="destacado-badge">
                            DESTACADO
                          </span>
                        )}
                        <a
                          className="news-related_title"
                          href={noticia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {noticia.titulo}
                        </a>
                        <p className="news-related_date">
                          {noticia.fecha ? new Date(noticia.fecha).toLocaleDateString('es-ES') : '-'} | {noticia.programa || 'Web'} | ID: {noticia.id_material || noticia.id}
                        </p>
                        {noticia.texto && (
                          <div
                            className="news-related_excerpt"
                            dangerouslySetInnerHTML={{ __html: noticia.texto }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Multimedia - Solo mostrar si hay contenidos disponibles */}
          {contenidos && contenidos.length > 0 && (
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
                  Videos <span className="badge">{videosContenido.length}</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === "audios" ? "active" : ""}`}
                  onClick={() => setActiveTab("audios")}
                >
                  Voces <span className="badge">{audiosContenido.length}</span>
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
                  {videosContenido.length > 0 ? (
                    <div className="multimedia-grid">
                      {videosContenido.map((video, i) => (
                        <div 
                          key={`video-${i}`} 
                          className="multimedia-card"
                          onClick={() => handleOpenModal()}
                        >
                          {/*video.destacado && (
                            <span className="destacado-badge">
                              Destacado
                            </span>
                          )*/}
                          <div className="content-img">
                            <img 
                              src={generarThumbnail(video, 400)} 
                              alt={video.titulo || 'Video'}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23cccccc" width="400" height="225"/%3E%3Ctext fill="%23666666" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="card-text">
                            <div className="card-title">
                              {video.titulo}
                            </div>
                            <div className="card-date">
                              Fecha
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay videos disponibles.</p>
                  )}
                </div>
              )}
              {activeTab === "audios" && (
                <div className="tab-content active">
                  <h4>Audios</h4>
                  {audiosContenido.length > 0 ? (
                    <div className="multimedia-grid">
                      {audiosContenido.map((audio, i) => (
                        <div 
                          key={`audio-${i}`} 
                          className="multimedia-card"
                          onClick={() => handleOpenModal()}
                        >
                          {audio.destacado && (
                            <span className="destacado-badge">
                              ⭐ Destacado
                            </span>
                          )}
                          <img 
                            src={audio.thumbnail} 
                            alt={audio.titulo || 'Audio'}
                            onError={(e) => {
                              // Si la imagen falla, usar gradiente de fallback
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              parent.classList.add('audio-fallback');
                              
                              // Agregar icono grande de audio si no existe
                              if (!parent.querySelector('.audio-fallback-icon')) {
                                const iconDiv = document.createElement('div');
                                iconDiv.className = 'audio-fallback-icon';
                                iconDiv.textContent = '🎵';
                                parent.insertBefore(iconDiv, parent.lastChild);
                              }
                            }}
                          />
                          
                          <div className="play-icon">
                            ▶
                          </div>
                          
                          <div className="card-title">
                            {audio.titulo}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay audios disponibles.</p>
                  )}
                </div>
              )}
            </div>
            </div>
          )}

          {victimas.length > 0 && (
            <div className="victimas">
              <div className="victimas_header">
                <h4 className="victimas_header-title">Víctimas</h4>
                <p className="victimas_header-info">
                  <strong>Total de víctimas identificadas:</strong> {victimas.length}
                </p>
              </div>

              {victimas.map((victima, idx) => {
                // Construir nombre completo
                const nombreCompleto = [victima.name, victima.surname]
                  .filter(Boolean)
                  .join(' ') || "Nombre desconocido";
                
                return (
                  <div key={idx} className="victimas_item">
                    <div className="victimas_item-title">
                      <h5>
                        <strong>{nombreCompleto}</strong>
                        {victima.gender && ` (${victima.gender})`}
                      </h5>
                      {/* {victima.dead_date && (
                        <span className="victimas_fecha">
                          {new Date(victima.dead_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )} */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default FichaFosa;
