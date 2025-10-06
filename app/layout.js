import { Merriweather, Merriweather_Sans } from "next/font/google";
import Script from "next/script";
// En desarrollo cargamos SCSS directamente; en PRE/PROD lo sustituimos por <link>
import "./styles/main.scss";
const ENV = process.env.APP_ENV || "development";
// En PRE/PROD añadir dos hojas: layout.css y page.css (orden importa)
const CSS_LAYOUT_URL =
  ENV === "development" ? null : "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/layout.css?v=2";
const CSS_PAGE_URL =
  ENV === "development" ? null : "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/page.css";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const merryweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "**SEO TITLE FORMADO**",
  description: "**META DESCRIPTION FORMADA**",
  robots: "index,follow,max-image-preview:large",
  alternates: {
    canonical: "**URL AUTORREFERENCIADA**",
  },
  openGraph: {
    type: "website",
    siteName: "RTVE.es",
    locale: "es_ES",
    title: "**SEO TITLE FORMADO**",
    description: "**META DESCRIPTION FORMADA**",
    url: "**URL AUTORREFERENCIADA**",
    images: [
      {
        url: "**URL DE LA IMAGEN EN JPG DEL ESPECIAL**",
        width: 1200,
        height: 630,
        alt: "**NOMBRE DEL ESPECIAL**",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rtve",
    title: "**SEO TITLE FORMADO**",
    description: "**META DESCRIPTION FORMADA**",
    images: ["**URL DE LA IMAGEN EN JPG DEL ESPECIAL**"],
  },
  icons: {
    icon: "https://www.rtve.es/favicon.ico",
  },
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* CSS estático RTVE en PRE/PROD */}
        {CSS_LAYOUT_URL && <link rel="stylesheet" href={CSS_LAYOUT_URL} />}
        {CSS_PAGE_URL && <link rel="stylesheet" href={CSS_PAGE_URL} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "RTVE.es",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://www.rtve.es/#website",
              url: "https://www.rtve.es/",
              name: "RTVE.es",
              publisher: {
                "@type": "Organization",
                name: "RTVE.es",
                url: "https://www.rtve.es/",
              },
              inLanguage: "es-ES",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              url: metadata.alternates.canonical,
              name: metadata.title,
              description: metadata.description,
              isPartOf: { "@id": "https://www.rtve.es/#website" },
              publisher: {
                "@type": "Organization",
                name: "RTVE.es",
                url: "https://www.rtve.es/",
                logo: {
                  "@type": "ImageObject",
                  url: "https://img2.rtve.es/css/rtve.commons/rtve.header.footer/i/logoRTVE.png",
                },
              },
            }),
          }}
        />
      </head>
      <body className={`${merriweather.variable} ${merryweatherSans.variable}`}>
        {children}

        {/* Script de cookies y analítica */}
        <Script
          src="https://js.rtve.es/js/mushrooms/rtve_mushroom.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
