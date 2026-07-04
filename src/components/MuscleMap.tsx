// Simple anatomical map: front + back silhouettes with highlighted muscle groups.

type MuscleKey =
  | "pectoraux"
  | "haut des pectoraux"
  | "épaules"
  | "arrière épaules"
  | "biceps"
  | "triceps"
  | "avant-bras"
  | "abdominaux"
  | "core"
  | "obliques"
  | "dos"
  | "trapèzes"
  | "lombaires"
  | "fessiers"
  | "quadriceps"
  | "ischio-jambiers"
  | "mollets";

const MATCH: Record<string, MuscleKey[]> = {
  pectoraux: ["pectoraux"],
  "haut des pectoraux": ["haut des pectoraux", "pectoraux"],
  épaules: ["épaules"],
  "arrière épaules": ["arrière épaules", "épaules"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  "avant-bras": ["avant-bras"],
  abdominaux: ["abdominaux", "core"],
  core: ["core", "abdominaux"],
  obliques: ["obliques", "core"],
  dos: ["dos", "trapèzes"],
  trapèzes: ["trapèzes", "dos"],
  lombaires: ["lombaires", "dos"],
  fessiers: ["fessiers"],
  quadriceps: ["quadriceps"],
  "ischio-jambiers": ["ischio-jambiers"],
  mollets: ["mollets"],
};

function activeSet(muscles: string[]): Set<MuscleKey> {
  const s = new Set<MuscleKey>();
  for (const m of muscles) {
    const keys = MATCH[m.toLowerCase()] ?? [];
    keys.forEach((k) => s.add(k));
  }
  return s;
}

const ON = "hsl(var(--brand, 20 90% 55%))";
const OFF = "#3a3a42";
const OUTLINE = "#5a5a66";

function color(active: Set<MuscleKey>, key: MuscleKey) {
  return active.has(key) ? "var(--brand-color, #ea6d3a)" : OFF;
}

export function MuscleMap({ muscles }: { muscles: string[] }) {
  const a = activeSet(muscles);
  const style = { ["--brand-color" as any]: ON } as React.CSSProperties;
  return (
    <div className="flex items-center justify-center gap-3" style={style}>
      <FrontView active={a} />
      <BackView active={a} />
    </div>
  );
}

function FrontView({ active }: { active: Set<MuscleKey> }) {
  return (
    <svg viewBox="0 0 120 220" className="h-56 w-auto" aria-label="Vue de face">
      {/* body outline */}
      <g fill="#22222a" stroke={OUTLINE} strokeWidth="1.2">
        <circle cx="60" cy="18" r="12" />
        <path d="M40 32 h40 v14 l14 6 v40 l-10 4 v50 l-6 40 h-14 l-4 -38 h-8 l-4 38 h-14 l-6 -40 v-50 l-10 -4 v-40 l14 -6 z" />
      </g>
      {/* épaules */}
      <ellipse cx="40" cy="46" rx="8" ry="6" fill={color(active, "épaules")} />
      <ellipse cx="80" cy="46" rx="8" ry="6" fill={color(active, "épaules")} />
      {/* pecs */}
      <path d="M45 50 Q60 62 60 74 Q60 62 45 66 z" fill={color(active, "pectoraux")} />
      <path d="M75 50 Q60 62 60 74 Q60 62 75 66 z" fill={color(active, "pectoraux")} />
      {/* haut pecs */}
      <path d="M46 50 h28 v4 h-28 z" fill={color(active, "haut des pectoraux")} opacity="0.85" />
      {/* biceps */}
      <ellipse cx="30" cy="70" rx="5" ry="10" fill={color(active, "biceps")} />
      <ellipse cx="90" cy="70" rx="5" ry="10" fill={color(active, "biceps")} />
      {/* avant-bras */}
      <ellipse cx="26" cy="92" rx="4" ry="10" fill={color(active, "avant-bras")} />
      <ellipse cx="94" cy="92" rx="4" ry="10" fill={color(active, "avant-bras")} />
      {/* abs */}
      <rect x="52" y="78" width="16" height="34" rx="3" fill={color(active, "abdominaux")} />
      {/* obliques */}
      <path d="M46 82 l4 20 l-4 4 z" fill={color(active, "obliques")} />
      <path d="M74 82 l-4 20 l4 4 z" fill={color(active, "obliques")} />
      {/* quads */}
      <ellipse cx="52" cy="150" rx="7" ry="20" fill={color(active, "quadriceps")} />
      <ellipse cx="68" cy="150" rx="7" ry="20" fill={color(active, "quadriceps")} />
    </svg>
  );
}

function BackView({ active }: { active: Set<MuscleKey> }) {
  return (
    <svg viewBox="0 0 120 220" className="h-56 w-auto" aria-label="Vue de dos">
      <g fill="#22222a" stroke={OUTLINE} strokeWidth="1.2">
        <circle cx="60" cy="18" r="12" />
        <path d="M40 32 h40 v14 l14 6 v40 l-10 4 v50 l-6 40 h-14 l-4 -38 h-8 l-4 38 h-14 l-6 -40 v-50 l-10 -4 v-40 l14 -6 z" />
      </g>
      {/* trapèzes */}
      <path d="M48 34 Q60 44 72 34 L70 48 L50 48 z" fill={color(active, "trapèzes")} />
      {/* arrière épaules */}
      <ellipse cx="40" cy="48" rx="7" ry="5" fill={color(active, "arrière épaules")} />
      <ellipse cx="80" cy="48" rx="7" ry="5" fill={color(active, "arrière épaules")} />
      {/* dos (lats) */}
      <path d="M46 52 L74 52 L78 90 L60 96 L42 90 z" fill={color(active, "dos")} />
      {/* triceps */}
      <ellipse cx="30" cy="70" rx="5" ry="10" fill={color(active, "triceps")} />
      <ellipse cx="90" cy="70" rx="5" ry="10" fill={color(active, "triceps")} />
      {/* lombaires */}
      <rect x="52" y="94" width="16" height="18" rx="3" fill={color(active, "lombaires")} />
      {/* fessiers */}
      <ellipse cx="52" cy="122" rx="10" ry="10" fill={color(active, "fessiers")} />
      <ellipse cx="68" cy="122" rx="10" ry="10" fill={color(active, "fessiers")} />
      {/* ischios */}
      <ellipse cx="52" cy="150" rx="7" ry="18" fill={color(active, "ischio-jambiers")} />
      <ellipse cx="68" cy="150" rx="7" ry="18" fill={color(active, "ischio-jambiers")} />
      {/* mollets */}
      <ellipse cx="52" cy="185" rx="5" ry="12" fill={color(active, "mollets")} />
      <ellipse cx="68" cy="185" rx="5" ry="12" fill={color(active, "mollets")} />
    </svg>
  );
}
