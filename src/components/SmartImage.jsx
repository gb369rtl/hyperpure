import { useState } from 'react';

// Renders an image with a graceful fallback chain:
// primary src -> LoremFlickr keyword photo -> inline gradient SVG.
// Guarantees something visual always shows even if a remote image 404s.

const placeholder = (label = '') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#d1fadf'/><stop offset='1' stop-color='#0a9150'/>
       </linearGradient></defs>
       <rect width='600' height='600' fill='url(#g)'/>
       <text x='50%' y='52%' font-family='sans-serif' font-size='34' fill='#084c2e'
         text-anchor='middle'>${label}</text>
     </svg>`,
  )}`;

export default function SmartImage({ src, keyword, alt = '', className = '', ...rest }) {
  const [stage, setStage] = useState(0);
  const fallback1 = keyword
    ? `https://loremflickr.com/600/600/${encodeURIComponent(keyword)}`
    : null;

  const current = stage === 0 ? src : stage === 1 && fallback1 ? fallback1 : placeholder(alt);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setStage((s) => (s < 2 ? s + 1 : s))}
      className={className}
      {...rest}
    />
  );
}
