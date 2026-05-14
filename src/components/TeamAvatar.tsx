import type { Team } from "../types/tournament";

const sizeClass = {
  sm: "h-8 w-8 min-h-8 min-w-8 text-xs",
  md: "h-10 w-10 min-h-10 min-w-10 text-sm",
  lg: "h-12 w-12 min-h-12 min-w-12 text-base",
  xl: "h-16 w-16 min-h-16 min-w-16 text-xl",
} as const;

export function TeamAvatar({
  team,
  size = "md",
  className = "",
}: {
  team: Team;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const box = `shrink-0 overflow-hidden rounded-md border border-line bg-canvas-raised ${sizeClass[size]} ${className}`;

  if (team.logoDataUrl) {
    return (
      <img
        src={team.logoDataUrl}
        alt=""
        className={`${box} object-cover`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div
      className={`${box} flex items-center justify-center font-semibold tabular-nums text-slate-400`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
