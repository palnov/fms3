import styles from "@/legacy/pages/home/page.module.css";

/**
 * A quiet, editorial illustration for the three documents the site explains.
 * The SVG is deliberately schematic: it communicates the subject without
 * pretending to reproduce a government document or inventing personal data.
 */
export default function HomeDocumentsIllustration() {
  return (
    <div className={styles.documentsStage} data-motion="hero-visual">
      <svg
        viewBox="0 0 560 440"
        role="img"
        aria-labelledby="home-documents-title"
        className={styles.documentsSvg}
      >
        <title id="home-documents-title">Паспорт России, РВП и вид на жительство</title>
        <defs>
          <linearGradient id="home-passport-cover" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#5b3a40" />
            <stop offset=".55" stopColor="#493035" />
            <stop offset="1" stopColor="#322125" />
          </linearGradient>
          <pattern id="home-passport-texture" width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 1h7M1 0v7" stroke="#fff" strokeOpacity=".025" strokeWidth=".55" />
          </pattern>
          <filter id="home-document-shadow" x="-45%" y="-40%" width="190%" height="210%">
            <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#07100d" floodOpacity=".42" />
          </filter>
          <filter id="home-passport-gold" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 .82 0 0 0 0 .70 0 0 0 0 .44 0 0 0 1 0" />
          </filter>
        </defs>

        <ellipse className={styles.documentGroundShadow} cx="282" cy="397" rx="174" ry="17" />

        <g className={styles.documentStack}>
          <g transform="translate(38 113) rotate(-12 100 137)" filter="url(#home-document-shadow)">
            <rect width="200" height="274" rx="16" fill="#dfe4dc" />
            <rect x="10" y="10" width="180" height="254" rx="10" fill="none" stroke="#5c7869" strokeOpacity=".55" />
            <text x="100" y="38" fill="#26342e" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1.1">РОССИЯ</text>
            <text x="100" y="67" fill="#26342e" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" textAnchor="middle">РАЗРЕШЕНИЕ</text>
            <text x="100" y="84" fill="#26342e" fontFamily="Arial, sans-serif" fontSize="10" textAnchor="middle">НА ВРЕМЕННОЕ</text>
            <text x="100" y="99" fill="#26342e" fontFamily="Arial, sans-serif" fontSize="10" textAnchor="middle">ПРОЖИВАНИЕ</text>
            <path d="M28 123h144M28 139h104M28 155h144M28 171h86" stroke="#7e9488" strokeWidth="1" opacity=".55" />
            <circle cx="145" cy="216" r="27" fill="none" stroke="#5c7869" strokeWidth="2" opacity=".72" />
            <text x="145" y="213" fill="#5c7869" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">РВП</text>
            <text x="145" y="227" fill="#5c7869" fontFamily="Arial, sans-serif" fontSize="6" textAnchor="middle" letterSpacing=".8">ДОКУМЕНТ</text>
          </g>

          <g transform="translate(322 98) rotate(9 100 145)" filter="url(#home-document-shadow)">
            <rect width="200" height="290" rx="18" fill="#30483e" />
            <rect x="10" y="10" width="180" height="270" rx="12" fill="none" stroke="#17261f" strokeOpacity=".65" />
            <path d="M24 78h152M24 222h152" stroke="#c8aa70" strokeOpacity=".4" />
            <text x="100" y="39" fill="#d4b978" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1.2">РОССИЙСКАЯ</text>
            <text x="100" y="55" fill="#d4b978" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1.2">ФЕДЕРАЦИЯ</text>
            <text x="100" y="105" fill="#e1c88e" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">ВИД НА ЖИТЕЛЬСТВО</text>
            <image href="/illustrations/russian-coat-of-arms.png" x="52" y="100" width="96" height="96" preserveAspectRatio="xMidYMid meet" filter="url(#home-passport-gold)" />
            <text x="100" y="253" fill="#d4b978" fontFamily="Georgia, serif" fontSize="16" fontWeight="700" textAnchor="middle" letterSpacing="2.4">ВНЖ</text>
          </g>

          <g transform="translate(172 48) rotate(-4 108 160)" filter="url(#home-document-shadow)">
            <rect width="216" height="320" rx="20" fill="url(#home-passport-cover)" />
            <rect width="216" height="320" rx="20" fill="url(#home-passport-texture)" />
            <rect x="10" y="10" width="196" height="300" rx="14" fill="none" stroke="#160d0f" strokeOpacity=".36" />
            <text x="108" y="42" fill="#d4b978" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="1.7">РОССИЙСКАЯ</text>
            <text x="108" y="60" fill="#d4b978" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="1.7">ФЕДЕРАЦИЯ</text>
            <image href="/illustrations/russian-coat-of-arms.png" x="52" y="98" width="112" height="112" preserveAspectRatio="xMidYMid meet" filter="url(#home-passport-gold)" />
            <text x="108" y="274" fill="#d4b978" fontFamily="Georgia, serif" fontSize="23" fontWeight="700" textAnchor="middle" letterSpacing="5">ПАСПОРТ</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
