class ModalCarrousel extends HTMLElement {
  constructor() {
    super();
    this._imagenes = [];
    this._idx = 0;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.85);
          z-index: 9999;
          justify-content: center;
          align-items: center;
        }
        .contenedor {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 2rem;
        }
        img {
          max-width: 70vw;
          max-height: 70vh;
          border-radius: 8px;
          box-shadow: 0 0 20px #000;
        }
        #indicador {
          color: white;
          margin-top: 12px;
        }
      </style>
      <div class="contenedor">
        <button id="cerrar" style="position:absolute;top:10px;right:10px;">&times;</button>
        <div style="display:flex;align-items:center;">
          <button id="prev">&#8592;</button>
          <img id="img" src="" alt="Imagen carrusel"/>
          <button id="next">&#8594;</button>
        </div>
        <div id="indicador"></div>
      </div>
    `;
  }

  connectedCallback() {
    this._cerrarBtn = this.shadowRoot.querySelector("#cerrar");
    this._prevBtn = this.shadowRoot.querySelector("#prev");
    this._nextBtn = this.shadowRoot.querySelector("#next");
    this._imgEl = this.shadowRoot.querySelector("#img");
    this._indicador = this.shadowRoot.querySelector("#indicador");

    this._cerrarBtn.addEventListener("click", () => this.close());
    this._prevBtn.addEventListener("click", () => this._mostrar(this._idx - 1));
    this._nextBtn.addEventListener("click", () => this._mostrar(this._idx + 1));
  }

  set imagenes(lista) {
    this._imagenes = Array.isArray(lista) ? lista : [];
  }

  open(startIdx = 0) {
    this.style.display = "flex";
    this._mostrar(startIdx);
  }

  close() {
    this.style.display = "none";
  }

  _mostrar(i) {
    if (!this._imagenes.length) return;
    this._idx = (i + this._imagenes.length) % this._imagenes.length;
    this._imgEl.src = this._imagenes[this._idx];
    this._indicador.textContent = `${this._idx + 1} / ${this._imagenes.length}`;
  }
}

customElements.define("modal-carrousel", ModalCarrousel);
