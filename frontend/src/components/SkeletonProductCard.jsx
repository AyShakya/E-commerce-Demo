// components/SkeletonProductCard.jsx
export default function SkeletonProductCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#1c1c1c] h-72 rounded-lg" />
      <div className="mt-4 h-4 bg-[#2a2a2a] w-3/4 rounded" />
      <div className="mt-2 h-4 bg-[#2a2a2a] w-1/4 rounded" />
    </div>
  );
}
