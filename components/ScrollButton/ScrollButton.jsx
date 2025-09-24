"use client";

import { useEffect, useRef } from "react";
import flechaIcon from "../../app/assets/flecha-movil.svg";
import "../../app/styles/_scrollButton.scss";

export default function ScrollButton({
  label = "Conoce las historias",
  icon = "mouse",
  animated = true,
  distance,
  duration,
  thickness = 4,
  onClick,
}) {
  const buttonRef = useRef(null);
  const svgRef = useRef(null);
  const wheelRef = useRef(null);
  const outlineRef = useRef(null);

  // Calcula rango dinámico del wheel si no se pasó distance
  const setDynamicWheelRange = () => {
    if (!svgRef.current || icon === "flecha" || !animated) return;

    const svg = svgRef.current;
    const outline = outlineRef.current;
    const wheel = wheelRef.current;
    const button = buttonRef.current;
    if (!svg || !outline || !wheel || !button) return;

    const strokeWidth = parseFloat(outline.getAttribute("stroke-width") || "0");
    const vb = svg.viewBox?.baseVal || { height: 43 };
    const renderedHeight = svg.getBoundingClientRect().height || 40;
    const scale = renderedHeight / (vb.height || 43);

    const ob = outline.getBBox();
    const wb = wheel.getBBox();
    const bottomInside = ob.y + ob.height - strokeWidth * 0.5;
    const currentBottom = wb.y + wb.height;
    const travelUnits = Math.max(0, bottomInside - currentBottom);
    const travelPx = travelUnits * scale;

    button.style.setProperty("--wheel-range", `${travelPx}px`);
  };

  useEffect(() => {
    setDynamicWheelRange();

    const resizeHandler = () => {
      clearTimeout(resizeHandler._timeout);
      resizeHandler._timeout = setTimeout(setDynamicWheelRange, 100);
    };
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearTimeout(resizeHandler._timeout);
    };
  }, [icon, animated]);

  const iconMarkup =
    icon === "flecha" ? (
      <img className="scroll-icon" src={flechaIcon} alt="" aria-hidden="true" />
    ) : (
      <svg
        ref={svgRef}
        className="scroll-icon mouse-icon"
        width="30"
        height="43"
        viewBox="0 0 30 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          ref={outlineRef}
          className="mouse-outline"
          d="M28.5 15.5C28.5 8.04416 22.4558 2 15 2C7.54416 2 1.5 8.04416 1.5 15.5V27.5C1.5 34.9559 7.54416 41 15 41C22.4558 41 28.5 34.9559 28.5 27.5V15.5Z"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={wheelRef}
          className="mouse-wheel"
          d="M15 11V15.5"
          stroke="white"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  const style = {};
  if (distance !== undefined) style["--wheel-range"] = `${distance}px`;
  if (duration !== undefined) style["--wheel-duration"] = `${duration}s`;

  return (
    <button
      ref={buttonRef}
      className={`scroll-button${animated ? " is-animated" : ""}`}
      aria-label={label}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          buttonRef.current?.click();
        }
      }}
    >
      {iconMarkup}
      <span className="scroll-text">{label}</span>
    </button>
  );
}
