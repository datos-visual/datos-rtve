import "./mostrarMas.js";
import "../../styles/_sobreProyecto.scss";

class SobreElProyecto extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="sobre-proyecto">
        <div class="sobre-proyecto-wrapper">
            <h3 class="sobre-proyecto__title">Sobre el proyecto</h3>
            <p class="sobre-proyecto__text">
            Este proyecto busca visibilizar, documentar y poner en contexto la localización
            de fosas comunes en España, muchas de ellas vinculadas a la Guerra Civil y la represión franquista.
            </p>

            <div class="mostrar-flex">
                <mostrar-mas>
                <p class="sobre-proyecto__text">A través de una narrativa visual interactiva, proponemos una experiencia que no solo informa,
                sino que también invita a reflexionar sobre la memoria histórica, los derechos humanos y
                la necesidad de reparación. </p>
                </mostrar-mas>
            </div>
        </div>
      </section>
    `;
  }
}

customElements.define("sobre-proyecto", SobreElProyecto);
