// Infinite horizontal marquee. Duplicates children so the loop is seamless.
export default function Marquee({ children, className = '', reverse = false }) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className="flex shrink-0 items-center gap-10 pr-10 animate-marquee group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-10 pr-10 animate-marquee group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
