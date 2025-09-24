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
          Edición y contenidos: <span>Elena Torres</span>
        </h4>
        <p className="credits__text">
          Consultoría histórica: Instituto para la Recuperación de la Memoria
          Democrática Asociación de Archiveros de España. Diseño y coordinación:
          Carlos Fernández. Desarrollo web: Laura Medina y Óscar Rivas.
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
