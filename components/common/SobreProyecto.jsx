import "../../app/styles/_sobreProyecto.scss";
import MostrarMas from "./MostrarMas";

export default function SobreElProyecto() {
  return (
    <section className="sobre-proyecto">
      <div className="sobre-proyecto-wrapper">
        <h3 className="sobre-proyecto__title">Sobre el proyecto</h3>
        <p className="sobre-proyecto__text">
          Este proyecto busca visibilizar, documentar y poner en contexto la
          localización de fosas comunes en España, muchas de ellas vinculadas a
          la Guerra Civil y la represión franquista.
        </p>

        <div className="mostrar-flex">
          <MostrarMas>
            <p className="sobre-proyecto__text">
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
