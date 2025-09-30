/**
 * Componente para mostrar el contador de fosas visibles y la lista lateral
 * Basado en la funcionalidad del proyecto infografiasRTVE-mapa-fosas
 */
import React from 'react';

export default function MapaRecuento({ 
  contadorVisible, 
  contadorRef, 
  listaRef, 
  ulRef 
}) {
  return (
    <>
      {/* Contador de fosas visibles */}
      {contadorVisible && (
        <div 
          ref={contadorRef}
          className="toolbar-counter"
        >
          Fosas visibles: 0
        </div>
      )}

      {/* Lista lateral de fosas visibles */}
      <div 
        ref={listaRef}
        className="fosas-laterales"
        hidden
      >
        <h3>Fosas visibles</h3>
        <ul ref={ulRef}></ul>
      </div>
    </>
  );
}
