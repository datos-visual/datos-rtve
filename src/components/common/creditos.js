import "./mostrarMas.js";
import "../../styles/_creditos.scss";

class Creditos extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="credits">
        <div class="credits-wrapper">
            <h3 class="credits__title">Créditos</h3>
            <h4 class="credits__subtitle">
                Un Proyecto de RTVE.es
            </h4>
            <p class="credits__text">Realizado por el equipo de diseño, desarrollo e infografía de RTVE.</p>
            <h4 class="credits__subtitle">
                Edición y contenidos: <span>Elena Torres</span>
            </h4>
            <p class="credits__text">
                Consultoría histórica: Instituto para la Recuperación de la Memoria Democrática Asociación de Archiveros de EspañaDiseño 
                y coordinación: Carlos Fernández Desarrollo web: Laura Medina y Óscar Rivas
            </p>

            <div class="mostrar-flex">
                <mostrar-mas>
                    <p class="credits__text">A través de una narrativa visual interactiva, proponemos una experiencia que no solo informa,
                    sino que también invita a reflexionar sobre la memoria histórica, los derechos humanos y
                    la necesidad de reparación. </p>
                </mostrar-mas>
            </div>
        </div>
      </section>
    `;
  }
}

customElements.define("creditos-section", Creditos);
