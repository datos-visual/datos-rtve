import "../../styles/_moduloReportajes.scss";
import Imagen1 from "../../assets/image1.png";
import Imagen2 from "../../assets/image2.png";
import Imagen3 from "../../assets/image3.png";
import Imagen4 from "../../assets/image4.png";
import Imagen5 from "../../assets/image5.png";
import Imagen6 from "../../assets/image6.png";
import ImagenHover from "../../assets/image1-hover.png";

class ModuloReportajes extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="modulo-reportajes">
        <div class="modulo-reportajes-wrapper">
            <h3>Título para módulo de Reportajes</h3>
            
            <div class="cards-container">
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen1} alt="imagen 1" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    <p class="reportajes-card__type">Mujeres</p>
                    <h4 class="reportajes-card__title">Humilladas y asesinadas por ser mujeres</h4>
                    <p class="reportajes-card__text">
                      Tras el sueño de la igualdad en la Segunda República llegó la pesadilla de la represión
                    </p>
                </div>
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen2} alt="imagen 2" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    <p class="reportajes-card__type">Objetos</p>
                    <h4 class="reportajes-card__title">La memoria de un anillo, un peine o una carta</h4>
                    <p class="reportajes-card__text">
                      Los objetos ayudan a la identificación y representan para las familias a la persona que ha estado ausente.
                    </p>
                </div>
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen3} alt="imagen 3" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    <p class="reportajes-card__type">Lugares</p>
                    <h4 class="reportajes-card__title">Un lugar donde hacerlos desaparecer para siempre</h4>
                    <p class="reportajes-card__text">
                      Además de los cementerios y las cunetas, todo tipo de parajes se convirtieron en lugar de enterramiento.
                    </p>
                </div>
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen4} alt="imagen 4" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    <p class="reportajes-card__type">Reprasaliados</p>
                    <h4 class="reportajes-card__title">Morir por sus ideas o por ser fiel a la República</h4>
                    <p class="reportajes-card__text">
                      Alcaldes y sindicalistas, pero también maestros de escuela fueron asesinados por los sublevados.
                    </p>
                </div>
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen5} alt="imagen 5" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    
                    <p class="reportajes-card__type">Nombres propios</p>
                    <h4 class="reportajes-card__title">De Federico García Lorca a Pedro Muñoz Seca</h4>
                    <p class="reportajes-card__text">
                      Personajes de la cultura, la política o la sociedad civil también acabaron en fosas comunes.
                    </p>
                </div>
                <div class="reportajes-card">
                    <div class="card-image">
                      <img src=${Imagen6} alt="imagen 6" class="image-main" />
                      <img src=${ImagenHover} alt="" class="image-hover" />
                    </div>
                    <p class="reportajes-card__type">Exhumaciones tempranas</p>
                    <h4 class="reportajes-card__title">Abrir la tierra con las propias manos</h4>
                    <p class="reportajes-card__text">
                      Los pioneros de la memoria exhumaron a sus familiares durante la Transición para darles una sepultura digna.
                    </p>
                </div>
            </div>
        </div>
      </section>
    `;
  }
}

customElements.define("modulo-reportajes", ModuloReportajes);
