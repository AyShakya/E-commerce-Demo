import { useMemo, useState } from "react";

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildPlaceholder(title = "Utaran Archive", category = "Signature Piece") {
  const safeTitle = title.trim() || "Utaran Archive";
  const safeCategory = category.trim() || "Signature Piece";
  const initials = safeTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${escapeXml(safeTitle)} placeholder">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f0f10" />
          <stop offset="55%" stop-color="#1b1b1d" />
          <stop offset="100%" stop-color="#050505" />
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.18" />
        </linearGradient>
        <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <rect width="800" height="1000" fill="url(#grid)" />
      <circle cx="650" cy="160" r="150" fill="#ffffff" fill-opacity="0.05" />
      <circle cx="150" cy="820" r="210" fill="#ffffff" fill-opacity="0.04" />
      <path d="M0 740 C220 650, 420 690, 800 560 L800 1000 L0 1000 Z" fill="#000000" fill-opacity="0.18" />
      <rect x="92" y="108" width="616" height="784" rx="42" fill="none" stroke="url(#shine)" stroke-width="2" />
      <rect x="120" y="150" width="560" height="650" rx="34" fill="#ffffff" fill-opacity="0.025" stroke="#ffffff" stroke-opacity="0.06" />
      <text x="50%" y="42%" text-anchor="middle" fill="#ffffff" fill-opacity="0.9" font-family="Inter, Arial, sans-serif" font-size="120" font-weight="700" letter-spacing="12">${escapeXml(initials)}</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#ffffff" fill-opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="30" letter-spacing="6">${escapeXml(safeTitle)}</text>
      <text x="50%" y="63.5%" text-anchor="middle" fill="#ffffff" fill-opacity="0.42" font-family="Inter, Arial, sans-serif" font-size="18" letter-spacing="8" text-transform="uppercase">${escapeXml(safeCategory)}</text>
      <text x="50%" y="84%" text-anchor="middle" fill="#ffffff" fill-opacity="0.24" font-family="Inter, Arial, sans-serif" font-size="15" letter-spacing="10" text-transform="uppercase">Utaran Archive</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ProductImage({
  src,
  title = "Product",
  category = "Signature Piece",
  className = "",
  alt,
  ...props
}) {
  const fallbackSrc = useMemo(() => buildPlaceholder(title, category), [title, category]);
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = !src || hasError ? fallbackSrc : src;

  return (
    <img
      key={src || fallbackSrc}
      src={resolvedSrc}
      alt={alt || title || "Product image"}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}