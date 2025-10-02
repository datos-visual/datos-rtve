export const metadata = {
  title: "Embed Mapa de Fosas - RTVE",
  description: "Versión embebible del mapa de fosas para otros sitios web",
};

export default function EmbedLayout({ children }) {
  return <div className="embed-layout">{children}</div>;
}
