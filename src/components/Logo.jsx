// Hyperpure-style brand logo: a rounded-square mark with a lowercase "h"
// that sprouts two leaves (a seedling), plus the lowercase "hyperpure" wordmark.
// Adapted to the site's green palette (the original Zomato mark is red).

export function LogoMark({ size = 36, className = '', square = '#0a9150', stem = '#ffffff', leaf = '#dcf56f' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill={square} />
      {/* leaves sprouting from the top of the stem */}
      <path d="M15.4 15.8C18.2 7.6 26 5.6 30.4 7.8C29.4 15.4 22.2 17.6 15.4 15.8Z" fill={leaf} />
      <path d="M15.2 16.6C12.4 11.4 7.4 11.2 5 13.2C6.8 18 12 18.4 15.2 16.6Z" fill={leaf} opacity="0.85" />
      {/* the "h" */}
      <path
        d="M14.6 12.5V29.5"
        stroke={stem}
        strokeWidth="4.1"
        strokeLinecap="round"
      />
      <path
        d="M14.6 23C14.6 19.4 17.1 17.6 20.1 17.6C23.2 17.6 25.6 19.7 25.6 22.8V29.5"
        stroke={stem}
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({ markSize = 36, className = '', textClass = '', wordmark = true }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      {wordmark && (
        <span className={`font-sans text-[1.6rem] font-extrabold lowercase leading-none tracking-tight ${textClass}`}>
          hyperpure
        </span>
      )}
    </span>
  );
}
