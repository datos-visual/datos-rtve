/* jshint esversion: 6 */

class Creditos extends HTMLElement {
    static get observedAttributes() { 
        return ["title", "subtitle", "text", "editor", "content"]; 
    }

    constructor() {
        super();
        this.title = "Créditos";
        this.subtitle = "Un Proyecto de RTVE.es";
        this.text = "Realizado por el equipo de diseño, desarrollo e infografía de RTVE.";
        this.editor = "Elena Torres";
        this.content = "A través de una narrativa visual interactiva, proponemos una experiencia que no solo informa, sino que también invita a reflexionar sobre la memoria histórica, los derechos humanos y la necesidad de reparación.";
    }

    attributeChangedCallback(name, _oldVal, newVal) {
        if (newVal !== null) {
            this[name] = newVal;
        }
        if (this.isConnected) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <section class="credits">
                <div class="credits-wrapper">
                    <h3 class="credits__title">${this.title}</h3>
                    <h4 class="credits__subtitle">
                        ${this.subtitle}
                    </h4>
                    <p class="credits__text">${this.text}</p>
                    <h4 class="credits__subtitle">
                        Edición y contenidos: <span>${this.editor}</span>
                    </h4>
                    <p class="credits__text">
                        Consultoría histórica: Instituto para la Recuperación de la Memoria Democrática Asociación de Archiveros de España. Diseño 
                        y coordinación: Carlos Fernández. Desarrollo web: Laura Medina y Óscar Rivas
                    </p>

                    <div class="mostrar-flex">
                        <mostrar-mas>
                            <p class="credits__text">${this.content}</p>
                        </mostrar-mas>
                    </div>
                </div>
            </section>
        `;
    }
}

customElements.define("creditos-section", Creditos);
