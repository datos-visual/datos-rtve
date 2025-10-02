"use client";

import { useState, useEffect } from "react";
import styles from "./EmbedGenerator.module.scss";

export default function EmbedGenerator() {
  const [baseUrl, setBaseUrl] = useState("");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("600px");
  const [ccaa, setCcaa] = useState("");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [fosaId, setFosaId] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Lista de CCAA para el selector
  const ccaaOptions = [
    { value: "", label: "Todas las Comunidades" },
    { value: "andalucia", label: "Andalucía" },
    { value: "aragon", label: "Aragón" },
    { value: "asturias", label: "Asturias" },
    { value: "baleares", label: "Baleares" },
    { value: "canarias", label: "Canarias" },
    { value: "cantabria", label: "Cantabria" },
    { value: "castilla-la-mancha", label: "Castilla-La Mancha" },
    { value: "castilla-y-leon", label: "Castilla y León" },
    { value: "cataluna", label: "Cataluña" },
    { value: "extremadura", label: "Extremadura" },
    { value: "galicia", label: "Galicia" },
    { value: "madrid", label: "Madrid" },
    { value: "murcia", label: "Murcia" },
    { value: "navarra", label: "Navarra" },
    { value: "pais-vasco", label: "País Vasco" },
    { value: "rioja", label: "La Rioja" },
    { value: "valencia", label: "Comunidad Valenciana" },
  ];

  // Obtener la URL base
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const baseUrl = `${url.protocol}//${url.host}`;
      setBaseUrl(baseUrl);
    }
  }, []);

  // Generar el código de embebido cuando cambien los parámetros
  useEffect(() => {
    if (!baseUrl) return;

    // Construir la URL con los parámetros seleccionados
    let embedUrl = `${baseUrl}/embed/mapa`;
    const params = [];

    if (ccaa) params.push(`ccaa=${encodeURIComponent(ccaa)}`);
    if (provincia) params.push(`provincia=${encodeURIComponent(provincia)}`);
    if (municipio) params.push(`municipio=${encodeURIComponent(municipio)}`);
    if (fosaId) params.push(`fosa=${encodeURIComponent(fosaId)}`);

    if (params.length > 0) {
      embedUrl += `?${params.join("&")}`;
    }

    // Generar el código HTML para el iframe
    const code = `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  style="border:0; max-width:100%;" 
  title="Mapa de Fosas RTVE" 
  allow="geolocation" 
  loading="lazy">
</iframe>`;

    setEmbedCode(code);
  }, [baseUrl, width, height, ccaa, provincia, municipio, fosaId]);

  // Manejar la copia al portapapeles
  const handleCopy = () => {
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
      });
  };

  return (
    <div className={styles.embedGenerator}>
      <h1>Generador de Código de Embebido</h1>
      <p>
        Personaliza las opciones del mapa y genera el código para insertarlo en
        tu sitio web.
      </p>

      <div className={styles.optionsPanel}>
        <div className={styles.optionsSection}>
          <h2>Dimensiones</h2>
          <div className={styles.formGroup}>
            <label htmlFor="width">Ancho:</label>
            <input
              type="text"
              id="width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="ej: 100%, 800px"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="height">Alto:</label>
            <input
              type="text"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="ej: 600px"
            />
          </div>
        </div>

        <div className={styles.optionsSection}>
          <h2>Filtros</h2>
          <div className={styles.formGroup}>
            <label htmlFor="ccaa">Comunidad Autónoma:</label>
            <select
              id="ccaa"
              value={ccaa}
              onChange={(e) => setCcaa(e.target.value)}
            >
              {ccaaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="provincia">Provincia:</label>
            <input
              type="text"
              id="provincia"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="municipio">Municipio:</label>
            <input
              type="text"
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fosaId">ID de Fosa específica:</label>
            <input
              type="text"
              id="fosaId"
              value={fosaId}
              onChange={(e) => setFosaId(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>

      <div className={styles.previewSection}>
        <h2>Vista previa</h2>
        <div className={styles.previewContainer}>
          <iframe
            src={`${baseUrl}/embed/mapa${ccaa ? `?ccaa=${ccaa}` : ""}${
              provincia ? `&provincia=${provincia}` : ""
            }${municipio ? `&municipio=${municipio}` : ""}${
              fosaId ? `&fosa=${fosaId}` : ""
            }`}
            width={width}
            height={height}
            style={{ border: "0", maxWidth: "100%" }}
            title="Mapa de Fosas RTVE"
            allow="geolocation"
          ></iframe>
        </div>
      </div>

      <div className={styles.codeSection}>
        <h2>Código de embebido</h2>
        <div className={styles.codeContainer}>
          <pre>{embedCode}</pre>
        </div>
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? "¡Copiado!" : "Copiar código"}
        </button>
      </div>

      <div className={styles.instructions}>
        <h2>Instrucciones</h2>
        <ol>
          <li>Personaliza las opciones según tus necesidades.</li>
          <li>Copia el código generado.</li>
          <li>
            Pega el código en el HTML de tu sitio web donde quieras que aparezca
            el mapa.
          </li>
          <li>
            El mapa se adaptará al contenedor donde lo coloques, respetando las
            dimensiones especificadas.
          </li>
        </ol>
      </div>
    </div>
  );
}
