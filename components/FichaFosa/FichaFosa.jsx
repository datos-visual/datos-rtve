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
      
      console.log('🔍 Intentando cargar ficha extra para id:', idDatos, '→', idFormateado);
      fetch(
        `https://www.rtve.es/datos-repo/test-fosas/v2/fichas/${idFormateado}.json`
      )
        .then((resp) => {
          if (!resp.ok) {
            console.warn(`⚠️ Ficha extra no disponible para id: ${idDatos} (${resp.status})`);
            return null;
          }
          return resp.json();
        })
        .then((data) => {
          if (data) {
            console.log('✅ Ficha extra cargada exitosamente para id:', idDatos);
            console.log('   📦 Contenidos:', data?.contenidos?.length || 0);
            console.log('   👥 Víctimas:', data?.victimas?.length || 0);
            setFichaExtra(data);
          } else {
            console.log('ℹ️ No hay datos adicionales para esta fosa (usando solo datos base)');
          }
        })
        .catch((e) => {
          // Silenciar errores de CORS/404 ya que son esperados para muchas fosas
          console.log(`ℹ️ Ficha extra no disponible para id: ${idDatos} (usando solo datos base)`);
        });
    } else {
      console.warn('⚠️ Fosa sin ID, no se puede cargar ficha extra');
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
  const sectionId = fichaExtra?.section_id;
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
  const videosContenido = contenidos.filter(c => c.tipo === "video" || c.embed);
  const audiosContenido = contenidos.filter(c => c.tipo === "audio");

  const claveCategoria = (linea_narrativa || "todas").toLowerCase();
  const textoCategoria =
    claveCategoria === "exhumaciones"
      ? "Exhumados"
      : claveCategoria.charAt(0).toUpperCase() + claveCategoria.slice(1);
  const iconoCategoria = iconosCategorias[claveCategoria] || iconFiltro;

  // Multimedia de la fosa base
  const fotosBase = Array.isArray(foto) ? foto : foto ? [foto] : [];
  const videosBase = Array.isArray(video) ? video : video ? [video] : [];
  const audiosBase = Array.isArray(audio) ? audio : audio ? [audio] : [];

  // Multimedia de fichaExtra (combinar con base)
  const fotos = [...fotosBase].filter(Boolean);
  const videos = [
    ...videosBase,
    ...videosContenido.filter(v => v.url && !v.embed).map(v => v.url)
  ].filter(Boolean);
  const audios = [
    ...audiosBase,
    ...audiosContenido.map(a => a.url)
  ].filter(Boolean);

  // Videos embed de RTVE (para modal)
  const videosEmbed = [
    ...videosContenido.filter(v => v.embed).map(v => v.embed)
  ].filter(Boolean);

  // Debug logs completos
  console.log('═══════════════════════════════════════');
  console.log('📊 FICHA FOSA - Datos completos:');
  console.log('ID Fosa:', fosa?.id);
  console.log('Section ID:', sectionId);
  console.log('Status:', statusExtra);
  console.log('Fechas:', eventDateExtra, '-', eventDateEnd);
  console.log('Bando represor:', bandoRepresor);
  console.log('Contexto muerte:', deathContext);
  console.log('Inhumados:', nBuriedExtra);
  console.log('Exhumados:', nExhumed);
  console.log('Intervenciones:', interventionsDateStart, '-', interventionsDateEnd);
  console.log('Fuente:', fuenteInfo);
  console.log('---');
  console.log('📸 Fotos:', fotos.length);
  console.log('🎬 Videos:', videos.length);
  console.log('📺 Videos embed:', videosEmbed.length, videosEmbed);
  console.log('🎵 Audios:', audios.length);
  console.log('📰 Noticias:', noticias.length, noticias);
  console.log('👥 Víctimas:', victimas.length, victimas);
  console.log('═══════════════════════════════════════');

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
                  <strong>{municipio}</strong> | {provincia} | {ccaa}
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
              {sectionId && (
                <li className="datos__item">
                  <label className="datos__label">ID SECCIÓN</label>
                  <span className="datos__value">{sectionId}</span>
                </li>
              )}
              <li className="datos__item">
                <label className="datos__label">FECHA DE LA FOSA</label>
                <span className="datos__value">
                  {eventDateExtra || "-"}
                  {eventDateEnd && ` / ${eventDateEnd}`}
                </span>
              </li>
              <li className="datos__item">
                <label className="datos__label">ESTADO DE LA FOSA</label>
                <span className="datos__value">{statusExtra || "-"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">NÚMERO DE INHUMADOS</label>
                <span className="datos__value">{nBuriedExtra || "-"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">NÚMERO DE EXHUMADOS</label>
                <span className="datos__value">{nExhumed || "No disponible"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">BANDO REPRESOR</label>
                <span className="datos__value">{bandoRepresor || "-"}</span>
              </li>
              <li className="datos__item">
                <label className="datos__label">CONTEXTO DE MUERTE</label>
                <span className="datos__value" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {deathContext || "-"}
                </span>
              </li>
              <li className="datos__item">
                <label className="datos__label">INTERVENCIONES</label>
                <span className="datos__value">
                  {interventionsDateStart || "No disponible"} / {interventionsDateEnd || "No disponible"}
                </span>
              </li>
            </ul>
          </div>

          {/* Imagen destacada */}
          <div className="foto" onClick={handleOpenModal}>
            <h2 className="datos__title">{title || "Sin título"}</h2>
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
          <ModalCarrousel
            ref={modalRef}
            imagenes={fotos}
            videos={videosEmbed}
            contentType="videos"
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
                <h4>FUENTES</h4>
                <a href={fuenteEnlace} target="_blank">
                  {fuenteInfo} 🔗
                </a>
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
                          <span style={{ 
                            backgroundColor: '#d32f2f', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '3px', 
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            display: 'inline-block'
                          }}>
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
                        <p className="news-related_date" style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                          {noticia.fecha ? new Date(noticia.fecha).toLocaleDateString('es-ES') : '-'} | {noticia.programa || 'Web'} | ID: {noticia.id_material || noticia.id}
                        </p>
                        {noticia.texto && (
                          <div
                            className="news-related_excerpt"
                            dangerouslySetInnerHTML={{ __html: noticia.texto }}
                            style={{ fontSize: '14px', marginTop: '8px' }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
                Videos <span className="badge">{videos.length + videosEmbed.length}</span>
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
                  {videos.length > 0 || videosEmbed.length > 0 ? (
                    <>
                      {/* Videos normales (HTML5) */}
                      {videos.map((v, i) => (
                        <video key={`video-${i}`} controls src={v} width="100%" />
                      ))}
                      
                      {/* Videos embed de RTVE */}
                      {videosEmbed.map((embed, i) => (
                        <div key={`embed-${i}`} className="video-embed-container">
                          <iframe
                            src={embed}
                            width="100%"
                            height="360"
                            frameBorder="0"
                            allowFullScreen
                            title={`Video RTVE ${i + 1}`}
                            style={{ maxWidth: '100%', aspectRatio: '16/9' }}
                          />
                        </div>
                      ))}
                    </>
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
          <div className="fuentes">
            <h4 className="fuentes_title">Fuentes</h4>
            <ul className="fuentes_list">
              <li className="fuentes_item">
                <a href="#">Xunta de Galicia y Memoria Democrática</a>
              </li>
            </ul>
          </div>

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
                      {victima.dead_date && (
                        <span className="victimas_fecha">
                          {new Date(victima.dead_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
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
