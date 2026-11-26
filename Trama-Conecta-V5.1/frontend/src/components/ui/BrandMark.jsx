export default function BrandMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#FAAA02" />
      <path d="M14 22h36M14 32h36M14 42h36" stroke="#101421" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 14v36M40 14v36" stroke="#DD6A0C" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
