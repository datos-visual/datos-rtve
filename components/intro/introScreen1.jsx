"use client";

// URL absoluta del CDN para evitar hashes
const barraIntro = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/barra-intro.svg";
import ScrollButton from "../ScrollButton/ScrollButton";
import "../../app/styles/intro/_introScreen1.scss";

export default function IntroScreen1({onNextScreen, onNavigation}) {
    return (
        <section className="intro-screen" id="screen1" aria-label="Introducción">
            <div className="intro-sticky">
                <div className="intro-overlay">
                    <h1>El país de las 6.000 fosas</h1>
                    <div className="divider-intro" aria-hidden="true"></div>

                    <p className="intro-sub">AQUÍ YACE LA HISTORIA</p>
                </div>
                <ScrollButton
                    label="Conoce las historias"
                    animated={true}
                    icon="mouse"
                    onClick={() => {
                        if (onNavigation) onNavigation({action: "next-screen"});
                        else if (onNextScreen) onNextScreen({action: "next-screen"});
                    }}
                />
            </div>
        </section>
    );
}
