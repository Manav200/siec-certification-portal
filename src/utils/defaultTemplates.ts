export interface PresetTemplate {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

// Generate high-resolution SVG certificate templates as data URLs
function createSvgDataUrl(title: string, themeColor: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${themeColor}"/>
        <stop offset="100%" stop-color="${accentColor}"/>
      </linearGradient>
    </defs>
    <!-- Outer Background -->
    <rect width="1200" height="800" fill="url(#bg)"/>
    <!-- Outer Border Frame -->
    <rect x="25" y="25" width="1150" height="750" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
    <rect x="40" y="40" width="1120" height="720" rx="12" fill="none" stroke="${themeColor}" stroke-opacity="0.2" stroke-width="2"/>

    <!-- Decorative Top Badge -->
    <path d="M 520 25 Q 600 75 680 25 Z" fill="url(#borderGrad)"/>

    <!-- Watermark Logo Placeholder -->
    <circle cx="600" cy="400" r="190" fill="${themeColor}" fill-opacity="0.03"/>

    <!-- Certificate Headers -->
    <text x="600" y="115" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="22" font-weight="bold" letter-spacing="4" fill="${themeColor}">
      STUDENT INDUSTRY ENGAGEMENT COMMUNITY
    </text>
    <text x="600" y="170" text-anchor="middle" font-family="'Playfair Display', 'Times New Roman', serif" font-size="44" font-weight="bold" fill="#0f172a">
      CERTIFICATE OF ACHIEVEMENT
    </text>
    <text x="600" y="212" text-anchor="middle" font-family="'Inter', Arial, sans-serif" font-size="14" font-weight="500" letter-spacing="3" fill="#64748b">
      THIS IS PROUDLY PRESENTED TO
    </text>

    <!-- Bottom Decorative Seal & Signature Lines -->
    <circle cx="220" cy="650" r="48" fill="none" stroke="url(#borderGrad)" stroke-width="4"/>
    <circle cx="220" cy="650" r="40" fill="${accentColor}" fill-opacity="0.12"/>
    <text x="220" y="655" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" letter-spacing="1" fill="${themeColor}">SIEC SEAL</text>

    <!-- Signature Line Left -->
    <line x1="420" y1="670" x2="620" y2="670" stroke="#cbd5e1" stroke-width="2"/>
    <text x="520" y="695" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#475569">Program Director</text>

    <!-- Signature Line Right -->
    <line x1="720" y1="670" x2="920" y2="670" stroke="#cbd5e1" stroke-width="2"/>
    <text x="820" y="695" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#475569">Faculty Coordinator</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "preset-gold",
    name: "Classic Gold Achievement",
    category: "Universal",
    dataUrl: createSvgDataUrl("Classic Gold", "#d97706", "#f59e0b"),
  },
  {
    id: "preset-ocean",
    name: "SIEC Modern Ocean",
    category: "Workshop / Seminar",
    dataUrl: createSvgDataUrl("Modern Ocean", "#2563eb", "#06b6d4"),
  },
  {
    id: "preset-emerald",
    name: "Emerald Excellence",
    category: "Hackathon / Competition",
    dataUrl: createSvgDataUrl("Emerald Excellence", "#059669", "#10b981"),
  },
];
