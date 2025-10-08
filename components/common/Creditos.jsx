import "../../app/styles/_creditos.scss";
import MostrarMas from "./MostrarMas";

export default function Creditos() {
  return (
    <section className="credits">
      <div className="credits-wrapper">
        <h3 className="credits__title">Créditos</h3>
        <h4 className="credits__subtitle">Un Proyecto de RTVE.es</h4>
        <p className="credits__text">
          Realizado por el equipo de diseño, desarrollo e infografía de RTVE.
        </p>

        <h4 className="credits__subtitle">
          Edición y contenidos:
        </h4>
        <p className="credits__text">
          Este es un texto de ejemplo para utilizar en el componente de los créditos de este proyecto. Se usa como contenido de relleno para pruebas de diseño o desarrollo, y su único propósito es ocupar espacio y permitir visualizar cómo quedará la estructura final una vez que se incorpore el texto real.
          A lo largo de este párrafo se puede comprobar la distribución del texto, el interlineado y la proporción entre títulos y cuerpos de texto. También permite evaluar la legibilidad en distintos tamaños de pantalla y dispositivos.
          En general, este tipo de texto es útil para verificar estilos tipográficos, márgenes y espaciados, sin distraer con información real o definitiva.
        </p>

        <div className="mostrar-flex">
          <MostrarMas>
            <p className="credits__text">
              A través de una narrativa visual interactiva, proponemos una
              experiencia que no solo informa, sino que también invita a
              reflexionar sobre la memoria histórica, los derechos humanos y la
              necesidad de reparación.
            </p>
          </MostrarMas>
        </div>
      </div>
    </section>
  );
}
