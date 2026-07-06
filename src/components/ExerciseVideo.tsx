import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Shows a high-quality YouTube thumbnail as the exercise illustration.
 * Clicking loads the actual iframe with autoplay so users see nice
 * static imagery in lists (no empty black rectangles) and only load
 * the heavy embed when they explicitly want to watch.
 */
export function ExerciseVideo({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  if (!youtubeId) return null;

  if (playing) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-black"
      aria-label={`Voir la démonstration : ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid size-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-brand transition group-hover:scale-110">
          <Play className="size-6 translate-x-0.5" fill="currentColor" />
        </div>
      </div>
      <p className="absolute bottom-2 left-3 right-3 truncate text-left text-xs font-semibold text-white/90">
        {title}
      </p>
    </button>
  );
}
