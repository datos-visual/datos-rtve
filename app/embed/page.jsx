"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./EmbedIndex.module.scss";

export default function EmbedIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirige automáticamente a la página del mapa
    router.push("/embed/mapa");
  }, [router]);

  return (
    <div className={styles.embedIndex}>
      <h1>Redirigiendo al mapa de fosas...</h1>
    </div>
  );
}
