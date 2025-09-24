/* jshint esversion: 6 */

class ScrollButton extends HTMLElement {
    static get observedAttributes() { 
        return ["label", "icon", "animated", "distance", "duration", "thickness"]; 
    }

    constructor() {
        super();
        this.label = "Conoce las historias";
        this.icon = "mouse";
        this.elements = {}; // Cache para elementos DOM
        this._resizeHandler = null;
    }

    // Helper para convertir valores numéricos
    parseNumericAttr(value) {
        return value != null && value !== "" ? Number(value) : undefined;
    }

    // Helper para verificar si un número es válido
    isValidNumber(value) {
        return Number.isFinite(value);
    }

    attributeChangedCallback(name, _oldVal, newVal) {
        const updates = {
            label: () => this.label = newVal || "Conoce las historias",
            icon: () => this.icon = (newVal || "mouse").toLowerCase(),
            animated: () => this.animated = String(newVal).toLowerCase() === "true",
            distance: () => this.distance = this.parseNumericAttr(newVal),
            duration: () => this.duration = this.parseNumericAttr(newVal),
            thickness: () => this.thickness = this.parseNumericAttr(newVal)
        };

        updates[name]?.();
        if (this.isConnected) this.render();
    }

    connectedCallback() { 
        this.render(); 
    }

    disconnectedCallback() { 
        this.cleanupResizeHandler(); 
    }

    render() {
        const wheelStroke = this.isValidNumber(this.thickness) ? this.thickness : 4;
        const iconMarkup = this.getIconMarkup(wheelStroke);
        const animatedClass = this.animated ? " is-animated" : "";
        const styleAttr = this.buildStyleAttribute();

        this.innerHTML = `
            <button class="scroll-button${animatedClass}" aria-label="${this.label}"${styleAttr}>
                ${iconMarkup}
                <span class="scroll-text">${this.label}</span>
            </button>
        `;

        this.cacheElements();
        this.addEventListeners();
        this.setupDynamicRange();
    }

    // Generar markup del icono
    getIconMarkup(wheelStroke) {
        return this.icon === "flecha"
            ? `<img class="scroll-icon" src="/assets/flecha-movil.svg" alt="" aria-hidden="true" />`
            : `
                <svg class="scroll-icon mouse-icon" width="30" height="43" viewBox="0 0 30 43" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="mouse-outline" d="M28.5 15.5C28.5 8.04416 22.4558 2 15 2C7.54416 2 1.5 8.04416 1.5 15.5V27.5C1.5 34.9559 7.54416 41 15 41C22.4558 41 28.5 34.9559 28.5 27.5V15.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path class="mouse-wheel" d="M15 11V15.5" stroke="white" stroke-width="${wheelStroke}" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
    }

    // Construir atributo de estilo
    buildStyleAttribute() {
        const styleVars = [];
        if (this.isValidNumber(this.distance)) styleVars.push(`--wheel-range: ${this.distance}px`);
        if (this.isValidNumber(this.duration)) styleVars.push(`--wheel-duration: ${this.duration}s`);
        return styleVars.length ? ` style="${styleVars.join(';')}"` : "";
    }

    // Cachear elementos DOM
    cacheElements() {
        this.elements = {
            button: this.querySelector(".scroll-button"),
            svg: this.querySelector('.mouse-icon'),
            outline: this.querySelector('.mouse-outline'),
            wheel: this.querySelector('.mouse-wheel')
        };
    }

    // Configurar rango dinámico si es necesario
    setupDynamicRange() {
        if (!this.isValidNumber(this.distance) && this.icon !== "flecha" && this.animated) {
            this.setDynamicWheelRange();
            this.setupResizeHandler();
        }
    }

    addEventListeners() {
        if (!this.elements.button) return;

        this.elements.button.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("scroll-button-click", { 
                bubbles: true, 
                composed: true 
            }));
        });

        this.elements.button.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.elements.button.click();
            }
        });
    }

    setDynamicWheelRange() {
        const { svg, outline, wheel, button } = this.elements;
        if (!svg || !outline || !wheel || !button) return;

        const strokeWidth = parseFloat(outline.getAttribute('stroke-width') || '0');
        const vb = svg.viewBox?.baseVal || { height: 43 };
        const renderedHeight = svg.getBoundingClientRect().height || 40;
        const scale = renderedHeight / (vb.height || 43);

        // Bounding boxes en unidades del SVG
        const ob = outline.getBBox();
        const wb = wheel.getBBox();

        // Borde interior inferior (restar medio trazo para respetar contorno)
        const bottomInside = ob.y + ob.height - (strokeWidth * 0.5);
        const currentBottom = wb.y + wb.height;
        const travelUnits = Math.max(0, bottomInside - currentBottom);
        const travelPx = travelUnits * scale;

        if (this.isValidNumber(travelPx)) {
            button.style.setProperty('--wheel-range', `${travelPx}px`);
        }
    }

    // Configurar resize handler con debounce
    setupResizeHandler() {
        this.cleanupResizeHandler();

        this._resizeHandler = () => {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = setTimeout(() => this.setDynamicWheelRange(), 100);
        };

        window.addEventListener('resize', this._resizeHandler);
    }

    // Limpiar resize handler
    cleanupResizeHandler() {
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        clearTimeout(this._resizeTimeout);
    }
}

// Registrar el custom element
customElements.define("scroll-button", ScrollButton);
