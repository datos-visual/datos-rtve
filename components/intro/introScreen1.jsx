"use client";

import barraIntro from "../../app/assets/barra-intro.svg";
import ScrollButton from "../ScrollButton/ScrollButton";
import "../../app/styles/intro/_introScreen1.scss";

export default function IntroScreen1({ onNextScreen, onNavigation }) {
  return (
    <section className="intro-screen" id="screen1" aria-label="Introducción">
      <div className="intro-sticky">
        <div className="intro-overlay">
          <h1>El país de las 6.000 fosas</h1>
          <img
            className="intro-divider-img"
            src={barraIntro?.src || barraIntro}
            alt=""
            aria-hidden="true"
          />
          <p className="intro-sub">AQUÍ YACE LA HISTORIA</p>
        </div>
        <ScrollButton
          label="Conoce las historias"
          animated={true}
          icon="mouse"
          onClick={() => {
            if (onNavigation) onNavigation({ action: "next-screen" });
            else if (onNextScreen) onNextScreen({ action: "next-screen" });
          }}
        />
      </div>
    </section>
  );
}
