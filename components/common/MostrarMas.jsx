"use client";

import { useState } from "react";
import "../../app/styles/_mostrarMas.scss";
import upChevron from "../../app/assets/icon-up-chevron.svg";
import downChevron from "../../app/assets/icon-down-chevron.svg";

export default function MostrarMas({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mostrar-mas-componente">
      <div className={`contenido ${open ? "open" : ""}`}>{children}</div>
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        <span>{open ? "Menos información" : "Más información"}</span>
        <img
          src={open ? upChevron.src : downChevron.src}
          alt=""
          className="chevron"
        />
      </button>
    </div>
  );
}
