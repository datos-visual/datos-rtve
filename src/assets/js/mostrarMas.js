/* jshint esversion: 6 */

class MostrarMas extends HTMLElement {
    constructor() {
        super();
        this.expanded = false;
    }

    connectedCallback() {
        const contenido = this.innerHTML;
        this.innerHTML = `
            <div class="mostrar-mas-componente">
                <div class="contenido" style="display: none;">${contenido}</div>
                <button class="toggle-btn">⬇ Mostrar más información</button>
            </div>
        `;
        
        this.querySelector(".toggle-btn").addEventListener("click", () => {
            this.expanded = !this.expanded;
            this.render();
        });
        this.render(); // estado inicial
    }

    render() {
        const contenido = this.querySelector(".contenido");
        const btn = this.querySelector(".toggle-btn");

        if (this.expanded) {
            contenido.style.display = "block";
            btn.innerHTML = "⬆ Mostrar menos";
        } else {
            contenido.style.display = "none";
            btn.innerHTML = "⬇ Mostrar más información";
        }
    }
}

customElements.define("mostrar-mas", MostrarMas);
