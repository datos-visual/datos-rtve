import "../styles/_introUnified.scss";
import "./intro/introScreen1.js";
import "./intro/introScreen2.js";
import "./intro/introScreen3.js";

class IntroFlowController {
  constructor(root) {
    this.root = root;
    this.selectedCategory = "";
    this.currentStep = 1;
    this.components = {
      screen1: this.root.querySelector("intro-screen1"),
      screen2: this.root.querySelector("intro-screen2"),
      screen3: this.root.querySelector("intro-screen3")
    };
  }

  init() {
    this.root.addEventListener('intro-navigation', (e) => this.handleNavigation(e));
    this.showStep(1);
  }

  handleNavigation(event) {
    const { action, data } = event.detail;

    switch (action) {
      case 'next-screen':
        if (this.currentStep === 1) {
          this.components.screen2?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'category-selected':
        this.selectedCategory = data.category;
        this.showStep(2);
        break;

      case 'go-to-historias':
        window.location.href = data.categoria ? 
          `/historias?categoria=${encodeURIComponent(data.categoria)}` : 
          '/historias';
        break;
    }
  }

  showStep(stepNumber) {
    // Ocultar todos los componentes
    Object.values(this.components).forEach(component => {
      component?.setVisible(false);
    });

    if (stepNumber === 1) {
      // Mostrar screens 1 y 2 juntos
      this.components.screen1?.setVisible(true);
      this.components.screen2?.setVisible(true);
    } else if (stepNumber === 2) {
      // Mostrar solo screen 3 con categoría seleccionada
      this.components.screen3?.setVisible(true);
      if (this.selectedCategory) {
        this.components.screen3.setAttribute('categoria', this.selectedCategory);
      }
    }

    this.currentStep = stepNumber;
  }
}

class IntroUnified extends HTMLElement {
  constructor() {
    super();
    this.controller = null;
  }

  connectedCallback() {
    this.render();
    this.controller = new IntroFlowController(this);
    this.controller.init();
  }

  render() {
    this.innerHTML = `
      <intro-screen1></intro-screen1>
      <intro-screen2></intro-screen2>
      <intro-screen3></intro-screen3>
    `;
  }

  disconnectedCallback() {
    this.controller = null;
  }
}

customElements.define("intro-section", IntroUnified);
