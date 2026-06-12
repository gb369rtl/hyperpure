export function LogoMark({ size = 36, className = '', square = '#0a9150', stem = '#ffffff', leaf = '#dcf56f' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill={square} />
      {/* leaves sprouting from the top */}
      <path d="M15.4 15.8C18.2 7.6 26 5.6 30.4 7.8C29.4 15.4 22.2 17.6 15.4 15.8Z" fill={leaf} />
      <path d="M15.2 16.6C12.4 11.4 7.4 11.2 5 13.2C6.8 18 12 18.4 15.2 16.6Z" fill={leaf} opacity="0.85" />
      {/* "s" letterform */}
      <path
        d="M24.5 14.5C24.5 14.5 22 12.5 19 12.5C15.5 12.5 13.5 14.2 13.5 16.5C13.5 18.8 15.5 19.8 19.5 20.5C23.5 21.2 26 22.5 26 25C26 27.5 23.5 29.5 19.5 29.5C16 29.5 13 27.5 13 27.5"
        stroke={stem}
        strokeWidth="3.8"
        strokeLinecap="round"
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
          samagra
        </span>
      )}
    </span>
  );
}
